"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import ApplicationCard from "@/components/applications/ApplicationCard";
import StatusFilter from "@/components/applications/StatusFilter";
import { useApplications } from "@/hooks/useApplications";
import { JobApplication } from "@/types/job_application";

type Status = JobApplication["status"] | "all";

export default function ApplicationsPage() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const { applications, loading, error } = useApplications();
  const [activeFilter, setActiveFilter] = useState<Status>("all");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/");
    } else {
      setChecked(true);
    }
  }, [router]);

  if (!checked) return null;

  const filtered = activeFilter === "all"
    ? applications
    : applications.filter((a) => a.status === activeFilter);

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">All Applications</h1>

        {loading && <p className="text-gray-500">Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && (
          <>
            <StatusFilter
              applications={applications}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
            />

            {filtered.length === 0 ? (
              <p className="text-gray-500">No applications match this filter.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((app) => (
                  <ApplicationCard key={app.id} application={app} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}