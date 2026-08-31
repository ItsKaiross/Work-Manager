"use client";
import { Resume } from "@/types/resume";

export type ResumeTab = "My Resume" | "Performance";
const TABS: ResumeTab[] = ["My Resume", "Performance"];

interface ResumeHeaderProps {
  activeResume: Resume | null;
  activeTab: ResumeTab;
  onTabChange: (tab: ResumeTab) => void;
  onUploadClick: () => void;
}

export default function ResumeHeader({ activeResume, activeTab, onTabChange, onUploadClick }: ResumeHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold">Resume & Performance</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your resume and understand how it performs across your applications.
          </p>
          {activeResume && (
            <div className="flex flex-wrap items-center gap-2 mt-3 text-sm">
              <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs font-semibold">
                Active
              </span>
              <span className="font-medium text-gray-800 dark:text-gray-200">{activeResume.filename}</span>
              <span className="text-gray-400 dark:text-gray-500">
                · Uploaded {new Date(activeResume.upload_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </div>
          )}
        </div>

        <button
          onClick={onUploadClick}
          className="min-h-[44px] px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
        >
          Upload new resume
        </button>
      </div>

      <div role="tablist" aria-label="Resume sections" className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
        {TABS.map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => onTabChange(tab)}
            className={`min-h-[44px] px-3 py-2 text-sm font-medium border-b-2 -mb-px transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 ${
              activeTab === tab
                ? "border-blue-600 text-blue-700 dark:text-blue-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}
