"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Difficulty, ProgramStatus } from "@prisma/client";
import { saveProgramAction } from "@/server/actions/admin";
import {
  LanguageSelector,
  type ProgramImplementationItem,
} from "@/components/programs/LanguageSelector";

export interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

export interface LanguageOption {
  id: string;
  name: string;
  slug: string;
  fileExtension: string;
}

export interface InitialProgramFormValues {
  id?: string;
  title: string;
  slug: string;
  categoryId: string;
  difficulty: Difficulty;
  status: ProgramStatus;
  problemStatement: string;
  inputDescription: string;
  outputDescription: string;
  examples: string;
  explanation: string;
  algorithm: string;
  timeComplexity: string;
  spaceComplexity: string;
  implementations: {
    languageId: string;
    fileName: string;
    code: string;
  }[];
}

interface ProgramFormProps {
  mode: "create" | "edit";
  categories: CategoryOption[];
  languages: LanguageOption[];
  initialValues: InitialProgramFormValues;
  initialPreviewMode?: boolean;
}

function generateSlugFromTitle(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function getDefaultFileName(slug: string, ext: string): string {
  const cleanExt = ext.startsWith(".") ? ext.toLowerCase() : `.${ext.toLowerCase()}`;
  const base = (slug || "solution").replace(/-/g, "_");
  return `${base}${cleanExt}`;
}

const inputBaseClass =
  "w-full h-11 px-3.5 rounded-xl " +
  "bg-slate-50 hover:bg-slate-100/80 focus:bg-white " +
  "dark:bg-slate-950 dark:hover:bg-slate-900 dark:focus:bg-slate-950 " +
  "border border-slate-300 dark:border-slate-700 " +
  "focus:border-indigo-600 dark:focus:border-indigo-400 " +
  "text-sm font-medium text-slate-900 dark:text-slate-100 " +
  "placeholder:text-slate-500 dark:placeholder:text-slate-400 " +
  "dark:[color-scheme:dark] " +
  "focus:outline-none focus:ring-2 focus:ring-indigo-600/25 dark:focus:ring-indigo-400/30 transition-all";

const textareaBaseClass =
  "w-full p-3.5 rounded-xl " +
  "bg-slate-50 hover:bg-slate-100/80 focus:bg-white " +
  "dark:bg-slate-950 dark:hover:bg-slate-900 dark:focus:bg-slate-950 " +
  "border border-slate-300 dark:border-slate-700 " +
  "focus:border-indigo-600 dark:focus:border-indigo-400 " +
  "text-sm font-medium text-slate-900 dark:text-slate-100 " +
  "placeholder:text-slate-500 dark:placeholder:text-slate-400 " +
  "dark:[color-scheme:dark] " +
  "focus:outline-none focus:ring-2 focus:ring-indigo-600/25 dark:focus:ring-indigo-400/30 transition-all leading-relaxed";

export function ProgramForm({
  mode,
  categories,
  languages,
  initialValues,
  initialPreviewMode = false,
}: ProgramFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [activeTab, setActiveTab] = useState<"edit" | "preview">(
    initialPreviewMode ? "preview" : "edit"
  );

  const [title, setTitle] = useState(initialValues.title);
  const [slug, setSlug] = useState(initialValues.slug);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(
    Boolean(initialValues.slug)
  );
  const [categoryId, setCategoryId] = useState(
    initialValues.categoryId || categories[0]?.id || ""
  );
  const [difficulty, setDifficulty] = useState<Difficulty>(
    initialValues.difficulty || "BEGINNER"
  );
  const [currentStatus, setCurrentStatus] = useState<ProgramStatus>(
    initialValues.status || "DRAFT"
  );

  const [problemStatement, setProblemStatement] = useState(
    initialValues.problemStatement
  );
  const [inputDescription, setInputDescription] = useState(
    initialValues.inputDescription
  );
  const [outputDescription, setOutputDescription] = useState(
    initialValues.outputDescription
  );
  const [examples, setExamples] = useState(initialValues.examples);
  const [explanation, setExplanation] = useState(initialValues.explanation);
  const [algorithm, setAlgorithm] = useState(initialValues.algorithm);
  const [timeComplexity, setTimeComplexity] = useState(
    initialValues.timeComplexity || "O(n)"
  );
  const [spaceComplexity, setSpaceComplexity] = useState(
    initialValues.spaceComplexity || "O(1)"
  );

  const [implementations, setImplementations] = useState<
    {
      languageId: string;
      fileName: string;
      code: string;
    }[]
  >(initialValues.implementations);

  // Confirmation state before removing a language implementation
  const [confirmRemoveLangId, setConfirmRemoveLangId] = useState<string | null>(
    null
  );

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slugManuallyEdited) {
      const nextSlug = generateSlugFromTitle(val);
      setSlug(nextSlug);
    }
  };

  const handleSlugChange = (val: string) => {
    setSlugManuallyEdited(true);
    setSlug(val);
  };

  const handleSyncSlug = () => {
    const nextSlug = generateSlugFromTitle(title);
    setSlug(nextSlug);
    setSlugManuallyEdited(false);
  };

  const handleAddLanguage = (lang: LanguageOption) => {
    if (implementations.some((i) => i.languageId === lang.id)) {
      setFeedback({
        type: "error",
        text: `${lang.name} implementation is already added to this program.`,
      });
      return;
    }
    const defaultFile = getDefaultFileName(slug || generateSlugFromTitle(title), lang.fileExtension);
    setImplementations((prev) => [
      ...prev,
      {
        languageId: lang.id,
        fileName: defaultFile,
        code: "",
      },
    ]);
  };

  const handleUpdateImplementation = (
    languageId: string,
    field: "fileName" | "code",
    value: string
  ) => {
    setImplementations((prev) =>
      prev.map((item) =>
        item.languageId === languageId ? { ...item, [field]: value } : item
      )
    );
  };

  const handleRemoveLanguageConfirmed = (languageId: string) => {
    setImplementations((prev) =>
      prev.filter((item) => item.languageId !== languageId)
    );
    setConfirmRemoveLangId(null);
  };

  const handleCodeEditorKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
    languageId: string,
    currentCode: string
  ) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const updated =
        currentCode.substring(0, start) + "    " + currentCode.substring(end);
      handleUpdateImplementation(languageId, "code", updated);
      requestAnimationFrame(() => {
        target.selectionStart = target.selectionEnd = start + 4;
      });
    }
  };

  const handleSubmitWithStatus = (targetStatus: ProgramStatus) => {
    setFeedback(null);

    startTransition(async () => {
      const res = await saveProgramAction({
        id: initialValues.id,
        title,
        slug,
        categoryId,
        difficulty,
        status: targetStatus,
        problemStatement,
        inputDescription,
        outputDescription,
        examples,
        explanation,
        algorithm,
        timeComplexity,
        spaceComplexity,
        implementations,
      });

      if (res.ok && res.data) {
        setCurrentStatus(res.data.status);
        setFeedback({
          type: "success",
          text:
            res.message ||
            (targetStatus === "PUBLISHED"
              ? "Program published successfully."
              : "Program saved as draft."),
        });
        if (mode === "create") {
          router.push(`/admin/programs/${res.data.id}/edit`);
        } else {
          router.refresh();
        }
      } else {
        setFeedback({
          type: "error",
          text: res.error || "Please check the form fields and try again.",
        });
      }
    });
  };

  const langById = new Map(languages.map((l) => [l.id, l]));
  const availableLanguagesToAdd = languages.filter(
    (l) => !implementations.some((impl) => impl.languageId === l.id)
  );

  // Build preview items for Admin Preview mode
  const previewImplementations: ProgramImplementationItem[] = implementations
    .map((impl) => {
      const lang = langById.get(impl.languageId);
      if (!lang) return null;
      return {
        id: lang.id,
        code: impl.code || "// No code entered yet",
        fileName:
          impl.fileName || getDefaultFileName(slug || "program", lang.fileExtension),
        language: lang,
      };
    })
    .filter((x): x is ProgramImplementationItem => x !== null);

  const selectedCategoryName =
    categories.find((c) => c.id === categoryId)?.name || "Uncategorized";

  return (
    <div className="space-y-6">
      {/* Top Action Bar: Mode Switcher (Edit Form vs Live Admin Preview) + Status Badge */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-4 sm:p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("edit")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
              activeTab === "edit"
                ? "bg-indigo-600 dark:bg-indigo-600 text-white shadow-xs"
                : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700"
            }`}
          >
            Edit Form
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
              activeTab === "preview"
                ? "bg-indigo-600 dark:bg-indigo-600 text-white shadow-xs"
                : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700"
            }`}
          >
            Admin Preview
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border ${
              currentStatus === "PUBLISHED"
                ? "bg-emerald-100/90 text-emerald-900 border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30"
                : "bg-amber-100/90 text-amber-900 border-amber-300 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                currentStatus === "PUBLISHED"
                  ? "bg-emerald-600 dark:bg-emerald-400"
                  : "bg-amber-600 dark:bg-amber-400"
              }`}
            />
            Current Status: {currentStatus === "PUBLISHED" ? "Published" : "Draft"}
          </span>

          {currentStatus === "PUBLISHED" && slug && (
            <Link
              href={`/programs/${slug}`}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-600/15 dark:hover:bg-indigo-500/25 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 transition-colors"
            >
              Open Public Page &rarr;
            </Link>
          )}
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          role="alert"
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
            aria-label="Dismiss message"
          >
            &times;
          </button>
        </div>
      )}

      {activeTab === "preview" ? (
        /* Admin Preview Mode (Safe preview for Draft or Published programs) */
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-500/40 text-xs text-amber-900 dark:text-amber-200 flex flex-wrap items-center justify-between gap-2">
            <span>
              <strong>Admin Preview Mode:</strong> Viewing how &ldquo;
              {title || "Untitled Program"}&rdquo; renders in the CodePati learning layout.{" "}
              {currentStatus === "DRAFT" &&
                "This program is currently a DRAFT and is hidden from public visitors."}
            </span>
            <button
              type="button"
              onClick={() => setActiveTab("edit")}
              className="px-3 py-1 rounded-lg font-semibold bg-amber-200/80 dark:bg-amber-500/20 text-amber-950 dark:text-amber-200"
            >
              Back to Editor
            </button>
          </div>

          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-100/90 text-emerald-900 border border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30">
                {difficulty}
              </span>
              <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
                {selectedCategoryName}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white">
              {title || "Untitled Program"}
            </h2>

            <div className="space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Problem Statement
              </h3>
              <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed">
                {problemStatement || "No problem statement entered."}
              </p>
            </div>

            {(inputDescription || outputDescription) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800">
                  <h4 className="text-xs font-bold uppercase text-indigo-600 dark:text-indigo-400">
                    Input
                  </h4>
                  <p className="text-sm text-slate-800 dark:text-slate-200 mt-1">
                    {inputDescription || "N/A"}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800">
                  <h4 className="text-xs font-bold uppercase text-emerald-700 dark:text-emerald-400">
                    Output
                  </h4>
                  <p className="text-sm text-slate-800 dark:text-slate-200 mt-1">
                    {outputDescription || "N/A"}
                  </p>
                </div>
              </div>
            )}

            {examples && (
              <div className="space-y-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Example
                </h3>
                <pre className="p-4 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 font-mono text-xs sm:text-sm text-slate-900 dark:text-slate-100 whitespace-pre-wrap">
                  {examples}
                </pre>
              </div>
            )}

            <div className="space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Explanation
              </h3>
              <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed">
                {explanation || "No explanation entered."}
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Algorithm / Logic
              </h3>
              <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed">
                {algorithm || "No algorithm entered."}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Time Complexity
                </span>
                <code className="font-mono font-bold text-sm text-indigo-700 dark:text-indigo-300">
                  {timeComplexity || "N/A"}
                </code>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Space Complexity
                </span>
                <code className="font-mono font-bold text-sm text-emerald-800 dark:text-emerald-300">
                  {spaceComplexity || "N/A"}
                </code>
              </div>
            </div>
          </div>

          <LanguageSelector implementations={previewImplementations} />
        </div>
      ) : (
        /* Structured Program Form */
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmitWithStatus(currentStatus);
          }}
          className="space-y-8"
        >
          {/* Section 1: Basic Information */}
          <section className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-5">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-slate-950 dark:text-white flex items-center gap-2">
                <span className="w-2 h-5 rounded-full bg-indigo-600" />
                <span>Basic Information</span>
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Core identification, URL slug, category, and difficulty classification
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Title */}
              <div className="space-y-1.5">
                <label
                  htmlFor="program-title"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200"
                >
                  Title <span className="text-red-600">*</span>
                </label>
                <input
                  id="program-title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Palindrome Number"
                  className={inputBaseClass}
                />
              </div>

              {/* Slug */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="program-slug"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200"
                  >
                    Slug <span className="text-red-600">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleSyncSlug}
                    className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Generate from Title
                  </button>
                </div>
                <input
                  id="program-slug"
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="e.g. palindrome-number"
                  className={`${inputBaseClass} font-mono`}
                />
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label
                  htmlFor="program-category"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200"
                >
                  Category <span className="text-red-600">*</span>
                </label>
                <select
                  id="program-category"
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className={inputBaseClass}
                >
                  <option value="" disabled className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
                    Select Category
                  </option>
                  {categories.map((cat) => (
                    <option
                      key={cat.id}
                      value={cat.id}
                      className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100"
                    >
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty */}
              <div className="space-y-1.5">
                <label
                  htmlFor="program-difficulty"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200"
                >
                  Difficulty <span className="text-red-600">*</span>
                </label>
                <select
                  id="program-difficulty"
                  required
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                  className={inputBaseClass}
                >
                  <option value="BEGINNER" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
                    Beginner
                  </option>
                  <option value="MEDIUM" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
                    Medium
                  </option>
                  <option value="ADVANCED" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
                    Advanced
                  </option>
                </select>
              </div>
            </div>
          </section>

          {/* Section 2: Problem */}
          <section className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-5">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-slate-950 dark:text-white flex items-center gap-2">
                <span className="w-2 h-5 rounded-full bg-indigo-600" />
                <span>Problem</span>
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Clear problem definition, input/output specification, and sample input/output
              </p>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="program-problem"
                className="block text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200"
              >
                Problem Statement <span className="text-red-600">*</span>
              </label>
              <textarea
                id="program-problem"
                rows={4}
                required
                value={problemStatement}
                onChange={(e) => setProblemStatement(e.target.value)}
                placeholder="Describe the programming task clearly..."
                className={textareaBaseClass}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label
                  htmlFor="program-input-desc"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200"
                >
                  Input Description
                </label>
                <textarea
                  id="program-input-desc"
                  rows={3}
                  value={inputDescription}
                  onChange={(e) => setInputDescription(e.target.value)}
                  placeholder="Describe the expected input format and constraints..."
                  className={textareaBaseClass}
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="program-output-desc"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200"
                >
                  Output Description
                </label>
                <textarea
                  id="program-output-desc"
                  rows={3}
                  value={outputDescription}
                  onChange={(e) => setOutputDescription(e.target.value)}
                  placeholder="Describe the expected output..."
                  className={textareaBaseClass}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="program-examples"
                className="block text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200"
              >
                Sample Input / Output Example
              </label>
              <textarea
                id="program-examples"
                rows={4}
                value={examples}
                onChange={(e) => setExamples(e.target.value)}
                placeholder={`Input: 121\nOutput: 121 is a Palindrome Number`}
                className={`${textareaBaseClass} font-mono text-xs sm:text-sm`}
              />
            </div>
          </section>

          {/* Section 3: Learning Content */}
          <section className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-5">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-slate-950 dark:text-white flex items-center gap-2">
                <span className="w-2 h-5 rounded-full bg-indigo-600" />
                <span>Learning Content</span>
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Conceptual explanation, step-by-step algorithm logic, and Big-O complexity
              </p>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="program-explanation"
                className="block text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200"
              >
                Explanation <span className="text-red-600">*</span>
              </label>
              <textarea
                id="program-explanation"
                rows={4}
                required
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder="Explain the intuition and mathematical/algorithmic idea behind solving this problem..."
                className={textareaBaseClass}
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="program-algorithm"
                className="block text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200"
              >
                Algorithm / Logic <span className="text-red-600">*</span>
              </label>
              <textarea
                id="program-algorithm"
                rows={5}
                required
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value)}
                placeholder={`Step 1: Read the input number n.\nStep 2: Reverse the digits of n.\nStep 3: Compare the reversed number with the original number.`}
                className={textareaBaseClass}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label
                  htmlFor="program-time-complexity"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200"
                >
                  Time Complexity <span className="text-red-600">*</span>
                </label>
                <input
                  id="program-time-complexity"
                  type="text"
                  required
                  value={timeComplexity}
                  onChange={(e) => setTimeComplexity(e.target.value)}
                  placeholder="e.g. O(log10(n)) or O(n)"
                  className={`${inputBaseClass} font-mono`}
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="program-space-complexity"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200"
                >
                  Space Complexity <span className="text-red-600">*</span>
                </label>
                <input
                  id="program-space-complexity"
                  type="text"
                  required
                  value={spaceComplexity}
                  onChange={(e) => setSpaceComplexity(e.target.value)}
                  placeholder="e.g. O(1)"
                  className={`${inputBaseClass} font-mono`}
                />
              </div>
            </div>
          </section>

          {/* Section 4: Language Implementations */}
          <section className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-950 dark:text-white flex items-center gap-2">
                  <span className="w-2 h-5 rounded-full bg-indigo-600" />
                  <span>Language Implementations ({implementations.length})</span>
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Add source code and filenames matching each language&apos;s expected file extension (.c, .cpp, .java, .py)
                </p>
              </div>

              {/* Add Language Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {availableLanguagesToAdd.map((lang) => (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => handleAddLanguage(lang)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-600/15 dark:hover:bg-indigo-500/25 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 transition-colors"
                  >
                    + Add {lang.name} ({lang.fileExtension})
                  </button>
                ))}
              </div>
            </div>

            {implementations.length === 0 ? (
              <div className="p-8 rounded-xl bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-3">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  No language implementations added yet
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Click one of the language buttons above (+ Add C, + Add C++, + Add Java, + Add Python) to add code.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {implementations.map((impl) => {
                  const lang = langById.get(impl.languageId);
                  if (!lang) return null;
                  const expectedExt = lang.fileExtension.startsWith(".")
                    ? lang.fileExtension
                    : `.${lang.fileExtension}`;
                  const isExtValid = impl.fileName
                    .trim()
                    .toLowerCase()
                    .endsWith(expectedExt.toLowerCase());
                  const lineCount = (impl.code || "").split(/\r?\n/).length;

                  return (
                    <div
                      key={impl.languageId}
                      className="rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 overflow-hidden"
                    >
                      {/* Implementation Header Bar */}
                      <div className="px-4 py-3 bg-slate-200/70 dark:bg-slate-900 border-b border-slate-300 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-600 dark:bg-indigo-600 text-white">
                            {lang.name}
                          </span>
                          <span className="text-xs font-mono text-slate-700 dark:text-slate-300">
                            Required extension:{" "}
                            <strong className="text-indigo-700 dark:text-indigo-300">
                              {expectedExt}
                            </strong>
                          </span>
                        </div>

                        {confirmRemoveLangId === impl.languageId ? (
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-semibold text-red-700 dark:text-red-300">
                              Remove {lang.name}?
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveLanguageConfirmed(impl.languageId)
                              }
                              className="px-2.5 py-1 rounded-lg font-semibold bg-red-600 text-white"
                            >
                              Yes, Remove
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmRemoveLangId(null)}
                              className="px-2.5 py-1 rounded-lg font-semibold bg-slate-300 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmRemoveLangId(impl.languageId)
                            }
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors"
                          >
                            Remove {lang.name}
                          </button>
                        )}
                      </div>

                      <div className="p-4 sm:p-5 space-y-4">
                        {/* Filename Input + Extension Check */}
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <label
                              htmlFor={`filename-${lang.slug}`}
                              className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200"
                            >
                              Filename ({lang.name}){" "}
                              <span className="text-red-600">*</span>
                            </label>
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateImplementation(
                                  impl.languageId,
                                  "fileName",
                                  getDefaultFileName(
                                    slug || generateSlugFromTitle(title),
                                    expectedExt
                                  )
                                )
                              }
                              className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                            >
                              Use Default (
                              {getDefaultFileName(
                                slug || generateSlugFromTitle(title),
                                expectedExt
                              )}
                              )
                            </button>
                          </div>
                          <input
                            id={`filename-${lang.slug}`}
                            type="text"
                            required
                            value={impl.fileName}
                            onChange={(e) =>
                              handleUpdateImplementation(
                                impl.languageId,
                                "fileName",
                                e.target.value
                              )
                            }
                            placeholder={`e.g. ${getDefaultFileName(
                              slug || "solution",
                              expectedExt
                            )}`}
                            className={`${inputBaseClass} font-mono`}
                          />
                          {impl.fileName && !isExtValid && (
                            <p className="text-xs font-semibold text-red-600 dark:text-red-400">
                              Filename must end with &ldquo;{expectedExt}&rdquo; for{" "}
                              {lang.name}.
                            </p>
                          )}
                        </div>

                        {/* Monospace Code Editor */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <label
                              htmlFor={`code-${lang.slug}`}
                              className="font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200"
                            >
                              {lang.name} Source Code{" "}
                              <span className="text-red-600">*</span>
                            </label>
                            <span className="font-mono text-slate-600 dark:text-slate-400">
                              {lineCount} line{lineCount === 1 ? "" : "s"} &bull; Tab indents 4 spaces
                            </span>
                          </div>
                          <textarea
                            id={`code-${lang.slug}`}
                            rows={12}
                            required
                            spellCheck={false}
                            value={impl.code}
                            onKeyDown={(e) =>
                              handleCodeEditorKeyDown(
                                e,
                                impl.languageId,
                                impl.code
                              )
                            }
                            onChange={(e) =>
                              handleUpdateImplementation(
                                impl.languageId,
                                "code",
                                e.target.value
                              )
                            }
                            placeholder={`Enter complete, runnable ${lang.name} solution code...`}
                            className="w-full p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-indigo-600 dark:focus:border-indigo-400 font-mono text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 leading-relaxed whitespace-pre overflow-x-auto dark:[color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-indigo-600/25 dark:focus:ring-indigo-400/30"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Bottom Submit Bar: Save Draft & Publish */}
          <div className="sticky bottom-4 z-30 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-300 dark:border-slate-800 p-4 sm:p-5 shadow-lg flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/admin/programs"
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-200/80 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors"
              >
                &larr; Back to Programs
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleSubmitWithStatus("DRAFT")}
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-amber-100 hover:bg-amber-200 dark:bg-amber-500/20 dark:hover:bg-amber-500/30 text-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-500/40 transition-colors disabled:opacity-50"
              >
                {isPending ? "Saving..." : "Save Draft"}
              </button>

              <button
                type="button"
                disabled={isPending}
                onClick={() => handleSubmitWithStatus("PUBLISHED")}
                className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white shadow-xs transition-colors disabled:opacity-50"
              >
                {isPending
                  ? "Publishing..."
                  : mode === "edit" && currentStatus === "PUBLISHED"
                  ? "Save & Update Published"
                  : "Publish"}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

export default ProgramForm;
