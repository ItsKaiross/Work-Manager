"use client";
import Link from "next/link";
import { ResumeAnalysis } from "@/types/resume";
import { JobApplication } from "@/types/job_application";
import MetricCard from "./MetricCard";
import RecommendationCard from "./RecommendationCard";

interface PerformanceTabProps {
  analysis: ResumeAnalysis;
  applications: JobApplication[];
  resumeFilename: string;
  recalculating: boolean;
  recalculateMessage: string;
  recalculateError: string;
  onRecalculate: () => void;
  onGoToMyResume: () => void;
}

const SMALL_SAMPLE_THRESHOLD = 10;

function classifyRecommendation(text: string): { href: string; label: string } {
  const lower = text.toLowerCase();
  if (lower.includes("skill")) return { href: "#my-resume", label: "Review skills" };
  return { href: "/applications", label: "Review applications" };
}

export default function PerformanceTab({
  analysis,
  applications,
  resumeFilename,
  recalculating,
  recalculateMessage,
  recalculateError,
  onRecalculate,
  onGoToMyResume,
}: PerformanceTabProps) {
  const staleApplications = applications.filter((a) => a.needs_follow_up);
  const smallSample = analysis.total_applications < SMALL_SAMPLE_THRESHOLD;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MetricCard
            label="Interview Rate"
            value={`${analysis.total_applications > 0 ? analysis.success_rate.toFixed(1) : "0.0"}%`}
            sublabel={
              analysis.total_applications > 0
                ? `${Math.round((analysis.success_rate / 100) * analysis.total_applications)} of ${analysis.total_applications} applications scored against ${resumeFilename} reached Interviewing or Offer`
                : "No applications scored against this resume yet"
            }
            definition={
              <>
                <p className="font-semibold text-gray-700 dark:text-gray-200 mb-1">How this is calculated</p>
                <p>Counts applications with status Interviewing or Offer, divided by all applications that have been match-scored against {resumeFilename}.</p>
                <p className="mt-1">Covers all time — there's no date range filter yet. Rejected, withdrawn, saved, and applied-only statuses don't count as a success.</p>
              </>
            }
          />
          <MetricCard
            label="Average Match"
            value={`${analysis.total_applications > 0 ? analysis.average_match_percentage.toFixed(1) : "0.0"}%`}
            sublabel={`Across ${analysis.total_applications} scored application${analysis.total_applications === 1 ? "" : "s"}`}
            progress={analysis.average_match_percentage}
            definition={
              <>
                <p className="font-semibold text-gray-700 dark:text-gray-200 mb-1">How this is calculated</p>
                <p>The average resume-to-job match score across every application scored against {resumeFilename}, all time.</p>
              </>
            }
          />
        </div>

        {smallSample && (
          <p className="text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
            Early signal — add at least {SMALL_SAMPLE_THRESHOLD} submitted applications before treating this rate as a reliable trend.
          </p>
        )}

        <div>
          <h2 className="text-lg font-semibold mb-3">Recommendations</h2>
          <div className="space-y-3">
            {analysis.recommendations.map((rec, idx) => {
              const { href, label } = classifyRecommendation(rec);
              return (
                <RecommendationCard
                  key={idx}
                  text={rec}
                  action={href === "#my-resume" ? { label, onClick: onGoToMyResume } : { label, href }}
                />
              );
            })}
            {staleApplications.length > 0 && (
              <RecommendationCard
                text={`${staleApplications.length} submitted application${staleApplications.length === 1 ? " has" : "s have"} no recent status update. Review follow-ups.`}
                action={{ label: "Review stale applications", href: "/applications" }}
              />
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Next actions</h2>
          <div className="space-y-2">
            <button
              onClick={onRecalculate}
              disabled={recalculating}
              className="w-full min-h-[44px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50"
            >
              {recalculating ? "Recalculating…" : "Recalculate match scores"}
            </button>
            <div aria-live="polite">
              {recalculateMessage && <p className="text-xs text-green-700 dark:text-green-400">{recalculateMessage}</p>}
              {recalculateError && <p className="text-xs text-red-600 dark:text-red-400">{recalculateError}</p>}
            </div>
            <Link
              href="/applications/new"
              className="block text-center min-h-[44px] leading-[44px] px-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Add an application
            </Link>
            {staleApplications.length > 0 && (
              <Link
                href="/applications"
                className="block text-center min-h-[44px] leading-[44px] px-3 rounded-lg text-sm font-medium text-orange-700 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition"
              >
                {staleApplications.length} application{staleApplications.length === 1 ? "" : "s"} need follow-up
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
