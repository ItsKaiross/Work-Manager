const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

function authHeader(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("auth_token");
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
