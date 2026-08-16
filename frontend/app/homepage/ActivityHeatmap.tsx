"use client";
import { useMemo, useState } from "react";
import { JobApplication } from "@/types/job_application";

const DAY_MS = 24 * 60 * 60 * 1000;
const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

const LEVEL_COLORS = [
  "bg-gray-100 dark:bg-gray-700/50",
  "bg-blue-200 dark:bg-blue-900",
  "bg-blue-400 dark:bg-blue-700",
  "bg-blue-600 dark:bg-blue-500",
  "bg-blue-800 dark:bg-blue-300",
];

interface Cell {
  date: Date;
  key: string;
  count: number;
  inRange: boolean;
}

function toDateKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function ActivityHeatmap({ applications }: { applications: JobApplication[] }) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; label: string } | null>(null);

  const { weeks, monthLabels, maxCount, totalCount } = useMemo(() => {
    const counts = new Map<string, number>();
    for (const app of applications) {
      const raw = app.applied_date || app.created_at;
      if (!raw) continue;
      const key = raw.slice(0, 10);
      counts.set(key, (counts.get(key) || 0) + 1);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const rangeStart = new Date(today.getTime() - 364 * DAY_MS);
    const gridStart = new Date(rangeStart);
    gridStart.setDate(gridStart.getDate() - gridStart.getDay());

    const days: Cell[] = [];
    for (let d = new Date(gridStart); d <= today; d.setDate(d.getDate() + 1)) {
      const key = toDateKey(d);
      days.push({
        date: new Date(d),
        key,
        count: counts.get(key) || 0,
        inRange: d >= rangeStart,
      });
    }

    const weeks: Cell[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    const monthLabels = weeks.map((week, i) => {
      const first = week[0].date;
      const prevFirst = i > 0 ? weeks[i - 1][0].date : null;
      if (!prevFirst || first.getMonth() !== prevFirst.getMonth()) {
        return first.toLocaleDateString("en-US", { month: "short" });
      }
      return "";
    });

    const maxCount = Math.max(1, ...days.filter((d) => d.inRange).map((d) => d.count));
    const totalCount = days.filter((d) => d.inRange).reduce((sum, d) => sum + d.count, 0);

    return { weeks, monthLabels, maxCount, totalCount };
  }, [applications]);

  function levelFor(count: number) {
    if (count === 0) return 0;
    const ratio = count / maxCount;
    if (ratio > 0.75) return 4;
    if (ratio > 0.5) return 3;
    if (ratio > 0.25) return 2;
    return 1;
  }

  function showTooltip(e: React.MouseEvent | React.FocusEvent, cell: Cell) {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const label = `${cell.count} application${cell.count === 1 ? "" : "s"} on ${cell.date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}`;
    setTooltip({ x: rect.left + rect.width / 2, y: rect.top, label });
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Activity Heatmap</h2>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {totalCount} application{totalCount === 1 ? "" : "s"} in the last year
        </span>
      </div>

      <div className="overflow-x-auto pb-1">
        <div className="inline-flex gap-[3px]">
          <div className="flex flex-col gap-[3px] mr-1 pt-[15px]">
            {DAY_LABELS.map((label, i) => (
              <div key={i} className="h-[11px] text-[10px] leading-[11px] text-gray-400 dark:text-gray-500">
                {label}
              </div>
            ))}
          </div>

          <div>
            <div className="flex gap-[3px] mb-1">
              {weeks.map((_, i) => (
                <div key={i} className="w-[11px] text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap">
                  {monthLabels[i]}
                </div>
              ))}
            </div>
            <div className="flex gap-[3px]">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-[3px]">
                  {week.map((day) =>
                    day.inRange ? (
                      <button
                        key={day.key}
                        type="button"
                        onMouseEnter={(e) => showTooltip(e, day)}
                        onFocus={(e) => showTooltip(e, day)}
                        onMouseLeave={() => setTooltip(null)}
                        onBlur={() => setTooltip(null)}
                        className={`w-[11px] h-[11px] rounded-sm p-0 border-0 cursor-pointer appearance-none ${LEVEL_COLORS[levelFor(day.count)]}`}
                      />
                    ) : (
                      <div key={day.key} className="w-[11px] h-[11px]" />
                    )
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-1 mt-2 text-[10px] text-gray-400 dark:text-gray-500">
        <span>Less</span>
        {LEVEL_COLORS.map((c, i) => (
          <div key={i} className={`w-[10px] h-[10px] rounded-sm ${c}`} />
        ))}
        <span>More</span>
      </div>

      {tooltip && (
        <div
          className="fixed z-50 -translate-x-1/2 -translate-y-full -mt-2 pointer-events-none px-2 py-1 rounded bg-gray-900 text-white text-xs shadow-lg whitespace-nowrap"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.label}
        </div>
      )}
    </div>
  );
}
