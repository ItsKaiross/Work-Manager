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
  const [suggestions, setSuggestions] = useState<any>(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  
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

  async function loadSuggestions() {
    setLoadingSuggestions(true);
    try {
      const res = await fetch(`${API_URL}/applications/${params.id}/suggestions`, {
        headers: { ...authHeader() },
      });
      
      if (!res.ok) throw new Error("Failed to load suggestions");
      const data = await res.json();
      setSuggestions(data.suggestions);
    } catch (err: any) {
      console.error("Failed to load suggestions:", err);
    } finally {
      setLoadingSuggestions(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        {loading && <p className="text-gray-500 dark:text-gray-400">Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {app && (
          <>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-bold mb-2">{app.position}</h1>
                <p className="text-gray-500 dark:text-gray-400">
                  {app.company}
                  {app.location ? ` · ${app.location}` : ""}
                </p>
              </div>
              
              {/* Match Percentage Display */}
              {app.match_percentage !== null && app.match_percentage !== undefined && (
                <div className={`px-4 py-2 rounded-lg text-sm font-semibold border ${
                  app.match_percentage >= 70 
                    ? "bg-green-100 text-green-800 border-green-300"
                    : app.match_percentage >= 50
                    ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                    : "bg-red-100 text-red-800 border-red-300"
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{Math.round(app.match_percentage)}%</span>
                    <span className="text-xs">Resume Match</span>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Job Details */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h2 className="text-lg font-semibold mb-4">Job Details</h2>
                  
                  <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    value={app.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={saving}
                    className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm w-full max-w-xs"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  {saving && <span className="ml-2 text-xs text-gray-400">Saving...</span>}
                </div>

                {app.source && (
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Source:</span>
                    <p className="text-gray-900 dark:text-white mt-1">{app.source}</p>
                  </div>
                )}

                {app.location && (
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Location:</span>
                    <p className="text-gray-900 dark:text-white mt-1">{app.location}</p>
                  </div>
                )}

                {app.salary_range && (
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Salary Range:</span>
                    <p className="text-gray-900 dark:text-white mt-1">{app.salary_range}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Currency
                  </label>
                  <select
                    value={app.currency || "USD"}
                    onChange={(e) => handleCurrencyChange(e.target.value)}
                    disabled={saving}
                    className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm w-full max-w-xs"
                  >
                    {CURRENCY_OPTIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {app.applied_date && (
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Applied Date:</span>
                    <p className="text-gray-900 dark:text-white mt-1">
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
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Job Posting:</span>
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
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Added:</span>
                  <p className="text-gray-900 dark:text-white mt-1">
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
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Updated:</span>
                    <p className="text-gray-900 dark:text-white mt-1">
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
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold mb-3">Job Description</h2>
                    <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">
                      {app.description}
                    </div>
                  </div>
                )}

                {app.notes && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold mb-3">Notes</h2>
                    <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm">
                      {app.notes}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Preparation Suggestions Section */}
            <div className="mt-8">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Interview Preparation Suggestions</h2>
                  </div>
                  
                  {!suggestions && (
                    <button
                      onClick={loadSuggestions}
                      disabled={loadingSuggestions}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {loadingSuggestions ? (
                        <>
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Generating...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Generate Suggestions
                        </>
                      )}
                    </button>
                  )}
                </div>

                {suggestions ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Technical Preparation */}
                    {suggestions.technical_prep && suggestions.technical_prep.length > 0 && (
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                        <h3 className="font-semibold text-purple-700 mb-3 flex items-center gap-2">
                          <span>🔧</span> Technical Prep
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                          {suggestions.technical_prep.map((item: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-purple-500 mt-1">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Company Research */}
                    {suggestions.company_research && suggestions.company_research.length > 0 && (
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                        <h3 className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
                          <span>🏢</span> Company Research
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                          {suggestions.company_research.map((item: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-blue-500 mt-1">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Behavioral Prep */}
                    {suggestions.behavioral_prep && suggestions.behavioral_prep.length > 0 && (
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                        <h3 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                          <span>💬</span> Behavioral Prep
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                          {suggestions.behavioral_prep.map((item: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-green-500 mt-1">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Skills to Focus */}
                    {suggestions.skills_to_focus && suggestions.skills_to_focus.length > 0 && (
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                        <h3 className="font-semibold text-orange-700 mb-3 flex items-center gap-2">
                          <span>🎯</span> Skills to Focus
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                          {suggestions.skills_to_focus.map((item: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-orange-500 mt-1">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Questions to Ask */}
                    {suggestions.questions_to_ask && suggestions.questions_to_ask.length > 0 && (
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                        <h3 className="font-semibold text-indigo-700 mb-3 flex items-center gap-2">
                          <span>❓</span> Questions to Ask
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                          {suggestions.questions_to_ask.map((item: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-indigo-500 mt-1">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Click "Generate Suggestions" to get personalized interview preparation tips based on the job description and your resume.
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}