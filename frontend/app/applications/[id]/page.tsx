"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/app/components/layout/Sidebar";
import { ApplicationStatus, JobApplication } from "@/types/job_application";
import { CoverLetter, CoverLetterTone } from "@/types/cover_letter";
import { useSessionMonitor } from "@/hooks/useSessionMonitor";
import { getAuthToken } from "@/lib/auth";
import {
  getApplication,
  updateApplication,
  deleteApplication,
  getActiveResume,
  getAiStatus,
  getCoverLetters,
  getCoverLetter,
  generateCoverLetter,
  updateCoverLetter,
} from "@/lib/api";
import ApplicationHeader from "./components/ApplicationHeader";
import PipelineStepper from "./components/PipelineStepper";
import OverviewTab from "./components/OverviewTab";
import JobDescriptionTab from "./components/JobDescriptionTab";
import InterviewPrepTab from "./components/InterviewPrepTab";
import CoverLetterTab from "./components/CoverLetterTab";
import NotesSidebar from "./components/NotesSidebar";
import DetailSkeleton from "./components/DetailSkeleton";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const TABS = ["Overview", "Job Description", "Interview Prep", "Cover Letter"] as const;
type Tab = (typeof TABS)[number];

function authHeader(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const appId = params.id as string;

  const [app, setApp] = useState<JobApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("Overview");

  const [statusSaving, setStatusSaving] = useState(false);
  const [currencySaving, setCurrencySaving] = useState(false);

  const [suggestions, setSuggestions] = useState<any>(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState("");
  const [suggestionsGeneratedAt, setSuggestionsGeneratedAt] = useState<Date | null>(null);

  const [jobSummary, setJobSummary] = useState<{ summary: string; highlights: string[] } | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState("");
  const [summaryGeneratedAt, setSummaryGeneratedAt] = useState<Date | null>(null);

  const [activeResume, setActiveResume] = useState<{ id: number; filename: string } | null>(null);
  const [aiActive, setAiActive] = useState<boolean | null>(null);
  const [coverLetter, setCoverLetter] = useState<CoverLetter | null>(null);
  const [loadingCoverLetter, setLoadingCoverLetter] = useState(true);
  const [generatingLetter, setGeneratingLetter] = useState(false);
  const [coverLetterError, setCoverLetterError] = useState("");
  const [tone, setTone] = useState<CoverLetterTone>("professional");
  const [emphasis, setEmphasis] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [letterDirty, setLetterDirty] = useState(false);
  const [savingLetter, setSavingLetter] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");

  useSessionMonitor();

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push("/");
      return;
    }

    setLoading(true);
    getApplication(appId)
      .then(setApp)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [appId, router]);

  useEffect(() => {
    if (!getAuthToken()) return;

    setLoadingCoverLetter(true);
    Promise.all([
      getActiveResume().catch(() => null),
      getAiStatus().then((s) => s.ai_active).catch(() => null),
      getCoverLetters(appId).catch(() => []),
    ])
      .then(async ([resume, aiStatus, letters]) => {
        setActiveResume(resume);
        setAiActive(aiStatus);
        if (letters.length > 0) {
          const latest = await getCoverLetter(appId, letters[0].id);
          setCoverLetter(latest);
          setEditedContent(latest.content);
          setLetterDirty(false);
        }
      })
      .finally(() => setLoadingCoverLetter(false));
  }, [appId]);

  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (letterDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [letterDirty]);

  function handleBackClick(e: React.MouseEvent) {
    if (letterDirty) {
      const proceed = confirm("You have unsaved cover letter changes. Leave this page anyway?");
      if (!proceed) e.preventDefault();
    }
  }

  async function handleStatusChange(newStatus: ApplicationStatus) {
    if (!app) return;
    setStatusSaving(true);
    setError("");
    try {
      const updated = await updateApplication(appId, { ...app, status: newStatus });
      setApp(updated);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setStatusSaving(false);
    }
  }

  async function handleCurrencyChange(newCurrency: string) {
    if (!app) return;
    setCurrencySaving(true);
    setError("");
    try {
      const updated = await updateApplication(appId, { ...app, currency: newCurrency });
      setApp(updated);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCurrencySaving(false);
    }
  }

  async function handleSaveNotes(notes: string) {
    if (!app) return;
    const updated = await updateApplication(appId, { ...app, notes });
    setApp(updated);
  }

  async function handleDelete() {
    if (!app) return;
    if (!confirm(`Delete "${app.position} at ${app.company}"? This cannot be undone.`)) return;

    try {
      await deleteApplication(appId);
      router.push("/applications");
    } catch {
      setError("Failed to delete application");
    }
  }

  async function loadJobSummary() {
    setLoadingSummary(true);
    setSummaryError("");
    try {
      const res = await fetch(`${API_URL}/applications/${appId}/summary`, {
        headers: { ...authHeader() },
      });
      if (!res.ok) throw new Error("Failed to load job summary");
      const data = await res.json();
      setJobSummary(data.summary);
      setSummaryGeneratedAt(new Date());
    } catch (err: any) {
      setSummaryError(err.message || "Failed to load job summary");
    } finally {
      setLoadingSummary(false);
    }
  }

  async function loadSuggestions() {
    setLoadingSuggestions(true);
    setSuggestionsError("");
    try {
      const res = await fetch(`${API_URL}/applications/${appId}/suggestions`, {
        headers: { ...authHeader() },
      });
      if (!res.ok) throw new Error("Failed to load suggestions");
      const data = await res.json();
      setSuggestions(data.suggestions);
      setSuggestionsGeneratedAt(new Date());
    } catch (err: any) {
      setSuggestionsError(err.message || "Failed to load suggestions");
    } finally {
      setLoadingSuggestions(false);
    }
  }

  async function handleGenerateCoverLetter() {
    if (coverLetter && letterDirty) {
      const proceed = confirm("Regenerating will discard your unsaved edits to the current draft. Continue?");
      if (!proceed) return;
    }

    setGeneratingLetter(true);
    setCoverLetterError("");
    try {
      const generated = await generateCoverLetter(appId, {
        tone,
        emphasis: emphasis.trim() || null,
        recipient_name: recipientName.trim() || null,
      });
      setCoverLetter(generated);
      setEditedContent(generated.content);
      setLetterDirty(false);
    } catch (err: any) {
      setCoverLetterError(err.message);
    } finally {
      setGeneratingLetter(false);
    }
  }

  async function handleSaveCoverLetter() {
    if (!coverLetter) return;
    setSavingLetter(true);
    setCoverLetterError("");
    try {
      const updated = await updateCoverLetter(appId, coverLetter.id, editedContent);
      setCoverLetter(updated);
      setLetterDirty(false);
    } catch (err: any) {
      setCoverLetterError(err.message);
    } finally {
      setSavingLetter(false);
    }
  }

  async function handleCopyCoverLetter() {
    try {
      await navigator.clipboard.writeText(editedContent);
      setCopyStatus("Copied!");
    } catch {
      setCopyStatus("Couldn't copy - select and copy the text manually.");
    } finally {
      setTimeout(() => setCopyStatus(""), 2500);
    }
  }

  const coverLetterBlocker =
    aiActive === false
      ? "Ask an administrator to configure the AI provider."
      : !loadingCoverLetter && !activeResume
      ? "Upload a resume to generate a grounded cover letter."
      : app && !app.description
      ? "Add the job description so the letter can be tailored."
      : undefined;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 p-4 pt-16 md:p-8 overflow-y-auto">
        {loading && <DetailSkeleton />}
        {error && <p className="text-red-500 max-w-6xl mx-auto">{error}</p>}

        {app && (
          <div key={app.id} className="max-w-6xl mx-auto">
            <ApplicationHeader app={app} onDelete={handleDelete} onBackClick={handleBackClick} />

            <PipelineStepper
              status={app.status}
              updatedAt={app.updated_at}
              needsFollowUp={app.needs_follow_up}
              daysSinceUpdate={app.days_since_update}
              saving={statusSaving}
              onStatusChange={handleStatusChange}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div role="tablist" aria-label="Application sections" className="flex flex-wrap gap-1 border-b border-gray-200 dark:border-gray-700">
                  {TABS.map((tab) => (
                    <button
                      key={tab}
                      role="tab"
                      aria-selected={activeTab === tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 ${
                        activeTab === tab
                          ? "border-blue-600 text-blue-700 dark:text-blue-400"
                          : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div role="tabpanel" hidden={activeTab !== "Overview"}>
                  <OverviewTab app={app} currencySaving={currencySaving} onCurrencyChange={handleCurrencyChange} />
                </div>

                <div role="tabpanel" hidden={activeTab !== "Job Description"}>
                  <JobDescriptionTab
                    description={app.description}
                    jobSummary={jobSummary}
                    loadingSummary={loadingSummary}
                    summaryError={summaryError}
                    summaryGeneratedAt={summaryGeneratedAt}
                    onGenerateSummary={loadJobSummary}
                  />
                </div>

                <div role="tabpanel" hidden={activeTab !== "Interview Prep"}>
                  <InterviewPrepTab
                    suggestions={suggestions}
                    loadingSuggestions={loadingSuggestions}
                    suggestionsError={suggestionsError}
                    suggestionsGeneratedAt={suggestionsGeneratedAt}
                    onGenerateSuggestions={loadSuggestions}
                  />
                </div>

                <div role="tabpanel" hidden={activeTab !== "Cover Letter"}>
                  <CoverLetterTab
                    coverLetter={coverLetter}
                    activeResumeFilename={activeResume?.filename}
                    disabledReason={coverLetterBlocker}
                    tone={tone}
                    emphasis={emphasis}
                    recipientName={recipientName}
                    editedContent={editedContent}
                    letterDirty={letterDirty}
                    generatingLetter={generatingLetter}
                    savingLetter={savingLetter}
                    coverLetterError={coverLetterError}
                    copyStatus={copyStatus}
                    onToneChange={setTone}
                    onEmphasisChange={setEmphasis}
                    onRecipientNameChange={setRecipientName}
                    onContentChange={(v) => {
                      setEditedContent(v);
                      setLetterDirty(true);
                    }}
                    onGenerate={handleGenerateCoverLetter}
                    onSave={handleSaveCoverLetter}
                    onCopy={handleCopyCoverLetter}
                  />
                </div>
              </div>

              <div className="lg:col-span-1">
                <NotesSidebar initialNotes={app.notes || ""} onSave={handleSaveNotes} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
