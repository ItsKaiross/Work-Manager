import { useEffect, useState } from "react";
import { getApplications } from "@/lib/api";
import { JobApplication } from "@/types/job_application";

export function useApplications() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getApplications()
      .then(setApplications)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { applications, loading, error };
}