import { JobApplication } from "@/types/job_application";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function authHeader() {
    const token = localStorage.getItem("access_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function login(email: string, password: string) {
    const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Login failed");
    }
    return res.json();
}

export async function signup(email: string, password: string) {
    const res = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Signup failed");
    }
    return res.json();
}

export async function getApplications(): Promise<JobApplication[]> {
    const res = await fetch(`${API_URL}/applications`, {
        headers: { ...authHeader() },
    });
    if (!res.ok) throw new Error("Failed to fetch applications");
    return res.json();
}