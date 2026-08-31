"use client";
import { useState, useRef, useEffect } from "react";
import { ApplicationStatus } from "@/types/job_application";
import { capitalize } from "@/lib/format";

const PIPELINE: ApplicationStatus[] = ["saved", "applied", "interviewing", "offer"];
const EXIT_STATUSES: ApplicationStatus[] = ["rejected", "withdrawn"];

interface PipelineStepperProps {
  status: ApplicationStatus;
  updatedAt?: string | null;
  needsFollowUp?: boolean | null;
  daysSinceUpdate?: number | null;
  saving: boolean;
  onStatusChange: (status: ApplicationStatus) => void;
}

export default function PipelineStepper({
  status,
  updatedAt,
  needsFollowUp,
  daysSinceUpdate,
  saving,
  onStatusChange,
}: PipelineStepperProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isExited = EXIT_STATUSES.includes(status);
  const currentIndex = PIPELINE.indexOf(status);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const lastChangedLabel = updatedAt
    ? new Date(updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 md:p-6 mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        {isExited ? (
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                status === "rejected"
                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                  : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
              }`}
            >
              {capitalize(status)}
            </span>
            <span className="text-gray-400 dark:text-gray-500">
              This application is no longer in the active pipeline.
            </span>
          </div>
        ) : (
          <ol className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0" aria-label="Application pipeline stage">
            {PIPELINE.map((step, idx) => {
              const isComplete = idx < currentIndex;
              const isCurrent = idx === currentIndex;
              return (
                <li key={step} className="flex items-center shrink-0 sm:flex-1 sm:min-w-0 last:flex-none">
                  <button
                    onClick={() => !saving && onStatusChange(step)}
                    disabled={saving}
                    aria-current={isCurrent ? "step" : undefined}
                    className={`flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 ${
                      isCurrent
                        ? "bg-blue-600 text-white"
                        : isComplete
                        ? "text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        : "text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <span
                      className={`w-4 h-4 shrink-0 rounded-full flex items-center justify-center text-[10px] ${
                        isCurrent
                          ? "bg-white text-blue-600"
                          : isComplete
                          ? "bg-blue-600 text-white"
                          : "bg-gray-300 dark:bg-gray-600 text-white"
                      }`}
                    >
                      {isComplete ? "✓" : idx + 1}
                    </span>
                    <span className={`whitespace-nowrap ${isCurrent ? "" : "hidden sm:inline"}`}>
                      {capitalize(step)}
                    </span>
                  </button>
                  {idx < PIPELINE.length - 1 && (
                    <span className="w-3 sm:w-6 h-px bg-gray-200 dark:bg-gray-600 shrink-0" />
                  )}
                </li>
              );
            })}
          </ol>
        )}

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            disabled={saving}
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
          >
            Mark as… ▾
          </button>
          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg py-1 z-30"
            >
              {(isExited ? PIPELINE : EXIT_STATUSES).map((s) => (
                <button
                  key={s}
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    onStatusChange(s);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  {capitalize(s)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
        {saving && <span>Saving…</span>}
        {lastChangedLabel && <span>Last changed {lastChangedLabel}</span>}
        {needsFollowUp && (
          <span className="text-orange-600 dark:text-orange-400 font-medium">
            ⏰ No update in {daysSinceUpdate} day{daysSinceUpdate === 1 ? "" : "s"} — follow up?
          </span>
        )}
      </div>
    </div>
  );
}
