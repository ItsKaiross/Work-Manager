"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/layout/Sidebar";
import { useSessionMonitor } from "@/hooks/useSessionMonitor";
import { getAuthToken } from "@/lib/auth";
import { useTheme } from "@/contexts/ThemeContext";

export default function SettingsPage() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const { theme, toggleTheme } = useTheme();

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

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <main className="flex-1 p-4 pt-16 md:p-8 overflow-y-auto">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-bold mb-8">Settings</h1>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
            <h2 className="text-lg font-semibold mb-4">Appearance</h2>

            <div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <p className="font-medium">Theme</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Choose between light and dark mode
                </p>
              </div>
              <button
                onClick={toggleTheme}
                aria-label="Toggle dark mode"
                className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
                  theme === "dark" ? "bg-blue-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    theme === "dark" ? "translate-x-9" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch gap-4 mt-4">
              <div
                className={`flex-1 p-4 rounded-lg border-2 cursor-pointer transition ${
                  theme === "light"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-300 dark:border-gray-600"
                }`}
                onClick={() => theme === "dark" && toggleTheme()}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Light Mode</span>
                  <span className="text-2xl">☀️</span>
                </div>
                <div className="h-12 bg-white rounded border border-gray-200 flex items-center px-3">
                  <div className="w-full h-2 bg-gray-200 rounded"></div>
                </div>
              </div>

              <div
                className={`flex-1 p-4 rounded-lg border-2 cursor-pointer transition ${
                  theme === "dark"
                    ? "border-blue-500 bg-blue-900/20"
                    : "border-gray-300 dark:border-gray-600"
                }`}
                onClick={() => theme === "light" && toggleTheme()}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Dark Mode</span>
                  <span className="text-2xl">🌙</span>
                </div>
                <div className="h-12 bg-gray-800 rounded border border-gray-700 flex items-center px-3">
                  <div className="w-full h-2 bg-gray-600 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
