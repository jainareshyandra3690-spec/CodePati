"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Difficulty, ProgramStatus } from "@prisma/client";
import {
  setProgramStatusAction,
  deleteProgramAction,
} from "@/server/actions/admin";

export interface AdminProgramRow {
  id: string;
  title: string;
  slug: string;
  difficulty: Difficulty;
  status: ProgramStatus;
  updatedAtIso: string;
  category: {
    id: string;
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

interface AdminProgramTableProps {
  initialPrograms: AdminProgramRow[];
  initialStatusFilter?: string;
}

const difficultyLabels: Record<Difficulty, { label: string; badge: string }> = {
  BEGINNER: {
    label: "Beginner",
    badge:
      "bg-emerald-100/90 text-emerald-900 border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30",
  },
  MEDIUM: {
    label: "Medium",
    badge:
      "bg-amber-100/90 text-amber-900 border-amber-300 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30",
  },
  ADVANCED: {
    label: "Advanced",
    badge:
      "bg-rose-100/90 text-rose-900 border-rose-300 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30",
  },
};

export function AdminProgramTable({
  initialPrograms,
  initialStatusFilter = "",
}: AdminProgramTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Program pending confirmation for deletion
  const [deleteTarget, setDeleteTarget] = useState<AdminProgramRow | null>(null);
  const [busyProgramId, setBusyProgramId] = useState<string | null>(null);

  const filteredPrograms = initialPrograms.filter((prog) => {
    if (statusFilter && prog.status !== statusFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      const matchTitle = prog.title.toLowerCase().includes(q);
      const matchSlug = prog.slug.toLowerCase().includes(q);
      const matchCategory = prog.category.name.toLowerCase().includes(q);
      if (!matchTitle && !matchSlug && !matchCategory) return false;
    }
    return true;
  });

  const handleToggleStatus = (prog: AdminProgramRow) => {
    const nextStatus: ProgramStatus =
      prog.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    setBusyProgramId(prog.id);
    setFeedback(null);

    startTransition(async () => {
      const res = await setProgramStatusAction(prog.id, nextStatus);
      setBusyProgramId(null);
      if (res.ok) {
        setFeedback({
          type: "success",
          text:
            res.message ||
            (nextStatus === "PUBLISHED"
              ? "Program published successfully."
              : "Program unpublished."),
        });
        router.refresh();
      } else {
        setFeedback({
          type: "error",
          text: res.error || "Unable to update program status.",
        });
      }
    });
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setBusyProgramId(target.id);
    setFeedback(null);

    startTransition(async () => {
      const res = await deleteProgramAction(target.id);
      setBusyProgramId(null);
      setDeleteTarget(null);
      if (res.ok) {
        setFeedback({
          type: "success",
          text: res.message || "Program deleted successfully.",
        });
        router.refresh();
      } else {
        setFeedback({
          type: "error",
          text: res.error || "Unable to delete program.",
        });
      }
    });
  };

  return (
    <div className="space-y-5">
      {/* Feedback Banner */}
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

      {/* Search & Status Filter Bar */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-4 sm:p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[240px]">
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter by title, slug, or category..."
            aria-label="Filter admin programs"
            className="flex-1 min-w-[200px] h-10 px-3.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 focus:bg-white dark:bg-slate-950 dark:hover:bg-slate-900 dark:focus:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-indigo-600 dark:focus:border-indigo-400 text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 dark:[color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-indigo-600/25 dark:focus:ring-indigo-400/30"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
            className="h-10 px-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 focus:bg-white dark:bg-slate-950 dark:hover:bg-slate-900 dark:focus:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-indigo-600 dark:focus:border-indigo-400 text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 dark:[color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-indigo-600/25 dark:focus:ring-indigo-400/30"
          >
            <option value="" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
              All Statuses
            </option>
            <option value="PUBLISHED" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
              Published
            </option>
            <option value="DRAFT" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
              Draft
            </option>
          </select>
        </div>

        <div className="flex items-center gap-3 text-xs font-bold text-slate-700 dark:text-slate-300">
          <span>
            Showing {filteredPrograms.length} of {initialPrograms.length} programs
          </span>
          <Link
            href="/admin/programs/new"
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-semibold shadow-xs transition-colors"
          >
            + Create Program
          </Link>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-sm overflow-hidden">
        {filteredPrograms.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <p className="text-base font-bold text-slate-900 dark:text-white">
              No matching programs found
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Try clearing your filter or create a new official program.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-300 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-950/60 text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  <th className="py-3.5 px-4">Title &amp; Slug</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Difficulty</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Languages</th>
                  <th className="py-3.5 px-4">Updated</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs sm:text-sm">
                {filteredPrograms.map((prog) => {
                  const isPublished = prog.status === "PUBLISHED";
                  const diff =
                    difficultyLabels[prog.difficulty] ??
                    difficultyLabels.BEGINNER;
                  const isRowBusy = busyProgramId === prog.id && isPending;

                  return (
                    <tr
                      key={prog.id}
                      className="hover:bg-slate-50/90 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 align-middle">
                        <div className="font-bold text-slate-950 dark:text-white">
                          {prog.title}
                        </div>
                        <div className="text-xs font-mono text-slate-600 dark:text-slate-400">
                          /{prog.slug}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 align-middle">
                        <span className="inline-flex px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
                          {prog.category.name}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 align-middle">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-md text-xs font-semibold border ${diff.badge}`}
                        >
                          {diff.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 align-middle">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-bold border ${
                            isPublished
                              ? "bg-emerald-100/90 text-emerald-900 border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30"
                              : "bg-amber-100/90 text-amber-900 border-amber-300 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isPublished
                                ? "bg-emerald-600 dark:bg-emerald-400"
                                : "bg-amber-600 dark:bg-amber-400"
                            }`}
                          />
                          {isPublished ? "Published" : "Draft"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 align-middle">
                        <div className="flex flex-wrap gap-1">
                          {prog.languages.length === 0 ? (
                            <span className="text-xs italic text-slate-500 dark:text-slate-400">
                              None
                            </span>
                          ) : (
                            prog.languages.map((item) => (
                              <span
                                key={item.language.id}
                                className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-indigo-50 dark:bg-indigo-600/15 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30"
                              >
                                {item.language.name}
                              </span>
                            ))
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 align-middle text-xs font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {prog.updatedAtIso}
                      </td>

                      <td className="py-3.5 px-4 align-middle text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/programs/${prog.id}/edit`}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors"
                          >
                            Edit
                          </Link>

                          <Link
                            href={
                              isPublished
                                ? `/programs/${prog.slug}`
                                : `/admin/programs/${prog.id}/edit?preview=1`
                            }
                            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-600/15 dark:hover:bg-indigo-500/25 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 transition-colors"
                          >
                            {isPublished ? "View" : "Preview"}
                          </Link>

                          <button
                            type="button"
                            disabled={isRowBusy}
                            onClick={() => handleToggleStatus(prog)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors disabled:opacity-50 ${
                              isPublished
                                ? "bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-500/15 dark:hover:bg-amber-500/25 dark:text-amber-300 dark:border-amber-500/30"
                                : "bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-500/15 dark:hover:bg-emerald-500/25 dark:text-emerald-300 dark:border-emerald-500/30"
                            }`}
                          >
                            {isRowBusy
                              ? "..."
                              : isPublished
                              ? "Unpublish"
                              : "Publish"}
                          </button>

                          <button
                            type="button"
                            disabled={isRowBusy}
                            onClick={() => setDeleteTarget(prog)}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-800 border border-red-300 dark:bg-red-500/15 dark:hover:bg-red-500/25 dark:text-red-300 dark:border-red-500/30 transition-colors disabled:opacity-50"
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
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-program-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
        >
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-6 shadow-2xl space-y-5">
            <div className="space-y-2">
              <h3
                id="delete-program-modal-title"
                className="text-lg font-bold text-slate-950 dark:text-white"
              >
                Delete &ldquo;{deleteTarget.title}&rdquo;?
              </h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                This will permanently remove the program and its{" "}
                <span className="font-semibold">
                  {deleteTarget.languages.length} language implementation(s)
                </span>
                . This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isPending}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200/80 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isPending}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white shadow-xs transition-colors disabled:opacity-50"
              >
                {isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminProgramTable;
