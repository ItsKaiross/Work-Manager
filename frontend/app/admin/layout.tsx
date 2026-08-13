"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getAuthToken, clearAuthToken } from "@/lib/auth";
import { getCurrentUser } from "@/lib/api";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push("/");
      return;
    }

    getCurrentUser()
      .then((me) => {
        if (!me.is_admin) {
          router.push("/homepage");
          return;
        }
        setChecked(true);
        setLoading(false);
      })
      .catch(() => {
        router.push("/");
      });
  }, [router]);

  function handleLogout() {
    clearAuthToken();
    router.push("/");
  }

  const links = [
    { href: "/admin/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/admin/users", label: "User Management", icon: "👥" },
    { href: "/admin/settings", label: "Settings", icon: "⚙️" },
    { href: "/homepage", label: "← Back to App", icon: "" },
  ];

  if (!checked || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col p-4 transition-colors">
          <h2 className="text-xl font-bold mb-8 px-2 text-gray-800 dark:text-white">
            Admin Panel
          </h2>

          <nav className="flex flex-col gap-1 flex-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-lg text-sm transition flex items-center gap-2 ${
                  pathname === link.href
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {link.icon && <span>{link.icon}</span>}
                {link.label}
              </Link>
            ))}
          </nav>

          <button
            onClick={handleLogout}
            className="px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition text-left"
          >
            Log out
          </button>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8">{children}</main>
      </div>
  );
}
