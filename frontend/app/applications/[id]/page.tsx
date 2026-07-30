"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/app/components/layout/Sidebar";
import { JobApplication } from "@/types/job_application";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function authHeader(): Record<string, string> {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [app, setApp] = useState<JobApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/");
      return;
    }

    fetch(`${API_URL}/applications/${params.id}`, {
      headers: { ...authHeader() },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Application not found");
        return res.json();
      })
      .then(setApp)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [params.id, router]);

  async function handleDelete() {
    if (!confirm("Delete this application?")) return;

    const res = await fetch(`${API_URL}/applications/${params.id}`, {
      method: "DELETE",
      headers: { ...authHeader() },
    });

    if (res.ok) {
      router.push("/applications");
    } else {
      setError("Failed to delete application");
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 max-w-2xl">
        {loading && <p className="text-gray-500">Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {app && (
          <>
            <h1 className="text-2xl font-bold mb-2">{app.position}</h1>
            <p className="text-gray-500 mb-6">
              {app.company}
              {app.location ? ` · ${app.location}` : ""}
            </p>

            <div className="space-y-3 mb-8">
              <p><span className="font-medium">Status:</span> {app.status}</p>
              {app.salary_range && (
                <p><span className="font-medium">Salary:</span> {app.salary_range}</p>
              )}
              {app.job_url && (
                <p>
                  <span className="font-medium">Posting:</span>{" "}
                  <a href={app.job_url} target="_blank" className="text-blue-600 hover:underline">
                    View original
                  </a>
                </p>
              )}
              {app.notes && (
                <p><span className="font-medium">Notes:</span> {app.notes}</p>
              )}
            </div>

            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
            >
              Delete Application
            </button>
          </>
        )}
      </main>
    </div>
  );
}