"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearAuthToken } from "@/lib/auth";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    clearAuthToken();
    router.push("/");
  }

  const links = [
    { href: "/homepage", label: "Dashboard" },
    { href: "/applications", label: "Applications" },
    { href: "/applications/new", label: "Add Application" },
    { href: "/resume", label: "Resume & Success Rate" },
    { href: "/settings", label: "Settings" },
    { href: "/admin/dashboard", label: "⚡ Admin Panel", admin: true },
  ];

  return (
    <aside className="w-56 min-h-screen bg-gray-100 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col p-4 transition-colors">
      <h2 className="text-xl font-bold mb-8 px-2">Work Manager</h2>

      <nav className="flex flex-col gap-1 flex-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`px-3 py-2 rounded-lg text-sm transition ${
              pathname === link.href || (link.admin && pathname.startsWith("/admin"))
                ? "bg-blue-500 text-white"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800"
            }`}
          >
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
  );
}