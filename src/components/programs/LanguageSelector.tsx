"use client";

import { useState, useCallback } from "react";
import { CodeBlock } from "./CodeBlock";
import { CopyCodeButton } from "./CopyCodeButton";

export interface ProgramImplementationItem {
  id: string;
  code: string;
  fileName: string;
  language: {
    id: string;
    name: string;
    slug: string;
    fileExtension: string;
  };
}

interface LanguageSelectorProps {
  implementations: ProgramImplementationItem[];
}

export function LanguageSelector({ implementations }: LanguageSelectorProps) {
  const [selectedSlug, setSelectedSlug] = useState<string>(
    implementations[0]?.language.slug ?? ""
  );

  const activeImpl =
    implementations.find((impl) => impl.language.slug === selectedSlug) ??
    implementations[0];

  const handleDownload = useCallback(() => {
    if (!activeImpl) return;
    try {
      const blob = new Blob([activeImpl.code], {
        type: "text/plain;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      // Sanitize filename to avoid any path traversal or unsafe characters
      const rawFileName =
        activeImpl.fileName ||
        `${activeImpl.language.slug}_solution.${activeImpl.language.fileExtension}`;
      const safeFileName =
        rawFileName.replace(/.*[/\\]/, "").replace(/^\.+/, "") ||
        `solution.${activeImpl.language.fileExtension}`;
      anchor.download = safeFileName;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    } catch {
      // Ignore client download failure safely
    }
  }, [activeImpl]);

  if (!activeImpl) {
    return (
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300">
        No language implementations available for this program.
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Top Bar: Language Selector Tabs */}
      <div className="px-4 sm:px-6 pt-4 border-b border-slate-300 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/80 flex flex-wrap items-center justify-between gap-3">
        <div
          role="tablist"
          aria-label="Select programming language"
          className="flex flex-wrap items-center gap-2 pb-3"
        >
          {implementations.map((impl) => {
            const isSelected = impl.language.slug === activeImpl.language.slug;
            return (
              <button
                key={impl.id}
                id={`tab-${impl.language.slug}`}
                type="button"
                role="tab"
                aria-selected={isSelected}
                aria-controls={`panel-${impl.language.slug}`}
                onClick={() => setSelectedSlug(impl.language.slug)}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  isSelected
                    ? "bg-indigo-600 dark:bg-indigo-600 text-white shadow-xs"
                    : "bg-white hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700"
                }`}
              >
                {isSelected && (
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-white shrink-0"
                    aria-hidden="true"
                  />
                )}
                <span>{impl.language.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sub-Header Toolbar: Filename Badge + Copy Code & Download Buttons */}
      <div className="px-4 sm:px-6 py-3 border-b border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {activeImpl.language.name}
          </span>
          <span className="text-slate-400 dark:text-slate-600">&bull;</span>
          <code
            title={`Filename: ${activeImpl.fileName}`}
            className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 border border-slate-300 dark:border-slate-700 font-mono font-semibold text-xs"
          >
            {activeImpl.fileName}
          </code>
        </div>

        <div className="flex items-center gap-2">
          <CopyCodeButton code={activeImpl.code} />

          <button
            type="button"
            onClick={handleDownload}
            aria-label={`Download ${activeImpl.fileName || activeImpl.language.name} solution`}
            title={`Download ${activeImpl.fileName || activeImpl.language.name}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-600/15 dark:hover:bg-indigo-500/25 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <svg
              className="w-3.5 h-3.5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Code Block Tabpanel */}
      <div
        role="tabpanel"
        id={`panel-${activeImpl.language.slug}`}
        aria-labelledby={`tab-${activeImpl.language.slug}`}
        tabIndex={0}
        className="focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        <CodeBlock
          code={activeImpl.code}
          languageSlug={activeImpl.language.slug}
        />
      </div>
    </div>
  );
}

export default LanguageSelector;
