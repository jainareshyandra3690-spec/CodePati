import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getAdminAuthStatus } from "@/lib/admin-auth";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminAccessDenied } from "@/components/admin/AdminAccessDenied";
import {
  AdminProgramTable,
  type AdminProgramRow,
} from "@/components/admin/AdminProgramTable";

export const dynamic = "force-dynamic";

interface AdminProgramsPageProps {
  searchParams: Promise<{
    status?: string;
  }>;
}

export default async function AdminProgramsPage({
  searchParams,
}: AdminProgramsPageProps) {
  const authResult = await getAdminAuthStatus();

  if (authResult.status === "UNAUTHENTICATED") {
    redirect("/login?callbackUrl=/admin/programs");
  }

  if (authResult.status === "FORBIDDEN") {
    return <AdminAccessDenied user={authResult.user} />;
  }

  const resolved = await searchParams;
  const initialStatusFilter =
    resolved.status === "PUBLISHED" || resolved.status === "DRAFT"
      ? resolved.status
      : "";

  const dbPrograms = await prisma.program.findMany({
    orderBy: [{ updatedAt: "desc" }, { title: "asc" }],
    select: {
      id: true,
      title: true,
      slug: true,
      difficulty: true,
      status: true,
      updatedAt: true,
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      languages: {
        select: {
          language: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
    },
  });

  const rows: AdminProgramRow[] = dbPrograms.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    difficulty: p.difficulty,
    status: p.status,
    updatedAtIso: p.updatedAt.toISOString().slice(0, 10),
    category: p.category,
    languages: p.languages,
  }));

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
      <header className="space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-600/15 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
          <span>Admin Content Management</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
          Manage Programs
        </h1>
        <p className="text-sm text-slate-700 dark:text-slate-300">
          View, create, edit, publish, unpublish, or delete official CodePati programs.
        </p>
      </header>

      <AdminNav />

      <AdminProgramTable
        initialPrograms={rows}
        initialStatusFilter={initialStatusFilter}
      />
    </main>
  );
}
