import { useEffect, useState, useCallback, useRef } from "react";
import { getApplications } from "@/lib/api";
import { JobApplication } from "@/types/job_application";

export function useApplications(autoRefreshInterval = 30000) {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const isInitialMount = useRef(true);

  const fetchApplications = useCallback(async (showLoading = true) => {
    try {
      // Only show loading state on initial load or manual refresh
      if (showLoading) {
        setLoading(true);
      }
      
      const data = await getApplications();
      setApplications(data);
      setLastUpdated(new Date());
      setError("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);

  const refresh = useCallback(() => {
    setLoading(true);
    fetchApplications(true);
  }, [fetchApplications]);

  useEffect(() => {
    // Initial fetch with loading state
    fetchApplications(true);
    isInitialMount.current = false;

    // Set up auto-refresh interval (background updates without loading state)
    if (autoRefreshInterval > 0) {
      const interval = setInterval(() => {
        // Background refresh without showing loading state
        fetchApplications(false);
      }, autoRefreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchApplications, autoRefreshInterval]);

  return { applications, loading, error, refresh, lastUpdated };
}
