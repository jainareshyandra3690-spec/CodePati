"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ADMIN_NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", exact: true },
  { label: "Programs", href: "/admin/programs", exact: false },
  { label: "Categories", href: "/admin/categories", exact: false },
  { label: "Languages", href: "/admin/languages", exact: false },
  { label: "Submissions", href: "/admin/submissions", exact: false },
];

export function AdminNav() {
  const pathname = usePathname();

  const isActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-4 sm:p-5 shadow-sm flex flex-wrap items-center justify-between gap-3">
      <nav
        aria-label="Admin navigation"
        className="flex flex-wrap items-center gap-1.5"
      >
        {ADMIN_NAV_ITEMS.map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                active
                  ? "bg-indigo-600 dark:bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/admin/programs/new"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white shadow-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          <span>+ Create Program</span>
        </Link>
        <Link
          href="/programs"
          className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 transition-colors"
        >
          <span>Public Library &rarr;</span>
        </Link>
      </div>
    </div>
  );
}

export default AdminNav;
