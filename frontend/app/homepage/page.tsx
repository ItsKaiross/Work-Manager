"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/app/components/layout/Sidebar";
import ApplicationCard from "@/app/applications/ApplicationCard";
import { useApplications } from "@/hooks/useApplication";

export default function Homepage() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const { applications, loading, error } = useApplications();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/");
    } else {
      setChecked(true);
    }
  }, [router]);

  if (!checked) return null;

  const recent = applications.slice(0, 3);
  const counts = {
    total: applications.length,
    applied: applications.filter((a) => a.status === "applied").length,
    interviewing: applications.filter((a) => a.status === "interviewing").length,
    offer: applications.filter((a) => a.status === "offer").length,
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <Link
            href="/applications/new"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm font-medium"
          >
            + Add Application
          </Link>
        </div>

        {loading && <p className="text-gray-500">Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <p className="text-2xl font-bold">{counts.total}</p>
                <p className="text-sm text-gray-500">Total</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <p className="text-2xl font-bold">{counts.applied}</p>
                <p className="text-sm text-gray-500">Applied</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <p className="text-2xl font-bold">{counts.interviewing}</p>
                <p className="text-sm text-gray-500">Interviewing</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <p className="text-2xl font-bold">{counts.offer}</p>
                <p className="text-sm text-gray-500">Offers</p>
              </div>
            </div>

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Recent Applications</h2>
              <Link href="/applications" className="text-sm text-blue-600 hover:underline">
                View all →
              </Link>
            </div>

            {recent.length === 0 ? (
              <p className="text-gray-500">No applications yet. Add your first one!</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recent.map((app) => (
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