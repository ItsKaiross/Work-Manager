"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/layout/Sidebar";
import { extractJobDetails, createApplication } from "@/lib/api";
import { useSessionMonitor } from "@/hooks/useSessionMonitor";
import { getAuthToken } from "@/lib/auth";

const CURRENCY_OPTIONS = ["USD", "EUR", "GBP", "JPY", "CNY", "INR", "AUD", "CAD", "SGD", "PHP", "MYR", "THB", "VND", "IDR"];

export default function NewApplicationPage() {
  const [url, setUrl] = useState("");
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checked, setChecked] = useState(false);
  const router = useRouter();
  
  useSessionMonitor();

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push("/");
    } else {
      setChecked(true);
    }
  }, [router]);

  if (!checked) return null;

  async function handleExtract() {
    setError("");
    setLoading(true);
    try {
      const data = await extractJobDetails(url);
      setForm({ ...data, job_url: url });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      await createApplication(form);
      router.push("/applications");
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Add Application</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="flex gap-2 mb-6">
          <input
            className="flex-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white rounded-lg px-4 py-2"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste job posting URL"
          />
          <button
            onClick={handleExtract}
            disabled={loading || !url}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            {loading ? "Extracting..." : "Extract"}
          </button>
        </div>

        {form && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
            className="flex flex-col gap-3"
          >
            <input
              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white rounded-lg px-4 py-2"
              value={form.position ?? ""}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
              placeholder="Position"
            />
            <input
              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white rounded-lg px-4 py-2"
              value={form.company ?? ""}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              placeholder="Company"
            />
            <input
              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white rounded-lg px-4 py-2"
              value={form.location ?? ""}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Location"
            />
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Currency</label>
              <select
                className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white rounded-lg px-4 py-2 w-full"
                value={form.currency ?? "USD"}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
              >
                {CURRENCY_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            {form.source && (
              <div className="border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2">
                <label className="text-xs text-gray-500 dark:text-gray-400">Source</label>
                <p className="text-sm font-medium">{form.source}</p>
              </div>
            )}
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            >
              Save Application
            </button>
          </form>
        )}
      </div>
      </main>
    </div>
  );
}