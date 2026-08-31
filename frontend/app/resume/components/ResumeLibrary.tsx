"use client";
import { Resume } from "@/types/resume";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

interface ResumeLibraryProps {
  resumes: Resume[];
  activeResumeId?: number;
  selectedResumeId: number | null;
  onSelect: (id: number) => void;
}

export default function ResumeLibrary({ resumes, activeResumeId, selectedResumeId, onSelect }: ResumeLibraryProps) {
  if (resumes.length <= 1) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
        Resume history ({resumes.length})
      </h2>
      <ul className="space-y-1.5">
        {resumes.map((r) => {
          const selected = r.id === selectedResumeId;
          return (
            <li key={r.id}>
              <button
                onClick={() => onSelect(r.id)}
                aria-current={selected ? "true" : undefined}
                className={`w-full min-h-[44px] flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-left px-3 py-2 rounded-lg text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 ${
                  selected
                    ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                    : "border border-transparent hover:bg-gray-50 dark:hover:bg-gray-700/50"
                }`}
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span className="font-medium text-gray-800 dark:text-gray-200 truncate">{r.filename}</span>
                  {r.id === activeResumeId && (
                    <span className="shrink-0 px-2 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-[11px] font-semibold">
                      Active
                    </span>
                  )}
                </span>
                <span className="shrink-0 text-xs text-gray-500 dark:text-gray-400">
                  {new Date(r.upload_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  {" · "}
                  {formatFileSize(r.file_size)}
                  {r.skills && ` · ${r.skills.length} skills`}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
