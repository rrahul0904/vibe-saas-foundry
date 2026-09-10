import "reflect-metadata";
import { MembershipRole } from "./entities";
import { canChangeRoles, canDeleteOrganization, canManageMembers } from "./organization.policy";

describe("organization policy",()=>{
  it("allows owners and admins to manage members",()=>{expect(canManageMembers(MembershipRole.OWNER)).toBe(true);expect(canManageMembers(MembershipRole.ADMIN)).toBe(true);expect(canManageMembers(MembershipRole.MEMBER)).toBe(false)});
  it("reserves role and organization control for owners",()=>{expect(canChangeRoles(MembershipRole.OWNER)).toBe(true);expect(canChangeRoles(MembershipRole.ADMIN)).toBe(false);expect(canDeleteOrganization(MembershipRole.OWNER)).toBe(true);expect(canDeleteOrganization(MembershipRole.MEMBER)).toBe(false)});
});
