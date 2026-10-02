import React from "react";

export type BadgeVariant =
  | "default"
  | "cyan"
  | "beginner"
  | "medium"
  | "advanced";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  default:
    "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700",
  cyan:
    "bg-cyan-50 text-cyan-800 border-cyan-300 dark:bg-cyan-500/15 dark:text-cyan-300 dark:border-cyan-500/30",
  beginner:
    "bg-emerald-100/90 text-emerald-900 border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30",
  medium:
    "bg-amber-100/90 text-amber-900 border-amber-300 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30",
  advanced:
    "bg-rose-100/90 text-rose-900 border-rose-300 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30",
};

export function Badge({
  variant = "default",
  className = "",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold border ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

export default Badge;
