import Link from "next/link";

export default function ProgramNotFound() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 flex items-center justify-center">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 sm:p-10 text-center space-y-5 shadow-lg">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto font-mono font-bold text-lg">
          404
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Program Not Found
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            The requested program does not exist or is not currently published in
            the CodePati library.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/programs"
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
          >
            Browse Program Library
          </Link>
          <Link
            href="/"
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
