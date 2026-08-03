"use client";
import { useState } from "react";
import Link from "next/link";
import { JobApplication } from "@/types/job_application";
import { getAuthToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const STATUS_OPTIONS = ["saved", "applied", "interviewing", "offer", "rejected", "withdrawn"];

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

export default function ApplicationCard({ app: initialApp }: { app: JobApplication }) {
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
    if (percentage >= 70) return "bg-green-100 text-green-800 border-green-300";
    if (percentage >= 50) return "bg-yellow-100 text-yellow-800 border-yellow-300";
    return "bg-red-100 text-red-800 border-red-300";
  };

  return (
    <Link
      href={`/applications/${app.id}`}
      className="relative block bg-white hover:bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 transition-colors shadow-sm"
    >
      {/* Status Dot */}
      <span
        className={`absolute top-4 right-4 w-3 h-3 rounded-full ${STATUS_COLORS[app.status] || "bg-gray-300"}`}
        title={app.status}
      />
      
      {/* Match Percentage Badge - Positioned higher to avoid overlap */}
      {app.match_percentage !== null && app.match_percentage !== undefined && (
        <div className={`absolute top-2 right-12 px-3 py-1 rounded-full text-xs font-bold border-2 ${getMatchColor(app.match_percentage)} shadow-sm`}>
          {Math.round(app.match_percentage)}%
        </div>
      )}

      <div className="pr-24">
        <p className="font-semibold text-lg text-gray-900 truncate">
          {app.position}
        </p>
        
        {/* Status with dropdown */}
        <div className="relative inline-block">
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
          
          {showStatusMenu && (
            <div 
              className="absolute left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1 min-w-[150px]"
              onClick={(e) => e.stopPropagation()}
            >
              {STATUS_OPTIONS.map((status) => (
                <button
                  key={status}
                  onClick={(e) => handleStatusChange(status, e)}
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                    status === app.status ? "bg-gray-50 font-medium" : ""
                  } ${STATUS_TEXT_COLORS[status]}`}
                >
                  {status}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <p className="text-sm text-gray-500 truncate">
          {app.company}
          {app.location ? ` · ${app.location}` : ""}
        </p>
        {app.source && (
          <p className="text-xs text-gray-400 mt-1 truncate">
            Source: {app.source}
          </p>
        )}
      </div>

      <div className="flex justify-between items-end mt-3">
        <div className="flex items-center gap-2">
          {app.salary_range && (
            <span className="text-xs text-gray-400">{app.salary_range}</span>
          )}
          {app.currency && app.salary_range && (
            <span className="text-xs text-gray-500 font-medium">({app.currency})</span>
          )}
        </div>
        <span className="text-xs text-gray-400">{appliedDate}</span>
      </div>
    </Link>
  );
}