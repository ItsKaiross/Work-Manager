import { JobApplication } from "@/types/job_application";

export const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "Video Editor": ["video editor", "video editing", "video production"],
  "Full Stack": ["full stack", "full-stack", "fullstack"],
  Frontend: ["frontend", "front-end", "front end", "react developer", "vue developer", "angular developer", "ui developer"],
  Backend: ["backend", "back-end", "back end", "api developer", "server-side"],
  Mobile: ["ios developer", "android developer", "mobile developer", "react native", "flutter developer"],
  Data: ["data scientist", "data analyst", "data engineer", "machine learning", "ml engineer", "ai engineer"],
  DevOps: ["devops", "site reliability", "sre", "platform engineer", "infrastructure engineer"],
  Design: ["ui/ux", "ux designer", "ui designer", "product designer", "graphic designer"],
  Product: ["product manager", "product owner"],
  QA: ["qa engineer", "quality assurance", "test engineer", "sdet"],
};

export const UNCATEGORIZED = "Other";

// Order matters: more specific categories (e.g. "Full Stack") are checked
// before ones they could otherwise be mistaken for (e.g. "Frontend").
export function getJobCategory(app: Pick<JobApplication, "position" | "description">): string {
  const haystack = `${app.position} ${app.description ?? ""}`.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => haystack.includes(kw))) {
      return category;
    }
  }

  return UNCATEGORIZED;
}
