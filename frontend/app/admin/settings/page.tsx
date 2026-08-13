"use client";
import { useTheme } from "@/contexts/ThemeContext";

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">Settings</h1>

      {/* Appearance Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 transition-colors">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Appearance</h2>
        
        <div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <p className="font-medium text-gray-800 dark:text-white">Theme</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Choose between light and dark mode
            </p>
          </div>
          <button
            onClick={toggleTheme}
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

        <div className="flex items-center gap-4 mt-4">
          <div
            className={`flex-1 p-4 rounded-lg border-2 cursor-pointer transition ${
              theme === "light"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 dark:border-gray-600"
            }`}
            onClick={() => theme === "dark" && toggleTheme()}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-800">Light Mode</span>
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
              <span className="font-medium text-gray-800 dark:text-white">Dark Mode</span>
              <span className="text-2xl">🌙</span>
            </div>
            <div className="h-12 bg-gray-800 rounded border border-gray-700 flex items-center px-3">
              <div className="w-full h-2 bg-gray-600 rounded"></div>
            </div>
          </div>
        </div>
      </div>

      {/* System Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
          System Information
        </h2>
        
        <div className="space-y-3">
          <div className="flex justify-between py-2">
            <span className="text-gray-600 dark:text-gray-400">Application Version</span>
            <span className="font-medium text-gray-800 dark:text-white">1.0.0</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600 dark:text-gray-400">Current Theme</span>
            <span className="font-medium text-gray-800 dark:text-white capitalize">
              {theme}
            </span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600 dark:text-gray-400">Last Updated</span>
            <span className="font-medium text-gray-800 dark:text-white">
              {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Actions Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mt-6 transition-colors">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
          Admin Actions
        </h2>
        
        <div className="space-y-3">
          <button className="w-full px-4 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition text-left">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Clear Cache</p>
                <p className="text-sm opacity-75">Remove temporary data</p>
              </div>
              <span>🗑️</span>
            </div>
          </button>

          <button className="w-full px-4 py-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition text-left">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Export Data</p>
                <p className="text-sm opacity-75">Download system data</p>
              </div>
              <span>📥</span>
            </div>
          </button>

          <button className="w-full px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition text-left">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">System Maintenance</p>
                <p className="text-sm opacity-75">Run system maintenance tasks</p>
              </div>
              <span>⚠️</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
