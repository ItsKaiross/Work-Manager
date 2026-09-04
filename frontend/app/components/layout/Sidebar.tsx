"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearAuthToken } from "@/lib/auth";
import { getCurrentUser } from "@/lib/api";

interface CurrentUser {
  id: number;
  email: string;
  is_admin: boolean;
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [open, setOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  useEffect(() => {
    setOpen(false);
    setProfileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!profileMenuOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setProfileMenuOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [profileMenuOpen]);

  function handleLogout() {
    clearAuthToken();
    router.push("/");
  }

  const initials = user?.email ? user.email.charAt(0).toUpperCase() : "?";

  const links = [
    { href: "/homepage", label: "Dashboard" },
    { href: "/applications", label: "Applications" },
    { href: "/applications/new", label: "Add Application" },
    { href: "/resume", label: "Resume & Success Rate" },
    { href: "/settings", label: "Settings" },
    { href: "/help", label: "Help & User Guide" },
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
        className={`fixed inset-y-0 left-0 z-50 w-64 md:w-56 md:static md:z-auto h-screen shrink-0 bg-gray-100 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col p-4 transition-transform duration-200 md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between mb-8 px-2 shrink-0">
          <h2 className="text-xl font-bold">Work Manager</h2>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="md:hidden text-gray-500 dark:text-gray-400 text-xl leading-none"
          >
            ✕
          </button>
        </div>

        <nav className="flex flex-col gap-1 flex-1 overflow-y-auto">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-2 rounded-lg text-sm transition ${
                pathname === link.href
                  ? "bg-blue-500 text-white"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div ref={profileRef} className="relative mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 shrink-0">
          {profileMenuOpen && (
            <div
              role="menu"
              className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden z-50"
            >
              <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-400 dark:text-gray-500">Signed in as</p>
                <p className="text-sm text-gray-700 dark:text-gray-200 truncate">{user?.email ?? "Unknown"}</p>
              </div>

              {user?.is_admin && (
                <Link
                  href="/admin/dashboard"
                  role="menuitem"
                  onClick={() => setProfileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm transition ${
                    pathname.startsWith("/admin")
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <span aria-hidden="true">⚡</span> Admin Panel
                </Link>
              )}

              <button
                role="menuitem"
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition text-left"
              >
                Log out
              </button>
            </div>
          )}

          <button
            onClick={() => setProfileMenuOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={profileMenuOpen}
            className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition"
          >
            <span className="shrink-0 w-8 h-8 rounded-full bg-blue-500 text-white text-sm font-semibold flex items-center justify-center">
              {initials}
            </span>
            <span className="flex-1 min-w-0 text-left">
              <span className="block text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                {user?.email ?? "Loading..."}
              </span>
              {user?.is_admin && (
                <span className="block text-xs text-gray-400 dark:text-gray-500">Admin</span>
              )}
            </span>
            <svg
              className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${profileMenuOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
        </div>
      </aside>
    </>
  );
}
