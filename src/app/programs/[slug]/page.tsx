import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { Difficulty, ProgramStatus } from "@prisma/client";
import {
  LanguageSelector,
  type ProgramImplementationItem,
} from "@/components/programs/LanguageSelector";
import { ProgramCard } from "@/components/programs/ProgramCard";
import { getRelatedPrograms } from "@/lib/programs";

export const dynamic = "force-dynamic";

interface ProgramDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

const SLUG_ALIASES: Record<string, string> = {
  "reverse-a-string": "reverse-string",
  "even-or-odd-number": "even-or-odd",
  "factorial-of-a-number": "factorial",
  "count-vowels-in-a-string": "count-vowels",
  "positive-negative-or-zero": "positive-negative-zero",
};

const LANGUAGE_ORDER: Record<string, number> = {
  c: 1,
  cpp: 2,
  java: 3,
  python: 4,
};

const difficultyStyles: Record<
  Difficulty,
  { label: string; badgeClass: string }
> = {
  BEGINNER: {
    label: "Beginner",
    badgeClass:
      "bg-emerald-100/90 text-emerald-900 border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30",
  },
  MEDIUM: {
    label: "Medium",
    badgeClass:
      "bg-amber-100/90 text-amber-900 border-amber-300 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30",
  },
  ADVANCED: {
    label: "Advanced",
    badgeClass:
      "bg-rose-100/90 text-rose-900 border-rose-300 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30",
  },
};

async function getPublishedProgram(rawSlug: string) {
  const normalized = decodeURIComponent(rawSlug).trim().toLowerCase();
  const candidateSlugs = Array.from(
    new Set([normalized, SLUG_ALIASES[normalized]].filter(Boolean) as string[])
  );

  const program = await prisma.program.findFirst({
    where: {
      slug: { in: candidateSlugs },
      status: ProgramStatus.PUBLISHED,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      problemStatement: true,
      inputDescription: true,
      outputDescription: true,
      examples: true,
      explanation: true,
      algorithm: true,
      timeComplexity: true,
      spaceComplexity: true,
      difficulty: true,
      status: true,
      category: {
        select: {
          name: true,
          slug: true,
        },
      },
      languages: {
        select: {
          id: true,
          code: true,
          fileName: true,
          language: {
            select: {
              id: true,
              name: true,
              slug: true,
              fileExtension: true,
            },
          },
        },
      },
    },
  });

  if (!program) return null;

  // Sort language implementations in canonical order: C, C++, Java, Python
  const sortedLanguages: ProgramImplementationItem[] = [...program.languages]
    .map((item) => {
      const ext = item.language.fileExtension.startsWith(".")
        ? item.language.fileExtension
        : `.${item.language.fileExtension}`;
      const fallbackFileName = `${program.slug.replace(/-/g, "_")}${ext}`;
      return {
        id: item.id,
        code: item.code,
        fileName: item.fileName || fallbackFileName,
        language: item.language,
      };
    })
    .sort(
      (a, b) =>
        (LANGUAGE_ORDER[a.language.slug] ?? 99) -
        (LANGUAGE_ORDER[b.language.slug] ?? 99)
    );

  return {
    ...program,
    languages: sortedLanguages,
  };
}

export async function generateMetadata({
  params,
}: ProgramDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const program = await getPublishedProgram(slug);
    if (!program) {
      notFound();
    }

    const description =
      program.problemStatement.slice(0, 160).trim() ||
      `Learn how to implement ${program.title} in C, C++, Java, and Python with step-by-step logic, complexity analysis, and complete code on CodePati.`;

    return {
      title: `${program.title} | CodePati`,
      description,
      openGraph: {
        title: `${program.title} | CodePati`,
        description,
        type: "article",
      },
    };
  } catch {
    return {
      title: "Program | CodePati",
    };
  }
}

export default async function ProgramDetailPage({
  params,
}: ProgramDetailPageProps) {
  const { slug } = await params;

  let program = null;
  try {
    program = await getPublishedProgram(slug);
  } catch (error) {
    console.error("[CodePati ProgramDetailPage] Database query error:", error);
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-4">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          Unable to load program details right now
        </h1>
        <p className="text-sm text-slate-700 dark:text-slate-300">
          Please try refreshing the page or return to the program library.
        </p>
        <Link
          href="/programs"
          className="inline-block px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 dark:bg-indigo-600 text-white shadow-xs"
        >
          Back to Programs
        </Link>
      </main>
    );
  }

  if (!program) {
    notFound();
  }

  const relatedPrograms = await getRelatedPrograms({
    currentProgramId: program.id,
    categorySlug: program.category.slug,
    difficulty: program.difficulty,
    limit: 3,
  });

  const diff =
    difficultyStyles[program.difficulty] ?? difficultyStyles.BEGINNER;

  // Parse algorithm lines for clean numbered step display
  const algorithmLines = (program.algorithm ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400"
      >
        <Link
          href="/"
          className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
        >
          Home
        </Link>
        <span aria-hidden="true">/</span>
        <Link
          href="/programs"
          className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
        >
          Programs
        </Link>
        <span aria-hidden="true">/</span>
        <Link
          href={`/categories/${program.category.slug}`}
          className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
        >
          {program.category.name}
        </Link>
        <span aria-hidden="true">/</span>
        <span
          aria-current="page"
          className="font-medium text-slate-800 dark:text-slate-200 truncate"
        >
          {program.title}
        </span>
      </nav>

      {/* Program Title & Badges Header */}
      <header className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href={`/difficulty/${program.difficulty.toLowerCase()}`}
            title={`Browse all ${diff.label} programs`}
            className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold border ${diff.badgeClass} hover:opacity-85 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500`}
          >
            {diff.label}
          </Link>
          <Link
            href={`/categories/${program.category.slug}`}
            title={`Browse all ${program.category.name} programs`}
            className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            {program.category.name}
          </Link>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {program.title}
        </h1>

        <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
          Explore the problem statement, worked examples, step-by-step algorithm,
          complexity analysis, and complete solutions in{" "}
          {program.languages.map((l) => l.language.name).join(", ")}.
        </p>
      </header>

      {/* 1. Problem Statement Section */}
      <section
        aria-labelledby="heading-problem"
        className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6"
      >
        <h2
          id="heading-problem"
          className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5"
        >
          <span className="w-2 h-5 rounded-full bg-indigo-600" aria-hidden="true" />
          <span>Problem Statement</span>
        </h2>

        <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed">
          {program.problemStatement}
        </p>

        {/* Input & Output Specifications */}
        {(program.inputDescription || program.outputDescription) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-300 dark:border-slate-800">
            {program.inputDescription && (
              <div className="space-y-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-300 dark:border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Input Format
                </h3>
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                  {program.inputDescription}
                </p>
              </div>
            )}
            {program.outputDescription && (
              <div className="space-y-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-300 dark:border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Output Format
                </h3>
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                  {program.outputDescription}
                </p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* 2. Examples Section */}
      {program.examples && (
        <section
          aria-labelledby="heading-examples"
          className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4"
        >
          <h2
            id="heading-examples"
            className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5"
          >
            <span className="w-2 h-5 rounded-full bg-indigo-600" aria-hidden="true" />
            <span>Examples</span>
          </h2>
          <pre className="p-4 rounded-xl bg-slate-100 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800 font-mono text-xs sm:text-sm text-slate-800 dark:text-slate-200 overflow-x-auto whitespace-pre-wrap leading-relaxed">
            {program.examples}
          </pre>
        </section>
      )}

      {/* 3. Explanation Section */}
      {program.explanation && (
        <section
          aria-labelledby="heading-explanation"
          className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4"
        >
          <h2
            id="heading-explanation"
            className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5"
          >
            <span className="w-2 h-5 rounded-full bg-indigo-600" aria-hidden="true" />
            <span>Explanation & Logic</span>
          </h2>
          <div className="prose prose-sm dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 leading-relaxed space-y-3 whitespace-pre-line text-xs sm:text-sm">
            {program.explanation}
          </div>
        </section>
      )}

      {/* 4. Algorithm Steps Section */}
      {algorithmLines.length > 0 && (
        <section
          aria-labelledby="heading-algorithm"
          className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4"
        >
          <h2
            id="heading-algorithm"
            className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5"
          >
            <span className="w-2 h-5 rounded-full bg-indigo-600" aria-hidden="true" />
            <span>Step-by-Step Algorithm</span>
          </h2>
          <ol className="space-y-3 pt-1">
            {algorithmLines.map((step, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-300 dark:border-slate-800"
              >
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-600/20 text-indigo-700 dark:text-indigo-300 font-bold text-xs shrink-0">
                  {idx + 1}
                </span>
                <span className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                  {step.replace(/^\d+[\.\)]\s*/, "")}
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* 5. Complexity Analysis Section */}
      {(program.timeComplexity || program.spaceComplexity) && (
        <section
          aria-labelledby="heading-complexity"
          className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4"
        >
          <h2
            id="heading-complexity"
            className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5"
          >
            <span className="w-2 h-5 rounded-full bg-indigo-600" aria-hidden="true" />
            <span>Complexity Analysis</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-300 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                Time Complexity
              </span>
              <code className="px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-600/15 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 font-mono font-bold text-sm">
                {program.timeComplexity || "N/A"}
              </code>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-300 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                Space Complexity
              </span>
              <code className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-mono font-bold text-sm">
                {program.spaceComplexity || "N/A"}
              </code>
            </div>
          </div>
        </section>
      )}

      {/* 6. Implementation Section (Language Selector + Code + Copy / Download) */}
      <section aria-labelledby="heading-implementation" className="space-y-4 min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2
            id="heading-implementation"
            className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5"
          >
            <span className="w-2 h-5 rounded-full bg-indigo-600" aria-hidden="true" />
            <span>Implementation</span>
          </h2>
          <span className="text-xs text-slate-600 dark:text-slate-400">
            Select a language tab to view, copy, or download the solution
          </span>
        </div>

        <LanguageSelector implementations={program.languages} />
      </section>

      {/* 7. Related Programs Section */}
      <section
        aria-labelledby="heading-related-programs"
        className="space-y-4 pt-6 border-t border-slate-300 dark:border-slate-800"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2
              id="heading-related-programs"
              className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5"
            >
              <span className="w-2 h-5 rounded-full bg-indigo-600" aria-hidden="true" />
              <span>Related Programs</span>
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Continue exploring related programming problems in {program.category.name} and {diff.label} level
            </p>
          </div>
          <Link
            href={`/categories/${program.category.slug}`}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            More in {program.category.name} &rarr;
          </Link>
        </div>

        {relatedPrograms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-1">
            {relatedPrograms.map((related) => (
              <ProgramCard key={related.id} program={related} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-8 text-center space-y-3">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              You are exploring the published programs in this topic.
            </p>
            <Link
              href="/programs"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 dark:bg-indigo-600 text-white hover:bg-indigo-700 dark:hover:bg-indigo-500 transition-colors"
            >
              Explore all programs &rarr;
            </Link>
          </div>
        )}
      </section>

      {/* 8. Continue Learning / Discovery Hub */}
      <nav
        aria-label="Continue learning navigation"
        className="rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-300 dark:border-slate-800 p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4"
      >
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <Link
            href="/programs"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <span aria-hidden="true">&larr;</span>
            <span>All Programs</span>
          </Link>
          <Link
            href={`/categories/${program.category.slug}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <span>Browse {program.category.name}</span>
          </Link>
          <Link
            href={`/difficulty/${program.difficulty.toLowerCase()}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <span>Browse {diff.label} Level</span>
          </Link>
        </div>

        <Link
          href="/categories"
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
        >
          <span>View all categories</span>
          <span aria-hidden="true">&rarr;</span>
        </Link>
      </nav>
    </main>
  );
}
