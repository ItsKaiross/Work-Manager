import { useEffect, useState, useCallback } from "react";
import { getApplications } from "@/lib/api";
import { JobApplication } from "@/types/job_application";

export function useApplications(autoRefreshInterval = 30000) {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchApplications = useCallback(async () => {
    try {
      const data = await getApplications();
      setApplications(data);
      setLastUpdated(new Date());
      setError("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(() => {
    setLoading(true);
    fetchApplications();
  }, [fetchApplications]);

  useEffect(() => {
    fetchApplications();

    // Set up auto-refresh interval
    if (autoRefreshInterval > 0) {
      const interval = setInterval(fetchApplications, autoRefreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchApplications, autoRefreshInterval]);

  return { applications, loading, error, refresh, lastUpdated };
}
