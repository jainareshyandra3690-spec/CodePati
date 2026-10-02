"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export interface FilterOption {
  name: string;
  slug: string;
}

interface ProgramFiltersProps {
  categories: FilterOption[];
  languages: FilterOption[];
  initialQuery: string;
  selectedCategory: string;
  selectedDifficulty: string;
  selectedLanguage: string;
  totalResults: number;
  basePath?: string;
}

const DIFFICULTY_OPTIONS = [
  { label: "All Difficulties", value: "" },
  { label: "Beginner", value: "BEGINNER" },
  { label: "Medium", value: "MEDIUM" },
  { label: "Advanced", value: "ADVANCED" },
];

export function ProgramFilters({
  categories,
  languages,
  initialQuery,
  selectedCategory,
  selectedDifficulty,
  selectedLanguage,
  totalResults,
  basePath,
}: ProgramFiltersProps) {
  const router = useRouter();
  const currentPathname = usePathname();
  const pathname = basePath || currentPathname;
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchValue, setSearchValue] = useState(initialQuery);

  const updateUrlParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, val] of Object.entries(updates)) {
      const normalized = val.trim().replace(/\s+/g, " ");
      if (normalized) {
        params.set(key, normalized);
      } else {
        params.delete(key);
      }
    }
    const queryString = params.toString();
    const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;
    startTransition(() => {
      router.push(targetUrl, { scroll: false });
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrlParams({ q: searchValue });
  };

  const handleClearAll = () => {
    setSearchValue("");
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  };

  const hasActiveFilters = Boolean(
    initialQuery.trim() ||
      selectedCategory ||
      selectedDifficulty ||
      selectedLanguage
  );

  const activeCategoryName =
    categories.find((c) => c.slug === selectedCategory)?.name ||
    selectedCategory;
  const activeLanguageName =
    languages.find((l) => l.slug === selectedLanguage)?.name ||
    selectedLanguage;
  const activeDifficultyLabel =
    DIFFICULTY_OPTIONS.find((d) => d.value === selectedDifficulty)?.label ||
    selectedDifficulty;

  const resultLabel =
    totalResults === 0
      ? "No programs found"
      : totalResults === 1
      ? "1 program found"
      : `${totalResults} programs found`;

  const selectClassName =
    "w-full h-11 px-3 rounded-xl " +
    "bg-slate-50 hover:bg-slate-100/80 focus:bg-white " +
    "dark:bg-slate-950 dark:hover:bg-slate-900 dark:focus:bg-slate-950 " +
    "border border-slate-300 dark:border-slate-700 " +
    "focus:border-indigo-600 dark:focus:border-indigo-400 " +
    "text-sm font-medium text-slate-900 dark:text-slate-100 " +
    "dark:[color-scheme:dark] " +
    "focus:outline-none focus:ring-2 focus:ring-indigo-600/25 dark:focus:ring-indigo-400/30 transition-colors";

  const optionClassName =
    "bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100";

  return (
    <section
      aria-label="Search and filter programs"
      className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-5"
    >
      {/* Search Bar + Filter Dropdowns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Search Form (5 columns on desktop) */}
        <form
          onSubmit={handleSearchSubmit}
          className="lg:col-span-5 flex items-center gap-2"
          role="search"
        >
          <label htmlFor="program-search-input" className="sr-only">
            Search programs
          </label>
          <div className="relative flex-1 flex items-center">
            <svg
              className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute left-3.5 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 103.5 10.5a7.5 7.5 0 0013.15 6.15z"
              />
            </svg>
            <input
              id="program-search-input"
              name="q"
              type="search"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search programs..."
              className="w-full h-11 pl-10 pr-9 rounded-xl bg-slate-50 hover:bg-slate-100/80 focus:bg-white dark:bg-slate-950 dark:hover:bg-slate-900 dark:focus:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-indigo-600 dark:focus:border-indigo-400 text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 selection:bg-indigo-600/20 selection:text-slate-900 dark:selection:bg-indigo-600/35 dark:selection:text-white dark:[color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-indigo-600/25 dark:focus:ring-indigo-400/30 transition-all"
            />
            {searchValue && (
              <button
                type="button"
                onClick={() => {
                  setSearchValue("");
                  updateUrlParams({ q: "" });
                }}
                aria-label="Clear search query"
                className="absolute right-2.5 p-1 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
          <button
            type="submit"
            className="h-11 px-4 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white shadow-xs transition-colors shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            Search
          </button>
        </form>

        {/* Filter Controls (7 columns on desktop, 3-col subgrid on tablet, 1-col on mobile) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Category Filter */}
          <div>
            <label htmlFor="filter-category" className="sr-only">
              Filter by category
            </label>
            <select
              id="filter-category"
              value={selectedCategory}
              onChange={(e) => updateUrlParams({ category: e.target.value })}
              className={selectClassName}
            >
              <option value="" className={optionClassName}>
                All Categories
              </option>
              {categories.map((cat) => (
                <option
                  key={cat.slug}
                  value={cat.slug}
                  className={optionClassName}
                >
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <label htmlFor="filter-difficulty" className="sr-only">
              Filter by difficulty
            </label>
            <select
              id="filter-difficulty"
              value={selectedDifficulty}
              onChange={(e) => updateUrlParams({ difficulty: e.target.value })}
              className={selectClassName}
            >
              {DIFFICULTY_OPTIONS.map((opt) => (
                <option
                  key={opt.value || "all"}
                  value={opt.value}
                  className={optionClassName}
                >
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Language Filter */}
          <div>
            <label htmlFor="filter-language" className="sr-only">
              Filter by programming language
            </label>
            <select
              id="filter-language"
              value={selectedLanguage}
              onChange={(e) => updateUrlParams({ language: e.target.value })}
              className={selectClassName}
            >
              <option value="" className={optionClassName}>
                All Languages
              </option>
              {languages.map((lang) => (
                <option
                  key={lang.slug}
                  value={lang.slug}
                  className={optionClassName}
                >
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Status Bar: Result Count, Active Filter Pills, and Clear Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800/80 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-slate-900 dark:text-slate-200">
            {resultLabel}
          </span>

          {isPending && (
            <span
              role="status"
              className="inline-flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-semibold"
            >
              <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-ping" />
              Updating...
            </span>
          )}

          {/* Active Filter Pills */}
          {initialQuery.trim() && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-900 border border-indigo-200 dark:bg-indigo-950/70 dark:text-indigo-200 dark:border-indigo-500/40 font-semibold">
              <span>Search: {initialQuery.trim()}</span>
              <button
                type="button"
                onClick={() => {
                  setSearchValue("");
                  updateUrlParams({ q: "" });
                }}
                aria-label="Remove search filter"
                className="text-indigo-600 hover:text-indigo-950 dark:text-indigo-300 dark:hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded px-0.5"
              >
                &times;
              </button>
            </span>
          )}

          {selectedCategory && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-900 border border-indigo-200 dark:bg-indigo-950/70 dark:text-indigo-200 dark:border-indigo-500/40 font-semibold">
              <span>Category: {activeCategoryName}</span>
              <button
                type="button"
                onClick={() => updateUrlParams({ category: "" })}
                aria-label="Remove category filter"
                className="text-indigo-600 hover:text-indigo-950 dark:text-indigo-300 dark:hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded px-0.5"
              >
                &times;
              </button>
            </span>
          )}

          {selectedDifficulty && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-900 border border-indigo-200 dark:bg-indigo-950/70 dark:text-indigo-200 dark:border-indigo-500/40 font-semibold">
              <span>Difficulty: {activeDifficultyLabel}</span>
              <button
                type="button"
                onClick={() => updateUrlParams({ difficulty: "" })}
                aria-label="Remove difficulty filter"
                className="text-indigo-600 hover:text-indigo-950 dark:text-indigo-300 dark:hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded px-0.5"
              >
                &times;
              </button>
            </span>
          )}

          {selectedLanguage && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-900 border border-indigo-200 dark:bg-indigo-950/70 dark:text-indigo-200 dark:border-indigo-500/40 font-semibold">
              <span>Language: {activeLanguageName}</span>
              <button
                type="button"
                onClick={() => updateUrlParams({ language: "" })}
                aria-label="Remove language filter"
                className="text-indigo-600 hover:text-indigo-950 dark:text-indigo-300 dark:hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded px-0.5"
              >
                &times;
              </button>
            </span>
          )}
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClearAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-200/80 hover:bg-slate-300/80 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            Clear Filters
          </button>
        )}
      </div>
    </section>
  );
}

export default ProgramFilters;
