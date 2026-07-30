import { ApplicationStatus } from "@/types/job_application";

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; color: string }> = {
    saved: { label: "Saved", color: "#8B93A3" },
    applied: { label: "Applied", color: "#4C8BF5" },
    interviewing: { label: "Interviewing", color: "#E7A33E" },
    offer: { label: "Offer", color: "#3FBF6F" },
    rejected: { label: "Rejected", color: "#E5584B" },
    withdrawn: { label: "Withdrawn", color: "#8B93A3" },
};

export default function StatusStamp({ status }: { status: ApplicationStatus }) {
const { label, color } = STATUS_CONFIG[status];

return (
    <div
        className="shrink-0 flex items-center justify-center w-16 h-16 rounded-full border-2 border-dashed -rotate-6 select-none"
        style={{ borderColor: color, color }}
    >
        <span className="font-mono text-[9px] font-medium uppercase tracking-wider text-center leading-tight px-1">
            {label}
        </span>
    </div>
    );
}