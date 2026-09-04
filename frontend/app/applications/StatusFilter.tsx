import { JobApplication } from "@/types/job_application";

type Status = JobApplication["status"] | "all";

interface StatusFilterProps {
  applications: JobApplication[];
  activeFilter: Status;
  onFilterChange: (f: Status) => void;
}

const STATUSES: Status[] = ["all", "saved", "applied", "interviewing", "offer", "rejected", "withdrawn"];

export default function StatusFilter({ applications, activeFilter, onFilterChange }: StatusFilterProps) {
  return (
    <div className="mb-4">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2">
        Status
      </h2>
      <div className="flex gap-2 flex-wrap">
      {STATUSES.map((status) => {
        const count = status === "all"
          ? applications.length
          : applications.filter((a) => a.status === status).length;

        return (
          <button
            key={status}
            onClick={() => onFilterChange(status)}
            className={`px-3 py-1.5 rounded-full text-sm transition ${
              activeFilter === status
                ? "bg-blue-500 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {status === "all" ? "All" : status} ({count})
          </button>
        );
      })}
      </div>
    </div>
  );
}