"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { JobApplication } from "@/types/job_application";
import { getAuthToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const STATUS_OPTIONS = ["saved", "applied", "interviewing", "offer", "rejected", "withdrawn"];

// Forward progression only — rejected/withdrawn are terminal exits, not pipeline steps,
// so they're reachable via the dropdown but not the quick-advance arrow.
const PIPELINE_ORDER = ["saved", "applied", "interviewing", "offer"];

function getNextStatus(current: string): string | null {
  const idx = PIPELINE_ORDER.indexOf(current);
  if (idx === -1 || idx === PIPELINE_ORDER.length - 1) return null;
  return PIPELINE_ORDER[idx + 1];
}

const STATUS_COLORS: Record<string, string> = {
  saved: "bg-gray-400",
  applied: "bg-blue-500",
  interviewing: "bg-yellow-500",
  offer: "bg-green-500",
  rejected: "bg-red-500",
  withdrawn: "bg-gray-500",
};

const STATUS_TEXT_COLORS: Record<string, string> = {
  saved: "text-gray-400",
  applied: "text-blue-500",
  interviewing: "text-yellow-500",
  offer: "text-green-500",
  rejected: "text-red-500",
  withdrawn: "text-gray-500",
};

interface ApplicationCardProps {
  app: JobApplication;
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: (id: number) => void;
}

export default function ApplicationCard({
  app: initialApp,
  selectable = false,
  selected = false,
  onToggleSelect,
}: ApplicationCardProps) {
  const router = useRouter();
  const [app, setApp] = useState(initialApp);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [updating, setUpdating] = useState(false);

  const appliedDate = app.applied_date
    ? new Date(app.applied_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "Not applied yet";

  async function handleStatusChange(newStatus: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    
    setUpdating(true);
    setShowStatusMenu(false);

    const token = getAuthToken();
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/applications/${app.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...app, status: newStatus }),
      });

      if (res.ok) {
        const updated = await res.json();
        setApp(updated);
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdating(false);
    }
  }

  function toggleStatusMenu(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setShowStatusMenu(!showStatusMenu);
  }

  const getMatchColor = (percentage: number) => {
    if (percentage >= 70)
      return "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800";
    if (percentage >= 50)
      return "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800";
    return "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800";
  };

  const cardContent = (
    <>
      {selectable && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleSelect?.(app.id);
          }}
          aria-label={selected ? "Deselect application" : "Select application"}
          className={`absolute top-3 left-3 z-10 w-5 h-5 rounded border-2 flex items-center justify-center transition ${
            selected
              ? "bg-blue-500 border-blue-500"
              : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
          }`}
        >
          {selected && (
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
      )}

      {/* Match Percentage Badge */}
      {app.match_percentage !== null && app.match_percentage !== undefined && (
        <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold border-2 ${getMatchColor(app.match_percentage)} shadow-sm`}>
          {Math.round(app.match_percentage)}%
        </div>
      )}

      <div className={`pr-16 ${selectable ? "pl-7" : ""}`}>
        <p className="font-semibold text-lg text-gray-900 dark:text-white truncate">
          {app.position}
        </p>

        {/* Status: read-only in select mode, interactive dropdown + quick-advance otherwise */}
        {selectable ? (
          <span
            className={`inline-flex items-center gap-1.5 text-md font-semibold ${STATUS_TEXT_COLORS[app.status] || "text-gray-300"}`}
          >
            <span
              className={`w-2 h-2 rounded-full ${STATUS_COLORS[app.status] || "bg-gray-300"}`}
              aria-hidden="true"
            />
            {app.status}
          </span>
        ) : (
          <div className="relative inline-flex items-center gap-1.5">
            <button
              onClick={toggleStatusMenu}
              disabled={updating}
              className={`text-md font-semibold truncate ${STATUS_TEXT_COLORS[app.status] || "text-gray-300"} hover:opacity-70 transition flex items-center gap-1`}
            >
              {updating ? "Updating..." : app.status}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {getNextStatus(app.status) && (
              <button
                onClick={(e) => handleStatusChange(getNextStatus(app.status)!, e)}
                disabled={updating}
                title={`Mark as ${getNextStatus(app.status)}`}
                className="p-0.5 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            {showStatusMenu && (
              <div
                className="absolute left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 py-1 min-w-[150px]"
                onClick={(e) => e.stopPropagation()}
              >
                {STATUS_OPTIONS.map((status) => (
                  <button
                    key={status}
                    onClick={(e) => handleStatusChange(status, e)}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      status === app.status ? "bg-gray-50 dark:bg-gray-700 font-medium" : ""
                    } ${STATUS_TEXT_COLORS[status]}`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
          {app.company}
          {app.location ? ` · ${app.location}` : ""}
        </p>
        {app.source && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate">
            Source: {app.source}
          </p>
        )}
      </div>

      <div className="flex justify-between items-end mt-3">
        <div className="flex items-center gap-2">
          {app.salary_range && (
            <span className="text-xs text-gray-400 dark:text-gray-500">{app.salary_range}</span>
          )}
          {app.currency && app.salary_range && (
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">({app.currency})</span>
          )}
        </div>
        <span className="text-xs text-gray-400 dark:text-gray-500">{appliedDate}</span>
      </div>

      {app.needs_follow_up && (
        <p className="text-xs text-orange-600 font-medium mt-1">
          <span aria-hidden="true">⏰</span> No update in {app.days_since_update} day
          {app.days_since_update === 1 ? "" : "s"} — follow up?
        </p>
      )}
    </>
  );

  const borderClass = selected
    ? "border-blue-400 dark:border-blue-500 ring-2 ring-blue-200 dark:ring-blue-900"
    : app.needs_follow_up
    ? "border-orange-300 dark:border-orange-700 border-l-4 border-l-orange-400"
    : "border-gray-200 dark:border-gray-700";

  if (selectable) {
    return (
      <div
        onClick={() => onToggleSelect?.(app.id)}
        className={`relative block cursor-pointer bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border rounded-xl px-5 py-4 transition-colors shadow-sm ${borderClass}`}
      >
        {cardContent}
      </div>
    );
  }

  function navigateToDetail() {
    router.push(`/applications/${app.id}`);
  }

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={navigateToDetail}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          navigateToDetail();
        }
      }}
      className={`relative block cursor-pointer bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border rounded-xl px-5 py-4 transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${borderClass}`}
    >
      {cardContent}
    </div>
  );
}