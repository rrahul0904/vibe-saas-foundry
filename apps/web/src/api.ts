import type { AuthResponse, MembershipRole, OrganizationEntitlement, OrganizationInvitation, OrganizationMember, OrganizationSummary, TaskDto } from "@foundry/contracts";

const API=import.meta.env.VITE_API_URL||"http://localhost:4000";
export const SESSION_KEY="foundry_session";
export const ACTIVE_ORG_KEY="foundry_active_org";
export const token=()=>localStorage.getItem(SESSION_KEY);
export const activeOrganization=()=>localStorage.getItem(ACTIVE_ORG_KEY);

async function request<T>(path:string,init:RequestInit={}):Promise<T>{
  const headers:Record<string,string>={"Content-Type":"application/json",...((init.headers||{}) as Record<string,string>)};
  if(token())headers.Authorization=`Bearer ${token()}`;
  const organizationId=activeOrganization();if(organizationId)headers["x-organization-id"]=organizationId;
  const res=await fetch(`${API}${path}`,{...init,headers});
  if(!res.ok){const body=await res.json().catch(()=>({message:res.statusText}));throw new Error(Array.isArray(body.message)?body.message.join(", "):body.message||"Request failed")}
  return res.json();
}

export const api={
  register:(email:string,password:string)=>request<any>("/auth/register",{method:"POST",body:JSON.stringify({email,password})}),
  resendVerification:(email:string)=>request<any>("/auth/resend-verification",{method:"POST",body:JSON.stringify({email})}),
  verify:(value:string)=>request<any>("/auth/verify-email",{method:"POST",body:JSON.stringify({token:value})}),
  login:(email:string,password:string)=>request<AuthResponse>("/auth/login",{method:"POST",body:JSON.stringify({email,password})}),
  requestPasswordReset:(email:string)=>request<any>("/auth/request-password-reset",{method:"POST",body:JSON.stringify({email})}),
  resetPassword:(resetToken:string,password:string)=>request<any>("/auth/reset-password",{method:"POST",body:JSON.stringify({token:resetToken,password})}),
  logout:()=>request<any>("/auth/logout",{method:"POST"}),logoutAll:()=>request<any>("/auth/logout-all",{method:"POST"}),deleteAccount:()=>request<any>("/users/me",{method:"DELETE"}),
  organizations:()=>request<OrganizationSummary[]>("/organizations"),
  createOrganization:(name:string)=>request<OrganizationSummary>("/organizations",{method:"POST",body:JSON.stringify({name})}),
  deleteOrganization:(id:string)=>request<any>(`/organizations/${id}`,{method:"DELETE"}),
  members:(id:string)=>request<OrganizationMember[]>(`/organizations/${id}/members`),
  updateMemberRole:(orgId:string,membershipId:string,role:MembershipRole)=>request<any>(`/organizations/${orgId}/members/${membershipId}`,{method:"PATCH",body:JSON.stringify({role})}),
  removeMember:(orgId:string,membershipId:string)=>request<any>(`/organizations/${orgId}/members/${membershipId}`,{method:"DELETE"}),
  entitlements:(id:string)=>request<OrganizationEntitlement>(`/organizations/${id}/entitlements`),
  invitations:(id:string)=>request<OrganizationInvitation[]>(`/organizations/${id}/invitations`),
  invite:(orgId:string,email:string,role:MembershipRole)=>request<OrganizationInvitation>(`/organizations/${orgId}/invitations`,{method:"POST",body:JSON.stringify({email,role})}),
  revokeInvitation:(orgId:string,invitationId:string)=>request<any>(`/organizations/${orgId}/invitations/${invitationId}`,{method:"DELETE"}),
  acceptInvitation:(inviteToken:string)=>request<any>("/invitations/accept",{method:"POST",body:JSON.stringify({token:inviteToken})}),
  tasks:(query:string)=>request<TaskDto[]>(`/tasks${query}`),createTask:(body:any)=>request<TaskDto>("/tasks",{method:"POST",body:JSON.stringify(body)}),updateTask:(id:string,body:any)=>request<TaskDto>(`/tasks/${id}`,{method:"PATCH",body:JSON.stringify(body)}),deleteTask:(id:string)=>request<any>(`/tasks/${id}`,{method:"DELETE"}),
};
