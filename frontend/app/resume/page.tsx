"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/layout/Sidebar";
import {
  useActiveResume,
  useAllResumes,
  useResumeAnalysis,
  uploadResume,
  generateJobKeywords,
  recalculateMatchScores,
} from "@/hooks/useResume";
import { useSessionMonitor } from "@/hooks/useSessionMonitor";
import { getAuthToken } from "@/lib/auth";
import { getApplications } from "@/lib/api";
import { Resume } from "@/types/resume";
import { JobApplication } from "@/types/job_application";
import ResumeHeader, { ResumeTab } from "./components/ResumeHeader";
import UploadDropzone from "./components/UploadDropzone";
import ResumeLibrary from "./components/ResumeLibrary";
import ResumeDetailsPanel from "./components/ResumeDetailsPanel";
import JobSuggestionsPanel from "./components/JobSuggestionsPanel";
import PerformanceTab from "./components/PerformanceTab";
import ResumeSkeleton from "./components/ResumeSkeleton";

export default function ResumePage() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const { resume: activeResume, loading, error, refresh } = useActiveResume();
  const { resumes: allResumes, refresh: refreshAllResumes } = useAllResumes();
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const [displayedResume, setDisplayedResume] = useState<Resume | null>(null);
  const { analysis, loading: analysisLoading, refresh: refreshAnalysis } = useResumeAnalysis(displayedResume?.id);

  const [activeTab, setActiveTab] = useState<ResumeTab>("My Resume");

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [uploadResetSignal, setUploadResetSignal] = useState(0);

  const [keywordsLoading, setKeywordsLoading] = useState(false);
  const [keywordsError, setKeywordsError] = useState("");
  const [keywordsGeneratedAt, setKeywordsGeneratedAt] = useState<Date | null>(null);

  const [recalculating, setRecalculating] = useState(false);
  const [recalculateMessage, setRecalculateMessage] = useState("");
  const [recalculateError, setRecalculateError] = useState("");

  const [applications, setApplications] = useState<JobApplication[]>([]);

  useSessionMonitor();

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push("/");
    } else {
      setChecked(true);
    }
  }, [router]);

  useEffect(() => {
    if (!checked) return;
    getApplications()
      .then(setApplications)
      .catch(() => setApplications([]));
  }, [checked]);

  useEffect(() => {
    if (selectedResumeId) {
      const selected = allResumes.find((r) => r.id === selectedResumeId);
      setDisplayedResume(selected || null);
    } else if (activeResume) {
      setDisplayedResume(activeResume);
      setSelectedResumeId(activeResume.id);
    }
  }, [activeResume, selectedResumeId, allResumes]);

  async function handleUpload(file: File) {
    setUploading(true);
    setUploadError("");
    setUploadSuccess("");

    try {
      const result = await uploadResume(file);
      const count = result.applications_matched;
      setUploadSuccess(
        count > 0
          ? `Resume uploaded — ${count} application match score${count === 1 ? "" : "s"} updated.`
          : "Resume uploaded and parsed successfully."
      );
      setUploadResetSignal((n) => n + 1);
      setSelectedResumeId(result.resume.id);
      await Promise.all([refresh(), refreshAllResumes()]);
      refreshAnalysis();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Failed to upload resume");
    } finally {
      setUploading(false);
    }
  }

  async function handleGenerateKeywords() {
    if (!displayedResume) return;
    setKeywordsLoading(true);
    setKeywordsError("");
    try {
      const updated = await generateJobKeywords(displayedResume.id);
      setDisplayedResume(updated);
      setKeywordsGeneratedAt(new Date());
      refreshAllResumes();
    } catch (err) {
      setKeywordsError(err instanceof Error ? err.message : "Failed to generate job suggestions");
    } finally {
      setKeywordsLoading(false);
    }
  }

  async function handleRecalculate() {
    if (!displayedResume) return;
    setRecalculating(true);
    setRecalculateMessage("");
    setRecalculateError("");
    try {
      const result = await recalculateMatchScores(displayedResume.id);
      setRecalculateMessage(`Recalculated match scores for ${result.applications_processed} application${result.applications_processed === 1 ? "" : "s"}.`);
      refreshAnalysis();
    } catch (err) {
      setRecalculateError(err instanceof Error ? err.message : "Failed to recalculate match scores");
    } finally {
      setRecalculating(false);
    }
  }

  function scrollToUpload() {
    setActiveTab("My Resume");
    requestAnimationFrame(() => {
      document.getElementById("upload-dropzone")?.scrollIntoView({ behavior: "smooth", block: "start" });
      document.getElementById("resume-file")?.focus();
    });
  }

  if (!checked) return null;

  const isViewingHistorical = !!(displayedResume && activeResume && displayedResume.id !== activeResume.id);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <main className="flex-1 p-4 pt-16 md:p-8 overflow-y-auto">
        <ResumeHeader
          activeResume={activeResume}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onUploadClick={scrollToUpload}
        />

        {loading ? (
          <ResumeSkeleton />
        ) : error ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-red-600 dark:text-red-400 font-medium mb-1">Couldn't load your resume</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{error}</p>
            <button
              onClick={refresh}
              className="min-h-[44px] px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Retry
            </button>
          </div>
        ) : !activeResume && !displayedResume ? (
          <div className="max-w-xl">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <h2 className="text-lg font-semibold mb-2">Get started with your resume</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Upload a resume and we'll extract your skills, experience, and education, then automatically
                match it against your job applications. Once you've added a few applications, this page will
                also show how your resume is performing.
              </p>
            </div>
            <UploadDropzone
              uploading={uploading}
              error={uploadError}
              successMessage={uploadSuccess}
              onUpload={handleUpload}
              resetSignal={uploadResetSignal}
            />
          </div>
        ) : (
          <>
            {activeTab === "My Resume" && (
              <div id="my-resume" className="space-y-6">
                {isViewingHistorical && activeResume && (
                  <p className="text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
                    You are viewing an older resume. Current application matching uses <strong>{activeResume.filename}</strong>.
                  </p>
                )}

                <UploadDropzone
                  uploading={uploading}
                  error={uploadError}
                  successMessage={uploadSuccess}
                  onUpload={handleUpload}
                  resetSignal={uploadResetSignal}
                />

                <ResumeLibrary
                  resumes={allResumes}
                  activeResumeId={activeResume?.id}
                  selectedResumeId={selectedResumeId}
                  onSelect={setSelectedResumeId}
                />

                {displayedResume && (
                  <>
                    {applications.length === 0 && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2">
                        Parsing succeeded. Add your first application to start seeing match scores and performance insights.{" "}
                        <Link href="/applications/new" className="text-blue-700 dark:text-blue-400 font-medium hover:underline">
                          Add first application →
                        </Link>
                      </p>
                    )}
                    <ResumeDetailsPanel resume={displayedResume} />
                    <JobSuggestionsPanel
                      resume={displayedResume}
                      keywordsLoading={keywordsLoading}
                      keywordsError={keywordsError}
                      generatedAt={keywordsGeneratedAt}
                      onGenerate={handleGenerateKeywords}
                    />
                  </>
                )}
              </div>
            )}

            {activeTab === "Performance" && (
              <>
                {analysisLoading || !displayedResume ? (
                  <ResumeSkeleton />
                ) : analysis ? (
                  <PerformanceTab
                    analysis={analysis}
                    applications={applications}
                    resumeFilename={displayedResume.filename}
                    recalculating={recalculating}
                    recalculateMessage={recalculateMessage}
                    recalculateError={recalculateError}
                    onRecalculate={handleRecalculate}
                    onGoToMyResume={() => setActiveTab("My Resume")}
                  />
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Couldn't load performance data for this resume.</p>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
