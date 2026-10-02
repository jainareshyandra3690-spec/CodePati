import Link from "next/link";
import type { AuthenticatedAdminUser } from "@/lib/admin-auth";

export function AdminAccessDenied({ user }: { user: AuthenticatedAdminUser }) {
  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
      <div className="w-full max-w-lg p-8 rounded-2xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-900/50 shadow-xl space-y-6">
        <div className="flex items-center gap-3 text-amber-700 dark:text-amber-400">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/15 border border-amber-300 dark:border-amber-500/30 flex items-center justify-center shrink-0">
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-950 dark:text-white">
              403 &mdash; Access Denied
            </h1>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Administrator Privileges Required
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm space-y-2">
          <p className="text-slate-800 dark:text-slate-200">
            You are signed in as{" "}
            <span className="font-bold">{user.email || user.name}</span>.
          </p>
          <p className="text-slate-700 dark:text-slate-300 text-xs">
            Current Role:{" "}
            <span className="font-mono font-semibold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700">
              {user.role}
            </span>
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-300 dark:border-slate-800">
            Only accounts with role <code className="font-mono font-bold">ADMIN</code> can create, edit, publish, or delete official CodePati content. To promote this account for development testing, run:
          </p>
          <code className="block p-2.5 rounded-lg bg-slate-900 text-indigo-400 text-xs font-mono overflow-x-auto">
            npm run promote-admin {user.email}
          </code>
        </div>

        <div className="flex gap-3 pt-2">
          <Link
            href="/"
            className="flex-1 text-center py-2.5 px-4 rounded-xl bg-slate-200/80 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 text-sm font-semibold transition-colors"
          >
            Return Home
          </Link>
          <Link
            href="/programs"
            className="flex-1 text-center py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
          >
            Browse Programs
          </Link>
        </div>
      </div>
    </main>
  );
}

export default AdminAccessDenied;
