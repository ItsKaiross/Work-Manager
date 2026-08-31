"use client";
import AiPanel from "./AiPanel";

interface JobSummary {
  summary: string;
  highlights: string[];
}

interface JobDescriptionTabProps {
  description?: string | null;
  jobSummary: JobSummary | null;
  loadingSummary: boolean;
  summaryError: string;
  summaryGeneratedAt: Date | null;
  onGenerateSummary: () => void;
}

export default function JobDescriptionTab({
  description,
  jobSummary,
  loadingSummary,
  summaryError,
  summaryGeneratedAt,
  onGenerateSummary,
}: JobDescriptionTabProps) {
  if (!description) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <p className="text-gray-500 dark:text-gray-400 text-sm">No job description was saved for this application.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AiPanel
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        }
        title="Job Post Summary"
        description="Get a quick overview and key highlights of this job posting."
        hasContent={!!jobSummary}
        generating={loadingSummary}
        error={summaryError}
        lastGeneratedAt={summaryGeneratedAt}
        generateLabel="Summarize"
        regenerateLabel="Re-summarize"
        onGenerate={onGenerateSummary}
      >
        {jobSummary && (
          <div className="space-y-3">
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{jobSummary.summary}</p>
            {jobSummary.highlights && jobSummary.highlights.length > 0 && (
              <ul className="space-y-1.5">
                {jobSummary.highlights.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </AiPanel>

      <details className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 group">
        <summary className="cursor-pointer text-sm font-medium text-blue-700 dark:text-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 rounded">
          View full description
        </summary>
        <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm leading-relaxed mt-4">
          {description}
        </div>
      </details>
    </div>
  );
}
