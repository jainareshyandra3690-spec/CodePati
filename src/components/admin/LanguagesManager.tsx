"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  saveLanguageAction,
  deleteLanguageAction,
} from "@/server/actions/admin";

export interface AdminLanguageItem {
  id: string;
  name: string;
  slug: string;
  fileExtension: string;
  implementationCount: number;
}

function slugifyName(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\+\+/g, "pp")
    .replace(/#/g, "sharp")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const inputBaseClass =
  "w-full h-10 px-3.5 rounded-xl " +
  "bg-slate-50 hover:bg-slate-100/80 focus:bg-white " +
  "dark:bg-slate-950 dark:hover:bg-slate-900 dark:focus:bg-slate-950 " +
  "border border-slate-300 dark:border-slate-700 " +
  "focus:border-indigo-600 dark:focus:border-indigo-400 " +
  "text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 " +
  "placeholder:text-slate-500 dark:placeholder:text-slate-400 " +
  "dark:[color-scheme:dark] " +
  "focus:outline-none focus:ring-2 focus:ring-indigo-600/25 dark:focus:ring-indigo-400/30 transition-all";

export function LanguagesManager({
  initialLanguages,
}: {
  initialLanguages: AdminLanguageItem[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [fileExtension, setFileExtension] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<AdminLanguageItem | null>(
    null
  );

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setSlug("");
    setSlugTouched(false);
    setFileExtension("");
  };

  const handleStartEdit = (lang: AdminLanguageItem) => {
    setEditingId(lang.id);
    setName(lang.name);
    setSlug(lang.slug);
    setSlugTouched(true);
    setFileExtension(lang.fileExtension);
    setFeedback(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!slugTouched) {
      setSlug(slugifyName(val));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    startTransition(async () => {
      const res = await saveLanguageAction({
        id: editingId ?? undefined,
        name,
        slug,
        fileExtension,
      });

      if (res.ok) {
        setFeedback({
          type: "success",
          text:
            res.message ||
            (editingId ? "Language updated." : "Language created."),
        });
        resetForm();
        router.refresh();
      } else {
        setFeedback({
          type: "error",
          text: res.error || "Unable to save language.",
        });
      }
    });
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setFeedback(null);

    startTransition(async () => {
      const res = await deleteLanguageAction(target.id);
      setDeleteTarget(null);
      if (res.ok) {
        setFeedback({
          type: "success",
          text: res.message || "Language deleted successfully.",
        });
        if (editingId === target.id) {
          resetForm();
        }
        router.refresh();
      } else {
        setFeedback({
          type: "error",
          text: res.error || "Cannot delete language.",
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      {feedback && (
        <div
          role="status"
          className={`p-4 rounded-xl border text-xs sm:text-sm font-semibold flex items-center justify-between gap-3 ${
            feedback.type === "success"
              ? "bg-emerald-100/90 text-emerald-950 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-200 dark:border-emerald-500/40"
              : "bg-red-100/90 text-red-950 border-red-300 dark:bg-red-950/70 dark:text-red-200 dark:border-red-500/40"
          }`}
        >
          <span>{feedback.text}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="px-2 py-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10"
            aria-label="Dismiss notification"
          >
            &times;
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create / Edit Language Form */}
        <section className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-6 shadow-sm space-y-4 h-fit">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-950 dark:text-white">
              {editingId ? "Edit Language" : "Add Language"}
            </h2>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:underline"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="lang-name"
                className="block text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200"
              >
                Language Name <span className="text-red-600">*</span>
              </label>
              <input
                id="lang-name"
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Python or Rust"
                className={inputBaseClass}
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="lang-slug"
                className="block text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200"
              >
                Slug <span className="text-red-600">*</span>
              </label>
              <input
                id="lang-slug"
                type="text"
                required
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value);
                }}
                placeholder="e.g. python or cpp"
                className={`${inputBaseClass} font-mono`}
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="lang-ext"
                className="block text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200"
              >
                File Extension <span className="text-red-600">*</span>
              </label>
              <input
                id="lang-ext"
                type="text"
                required
                value={fileExtension}
                onChange={(e) => setFileExtension(e.target.value)}
                placeholder="e.g. .py, .cpp, .java, .c"
                className={`${inputBaseClass} font-mono`}
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white shadow-xs transition-colors disabled:opacity-50"
              >
                {isPending
                  ? "Saving..."
                  : editingId
                  ? "Save Language Changes"
                  : "Add Language"}
              </button>
            </div>
          </form>
        </section>

        {/* Languages Table */}
        <section className="lg:col-span-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-950 dark:text-white">
              Configured Languages ({initialLanguages.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-300 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-950/60 text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  <th className="py-3 px-4">Language</th>
                  <th className="py-3 px-4">Slug</th>
                  <th className="py-3 px-4">File Extension</th>
                  <th className="py-3 px-4">Used By Programs</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs sm:text-sm">
                {initialLanguages.map((lang) => {
                  const ext = lang.fileExtension.startsWith(".")
                    ? lang.fileExtension
                    : `.${lang.fileExtension}`;
                  return (
                    <tr
                      key={lang.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-bold text-slate-950 dark:text-white">
                        {lang.name}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-600 dark:text-slate-400">
                        {lang.slug}
                      </td>
                      <td className="py-3.5 px-4">
                        <code className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 border border-slate-300 dark:border-slate-700 font-mono text-xs font-bold">
                          {ext}
                        </code>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-indigo-50 dark:bg-indigo-600/15 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                          {lang.implementationCount} implementation(s)
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(lang)}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(lang)}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-800 border border-red-300 dark:bg-red-500/15 dark:hover:bg-red-500/25 dark:text-red-300 dark:border-red-500/30"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Language Deletion Modal */}
      {deleteTarget && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
        >
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-950 dark:text-white">
              Delete Language &ldquo;{deleteTarget.name}&rdquo;?
            </h3>

            {deleteTarget.implementationCount > 0 ? (
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-500/40 text-xs text-amber-950 dark:text-amber-200 space-y-1.5">
                <p className="font-bold">
                  Cannot delete language used by existing implementations
                </p>
                <p>
                  This language is currently used by{" "}
                  <strong>
                    {deleteTarget.implementationCount} program implementation(s)
                  </strong>
                  . To protect program content integrity, remove those
                  implementations before deleting this language.
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-700 dark:text-slate-300">
                No program implementations use this language. Are you sure you
                want to delete it?
              </p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200/80 dark:bg-slate-800 text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-slate-700"
              >
                {deleteTarget.implementationCount > 0 ? "Close" : "Cancel"}
              </button>
              {deleteTarget.implementationCount === 0 && (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white"
                >
                  {isPending ? "Deleting..." : "Delete Language"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LanguagesManager;
