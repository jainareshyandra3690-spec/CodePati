import type { SubmissionStatus } from "@prisma/client";

interface SubmissionStatusBadgeProps {
  status: SubmissionStatus;
  className?: string;
}

export function SubmissionStatusBadge({ status, className = "" }: SubmissionStatusBadgeProps) {
  switch (status) {
    case "PENDING":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/50 ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          Under Review
        </span>
      );
    case "APPROVED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/50 ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Approved
        </span>
      );
    case "REQUIRES_CHANGES":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border border-orange-300 dark:border-orange-700/50 ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
          Changes Requested
        </span>
      );
    case "REJECTED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700/50 ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          Rejected
        </span>
      );
    default:
      return null;
  }
}
