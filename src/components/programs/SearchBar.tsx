"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface SearchBarProps {
  initialQuery?: string;
  targetPath?: string;
  placeholder?: string;
  inputId?: string;
  compact?: boolean;
}

export function SearchBar({
  initialQuery = "",
  targetPath = "/search",
  placeholder = "Search programs, concepts, or languages...",
  inputId = "codepati-search-input",
  compact = false,
}: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = query.trim().replace(/\s+/g, " ");
    const destination = normalized
      ? `${targetPath}?q=${encodeURIComponent(normalized)}`
      : targetPath;
    startTransition(() => {
      router.push(destination);
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      aria-label="Search CodePati programs"
      className="w-full"
    >
      <label htmlFor={inputId} className="sr-only">
        Search programs
      </label>
      <div className="relative flex items-center gap-2">
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
            id={inputId}
            name="q"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className={`w-full pl-10 pr-9 rounded-xl bg-slate-50 hover:bg-slate-100/80 focus:bg-white dark:bg-slate-950 dark:hover:bg-slate-900 dark:focus:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-indigo-600 dark:focus:border-indigo-400 font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 selection:bg-indigo-600/20 selection:text-slate-900 dark:selection:bg-indigo-600/35 dark:selection:text-white dark:[color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-indigo-600/25 dark:focus:ring-indigo-400/30 transition-all ${
              compact ? "h-9 text-xs" : "h-11 sm:h-12 text-sm"
            }`}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search text"
              className="absolute right-2.5 p-1 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-colors"
            >
              <svg
                className="w-3.5 h-3.5"
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
          disabled={isPending}
          className={`shrink-0 inline-flex items-center justify-center font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white shadow-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-60 ${
            compact ? "h-9 px-3 text-xs" : "h-11 sm:h-12 px-5 text-xs sm:text-sm"
          }`}
        >
          {isPending ? "Searching..." : "Search"}
        </button>
      </div>
    </form>
  );
}

export default SearchBar;
