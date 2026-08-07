"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/layout/Sidebar";
import ApplicationCard from "@/app/applications/ApplicationCard";
import StatusFilter from "@/app/applications/StatusFilter";
import CategoryFilter from "@/app/applications/CategoryFilter";
import { useApplications } from "@/hooks/useApplication";
import { JobApplication } from "@/types/job_application";
import { useSessionMonitor } from "@/hooks/useSessionMonitor";
import { getAuthToken } from "@/lib/auth";
import { getJobCategory } from "@/lib/jobCategories";

type Status = JobApplication["status"] | "all";

export default function ApplicationsPage() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const { applications, loading, error, refresh, lastUpdated } = useApplications(30000); // Auto-refresh every 30 seconds
  const [activeFilter, setActiveFilter] = useState<Status>("all");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [recalculating, setRecalculating] = useState(false);
  const [recalculateMessage, setRecalculateMessage] = useState<string | null>(null);
  
  useSessionMonitor();

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push("/");
    } else {
      setChecked(true);
    }
  }, [router]);

  const handleRecalculate = async () => {
    setRecalculating(true);
    setRecalculateMessage(null);
    
    try {
      const token = getAuthToken();
      const response = await fetch("http://localhost:8000/api/resumes/active", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 404) {
        setRecalculateMessage("❌ No resume found. Please upload a resume first!");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to get active resume");
      }

      const resume = await response.json();
      
      // Call recalculate endpoint
      const recalcResponse = await fetch(`http://localhost:8000/api/resumes/${resume.id}/recalculate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!recalcResponse.ok) {
        throw new Error("Failed to recalculate match scores");
      }

      const result = await recalcResponse.json();
      setRecalculateMessage(`✅ ${result.message} - ${result.applications_processed} applications updated!`);
      
      // Refresh applications immediately to show new match scores
      await refresh();
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setRecalculateMessage(null);
      }, 3000);
    } catch (err) {
      setRecalculateMessage(`❌ Error: ${err instanceof Error ? err.message : "Failed to recalculate"}`);
    } finally {
      setRecalculating(false);
    }
  };

  if (!checked) return null;

  const filtered = applications.filter((a) => {
    if (activeFilter !== "all" && a.status !== activeFilter) return false;
    if (activeCategory !== "all" && getJobCategory(a) !== activeCategory) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const haystack = `${a.company} ${a.position} ${a.location ?? ""}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    const referenceDate = a.applied_date ?? a.created_at;
    if (dateFrom && referenceDate && referenceDate.slice(0, 10) < dateFrom) return false;
    if (dateTo && referenceDate && referenceDate.slice(0, 10) > dateTo) return false;
    if ((dateFrom || dateTo) && !referenceDate) return false;

    return true;
  });

  const hasActiveFilters =
    searchQuery.trim() !== "" || dateFrom !== "" || dateTo !== "" || activeCategory !== "all";

  const clearFilters = () => {
    setSearchQuery("");
    setDateFrom("");
    setDateTo("");
    setActiveCategory("all");
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">All Applications</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
            <button
              onClick={handleRecalculate}
              disabled={recalculating}
              className="px-3 py-1.5 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              title="Recalculate match scores for all applications"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              {recalculating ? "Calculating..." : "Recalculate Matches"}
            </button>
            <button
              onClick={refresh}
              disabled={loading}
              className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {recalculateMessage && (
          <div className={`mb-4 p-3 rounded-lg ${recalculateMessage.includes('✅') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {recalculateMessage}
          </div>
        )}

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {!loading && !error && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
              <div className="relative flex-1 sm:max-w-xs">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search company, position, location..."
                  className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-500" htmlFor="dateFrom">From</label>
                <input
                  id="dateFrom"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <label className="text-sm text-gray-500" htmlFor="dateTo">To</label>
                <input
                  id="dateTo"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-500 hover:text-blue-600 transition"
                >
                  Clear filters
                </button>
              )}
            </div>

            <StatusFilter
              applications={applications}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
            />

            <CategoryFilter
              applications={applications}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />

            {filtered.length === 0 ? (
              <p className="text-gray-500">No applications match this filter.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((app) => (
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