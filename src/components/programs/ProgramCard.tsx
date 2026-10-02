import Link from "next/link";
import type { Difficulty } from "@prisma/client";

export interface ProgramCardData {
  id: string;
  title: string;
  slug: string;
  problemStatement: string;
  difficulty: Difficulty;
  timeComplexity: string | null;
  spaceComplexity: string | null;
  category: {
    name: string;
    slug: string;
  };
  languages: {
    language: {
      id: string;
      name: string;
      slug: string;
    };
  }[];
}

const difficultyConfig: Record<
  Difficulty,
  { label: string; badgeClass: string; dotClass: string }
> = {
  BEGINNER: {
    label: "Beginner",
    badgeClass:
      "bg-emerald-100/90 text-emerald-900 border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30",
    dotClass: "bg-emerald-600 dark:bg-emerald-400",
  },
  MEDIUM: {
    label: "Medium",
    badgeClass:
      "bg-amber-100/90 text-amber-900 border-amber-300 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30",
    dotClass: "bg-amber-600 dark:bg-amber-400",
  },
  ADVANCED: {
    label: "Advanced",
    badgeClass:
      "bg-rose-100/90 text-rose-900 border-rose-300 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30",
    dotClass: "bg-rose-600 dark:bg-rose-400",
  },
};

function createExcerpt(text: string, maxLength = 125): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= maxLength) return cleaned;
  return cleaned.slice(0, maxLength).trimEnd() + "...";
}

export function ProgramCard({ program }: { program: ProgramCardData }) {
  const diff = difficultyConfig[program.difficulty] ?? difficultyConfig.BEGINNER;
  const excerpt = createExcerpt(program.problemStatement);

  const languageNames = program.languages.map((item) => item.language.name);

  return (
    <Link
      href={`/programs/${program.slug}`}
      className="group flex flex-col justify-between rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500/50 p-6 shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 block text-left"
      aria-label={`View program: ${program.title}`}
    >
      <div className="space-y-4">
        {/* Badges Row: Difficulty & Category */}
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold border ${diff.badgeClass}`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${diff.dotClass}`}
              aria-hidden="true"
            />
            {diff.label}
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
            {program.category.name}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-lg font-bold tracking-tight text-slate-950 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {program.title}
        </h2>

        {/* Short Excerpt */}
        <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed">
          {excerpt}
        </p>
      </div>

      {/* Card Footer: Languages & Action Link */}
      <div className="pt-5 mt-5 border-t border-slate-200 dark:border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between gap-2 text-xs text-slate-700 dark:text-slate-300">
          <span
            className="font-mono font-medium truncate"
            title={languageNames.join(" · ")}
          >
            {languageNames.length > 0
              ? languageNames.join(" · ")
              : "Multi-language"}
          </span>
          {program.timeComplexity && (
            <span className="shrink-0 font-mono font-semibold text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
              {program.timeComplexity}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">
            <span>View Program</span>
            <span
              aria-hidden="true"
              className="transition-transform duration-150 group-hover:translate-x-0.5"
            >
              &rarr;
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}

export default ProgramCard;
