import type { SubmissionType } from "@prisma/client";

interface SubmissionTypeBadgeProps {
  type: SubmissionType;
  className?: string;
}

export function SubmissionTypeBadge({ type, className = "" }: SubmissionTypeBadgeProps) {
  const configs: Record<SubmissionType, { label: string; style: string }> = {
    NEW_PROGRAM: {
      label: "New Program",
      style: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700/50",
    },
    ALTERNATIVE_SOLUTION: {
      label: "Alternative Solution",
      style: "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-700/50",
    },
    EXPLANATION: {
      label: "Explanation",
      style: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700/50",
    },
    CORRECTION: {
      label: "Correction",
      style: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700/50",
    },
    ALGORITHM: {
      label: "Algorithm",
      style: "bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300 border-teal-300 dark:border-teal-700/50",
    },
    LANGUAGE_IMPLEMENTATION: {
      label: "Language Impl",
      style: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/50",
    },
  };

  const config = configs[type] || {
    label: type,
    style: "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700",
  };

  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-medium border ${config.style} ${className}`}
    >
      {config.label}
    </span>
  );
}
