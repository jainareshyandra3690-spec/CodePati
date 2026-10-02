import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Difficulty } from "@prisma/client";
import { ProgramCard } from "@/components/programs/ProgramCard";
import { getPublishedPrograms, normalizeDifficulty } from "@/lib/programs";

export const dynamic = "force-dynamic";

interface DifficultyPageProps {
  params: Promise<{
    level: string;
  }>;
}

const DIFFICULTY_META: Record<
  Difficulty,
  { label: string; slug: string; description: string }
> = {
  BEGINNER: {
    label: "Beginner",
    slug: "beginner",
    description:
      "Foundational programming problems designed to build core logic, arithmetic, conditional, and loop skills.",
  },
  MEDIUM: {
    label: "Medium",
    slug: "medium",
    description:
      "Intermediate algorithms and data structure problems requiring multi-step problem solving.",
  },
  ADVANCED: {
    label: "Advanced",
    slug: "advanced",
    description:
      "Complex algorithmic challenges focusing on optimization, time complexity, and advanced techniques.",
  },
};

export async function generateMetadata({
  params,
}: DifficultyPageProps): Promise<Metadata> {
  const { level } = await params;
  const diff = normalizeDifficulty(level);
  if (!diff) {
    return { title: "Difficulty Not Found | CodePati" };
  }
  const meta = DIFFICULTY_META[diff];
  return {
    title: `CodePati ${meta.label} Programs`,
    description: meta.description,
  };
}

export default async function DifficultyPage({ params }: DifficultyPageProps) {
  const { level } = await params;
  const diff = normalizeDifficulty(level);

  if (!diff) {
    notFound();
  }

  const meta = DIFFICULTY_META[diff];
  const programs = await getPublishedPrograms({ difficulty: diff });

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
          href="/programs"
          className="hover:text-indigo-600 dark:hover:text-indigo-400"
        >
          Programs
        </Link>
        <span aria-hidden="true">/</span>
        <span className="font-medium text-slate-800 dark:text-slate-200">
          {meta.label} Difficulty
        </span>
      </nav>

      {/* Header + Difficulty Switcher */}
      <header className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {(Object.keys(DIFFICULTY_META) as Difficulty[]).map((key) => {
              const item = DIFFICULTY_META[key];
              const isActive = key === diff;
              return (
                <Link
                  key={item.slug}
                  href={`/difficulty/${item.slug}`}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    isActive
                      ? "bg-indigo-600 dark:bg-indigo-600 text-white shadow-xs"
                      : "bg-slate-200/75 hover:bg-slate-300/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 border border-slate-300 dark:border-slate-700 dark:text-slate-300"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
            {countLabel}
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {meta.label} Programs
          </h1>
          <p className="text-base text-slate-700 dark:text-slate-300 max-w-3xl">
            {meta.description}
          </p>
        </div>
      </header>

      {/* Programs Grid */}
      {programs.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-10 text-center space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            No published {meta.label.toLowerCase()} programs yet
          </h2>
          <p className="text-sm text-slate-700 dark:text-slate-300 max-w-md mx-auto">
            Browse our Beginner programs or explore the full program library.
          </p>
          <div className="flex justify-center gap-3 pt-1">
            <Link
              href="/difficulty/beginner"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 dark:bg-indigo-600 text-white shadow-xs"
            >
              Beginner Programs
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
