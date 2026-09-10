import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from "@nestjs/common";
import { IsEmail, IsEnum, IsString, Length } from "class-validator";
import { AuthenticatedRequest } from "./auth.guard";
import { MembershipRole } from "./entities";
import { OrganizationsService } from "./organizations.service";

class CreateOrganizationDto { @IsString() @Length(2,160) name!: string; }
class InviteDto { @IsEmail() email!: string; @IsEnum(MembershipRole) role!: MembershipRole; }
class UpdateRoleDto { @IsEnum(MembershipRole) role!: MembershipRole; }

@Controller("organizations")
export class OrganizationsController {
  constructor(private readonly organizations: OrganizationsService) {}

  @Get() list(@Req() req: AuthenticatedRequest) { return this.organizations.listForUser(req.user); }
  @Post() create(@Req() req: AuthenticatedRequest, @Body() dto: CreateOrganizationDto) { return this.organizations.create(req.user, dto.name); }
  @Delete(":organizationId") remove(@Req() req: AuthenticatedRequest, @Param("organizationId") organizationId: string) { return this.organizations.deleteOrganization(req.user.id, organizationId); }
  @Get(":organizationId/members") members(@Req() req: AuthenticatedRequest, @Param("organizationId") organizationId: string) { return this.organizations.getMembers(req.user.id, organizationId); }
  @Patch(":organizationId/members/:membershipId") updateRole(@Req() req: AuthenticatedRequest, @Param("organizationId") organizationId: string, @Param("membershipId") membershipId: string, @Body() dto: UpdateRoleDto) { return this.organizations.updateMemberRole(req.user.id, organizationId, membershipId, dto.role); }
  @Delete(":organizationId/members/:membershipId") removeMember(@Req() req: AuthenticatedRequest, @Param("organizationId") organizationId: string, @Param("membershipId") membershipId: string) { return this.organizations.removeMember(req.user.id, organizationId, membershipId); }
  @Get(":organizationId/entitlements") entitlements(@Req() req: AuthenticatedRequest, @Param("organizationId") organizationId: string) { return this.organizations.getEntitlements(req.user.id, organizationId); }
  @Get(":organizationId/invitations") invitations(@Req() req: AuthenticatedRequest, @Param("organizationId") organizationId: string) { return this.organizations.listInvitations(req.user.id, organizationId); }
  @Post(":organizationId/invitations") invite(@Req() req: AuthenticatedRequest, @Param("organizationId") organizationId: string, @Body() dto: InviteDto) { return this.organizations.invite(req.user, organizationId, dto.email, dto.role); }
  @Delete(":organizationId/invitations/:invitationId") revokeInvitation(@Req() req: AuthenticatedRequest, @Param("organizationId") organizationId: string, @Param("invitationId") invitationId: string) { return this.organizations.revokeInvitation(req.user.id, organizationId, invitationId); }
}

class AcceptInvitationDto { @IsString() token!: string; }

@Controller("invitations")
export class InvitationsController {
  constructor(private readonly organizations: OrganizationsService) {}
  @Post("accept") accept(@Req() req: AuthenticatedRequest, @Body() dto: AcceptInvitationDto) { return this.organizations.acceptInvitation(req.user, dto.token); }
}
