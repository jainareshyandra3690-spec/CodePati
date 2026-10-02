import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getAdminAuthStatus } from "@/lib/admin-auth";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminAccessDenied } from "@/components/admin/AdminAccessDenied";
import { ProgramForm } from "@/components/admin/ProgramForm";

export const dynamic = "force-dynamic";

export default async function AdminCreateProgramPage() {
  const authResult = await getAdminAuthStatus();

  if (authResult.status === "UNAUTHENTICATED") {
    redirect("/login?callbackUrl=/admin/programs/new");
  }

  if (authResult.status === "FORBIDDEN") {
    return <AdminAccessDenied user={authResult.user} />;
  }

  const [categories, languages] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
    prisma.language.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true, fileExtension: true },
    }),
  ]);

  // Pre-seed default empty tabs for the 4 core languages so admin can immediately enter code
  const defaultImplementations = languages.map((lang) => {
    const ext = lang.fileExtension.startsWith(".")
      ? lang.fileExtension
      : `.${lang.fileExtension}`;
    return {
      languageId: lang.id,
      fileName: `solution${ext}`,
      code: "",
    };
  });

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
      <header className="space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100/90 dark:bg-emerald-500/15 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30">
          <span>New Official Resource</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
          Create Program
        </h1>
        <p className="text-sm text-slate-700 dark:text-slate-300">
          Add a new programming problem, explanation, step-by-step algorithm, complexity analysis, and multi-language implementations.
        </p>
      </header>

      <AdminNav />

      <ProgramForm
        mode="create"
        categories={categories}
        languages={languages}
        initialValues={{
          title: "",
          slug: "",
          categoryId: categories[0]?.id ?? "",
          difficulty: "BEGINNER",
          status: "DRAFT",
          problemStatement: "",
          inputDescription: "",
          outputDescription: "",
          examples: "",
          explanation: "",
          algorithm: "",
          timeComplexity: "O(n)",
          spaceComplexity: "O(1)",
          implementations: defaultImplementations,
        }}
      />
    </main>
  );
}
