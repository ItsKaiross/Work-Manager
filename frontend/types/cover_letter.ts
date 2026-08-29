export type CoverLetterTone = "professional" | "warm" | "concise";
export type CoverLetterStatus = "draft" | "final";

export interface SupportingPoint {
  claim: string;
  resume_evidence: string;
}

export interface CoverLetterSummary {
  id: number;
  application_id: number;
  tone: CoverLetterTone;
  status: CoverLetterStatus;
  created_at: string;
  updated_at?: string | null;
}

export interface CoverLetter extends CoverLetterSummary {
  content: string;
  supporting_points: SupportingPoint[];
  warnings: string[];
  resume_id: number;
  emphasis?: string | null;
  recipient_name?: string | null;
  model?: string | null;
  prompt_version?: string | null;
}
