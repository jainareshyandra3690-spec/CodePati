/* eslint-disable @next/next/no-img-element */
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { requireAdminUser } from "@/lib/admin-auth";
import { AdminNav } from "@/components/admin/AdminNav";
import { SubmissionStatusBadge } from "@/components/submissions/SubmissionStatusBadge";
import { SubmissionTypeBadge } from "@/components/submissions/SubmissionTypeBadge";
import { AdminSubmissionReview } from "@/components/admin/AdminSubmissionReview";
import { CodeBlock } from "@/components/programs/CodeBlock";
import { CopyCodeButton } from "@/components/programs/CopyCodeButton";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminSubmissionReviewPage({ params }: PageProps) {
  try {
    await requireAdminUser();
  } catch {
    redirect("/admin");
  }

  const { id } = await params;

  const submission = await prisma.submission.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, name: true, email: true, image: true, profileImage: true, role: true },
      },
      program: {
        include: {
          languages: { include: { language: true } },
          category: true,
        },
      },
      category: true,
      languages: {
        include: { language: true },
      },
      reviewedBy: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  if (!submission) {
    notFound();
  }

  const avatar = submission.user.image || submission.user.profileImage;

  // Check language conflict for LANGUAGE_IMPLEMENTATION
  let hasExistingLanguageConflict = false;
  if (
    submission.submissionType === "LANGUAGE_IMPLEMENTATION" &&
    submission.program &&
    submission.languages.length > 0
  ) {
    const targetLangId = submission.languages[0].languageId;
    hasExistingLanguageConflict = submission.program.languages.some(
      (l) => l.languageId === targetLangId
    );
  }

  return (
    <div className="space-y-8">
      <AdminNav />

      {/* Breadcrumb */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Link href="/admin/submissions" className="hover:underline">
            Submissions
          </Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-slate-200 font-semibold truncate max-w-sm">
            {submission.title}
          </span>
        </div>
        <Link
          href="/admin/submissions"
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          &larr; Back to all submissions
        </Link>
      </div>

      {/* Header Info */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <SubmissionTypeBadge type={submission.submissionType} />
            <SubmissionStatusBadge status={submission.status} />
            {submission.category && (
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {submission.category.name}
              </span>
            )}
            {submission.difficulty && (
              <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                {submission.difficulty}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {submission.title}
          </h1>
        </div>

        {/* Submitter Info Card */}
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 shrink-0">
          {avatar ? (
            <img
              src={avatar}
              alt=""
              className="w-10 h-10 rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-bold text-sm flex items-center justify-center">
              {submission.user.name ? submission.user.name.charAt(0).toUpperCase() : "U"}
            </div>
          )}
          <div className="text-xs space-y-0.5">
            <p className="font-bold text-slate-900 dark:text-slate-100">
              {submission.user.name || "Anonymous Contributor"}
            </p>
            <p className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
              {submission.user.email}
            </p>
            <p className="text-[10px] text-slate-400">
              Role: {submission.user.role} • Submitted: {new Date(submission.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Target Program Info (if applicable) */}
      {submission.program && (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between">
          <div>
            <span className="text-slate-500 dark:text-slate-400">Target Official Program: </span>
            <span className="font-bold text-slate-900 dark:text-slate-100">
              {submission.program.title}
            </span>{" "}
            ({submission.program.category.name} • {submission.program.difficulty})
          </div>
          <Link
            href={`/programs/${submission.program.slug}`}
            target="_blank"
            className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
          >
            Open Official Program Page &nearr;
          </Link>
        </div>
      )}

      {/* Side-by-side or comparison for Content modifications */}
      {submission.program && submission.submissionType === "EXPLANATION" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Current Official Explanation
            </h3>
            <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
              {submission.program.explanation}
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/40 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-300">
              Proposed Community Explanation
            </h3>
            <p className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
              {submission.explanation || submission.description}
            </p>
          </div>
        </div>
      )}

      {submission.program && submission.submissionType === "ALGORITHM" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Current Official Algorithm
            </h3>
            <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
              {submission.program.algorithm}
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/40 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-300">
              Proposed Community Algorithm
            </h3>
            <p className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
              {submission.algorithm || submission.description}
            </p>
          </div>
        </div>
      )}

      {/* Submitted Content Details */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-3">
          Submitted Content
        </h2>

        {submission.description && (
          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Description / Contributor Notes
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
              {submission.description}
            </p>
          </div>
        )}

        {submission.problemStatement && (
          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Problem Statement
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
              {submission.problemStatement}
            </p>
          </div>
        )}

        {(submission.inputDescription || submission.outputDescription) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {submission.inputDescription && (
              <div className="space-y-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Input Format
                </h3>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  {submission.inputDescription}
                </p>
              </div>
            )}
            {submission.outputDescription && (
              <div className="space-y-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Output Format
                </h3>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  {submission.outputDescription}
                </p>
              </div>
            )}
          </div>
        )}

        {submission.examples && (
          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Examples
            </h3>
            <pre className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200 overflow-x-auto">
              {submission.examples}
            </pre>
          </div>
        )}

        {submission.explanation && submission.submissionType !== "EXPLANATION" && (
          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Explanation
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
              {submission.explanation}
            </p>
          </div>
        )}

        {submission.algorithm && submission.submissionType !== "ALGORITHM" && (
          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Algorithm / Logic Steps
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
              {submission.algorithm}
            </p>
          </div>
        )}

        {(submission.timeComplexity || submission.spaceComplexity) && (
          <div className="flex flex-wrap gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            {submission.timeComplexity && (
              <div className="text-xs">
                <span className="text-slate-500 dark:text-slate-400">Time Complexity: </span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  {submission.timeComplexity}
                </span>
              </div>
            )}
            {submission.spaceComplexity && (
              <div className="text-xs">
                <span className="text-slate-500 dark:text-slate-400">Space Complexity: </span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  {submission.spaceComplexity}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Code Implementations */}
      {submission.languages.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Submitted Code Implementations ({submission.languages.length})
          </h2>

          <div className="space-y-4">
            {submission.languages.map((l) => (
              <div
                key={l.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm"
              >
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {l.language.name}
                    </span>
                    {l.fileName && (
                      <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                        ({l.fileName})
                      </span>
                    )}
                  </div>
                  <CopyCodeButton code={l.code} />
                </div>
                <div>
                  <CodeBlock code={l.code} languageSlug={l.language.slug} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review Actions Box */}
      <AdminSubmissionReview
        submissionId={submission.id}
        currentStatus={submission.status}
        submissionType={submission.submissionType}
        existingFeedback={submission.adminFeedback}
        hasExistingLanguageConflict={hasExistingLanguageConflict}
      />
    </div>
  );
}
