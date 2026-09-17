"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearAuthToken } from "@/lib/auth";
import { getCurrentUser } from "@/lib/api";

type IconProps = { className?: string };

const svg = (path: React.ReactNode) =>
  function Icon({ className }: IconProps) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        {path}
      </svg>
    );
  };

const navIcons = {
  dashboard: svg(
    <>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </>
  ),
  list: svg(
    <>
      <path d="M8 6h13M8 12h13M8 18h13" />
      <circle cx="3.5" cy="6" r="1" />
      <circle cx="3.5" cy="12" r="1" />
      <circle cx="3.5" cy="18" r="1" />
    </>
  ),
  plus: svg(
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8M8 12h8" />
    </>
  ),
  document: svg(
    <>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
      <path d="M14 3v5h5M9 13h6M9 17h4" />
    </>
  ),
  settings: svg(
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.6 1.6 0 0 0 .32 1.77l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.6 1.6 0 0 0-1.77-.32 1.6 1.6 0 0 0-1 1.47V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1.05-1.46 1.6 1.6 0 0 0-1.77.32l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.6 1.6 0 0 0 .32-1.77 1.6 1.6 0 0 0-1.47-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.46-1.05 1.6 1.6 0 0 0-.32-1.77l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.6 1.6 0 0 0 1.77.32H9a1.6 1.6 0 0 0 1-1.47V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.47 1.6 1.6 0 0 0 1.77-.32l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.6 1.6 0 0 0-.32 1.77V9a1.6 1.6 0 0 0 1.47 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z" />
    </>
  ),
  help: svg(
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.6 9.3a2.5 2.5 0 0 1 4.86.83c0 1.67-2.5 2.5-2.5 2.5" />
      <path d="M12 17h.01" />
    </>
  ),
} as const;

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
    { href: "/homepage", label: "Dashboard", icon: navIcons.dashboard, group: "main" },
    { href: "/applications", label: "Applications", icon: navIcons.list, group: "main" },
    { href: "/applications/new", label: "Add Application", icon: navIcons.plus, group: "main" },
    { href: "/resume", label: "Resume & Success Rate", icon: navIcons.document, group: "main" },
    { href: "/settings", label: "Settings", icon: navIcons.settings, group: "support" },
    { href: "/help", label: "Help & User Guide", icon: navIcons.help, group: "support" },
  ];

  function renderLink(link: (typeof links)[number]) {
    const Icon = link.icon;
    const active = pathname === link.href;
    return (
      <Link
        key={link.href}
        href={link.href}
        aria-current={active ? "page" : undefined}
        className={`group relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
          active
            ? "bg-blue-500/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300"
            : "text-gray-600 dark:text-gray-400 hover:bg-gray-200/70 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
        }`}
      >
        <span
          aria-hidden="true"
          className={`absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-blue-500 transition-opacity ${
            active ? "opacity-100" : "opacity-0"
          }`}
        />
        <Icon
          className={`w-4.5 h-4.5 shrink-0 ${
            active ? "text-blue-500 dark:text-blue-300" : "text-gray-400 dark:text-gray-500 group-hover:text-current"
          }`}
        />
        <span className="truncate">{link.label}</span>
      </Link>
    );
  }

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
        <div className="flex items-center justify-between gap-2 mb-6 px-1 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="shrink-0 grid place-items-center w-8 h-8 rounded-lg bg-blue-500 text-white font-bold text-sm">
              W
            </span>
            <h2 className="text-base font-semibold tracking-tight truncate">Work Manager</h2>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="md:hidden text-gray-500 dark:text-gray-400 text-xl leading-none"
          >
            ✕
          </button>
        </div>

        <nav className="flex flex-col flex-1 overflow-y-auto -mx-1 px-1">
          <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Workspace
          </p>
          <div className="flex flex-col gap-0.5">
            {links.filter((l) => l.group === "main").map(renderLink)}
          </div>

          <p className="mt-5 px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Support
          </p>
          <div className="flex flex-col gap-0.5">
            {links.filter((l) => l.group === "support").map(renderLink)}
          </div>
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
