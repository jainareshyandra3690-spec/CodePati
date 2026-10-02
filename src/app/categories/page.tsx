import type { Metadata } from "next";
import Link from "next/link";
import { getDiscoveryMetadata } from "@/lib/programs";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "CodePati Categories | Browse Programming Topics",
  description:
    "Explore programming categories in CodePati including Numbers, Strings, Conditional Statements, Mathematics, Arrays, and Algorithms.",
};

export default async function CategoriesPage() {
  let categories: Awaited<ReturnType<typeof getDiscoveryMetadata>>["categories"] = [];
  let fetchError = false;

  try {
    const discovery = await getDiscoveryMetadata();
    categories = discovery.categories;
  } catch (error) {
    console.error("[CodePati CategoriesPage] Failed to load categories:", error);
    fetchError = true;
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400"
      >
        <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400">
          Home
        </Link>
        <span aria-hidden="true">/</span>
        <span className="font-medium text-slate-800 dark:text-slate-200">
          Categories
        </span>
      </nav>

      {/* Header */}
      <header className="space-y-2.5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-600/15 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
          <span>Topic Discovery</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Program Categories
        </h1>
        <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 max-w-3xl">
          Browse structured programming problems organized by fundamental
          computer science concepts and problem domains.
        </p>
      </header>

      {fetchError ? (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/50 p-8 text-center space-y-3">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            Unable to load categories right now.
          </p>
          <Link
            href="/categories"
            className="inline-block px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 dark:bg-indigo-600 text-white shadow-xs"
          >
            Retry
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="group flex flex-col justify-between rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500/50 p-6 shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 block text-left"
              aria-label={`Explore category: ${cat.name}`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {cat.name}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-indigo-50 dark:bg-indigo-600/15 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                    Programs: {cat.programCount}
                  </span>
                </div>

                {cat.description && (
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {cat.description}
                  </p>
                )}
              </div>

              <div className="pt-5 mt-5 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">
                  <span>Explore {cat.name}</span>
                  <span
                    aria-hidden="true"
                    className="transition-transform group-hover:translate-x-0.5"
                  >
                    &rarr;
                  </span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
