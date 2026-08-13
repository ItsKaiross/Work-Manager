"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/app/components/layout/Sidebar";
import ApplicationCard from "@/app/applications/ApplicationCard";
import { useApplications } from "@/hooks/useApplication";
import { useSessionMonitor } from "@/hooks/useSessionMonitor";
import { getAuthToken } from "@/lib/auth";
import { getAiStatus } from "@/lib/api";

export default function Homepage() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const { applications, loading, error } = useApplications();
  const [aiActive, setAiActive] = useState<boolean | null>(null);

  useSessionMonitor();

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push("/");
    } else {
      setChecked(true);
    }
  }, [router]);

  useEffect(() => {
    if (!checked) return;
    getAiStatus()
      .then((data) => setAiActive(data.ai_active))
      .catch(() => setAiActive(null));
  }, [checked]);

  if (!checked) return null;

  const recent = applications.slice(0, 3);

  const needsFollowUp = applications
    .filter((a) => a.needs_follow_up)
    .sort((a, b) => (b.days_since_update ?? 0) - (a.days_since_update ?? 0));

  const counts = {
    total: applications.length,
    saved: applications.filter((a) => a.status === "saved").length,
    applied: applications.filter((a) => a.status === "applied").length,
    interviewing: applications.filter((a) => a.status === "interviewing").length,
    offer: applications.filter((a) => a.status === "offer").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
    withdrawn: applications.filter((a) => a.status === "withdrawn").length,
  };

  // Applications submitted (status != saved) — used for response rate
  const submitted = applications.filter((a) => a.status !== "saved").length;
  const responded = counts.interviewing + counts.offer + counts.rejected;
  const responseRate = submitted > 0 ? Math.round((responded / submitted) * 100) : 0;

  // Applications added in the last 7 days
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const thisWeek = applications.filter(
    (a) => new Date(a.created_at) >= oneWeekAgo
  ).length;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            {aiActive !== null && (
              <span
                className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${
                  aiActive
                    ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                }`}
                title={
                  aiActive
                    ? "AI-assisted extraction, resume parsing, and suggestions are active"
                    : "No AI configured - using built-in logic"
                }
              >
                ✨ AI Assist: {aiActive ? "Active" : "Inactive"}
              </span>
            )}
          </div>
          <Link
            href="/applications/new"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm font-medium"
          >
            + Add Application
          </Link>
        </div>

        {loading && <p className="text-gray-500 dark:text-gray-400">Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && (
          <>
            {/* Top-level summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 transition-colors">
                <p className="text-2xl font-bold">{counts.total}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Applications</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 transition-colors">
                <p className="text-2xl font-bold">{thisWeek}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Added This Week</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 transition-colors">
                <p className="text-2xl font-bold">{responseRate}%</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Response Rate</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 transition-colors">
                <p className="text-2xl font-bold">{counts.offer}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Offers</p>
              </div>
            </div>

            {/* Status breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 text-center transition-colors">
                <p className="text-lg font-semibold">{counts.saved}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Saved</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 text-center transition-colors">
                <p className="text-lg font-semibold">{counts.applied}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Applied</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 text-center transition-colors">
                <p className="text-lg font-semibold">{counts.interviewing}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Interviewing</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 text-center transition-colors">
                <p className="text-lg font-semibold">{counts.offer}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Offer</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 text-center transition-colors">
                <p className="text-lg font-semibold">{counts.rejected}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Rejected</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 text-center transition-colors">
                <p className="text-lg font-semibold">{counts.withdrawn}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Withdrawn</p>
              </div>
            </div>

            {needsFollowUp.length > 0 && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-orange-700 dark:text-orange-400">
                    ⏰ Needs Follow-up ({needsFollowUp.length})
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {needsFollowUp.map((app) => (
                    <ApplicationCard key={app.id} app={app} />
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Recent Applications</h2>
              <Link href="/applications" className="text-sm text-blue-600 hover:underline">
                View all →
              </Link>
            </div>

            {recent.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No applications yet. Add your first one!</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recent.map((app) => (
                  <ApplicationCard key={app.id} app={app} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}