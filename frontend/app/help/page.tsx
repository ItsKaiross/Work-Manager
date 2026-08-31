"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/app/components/layout/Sidebar";
import { useSessionMonitor } from "@/hooks/useSessionMonitor";
import { getAuthToken } from "@/lib/auth";

const CHECKLIST_STORAGE_KEY = "onboardingChecklistV2";
const LEGACY_CHECKLIST_STORAGE_KEY = "onboardingChecklist";

const CHECKLIST_ITEMS = [
  { id: "account-created", label: "Account created and sign-in completed", sectionId: "create-account" },
  { id: "navigation-understood", label: "Sidebar navigation understood", sectionId: "learn-navigation" },
  { id: "resume-uploaded", label: "Resume uploaded and parsed details reviewed", sectionId: "upload-resume" },
  { id: "first-application-saved", label: "First job posting extracted, checked, and saved", sectionId: "add-application" },
  { id: "status-changed", label: "Application status changed successfully", sectionId: "review-applications" },
  { id: "search-filter-used", label: "Search or a filter used on the Applications page", sectionId: "review-applications" },
  { id: "dashboard-reviewed", label: "Dashboard and follow-up area reviewed", sectionId: "daily-workflow" },
  { id: "match-score-understood", label: "Match score or its prerequisites understood", sectionId: "requirements" },
  { id: "interview-cover-letter-located", label: "Interview suggestions or cover-letter workflow located", sectionId: "application-detail" },
  { id: "theme-selected", label: "Light or dark theme selected", sectionId: "learn-navigation" },
];

const TOC_SECTIONS = [
  { id: "create-account", title: "1. Create an account or sign in" },
  { id: "learn-navigation", title: "2. Learn the navigation" },
  { id: "upload-resume", title: "3. Upload a resume first" },
  { id: "add-application", title: "4. Add the first application" },
  { id: "review-applications", title: "5. Review and organize applications" },
  { id: "application-detail", title: "6. Use an application detail page" },
  { id: "daily-workflow", title: "Daily workflow" },
  { id: "weekly-review", title: "Weekly review" },
  { id: "requirements", title: "Feature requirements and expectations" },
  { id: "troubleshooting", title: "Troubleshooting checklist" },
  { id: "checklist", title: "Completion checklist" },
];

const START_HERE_TASKS = [
  { href: "/resume", label: "Upload a resume", time: "~2 min" },
  { href: "/applications/new", label: "Add your first application", time: "~2 min" },
  { href: "/homepage", label: "Review the dashboard", time: "~1 min" },
];

const FOCUS_RING = "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500";

function scrollToSection(id: string, behavior: ScrollBehavior = "smooth") {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior, block: "start" });
  window.history.replaceState(null, "", `#${id}`);
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">{children}</div>
    </section>
  );
}

function OrderedList({ items }: { items: React.ReactNode[] }) {
  return (
    <ol className="list-decimal list-inside space-y-1.5">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ol>
  );
}

function BulletList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="list-disc list-inside space-y-1.5">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className={`text-blue-600 dark:text-blue-400 underline underline-offset-2 rounded ${FOCUS_RING}`}>
      {children}
    </Link>
  );
}

function Warning({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 px-3 py-2">
      {children}
    </div>
  );
}

export default function HelpPage() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [completed, setCompleted] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(CHECKLIST_ITEMS.map((item) => [item.id, false]))
  );

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
    try {
      const rawV2 = localStorage.getItem(CHECKLIST_STORAGE_KEY);
      if (rawV2) {
        const parsed = JSON.parse(rawV2);
        if (parsed && parsed.version === 2 && parsed.items && typeof parsed.items === "object") {
          setCompleted((prev) => ({ ...prev, ...parsed.items }));
          return;
        }
      }

      const legacyRaw = localStorage.getItem(LEGACY_CHECKLIST_STORAGE_KEY);
      if (legacyRaw) {
        const legacyParsed = JSON.parse(legacyRaw);
        if (Array.isArray(legacyParsed) && legacyParsed.length === CHECKLIST_ITEMS.length) {
          const migrated = Object.fromEntries(
            CHECKLIST_ITEMS.map((item, i) => [item.id, Boolean(legacyParsed[i])])
          );
          setCompleted(migrated);
          localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify({ version: 2, items: migrated }));
        }
      }
    } catch {
      // ignore malformed storage
    }
  }, []);

  useEffect(() => {
    if (!checked) return;
    const hash = window.location.hash.replace("#", "");
    if (hash) scrollToSection(hash, "auto");
  }, [checked]);

  function toggleItem(id: string) {
    setCompleted((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify({ version: 2, items: next }));
      return next;
    });
  }

  function resetProgress() {
    const next = Object.fromEntries(CHECKLIST_ITEMS.map((item) => [item.id, false]));
    setCompleted(next);
    localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify({ version: 2, items: next }));
  }

  function handleContinue() {
    const next = CHECKLIST_ITEMS.find((item) => !completed[item.id]);
    scrollToSection(next ? next.sectionId : "checklist");
  }

  if (!checked) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-gray-500 dark:text-gray-400">
        Loading...
      </div>
    );
  }

  const doneCount = CHECKLIST_ITEMS.filter((item) => completed[item.id]).length;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <main className="flex-1 p-4 pt-16 md:p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto lg:flex lg:items-start lg:gap-8">
          <div className="flex-1 min-w-0 max-w-3xl space-y-6 pb-12">
            <div>
              <h1 className="text-2xl font-bold mb-1">User Guide</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                A walkthrough of how to set up and use Work Manager, from your first sign-in to a
                weekly review routine.
              </p>
            </div>

            <div className="lg:hidden">
              <label htmlFor="help-section-select" className="sr-only">
                Jump to section
              </label>
              <select
                id="help-section-select"
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) scrollToSection(e.target.value);
                }}
                className={`w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-3 py-2 ${FOCUS_RING}`}
              >
                <option value="" disabled>
                  Jump to a section…
                </option>
                {TOC_SECTIONS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>

            <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
              <h2 className="text-lg font-semibold mb-1">Start here</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                The three essential first-session tasks — about 5 minutes total.
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                {START_HERE_TASKS.map((task) => (
                  <Link
                    key={task.href}
                    href={task.href}
                    className={`flex flex-col gap-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 px-4 py-3 text-sm transition ${FOCUS_RING}`}
                  >
                    <span className="font-medium text-blue-700 dark:text-blue-300">{task.label}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{task.time}</span>
                  </Link>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2 gap-3">
                  <span className="text-sm font-medium">
                    {doneCount}/{CHECKLIST_ITEMS.length} onboarding steps complete
                  </span>
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={handleContinue}
                      className={`text-sm text-blue-600 dark:text-blue-400 hover:underline rounded ${FOCUS_RING}`}
                    >
                      Continue
                    </button>
                    <button
                      onClick={resetProgress}
                      className={`text-sm text-gray-500 dark:text-gray-400 hover:underline rounded ${FOCUS_RING}`}
                    >
                      Reset progress
                    </button>
                  </div>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all"
                    style={{ width: `${(doneCount / CHECKLIST_ITEMS.length) * 100}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                  Progress is saved only in this browser.
                </p>
              </div>
            </section>

            <Section id="create-account" title="1. Create an account or sign in">
              <OrderedList
                items={[
                  "Open Work Manager.",
                  <>New users should select <strong>Sign up</strong>, enter an email address, and create a password of at least eight characters.</>,
                  <>Returning users can sign in with their email and password. If Google sign-in is configured, they can also choose <strong>Continue with Google</strong>.</>,
                  <>After authentication, Work Manager opens the <NavLink href="/homepage">Dashboard</NavLink>.</>,
                ]}
              />
              <p>
                If a session expires, sign in again. Use <strong>Log out</strong> at the bottom of
                the navigation menu when using a shared device.
              </p>
            </Section>

            <Section id="learn-navigation" title="2. Learn the navigation">
              <p>The sidebar is the main way to move around the site:</p>
              <BulletList
                items={[
                  <><NavLink href="/homepage">Dashboard</NavLink> — view job-search totals, pipeline progress, recent activity, application sources, and items that need follow-up.</>,
                  <><NavLink href="/applications">Applications</NavLink> — search, filter, update, select, or delete tracked applications.</>,
                  <><NavLink href="/applications/new">Add Application</NavLink> — import a job posting and save it as an application.</>,
                  <><NavLink href="/resume">Resume & Success Rate</NavLink> — upload a resume, review extracted information, generate job-search ideas, and monitor match performance.</>,
                  <><NavLink href="/settings">Settings</NavLink> — switch between light and dark mode.</>,
                  <><strong>Admin Panel</strong> — available only to administrators.</>,
                ]}
              />
              <p>On a phone or narrow screen, open the sidebar with the menu button in the upper-left corner.</p>
            </Section>

            <Section id="upload-resume" title="3. Upload a resume first">
              <p>
                Uploading a resume before adding jobs gives Work Manager the information it needs
                for match scores and personalized AI features.
              </p>
              <OrderedList
                items={[
                  <>Open <NavLink href="/resume">Resume & Success Rate</NavLink>.</>,
                  <>Under <strong>Upload Resume</strong>, choose a PDF, DOC, DOCX, or TXT file.</>,
                  <>Select <strong>Upload Resume</strong> and wait for parsing to finish.</>,
                  <>Review the extracted skills, experience, and education under <strong>Resume Details</strong>.</>,
                  <>If several resumes exist, use <strong>View Resume History</strong> to inspect them and note which one is marked <strong>Active</strong>.</>,
                ]}
              />
              <p>
                After applications have been added, this page also shows success rate, average
                match, top skills, and recommendations. Selecting <strong>Generate Job Suggestions</strong>{" "}
                produces role keywords that can be opened on supported job sites.
              </p>
            </Section>

            <Section id="add-application" title="4. Add the first application">
              <OrderedList
                items={[
                  <>Open <NavLink href="/applications/new">Add Application</NavLink>.</>,
                  <>Paste the public URL of a job posting and select <strong>Extract</strong>.</>,
                  "Review the extracted position, company, location, source, and other available details. Correct the editable fields when extraction is incomplete or inaccurate.",
                  <>Select <strong>Save Application</strong>.</>,
                ]}
              />
              <p>
                For better resume matching, summaries, interview preparation, and cover letters, use
                a posting with a complete job description. If extraction fails, check that the URL
                is reachable and still displays the posting, then try again.
              </p>
            </Section>

            <Section id="review-applications" title="5. Review and organize applications">
              <p>Open <NavLink href="/applications">Applications</NavLink> to manage the full list.</p>
              <BulletList
                items={[
                  "Search by company, position, or location.",
                  <>Filter by application status: <strong>Saved</strong>, <strong>Applied</strong>, <strong>Interviewing</strong>, <strong>Offer</strong>, <strong>Rejected</strong>, or <strong>Withdrawn</strong>.</>,
                  "Filter by work category and applied-date range.",
                  "Select a card to open its full details.",
                  "Use a card's status menu to move to any status, or its arrow to advance through the active pipeline quickly.",
                  <>Select <strong>Recalculate Matches</strong> after uploading a newer resume to refresh all resume-to-job scores.</>,
                ]}
              />
              <Warning>
                Use selection mode for bulk deletion. Review the selected cards carefully —
                deletion permanently removes their tracked records.
              </Warning>
              <p>
                Match badges are a prioritization aid: green indicates 70% or higher, yellow
                indicates 50–69%, and red indicates below 50%. A low score does not necessarily mean
                a user should skip the role; review the actual requirements and transferable
                experience.
              </p>
            </Section>

            <Section id="application-detail" title="6. Use an application detail page">
              <p>Select an application card to:</p>
              <OrderedList
                items={[
                  "Review the job details, original posting link, description, notes, source, salary, currency, and applied date when available.",
                  "Change the application's status as the hiring process progresses.",
                  "Generate a shorter AI job summary when a long description is present.",
                  <>Select <strong>Generate Suggestions</strong> under <strong>Interview Preparation Suggestions</strong> for technical, company, behavioral, skills, and interviewer-question guidance.</>,
                  <>Create a <strong>Custom Cover Letter</strong> when an active resume, job description, and AI service are available. Choose a tone, optionally add emphasis or a recipient, generate the draft, edit it, then select <strong>Save</strong> or copy it for use elsewhere.</>,
                ]}
              />
              <p>
                Always review AI-generated text for accuracy, tone, and unsupported claims before
                sending it to an employer. Save cover-letter edits before leaving the page.
              </p>
            </Section>

            <Section id="daily-workflow" title="Daily workflow">
              <OrderedList
                items={[
                  <>Check <strong>Dashboard → Needs Follow-up</strong> for applications that have remained in one stage for too long.</>,
                  "Follow up with the employer when appropriate, then update the application's status or notes.",
                  <>Add new jobs through <NavLink href="/applications/new">Add Application</NavLink> as soon as they are found.</>,
                  <>Review <strong>Recent Applications</strong> and advance statuses after submissions, interviews, offers, rejections, or withdrawals.</>,
                  "Open upcoming interview applications and generate or revisit preparation suggestions.",
                ]}
              />
              <p>
                Work Manager flags active applications based on time in their current status: Saved
                after 5 days, Applied after 7 days, Interviewing after 3 days, and Offer after 2
                days. Rejected and Withdrawn applications are treated as complete and are not
                flagged.
              </p>
            </Section>

            <Section id="weekly-review" title="Weekly review">
              <p>Once a week:</p>
              <OrderedList
                items={[
                  <>Review the dashboard&apos;s <strong>Application Pipeline</strong>, <strong>Activity Heatmap</strong>, and <strong>Top Sources</strong>.</>,
                  "Look for bottlenecks — for example, many applications but few interviews — and adjust the resume, target roles, or application strategy.",
                  "Use the resume page's success-rate analysis and recommendations.",
                  "Confirm every active application has the correct status.",
                  <>Upload a revised resume when needed, confirm the intended resume is active, and run <strong>Recalculate Matches</strong>.</>,
                ]}
              />
            </Section>

            <Section id="requirements" title="Feature requirements and expectations">
              <BulletList
                items={[
                  "Resume-based matching requires an uploaded active resume.",
                  "AI summaries, suggestions, job keywords, and cover letters depend on the AI service being enabled.",
                  "Job summaries and interview suggestions need a useful job description.",
                  "Cover-letter generation needs both an active resume and a job description.",
                  "Theme preference is stored in the browser, so it may differ across devices or browser profiles.",
                  "Dashboard and application data refresh automatically, but a manual page refresh can be used if a recent change is not yet visible.",
                ]}
              />
            </Section>

            <Section id="troubleshooting" title="Troubleshooting checklist">
              <BulletList
                items={[
                  <><strong>Cannot sign up:</strong> confirm the email is valid, both passwords match, and the password has at least eight characters.</>,
                  <><strong>Resume will not upload:</strong> use PDF, DOC, DOCX, or TXT and try a smaller or uncorrupted file.</>,
                  <><strong>No match score:</strong> upload an active resume, ensure the application has a job description, then select <strong>Recalculate Matches</strong>.</>,
                  <><strong>Job extraction is incomplete:</strong> confirm the job URL is public and review all extracted details before saving.</>,
                  <><strong>AI action is unavailable:</strong> confirm a resume and job description are present where required; the AI service may also be disabled.</>,
                  <><strong>Navigation is hidden on mobile:</strong> use the menu button in the upper-left corner.</>,
                ]}
              />
              <Warning>
                <strong>An application needs correction:</strong> open its detail page and update
                the controls that are available. If a field is not editable there, deleting the
                record and importing the corrected posting again will permanently remove the
                original tracked record.
              </Warning>
            </Section>

            <section id="checklist" className="scroll-mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">New-user completion checklist</h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {doneCount} / {CHECKLIST_ITEMS.length} complete
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-4 overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all"
                  style={{ width: `${(doneCount / CHECKLIST_ITEMS.length) * 100}%` }}
                />
              </div>
              <ul className="space-y-2">
                {CHECKLIST_ITEMS.map((item) => (
                  <li key={item.id}>
                    <label className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={completed[item.id] ?? false}
                        onChange={() => toggleItem(item.id)}
                        className={`h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-500 ${FOCUS_RING}`}
                      />
                      <span className={completed[item.id] ? "line-through text-gray-400 dark:text-gray-500" : ""}>
                        {item.label}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <aside className="hidden lg:block w-56 shrink-0 sticky top-8 self-start">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2 px-2">
              On this page
            </p>
            <nav className="space-y-1 text-sm">
              {TOC_SECTIONS.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(s.id);
                  }}
                  className={`block px-2 py-1 rounded text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 ${FOCUS_RING}`}
                >
                  {s.title}
                </a>
              ))}
            </nav>
          </aside>
        </div>
      </main>
    </div>
  );
}
