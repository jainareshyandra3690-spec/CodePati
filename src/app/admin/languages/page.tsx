import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getAdminAuthStatus } from "@/lib/admin-auth";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminAccessDenied } from "@/components/admin/AdminAccessDenied";
import {
  LanguagesManager,
  type AdminLanguageItem,
} from "@/components/admin/LanguagesManager";

export const dynamic = "force-dynamic";

export default async function AdminLanguagesPage() {
  const authResult = await getAdminAuthStatus();

  if (authResult.status === "UNAUTHENTICATED") {
    redirect("/login?callbackUrl=/admin/languages");
  }

  if (authResult.status === "FORBIDDEN") {
    return <AdminAccessDenied user={authResult.user} />;
  }

  const dbLanguages = await prisma.language.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      fileExtension: true,
      _count: {
        select: { programLanguages: true },
      },
    },
  });

  const languages: AdminLanguageItem[] = dbLanguages.map((l) => ({
    id: l.id,
    name: l.name,
    slug: l.slug,
    fileExtension: l.fileExtension,
    implementationCount: l._count.programLanguages,
  }));

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
      <header className="space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-600/15 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
          <span>Admin Content Management</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
          Manage Languages
        </h1>
        <p className="text-sm text-slate-700 dark:text-slate-300">
          Configure programming languages, slugs, and required file extensions.
        </p>
      </header>

      <AdminNav />

      <LanguagesManager initialLanguages={languages} />
    </main>
  );
}
