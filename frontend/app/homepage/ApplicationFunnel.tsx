"use client";
import { JobApplication } from "@/types/job_application";

const STAGES: { key: JobApplication["status"]; label: string; color: string }[] = [
  { key: "saved", label: "Saved", color: "bg-gray-400" },
  { key: "applied", label: "Applied", color: "bg-blue-500" },
  { key: "interviewing", label: "Interviewing", color: "bg-yellow-500" },
  { key: "offer", label: "Offer", color: "bg-green-500" },
];

const EXITS: { key: JobApplication["status"]; label: string; color: string }[] = [
  { key: "rejected", label: "Rejected", color: "bg-red-500" },
  { key: "withdrawn", label: "Withdrawn", color: "bg-gray-500" },
];

export default function ApplicationFunnel({ applications }: { applications: JobApplication[] }) {
  const countOf = (status: string) => applications.filter((a) => a.status === status).length;
  const maxCount = Math.max(1, ...STAGES.map((s) => countOf(s.key)));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 transition-colors">
      <h2 className="text-lg font-semibold mb-4">Application Pipeline</h2>

      <div className="space-y-2">
        {STAGES.map((stage) => {
          const count = countOf(stage.key);
          const pct = Math.round((count / maxCount) * 100);
          return (
            <div key={stage.key} className="flex items-center gap-3">
              <span className="w-24 text-sm text-gray-600 dark:text-gray-300 shrink-0">{stage.label}</span>
              <div className="flex-1 h-6 bg-gray-100 dark:bg-gray-700/40 rounded overflow-hidden">
                <div
                  className={`h-full ${stage.color} rounded transition-all`}
                  style={{ width: `${count > 0 ? Math.max(pct, 4) : 0}%` }}
                  title={`${stage.label}: ${count}`}
                />
              </div>
              <span className="w-8 text-sm font-semibold text-right shrink-0">{count}</span>
            </div>
          );
        })}
      </div>

      {(countOf("rejected") > 0 || countOf("withdrawn") > 0) && (
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
          {EXITS.map((exit) => {
            const count = countOf(exit.key);
            if (count === 0) return null;
            return (
              <span key={exit.key} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${exit.color}`} />
                {exit.label}: {count}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
