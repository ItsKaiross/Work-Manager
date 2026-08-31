"use client";
import { ReactNode } from "react";

interface MetricCardProps {
  label: string;
  value: string;
  sublabel?: string;
  definition?: ReactNode;
  progress?: number;
}

export default function MetricCard({ label, value, sublabel, definition, progress }: MetricCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center gap-1.5 mb-1">
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        {definition && (
          <details className="relative">
            <summary
              className="list-none [&::-webkit-details-marker]:hidden cursor-pointer w-5 h-5 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
              aria-label={`What does ${label} mean?`}
            >
              ⓘ
            </summary>
            <div className="absolute left-0 z-30 mt-1 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              {definition}
            </div>
          </details>
        )}
      </div>
      <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
      {sublabel && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{sublabel}</p>}
      {progress !== undefined && (
        <div className="mt-2 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500" style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
        </div>
      )}
    </div>
  );
}
