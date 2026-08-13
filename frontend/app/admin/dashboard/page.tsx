"use client";
import { useEffect, useState } from "react";
import { getDashboardStats, DashboardStats, getSystemHealth, SystemHealth } from "@/lib/admin-api";

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [healthError, setHealthError] = useState(false);

  useEffect(() => {
    loadStats();
    loadHealth();
  }, []);

  async function loadStats() {
    try {
      setLoading(true);
      const data = await getDashboardStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadHealth() {
    try {
      const data = await getSystemHealth();
      setHealth(data);
      setHealthError(false);
    } catch (err: any) {
      setHealthError(true);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-gray-600 dark:text-gray-400">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-500 text-center">
          <p className="text-lg font-semibold mb-2">Error loading dashboard</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">
        Admin Dashboard
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={stats?.total_users || 0}
          icon="👥"
          color="bg-blue-500"
        />
        <StatCard
          title="Active Users"
          value={stats?.active_users || 0}
          icon="✅"
          color="bg-green-500"
        />
        <StatCard
          title="Admin Users"
          value={stats?.admin_users || 0}
          icon="🔐"
          color="bg-purple-500"
        />
        <StatCard
          title="Total Applications"
          value={stats?.total_applications || 0}
          icon="📄"
          color="bg-orange-500"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ActionButton href="/admin/users" label="Manage Users" icon="👥" />
          <ActionButton href="/admin/settings" label="Settings" icon="⚙️" />
          <ActionButton href="/homepage" label="View Application" icon="🏠" />
        </div>
      </div>

      {/* System Health */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
          System Health
        </h2>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p>
            <span className="font-semibold">Last Checked:</span>{" "}
            {new Date().toLocaleString()}
          </p>
          <HealthRow
            label="Backend API"
            ok={healthError ? false : health?.backend === "ok"}
            okLabel="Online"
            downLabel="Unreachable"
          />
          <HealthRow
            label="Database"
            ok={healthError ? false : health?.database === "ok"}
            okLabel="Connected"
            downLabel="Unreachable"
          />
          <HealthRow
            label="AI (Groq)"
            ok={healthError ? null : health?.ai_active ?? false}
            okLabel="Active"
            downLabel="Not configured"
          />
        </div>
      </div>
    </div>
  );
}

function HealthRow({
  label,
  ok,
  okLabel,
  downLabel,
}: {
  label: string;
  ok: boolean | null;
  okLabel: string;
  downLabel: string;
}) {
  return (
    <p>
      <span className="font-semibold">{label}:</span>{" "}
      {ok === null ? (
        <span className="text-gray-400 font-semibold">● Unknown</span>
      ) : ok ? (
        <span className="text-green-500 font-semibold">● {okLabel}</span>
      ) : (
        <span className="text-red-500 font-semibold">● {downLabel}</span>
      )}
    </p>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: string;
  color: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <div className={`w-12 h-12 ${color} rounded-full opacity-20`}></div>
      </div>
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">{title}</p>
      <p className="text-3xl font-bold text-gray-800 dark:text-white">{value}</p>
    </div>
  );
}

function ActionButton({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: string;
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
    >
      <span className="text-2xl">{icon}</span>
      <span className="font-medium text-gray-700 dark:text-gray-300">{label}</span>
    </a>
  );
}
