"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/layout/Sidebar";
import { useSessionMonitor } from "@/hooks/useSessionMonitor";
import { getAuthToken } from "@/lib/auth";

const CHECKLIST_STORAGE_KEY = "onboardingChecklist";

const CHECKLIST_ITEMS = [
  "Account created and sign-in completed",
  "Sidebar navigation understood",
  "Resume uploaded and parsed details reviewed",
  "First job posting extracted, checked, and saved",
  "Application status changed successfully",
  "Search or a filter used on the Applications page",
  "Dashboard and follow-up area reviewed",
  "Match score or its prerequisites understood",
  "Interview suggestions or cover-letter workflow located",
  "Light or dark theme selected",
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
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

export default function HelpPage() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [completed, setCompleted] = useState<boolean[]>(() => CHECKLIST_ITEMS.map(() => false));

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
    const saved = localStorage.getItem(CHECKLIST_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === CHECKLIST_ITEMS.length) {
          setCompleted(parsed);
        }
      } catch {
        // ignore malformed storage
      }
    }
  }, []);

  function toggleItem(index: number) {
    const next = completed.map((v, i) => (i === index ? !v : v));
    setCompleted(next);
    localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(next));
  }

  if (!checked) return null;

  const doneCount = completed.filter(Boolean).length;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <main className="flex-1 p-4 pt-16 md:p-8 overflow-y-auto">
        <div className="max-w-3xl space-y-6 pb-12">
          <div>
            <h1 className="text-2xl font-bold mb-1">User Guide</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              A walkthrough of how to set up and use Work Manager, from your first sign-in to a
              weekly review routine.
            </p>
          </div>

          <Section title="1. Create an account or sign in">
            <OrderedList
              items={[
                "Open Work Manager.",
                <>New users should select <strong>Sign up</strong>, enter an email address, and create a password of at least eight characters.</>,
                <>Returning users can sign in with their email and password. If Google sign-in is configured, they can also choose <strong>Continue with Google</strong>.</>,
                <>After authentication, Work Manager opens the <strong>Dashboard</strong>.</>,
              ]}
            />
            <p>
              If a session expires, sign in again. Use <strong>Log out</strong> at the bottom of
              the navigation menu when using a shared device.
            </p>
          </Section>

          <Section title="2. Learn the navigation">
            <p>The sidebar is the main way to move around the site:</p>
            <BulletList
              items={[
                <><strong>Dashboard</strong> — view job-search totals, pipeline progress, recent activity, application sources, and items that need follow-up.</>,
                <><strong>Applications</strong> — search, filter, update, select, or delete tracked applications.</>,
                <><strong>Add Application</strong> — import a job posting and save it as an application.</>,
                <><strong>Resume & Success Rate</strong> — upload a resume, review extracted information, generate job-search ideas, and monitor match performance.</>,
                <><strong>Settings</strong> — switch between light and dark mode.</>,
                <><strong>Admin Panel</strong> — available only to administrators.</>,
              ]}
            />
            <p>On a phone or narrow screen, open the sidebar with the menu button in the upper-left corner.</p>
          </Section>

          <Section title="3. Upload a resume first">
            <p>
              Uploading a resume before adding jobs gives Work Manager the information it needs
              for match scores and personalized AI features.
            </p>
            <OrderedList
              items={[
                <>Open <strong>Resume & Success Rate</strong>.</>,
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

          <Section title="4. Add the first application">
            <OrderedList
              items={[
                <>Open <strong>Add Application</strong>.</>,
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

          <Section title="5. Review and organize applications">
            <p>Open <strong>Applications</strong> to manage the full list.</p>
            <BulletList
              items={[
                "Search by company, position, or location.",
                <>Filter by application status: <strong>Saved</strong>, <strong>Applied</strong>, <strong>Interviewing</strong>, <strong>Offer</strong>, <strong>Rejected</strong>, or <strong>Withdrawn</strong>.</>,
                "Filter by work category and applied-date range.",
                "Select a card to open its full details.",
                "Use a card's status menu to move to any status, or its arrow to advance through the active pipeline quickly.",
                "Use selection mode for bulk deletion. Review the selected cards carefully because deletion removes their tracked records.",
                <>Select <strong>Recalculate Matches</strong> after uploading a newer resume to refresh all resume-to-job scores.</>,
              ]}
            />
            <p>
              Match badges are a prioritization aid: green indicates 70% or higher, yellow
              indicates 50–69%, and red indicates below 50%. A low score does not necessarily mean
              a user should skip the role; review the actual requirements and transferable
              experience.
            </p>
          </Section>

          <Section title="6. Use an application detail page">
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

          <Section title="Daily workflow">
            <OrderedList
              items={[
                <>Check <strong>Dashboard → Needs Follow-up</strong> for applications that have remained in one stage for too long.</>,
                "Follow up with the employer when appropriate, then update the application's status or notes.",
                <>Add new jobs through <strong>Add Application</strong> as soon as they are found.</>,
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

          <Section title="Weekly review">
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

          <Section title="Feature requirements and expectations">
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

          <Section title="Troubleshooting checklist">
            <BulletList
              items={[
                <><strong>Cannot sign up:</strong> confirm the email is valid, both passwords match, and the password has at least eight characters.</>,
                <><strong>Resume will not upload:</strong> use PDF, DOC, DOCX, or TXT and try a smaller or uncorrupted file.</>,
                <><strong>No match score:</strong> upload an active resume, ensure the application has a job description, then select <strong>Recalculate Matches</strong>.</>,
                <><strong>Job extraction is incomplete:</strong> confirm the job URL is public and review all extracted details before saving.</>,
                <><strong>AI action is unavailable:</strong> confirm a resume and job description are present where required; the AI service may also be disabled.</>,
                <><strong>An application needs correction:</strong> open its detail page and update the controls that are available. If a field is not editable there, delete the record and import the corrected posting again.</>,
                <><strong>Navigation is hidden on mobile:</strong> use the menu button in the upper-left corner.</>,
              ]}
            />
          </Section>

          <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
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
              {CHECKLIST_ITEMS.map((item, i) => (
                <li key={item}>
                  <label className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={completed[i]}
                      onChange={() => toggleItem(i)}
                      className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-500"
                    />
                    <span className={completed[i] ? "line-through text-gray-400 dark:text-gray-500" : ""}>
                      {item}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}
