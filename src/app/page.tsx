import Link from "next/link";
import prisma from "@/lib/prisma";
import { SearchBar } from "@/components/programs/SearchBar";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let categories: { id: string; name: string; slug: string }[] = [];
  let languages: { id: string; name: string; slug: string; fileExtension: string }[] = [];
  let featuredPrograms: {
    id: string;
    title: string;
    slug: string;
    difficulty: string;
    timeComplexity: string | null;
    category: { name: string };
    _count: { languages: number };
  }[] = [];
  let publishedProgramCount = 0;
  let implementationCount = 0;

  try {
    const [dbCategories, dbLanguages, dbPrograms, totalPrograms, totalImpls] =
      await Promise.all([
        prisma.category.findMany({
          orderBy: { name: "asc" },
          select: { id: true, name: true, slug: true },
        }),
        prisma.language.findMany({
          orderBy: { name: "asc" },
          select: { id: true, name: true, slug: true, fileExtension: true },
        }),
        prisma.program.findMany({
          where: { status: "PUBLISHED" },
          orderBy: { title: "asc" },
          take: 6,
          select: {
            id: true,
            title: true,
            slug: true,
            difficulty: true,
            timeComplexity: true,
            category: { select: { name: true } },
            _count: { select: { languages: true } },
          },
        }),
        prisma.program.count({
          where: { status: "PUBLISHED" },
        }),
        prisma.programLanguage.count({
          where: {
            program: { status: "PUBLISHED" },
          },
        }),
      ]);

    categories = dbCategories;
    languages = dbLanguages;
    featuredPrograms = dbPrograms;
    publishedProgramCount = totalPrograms;
    implementationCount = totalImpls;
  } catch (err: unknown) {
    console.error("[CodePati HomePage] Data loading error:", err);
  }

  const difficultyTracks = [
    {
      level: "Beginner",
      slug: "beginner",
      description: "Build core skills in loops, conditions, and basic math.",
      badgeClass:
        "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30",
    },
    {
      level: "Medium",
      slug: "medium",
      description: "Solve intermediate data structures and algorithmic patterns.",
      badgeClass:
        "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30",
    },
    {
      level: "Advanced",
      slug: "advanced",
      description: "Master optimization, recursion, and complex time complexity.",
      badgeClass:
        "bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30",
    },
  ];

  const whyFeatures = [
    {
      icon: "📚",
      title: "Structured Programs",
      description:
        "Understand the problem, worked example, logic, algorithm, and complexity.",
    },
    {
      icon: "💻",
      title: "4 Programming Languages",
      description:
        "Side-by-side solutions in C, C++, Java, and Python with line numbers.",
    },
    {
      icon: "🧠",
      title: "Beginner-Friendly Explanations",
      description:
        "Learn how the algorithm actually works instead of just copying code.",
    },
    {
      icon: "⚡",
      title: "Time & Space Complexity",
      description:
        "Learn Big-O execution efficiency and spatial analysis for every problem.",
    },
  ];

  return (
    <main className="p-6 sm:p-10 max-w-6xl mx-auto space-y-12">
      {/* 1. Hero Search & Discovery Section */}
      <section className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-6 sm:p-10 shadow-sm space-y-6">
        <div className="space-y-3 max-w-3xl">
          <div className="inline-block px-3 py-1 bg-indigo-50 dark:bg-indigo-600/15 text-indigo-700 dark:text-indigo-300 text-xs font-semibold rounded-full border border-indigo-200 dark:border-indigo-500/30">
            CodePati Learning Platform
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            Learn Programming.{" "}
            <span className="text-indigo-600 dark:text-indigo-400">
              One Program at a Time.
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300">
            Understand the problem. Learn the logic. Compare implementations in
            C, C++, Java, and Python.
          </p>
        </div>

        {/* Prominent Homepage Search Bar -> submits to /search?q=<query> */}
        <div className="max-w-2xl space-y-3">
          <SearchBar
            targetPath="/search"
            placeholder="Search programs, concepts, or languages..."
            inputId="home-hero-search"
          />

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-600 dark:text-slate-400 font-medium">
              Popular:
            </span>
            {["Palindrome", "Prime Number", "Reverse", "Factorial"].map(
              (term) => (
                <Link
                  key={term}
                  href={`/search?q=${encodeURIComponent(term)}`}
                  className="px-2.5 py-1 rounded-lg bg-slate-200/75 hover:bg-slate-300/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 border border-slate-300 dark:border-slate-700 dark:text-slate-300 transition-colors"
                >
                  {term}
                </Link>
              )
            )}
          </div>
        </div>

        {/* Discovery Action Links */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-200 dark:border-slate-800/80">
          <Link
            href="/programs"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white shadow-xs transition-colors"
          >
            Browse All Programs &rarr;
          </Link>
          <Link
            href="/categories"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200/75 hover:bg-slate-300/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 border border-slate-300 dark:border-slate-700 dark:text-slate-200 transition-colors"
          >
            Explore Categories ({categories.length})
          </Link>
          <Link
            href="/difficulty/beginner"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-100/90 hover:bg-emerald-200/80 text-emerald-900 border border-emerald-300 dark:bg-emerald-500/15 dark:hover:bg-emerald-500/25 dark:text-emerald-300 dark:border-emerald-500/30 transition-colors"
          >
            Beginner Track
          </Link>
        </div>
      </section>

      {/* 2. Platform Statistics Ribbon */}
      <section
        aria-label="Platform Statistics"
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-center space-y-1 shadow-xs">
          <p className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
            {languages.length}
          </p>
          <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
            Languages
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-center space-y-1 shadow-xs">
          <p className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
            {categories.length}
          </p>
          <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
            Categories
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-center space-y-1 shadow-xs">
          <p className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
            {publishedProgramCount}
          </p>
          <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
            Published Programs
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-center space-y-1 shadow-xs">
          <p className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
            {implementationCount}
          </p>
          <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
            Code Solutions
          </p>
        </div>
      </section>

      {/* 3. Why Learn with CodePati Section */}
      <section
        aria-labelledby="heading-why-codepati"
        className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6"
      >
        <div className="space-y-1.5">
          <h2
            id="heading-why-codepati"
            className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
          >
            Why Learn with CodePati?
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
            A structured, pedagogical approach designed to build real algorithmic intuition rather than rote code memorization.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {whyFeatures.map((feat) => (
            <div
              key={feat.title}
              className="p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-300 dark:border-slate-800 space-y-2 hover:border-indigo-500/40 transition-colors"
            >
              <span className="text-2xl" aria-hidden="true">
                {feat.icon}
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {feat.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {feat.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Learning Difficulty Tracks */}
      <section
        aria-labelledby="heading-difficulty-tracks"
        className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="space-y-1">
            <h2
              id="heading-difficulty-tracks"
              className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
            >
              Learning Tracks by Difficulty
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Start from first principles and progress step-by-step to advanced concepts.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {difficultyTracks.map((track) => (
            <Link
              key={track.slug}
              href={`/difficulty/${track.slug}`}
              className="group p-5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-300 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500/50 transition-all flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold border ${track.badgeClass}`}
                >
                  {track.level}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {track.level} Programs
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {track.description}
                </p>
              </div>
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:underline inline-flex items-center gap-1">
                <span>Explore Track</span>
                <span aria-hidden="true">&rarr;</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. Languages & Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Languages Card */}
        <section
          id="languages"
          aria-labelledby="heading-languages"
          className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-sm space-y-4"
        >
          <div className="flex justify-between items-center">
            <h2
              id="heading-languages"
              className="text-base font-bold text-slate-900 dark:text-white"
            >
              Discover by Language
            </h2>
            <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md font-mono border border-slate-300 dark:border-slate-700">
              {languages.length} languages
            </span>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {languages.map((lang) => {
              const ext = lang.fileExtension.startsWith(".")
                ? lang.fileExtension
                : `.${lang.fileExtension}`;
              return (
                <Link
                  key={lang.id}
                  href={`/programs?language=${lang.slug}`}
                  className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-600/15 dark:hover:bg-indigo-500/25 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 text-xs font-semibold transition-colors"
                >
                  {lang.name} ({ext})
                </Link>
              );
            })}
          </div>
        </section>

        {/* Categories Card */}
        <section
          id="categories"
          aria-labelledby="heading-categories"
          className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-sm space-y-4"
        >
          <div className="flex justify-between items-center">
            <h2
              id="heading-categories"
              className="text-base font-bold text-slate-900 dark:text-white"
            >
              Discover by Category
            </h2>
            <Link
              href="/categories"
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
            >
              View all {categories.length} &rarr;
            </Link>
          </div>
          <div className="flex flex-wrap gap-2 pt-1 max-h-36 overflow-y-auto">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-300 text-xs font-medium border border-slate-300 dark:border-slate-700 transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* 6. Featured Published Programs (take: 6) */}
      <section
        id="programs"
        aria-labelledby="heading-featured-programs"
        className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-sm space-y-5"
      >
        <div className="flex flex-wrap justify-between items-center gap-2">
          <div>
            <h2
              id="heading-featured-programs"
              className="text-xl font-bold text-slate-900 dark:text-white"
            >
              Featured Published Programs
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Explore step-by-step algorithms, complexity analyses, and solutions across languages.
            </p>
          </div>
          <Link
            href="/programs"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            View All Programs &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
          {featuredPrograms.map((prog) => (
            <Link
              key={prog.id}
              href={`/programs/${prog.slug}`}
              className="flex items-center justify-between gap-2 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-300 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500/50 text-xs transition-colors group"
            >
              <div className="min-w-0 space-y-1">
                <p className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate transition-colors">
                  {prog.title}
                </p>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] truncate">
                  {prog.category.name} • {prog.difficulty}
                  {prog.timeComplexity ? ` • ${prog.timeComplexity}` : ""}
                </p>
              </div>
              <span className="shrink-0 px-2 py-0.5 rounded bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[10px] border border-slate-300 dark:border-slate-700">
                {prog._count.languages} langs
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
