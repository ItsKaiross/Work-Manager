"use client";
import { ApplicationStatus, JobApplication } from "@/types/job_application";
import { useRouter } from "next/navigation";

const FILTERS: { key: ApplicationStatus | "all"; label: string }[] = [
    { key: "all", label: "All applications" },
    { key: "saved", label: "Saved" },
    { key: "applied", label: "Applied" },
    { key: "interviewing", label: "Interviewing" },
    { key: "offer", label: "Offer" },
    { key: "rejected", label: "Rejected" },
];

export default function Sidebar({
    applications,
    activeFilter,
    onFilterChange,
}: {
    applications: JobApplication[];
    activeFilter: ApplicationStatus | "all";
    onFilterChange: (f: ApplicationStatus | "all") => void;
}) {
    const router = useRouter();
function handleLogout() {
    localStorage.removeItem("access_token");
    router.push("/");
}

return (
    <aside className="w-60 shrink-0 h-screen sticky top-0 border-r border-[#2A303C] bg-[#12151B] flex flex-col px-4 py-6">
    <p className="font-[family-name:var(--font-display)] text-xl text-[#EDEFF2] px-2 mb-8">
        Work Manager
    </p>

    <nav className="flex-1 flex flex-col gap-1">
        {FILTERS.map((f) => {
        const count = f.key === "all"
            ? applications.length
            : applications.filter((a) => a.status === f.key).length;

        return (
            <button
            key={f.key}
            onClick={() => onFilterChange(f.key)}
            className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                activeFilter === f.key
                ? "bg-[#E7A33E]/10 text-[#E7A33E]"
                : "text-[#8B93A3] hover:bg-[#1A1F27] hover:text-[#EDEFF2]"
            }`}
            >
            <span>{f.label}</span>
            <span className="font-[family-name:var(--font-mono)] text-xs">{count}</span>
            </button>
        );
        })}
    </nav>

    <button
        onClick={handleLogout}
        className="px-3 py-2 rounded-lg text-sm text-[#8B93A3] hover:bg-[#1A1F27] hover:text-[#EDEFF2] text-left transition-colors"
    >
        Log out
    </button>
    </aside>
);
}