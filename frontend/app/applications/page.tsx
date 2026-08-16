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

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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

  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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
      const response = await fetch(`${API_URL}/api/resumes/active`, {
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
      const recalcResponse = await fetch(`${API_URL}/api/resumes/${resume.id}/recalculate`, {
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

  function toggleSelectMode() {
    setSelectMode((v) => !v);
    setSelectedIds(new Set());
  }

  function toggleSelected(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleBulkDelete() {
    setDeleting(true);
    setDeleteError(null);

    const token = getAuthToken();
    const results = await Promise.allSettled(
      Array.from(selectedIds).map((id) =>
        fetch(`${API_URL}/applications/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }).then((res) => {
          if (!res.ok) throw new Error(`Failed to delete application ${id}`);
        })
      )
    );

    const failed = results.filter((r) => r.status === "rejected").length;
    setDeleting(false);
    setShowDeleteConfirm(false);

    if (failed > 0) {
      setDeleteError(`${failed} application${failed === 1 ? "" : "s"} could not be deleted.`);
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set());
      setSelectMode(false);
    }

    await refresh();
  }

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
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <main className="flex-1 p-4 pt-16 md:p-8 overflow-y-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h1 className="text-2xl font-bold">All Applications</h1>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-gray-500 dark:text-gray-400">
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
            <button
              onClick={toggleSelectMode}
              className={`px-3 py-1.5 text-sm rounded-lg transition flex items-center gap-1 ${
                selectMode
                  ? "bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {selectMode ? "Cancel" : "Select"}
            </button>
          </div>
        </div>

        {selectMode && (
          <div className="flex flex-wrap items-center gap-3 mb-4 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <span className="text-sm text-blue-800 dark:text-blue-300 font-medium">
              {selectedIds.size} selected
            </span>
            <button
              onClick={() => setSelectedIds(new Set(filtered.map((a) => a.id)))}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Select all ({filtered.length})
            </button>
            {selectedIds.size > 0 && (
              <button
                onClick={() => setSelectedIds(new Set())}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={selectedIds.size === 0}
              className="ml-auto px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Selected
            </button>
          </div>
        )}

        {deleteError && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
            {deleteError}
          </div>
        )}

        {recalculateMessage && (
          <div className={`mb-4 p-3 rounded-lg ${recalculateMessage.includes('✅') ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'}`}>
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
                  className="w-full pl-9 pr-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <label className="text-sm text-gray-500 dark:text-gray-400" htmlFor="dateFrom">From</label>
                <input
                  id="dateFrom"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="px-2 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <label className="text-sm text-gray-500 dark:text-gray-400" htmlFor="dateTo">To</label>
                <input
                  id="dateTo"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="px-2 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <p className="text-gray-500 dark:text-gray-400">No applications match this filter.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((app) => (
                  <ApplicationCard
                    key={app.id}
                    app={app}
                    selectable={selectMode}
                    selected={selectedIds.has(app.id)}
                    onToggleSelect={toggleSelected}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => !deleting && setShowDeleteConfirm(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-sm w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-2">
              Delete {selectedIds.size} application{selectedIds.size === 1 ? "" : "s"}?
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600 transition disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}