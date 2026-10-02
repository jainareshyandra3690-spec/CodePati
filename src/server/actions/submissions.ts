"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireAuthenticatedUser } from "@/lib/user-auth";
import { requireAdminUser } from "@/lib/admin-auth";
import {
  Difficulty,
  SubmissionStatus,
  SubmissionType,
} from "@prisma/client";

export interface ActionResponse<T = undefined> {
  ok: boolean;
  message?: string;
  error?: string;
  data?: T;
}

export interface SubmissionLanguageInput {
  languageId: string;
  fileName: string;
  code: string;
}

export interface CreateSubmissionInput {
  submissionType: SubmissionType;
  title: string;
  description?: string;
  programId?: string;

  // Fields for NEW_PROGRAM
  slug?: string;
  categoryId?: string;
  difficulty?: Difficulty;
  problemStatement?: string;
  inputDescription?: string;
  outputDescription?: string;
  examples?: string;
  explanation?: string;
  algorithm?: string;
  timeComplexity?: string;
  spaceComplexity?: string;

  // Language implementations
  languages?: SubmissionLanguageInput[];
}

export interface UpdateSubmissionInput extends CreateSubmissionInput {
  id: string;
}

export interface ReviewSubmissionInput {
  submissionId: string;
  decision: "APPROVED" | "REJECTED" | "REQUIRES_CHANGES";
  adminFeedback?: string;
  replaceExistingLanguage?: boolean;
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

function revalidateSubmissionPaths(submissionId: string, programSlug?: string) {
  revalidatePath("/user/submissions");
  revalidatePath(`/user/submissions/${submissionId}`);
  revalidatePath("/admin");
  revalidatePath("/admin/submissions");
  revalidatePath(`/admin/submissions/${submissionId}`);

  if (programSlug) {
    revalidatePath("/programs");
    revalidatePath(`/programs/${programSlug}`);
    revalidatePath("/search");
    revalidatePath("/categories");
    revalidatePath("/difficulty/beginner");
    revalidatePath("/difficulty/medium");
    revalidatePath("/difficulty/advanced");
  }
}

/**
 * Validates language entries against database and file extension conventions.
 */
async function validateSubmissionLanguages(
  languagesInput: SubmissionLanguageInput[]
): Promise<{ ok: true; validated: SubmissionLanguageInput[] } | { ok: false; error: string }> {
  if (!languagesInput || languagesInput.length === 0) {
    return { ok: true, validated: [] };
  }

  const seenLanguageIds = new Set<string>();
  const dbLanguages = await prisma.language.findMany();
  const dbLanguageMap = new Map(dbLanguages.map((l) => [l.id, l]));

  for (const impl of languagesInput) {
    const langId = (impl.languageId ?? "").trim();
    const fileName = (impl.fileName ?? "").trim();
    const code = (impl.code ?? "").trim();

    if (!langId) {
      return { ok: false, error: "Please select a language for every implementation." };
    }
    if (seenLanguageIds.has(langId)) {
      return {
        ok: false,
        error: "Duplicate language entries are not allowed within the same submission.",
      };
    }
    seenLanguageIds.add(langId);

    const dbLang = dbLanguageMap.get(langId);
    if (!dbLang) {
      return { ok: false, error: "Invalid language selected." };
    }

    if (!fileName) {
      return { ok: false, error: `File name is required for ${dbLang.name}.` };
    }

    if (!fileName.toLowerCase().endsWith(dbLang.fileExtension.toLowerCase())) {
      return {
        ok: false,
        error: `File name for ${dbLang.name} must end with ${dbLang.fileExtension} (e.g. Solution${dbLang.fileExtension}).`,
      };
    }

    if (!code) {
      return { ok: false, error: `Source code cannot be empty for ${dbLang.name}.` };
    }
  }

  return { ok: true, validated: languagesInput };
}

/**
 * Creates a new content submission. Status is strictly set to PENDING.
 */
export async function createSubmissionAction(
  input: CreateSubmissionInput
): Promise<ActionResponse<{ id: string }>> {
  try {
    const user = await requireAuthenticatedUser();

    const title = (input.title ?? "").trim();
    const submissionType = input.submissionType;
    const description = (input.description ?? "").trim() || null;

    if (!title || title.length < 3) {
      return { ok: false, error: "Title is required (minimum 3 characters)." };
    }

    if (!Object.values(SubmissionType).includes(submissionType)) {
      return { ok: false, error: "Invalid submission type." };
    }

    // Validation per submission type
    if (submissionType === "NEW_PROGRAM") {
      const categoryId = (input.categoryId ?? "").trim();
      const problemStatement = (input.problemStatement ?? "").trim();
      const explanation = (input.explanation ?? "").trim();
      const algorithm = (input.algorithm ?? "").trim();
      const timeComplexity = (input.timeComplexity ?? "").trim();
      const spaceComplexity = (input.spaceComplexity ?? "").trim();
      const difficulty = input.difficulty || "BEGINNER";
      const slug = normalizeSlug(input.slug || title);

      if (!categoryId) {
        return { ok: false, error: "Category is required for a new program." };
      }
      const category = await prisma.category.findUnique({ where: { id: categoryId } });
      if (!category) {
        return { ok: false, error: "Selected category does not exist." };
      }

      if (!problemStatement) {
        return { ok: false, error: "Problem statement is required." };
      }
      if (!explanation) {
        return { ok: false, error: "Explanation is required." };
      }
      if (!algorithm) {
        return { ok: false, error: "Algorithm / Logic is required." };
      }
      if (!timeComplexity) {
        return { ok: false, error: "Time complexity is required (e.g. O(n))." };
      }
      if (!spaceComplexity) {
        return { ok: false, error: "Space complexity is required (e.g. O(1))." };
      }

      if (!input.languages || input.languages.length === 0) {
        return { ok: false, error: "At least one language implementation is required." };
      }

      const langValidation = await validateSubmissionLanguages(input.languages);
      if (!langValidation.ok) {
        return { ok: false, error: langValidation.error };
      }

      const submission = await prisma.$transaction(async (tx) => {
        const sub = await tx.submission.create({
          data: {
            userId: user.id,
            submissionType: "NEW_PROGRAM",
            status: "PENDING",
            title,
            slug: slug || null,
            description,
            categoryId,
            difficulty,
            problemStatement,
            inputDescription: input.inputDescription?.trim() || null,
            outputDescription: input.outputDescription?.trim() || null,
            examples: input.examples?.trim() || null,
            explanation,
            algorithm,
            timeComplexity,
            spaceComplexity,
            languages: {
              create: input.languages!.map((l) => ({
                languageId: l.languageId,
                fileName: l.fileName.trim(),
                code: l.code.trim(),
              })),
            },
          },
        });
        return sub;
      });

      revalidateSubmissionPaths(submission.id);
      return {
        ok: true,
        message: "Your program submission has been submitted for review.",
        data: { id: submission.id },
      };
    }

    // For all existing-program related submissions
    const programId = (input.programId ?? "").trim();
    if (!programId) {
      return { ok: false, error: "Please select an existing program to contribute to." };
    }

    const program = await prisma.program.findUnique({
      where: { id: programId },
      include: { languages: true },
    });
    if (!program) {
      return { ok: false, error: "Selected program does not exist." };
    }

    if (submissionType === "ALTERNATIVE_SOLUTION") {
      if (!description) {
        return {
          ok: false,
          error: "Description explaining how this alternative solution works or differs is required.",
        };
      }
      if (!input.languages || input.languages.length === 0) {
        return { ok: false, error: "At least one language solution code is required." };
      }
      const langValidation = await validateSubmissionLanguages(input.languages);
      if (!langValidation.ok) {
        return { ok: false, error: langValidation.error };
      }
    } else if (submissionType === "EXPLANATION") {
      const explanation = (input.explanation ?? "").trim();
      if (!explanation) {
        return { ok: false, error: "Proposed explanation text is required." };
      }
    } else if (submissionType === "ALGORITHM") {
      const algorithm = (input.algorithm ?? "").trim();
      if (!algorithm) {
        return { ok: false, error: "Proposed algorithm / logic steps are required." };
      }
    } else if (submissionType === "CORRECTION") {
      if (!description) {
        return { ok: false, error: "Description of the issue / correction is required." };
      }
    } else if (submissionType === "LANGUAGE_IMPLEMENTATION") {
      if (!input.languages || input.languages.length === 0) {
        return { ok: false, error: "Language implementation code is required." };
      }
      const langValidation = await validateSubmissionLanguages(input.languages);
      if (!langValidation.ok) {
        return { ok: false, error: langValidation.error };
      }

      // Check if language already exists on program
      const submittedLangId = input.languages[0].languageId;
      const alreadyHas = program.languages.some((l) => l.languageId === submittedLangId);
      if (alreadyHas) {
        return {
          ok: false,
          error:
            "This program already has an official implementation in this language. Please submit as an Alternative Solution instead.",
        };
      }
    }

    const submission = await prisma.$transaction(async (tx) => {
      const sub = await tx.submission.create({
        data: {
          userId: user.id,
          programId,
          submissionType,
          status: "PENDING",
          title,
          description,
          explanation: input.explanation?.trim() || null,
          algorithm: input.algorithm?.trim() || null,
          problemStatement: input.problemStatement?.trim() || null,
          languages:
            input.languages && input.languages.length > 0
              ? {
                  create: input.languages.map((l) => ({
                    languageId: l.languageId,
                    fileName: l.fileName.trim(),
                    code: l.code.trim(),
                  })),
                }
              : undefined,
        },
      });
      return sub;
    });

    revalidateSubmissionPaths(submission.id, program.slug);
    return {
      ok: true,
      message: "Your submission has been sent for review.",
      data: { id: submission.id },
    };
  } catch (err) {
    console.error("createSubmissionAction error:", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "An unexpected error occurred.",
    };
  }
}

/**
 * Updates and resubmits an existing submission that has status REQUIRES_CHANGES.
 * Transitions status back to PENDING.
 */
export async function updateSubmissionAction(
  input: UpdateSubmissionInput
): Promise<ActionResponse<{ id: string }>> {
  try {
    const user = await requireAuthenticatedUser();

    if (!input.id) {
      return { ok: false, error: "Submission ID is required." };
    }

    const existing = await prisma.submission.findUnique({
      where: { id: input.id },
      include: { languages: true, program: true },
    });

    if (!existing) {
      return { ok: false, error: "Submission not found." };
    }

    // Server-side ownership enforcement
    if (existing.userId !== user.id) {
      return { ok: false, error: "Access denied. You do not own this submission." };
    }

    // Only allow editing when status is REQUIRES_CHANGES
    if (existing.status !== "REQUIRES_CHANGES") {
      return {
        ok: false,
        error: `Submissions with status "${existing.status}" cannot be edited. Only submissions with "Changes Requested" can be edited and resubmitted.`,
      };
    }

    const title = (input.title ?? "").trim();
    if (!title || title.length < 3) {
      return { ok: false, error: "Title is required (minimum 3 characters)." };
    }

    const description = (input.description ?? "").trim() || null;

    if (existing.submissionType === "NEW_PROGRAM") {
      const categoryId = (input.categoryId ?? "").trim();
      const problemStatement = (input.problemStatement ?? "").trim();
      const explanation = (input.explanation ?? "").trim();
      const algorithm = (input.algorithm ?? "").trim();
      const timeComplexity = (input.timeComplexity ?? "").trim();
      const spaceComplexity = (input.spaceComplexity ?? "").trim();
      const difficulty = input.difficulty || "BEGINNER";
      const slug = normalizeSlug(input.slug || title);

      if (!categoryId) {
        return { ok: false, error: "Category is required." };
      }
      const category = await prisma.category.findUnique({ where: { id: categoryId } });
      if (!category) {
        return { ok: false, error: "Selected category does not exist." };
      }

      if (!problemStatement) {
        return { ok: false, error: "Problem statement is required." };
      }
      if (!explanation) {
        return { ok: false, error: "Explanation is required." };
      }
      if (!algorithm) {
        return { ok: false, error: "Algorithm / Logic is required." };
      }
      if (!timeComplexity) {
        return { ok: false, error: "Time complexity is required." };
      }
      if (!spaceComplexity) {
        return { ok: false, error: "Space complexity is required." };
      }

      if (!input.languages || input.languages.length === 0) {
        return { ok: false, error: "At least one language implementation is required." };
      }

      const langValidation = await validateSubmissionLanguages(input.languages);
      if (!langValidation.ok) {
        return { ok: false, error: langValidation.error };
      }

      await prisma.$transaction(async (tx) => {
        // Delete old submission languages and recreate
        await tx.submissionLanguage.deleteMany({
          where: { submissionId: existing.id },
        });

        await tx.submission.update({
          where: { id: existing.id },
          data: {
            title,
            slug: slug || null,
            description,
            categoryId,
            difficulty,
            problemStatement,
            inputDescription: input.inputDescription?.trim() || null,
            outputDescription: input.outputDescription?.trim() || null,
            examples: input.examples?.trim() || null,
            explanation,
            algorithm,
            timeComplexity,
            spaceComplexity,
            status: "PENDING", // Transition back to PENDING
            languages: {
              create: input.languages!.map((l) => ({
                languageId: l.languageId,
                fileName: l.fileName.trim(),
                code: l.code.trim(),
              })),
            },
          },
        });
      });
    } else {
      // Non-NEW_PROGRAM types
      if (existing.submissionType === "ALTERNATIVE_SOLUTION" || existing.submissionType === "LANGUAGE_IMPLEMENTATION") {
        if (!input.languages || input.languages.length === 0) {
          return { ok: false, error: "Source code is required." };
        }
        const langValidation = await validateSubmissionLanguages(input.languages);
        if (!langValidation.ok) {
          return { ok: false, error: langValidation.error };
        }
      }

      await prisma.$transaction(async (tx) => {
        await tx.submissionLanguage.deleteMany({
          where: { submissionId: existing.id },
        });

        await tx.submission.update({
          where: { id: existing.id },
          data: {
            title,
            description,
            explanation: input.explanation?.trim() || null,
            algorithm: input.algorithm?.trim() || null,
            problemStatement: input.problemStatement?.trim() || null,
            status: "PENDING", // Transition back to PENDING
            languages:
              input.languages && input.languages.length > 0
                ? {
                    create: input.languages.map((l) => ({
                      languageId: l.languageId,
                      fileName: l.fileName.trim(),
                      code: l.code.trim(),
                    })),
                  }
                : undefined,
          },
        });
      });
    }

    revalidateSubmissionPaths(existing.id, existing.program?.slug);
    return {
      ok: true,
      message: "Your submission has been updated and resubmitted for review.",
      data: { id: existing.id },
    };
  } catch (err) {
    console.error("updateSubmissionAction error:", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "An unexpected error occurred.",
    };
  }
}

/**
 * Admin review action: APPROVED, REJECTED, or REQUIRES_CHANGES.
 * Uses atomic Prisma transactions for official content application.
 */
export async function reviewSubmissionAction(
  input: ReviewSubmissionInput
): Promise<ActionResponse<{ submissionId: string; status: SubmissionStatus }>> {
  try {
    const admin = await requireAdminUser();

    const submissionId = (input.submissionId ?? "").trim();
    const decision = input.decision;
    const adminFeedback = (input.adminFeedback ?? "").trim();

    if (!submissionId) {
      return { ok: false, error: "Submission ID is required." };
    }

    if (!["APPROVED", "REJECTED", "REQUIRES_CHANGES"].includes(decision)) {
      return { ok: false, error: "Invalid review decision." };
    }

    if ((decision === "REJECTED" || decision === "REQUIRES_CHANGES") && !adminFeedback) {
      return {
        ok: false,
        error: "Admin feedback is required when rejecting or requesting changes.",
      };
    }

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        languages: { include: { language: true } },
        program: { include: { languages: true } },
        category: true,
      },
    });

    if (!submission) {
      return { ok: false, error: "Submission not found." };
    }

    // 1. REJECTED
    if (decision === "REJECTED") {
      await prisma.submission.update({
        where: { id: submission.id },
        data: {
          status: "REJECTED",
          adminFeedback,
          reviewedById: admin.id,
        },
      });

      revalidateSubmissionPaths(submission.id, submission.program?.slug);
      return {
        ok: true,
        message: "Submission marked as Rejected.",
        data: { submissionId: submission.id, status: "REJECTED" },
      };
    }

    // 2. REQUIRES_CHANGES
    if (decision === "REQUIRES_CHANGES") {
      await prisma.submission.update({
        where: { id: submission.id },
        data: {
          status: "REQUIRES_CHANGES",
          adminFeedback,
          reviewedById: admin.id,
        },
      });

      revalidateSubmissionPaths(submission.id, submission.program?.slug);
      return {
        ok: true,
        message: "Changes requested from the contributor.",
        data: { submissionId: submission.id, status: "REQUIRES_CHANGES" },
      };
    }

    // 3. APPROVED: Run atomic Prisma transaction based on submissionType
    let targetProgramSlug = submission.program?.slug;

    if (submission.submissionType === "NEW_PROGRAM") {
      if (!submission.categoryId) {
        return { ok: false, error: "Submission has no category assigned." };
      }
      if (!submission.problemStatement || !submission.explanation || !submission.algorithm) {
        return {
          ok: false,
          error: "Incomplete program content. Problem statement, explanation, and algorithm are required.",
        };
      }
      if (submission.languages.length === 0) {
        return { ok: false, error: "Program must have at least one language implementation." };
      }

      const baseSlug = normalizeSlug(submission.slug || submission.title);
      let finalSlug = baseSlug;
      let counter = 1;

      // Ensure slug uniqueness
      while (await prisma.program.findUnique({ where: { slug: finalSlug } })) {
        finalSlug = `${baseSlug}-${counter}`;
        counter++;
      }

      await prisma.$transaction(async (tx) => {
        const createdProgram = await tx.program.create({
          data: {
            title: submission.title,
            slug: finalSlug,
            categoryId: submission.categoryId!,
            difficulty: submission.difficulty || "BEGINNER",
            status: "PUBLISHED",
            problemStatement: submission.problemStatement!,
            inputDescription: submission.inputDescription || null,
            outputDescription: submission.outputDescription || null,
            examples: submission.examples || null,
            explanation: submission.explanation!,
            algorithm: submission.algorithm!,
            timeComplexity: submission.timeComplexity || "O(1)",
            spaceComplexity: submission.spaceComplexity || "O(1)",
            createdById: submission.userId,
            languages: {
              create: submission.languages.map((l) => ({
                languageId: l.languageId,
                fileName: l.fileName || `Solution${l.language.fileExtension}`,
                code: l.code,
              })),
            },
          },
        });

        await tx.submission.update({
          where: { id: submission.id },
          data: {
            status: "APPROVED",
            programId: createdProgram.id,
            reviewedById: admin.id,
            adminFeedback: adminFeedback || null,
          },
        });

        targetProgramSlug = createdProgram.slug;
      });
    } else if (submission.submissionType === "EXPLANATION") {
      if (!submission.programId) {
        return { ok: false, error: "Related program is required." };
      }
      const newExplanation = submission.explanation || submission.description;
      if (!newExplanation) {
        return { ok: false, error: "No explanation content to apply." };
      }

      await prisma.$transaction(async (tx) => {
        await tx.program.update({
          where: { id: submission.programId! },
          data: { explanation: newExplanation },
        });

        await tx.submission.update({
          where: { id: submission.id },
          data: {
            status: "APPROVED",
            reviewedById: admin.id,
            adminFeedback: adminFeedback || null,
          },
        });
      });
    } else if (submission.submissionType === "ALGORITHM") {
      if (!submission.programId) {
        return { ok: false, error: "Related program is required." };
      }
      const newAlgorithm = submission.algorithm || submission.description;
      if (!newAlgorithm) {
        return { ok: false, error: "No algorithm content to apply." };
      }

      await prisma.$transaction(async (tx) => {
        await tx.program.update({
          where: { id: submission.programId! },
          data: { algorithm: newAlgorithm },
        });

        await tx.submission.update({
          where: { id: submission.id },
          data: {
            status: "APPROVED",
            reviewedById: admin.id,
            adminFeedback: adminFeedback || null,
          },
        });
      });
    } else if (submission.submissionType === "CORRECTION") {
      if (!submission.programId) {
        return { ok: false, error: "Related program is required." };
      }

      await prisma.$transaction(async (tx) => {
        const updateData: {
          problemStatement?: string;
          explanation?: string;
          algorithm?: string;
        } = {};

        if (submission.problemStatement) {
          updateData.problemStatement = submission.problemStatement;
        }
        if (submission.explanation) {
          updateData.explanation = submission.explanation;
        }
        if (submission.algorithm) {
          updateData.algorithm = submission.algorithm;
        }

        if (Object.keys(updateData).length > 0) {
          await tx.program.update({
            where: { id: submission.programId! },
            data: updateData,
          });
        }

        // If code correction provided in submission.languages
        for (const subLang of submission.languages) {
          const existingLang = await tx.programLanguage.findUnique({
            where: {
              programId_languageId: {
                programId: submission.programId!,
                languageId: subLang.languageId,
              },
            },
          });

          if (existingLang) {
            await tx.programLanguage.update({
              where: { id: existingLang.id },
              data: {
                code: subLang.code,
                fileName: subLang.fileName || existingLang.fileName,
              },
            });
          }
        }

        await tx.submission.update({
          where: { id: submission.id },
          data: {
            status: "APPROVED",
            reviewedById: admin.id,
            adminFeedback: adminFeedback || null,
          },
        });
      });
    } else if (submission.submissionType === "LANGUAGE_IMPLEMENTATION") {
      if (!submission.programId) {
        return { ok: false, error: "Related program is required." };
      }
      if (submission.languages.length === 0) {
        return { ok: false, error: "No language implementation to add." };
      }

      const targetLang = submission.languages[0];
      const existingProgLang = await prisma.programLanguage.findUnique({
        where: {
          programId_languageId: {
            programId: submission.programId,
            languageId: targetLang.languageId,
          },
        },
      });

      if (existingProgLang && !input.replaceExistingLanguage) {
        return {
          ok: false,
          error:
            "An official implementation in this language already exists. To prevent accidental overwrite, confirm replacement or approve as an alternative solution.",
        };
      }

      await prisma.$transaction(async (tx) => {
        if (existingProgLang) {
          await tx.programLanguage.update({
            where: { id: existingProgLang.id },
            data: {
              code: targetLang.code,
              fileName: targetLang.fileName || existingProgLang.fileName,
            },
          });
        } else {
          await tx.programLanguage.create({
            data: {
              programId: submission.programId!,
              languageId: targetLang.languageId,
              code: targetLang.code,
              fileName: targetLang.fileName || `Solution${targetLang.language.fileExtension}`,
            },
          });
        }

        await tx.submission.update({
          where: { id: submission.id },
          data: {
            status: "APPROVED",
            reviewedById: admin.id,
            adminFeedback: adminFeedback || null,
          },
        });
      });
    } else if (submission.submissionType === "ALTERNATIVE_SOLUTION") {
      if (!submission.programId) {
        return { ok: false, error: "Related program is required." };
      }
      if (submission.languages.length === 0) {
        return { ok: false, error: "No solution code provided." };
      }

      const targetLang = submission.languages[0];

      await prisma.$transaction(async (tx) => {
        // Safe creation of AlternativeSolution without touching ProgramLanguage
        await tx.alternativeSolution.upsert({
          where: { submissionId: submission.id },
          create: {
            programId: submission.programId!,
            languageId: targetLang.languageId,
            title: submission.title,
            description: submission.description,
            code: targetLang.code,
            fileName: targetLang.fileName || `Alternative${targetLang.language.fileExtension}`,
            authorId: submission.userId,
            submissionId: submission.id,
          },
          update: {
            programId: submission.programId!,
            languageId: targetLang.languageId,
            title: submission.title,
            description: submission.description,
            code: targetLang.code,
            fileName: targetLang.fileName || `Alternative${targetLang.language.fileExtension}`,
          },
        });

        await tx.submission.update({
          where: { id: submission.id },
          data: {
            status: "APPROVED",
            reviewedById: admin.id,
            adminFeedback: adminFeedback || null,
          },
        });
      });
    }

    revalidateSubmissionPaths(submission.id, targetProgramSlug);
    return {
      ok: true,
      message: "Submission approved and applied successfully.",
      data: { submissionId: submission.id, status: "APPROVED" },
    };
  } catch (err) {
    console.error("reviewSubmissionAction error:", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "An unexpected error occurred during review.",
    };
  }
}
