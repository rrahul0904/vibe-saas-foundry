import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Repository } from "typeorm";
import { AuditService } from "./audit.service";
import { EmailService } from "./email.service";
import { Membership, MembershipRole, Organization, OrganizationEntitlement, OrganizationInvitation, User } from "./entities";
import { canChangeRoles, canDeleteOrganization, canManageMembers } from "./organization.policy";
import { hashToken, newOpaqueToken, normalizeEmail } from "./security";

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization) private readonly organizations: Repository<Organization>,
    @InjectRepository(Membership) private readonly memberships: Repository<Membership>,
    @InjectRepository(OrganizationInvitation) private readonly invitations: Repository<OrganizationInvitation>,
    @InjectRepository(OrganizationEntitlement) private readonly entitlements: Repository<OrganizationEntitlement>,
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly email: EmailService,
    private readonly audit: AuditService,
  ) {}

  async ensurePersonalWorkspace(user: User) {
    const existing = await this.memberships.findOneBy({ userId: user.id });
    if (existing) return existing.organizationId;
    const organization = await this.organizations.save(this.organizations.create({ id:user.id, name:`${user.email.split("@")[0]}'s Workspace`, slug:`personal-${user.id.replace(/-/g, "")}` }));
    await this.memberships.save(this.memberships.create({ organizationId:organization.id, userId:user.id, role:MembershipRole.OWNER }));
    await this.entitlements.save(this.entitlements.create({ organizationId:organization.id, planCode:"free", maxMembers:3, features:{ audit:false, apiKeys:false } }));
    await this.audit.record("organization.personal_created", user.id, { organizationId:organization.id });
    return organization.id;
  }

  async listForUser(user: User) {
    if (!(await this.memberships.countBy({ userId:user.id }))) await this.ensurePersonalWorkspace(user);
    const memberships = await this.memberships.find({ where:{ userId:user.id }, order:{ createdAt:"ASC" } });
    return Promise.all(memberships.map(async membership => {
      const [organization, entitlement] = await Promise.all([this.organizations.findOneByOrFail({ id:membership.organizationId }), this.entitlements.findOneBy({ organizationId:membership.organizationId })]);
      return { id:organization.id, name:organization.name, slug:organization.slug, role:membership.role, planCode:entitlement?.planCode || "free", maxMembers:entitlement?.maxMembers || 3 };
    }));
  }

  async create(user: User, name: string) {
    const suffix = newOpaqueToken(4).replace(/[^a-zA-Z0-9]/g, "").toLowerCase() || Date.now().toString(36);
    const organization = await this.organizations.save(this.organizations.create({ name:name.trim(), slug:`${this.slugify(name)}-${suffix}` }));
    await Promise.all([
      this.memberships.save(this.memberships.create({ organizationId:organization.id, userId:user.id, role:MembershipRole.OWNER })),
      this.entitlements.save(this.entitlements.create({ organizationId:organization.id, planCode:"free", maxMembers:3, features:{ audit:false, apiKeys:false } })),
    ]);
    await this.audit.record("organization.created", user.id, { organizationId:organization.id });
    return { id:organization.id, name:organization.name, slug:organization.slug, role:MembershipRole.OWNER, planCode:"free", maxMembers:3 };
  }

  async getMembers(userId:string, organizationId:string) {
    await this.assertMembership(userId,organizationId);
    const memberships = await this.memberships.find({ where:{ organizationId }, relations:{ user:true }, order:{ createdAt:"ASC" } });
    return memberships.map(m => ({ id:m.id, userId:m.userId, email:m.user.email, role:m.role, createdAt:m.createdAt }));
  }

  async getEntitlements(userId:string, organizationId:string) { await this.assertMembership(userId,organizationId); return this.entitlements.findOneByOrFail({ organizationId }); }

  async invite(actor:User, organizationId:string, emailRaw:string, role:MembershipRole) {
    const actorMembership=await this.assertMembership(actor.id,organizationId);
    if(!canManageMembers(actorMembership.role)) throw new ForbiddenException("Member management requires owner or admin role");
    if(role===MembershipRole.OWNER) throw new BadRequestException("Invite as admin or member; ownership is granted by an owner after joining");
    const email=normalizeEmail(emailRaw),existingUser=await this.users.findOneBy({email});
    if(existingUser&&await this.memberships.findOneBy({organizationId,userId:existingUser.id})) throw new BadRequestException("User is already a member");
    const pending=await this.invitations.findOne({where:{organizationId,email,acceptedAt:IsNull()}});
    if(pending&&pending.expiresAt>new Date()) throw new BadRequestException("An active invitation already exists for this email");
    const token=newOpaqueToken();
    const invitation=await this.invitations.save(this.invitations.create({organizationId,email,role,tokenHash:hashToken(token),invitedByUserId:actor.id,expiresAt:new Date(Date.now()+7*24*3600_000),acceptedAt:null}));
    const organization=await this.organizations.findOneByOrFail({id:organizationId});
    await this.audit.record("organization.invitation_created",actor.id,{organizationId,invitationId:invitation.id,role});
    await this.email.sendInvitation(email,organization.name,token);
    return {id:invitation.id,email,role,expiresAt:invitation.expiresAt,...(process.env.NODE_ENV==="production"?{}:{invitationToken:token})};
  }

  async listInvitations(userId:string, organizationId:string) {
    const membership=await this.assertMembership(userId,organizationId);
    if(!canManageMembers(membership.role)) throw new ForbiddenException("Member management requires owner or admin role");
    const invitations=await this.invitations.find({where:{organizationId,acceptedAt:IsNull()},order:{createdAt:"DESC"}});
    return invitations.map(i=>({id:i.id,email:i.email,role:i.role,expiresAt:i.expiresAt,createdAt:i.createdAt}));
  }

  async revokeInvitation(userId:string,organizationId:string,invitationId:string){const membership=await this.assertMembership(userId,organizationId);if(!canManageMembers(membership.role))throw new ForbiddenException("Member management requires owner or admin role");const invitation=await this.invitations.findOneBy({id:invitationId,organizationId});if(!invitation)throw new NotFoundException("Invitation not found");await this.invitations.delete(invitation.id);await this.audit.record("organization.invitation_revoked",userId,{organizationId,invitationId});return{ok:true}}

  async acceptInvitation(user:User,rawToken:string){const invitation=await this.invitations.findOne({where:{tokenHash:hashToken(rawToken),acceptedAt:IsNull()}});if(!invitation||invitation.expiresAt<=new Date())throw new BadRequestException("Invitation is invalid or expired");if(normalizeEmail(user.email)!==invitation.email)throw new ForbiddenException("Invitation belongs to a different email address");const existing=await this.memberships.findOneBy({organizationId:invitation.organizationId,userId:user.id});if(!existing){await this.assertMemberCapacity(invitation.organizationId);await this.memberships.save(this.memberships.create({organizationId:invitation.organizationId,userId:user.id,role:invitation.role}))}invitation.acceptedAt=new Date();await this.invitations.save(invitation);await this.audit.record("organization.invitation_accepted",user.id,{organizationId:invitation.organizationId,invitationId:invitation.id});return{ok:true,organizationId:invitation.organizationId}}

  async updateMemberRole(actorId:string,organizationId:string,membershipId:string,role:MembershipRole){const actorMembership=await this.assertMembership(actorId,organizationId);if(!canChangeRoles(actorMembership.role))throw new ForbiddenException("Only an owner can change membership roles");const target=await this.memberships.findOneBy({id:membershipId,organizationId});if(!target)throw new NotFoundException("Membership not found");if(target.role===MembershipRole.OWNER&&role!==MembershipRole.OWNER){const ownerCount=await this.memberships.countBy({organizationId,role:MembershipRole.OWNER});if(ownerCount<=1)throw new BadRequestException("An organization must retain at least one owner")}target.role=role;await this.memberships.save(target);await this.audit.record("organization.member_role_changed",actorId,{organizationId,membershipId,role});return{ok:true}}

  async removeMember(actorId:string,organizationId:string,membershipId:string){const actorMembership=await this.assertMembership(actorId,organizationId);if(!canManageMembers(actorMembership.role))throw new ForbiddenException("Member management requires owner or admin role");const target=await this.memberships.findOneBy({id:membershipId,organizationId});if(!target)throw new NotFoundException("Membership not found");if(target.role===MembershipRole.OWNER)throw new BadRequestException("Owners must transfer or demote ownership before removal");if(actorMembership.role===MembershipRole.ADMIN&&target.role===MembershipRole.ADMIN)throw new ForbiddenException("Admins cannot remove other admins");await this.memberships.delete(target.id);await this.audit.record("organization.member_removed",actorId,{organizationId,membershipId});return{ok:true}}

  async deleteOrganization(actorId:string,organizationId:string){const membership=await this.assertMembership(actorId,organizationId);if(!canDeleteOrganization(membership.role))throw new ForbiddenException("Only an owner can delete an organization");await this.organizations.delete(organizationId);await this.audit.record("organization.deleted",actorId,{organizationId});return{ok:true}}

  async assertMembership(userId:string,organizationId:string,allowedRoles?:MembershipRole[]){if(!organizationId)throw new BadRequestException("Organization context is required");const membership=await this.memberships.findOneBy({userId,organizationId});if(!membership)throw new ForbiddenException("You are not a member of this organization");if(allowedRoles&&!allowedRoles.includes(membership.role))throw new ForbiddenException("Insufficient organization role");return membership}
  private async assertMemberCapacity(organizationId:string){const entitlement=await this.entitlements.findOneByOrFail({organizationId}),count=await this.memberships.countBy({organizationId});if(entitlement.maxMembers>0&&count>=entitlement.maxMembers)throw new ForbiddenException(`Plan ${entitlement.planCode} allows ${entitlement.maxMembers} members`)}
  private slugify(value:string){const slug=value.trim().toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,70);return slug||"workspace"}
}
