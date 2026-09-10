export type TaskStatus = "pending" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";
export type UserRole = "member" | "operator";
export type MembershipRole = "owner" | "admin" | "member";

export interface UserSummary { id:string; email:string; role:UserRole; emailVerifiedAt:string|null; createdAt:string; }
export interface OrganizationSummary { id:string; name:string; slug:string; role:MembershipRole; planCode:string; maxMembers:number; }
export interface OrganizationMember { id:string; userId:string; email:string; role:MembershipRole; createdAt:string; }
export interface OrganizationEntitlement { id:string; organizationId:string; planCode:string; maxMembers:number; features:Record<string,boolean>; createdAt:string; updatedAt:string; }
export interface OrganizationInvitation { id:string; email:string; role:MembershipRole; expiresAt:string; createdAt?:string; invitationToken?:string; }
export interface TaskDto { id:string; title:string; description:string|null; status:TaskStatus; priority:TaskPriority; dueDate:string|null; createdAt:string; updatedAt:string; }
export interface AuthResponse { sessionToken:string; user:UserSummary; }
