import Link from "next/link";
import { JobApplication } from "@/types/job_application";
import StatusStamp from "./StatusStamp";

export default function ApplicationCard({ app }: { app: JobApplication }) {
    const appliedDate = app.applied_date
    ? new Date(app.applied_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "Not applied yet";

return (
    <Link
        href={`/applications/${app.id}`}
        className="group flex items-center gap-5 bg-[#1A1F27] hover:bg-[#212733] border border-[#2A303C] rounded-xl px-5 py-4 transition-colors"
    >
        <StatusStamp status={app.status} />

    <div className="flex-1 min-w-0">
        <p className="font-[family-name:var(--font-display)] text-lg text-[#EDEFF2] truncate">
            {app.position}
        </p>
        <p className="text-sm text-[#8B93A3] truncate">
            {app.company}
            {app.location ? ` · ${app.location}` : ""}
        </p>
    </div>

    <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
        {app.salary_range && (
        <span className="text-xs text-[#8B93A3]">{app.salary_range}</span>
        )}
        <span className="font-[family-name:var(--font-mono)] text-xs text-[#8B93A3]">
        {appliedDate}
        </span>
    </div>
    </Link>
    );
}