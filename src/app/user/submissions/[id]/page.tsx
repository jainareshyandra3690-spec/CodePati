import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/user-auth";
import { SubmissionStatusBadge } from "@/components/submissions/SubmissionStatusBadge";
import { SubmissionTypeBadge } from "@/components/submissions/SubmissionTypeBadge";
import { SubmissionForm } from "@/components/submissions/SubmissionForm";
import { CodeBlock } from "@/components/programs/CodeBlock";
import { CopyCodeButton } from "@/components/programs/CopyCodeButton";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string }>;
}

export default async function UserSubmissionDetailPage({
  params,
  searchParams,
}: PageProps) {
  const user = await getAuthenticatedUser();
  const { id } = await params;
  const { edit } = await searchParams;

  if (!user) {
    redirect(`/login?callbackUrl=/user/submissions/${id}`);
  }

  const submission = await prisma.submission.findUnique({
    where: { id },
    include: {
      program: {
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
        },
      },
      category: true,
      languages: {
        include: { language: true },
      },
      reviewedBy: {
        select: { name: true, role: true },
      },
    },
  });

  if (!submission) {
    notFound();
  }

  // Server-side ownership check: User can only view their own submission
  if (submission.userId !== user.id && user.role !== "ADMIN") {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 flex items-center justify-center font-bold text-xl">
            !
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Access Denied
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            You do not have permission to view or edit this submission.
          </p>
          <div className="pt-2">
            <Link
              href="/user/submissions"
              className="inline-flex items-center px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold"
            >
              Back to My Submissions
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isEditing = edit === "true" && submission.status === "REQUIRES_CHANGES";

  // If user requested edit mode and status is REQUIRES_CHANGES, fetch options for edit form
  if (isEditing) {
    const [categories, languages, programs] = await Promise.all([
      prisma.category.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
      prisma.language.findMany({
        select: { id: true, name: true, slug: true, fileExtension: true },
        orderBy: { name: "asc" },
      }),
      prisma.program.findMany({
        where: { status: "PUBLISHED" },
        select: { id: true, title: true, slug: true },
        orderBy: { title: "asc" },
      }),
    ]);

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Link href="/user/submissions" className="hover:underline">
            My Submissions
          </Link>
          <span>/</span>
          <Link href={`/user/submissions/${submission.id}`} className="hover:underline">
            {submission.title}
          </Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-slate-200 font-semibold">
            Edit & Resubmit
          </span>
        </div>

        <div className="p-4 rounded-xl border border-orange-200 dark:border-orange-900/40 bg-orange-50 dark:bg-orange-950/20 text-orange-900 dark:text-orange-200 text-sm space-y-2">
          <p className="font-bold flex items-center gap-2">
            <span>Changes Requested by Editorial Team</span>
          </p>
          <p className="text-xs leading-relaxed">{submission.adminFeedback}</p>
        </div>

        <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Edit & Resubmit Contribution
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Update your contribution based on the feedback above. Resubmitting will transition the status back to Under Review.
          </p>
        </div>

        <SubmissionForm
          mode="edit"
          categories={categories}
          languages={languages}
          programs={programs}
          initialData={{
            id: submission.id,
            submissionType: submission.submissionType,
            title: submission.title,
            description: submission.description,
            programId: submission.programId,
            categoryId: submission.categoryId,
            difficulty: submission.difficulty,
            problemStatement: submission.problemStatement,
            inputDescription: submission.inputDescription,
            outputDescription: submission.outputDescription,
            examples: submission.examples,
            explanation: submission.explanation,
            algorithm: submission.algorithm,
            timeComplexity: submission.timeComplexity,
            spaceComplexity: submission.spaceComplexity,
            languages: submission.languages.map((l) => ({
              languageId: l.languageId,
              fileName: l.fileName,
              code: l.code,
            })),
          }}
        />
      </div>
    );
  }

  // Normal Read-Only Detail View
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Link href="/user/submissions" className="hover:underline">
            My Submissions
          </Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-slate-200 font-semibold truncate max-w-xs">
            {submission.title}
          </span>
        </div>

        <Link
          href="/user/submissions"
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          &larr; Back to list
        </Link>
      </div>

      {/* Status Banner */}
      {submission.status === "REQUIRES_CHANGES" && (
        <div className="p-5 rounded-2xl border border-orange-300 dark:border-orange-800/60 bg-orange-50 dark:bg-orange-950/25 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-orange-900 dark:text-orange-200">
                Action Required: Changes Requested
              </h2>
              <p className="text-xs text-orange-800/90 dark:text-orange-300/80 mt-0.5">
                The editorial team reviewed your submission and requested adjustments before it can be approved.
              </p>
            </div>
            <Link
              href={`/user/submissions/${submission.id}?edit=true`}
              className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-xs transition-colors shrink-0 text-center"
            >
              Edit & Resubmit &rarr;
            </Link>
          </div>
          {submission.adminFeedback && (
            <div className="p-3.5 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-orange-200 dark:border-orange-900/40 text-xs text-orange-950 dark:text-orange-200 leading-relaxed font-sans">
              <span className="font-semibold block mb-1">Feedback from Reviewer:</span>
              {submission.adminFeedback}
            </div>
          )}
        </div>
      )}

      {submission.status === "PENDING" && (
        <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
          <span>
            This submission is under review by the CodePati editorial team. You will be able to edit if changes are requested.
          </span>
        </div>
      )}

      {submission.status === "APPROVED" && (
        <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 text-xs text-emerald-800 dark:text-emerald-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span>This submission was approved and applied to official CodePati content.</span>
          </div>
          {submission.program && submission.program.status === "PUBLISHED" && (
            <Link
              href={`/programs/${submission.program.slug}`}
              className="font-bold underline hover:text-emerald-900 dark:hover:text-emerald-200"
            >
              View published program &rarr;
            </Link>
          )}
        </div>
      )}

      {submission.status === "REJECTED" && (
        <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 text-xs text-rose-800 dark:text-rose-300 space-y-2">
          <p className="font-bold">This submission was not approved.</p>
          {submission.adminFeedback && (
            <p className="leading-relaxed">
              <span className="font-semibold">Reason: </span>
              {submission.adminFeedback}
            </p>
          )}
        </div>
      )}

      {/* Main Details Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
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

          <div className="text-right text-xs text-slate-500 dark:text-slate-400 shrink-0">
            <p>Submitted: {new Date(submission.createdAt).toLocaleDateString()}</p>
            <p>Updated: {new Date(submission.updatedAt).toLocaleDateString()}</p>
          </div>
        </div>

        {submission.program && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <div>
              <span className="text-slate-500 dark:text-slate-400">Target Program: </span>
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {submission.program.title}
              </span>
            </div>
            {submission.program.status === "PUBLISHED" && (
              <Link
                href={`/programs/${submission.program.slug}`}
                className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
              >
                View Program &rarr;
              </Link>
            )}
          </div>
        )}

        {submission.description && (
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Description / Notes
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
              {submission.description}
            </p>
          </div>
        )}

        {/* Structured fields */}
        {submission.problemStatement && (
          <div className="space-y-1.5">
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
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Examples
            </h3>
            <pre className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200 overflow-x-auto">
              {submission.examples}
            </pre>
          </div>
        )}

        {submission.explanation && (
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Explanation
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
              {submission.explanation}
            </p>
          </div>
        )}

        {submission.algorithm && (
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Algorithm / Logic
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
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Code Implementations ({submission.languages.length})
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
                <div className="p-0">
                  <CodeBlock code={l.code} languageSlug={l.language.slug} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
