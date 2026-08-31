"use client";
import { JobApplication } from "@/types/job_application";

const CURRENCY_OPTIONS = ["USD", "EUR", "GBP", "JPY", "CNY", "INR", "AUD", "CAD", "SGD", "PHP", "MYR", "THB", "VND", "IDR"];

interface OverviewTabProps {
  app: JobApplication;
  currencySaving: boolean;
  onCurrencyChange: (currency: string) => void;
}

function levelLabel(pct: number | null | undefined): string | null {
  if (pct === null || pct === undefined) return null;
  if (pct >= 80) return "strong";
  if (pct >= 50) return "moderate";
  return "limited";
}

function matchExplanation(app: JobApplication): string | null {
  const skill = levelLabel(app.skill_match);
  const experience = levelLabel(app.experience_match);
  if (!skill && !experience) return null;
  const parts: string[] = [];
  if (skill) parts.push(`${skill} skills match`);
  if (experience) parts.push(`${experience} experience match`);
  return parts.join(", ").replace(/^./, (c) => c.toUpperCase());
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</span>
      <div className="text-gray-900 dark:text-white mt-0.5">{children}</div>
    </div>
  );
}

export default function OverviewTab({ app, currencySaving, onCurrencyChange }: OverviewTabProps) {
  const explanation = matchExplanation(app);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold mb-4">Overview</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {app.salary_range && (
          <Field label="Salary">
            <div className="flex items-center gap-2 flex-wrap">
              <span>{app.salary_range}</span>
              <select
                value={app.currency || "USD"}
                onChange={(e) => onCurrencyChange(e.target.value)}
                disabled={currencySaving}
                aria-label="Currency"
                className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white rounded-lg px-2 py-1 text-sm disabled:opacity-50"
              >
                {CURRENCY_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {currencySaving && <span className="text-xs text-gray-400">Saving…</span>}
            </div>
          </Field>
        )}

        {app.applied_date && (
          <Field label="Applied date">
            {new Date(app.applied_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </Field>
        )}

        {app.source && <Field label="Source">{app.source}</Field>}

        {app.location && <Field label="Location">{app.location}</Field>}

        <Field label="Added">
          {new Date(app.created_at).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </Field>

        {app.updated_at && app.updated_at !== app.created_at && (
          <Field label="Last updated">
            {new Date(app.updated_at).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </Field>
        )}

        {app.match_percentage !== null && app.match_percentage !== undefined && (
          <Field label="Resume match">
            <div className="flex items-baseline gap-2">
              <span className="font-semibold">{Math.round(app.match_percentage)}%</span>
              {explanation && <span className="text-sm text-gray-500 dark:text-gray-400">{explanation}</span>}
            </div>
          </Field>
        )}
      </div>
    </div>
  );
}
