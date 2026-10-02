import type { Metadata } from "next";
import Link from "next/link";
import { ProgramCard, type ProgramCardData } from "@/components/programs/ProgramCard";
import { ProgramFilters, type FilterOption } from "@/components/programs/ProgramFilters";
import {
  getPublishedPrograms,
  getDiscoveryMetadata,
  normalizeSearchQuery,
  normalizeDifficulty,
} from "@/lib/programs";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "CodePati Programs | Programming Library",
  description:
    "Learn programming concepts through clear explanations, algorithms, and implementations in multiple languages.",
};

interface ProgramsPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    difficulty?: string;
    language?: string;
  }>;
}

export default async function ProgramsPage({ searchParams }: ProgramsPageProps) {
  const resolvedParams = await searchParams;

  const query = normalizeSearchQuery(resolvedParams.q);
  const categorySlug = (resolvedParams.category ?? "").trim().toLowerCase();
  const validDifficulty = normalizeDifficulty(resolvedParams.difficulty);
  const languageSlug = (resolvedParams.language ?? "").trim().toLowerCase();

  let categories: FilterOption[] = [];
  let languages: FilterOption[] = [];
  let programs: ProgramCardData[] = [];
  let fetchError = false;

  try {
    const [discovery, dbPrograms] = await Promise.all([
      getDiscoveryMetadata(),
      getPublishedPrograms({
        query,
        category: categorySlug,
        difficulty: validDifficulty,
        language: languageSlug,
      }),
    ]);

    categories = discovery.categories.map((c) => ({ name: c.name, slug: c.slug }));
    languages = discovery.languages.map((l) => ({ name: l.name, slug: l.slug }));
    programs = dbPrograms;
  } catch (error) {
    console.error("[CodePati ProgramsPage] Failed to query programs:", error);
    fetchError = true;
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Page Header */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-600/15 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
            <span>CodePati Program Library</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Browse Programs
          </h1>
          <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 max-w-3xl">
            Explore beginner-friendly programming problems and multi-language solutions with step-by-step algorithms, complexity analyses, and explanations.
          </p>
        </div>

        {/* Discovery Quick Links */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Link
            href="/categories"
            className="px-3 py-1.5 rounded-xl font-medium bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-500/40 transition-colors"
          >
            Browse Categories
          </Link>
          <Link
            href="/difficulty/beginner"
            className="px-3 py-1.5 rounded-xl font-medium bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-500/40 transition-colors"
          >
            By Difficulty
          </Link>
        </div>
      </header>

      {/* Search & Filter Controls */}
      <ProgramFilters
        key={query}
        categories={categories}
        languages={languages}
        initialQuery={query}
        selectedCategory={categorySlug}
        selectedDifficulty={validDifficulty}
        selectedLanguage={languageSlug}
        totalResults={programs.length}
        basePath="/programs"
      />

      {/* Main Content Area */}
      {fetchError ? (
        <div
          role="alert"
          className="rounded-2xl bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/50 p-8 sm:p-12 text-center space-y-4 shadow-sm"
        >
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Unable to load programs right now
          </h2>
          <p className="text-sm text-slate-700 dark:text-slate-300 max-w-md mx-auto">
            We encountered a temporary problem connecting to the program library.
            Please try again in a moment.
          </p>
          <div className="pt-2">
            <Link
              href="/programs"
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white shadow-xs transition-colors"
            >
              Retry
            </Link>
          </div>
        </div>
      ) : programs.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-10 sm:p-14 text-center space-y-5 shadow-sm">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              No programs found
            </h2>
            <p className="text-sm text-slate-700 dark:text-slate-300 max-w-md mx-auto">
              {query
                ? `We couldn't find any published programs matching "${query}".`
                : "Try changing your search or filters."}
            </p>
          </div>

          <div className="max-w-xs mx-auto text-left text-xs text-slate-600 dark:text-slate-400 space-y-1 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-300 dark:border-slate-800">
            <p className="font-semibold text-slate-700 dark:text-slate-300">
              Try:
            </p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>checking your spelling</li>
              <li>using a broader keyword</li>
              <li>removing a filter</li>
              <li>browsing categories</li>
            </ul>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <Link
              href="/programs"
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white shadow-xs transition-colors"
            >
              Clear Filters
            </Link>
            <Link
              href="/categories"
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200/75 hover:bg-slate-300/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 border border-slate-300 dark:border-slate-700 dark:text-slate-200 transition-colors"
            >
              Browse Categories
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((program) => (
            <ProgramCard key={program.id} program={program} />
          ))}
        </div>
      )}
    </main>
  );
}
