"use client";
import { JobApplication } from "@/types/job_application";

export default function SourceBreakdown({ applications }: { applications: JobApplication[] }) {
  if (applications.length === 0) return null;

  const counts = new Map<string, number>();
  for (const app of applications) {
    const source = app.source?.trim() || "Unknown";
    counts.set(source, (counts.get(source) || 0) + 1);
  }

  const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  const top = sorted.slice(0, 6);
  const restCount = sorted.slice(6).reduce((sum, [, c]) => sum + c, 0);
  if (restCount > 0) top.push(["Other", restCount]);

  const maxCount = Math.max(1, ...top.map(([, c]) => c));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 transition-colors">
      <h2 className="text-lg font-semibold mb-4">Top Sources</h2>

      <div className="space-y-2">
        {top.map(([source, count]) => {
          const pct = Math.round((count / maxCount) * 100);
          return (
            <div key={source} className="flex items-center gap-3">
              <span
                className="w-28 text-sm text-gray-600 dark:text-gray-300 truncate shrink-0"
                title={source}
              >
                {source}
              </span>
              <div className="flex-1 h-4 bg-gray-100 dark:bg-gray-700/40 rounded overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded"
                  style={{ width: `${Math.max(pct, 4)}%` }}
                  title={`${source}: ${count}`}
                />
              </div>
              <span className="w-6 text-sm font-semibold text-right shrink-0">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
