export default function ProgramsLoading() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header Skeleton */}
      <div className="space-y-3">
        <div className="h-8 w-64 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
        <div className="h-4 w-full max-w-xl rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
      </div>

      {/* Filter Bar Skeleton */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-5 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="h-11 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            <div className="h-11 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            <div className="h-11 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4"
          >
            <div className="flex gap-2">
              <div className="h-5 w-16 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
              <div className="h-5 w-24 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
            </div>
            <div className="h-6 w-3/4 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-full rounded bg-slate-100 dark:bg-slate-800/70 animate-pulse" />
              <div className="h-4 w-4/5 rounded bg-slate-100 dark:bg-slate-800/70 animate-pulse" />
            </div>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between">
              <div className="h-4 w-32 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
              <div className="h-4 w-20 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
