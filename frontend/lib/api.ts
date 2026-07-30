import { JobApplication } from "@/types/job_application";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function authHeader(): Record<string, string> {
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

export async function extractJobDetails(url: string) {
    const res = await fetch(`${API_URL}/applications/extract`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...authHeader(),
        },
        body: JSON.stringify({ url }),
    });
    if (!res.ok) throw new Error("Failed to extract job details");
    return res.json();
}

export async function createApplication(data: any) {
    const res = await fetch(`${API_URL}/applications`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...authHeader(),
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create application");
    return res.json();
}

