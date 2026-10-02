import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { getAdminAuthStatus } from "@/lib/admin-auth";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminAccessDenied } from "@/components/admin/AdminAccessDenied";
import { ProgramForm } from "@/components/admin/ProgramForm";

export const dynamic = "force-dynamic";

interface EditProgramPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    preview?: string;
  }>;
}

export default async function AdminEditProgramPage({
  params,
  searchParams,
}: EditProgramPageProps) {
  const { id } = await params;
  const resolvedSearch = await searchParams;
  const initialPreviewMode = resolvedSearch.preview === "1";

  const authResult = await getAdminAuthStatus();

  if (authResult.status === "UNAUTHENTICATED") {
    redirect(`/login?callbackUrl=/admin/programs/${id}/edit`);
  }

  if (authResult.status === "FORBIDDEN") {
    return <AdminAccessDenied user={authResult.user} />;
  }

  const [program, categories, languages] = await Promise.all([
    prisma.program.findUnique({
      where: { id },
      include: {
        languages: {
          include: {
            language: true,
          },
        },
      },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
    prisma.language.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true, fileExtension: true },
    }),
  ]);

  if (!program) {
    notFound();
  }

  const initialImplementations = program.languages.map((pl) => {
    const ext = pl.language.fileExtension.startsWith(".")
      ? pl.language.fileExtension
      : `.${pl.language.fileExtension}`;
    return {
      languageId: pl.languageId,
      fileName: pl.fileName || `${program.slug.replace(/-/g, "_")}${ext}`,
      code: pl.code,
    };
  });

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
      <header className="space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-600/15 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
          <span>Edit Official Program</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
          Edit: {program.title}
        </h1>
        <p className="text-sm text-slate-700 dark:text-slate-300">
          Modify program content, manage language implementations, preview changes, or update publication status.
        </p>
      </header>

      <AdminNav />

      <ProgramForm
        mode="edit"
        categories={categories}
        languages={languages}
        initialPreviewMode={initialPreviewMode}
        initialValues={{
          id: program.id,
          title: program.title,
          slug: program.slug,
          categoryId: program.categoryId,
          difficulty: program.difficulty,
          status: program.status,
          problemStatement: program.problemStatement,
          inputDescription: program.inputDescription ?? "",
          outputDescription: program.outputDescription ?? "",
          examples: program.examples ?? "",
          explanation: program.explanation ?? "",
          algorithm: program.algorithm ?? "",
          timeComplexity: program.timeComplexity ?? "O(n)",
          spaceComplexity: program.spaceComplexity ?? "O(1)",
          implementations: initialImplementations,
        }}
      />
    </main>
  );
}
