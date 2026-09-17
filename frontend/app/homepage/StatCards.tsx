"use client";

type IconProps = { className?: string };

/* Inline icons (24x24, currentColor) — no extra dependency. */
const icons = {
  briefcase: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M2 13h20" />
    </svg>
  ),
  sparkline: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M3 17l5-6 4 3 5-7" />
      <path d="M17 7h4v4" />
    </svg>
  ),
  reply: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M9 14L4 9l5-5" />
      <path d="M4 9h10a6 6 0 0 1 6 6v5" />
    </svg>
  ),
  trophy: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M8 3h8v5a4 4 0 0 1-8 0V3Z" />
      <path d="M16 5h3v2a3 3 0 0 1-3 3M8 5H5v2a3 3 0 0 0 3 3" />
      <path d="M12 12v4M9 20h6M10 16h4l1 4H9l1-4Z" />
    </svg>
  ),
  clock: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  ),
  bookmark: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M6 3h12v18l-6-4-6 4V3Z" />
    </svg>
  ),
  send: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M21 3 11 13M21 3l-6 18-4-8-8-4 18-6Z" />
    </svg>
  ),
  chat: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M21 12a8 8 0 0 1-8 8H7l-4 3V12a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8Z" />
    </svg>
  ),
  cross: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 9l6 6M15 9l-6 6" />
    </svg>
  ),
  undo: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M3 9h11a5 5 0 0 1 0 10h-5" />
      <path d="M7 5 3 9l4 4" />
    </svg>
  ),
} as const;

type IconName = keyof typeof icons;

const tones = {
  blue: {
    chip: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
    bar: "bg-blue-500",
    dot: "bg-blue-500",
  },
  emerald: {
    chip: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
    bar: "bg-emerald-500",
    dot: "bg-emerald-500",
  },
  violet: {
    chip: "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400",
    bar: "bg-violet-500",
    dot: "bg-violet-500",
  },
  amber: {
    chip: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
    bar: "bg-amber-500",
    dot: "bg-amber-500",
  },
  slate: {
    chip: "bg-gray-100 text-gray-600 dark:bg-gray-700/60 dark:text-gray-300",
    bar: "bg-gray-400",
    dot: "bg-gray-400",
  },
  rose: {
    chip: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400",
    bar: "bg-rose-500",
    dot: "bg-rose-500",
  },
} as const;

type Tone = keyof typeof tones;

const cardBase =
  "bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-gray-300 dark:hover:border-gray-600";

export function SummaryCard({
  icon,
  tone,
  value,
  label,
  hint,
  progress,
  title,
}: {
  icon: IconName;
  tone: Tone;
  value: string | number;
  label: string;
  hint?: string;
  /** 0-100; renders a progress bar under the value. */
  progress?: number;
  title?: string;
}) {
  const Icon = icons[icon];
  const t = tones[tone];
  return (
    <div className={`${cardBase} p-4`} title={title}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-2xl font-bold tabular-nums leading-tight">{value}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{label}</p>
        </div>
        <span className={`shrink-0 grid place-items-center w-9 h-9 rounded-lg ${t.chip}`} aria-hidden="true">
          <Icon className="w-5 h-5" />
        </span>
      </div>

      {progress !== undefined && (
        <div className="mt-3 h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
          <div
            className={`h-full rounded-full ${t.bar} transition-[width] duration-500`}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}

      {hint && <p className="mt-2 text-xs text-gray-400 dark:text-gray-500 truncate">{hint}</p>}
    </div>
  );
}

export function StatusCard({
  icon,
  tone,
  value,
  label,
  total,
}: {
  icon: IconName;
  tone: Tone;
  value: number;
  label: string;
  total: number;
}) {
  const Icon = icons[icon];
  const t = tones[tone];
  const share = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className={`${cardBase} p-3`} title={`${value} ${label} (${share}% of ${total})`}>
      <div className="flex items-center gap-2">
        <span className={`grid place-items-center w-7 h-7 rounded-md ${t.chip}`} aria-hidden="true">
          <Icon className="w-4 h-4" />
        </span>
        <p className="text-lg font-semibold tabular-nums">{value}</p>
        <p className="ml-auto text-xs text-gray-400 dark:text-gray-500 tabular-nums">{share}%</p>
      </div>
      <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <div className="mt-2 h-1 w-full rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
        <div
          className={`h-full rounded-full ${t.bar} transition-[width] duration-500`}
          style={{ width: `${share}%` }}
        />
      </div>
    </div>
  );
}
