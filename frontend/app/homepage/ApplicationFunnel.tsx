"use client";
import { JobApplication } from "@/types/job_application";

type IconProps = { className?: string };

/* Inline icons (24x24, currentColor) — no extra dependency. */
const svgProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "1.8",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const icons = {
  funnel: (p: IconProps) => (
    <svg {...svgProps} {...p}>
      <path d="M3 4h18l-7 8v7l-4 2v-9L3 4Z" />
    </svg>
  ),
  bookmark: (p: IconProps) => (
    <svg {...svgProps} {...p}>
      <path d="M6 3h12v18l-6-4-6 4V3Z" />
    </svg>
  ),
  send: (p: IconProps) => (
    <svg {...svgProps} {...p}>
      <path d="M21 3 11 13M21 3l-6 18-4-8-8-4 18-6Z" />
    </svg>
  ),
  chat: (p: IconProps) => (
    <svg {...svgProps} {...p}>
      <path d="M21 12a8 8 0 0 1-8 8H7l-4 3V12a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8Z" />
    </svg>
  ),
  trophy: (p: IconProps) => (
    <svg {...svgProps} {...p}>
      <path d="M8 3h8v5a4 4 0 0 1-8 0V3Z" />
      <path d="M16 5h3v2a3 3 0 0 1-3 3M8 5H5v2a3 3 0 0 0 3 3" />
      <path d="M12 12v4M9 20h6M10 16h4l1 4H9l1-4Z" />
    </svg>
  ),
  cross: (p: IconProps) => (
    <svg {...svgProps} {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 9l6 6M15 9l-6 6" />
    </svg>
  ),
  undo: (p: IconProps) => (
    <svg {...svgProps} {...p}>
      <path d="M3 9h11a5 5 0 0 1 0 10H8" />
      <path d="M3 9l4-4M3 9l4 4" />
    </svg>
  ),
};

type Stage = {
  key: JobApplication["status"];
  label: string;
  color: string;
  icon: (p: IconProps) => React.ReactElement;
  iconColor: string;
};

const STAGES: Stage[] = [
  { key: "saved", label: "Saved", color: "bg-gray-400", icon: icons.bookmark, iconColor: "text-gray-400" },
  { key: "applied", label: "Applied", color: "bg-blue-500", icon: icons.send, iconColor: "text-blue-500" },
  { key: "interviewing", label: "Interviewing", color: "bg-yellow-500", icon: icons.chat, iconColor: "text-yellow-500" },
  { key: "offer", label: "Offer", color: "bg-green-500", icon: icons.trophy, iconColor: "text-green-500" },
];

const EXITS: Stage[] = [
  { key: "rejected", label: "Rejected", color: "bg-red-500", icon: icons.cross, iconColor: "text-red-500" },
  { key: "withdrawn", label: "Withdrawn", color: "bg-gray-500", icon: icons.undo, iconColor: "text-gray-500" },
];

export default function ApplicationFunnel({ applications }: { applications: JobApplication[] }) {
  const countOf = (status: string) => applications.filter((a) => a.status === status).length;
  const maxCount = Math.max(1, ...STAGES.map((s) => countOf(s.key)));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 transition-colors">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <icons.funnel className="w-5 h-5 text-blue-500" />
        Application Pipeline
      </h2>

      <div className="space-y-2">
        {STAGES.map((stage) => {
          const count = countOf(stage.key);
          const pct = Math.round((count / maxCount) * 100);
          return (
            <div key={stage.key} className="flex items-center gap-3">
              <span className="w-28 text-sm text-gray-600 dark:text-gray-300 shrink-0 flex items-center gap-2">
                <stage.icon className={`w-4 h-4 shrink-0 ${stage.iconColor}`} />
                {stage.label}
              </span>
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
                <exit.icon className={`w-4 h-4 shrink-0 ${exit.iconColor}`} />
                {exit.label}: {count}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
