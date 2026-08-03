import { useState, useEffect } from "react";
import { getAuthToken } from "@/lib/auth";
import { Resume, ResumeAnalysis } from "@/types/resume";

const API_URL = "http://localhost:8000";

export function useResume(resumeId?: number) {
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (resumeId) {
      fetchResume();
    }
  }, [resumeId]);

  const fetchResume = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/api/resumes/${resumeId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch resume");
      }

      const data = await response.json();
      setResume(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return { resume, loading, error, refresh: fetchResume };
}

export function useActiveResume() {
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActiveResume = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/api/resumes/active`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 404) {
        setResume(null);
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch active resume");
      }

      const data = await response.json();
      setResume(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveResume();
  }, []);

  return { resume, loading, error, refresh: fetchActiveResume };
}

export function useResumeAnalysis(resumeId?: number) {
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = async () => {
    if (!resumeId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/api/resumes/${resumeId}/analysis`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch resume analysis");
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (resumeId) {
      fetchAnalysis();
    }
  }, [resumeId]);

  return { analysis, loading, error, refresh: fetchAnalysis };
}

export async function uploadResume(
  file: File,
  skills: string,
  experienceYears?: number,
  educationLevel?: string
): Promise<{ message: string; resume: Resume; applications_matched: number }> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("skills", skills);
  
  if (experienceYears !== undefined) {
    formData.append("experience_years", experienceYears.toString());
  }
  
  if (educationLevel) {
    formData.append("education_level", educationLevel);
  }

  const token = getAuthToken();
  const response = await fetch(`${API_URL}/api/resumes/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to upload resume");
  }

  return response.json();
}

export async function updateResume(
  resumeId: number,
  skills?: string,
  experienceYears?: number,
  educationLevel?: string
): Promise<Resume> {
  const formData = new FormData();
  
  if (skills !== undefined) {
    formData.append("skills", skills);
  }
  
  if (experienceYears !== undefined) {
    formData.append("experience_years", experienceYears.toString());
  }
  
  if (educationLevel !== undefined) {
    formData.append("education_level", educationLevel);
  }

  const token = getAuthToken();
  const response = await fetch(`${API_URL}/api/resumes/${resumeId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to update resume");
  }

  return response.json();
}

export async function deleteResume(resumeId: number): Promise<void> {
  const token = getAuthToken();
  const response = await fetch(`${API_URL}/api/resumes/${resumeId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to delete resume");
  }
}
