"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { JobApplication } from "@/types/job_application";

interface ApplicationHeaderProps {
  app: JobApplication;
  onDelete: () => void;
  onBackClick: (e: React.MouseEvent) => void;
}

function matchScoreClasses(pct: number): string {
  if (pct >= 70) return "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700";
  if (pct >= 50) return "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700";
  return "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700";
}

export default function ApplicationHeader({ app, onDelete, onBackClick }: ApplicationHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="sticky top-0 z-20 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-b border-gray-200 dark:border-gray-700 -mx-4 md:-mx-8 px-4 md:px-8 py-3 mb-6">
      <div className="max-w-6xl mx-auto">
        <Link
          href="/applications"
          onClick={onBackClick}
          className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 rounded"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Applications
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold truncate">{app.position}</h1>
            <p className="text-gray-500 dark:text-gray-400 truncate">
              {app.company}
              {app.location ? ` · ${app.location}` : ""}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {app.match_percentage !== null && app.match_percentage !== undefined && (
              <div
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold border flex items-center gap-1.5 ${matchScoreClasses(app.match_percentage)}`}
                title="Resume match score"
              >
                <span className="text-base font-bold">{Math.round(app.match_percentage)}%</span>
                <span className="text-xs font-normal">match</span>
              </div>
            )}

            {app.job_url && (
              <a
                href={app.job_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
              >
                View posting
              </a>
            )}

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                aria-label="More actions"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-1 w-44 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg py-1 z-30"
                >
                  <button
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete();
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                  >
                    Delete application
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
