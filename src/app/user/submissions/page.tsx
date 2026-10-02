import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/user-auth";
import { SubmissionStatusBadge } from "@/components/submissions/SubmissionStatusBadge";
import { SubmissionTypeBadge } from "@/components/submissions/SubmissionTypeBadge";
import type { SubmissionStatus } from "@prisma/client";

interface PageProps {
  searchParams: Promise<{
    status?: string;
  }>;
}

export default async function UserSubmissionsPage({ searchParams }: PageProps) {
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect("/login?callbackUrl=/user/submissions");
  }

  const { status } = await searchParams;

  const validStatus = status && Object.values(["PENDING", "APPROVED", "REJECTED", "REQUIRES_CHANGES"]).includes(status)
    ? (status as SubmissionStatus)
    : undefined;

  const submissions = await prisma.submission.findMany({
    where: {
      userId: user.id,
      ...(validStatus ? { status: validStatus } : {}),
    },
    include: {
      program: { select: { id: true, title: true, slug: true } },
      category: { select: { id: true, name: true } },
      languages: { include: { language: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const counts = await prisma.submission.groupBy({
    by: ["status"],
    where: { userId: user.id },
    _count: true,
  });

  const countMap = counts.reduce<Record<string, number>>((acc, c) => {
    acc[c.status] = c._count;
    return acc;
  }, {});

  const totalCount = Object.values(countMap).reduce((a, b) => a + b, 0);

  const tabs = [
    { label: "All", value: undefined, count: totalCount },
    { label: "Under Review", value: "PENDING", count: countMap["PENDING"] || 0 },
    { label: "Changes Requested", value: "REQUIRES_CHANGES", count: countMap["REQUIRES_CHANGES"] || 0 },
    { label: "Approved", value: "APPROVED", count: countMap["APPROVED"] || 0 },
    { label: "Rejected", value: "REJECTED", count: countMap["REJECTED"] || 0 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            My Submissions
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Track your community contributions, code implementations, and editorial reviews.
          </p>
        </div>
        <Link
          href="/user/submissions/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-sm font-semibold shadow-sm transition-colors"
        >
          <span>+ New Submission</span>
        </Link>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const isActive = validStatus === tab.value;
          const href = tab.value ? `/user/submissions?status=${tab.value}` : "/user/submissions";
          return (
            <Link
              key={tab.label}
              href={href}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
                isActive
                  ? "bg-indigo-600 text-white dark:bg-indigo-600"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[11px] font-mono ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                {tab.count}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Submissions List */}
      {submissions.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            No submissions found
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {validStatus
              ? "You do not have any submissions matching this status."
              : "You haven't submitted any contributions yet. Help other learners by sharing a program, explanation, or language solution!"}
          </p>
          <div className="pt-2">
            <Link
              href="/user/submissions/new"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Submit your first contribution &rarr;
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <SubmissionTypeBadge type={sub.submissionType} />
                    <SubmissionStatusBadge status={sub.status} />
                    {sub.category && (
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        • {sub.category.name}
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    <Link
                      href={`/user/submissions/${sub.id}`}
                      className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      {sub.title}
                    </Link>
                  </h2>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/user/submissions/${sub.id}`}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-xs font-semibold transition-colors"
                  >
                    View Details
                  </Link>
                  {sub.status === "REQUIRES_CHANGES" && (
                    <Link
                      href={`/user/submissions/${sub.id}?edit=true`}
                      className="px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-xs transition-colors"
                    >
                      Edit & Resubmit
                    </Link>
                  )}
                </div>
              </div>

              {sub.program && (
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Target Program:{" "}
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {sub.program.title}
                  </span>
                </p>
              )}

              {sub.adminFeedback && (
                <div className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/60 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200 text-xs space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <span>Editorial Feedback:</span>
                  </p>
                  <p className="leading-relaxed">{sub.adminFeedback}</p>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <span>Submitted: {new Date(sub.createdAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>Updated: {new Date(sub.updatedAt).toLocaleDateString()}</span>
                </div>
                {sub.languages.length > 0 && (
                  <div className="flex items-center gap-1.5 font-mono text-[11px]">
                    {sub.languages.map((l) => (
                      <span
                        key={l.id}
                        className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      >
                        {l.language.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
