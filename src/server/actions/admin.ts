"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireAdminUser } from "@/lib/admin-auth";
import { Difficulty, ProgramStatus } from "@prisma/client";

export interface ActionResponse<T = undefined> {
  ok: boolean;
  message?: string;
  error?: string;
  data?: T;
}

export interface LanguageImplementationInput {
  languageId: string;
  fileName: string;
  code: string;
}

export interface SaveProgramInput {
  id?: string;
  title: string;
  slug: string;
  categoryId: string;
  difficulty: Difficulty;
  status: ProgramStatus;
  problemStatement: string;
  inputDescription?: string;
  outputDescription?: string;
  examples?: string;
  explanation: string;
  algorithm: string;
  timeComplexity: string;
  spaceComplexity: string;
  implementations: LanguageImplementationInput[];
}

function normalizeSlug(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function revalidateAllContentPaths(slug?: string, categorySlug?: string) {
  revalidatePath("/");
  revalidatePath("/programs");
  if (slug) {
    revalidatePath(`/programs/${slug}`);
  }
  revalidatePath("/search");
  revalidatePath("/categories");
  if (categorySlug) {
    revalidatePath(`/categories/${categorySlug}`);
  }
  revalidatePath("/difficulty/beginner");
  revalidatePath("/difficulty/medium");
  revalidatePath("/difficulty/advanced");
  revalidatePath("/admin");
  revalidatePath("/admin/programs");
  revalidatePath("/admin/categories");
  revalidatePath("/admin/languages");
}

/**
 * Create or Update an official CodePati Program along with its Language Implementations.
 */
export async function saveProgramAction(
  input: SaveProgramInput
): Promise<ActionResponse<{ id: string; slug: string; status: ProgramStatus }>> {
  try {
    const adminUser = await requireAdminUser();

    const title = (input.title ?? "").trim();
    const slug = normalizeSlug(input.slug ?? "");
    const categoryId = (input.categoryId ?? "").trim();
    const difficulty = input.difficulty;
    const status = input.status;
    const problemStatement = (input.problemStatement ?? "").trim();
    const inputDescription = (input.inputDescription ?? "").trim();
    const outputDescription = (input.outputDescription ?? "").trim();
    const examples = (input.examples ?? "").trim();
    const explanation = (input.explanation ?? "").trim();
    const algorithm = (input.algorithm ?? "").trim();
    const timeComplexity = (input.timeComplexity ?? "").trim();
    const spaceComplexity = (input.spaceComplexity ?? "").trim();

    // 1. Validate required program fields
    if (!title) {
      return { ok: false, error: "Program title is required." };
    }
    if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return {
        ok: false,
        error:
          "A valid URL slug is required (use lowercase letters, numbers, and hyphens, e.g. palindrome-number).",
      };
    }
    if (!categoryId) {
      return { ok: false, error: "Please select a valid category." };
    }
    if (!["BEGINNER", "MEDIUM", "ADVANCED"].includes(difficulty)) {
      return { ok: false, error: "Please select a valid difficulty level." };
    }
    if (!["DRAFT", "PUBLISHED"].includes(status)) {
      return { ok: false, error: "Invalid program status." };
    }
    if (!problemStatement) {
      return { ok: false, error: "Problem statement is required." };
    }
    if (!explanation) {
      return { ok: false, error: "Explanation is required." };
    }
    if (!algorithm) {
      return { ok: false, error: "Algorithm / Logic steps are required." };
    }
    if (!timeComplexity) {
      return { ok: false, error: "Time complexity is required (e.g. O(n) or O(1))." };
    }
    if (!spaceComplexity) {
      return { ok: false, error: "Space complexity is required (e.g. O(1))." };
    }

    // 2. Verify Category exists in PostgreSQL
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true, slug: true },
    });
    if (!category) {
      return { ok: false, error: "Selected category was not found in the database." };
    }

    // 3. Check slug uniqueness without overwriting existing programs
    const existingWithSlug = await prisma.program.findUnique({
      where: { slug },
      select: { id: true, title: true },
    });
    if (existingWithSlug && existingWithSlug.id !== input.id) {
      return {
        ok: false,
        error: `Slug "${slug}" is already used by "${existingWithSlug.title}". Please choose a unique slug.`,
      };
    }

    // 4. Validate Language Implementations
    const rawImpls = Array.isArray(input.implementations)
      ? input.implementations
      : [];

    if (status === "PUBLISHED" && rawImpls.length === 0) {
      return {
        ok: false,
        error:
          "At least one language implementation is required before publishing a program.",
      };
    }

    // Prevent duplicate languages in the same program
    const seenLanguageIds = new Set<string>();
    for (const impl of rawImpls) {
      if (!impl.languageId) {
        return { ok: false, error: "Every implementation must specify a language." };
      }
      if (seenLanguageIds.has(impl.languageId)) {
        return {
          ok: false,
          error:
            "Duplicate language implementation detected. A program cannot have multiple implementations for the same language.",
        };
      }
      seenLanguageIds.add(impl.languageId);
    }

    // Load configured languages to validate filenames and extensions
    const allLanguages = await prisma.language.findMany({
      select: { id: true, name: true, slug: true, fileExtension: true },
    });
    const langMap = new Map(allLanguages.map((l) => [l.id, l]));

    const validatedImpls: {
      languageId: string;
      fileName: string;
      code: string;
    }[] = [];

    for (const impl of rawImpls) {
      const lang = langMap.get(impl.languageId);
      if (!lang) {
        return {
          ok: false,
          error: "One of the selected languages does not exist in the database.",
        };
      }

      const code = (impl.code ?? "").replace(/\r\n/g, "\n");
      const fileName = (impl.fileName ?? "").trim();

      if (!code.trim()) {
        return {
          ok: false,
          error: `Source code cannot be empty for the ${lang.name} implementation.`,
        };
      }

      if (!fileName) {
        return {
          ok: false,
          error: `Filename is required for the ${lang.name} implementation (expected extension ${lang.fileExtension}).`,
        };
      }

      const expectedExt = lang.fileExtension.startsWith(".")
        ? lang.fileExtension.toLowerCase()
        : `.${lang.fileExtension.toLowerCase()}`;

      if (!fileName.toLowerCase().endsWith(expectedExt)) {
        return {
          ok: false,
          error: `Invalid filename "${fileName}" for ${lang.name}. Expected a filename ending with "${expectedExt}" (for example: ${slug.replace(/-/g, "_")}${expectedExt}).`,
        };
      }

      if (!/^[A-Za-z0-9_.-]+$/.test(fileName)) {
        return {
          ok: false,
          error: `Filename "${fileName}" contains invalid characters. Use only letters, digits, underscores, hyphens, and dots.`,
        };
      }

      validatedImpls.push({
        languageId: lang.id,
        fileName,
        code,
      });
    }

    // 5. Execute Database Transaction (Create or Update Program + Sync ProgramLanguages)
    const savedProgram = await prisma.$transaction(async (tx) => {
      let programRecord;

      if (input.id) {
        const existingProgram = await tx.program.findUnique({
          where: { id: input.id },
          select: { id: true },
        });
        if (!existingProgram) {
          throw new Error("NOT_FOUND");
        }

        programRecord = await tx.program.update({
          where: { id: input.id },
          data: {
            title,
            slug,
            categoryId,
            difficulty,
            status,
            problemStatement,
            inputDescription: inputDescription || null,
            outputDescription: outputDescription || null,
            examples: examples || null,
            explanation,
            algorithm,
            timeComplexity,
            spaceComplexity,
          },
          select: { id: true, slug: true, status: true },
        });

        // Remove language implementations that were explicitly removed for this program
        const keptLanguageIds = validatedImpls.map((i) => i.languageId);
        await tx.programLanguage.deleteMany({
          where: {
            programId: programRecord.id,
            languageId: { notIn: keptLanguageIds },
          },
        });

        // Upsert each submitted implementation
        for (const impl of validatedImpls) {
          await tx.programLanguage.upsert({
            where: {
              programId_languageId: {
                programId: programRecord.id,
                languageId: impl.languageId,
              },
            },
            update: {
              fileName: impl.fileName,
              code: impl.code,
            },
            create: {
              programId: programRecord.id,
              languageId: impl.languageId,
              fileName: impl.fileName,
              code: impl.code,
            },
          });
        }
      } else {
        programRecord = await tx.program.create({
          data: {
            title,
            slug,
            categoryId,
            difficulty,
            status,
            problemStatement,
            inputDescription: inputDescription || null,
            outputDescription: outputDescription || null,
            examples: examples || null,
            explanation,
            algorithm,
            timeComplexity,
            spaceComplexity,
            createdById: adminUser.id,
            languages: {
              create: validatedImpls.map((impl) => ({
                languageId: impl.languageId,
                fileName: impl.fileName,
                code: impl.code,
              })),
            },
          },
          select: { id: true, slug: true, status: true },
        });
      }

      return programRecord;
    });

    revalidateAllContentPaths(savedProgram.slug, category.slug);

    const actionVerb = input.id
      ? status === "PUBLISHED"
        ? "Program updated and published successfully."
        : "Program saved as draft."
      : status === "PUBLISHED"
      ? "Program published successfully."
      : "Program saved as draft.";

    return {
      ok: true,
      message: actionVerb,
      data: savedProgram,
    };
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "NOT_FOUND") {
      return { ok: false, error: "The requested program could not be found." };
    }
    if (
      err instanceof Error &&
      (err.message.includes("Authentication required") ||
        err.message.includes("Access denied"))
    ) {
      return { ok: false, error: err.message };
    }
    console.error("[Admin saveProgramAction] Error:", err);
    return {
      ok: false,
      error: "Unable to save the program right now. Please verify your inputs and try again.",
    };
  }
}

/**
 * Publish or Unpublish an existing Program.
 */
export async function setProgramStatusAction(
  programId: string,
  nextStatus: ProgramStatus
): Promise<ActionResponse<{ id: string; status: ProgramStatus }>> {
  try {
    await requireAdminUser();

    if (!programId) {
      return { ok: false, error: "Program ID is required." };
    }
    if (!["DRAFT", "PUBLISHED"].includes(nextStatus)) {
      return { ok: false, error: "Invalid program status." };
    }

    const existing = await prisma.program.findUnique({
      where: { id: programId },
      include: {
        category: { select: { slug: true } },
        _count: { select: { languages: true } },
      },
    });

    if (!existing) {
      return { ok: false, error: "Program not found." };
    }

    if (nextStatus === "PUBLISHED" && existing._count.languages === 0) {
      return {
        ok: false,
        error: `Cannot publish "${existing.title}" because it has no language implementations yet. Add at least one language implementation first.`,
      };
    }

    const updated = await prisma.program.update({
      where: { id: programId },
      data: { status: nextStatus },
      select: { id: true, slug: true, status: true },
    });

    revalidateAllContentPaths(updated.slug, existing.category.slug);

    return {
      ok: true,
      message:
        nextStatus === "PUBLISHED"
          ? "Program published successfully."
          : "Program unpublished and moved to draft.",
      data: { id: updated.id, status: updated.status },
    };
  } catch (err: unknown) {
    if (
      err instanceof Error &&
      (err.message.includes("Authentication required") ||
        err.message.includes("Access denied"))
    ) {
      return { ok: false, error: err.message };
    }
    console.error("[Admin setProgramStatusAction] Error:", err);
    return {
      ok: false,
      error: "Failed to update program status. Please try again.",
    };
  }
}

/**
 * Delete a Program and all of its ProgramLanguage implementations cleanly.
 */
export async function deleteProgramAction(
  programId: string
): Promise<ActionResponse> {
  try {
    await requireAdminUser();

    if (!programId) {
      return { ok: false, error: "Program ID is required." };
    }

    const existing = await prisma.program.findUnique({
      where: { id: programId },
      select: {
        id: true,
        title: true,
        slug: true,
        category: { select: { slug: true } },
      },
    });

    if (!existing) {
      return { ok: false, error: "Program not found." };
    }

    await prisma.$transaction([
      prisma.programLanguage.deleteMany({ where: { programId } }),
      prisma.program.delete({ where: { id: programId } }),
    ]);

    revalidateAllContentPaths(existing.slug, existing.category.slug);

    return {
      ok: true,
      message: `Program "${existing.title}" deleted successfully.`,
    };
  } catch (err: unknown) {
    if (
      err instanceof Error &&
      (err.message.includes("Authentication required") ||
        err.message.includes("Access denied"))
    ) {
      return { ok: false, error: err.message };
    }
    console.error("[Admin deleteProgramAction] Error:", err);
    return {
      ok: false,
      error: "Failed to delete program. Please try again.",
    };
  }
}

/**
 * Create or Update a Category.
 */
export async function saveCategoryAction(input: {
  id?: string;
  name: string;
  slug: string;
  description?: string;
}): Promise<ActionResponse> {
  try {
    await requireAdminUser();

    const name = (input.name ?? "").trim();
    const slug = normalizeSlug(input.slug ?? "");
    const description = (input.description ?? "").trim();

    if (!name) {
      return { ok: false, error: "Category name is required." };
    }
    if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return {
        ok: false,
        error: "A valid category slug is required (e.g. dynamic-programming).",
      };
    }

    const duplicate = await prisma.category.findFirst({
      where: {
        OR: [
          { name: { equals: name, mode: "insensitive" } },
          { slug: { equals: slug, mode: "insensitive" } },
        ],
        ...(input.id ? { NOT: { id: input.id } } : {}),
      },
      select: { id: true, name: true, slug: true },
    });

    if (duplicate) {
      return {
        ok: false,
        error: `A category with name "${duplicate.name}" or slug "${duplicate.slug}" already exists.`,
      };
    }

    if (input.id) {
      await prisma.category.update({
        where: { id: input.id },
        data: {
          name,
          slug,
          description: description || null,
        },
      });
    } else {
      await prisma.category.create({
        data: {
          name,
          slug,
          description: description || null,
        },
      });
    }

    revalidateAllContentPaths(undefined, slug);

    return {
      ok: true,
      message: input.id
        ? "Category updated successfully."
        : "Category created.",
    };
  } catch (err: unknown) {
    if (
      err instanceof Error &&
      (err.message.includes("Authentication required") ||
        err.message.includes("Access denied"))
    ) {
      return { ok: false, error: err.message };
    }
    console.error("[Admin saveCategoryAction] Error:", err);
    return {
      ok: false,
      error: "Unable to save category. Please try again.",
    };
  }
}

/**
 * Safe Delete Category: prevents deletion if any programs belong to this category.
 */
export async function deleteCategoryAction(
  categoryId: string
): Promise<ActionResponse> {
  try {
    await requireAdminUser();

    if (!categoryId) {
      return { ok: false, error: "Category ID is required." };
    }

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: { select: { programs: true } },
      },
    });

    if (!category) {
      return { ok: false, error: "Category not found." };
    }

    if (category._count.programs > 0) {
      return {
        ok: false,
        error: `Cannot delete category "${category.name}" because ${category._count.programs} program(s) currently use this category. Reassign those programs to another category before deleting.`,
      };
    }

    await prisma.category.delete({ where: { id: categoryId } });
    revalidateAllContentPaths(undefined, category.slug);

    return {
      ok: true,
      message: `Category "${category.name}" deleted successfully.`,
    };
  } catch (err: unknown) {
    if (
      err instanceof Error &&
      (err.message.includes("Authentication required") ||
        err.message.includes("Access denied"))
    ) {
      return { ok: false, error: err.message };
    }
    console.error("[Admin deleteCategoryAction] Error:", err);
    return {
      ok: false,
      error: "Unable to delete category right now.",
    };
  }
}

/**
 * Create or Update a Language.
 */
export async function saveLanguageAction(input: {
  id?: string;
  name: string;
  slug: string;
  fileExtension: string;
}): Promise<ActionResponse> {
  try {
    await requireAdminUser();

    const name = (input.name ?? "").trim();
    const slug = normalizeSlug(input.slug ?? "");
    let fileExtension = (input.fileExtension ?? "").trim().toLowerCase();

    if (!name) {
      return { ok: false, error: "Language name is required." };
    }
    if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return {
        ok: false,
        error: "A valid language slug is required (e.g. cpp, python, rust).",
      };
    }
    if (!fileExtension) {
      return {
        ok: false,
        error: "File extension is required (e.g. .c, .cpp, .java, .py).",
      };
    }
    if (!fileExtension.startsWith(".")) {
      fileExtension = `.${fileExtension}`;
    }
    if (!/^\.[a-z0-9]+$/.test(fileExtension)) {
      return {
        ok: false,
        error: `Invalid file extension "${fileExtension}". Expected a dot followed by letters/numbers (e.g. .py, .cpp).`,
      };
    }

    const duplicate = await prisma.language.findFirst({
      where: {
        OR: [
          { name: { equals: name, mode: "insensitive" } },
          { slug: { equals: slug, mode: "insensitive" } },
        ],
        ...(input.id ? { NOT: { id: input.id } } : {}),
      },
      select: { id: true, name: true, slug: true },
    });

    if (duplicate) {
      return {
        ok: false,
        error: `A language with name "${duplicate.name}" or slug "${duplicate.slug}" already exists.`,
      };
    }

    if (input.id) {
      await prisma.language.update({
        where: { id: input.id },
        data: { name, slug, fileExtension },
      });
    } else {
      await prisma.language.create({
        data: { name, slug, fileExtension },
      });
    }

    revalidateAllContentPaths();

    return {
      ok: true,
      message: input.id
        ? "Language updated."
        : "Language created.",
    };
  } catch (err: unknown) {
    if (
      err instanceof Error &&
      (err.message.includes("Authentication required") ||
        err.message.includes("Access denied"))
    ) {
      return { ok: false, error: err.message };
    }
    console.error("[Admin saveLanguageAction] Error:", err);
    return {
      ok: false,
      error: "Unable to save language. Please try again.",
    };
  }
}

/**
 * Safe Delete Language: prevents deletion if any program implementations or submissions use it.
 */
export async function deleteLanguageAction(
  languageId: string
): Promise<ActionResponse> {
  try {
    await requireAdminUser();

    if (!languageId) {
      return { ok: false, error: "Language ID is required." };
    }

    const language = await prisma.language.findUnique({
      where: { id: languageId },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            programLanguages: true,
            submissionLanguages: true,
          },
        },
      },
    });

    if (!language) {
      return { ok: false, error: "Language not found." };
    }

    const usedCount =
      language._count.programLanguages + language._count.submissionLanguages;

    if (usedCount > 0) {
      return {
        ok: false,
        error: `Cannot delete language "${language.name}" because it is currently used by ${language._count.programLanguages} program implementation(s). Remove those implementations before deleting this language.`,
      };
    }

    await prisma.language.delete({ where: { id: languageId } });
    revalidateAllContentPaths();

    return {
      ok: true,
      message: `Language "${language.name}" deleted successfully.`,
    };
  } catch (err: unknown) {
    if (
      err instanceof Error &&
      (err.message.includes("Authentication required") ||
        err.message.includes("Access denied"))
    ) {
      return { ok: false, error: err.message };
    }
    console.error("[Admin deleteLanguageAction] Error:", err);
    return {
      ok: false,
      error: "Unable to delete language right now.",
    };
  }
}
