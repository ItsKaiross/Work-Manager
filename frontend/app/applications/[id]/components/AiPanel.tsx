"use client";
import { ReactNode } from "react";

interface AiPanelProps {
  icon: ReactNode;
  title: string;
  description: string;
  hasContent: boolean;
  generating: boolean;
  error?: string;
  lastGeneratedAt?: Date | string | null;
  generateLabel?: string;
  regenerateLabel?: string;
  disabledReason?: string;
  onGenerate: () => void;
  children?: ReactNode;
}

function formatTimestamp(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  const date = typeof value === "string" ? new Date(value) : value;
  if (isNaN(date.getTime())) return null;
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
}

export default function AiPanel({
  icon,
  title,
  description,
  hasContent,
  generating,
  error,
  lastGeneratedAt,
  generateLabel = "Generate",
  regenerateLabel = "Regenerate",
  disabledReason,
  onGenerate,
  children,
}: AiPanelProps) {
  const timestamp = formatTimestamp(lastGeneratedAt);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
        <div className="flex items-center gap-2">
          <span className="text-blue-600 dark:text-blue-400">{icon}</span>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
        </div>

        <button
          onClick={onGenerate}
          disabled={generating || !!disabledReason}
          title={disabledReason}
          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {generating ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {hasContent ? "Regenerating..." : "Generating..."}
            </>
          ) : hasContent ? (
            regenerateLabel
          ) : (
            generateLabel
          )}
        </button>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 italic mb-3">
        AI-assisted — review generated content before relying on it.
      </p>

      <div aria-live="polite">
        {error && (
          <p className="text-red-600 dark:text-red-400 text-sm mb-3">{error}</p>
        )}
      </div>

      {!hasContent && !error && (
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{disabledReason || description}</p>
      )}

      {children}

      {hasContent && timestamp && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">Last generated {timestamp}</p>
      )}
    </div>
  );
}
