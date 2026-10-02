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
  title: "Search CodePati | Programming Programs & Concepts",
  description:
    "Search CodePati for programming problems, algorithms, categories, and implementations in C, C++, Java, and Python.",
};

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    difficulty?: string;
    language?: string;
  }>;
}

const POPULAR_SEARCHES = [
  "Palindrome",
  "Prime Number",
  "Reverse",
  "Factorial",
  "Strings",
  "Python",
  "Java",
];

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolved = await searchParams;

  const query = normalizeSearchQuery(resolved.q);
  const categorySlug = (resolved.category ?? "").trim().toLowerCase();
  const validDifficulty = normalizeDifficulty(resolved.difficulty);
  const languageSlug = (resolved.language ?? "").trim().toLowerCase();

  const hasSearchOrFilter = Boolean(
    query || categorySlug || validDifficulty || languageSlug
  );

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
    console.error("[CodePati SearchPage] Search query failed:", error);
    fetchError = true;
  }

  const countText =
    programs.length === 0
      ? "No programs found"
      : programs.length === 1
      ? "1 program found"
      : `${programs.length} programs found`;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Search Page Header */}
      <header className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-600/15 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
          <span>Global Search &amp; Discovery</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Search CodePati
        </h1>
        <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 max-w-2xl">
          Search for a program, concept, topic, or language across all published
          programming resources.
        </p>

        {/* Popular Search Suggestions */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            Popular searches:
          </span>
          {POPULAR_SEARCHES.map((term) => (
            <Link
              key={term}
              href={`/search?q=${encodeURIComponent(term)}`}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-500/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              {term}
            </Link>
          ))}
        </div>
      </header>

      {/* Unified Search + Filter Bar */}
      <ProgramFilters
        key={query}
        categories={categories}
        languages={languages}
        initialQuery={query}
        selectedCategory={categorySlug}
        selectedDifficulty={validDifficulty}
        selectedLanguage={languageSlug}
        totalResults={programs.length}
        basePath="/search"
      />

      {/* Search Results Heading Banner */}
      {hasSearchOrFilter ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-300 dark:border-slate-800 pb-4">
          <div className="space-y-0.5">
            {query ? (
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Search results for:{" "}
                <span className="text-indigo-600 dark:text-indigo-400">
                  &ldquo;{query}&rdquo;
                </span>
              </h2>
            ) : (
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Filtered Programs
              </h2>
            )}
            <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
              {countText}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-300 dark:border-slate-800 pb-4">
          <div className="space-y-0.5">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Popular Programs
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Explore all {programs.length} published programs in the CodePati
              library
            </p>
          </div>
          <Link
            href="/categories"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Explore all categories &rarr;
          </Link>
        </div>
      )}

      {/* Results Area */}
      {fetchError ? (
        <div
          role="alert"
          className="rounded-2xl bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/50 p-10 text-center space-y-4"
        >
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Search is temporarily unavailable
          </h2>
          <p className="text-sm text-slate-700 dark:text-slate-300 max-w-md mx-auto">
            We could not complete your search request right now. Please try
            again.
          </p>
          <Link
            href="/search"
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 dark:bg-indigo-600 text-white shadow-xs"
          >
            Reset Search
          </Link>
        </div>
      ) : programs.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-10 sm:p-14 text-center space-y-5 shadow-sm">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              No programs found
            </h2>
            <p className="text-sm text-slate-700 dark:text-slate-300 max-w-md mx-auto">
              We couldn&apos;t find any published programs matching{" "}
              <span className="font-semibold text-slate-900 dark:text-white">
                &ldquo;{query || "your selected filters"}&rdquo;
              </span>
              .
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
              href="/search"
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
