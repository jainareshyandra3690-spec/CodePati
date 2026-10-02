"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/layout/Logo";

function LoginForm() {
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const getErrorMessage = (err: string | null) => {
    if (!err) return null;
    switch (err) {
      case "OAuthSignin":
      case "OAuthCallbackError":
        return "Could not connect to Google OAuth. Please check your credentials or network.";
      case "OAuthCreateAccount":
        return "Could not create user account. Please try again.";
      case "AccessDenied":
        return "Access was denied. Please sign in with an authorized Google account.";
      case "Configuration":
        return "Server authentication configuration error. Please ensure AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET are set.";
      default:
        return "An unexpected authentication error occurred. Please try again.";
    }
  };

  const errorMessage = getErrorMessage(error);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signIn("google", { callbackUrl });
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 sm:p-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl space-y-8 transition-colors">
      {/* Brand Header */}
      <div className="flex flex-col items-center text-center space-y-3">
        <Logo />
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white pt-2">
          Sign in to CodePati
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xs">
          Learn programming through logic, examples, and code.
        </p>
      </div>

      {/* Error Message Alert */}
      {errorMessage && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs sm:text-sm flex items-start gap-2.5"
        >
          <svg
            className="w-5 h-5 shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Google OAuth Action */}
      <div className="space-y-4">
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full h-12 flex items-center justify-center gap-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-white font-medium text-sm transition-all duration-150 shadow-sm hover:shadow disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          {loading ? (
            /* Loading Spinner */
            <svg
              className="animate-spin h-5 w-5 text-indigo-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            /* Google G Icon */
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
          )}
          <span>{loading ? "Connecting to Google..." : "Sign in with Google"}</span>
        </button>

        <p className="text-xs text-center text-slate-500 dark:text-slate-400">
          Sign in securely. Your account role is automatically assigned as{" "}
          <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">USER</span>.
        </p>
      </div>

      {/* Footer Navigation */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-center">
        <Link
          href="/"
          className="text-xs text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors inline-flex items-center gap-1"
        >
          <span>&larr;</span>
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <Suspense
        fallback={
          <div className="w-full max-w-md p-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse text-center text-slate-400">
            Loading sign in...
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </main>
  );
}
