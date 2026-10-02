"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  saveCategoryAction,
  deleteCategoryAction,
} from "@/server/actions/admin";

export interface AdminCategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  programCount: number;
}

function slugifyName(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
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

export function CategoriesManager({
  initialCategories,
}: {
  initialCategories: AdminCategoryItem[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<AdminCategoryItem | null>(
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
    setDescription("");
  };

  const handleStartEdit = (cat: AdminCategoryItem) => {
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setSlugTouched(true);
    setDescription(cat.description || "");
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
      const res = await saveCategoryAction({
        id: editingId ?? undefined,
        name,
        slug,
        description,
      });

      if (res.ok) {
        setFeedback({
          type: "success",
          text:
            res.message ||
            (editingId ? "Category updated." : "Category created."),
        });
        resetForm();
        router.refresh();
      } else {
        setFeedback({
          type: "error",
          text: res.error || "Unable to save category.",
        });
      }
    });
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setFeedback(null);

    startTransition(async () => {
      const res = await deleteCategoryAction(target.id);
      setDeleteTarget(null);
      if (res.ok) {
        setFeedback({
          type: "success",
          text: res.message || "Category deleted successfully.",
        });
        if (editingId === target.id) {
          resetForm();
        }
        router.refresh();
      } else {
        setFeedback({
          type: "error",
          text: res.error || "Cannot delete category.",
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
        {/* Create / Edit Category Form */}
        <section className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-6 shadow-sm space-y-4 h-fit">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-950 dark:text-white">
              {editingId ? "Edit Category" : "Create Category"}
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
                htmlFor="cat-name"
                className="block text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200"
              >
                Name <span className="text-red-600">*</span>
              </label>
              <input
                id="cat-name"
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Dynamic Programming"
                className={inputBaseClass}
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="cat-slug"
                className="block text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200"
              >
                Slug <span className="text-red-600">*</span>
              </label>
              <input
                id="cat-slug"
                type="text"
                required
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value);
                }}
                placeholder="e.g. dynamic-programming"
                className={`${inputBaseClass} font-mono`}
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="cat-desc"
                className="block text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200"
              >
                Description
              </label>
              <textarea
                id="cat-desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short overview of this programming topic..."
                className="w-full p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 focus:bg-white dark:bg-slate-950 dark:hover:bg-slate-900 dark:focus:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-indigo-600 dark:focus:border-indigo-400 text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 dark:[color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-indigo-600/25 dark:focus:ring-indigo-400/30"
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
                  ? "Save Category Changes"
                  : "Create Category"}
              </button>
            </div>
          </form>
        </section>

        {/* Categories Table */}
        <section className="lg:col-span-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-950 dark:text-white">
              Configured Categories ({initialCategories.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-300 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-950/60 text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  <th className="py-3 px-4">Name &amp; Slug</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Programs</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs sm:text-sm">
                {initialCategories.map((cat) => (
                  <tr
                    key={cat.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 align-top">
                      <div className="font-bold text-slate-950 dark:text-white">
                        {cat.name}
                      </div>
                      <div className="text-xs font-mono text-slate-600 dark:text-slate-400">
                        /{cat.slug}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 align-top text-xs text-slate-700 dark:text-slate-300 max-w-xs">
                      {cat.description || (
                        <span className="italic text-slate-400">
                          No description
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 align-top">
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-indigo-50 dark:bg-indigo-600/15 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                        {cat.programCount}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(cat)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(cat)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-800 border border-red-300 dark:bg-red-500/15 dark:hover:bg-red-500/25 dark:text-red-300 dark:border-red-500/30"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Category Deletion Modal */}
      {deleteTarget && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
        >
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-950 dark:text-white">
              Delete Category &ldquo;{deleteTarget.name}&rdquo;?
            </h3>

            {deleteTarget.programCount > 0 ? (
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-500/40 text-xs text-amber-950 dark:text-amber-200 space-y-1.5">
                <p className="font-bold">
                  Cannot delete category with existing programs
                </p>
                <p>
                  This category is currently used by{" "}
                  <strong>{deleteTarget.programCount} program(s)</strong>. To
                  prevent orphaning programs, please reassign or remove those
                  programs before deleting this category.
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-700 dark:text-slate-300">
                No programs use this category. Are you sure you want to delete it?
              </p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200/80 dark:bg-slate-800 text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-slate-700"
              >
                {deleteTarget.programCount > 0 ? "Close" : "Cancel"}
              </button>
              {deleteTarget.programCount === 0 && (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white"
                >
                  {isPending ? "Deleting..." : "Delete Category"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CategoriesManager;
