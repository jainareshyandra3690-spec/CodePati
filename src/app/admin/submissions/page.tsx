/* eslint-disable @next/next/no-img-element */
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { requireAdminUser } from "@/lib/admin-auth";
import { AdminNav } from "@/components/admin/AdminNav";
import { SubmissionStatusBadge } from "@/components/submissions/SubmissionStatusBadge";
import { SubmissionTypeBadge } from "@/components/submissions/SubmissionTypeBadge";
import type { SubmissionStatus, SubmissionType } from "@prisma/client";

interface PageProps {
  searchParams: Promise<{
    status?: string;
    type?: string;
  }>;
}

export default async function AdminSubmissionsPage({ searchParams }: PageProps) {
  try {
    await requireAdminUser();
  } catch {
    redirect("/admin");
  }

  const { status, type } = await searchParams;

  const validStatus = status && ["PENDING", "APPROVED", "REJECTED", "REQUIRES_CHANGES"].includes(status)
    ? (status as SubmissionStatus)
    : undefined;

  const validType = type && Object.values([
    "NEW_PROGRAM",
    "ALTERNATIVE_SOLUTION",
    "EXPLANATION",
    "CORRECTION",
    "ALGORITHM",
    "LANGUAGE_IMPLEMENTATION"
  ]).includes(type)
    ? (type as SubmissionType)
    : undefined;

  const submissions = await prisma.submission.findMany({
    where: {
      ...(validStatus ? { status: validStatus } : {}),
      ...(validType ? { submissionType: validType } : {}),
    },
    include: {
      user: {
        select: { id: true, name: true, email: true, image: true, profileImage: true },
      },
      program: {
        select: { id: true, title: true, slug: true },
      },
      category: {
        select: { id: true, name: true },
      },
      languages: {
        include: { language: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const counts = await prisma.submission.groupBy({
    by: ["status"],
    _count: true,
  });

  const countMap = counts.reduce<Record<string, number>>((acc, c) => {
    acc[c.status] = c._count;
    return acc;
  }, {});

  const totalCount = Object.values(countMap).reduce((a, b) => a + b, 0);

  const tabs = [
    { label: "All", value: undefined, count: totalCount },
    { label: "Pending Review", value: "PENDING", count: countMap["PENDING"] || 0 },
    { label: "Changes Requested", value: "REQUIRES_CHANGES", count: countMap["REQUIRES_CHANGES"] || 0 },
    { label: "Approved", value: "APPROVED", count: countMap["APPROVED"] || 0 },
    { label: "Rejected", value: "REJECTED", count: countMap["REJECTED"] || 0 },
  ];

  return (
    <div className="space-y-8">
      <AdminNav />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Community Submissions
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Review, approve, or request revisions for community-submitted programming content.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const isActive = validStatus === tab.value;
          const href = tab.value ? `/admin/submissions?status=${tab.value}` : "/admin/submissions";
          return (
            <Link
              key={tab.label}
              href={href}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
                isActive
                  ? "bg-indigo-600 text-white dark:bg-indigo-600 shadow-xs"
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

      {/* Submissions Table / Cards */}
      {submissions.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            No submissions in this view
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            There are currently no community submissions matching the selected filters.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Submission</th>
                  <th className="px-4 py-3.5">Type</th>
                  <th className="px-4 py-3.5">Submitter</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Submitted</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {submissions.map((sub) => {
                  const avatar = sub.user.image || sub.user.profileImage;
                  return (
                    <tr
                      key={sub.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="space-y-0.5">
                          <Link
                            href={`/admin/submissions/${sub.id}`}
                            className="font-bold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm transition-colors block"
                          >
                            {sub.title}
                          </Link>
                          {sub.program && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              Target: {sub.program.title}
                            </p>
                          )}
                          {sub.category && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              Category: {sub.category.name}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        <SubmissionTypeBadge type={sub.submissionType} />
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {avatar ? (
                            <img
                              src={avatar}
                              alt=""
                              className="w-6 h-6 rounded-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[10px] flex items-center justify-center">
                              {sub.user.name ? sub.user.name.charAt(0).toUpperCase() : "U"}
                            </div>
                          )}
                          <div className="truncate max-w-[140px]">
                            <p className="font-semibold text-slate-800 dark:text-slate-200 text-xs truncate">
                              {sub.user.name || "Anonymous"}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">
                              {sub.user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        <SubmissionStatusBadge status={sub.status} />
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                        {new Date(sub.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        <Link
                          href={`/admin/submissions/${sub.id}`}
                          className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white shadow-xs transition-colors"
                        >
                          Review &rarr;
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
