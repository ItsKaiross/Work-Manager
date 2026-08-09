export type ApplicationStatus =
  | "saved"
  | "applied"
  | "interviewing"
  | "offer"
  | "rejected"
  | "withdrawn";

export interface JobApplication {
  id: number;
  company: string;
  position: string;
  job_url?: string | null;
  location?: string | null;
  salary_range?: string | null;
  currency?: string | null;
  status: ApplicationStatus;
  source?: string | null;
  notes?: string | null;
  description?: string | null;
  applied_date?: string | null;
  created_at: string;
  updated_at?: string | null;
  match_percentage?: number | null;
  skill_match?: number | null;
  experience_match?: number | null;
  needs_follow_up?: boolean | null;
  days_since_update?: number | null;
}
