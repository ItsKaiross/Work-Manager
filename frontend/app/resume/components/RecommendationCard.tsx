"use client";
import Link from "next/link";

interface RecommendationAction {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface RecommendationCardProps {
  text: string;
  action?: RecommendationAction;
}

export default function RecommendationCard({ text, action }: RecommendationCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex items-start gap-3">
      <svg className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-gray-700 dark:text-gray-300">{text}</p>
        {action &&
          (action.href ? (
            <Link
              href={action.href}
              className="inline-block mt-2 text-sm font-medium text-blue-700 dark:text-blue-400 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 rounded"
            >
              {action.label} →
            </Link>
          ) : (
            <button
              onClick={action.onClick}
              className="mt-2 text-sm font-medium text-blue-700 dark:text-blue-400 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 rounded"
            >
              {action.label} →
            </button>
          ))}
      </div>
    </div>
  );
}
