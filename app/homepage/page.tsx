"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-4xl w-full px-8 text-center">
        <h1 className="text-5xl font-bold text-gray-900">
          Work Manager
        </h1>

        <p className="mt-6 text-lg text-gray-600">
          Organize your projects, manage your tasks, and stay productive
          wherever you are.
        </p>

        <div className="mt-10 flex justify-center gap-4">
          <Link
            href="/login"
            className="px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
          >
            Login
          </Link>

          <Link
            href="/signup"
            className="px-6 py-3 rounded-lg border border-blue-600 text-blue-600 font-medium hover:bg-blue-50 transition"
          >
            Sign Up
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-20">
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800">
              📋 Task Management
            </h2>
            <p className="mt-2 text-gray-600">
              Create, edit, and organize your daily tasks in one place.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800">
              📅 Scheduling
            </h2>
            <p className="mt-2 text-gray-600">
              Keep track of deadlines and upcoming work with ease.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800">
              📈 Productivity
            </h2>
            <p className="mt-2 text-gray-600">
              Stay focused and monitor your progress across all your projects.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}