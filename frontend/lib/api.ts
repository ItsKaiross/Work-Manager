import { JobApplication } from "@/types/job_application";
import { CoverLetter, CoverLetterSummary, CoverLetterTone } from "@/types/cover_letter";
import { getAuthToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function authHeader(): Record<string, string> {
    const token = getAuthToken();
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

export async function getCurrentUser(): Promise<{ id: number; email: string; is_admin: boolean }> {
    const res = await fetch(`${API_URL}/auth/me`, {
        headers: { ...authHeader() },
    });
    if (!res.ok) throw new Error("Failed to fetch current user");
    return res.json();
}

export async function getAiStatus(): Promise<{ ai_active: boolean }> {
    const res = await fetch(`${API_URL}/ai/status`, {
        headers: { ...authHeader() },
    });
    if (!res.ok) throw new Error("Failed to fetch AI status");
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

export async function getActiveResume(): Promise<{ id: number; filename: string } | null> {
    const res = await fetch(`${API_URL}/api/resumes/active`, {
        headers: { ...authHeader() },
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error("Failed to fetch active resume");
    return res.json();
}

export async function generateCoverLetter(
    appId: number | string,
    data: { tone: CoverLetterTone; emphasis?: string | null; recipient_name?: string | null }
): Promise<CoverLetter> {
    const res = await fetch(`${API_URL}/applications/${appId}/cover-letters`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...authHeader(),
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || "Failed to generate cover letter");
    }
    return res.json();
}

export async function getCoverLetters(appId: number | string): Promise<CoverLetterSummary[]> {
    const res = await fetch(`${API_URL}/applications/${appId}/cover-letters`, {
        headers: { ...authHeader() },
    });
    if (!res.ok) throw new Error("Failed to fetch cover letters");
    return res.json();
}

export async function getCoverLetter(appId: number | string, letterId: number): Promise<CoverLetter> {
    const res = await fetch(`${API_URL}/applications/${appId}/cover-letters/${letterId}`, {
        headers: { ...authHeader() },
    });
    if (!res.ok) throw new Error("Failed to fetch cover letter");
    return res.json();
}

export async function updateCoverLetter(
    appId: number | string,
    letterId: number,
    content: string
): Promise<CoverLetter> {
    const res = await fetch(`${API_URL}/applications/${appId}/cover-letters/${letterId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...authHeader(),
        },
        body: JSON.stringify({ content }),
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || "Failed to save cover letter");
    }
    return res.json();
}

