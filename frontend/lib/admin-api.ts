import { getAuthToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001" || "http://localhost:8000";

function authHeader(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface User {
  id: number;
  email: string;
  auth_provider: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
}

export interface DashboardStats {
  total_users: number;
  active_users: number;
  admin_users: number;
  total_applications: number;
}

export interface CreateUserData {
  email: string;
  password: string;
  is_admin: boolean;
}

export interface UpdateUserData {
  is_active?: boolean;
  is_admin?: boolean;
}

export async function getAllUsers(): Promise<User[]> {
  const res = await fetch(`${API_URL}/admin/users`, {
    headers: { ...authHeader() },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Failed to fetch users" }));
    throw new Error(err.detail || "Failed to fetch users");
  }
  return res.json();
}

export async function getUser(userId: number): Promise<User> {
  const res = await fetch(`${API_URL}/admin/users/${userId}`, {
    headers: { ...authHeader() },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Failed to fetch user" }));
    throw new Error(err.detail || "Failed to fetch user");
  }
  return res.json();
}

export async function createUser(data: CreateUserData): Promise<User> {
  const res = await fetch(`${API_URL}/admin/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Failed to create user" }));
    throw new Error(err.detail || "Failed to create user");
  }
  return res.json();
}

export async function updateUser(userId: number, data: UpdateUserData): Promise<User> {
  const res = await fetch(`${API_URL}/admin/users/${userId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Failed to update user" }));
    throw new Error(err.detail || "Failed to update user");
  }
  return res.json();
}

export async function deleteUser(userId: number): Promise<void> {
  const res = await fetch(`${API_URL}/admin/users/${userId}`, {
    method: "DELETE",
    headers: { ...authHeader() },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Failed to delete user" }));
    throw new Error(err.detail || "Failed to delete user");
  }
}

export interface UserResume {
  id: number;
  user_id: number;
  filename: string;
  file_size: number;
  upload_date: string;
  skills?: string[];
  experience_years?: number;
  education_level?: string;
  is_active: boolean;
}

export async function getUserResume(userId: number): Promise<UserResume> {
  const res = await fetch(`${API_URL}/admin/users/${userId}/resume`, {
    headers: { ...authHeader() },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Failed to fetch resume" }));
    throw new Error(err.detail || "Failed to fetch resume");
  }
  return res.json();
}

export async function downloadResumeFile(resumeId: number, filename: string): Promise<void> {
  const res = await fetch(`${API_URL}/admin/resumes/${resumeId}/download`, {
    headers: { ...authHeader() },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Failed to download resume file" }));
    throw new Error(err.detail || "Failed to download resume file");
  }
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export interface AiSettings {
  groq_api_key_set: boolean;
  groq_api_key_preview: string | null;
}

export async function getAiSettings(): Promise<AiSettings> {
  const res = await fetch(`${API_URL}/admin/settings`, {
    headers: { ...authHeader() },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Failed to fetch AI settings" }));
    throw new Error(err.detail || "Failed to fetch AI settings");
  }
  return res.json();
}

export async function updateGroqApiKey(apiKey: string): Promise<void> {
  const res = await fetch(`${API_URL}/admin/settings/groq-api-key`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
    },
    body: JSON.stringify({ groq_api_key: apiKey }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Failed to update Groq API key" }));
    throw new Error(err.detail || "Failed to update Groq API key");
  }
}

export async function clearGroqApiKey(): Promise<void> {
  const res = await fetch(`${API_URL}/admin/settings/groq-api-key`, {
    method: "DELETE",
    headers: { ...authHeader() },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Failed to clear Groq API key" }));
    throw new Error(err.detail || "Failed to clear Groq API key");
  }
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const res = await fetch(`${API_URL}/admin/stats`, {
    headers: { ...authHeader() },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Failed to fetch stats" }));
    throw new Error(err.detail || "Failed to fetch stats");
  }
  return res.json();
}

export interface SystemHealth {
  backend: "ok" | "error";
  database: "ok" | "error";
  ai_active: boolean;
}

export async function getSystemHealth(): Promise<SystemHealth> {
  const res = await fetch(`${API_URL}/admin/health`, {
    headers: { ...authHeader() },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Failed to fetch system health" }));
    throw new Error(err.detail || "Failed to fetch system health");
  }
  return res.json();
}
