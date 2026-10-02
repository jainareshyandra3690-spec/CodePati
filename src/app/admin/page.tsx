import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { getAdminAuthStatus } from "@/lib/admin-auth";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminAccessDenied } from "@/components/admin/AdminAccessDenied";
/* eslint-disable @next/next/no-img-element */

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const authResult = await getAdminAuthStatus();

  if (authResult.status === "UNAUTHENTICATED") {
    redirect("/login?callbackUrl=/admin");
  }

  if (authResult.status === "FORBIDDEN") {
    return <AdminAccessDenied user={authResult.user} />;
  }

  const adminUser = authResult.user;

  const [
    totalPrograms,
    publishedPrograms,
    draftPrograms,
    totalCategories,
    totalLanguages,
    totalSubmissions,
    pendingSubmissions,
    recentPrograms,
  ] = await Promise.all([
    prisma.program.count(),
    prisma.program.count({ where: { status: "PUBLISHED" } }),
    prisma.program.count({ where: { status: "DRAFT" } }),
    prisma.category.count(),
    prisma.language.count(),
    prisma.submission.count(),
    prisma.submission.count({ where: { status: "PENDING" } }),
    prisma.program.findMany({
      orderBy: { updatedAt: "desc" },
      take: 6,
      select: {
        id: true,
        title: true,
        slug: true,
        difficulty: true,
        status: true,
        updatedAt: true,
        category: { select: { name: true } },
        _count: { select: { languages: true } },
      },
    }),
  ]);

  const stats = [
    {
      label: "Total Programs",
      value: totalPrograms,
      sub: "Official curriculum",
      href: "/admin/programs",
      accent:
        "bg-indigo-50 dark:bg-indigo-600/15 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/30",
    },
    {
      label: "Published",
      value: publishedPrograms,
      sub: "Live in library",
      href: "/admin/programs?status=PUBLISHED",
      accent:
        "bg-emerald-100/90 dark:bg-emerald-500/15 text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30",
    },
    {
      label: "Drafts",
      value: draftPrograms,
      sub: "Private to admins",
      href: "/admin/programs?status=DRAFT",
      accent:
        "bg-amber-100/90 dark:bg-amber-500/15 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-500/30",
    },
    {
      label: "Categories",
      value: totalCategories,
      sub: "Problem domains",
      href: "/admin/categories",
      accent:
        "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700",
    },
    {
      label: "Languages",
      value: totalLanguages,
      sub: "Supported runtimes",
      href: "/admin/languages",
      accent:
        "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700",
    },
    {
      label: "Submissions",
      value: totalSubmissions,
      sub: `${pendingSubmissions} pending review`,
      href: "/admin/submissions",
      accent:
        "bg-purple-50 dark:bg-purple-500/15 text-purple-900 dark:text-purple-300 border-purple-300 dark:border-purple-500/30",
    },
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Top Admin Header Banner */}
      <header className="flex flex-wrap items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-sm">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100/90 dark:bg-emerald-500/15 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse" />
            ADMIN CONTENT MANAGEMENT
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
            CodePati Admin
          </h1>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            Manage official programming problems, explanations, algorithms, language implementations, categories, and languages.
          </p>
        </div>

        {/* Authenticated Admin Identity Pill */}
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800">
          {adminUser.image ? (
            <img
              src={adminUser.image}
              alt={adminUser.name || "Admin"}
              width={40}
              height={40}
              referrerPolicy="no-referrer"
              className="rounded-lg border border-indigo-500/40 object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-600/20 border border-indigo-200 dark:border-indigo-500/40 text-indigo-700 dark:text-indigo-300 font-bold text-sm flex items-center justify-center">
              {adminUser.name ? adminUser.name.charAt(0).toUpperCase() : "A"}
            </div>
          )}
          <div className="text-xs">
            <p className="font-bold text-slate-900 dark:text-white">
              {adminUser.name || "CodePati Admin"}
            </p>
            <p className="text-slate-600 dark:text-slate-400 font-mono text-[11px]">
              {adminUser.email}
            </p>
          </div>
        </div>
      </header>

      {/* Admin Navigation Bar */}
      <AdminNav />

      {/* Live Content Statistics Grid */}
      <section aria-label="Content statistics">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {stats.map((stat) => (
            <Link
              key={stat.label}
              href={stat.href}
              className="group rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500/50 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  {stat.label}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-bold border ${stat.accent}`}
                >
                  {stat.value}
                </span>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {stat.value}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  {stat.sub}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Content Management Modules + Recent Programs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Content Management Quick Actions */}
        <section className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-6 shadow-sm space-y-5">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">
              Content Management
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Select a section to create, update, publish, or organize platform content
            </p>
          </div>

          <div className="space-y-3">
            <Link
              href="/admin/programs"
              className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-indigo-50/70 dark:bg-slate-950 dark:hover:bg-slate-800/80 border border-slate-300 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500/50 transition-all group"
            >
              <div>
                <p className="text-sm font-bold text-slate-950 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  Programs ({totalPrograms})
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Create, edit, publish, unpublish, and manage code solutions
                </p>
              </div>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">&rarr;</span>
            </Link>

            <Link
              href="/admin/categories"
              className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-indigo-50/70 dark:bg-slate-950 dark:hover:bg-slate-800/80 border border-slate-300 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500/50 transition-all group"
            >
              <div>
                <p className="text-sm font-bold text-slate-950 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  Categories ({totalCategories})
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Manage topic categories, slugs, and descriptions
                </p>
              </div>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">&rarr;</span>
            </Link>

            <Link
              href="/admin/languages"
              className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-indigo-50/70 dark:bg-slate-950 dark:hover:bg-slate-800/80 border border-slate-300 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500/50 transition-all group"
            >
              <div>
                <p className="text-sm font-bold text-slate-950 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  Languages ({totalLanguages})
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Configure programming languages and file extensions
                </p>
              </div>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">&rarr;</span>
            </Link>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <Link
              href="/admin/programs/new"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white shadow-xs transition-colors"
            >
              <span>+ Create New Program</span>
            </Link>
          </div>
        </section>

        {/* Recently Updated Programs */}
        <section className="lg:col-span-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                Recently Updated Programs
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Quick access to edit or preview recently modified programs
              </p>
            </div>
            <Link
              href="/admin/programs"
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              View All ({totalPrograms}) &rarr;
            </Link>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {recentPrograms.map((prog) => {
              const isPublished = prog.status === "PUBLISHED";
              return (
                <div
                  key={prog.id}
                  className="py-3 flex flex-wrap items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-md font-semibold border ${
                          isPublished
                            ? "bg-emerald-100/90 text-emerald-900 border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30"
                            : "bg-amber-100/90 text-amber-900 border-amber-300 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30"
                        }`}
                      >
                        {isPublished ? "Published" : "Draft"}
                      </span>
                      <span className="font-bold text-sm text-slate-950 dark:text-white truncate">
                        {prog.title}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">
                      {prog.category.name} &bull; {prog.difficulty} &bull;{" "}
                      {prog._count.languages} language(s)
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/admin/programs/${prog.id}/edit`}
                      className="px-3 py-1.5 rounded-lg font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors"
                    >
                      Edit
                    </Link>
                    <Link
                      href={
                        isPublished
                          ? `/programs/${prog.slug}`
                          : `/admin/programs/${prog.id}/edit?preview=1`
                      }
                      className="px-3 py-1.5 rounded-lg font-semibold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-600/15 dark:hover:bg-indigo-500/25 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 transition-colors"
                    >
                      {isPublished ? "View" : "Preview"}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
