import React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const variants = {
    primary:
      "bg-cyan-700 hover:bg-cyan-800 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white border border-transparent shadow-xs",
    secondary:
      "bg-slate-200/80 hover:bg-slate-300/80 text-slate-900 border border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 dark:border-slate-700",
    outline:
      "bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 dark:bg-transparent dark:hover:bg-slate-900 dark:text-slate-200 dark:border-slate-700",
    ghost:
      "bg-transparent hover:bg-slate-100 text-slate-700 dark:hover:bg-slate-900 dark:text-slate-300",
  };

  const sizes = {
    sm: "h-9 px-3 text-xs rounded-lg",
    md: "h-10 px-4 text-sm rounded-xl",
    lg: "h-11 px-5 text-sm rounded-xl",
  };

  return (
    <button
      className={`inline-flex items-center justify-center font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 disabled:opacity-60 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
