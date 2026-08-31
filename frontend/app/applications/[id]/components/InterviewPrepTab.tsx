"use client";
import AiPanel from "./AiPanel";

interface Suggestions {
  technical_prep?: string[];
  company_research?: string[];
  behavioral_prep?: string[];
  skills_to_focus?: string[];
  questions_to_ask?: string[];
}

interface InterviewPrepTabProps {
  suggestions: Suggestions | null;
  loadingSuggestions: boolean;
  suggestionsError: string;
  suggestionsGeneratedAt: Date | null;
  onGenerateSuggestions: () => void;
}

const GROUPS: { key: keyof Suggestions; label: string; icon: string }[] = [
  { key: "technical_prep", label: "Technical Prep", icon: "🔧" },
  { key: "company_research", label: "Company Research", icon: "🏢" },
  { key: "behavioral_prep", label: "Behavioral Prep", icon: "💬" },
  { key: "skills_to_focus", label: "Skills to Focus", icon: "🎯" },
  { key: "questions_to_ask", label: "Questions to Ask", icon: "❓" },
];

export default function InterviewPrepTab({
  suggestions,
  loadingSuggestions,
  suggestionsError,
  suggestionsGeneratedAt,
  onGenerateSuggestions,
}: InterviewPrepTabProps) {
  return (
    <AiPanel
      icon={
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      }
      title="Interview Preparation"
      description="Generate personalized interview prep based on the job description and your resume."
      hasContent={!!suggestions}
      generating={loadingSuggestions}
      error={suggestionsError}
      lastGeneratedAt={suggestionsGeneratedAt}
      generateLabel="Generate Suggestions"
      onGenerate={onGenerateSuggestions}
    >
      {suggestions && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {GROUPS.map(({ key, label, icon }) => {
            const items = suggestions[key];
            if (!items || items.length === 0) return null;
            return (
              <div key={key} className="bg-gray-50 dark:bg-gray-900/40 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                  <span aria-hidden="true">{icon}</span> {label}
                </h3>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  {items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </AiPanel>
  );
}
