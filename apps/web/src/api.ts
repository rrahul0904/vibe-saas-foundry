import type { AuthResponse, TaskDto } from "@foundry/contracts";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";
export const token = () => localStorage.getItem("foundry_session");

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json", ...((init.headers || {}) as Record<string, string>) };
  if (token()) headers.Authorization = `Bearer ${token()}`;
  const res = await fetch(`${API}${path}`, { ...init, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(Array.isArray(body.message) ? body.message.join(", ") : body.message || "Request failed");
  }
  return res.json();
}

export const api = {
  register: (email: string, password: string) => request<any>("/auth/register", { method: "POST", body: JSON.stringify({ email, password }) }),
  resendVerification: (email: string) => request<any>("/auth/resend-verification", { method: "POST", body: JSON.stringify({ email }) }),
  verify: (value: string) => request<any>("/auth/verify-email", { method: "POST", body: JSON.stringify({ token: value }) }),
  login: (email: string, password: string) => request<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  requestPasswordReset: (email: string) => request<any>("/auth/request-password-reset", { method: "POST", body: JSON.stringify({ email }) }),
  resetPassword: (resetToken: string, password: string) => request<any>("/auth/reset-password", { method: "POST", body: JSON.stringify({ token: resetToken, password }) }),
  logout: () => request<any>("/auth/logout", { method: "POST" }),
  logoutAll: () => request<any>("/auth/logout-all", { method: "POST" }),
  deleteAccount: () => request<any>("/users/me", { method: "DELETE" }),
  tasks: (query: string) => request<TaskDto[]>(`/tasks${query}`),
  createTask: (body: any) => request<TaskDto>("/tasks", { method: "POST", body: JSON.stringify(body) }),
  updateTask: (id: string, body: any) => request<TaskDto>(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  deleteTask: (id: string) => request<any>(`/tasks/${id}`, { method: "DELETE" }),
};
