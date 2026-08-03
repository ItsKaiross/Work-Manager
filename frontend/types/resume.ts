export interface Resume {
  id: number;
  user_id: number;
  filename: string;
  file_path: string;
  file_size: number;
  upload_date: string;
  parsed_data?: Record<string, any>;
  skills?: string[];
  experience_years?: number;
  education_level?: string;
  is_active: boolean;
}

export interface ResumeMatchScore {
  id: number;
  resume_id: number;
  application_id: number;
  match_percentage: number;
  skill_match: number;
  experience_match: number;
  calculated_at: string;
}

export interface ResumeAnalysis {
  resume_id: number;
  total_applications: number;
  matched_applications: number;
  average_match_percentage: number;
  success_rate: number;
  top_matching_skills: string[];
  recommendations: string[];
}
