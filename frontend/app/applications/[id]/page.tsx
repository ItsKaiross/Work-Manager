"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/app/components/layout/Sidebar";
import { JobApplication } from "@/types/job_application";
import { useSessionMonitor } from "@/hooks/useSessionMonitor";
import { getAuthToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const STATUS_OPTIONS = ["saved", "applied", "interviewing", "offer", "rejected", "withdrawn"];
const CURRENCY_OPTIONS = ["USD", "EUR", "GBP", "JPY", "CNY", "INR", "AUD", "CAD", "SGD", "PHP", "MYR", "THB", "VND", "IDR"];

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

  async function handleCurrencyChange(newCurrency: string) {
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
        body: JSON.stringify({ ...app, currency: newCurrency }),
      });

      if (!res.ok) throw new Error("Failed to update currency");
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
      <main className="flex-1 p-8">
        {loading && <p className="text-gray-500">Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {app && (
          <>
            <h1 className="text-2xl font-bold mb-2">{app.position}</h1>
            <p className="text-gray-500 mb-6">
              {app.company}
              {app.location ? ` · ${app.location}` : ""}
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Job Details */}
              <div className="space-y-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold mb-4">Job Details</h2>
                  
                  <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={app.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={saving}
                    className="border rounded-lg px-3 py-2 text-sm w-full max-w-xs"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  {saving && <span className="ml-2 text-xs text-gray-400">Saving...</span>}
                </div>

                {app.source && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Source:</span>
                    <p className="text-gray-900 mt-1">{app.source}</p>
                  </div>
                )}

                {app.location && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Location:</span>
                    <p className="text-gray-900 mt-1">{app.location}</p>
                  </div>
                )}

                {app.salary_range && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Salary Range:</span>
                    <p className="text-gray-900 mt-1">{app.salary_range}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency
                  </label>
                  <select
                    value={app.currency || "USD"}
                    onChange={(e) => handleCurrencyChange(e.target.value)}
                    disabled={saving}
                    className="border rounded-lg px-3 py-2 text-sm w-full max-w-xs"
                  >
                    {CURRENCY_OPTIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {app.applied_date && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Applied Date:</span>
                    <p className="text-gray-900 mt-1">
                      {new Date(app.applied_date).toLocaleDateString("en-US", { 
                        month: "long", 
                        day: "numeric", 
                        year: "numeric" 
                      })}
                    </p>
                  </div>
                )}

                {app.job_url && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Job Posting:</span>
                    <p className="mt-1">
                      <a 
                        href={app.job_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline break-all"
                      >
                        View original posting →
                      </a>
                    </p>
                  </div>
                )}

                <div>
                  <span className="text-sm font-medium text-gray-700">Added:</span>
                  <p className="text-gray-900 mt-1">
                    {new Date(app.created_at).toLocaleDateString("en-US", { 
                      month: "long", 
                      day: "numeric", 
                      year: "numeric",
                      hour: "numeric",
                      minute: "numeric"
                    })}
                  </p>
                </div>

                {app.updated_at && app.updated_at !== app.created_at && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Last Updated:</span>
                    <p className="text-gray-900 mt-1">
                      {new Date(app.updated_at).toLocaleDateString("en-US", { 
                        month: "long", 
                        day: "numeric", 
                        year: "numeric",
                        hour: "numeric",
                        minute: "numeric"
                      })}
                    </p>
                  </div>
                )}
                  </div>
                </div>

                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
                >
                  Delete Application
                </button>
              </div>

              {/* Right Column - Job Description & Notes */}
              <div className="space-y-6">
                {app.description && (
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold mb-3">Job Description</h2>
                    <div className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                      {app.description}
                    </div>
                  </div>
                )}

                {app.notes && (
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold mb-3">Notes</h2>
                    <div className="text-gray-700 whitespace-pre-wrap text-sm">
                      {app.notes}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}