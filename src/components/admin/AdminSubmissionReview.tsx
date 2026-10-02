"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { SubmissionStatus, SubmissionType } from "@prisma/client";
import { reviewSubmissionAction } from "@/server/actions/submissions";

interface AdminSubmissionReviewProps {
  submissionId: string;
  currentStatus: SubmissionStatus;
  submissionType: SubmissionType;
  existingFeedback?: string | null;
  hasExistingLanguageConflict?: boolean;
}

export function AdminSubmissionReview({
  submissionId,
  currentStatus,
  submissionType,
  existingFeedback,
  hasExistingLanguageConflict = false,
}: AdminSubmissionReviewProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState(existingFeedback || "");
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleDecision = async (
    decision: "APPROVED" | "REJECTED" | "REQUIRES_CHANGES"
  ) => {
    setError(null);
    setSuccess(null);

    if ((decision === "REJECTED" || decision === "REQUIRES_CHANGES") && !feedback.trim()) {
      setError(`Feedback is required when ${decision === "REJECTED" ? "rejecting" : "requesting changes from"} a contributor.`);
      return;
    }

    if (
      decision === "APPROVED" &&
      submissionType === "LANGUAGE_IMPLEMENTATION" &&
      hasExistingLanguageConflict &&
      !replaceExisting
    ) {
      setError("Please confirm replacing the existing official implementation before approving.");
      return;
    }

    setIsProcessing(true);

    try {
      const res = await reviewSubmissionAction({
        submissionId,
        decision,
        adminFeedback: feedback.trim() || undefined,
        replaceExistingLanguage: replaceExisting,
      });

      if (!res.ok) {
        setError(res.error || "Review operation failed.");
        setIsProcessing(false);
        return;
      }

      setSuccess(res.message || "Review updated successfully.");
      setIsProcessing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
          Editorial Review Actions
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Approve this contribution into official CodePati content, request changes, or reject.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl border border-red-300 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-300 text-xs">
          <p className="font-semibold">Review Error</p>
          <p className="mt-0.5">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-3.5 rounded-xl border border-emerald-300 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 text-xs">
          <p className="font-semibold">{success}</p>
        </div>
      )}

      {hasExistingLanguageConflict && (
        <div className="p-3.5 rounded-xl border border-amber-300 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/25 text-amber-900 dark:text-amber-200 text-xs space-y-2">
          <p className="font-bold">Language Implementation Conflict</p>
          <p>
            The target program already has an official implementation for this language. Check the box below if you want to replace it.
          </p>
          <label className="flex items-center gap-2 font-medium cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={replaceExisting}
              onChange={(e) => setReplaceExisting(e.target.checked)}
              className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500"
            />
            <span>Confirm overwrite of existing official implementation</span>
          </label>
        </div>
      )}

      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
          Reviewer Feedback / Comments
        </label>
        <textarea
          rows={4}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Provide constructive feedback for the contributor (required for Request Changes and Reject)..."
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="text-xs text-slate-500 dark:text-slate-400">
          Current Status: <span className="font-semibold text-slate-800 dark:text-slate-200">{currentStatus}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => handleDecision("REJECTED")}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            Reject Submission
          </button>

          <button
            type="button"
            disabled={isProcessing}
            onClick={() => handleDecision("REQUIRES_CHANGES")}
            className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            Request Changes
          </button>

          <button
            type="button"
            disabled={isProcessing}
            onClick={() => handleDecision("APPROVED")}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            Approve & Apply Content
          </button>
        </div>
      </div>
    </div>
  );
}
