"use client";
import { useEffect, useState } from "react";
import { Resume } from "@/types/resume";

const JOB_SITES: { name: string; url: (keyword: string) => string }[] = [
  { name: "LinkedIn", url: (k) => `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(k)}` },
  { name: "Glassdoor", url: (k) => `https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${encodeURIComponent(k)}` },
  { name: "Google Jobs", url: (k) => `https://www.google.com/search?q=${encodeURIComponent(k)}&ibp=htl;jobs` },
  { name: "ZipRecruiter", url: (k) => `https://www.ziprecruiter.com/candidate/search?search=${encodeURIComponent(k)}` },
  { name: "Monster", url: (k) => `https://www.monster.com/jobs/search?q=${encodeURIComponent(k)}` },
  { name: "SimplyHired", url: (k) => `https://www.simplyhired.com/search?q=${encodeURIComponent(k)}` },
  { name: "CareerBuilder", url: (k) => `https://www.careerbuilder.com/jobs?keywords=${encodeURIComponent(k)}` },
  { name: "Dice", url: (k) => `https://www.dice.com/jobs?q=${encodeURIComponent(k)}` },
  { name: "OnlineJobs.ph", url: (k) => `https://www.onlinejobs.ph/jobseekers/jobsearch?jobkeyword=${encodeURIComponent(k)}` },
];

interface JobSuggestionsPanelProps {
  resume: Resume;
  keywordsLoading: boolean;
  keywordsError: string;
  generatedAt: Date | null;
  onGenerate: () => void;
}

export default function JobSuggestionsPanel({ resume, keywordsLoading, keywordsError, generatedAt, onGenerate }: JobSuggestionsPanelProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [openSearch, setOpenSearch] = useState<{ resumeId: Resume["id"]; keyword: string } | null>(null);

  useEffect(() => {
    setDismissed(new Set());
  }, [resume.id]);

  const keywords = (resume.job_keywords || []).filter((k) => !dismissed.has(k));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <h2 className="text-lg font-semibold">Job suggestions</h2>
        </div>
        <button
          onClick={onGenerate}
          disabled={keywordsLoading}
          className="min-h-[44px] px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          {keywordsLoading ? "Generating…" : resume.job_keywords && resume.job_keywords.length > 0 ? "Regenerate" : "Generate suggestions"}
        </button>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 italic mb-3">
        AI-assisted — review generated content before relying on it.
      </p>

      <div aria-live="polite">
        {keywordsError && <p className="text-sm text-red-600 dark:text-red-400 mb-3">{keywordsError}</p>}
      </div>

      {keywords.length > 0 ? (
        <div className="space-y-2">
          {keywords.map((keyword) => (
            <div
              key={keyword}
              className="flex items-center justify-between gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{keyword}</span>
              <div className="flex items-center gap-1 shrink-0">
                <details
                  className="relative group"
                  open={openSearch?.resumeId === resume.id && openSearch.keyword === keyword}
                  onToggle={(event) => {
                    if (event.currentTarget.open) {
                      setOpenSearch({ resumeId: resume.id, keyword });
                    } else {
                      setOpenSearch((current) =>
                        current?.resumeId === resume.id && current.keyword === keyword ? null : current
                      );
                    }
                  }}
                >
                  <summary
                    className="list-none [&::-webkit-details-marker]:hidden cursor-pointer select-none min-h-[36px] px-3 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-600 transition flex items-center gap-1"
                  >
                    Search on
                    <span className="transition-transform group-open:rotate-180">▾</span>
                  </summary>
                  <div className="absolute right-0 z-20 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 max-h-64 overflow-y-auto">
                    {JOB_SITES.map((site) => (
                      <a
                        key={site.name}
                        href={site.url(keyword)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                      >
                        {site.name}
                        <span aria-hidden="true" className="text-gray-400">↗</span>
                        <span className="sr-only">(opens in a new tab)</span>
                      </a>
                    ))}
                  </div>
                </details>
                <button
                  onClick={() => setDismissed((prev) => new Set(prev).add(keyword))}
                  aria-label={`Dismiss suggestion: ${keyword}`}
                  className="min-h-[36px] min-w-[36px] flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !keywordsLoading && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No job suggestions yet. Generate suggestions to have AI recommend roles based on this resume.
          </p>
        )
      )}

      {generatedAt && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
          Generated {generatedAt.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "numeric" })}
        </p>
      )}
    </div>
  );
}
