"use client";
import { CoverLetter, CoverLetterTone } from "@/types/cover_letter";
import AiPanel from "./AiPanel";

interface CoverLetterTabProps {
  coverLetter: CoverLetter | null;
  activeResumeFilename?: string | null;
  disabledReason?: string;
  tone: CoverLetterTone;
  emphasis: string;
  recipientName: string;
  editedContent: string;
  letterDirty: boolean;
  generatingLetter: boolean;
  savingLetter: boolean;
  coverLetterError: string;
  copyStatus: string;
  onToneChange: (tone: CoverLetterTone) => void;
  onEmphasisChange: (value: string) => void;
  onRecipientNameChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onGenerate: () => void;
  onSave: () => void;
  onCopy: () => void;
}

export default function CoverLetterTab({
  coverLetter,
  activeResumeFilename,
  disabledReason,
  tone,
  emphasis,
  recipientName,
  editedContent,
  letterDirty,
  generatingLetter,
  savingLetter,
  coverLetterError,
  copyStatus,
  onToneChange,
  onEmphasisChange,
  onRecipientNameChange,
  onContentChange,
  onGenerate,
  onSave,
  onCopy,
}: CoverLetterTabProps) {
  return (
    <AiPanel
      icon={
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      }
      title="Cover Letter"
      description="Generate a cover letter draft tailored to this job using your active resume."
      hasContent={!!coverLetter}
      generating={generatingLetter}
      error={coverLetterError}
      lastGeneratedAt={coverLetter?.updated_at || coverLetter?.created_at}
      generateLabel="Generate Draft"
      regenerateLabel="Regenerate Draft"
      disabledReason={disabledReason}
      onGenerate={onGenerate}
    >
      {!disabledReason && (
        <>
          {!coverLetter && (
            <div className="space-y-3 mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {activeResumeFilename ? `Uses your active resume: ${activeResumeFilename}` : "Loading resume…"}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Tone</label>
                  <select
                    value={tone}
                    onChange={(e) => onToneChange(e.target.value as CoverLetterTone)}
                    className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm w-full"
                  >
                    <option value="professional">Professional</option>
                    <option value="warm">Warm</option>
                    <option value="concise">Concise</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Emphasis (optional)</label>
                  <input
                    value={emphasis}
                    onChange={(e) => onEmphasisChange(e.target.value)}
                    placeholder="e.g. focus on leadership"
                    className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Recipient name (optional)</label>
                  <input
                    value={recipientName}
                    onChange={(e) => onRecipientNameChange(e.target.value)}
                    placeholder="e.g. Jane Smith"
                    className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm w-full"
                  />
                </div>
              </div>
            </div>
          )}

          {coverLetter && (
            <div className="space-y-3">
              <textarea
                value={editedContent}
                onChange={(e) => onContentChange(e.target.value)}
                rows={14}
                aria-label="Cover letter content"
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white rounded-lg px-4 py-3 text-sm leading-relaxed focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
              />

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={onSave}
                  disabled={!letterDirty || savingLetter}
                  className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingLetter ? "Saving…" : "Save"}
                </button>
                <button
                  onClick={onCopy}
                  className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm font-medium"
                >
                  Copy
                </button>
                {letterDirty && (
                  <span className="text-xs text-amber-600 dark:text-amber-400">Unsaved changes</span>
                )}
                <span aria-live="polite" className="text-xs text-green-600 dark:text-green-400">
                  {copyStatus}
                </span>
              </div>

              {(coverLetter.supporting_points.length > 0 || coverLetter.warnings.length > 0) && (
                <details className="text-sm">
                  <summary className="cursor-pointer text-blue-700 dark:text-blue-400 font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 rounded">
                    Why this draft?
                  </summary>
                  <div className="mt-2 space-y-3">
                    {coverLetter.supporting_points.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Supporting evidence</p>
                        <ul className="space-y-1.5">
                          {coverLetter.supporting_points.map((point, idx) => (
                            <li key={idx} className="text-gray-700 dark:text-gray-300">
                              <span className="font-medium">{point.claim}</span>
                              <span className="text-gray-500 dark:text-gray-400"> — {point.resume_evidence}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {coverLetter.warnings.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">Warnings</p>
                        <ul className="space-y-1 text-amber-700 dark:text-amber-400">
                          {coverLetter.warnings.map((w, idx) => (
                            <li key={idx}>{w}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </div>
          )}
        </>
      )}
    </AiPanel>
  );
}
