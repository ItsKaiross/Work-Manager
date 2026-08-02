import Link from "next/link";
import { JobApplication } from "@/types/job_application";

const STATUS_COLORS: Record<string, string> = {
  saved: "bg-gray-400",
  applied: "bg-blue-500",
  interviewing: "bg-yellow-500",
  offer: "bg-green-500",
  rejected: "bg-red-500",
  withdrawn: "bg-gray-500",
};

const STATUS_TEXT_COLORS: Record<string, string> = {
  saved: "text-gray-400",
  applied: "text-blue-500",
  interviewing: "text-yellow-500",
  offer: "text-green-500",
  rejected: "text-red-500",
  withdrawn: "text-gray-500",
};

export default function ApplicationCard({ app }: { app: JobApplication }) {
  const appliedDate = app.applied_date
    ? new Date(app.applied_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "Not applied yet";

  return (
    <Link
      href={`/applications/${app.id}`}
      className="relative block bg-white hover:bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 transition-colors shadow-sm"
    >
      <span
        className={`absolute top-4 right-4 w-3 h-3 rounded-full ${STATUS_COLORS[app.status] || "bg-gray-300"}`}
        title={app.status}
      />

      <div className="pr-6">
        <p className="font-semibold text-lg text-gray-900 truncate">
          {app.position}
        </p>
        <p className={`text-md font-semibold truncate ${STATUS_TEXT_COLORS[app.status] || "text-gray-300" }`}>
          {app.status}
        </p>
        <p className="text-sm text-gray-500 truncate">
          {app.company}
          {app.location ? ` · ${app.location}` : ""}
        </p>
        {app.source && (
          <p className="text-xs text-gray-400 mt-1 truncate">
            Source: {app.source}
          </p>
        )}
      </div>

      <div className="flex justify-between items-end mt-3">
        <div className="flex items-center gap-2">
          {app.salary_range && (
            <span className="text-xs text-gray-400">{app.salary_range}</span>
          )}
          {app.currency && app.salary_range && (
            <span className="text-xs text-gray-500 font-medium">({app.currency})</span>
          )}
        </div>
        <span className="text-xs text-gray-400">{appliedDate}</span>
      </div>
    </Link>
  );
}