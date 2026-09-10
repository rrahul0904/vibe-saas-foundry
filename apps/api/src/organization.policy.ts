import { MembershipRole } from "./entities";

export const canManageMembers = (role: MembershipRole) => role === MembershipRole.OWNER || role === MembershipRole.ADMIN;
export const canChangeRoles = (role: MembershipRole) => role === MembershipRole.OWNER;
export const canDeleteOrganization = (role: MembershipRole) => role === MembershipRole.OWNER;
