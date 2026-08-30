"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearAuthToken } from "@/lib/auth";
import { getCurrentUser } from "@/lib/api";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    getCurrentUser()
      .then((me) => setIsAdmin(me.is_admin))
      .catch(() => setIsAdmin(false));
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

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
    { href: "/help", label: "Help & User Guide" },
    ...(isAdmin ? [{ href: "/admin/dashboard", label: "⚡ Admin Panel", admin: true }] : []),
  ];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 md:w-56 md:static md:z-auto h-screen shrink-0 overflow-y-auto bg-gray-100 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col p-4 transition-transform duration-200 md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between mb-8 px-2">
          <h2 className="text-xl font-bold">Work Manager</h2>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="md:hidden text-gray-500 dark:text-gray-400 text-xl leading-none"
          >
            ✕
          </button>
        </div>

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
    </>
  );
}
