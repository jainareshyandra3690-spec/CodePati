"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Difficulty,
  SubmissionType,
} from "@prisma/client";
import {
  createSubmissionAction,
  updateSubmissionAction,
  SubmissionLanguageInput,
} from "@/server/actions/submissions";

interface CategoryOption {
  id: string;
  name: string;
}

interface LanguageOption {
  id: string;
  name: string;
  slug: string;
  fileExtension: string;
}

interface ProgramOption {
  id: string;
  title: string;
  slug: string;
}

interface InitialData {
  id?: string;
  submissionType: SubmissionType;
  title: string;
  description?: string | null;
  programId?: string | null;
  categoryId?: string | null;
  difficulty?: Difficulty | null;
  problemStatement?: string | null;
  inputDescription?: string | null;
  outputDescription?: string | null;
  examples?: string | null;
  explanation?: string | null;
  algorithm?: string | null;
  timeComplexity?: string | null;
  spaceComplexity?: string | null;
  languages?: {
    languageId: string;
    fileName?: string | null;
    code: string;
  }[];
}

interface SubmissionFormProps {
  mode: "create" | "edit";
  categories: CategoryOption[];
  languages: LanguageOption[];
  programs: ProgramOption[];
  initialData?: InitialData;
}

const SUBMISSION_TYPE_DESCRIPTIONS: Record<
  SubmissionType,
  { title: string; subtitle: string }
> = {
  NEW_PROGRAM: {
    title: "New Program",
    subtitle: "Submit a complete new programming problem with full solutions and complexity analysis.",
  },
  ALTERNATIVE_SOLUTION: {
    title: "Alternative Solution",
    subtitle: "Propose an alternative algorithmic approach or cleaner implementation for an existing program.",
  },
  EXPLANATION: {
    title: "Explanation",
    subtitle: "Propose a more beginner-friendly, comprehensive, or clearer explanation.",
  },
  ALGORITHM: {
    title: "Algorithm / Logic",
    subtitle: "Propose an optimized or step-by-step logic breakdown for an existing program.",
  },
  LANGUAGE_IMPLEMENTATION: {
    title: "Language Implementation",
    subtitle: "Add an implementation in a programming language that is not yet available for this program.",
  },
  CORRECTION: {
    title: "Correction / Bug Fix",
    subtitle: "Report and propose a correction to an existing program's problem statement, logic, or code.",
  },
};

export function SubmissionForm({
  mode,
  categories,
  languages,
  programs,
  initialData,
}: SubmissionFormProps) {
  const router = useRouter();

  const [submissionType, setSubmissionType] = useState<SubmissionType>(
    initialData?.submissionType || "NEW_PROGRAM"
  );
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [programId, setProgramId] = useState(initialData?.programId || "");

  // NEW_PROGRAM fields
  const [categoryId, setCategoryId] = useState(
    initialData?.categoryId || (categories.length > 0 ? categories[0].id : "")
  );
  const [difficulty, setDifficulty] = useState<Difficulty>(
    initialData?.difficulty || "BEGINNER"
  );
  const [problemStatement, setProblemStatement] = useState(
    initialData?.problemStatement || ""
  );
  const [inputDescription, setInputDescription] = useState(
    initialData?.inputDescription || ""
  );
  const [outputDescription, setOutputDescription] = useState(
    initialData?.outputDescription || ""
  );
  const [examples, setExamples] = useState(initialData?.examples || "");
  const [explanation, setExplanation] = useState(initialData?.explanation || "");
  const [algorithm, setAlgorithm] = useState(initialData?.algorithm || "");
  const [timeComplexity, setTimeComplexity] = useState(
    initialData?.timeComplexity || "O(n)"
  );
  const [spaceComplexity, setSpaceComplexity] = useState(
    initialData?.spaceComplexity || "O(1)"
  );

  // Implementations array for languages
  const [impls, setImpls] = useState<SubmissionLanguageInput[]>(() => {
    if (initialData?.languages && initialData.languages.length > 0) {
      return initialData.languages.map((l) => ({
        languageId: l.languageId,
        fileName: l.fileName || "",
        code: l.code,
      }));
    }
    const defaultLang = languages[0];
    return [
      {
        languageId: defaultLang?.id || "",
        fileName: defaultLang ? `solution${defaultLang.fileExtension}` : "",
        code: "",
      },
    ];
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper to add an implementation
  const handleAddLanguage = () => {
    const usedIds = new Set(impls.map((i) => i.languageId));
    const available = languages.find((l) => !usedIds.has(l.id));
    if (!available) return;

    setImpls((prev) => [
      ...prev,
      {
        languageId: available.id,
        fileName: `solution${available.fileExtension}`,
        code: "",
      },
    ]);
  };

  const handleRemoveLanguage = (index: number) => {
    setImpls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateLanguage = (
    index: number,
    field: keyof SubmissionLanguageInput,
    value: string
  ) => {
    setImpls((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const updated = { ...item, [field]: value };
        if (field === "languageId") {
          const selected = languages.find((l) => l.id === value);
          if (selected) {
            const base = item.fileName.split(".")[0] || "solution";
            updated.fileName = `${base}${selected.fileExtension}`;
          }
        }
        return updated;
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || title.trim().length < 3) {
      setError("Please provide a title with at least 3 characters.");
      return;
    }

    if (submissionType !== "NEW_PROGRAM" && !programId) {
      setError("Please select the target program you are contributing to.");
      return;
    }

    if (submissionType === "NEW_PROGRAM") {
      if (!categoryId) {
        setError("Please choose a category.");
        return;
      }
      if (!problemStatement.trim()) {
        setError("Please provide a problem statement.");
        return;
      }
      if (!explanation.trim()) {
        setError("Please provide an explanation.");
        return;
      }
      if (!algorithm.trim()) {
        setError("Please provide algorithm / logic steps.");
        return;
      }
      if (impls.length === 0) {
        setError("Please provide at least one code implementation.");
        return;
      }
      for (const impl of impls) {
        if (!impl.code.trim()) {
          const lang = languages.find((l) => l.id === impl.languageId);
          setError(`Source code is required for ${lang?.name || "selected language"}.`);
          return;
        }
      }
    } else if (
      submissionType === "ALTERNATIVE_SOLUTION" ||
      submissionType === "LANGUAGE_IMPLEMENTATION"
    ) {
      if (impls.length === 0 || !impls[0].code.trim()) {
        setError("Source code is required.");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (mode === "edit" && initialData?.id) {
        const res = await updateSubmissionAction({
          id: initialData.id,
          submissionType,
          title: title.trim(),
          description: description.trim() || undefined,
          programId: programId || undefined,
          categoryId: categoryId || undefined,
          difficulty,
          problemStatement: problemStatement.trim() || undefined,
          inputDescription: inputDescription.trim() || undefined,
          outputDescription: outputDescription.trim() || undefined,
          examples: examples.trim() || undefined,
          explanation: explanation.trim() || undefined,
          algorithm: algorithm.trim() || undefined,
          timeComplexity: timeComplexity.trim() || undefined,
          spaceComplexity: spaceComplexity.trim() || undefined,
          languages: impls,
        });

        if (!res.ok) {
          setError(res.error || "Failed to update submission.");
          setIsSubmitting(false);
          return;
        }

        router.push(`/user/submissions/${initialData.id}`);
      } else {
        const res = await createSubmissionAction({
          submissionType,
          title: title.trim(),
          description: description.trim() || undefined,
          programId: programId || undefined,
          categoryId: categoryId || undefined,
          difficulty,
          problemStatement: problemStatement.trim() || undefined,
          inputDescription: inputDescription.trim() || undefined,
          outputDescription: outputDescription.trim() || undefined,
          examples: examples.trim() || undefined,
          explanation: explanation.trim() || undefined,
          algorithm: algorithm.trim() || undefined,
          timeComplexity: timeComplexity.trim() || undefined,
          spaceComplexity: spaceComplexity.trim() || undefined,
          languages: impls,
        });

        if (!res.ok) {
          setError(res.error || "Failed to create submission.");
          setIsSubmitting(false);
          return;
        }

        router.push(`/user/submissions/${res.data?.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="p-4 rounded-xl border border-red-300 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300 text-sm">
          <p className="font-semibold">Submission Error</p>
          <p className="mt-1">{error}</p>
        </div>
      )}

      {/* 1. Submission Type Selection */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-bold text-slate-900 dark:text-slate-100">
            Contribution Type
          </label>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Select the kind of contribution you want to make to CodePati.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {(Object.keys(SUBMISSION_TYPE_DESCRIPTIONS) as SubmissionType[]).map((type) => {
            const isSelected = submissionType === type;
            const disabled = mode === "edit"; // Lock type on edit
            return (
              <button
                key={type}
                type="button"
                disabled={disabled}
                onClick={() => setSubmissionType(type)}
                className={`text-left p-3.5 rounded-xl border transition-all ${
                  isSelected
                    ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 ring-1 ring-indigo-500"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40"
                } ${disabled ? "opacity-75 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {SUBMISSION_TYPE_DESCRIPTIONS[type].title}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {SUBMISSION_TYPE_DESCRIPTIONS[type].subtitle}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Target Program Selector (for existing programs) */}
      {submissionType !== "NEW_PROGRAM" && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-900 dark:text-slate-100">
              Target Program <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Select the official program you wish to contribute to.
            </p>
          </div>
          <select
            value={programId}
            onChange={(e) => setProgramId(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          >
            <option value="">-- Choose a Program --</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 3. Basic Info */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-bold text-slate-900 dark:text-slate-100">
            Submission Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              submissionType === "NEW_PROGRAM"
                ? "e.g. Check for Anagram Strings"
                : "e.g. Bitwise Alternative for Even or Odd"
            }
            required
            className="mt-1.5 w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-900 dark:text-slate-100">
            {submissionType === "CORRECTION"
              ? "Description of Issue / Correction *"
              : "Description / Notes"}
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Explain the motivation, approach, or rationale behind this submission..."
            className="mt-1.5 w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>
      </div>

      {/* 4. Structured Program Fields (NEW_PROGRAM only) */}
      {submissionType === "NEW_PROGRAM" && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-3">
            Program Specifications
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-900 dark:text-slate-100">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                className="mt-1.5 w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-900 dark:text-slate-100">
                Difficulty <span className="text-red-500">*</span>
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                className="mt-1.5 w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                <option value="BEGINNER">BEGINNER</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="ADVANCED">ADVANCED</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-900 dark:text-slate-100">
              Problem Statement <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={problemStatement}
              onChange={(e) => setProblemStatement(e.target.value)}
              placeholder="State the problem clearly and concisely for learners..."
              required
              className="mt-1.5 w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-900 dark:text-slate-100">
                Input Description
              </label>
              <textarea
                rows={2}
                value={inputDescription}
                onChange={(e) => setInputDescription(e.target.value)}
                placeholder="e.g. A single integer N denoting the number."
                className="mt-1.5 w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-900 dark:text-slate-100">
                Output Description
              </label>
              <textarea
                rows={2}
                value={outputDescription}
                onChange={(e) => setOutputDescription(e.target.value)}
                placeholder="e.g. Print 'Even' if even, else 'Odd'."
                className="mt-1.5 w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-900 dark:text-slate-100">
              Examples
            </label>
            <textarea
              rows={3}
              value={examples}
              onChange={(e) => setExamples(e.target.value)}
              placeholder="Input: 4 
Output: Even"
              className="mt-1.5 w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-900 dark:text-slate-100">
              Explanation <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Walk through the problem step-by-step with clear logic..."
              required
              className="mt-1.5 w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-900 dark:text-slate-100">
              Algorithm / Logic Steps <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value)}
              placeholder="1. Read input
2. Calculate result
3. Print output"
              required
              className="mt-1.5 w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-900 dark:text-slate-100">
                Time Complexity <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={timeComplexity}
                onChange={(e) => setTimeComplexity(e.target.value)}
                placeholder="e.g. O(n) or O(1)"
                required
                className="mt-1.5 w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-900 dark:text-slate-100">
                Space Complexity <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={spaceComplexity}
                onChange={(e) => setSpaceComplexity(e.target.value)}
                placeholder="e.g. O(1)"
                required
                className="mt-1.5 w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* 5. Proposed Explanation or Algorithm for Existing Programs */}
      {submissionType === "EXPLANATION" && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <label className="block text-sm font-bold text-slate-900 dark:text-slate-100">
            Proposed Explanation <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={6}
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="Write your comprehensive, beginner-friendly explanation..."
            required
            className="mt-1.5 w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>
      )}

      {submissionType === "ALGORITHM" && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <label className="block text-sm font-bold text-slate-900 dark:text-slate-100">
            Proposed Algorithm / Logic Steps <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={6}
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value)}
            placeholder="1. Start
2. Read variables
3. Apply logic step-by-step..."
            required
            className="mt-1.5 w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>
      )}

      {/* 6. Code Implementations */}
      {(submissionType === "NEW_PROGRAM" ||
        submissionType === "ALTERNATIVE_SOLUTION" ||
        submissionType === "LANGUAGE_IMPLEMENTATION" ||
        submissionType === "CORRECTION") && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {submissionType === "NEW_PROGRAM"
                  ? "Language Implementations"
                  : "Solution Code"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Provide clean, compilable, commented code.
              </p>
            </div>
            {submissionType === "NEW_PROGRAM" && impls.length < languages.length && (
              <button
                type="button"
                onClick={handleAddLanguage}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-200 transition-colors"
              >
                + Add Language
              </button>
            )}
          </div>

          <div className="space-y-6">
            {impls.map((impl, index) => {
              const selectedLang = languages.find((l) => l.id === impl.languageId);
              return (
                <div
                  key={index}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <select
                        value={impl.languageId}
                        onChange={(e) =>
                          handleUpdateLanguage(index, "languageId", e.target.value)
                        }
                        className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-semibold"
                      >
                        {languages.map((l) => (
                          <option key={l.id} value={l.id}>
                            {l.name}
                          </option>
                        ))}
                      </select>

                      <input
                        type="text"
                        value={impl.fileName}
                        onChange={(e) =>
                          handleUpdateLanguage(index, "fileName", e.target.value)
                        }
                        placeholder={
                          selectedLang
                            ? `solution${selectedLang.fileExtension}`
                            : "solution.ext"
                        }
                        className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-mono"
                      />
                    </div>

                    {submissionType === "NEW_PROGRAM" && impls.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLanguage(index)}
                        className="text-xs text-red-600 hover:text-red-700 font-medium"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Source Code ({selectedLang?.name || "Code"})
                    </label>
                    <textarea
                      rows={10}
                      value={impl.code}
                      onChange={(e) =>
                        handleUpdateLanguage(index, "code", e.target.value)
                      }
                      placeholder={`// Enter ${selectedLang?.name || "source"} implementation here...`}
                      className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Submit / Cancel Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
        <Link
          href={mode === "edit" ? `/user/submissions/${initialData?.id}` : "/user/submissions"}
          className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium transition-colors"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {isSubmitting
            ? mode === "edit"
              ? "Resubmitting..."
              : "Submitting..."
            : mode === "edit"
            ? "Resubmit for Review"
            : "Submit for Review"}
        </button>
      </div>
    </form>
  );
}
