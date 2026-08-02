"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/app/components/layout/Sidebar";
import { JobApplication } from "@/types/job_application";
import { useSessionMonitor } from "@/hooks/useSessionMonitor";
import { getAuthToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const STATUS_OPTIONS = ["saved", "applied", "interviewing", "offer", "rejected", "withdrawn"];

function authHeader(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [app, setApp] = useState<JobApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  
  useSessionMonitor();

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push("/");
      return;
    }

    fetch(`${API_URL}/applications/${params.id}`, {
      headers: { ...authHeader() },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Application not found");
        return res.json();
      })
      .then(setApp)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [params.id, router]);

  async function handleStatusChange(newStatus: string) {
    if (!app) return;
    setSaving(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/applications/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...authHeader(),
        },
        body: JSON.stringify({ ...app, status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");
      const updated = await res.json();
      setApp(updated);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this application?")) return;

    const res = await fetch(`${API_URL}/applications/${params.id}`, {
      method: "DELETE",
      headers: { ...authHeader() },
    });

    if (res.ok) {
      router.push("/applications");
    } else {
      setError("Failed to delete application");
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 max-w-2xl">
        {loading && <p className="text-gray-500">Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {app && (
          <>
            <h1 className="text-2xl font-bold mb-2">{app.position}</h1>
            <p className="text-gray-500 mb-6">
              {app.company}
              {app.location ? ` · ${app.location}` : ""}
            </p>

            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={app.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={saving}
                  className="border rounded-lg px-3 py-2 text-sm"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {saving && <span className="ml-2 text-xs text-gray-400">Saving...</span>}
              </div>

              {app.source && (
                <p><span className="font-medium">Source:</span> {app.source}</p>
              )}
              {app.salary_range && (
                <p><span className="font-medium">Salary:</span> {app.salary_range}</p>
              )}
              {app.job_url && (
                <p>
                  <span className="font-medium">Posting:</span>{" "}
                  <a href={app.job_url} target="_blank" className="text-blue-600 hover:underline">
                    View original
                  </a>
                </p>
              )}
              {app.notes && (
                <p><span className="font-medium">Notes:</span> {app.notes}</p>
              )}
            </div>

            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
            >
              Delete Application
            </button>
          </>
        )}
      </main>
    </div>
  );
}