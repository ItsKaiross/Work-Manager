import { JobApplication } from "@/types/job_application";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function authHeader() {
    const token = localStorage.getItem("access_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getApplications(): Promise<JobApplication[]> {
    const res = await fetch(`${API_URL}/applications`, {
        headers: { ...authHeader() },
    });
    if (!res.ok) throw new Error("Failed to fetch applications");
    return res.json();
}