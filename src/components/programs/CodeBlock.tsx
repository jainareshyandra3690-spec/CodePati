import React from "react";

interface CodeBlockProps {
  code: string;
  languageSlug: string;
}

interface Token {
  type: "comment" | "string" | "directive" | "keyword" | "type" | "number" | "plain";
  value: string;
}

const KEYWORDS = new Set([
  // Control flow & loops
  "if", "else", "elif", "while", "for", "do", "switch", "case", "default",
  "break", "continue", "return", "goto",
  // OOP & Declarations
  "class", "struct", "enum", "union", "typedef", "interface", "extends", "implements",
  "public", "private", "protected", "static", "final", "const", "virtual", "override",
  "new", "delete", "this", "super", "sizeof", "typeof",
  // Modules & Namespaces
  "import", "from", "package", "namespace", "using", "include", "as",
  // Python specific
  "def", "lambda", "yield", "pass", "with", "is", "in", "not", "and", "or",
  "try", "except", "finally", "raise", "assert", "global", "nonlocal",
  // Java & C++ exceptions
  "catch", "throw", "throws",
  // Literals
  "true", "false", "True", "False", "None", "null", "nullptr"
]);

const TYPES_AND_BUILTINS = new Set([
  // Primitive types
  "int", "long", "short", "byte", "char", "float", "double", "void", "bool", "boolean",
  "auto", "unsigned", "signed",
  // Common types & containers
  "string", "String", "size_t", "vector", "map", "set", "list", "dict", "tuple",
  // I/O & system names
  "std", "cout", "cin", "endl", "printf", "scanf", "putchar", "getchar",
  "System", "out", "println", "print", "input",
  // Utility methods & classes
  "Character", "Integer", "Math", "Scanner", "Arrays", "Collections",
  "strlen", "strcmp", "strcpy", "tolower", "toupper", "toLowerCase", "toUpperCase",
  "range", "len", "max", "min", "sum", "sorted", "enumerate", "zip", "open",
  "static_cast", "dynamic_cast", "reinterpret_cast", "const_cast"
]);

const TOKEN_REGEX =
  /(\/\/.*$|#include\s*<[^>]+>|#include\s*"[^"]+"|#.*$|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b\d+(?:\.\d+)?\b|\b[A-Za-z_][A-Za-z0-9_]*\b)/gm;

function tokenizeLine(line: string, languageSlug: string): Token[] {
  const tokens: Token[] = [];
  let lastIndex = 0;

  TOKEN_REGEX.lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = TOKEN_REGEX.exec(line)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({
        type: "plain",
        value: line.slice(lastIndex, match.index),
      });
    }

    const raw = match[0];
    let type: Token["type"] = "plain";

    if (raw.startsWith("//") || (raw.startsWith("#") && languageSlug === "python")) {
      type = "comment";
    } else if (raw.startsWith("#")) {
      type = "directive";
    } else if (raw.startsWith('"') || raw.startsWith("'")) {
      type = "string";
    } else if (/^\d/.test(raw)) {
      type = "number";
    } else if (KEYWORDS.has(raw)) {
      type = "keyword";
    } else if (TYPES_AND_BUILTINS.has(raw)) {
      type = "type";
    }

    tokens.push({ type, value: raw });
    lastIndex = TOKEN_REGEX.lastIndex;
  }

  if (lastIndex < line.length) {
    tokens.push({
      type: "plain",
      value: line.slice(lastIndex),
    });
  }

  return tokens;
}

function getTokenClassName(type: Token["type"]): string {
  switch (type) {
    case "comment":
      return "text-slate-600 dark:text-slate-500 italic";
    case "directive":
      return "text-pink-700 dark:text-pink-400 font-semibold";
    case "string":
      return "text-emerald-800 dark:text-emerald-400 font-medium";
    case "keyword":
      return "text-purple-800 dark:text-purple-400 font-bold";
    case "type":
      return "text-indigo-700 dark:text-indigo-400 font-semibold";
    case "number":
      return "text-amber-800 dark:text-amber-400 font-semibold";
    default:
      return "text-slate-900 dark:text-slate-100";
  }
}

export function CodeBlock({ code, languageSlug }: CodeBlockProps) {
  const normalizedCode = code.replace(/\r\n/g, "\n");
  const lines = normalizedCode.split("\n");

  return (
    <div
      className="w-full overflow-x-auto bg-slate-100/90 dark:bg-slate-950/95 text-xs sm:text-sm font-mono leading-relaxed select-text"
      role="region"
      aria-label={`${languageSlug.toUpperCase()} source code`}
      tabIndex={0}
    >
      <table className="w-full min-w-full border-collapse">
        <tbody>
          {lines.map((line, idx) => {
            const tokens = tokenizeLine(line, languageSlug);
            return (
              <tr
                key={idx}
                className="hover:bg-slate-200/70 dark:hover:bg-slate-900/60 transition-colors"
              >
                <td
                  aria-hidden="true"
                  className="select-none w-12 px-3 sm:px-4 py-0.5 text-right font-semibold bg-slate-200/60 dark:bg-slate-900/50 text-slate-600 dark:text-slate-500 border-r border-slate-300 dark:border-slate-800 align-top"
                >
                  {idx + 1}
                </td>
                <td className="px-4 sm:px-5 py-0.5 whitespace-pre align-top">
                  {tokens.length === 0 ? (
                    "\u00A0"
                  ) : (
                    tokens.map((t, tIdx) => (
                      <span key={tIdx} className={getTokenClassName(t.type)}>
                        {t.value}
                      </span>
                    ))
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default CodeBlock;
