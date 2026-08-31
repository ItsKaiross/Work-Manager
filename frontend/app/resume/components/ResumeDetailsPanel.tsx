"use client";
import { useState } from "react";
import { Resume } from "@/types/resume";

const SKILLS_PREVIEW_COUNT = 12;

interface ResumeDetailsPanelProps {
  resume: Resume;
}

function completeness(resume: Resume): { percent: number; message: string } {
  const checks = [
    { done: (resume.skills?.length ?? 0) >= 3, message: "add a few more skills" },
    { done: !!resume.experience_years, message: "add your years of experience" },
    { done: !!resume.education_level, message: "add your education level" },
    { done: (resume.job_keywords?.length ?? 0) > 0, message: "generate job suggestions to get tailored search terms" },
  ];
  const done = checks.filter((c) => c.done).length;
  const percent = Math.round((done / checks.length) * 100);
  const missing = checks.find((c) => !c.done);
  const message = missing ? `Resume profile: ${percent}% complete — ${missing.message} to improve recommendations.` : `Resume profile: ${percent}% complete.`;
  return { percent, message };
}

export default function ResumeDetailsPanel({ resume }: ResumeDetailsPanelProps) {
  const [showAllSkills, setShowAllSkills] = useState(false);
  const { percent, message } = completeness(resume);
  const skills = resume.skills || [];
  const visibleSkills = showAllSkills ? skills : skills.slice(0, SKILLS_PREVIEW_COUNT);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-lg font-semibold">Resume details</h2>
        {resume.is_active && (
          <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs font-semibold">
            Active
          </span>
        )}
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
          <span>{message}</span>
        </div>
        <div
          className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden"
          role="progressbar"
          aria-label="Resume profile completeness"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="h-full bg-blue-500" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Filename</p>
          <p className="text-gray-900 dark:text-white mt-0.5 truncate">{resume.filename}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Uploaded</p>
          <p className="text-gray-900 dark:text-white mt-0.5">
            {new Date(resume.upload_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
        {resume.experience_years !== undefined && resume.experience_years !== null && (
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Experience</p>
            <p className="text-gray-900 dark:text-white mt-0.5">{resume.experience_years} years</p>
          </div>
        )}
        {resume.education_level && (
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Education</p>
            <p className="text-gray-900 dark:text-white mt-0.5">{resume.education_level}</p>
          </div>
        )}
      </div>

      {skills.length > 0 && (
        <div className="mb-2">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Skills</p>
          <div className="flex flex-wrap gap-2">
            {visibleSkills.map((skill, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full text-xs"
              >
                {skill}
              </span>
            ))}
          </div>
          {skills.length > SKILLS_PREVIEW_COUNT && (
            <button
              onClick={() => setShowAllSkills((v) => !v)}
              className="mt-2 text-xs font-medium text-blue-700 dark:text-blue-400 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 rounded"
            >
              {showAllSkills ? "Show fewer" : `Show all ${skills.length}`}
            </button>
          )}
        </div>
      )}

      <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
        Something look wrong? Update the source file and re-upload it — extracted details refresh automatically.
      </p>
    </div>
  );
}
