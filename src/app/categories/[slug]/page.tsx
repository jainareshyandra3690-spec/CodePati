import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { ProgramCard } from "@/components/programs/ProgramCard";
import { getPublishedPrograms } from "@/lib/programs";

export const dynamic = "force-dynamic";

interface CategoryDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: CategoryDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const normalizedSlug = decodeURIComponent(slug).trim().toLowerCase();

  try {
    const category = await prisma.category.findUnique({
      where: { slug: normalizedSlug },
      select: { name: true, description: true },
    });

    if (!category) {
      return { title: "Category Not Found | CodePati" };
    }

    return {
      title: `${category.name} Programs | CodePati`,
      description:
        category.description ||
        `Explore published ${category.name} programming problems and implementations on CodePati.`,
    };
  } catch {
    return { title: "Category | CodePati" };
  }
}

export default async function CategoryDetailPage({
  params,
}: CategoryDetailPageProps) {
  const { slug } = await params;
  const normalizedSlug = decodeURIComponent(slug).trim().toLowerCase();

  const category = await prisma.category.findUnique({
    where: { slug: normalizedSlug },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
    },
  });

  if (!category) {
    notFound();
  }

  const programs = await getPublishedPrograms({ category: category.slug });

  const countLabel =
    programs.length === 0
      ? "No programs found"
      : programs.length === 1
      ? "1 program found"
      : `${programs.length} programs found`;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400"
      >
        <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400">
          Home
        </Link>
        <span aria-hidden="true">/</span>
        <Link
          href="/categories"
          className="hover:text-indigo-600 dark:hover:text-indigo-400"
        >
          Categories
        </Link>
        <span aria-hidden="true">/</span>
        <span className="font-medium text-slate-800 dark:text-slate-200">
          {category.name}
        </span>
      </nav>

      {/* Category Header */}
      <header className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-600/15 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
            Category
          </span>
          <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
            {countLabel}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {category.name}
        </h1>

        {category.description && (
          <p className="text-base text-slate-700 dark:text-slate-300 max-w-3xl">
            {category.description}
          </p>
        )}
      </header>

      {/* Programs in Category */}
      {programs.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-10 text-center space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            No published programs in {category.name} yet
          </h2>
          <p className="text-sm text-slate-700 dark:text-slate-300 max-w-md mx-auto">
            Explore other categories or browse the full CodePati program library.
          </p>
          <div className="flex justify-center gap-3 pt-1">
            <Link
              href="/categories"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 dark:bg-indigo-600 text-white shadow-xs"
            >
              All Categories
            </Link>
            <Link
              href="/programs"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
            >
              All Programs
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((prog) => (
            <ProgramCard key={prog.id} program={prog} />
          ))}
        </div>
      )}
    </main>
  );
}
