import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/user-auth";
import { SubmissionForm } from "@/components/submissions/SubmissionForm";

export default async function NewSubmissionPage() {
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect("/login?callbackUrl=/user/submissions/new");
  }

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
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <Link href="/user/submissions" className="hover:underline">
          My Submissions
        </Link>
        <span>/</span>
        <span className="text-slate-900 dark:text-slate-200 font-semibold">
          New Contribution
        </span>
      </div>

      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Submit Content to CodePati
        </h1>
        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
          Contribute new programs, alternative solutions, algorithms, explanations, or code in other languages.
          All submissions are reviewed by the editorial team before appearing on CodePati.
        </p>
      </div>

      <SubmissionForm
        mode="create"
        categories={categories}
        languages={languages}
        programs={programs}
      />
    </div>
  );
}
