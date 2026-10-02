import prisma from "@/lib/prisma";
import { Difficulty, ProgramStatus, Prisma } from "@prisma/client";
import type { ProgramCardData } from "@/components/programs/ProgramCard";

export interface ProgramSearchFilters {
  query?: string;
  category?: string;
  difficulty?: string;
  language?: string;
}

export interface CategoryWithCount {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  programCount: number;
}

export interface LanguageWithCount {
  id: string;
  name: string;
  slug: string;
  fileExtension: string;
  programCount: number;
}

const VALID_DIFFICULTIES = new Set<string>([
  Difficulty.BEGINNER,
  Difficulty.MEDIUM,
  Difficulty.ADVANCED,
]);

const LANGUAGE_ORDER: Record<string, number> = {
  c: 1,
  cpp: 2,
  java: 3,
  python: 4,
};

/**
 * Normalize raw search query: trim leading/trailing whitespace and collapse internal spaces.
 */
export function normalizeSearchQuery(raw?: string | null): string {
  if (!raw) return "";
  return raw.trim().replace(/\s+/g, " ");
}

/**
 * Normalize difficulty parameter to Prisma Difficulty enum if valid.
 */
export function normalizeDifficulty(raw?: string | null): Difficulty | "" {
  if (!raw) return "";
  const upper = raw.trim().toUpperCase();
  return VALID_DIFFICULTIES.has(upper) ? (upper as Difficulty) : "";
}

/**
 * Server-side search and filter query for PUBLISHED programs.
 */
export async function getPublishedPrograms(
  filters: ProgramSearchFilters = {}
): Promise<ProgramCardData[]> {
  const query = normalizeSearchQuery(filters.query);
  const categorySlug = (filters.category ?? "").trim().toLowerCase();
  const validDifficulty = normalizeDifficulty(filters.difficulty);
  const languageSlug = (filters.language ?? "").trim().toLowerCase();

  const whereClause: Prisma.ProgramWhereInput = {
    status: ProgramStatus.PUBLISHED,
  };

  if (query) {
    whereClause.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { slug: { contains: query, mode: "insensitive" } },
      { problemStatement: { contains: query, mode: "insensitive" } },
      { explanation: { contains: query, mode: "insensitive" } },
      { algorithm: { contains: query, mode: "insensitive" } },
      { category: { name: { contains: query, mode: "insensitive" } } },
      { category: { slug: { contains: query, mode: "insensitive" } } },
      {
        languages: {
          some: {
            language: {
              OR: [
                { name: { contains: query, mode: "insensitive" } },
                { slug: { contains: query, mode: "insensitive" } },
              ],
            },
          },
        },
      },
    ];
  }

  if (categorySlug) {
    whereClause.category = {
      slug: categorySlug,
    };
  }

  if (validDifficulty) {
    whereClause.difficulty = validDifficulty;
  }

  if (languageSlug) {
    whereClause.languages = {
      some: {
        language: {
          slug: languageSlug,
        },
      },
    };
  }

  const rows = await prisma.program.findMany({
    where: whereClause,
    orderBy: [{ title: "asc" }],
    select: {
      id: true,
      title: true,
      slug: true,
      problemStatement: true,
      difficulty: true,
      timeComplexity: true,
      spaceComplexity: true,
      category: {
        select: {
          name: true,
          slug: true,
        },
      },
      languages: {
        select: {
          language: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
    },
  });

  return rows.map((prog) => ({
    ...prog,
    languages: [...prog.languages].sort(
      (a, b) =>
        (LANGUAGE_ORDER[a.language.slug] ?? 99) -
        (LANGUAGE_ORDER[b.language.slug] ?? 99)
    ),
  }));
}

/**
 * Fetch categories and languages with their PUBLISHED program counts.
 */
export async function getDiscoveryMetadata(): Promise<{
  categories: CategoryWithCount[];
  languages: LanguageWithCount[];
}> {
  const [rawCategories, rawLanguages] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        _count: {
          select: {
            programs: {
              where: { status: ProgramStatus.PUBLISHED },
            },
          },
        },
      },
    }),
    prisma.language.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        fileExtension: true,
        _count: {
          select: {
            programLanguages: {
              where: {
                program: { status: ProgramStatus.PUBLISHED },
              },
            },
          },
        },
      },
    }),
  ]);

  return {
    categories: rawCategories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      programCount: c._count.programs,
    })),
    languages: rawLanguages.map((l) => ({
      id: l.id,
      name: l.name,
      slug: l.slug,
      fileExtension: l.fileExtension,
      programCount: l._count.programLanguages,
    })),
  };
}

export interface GetRelatedProgramsParams {
  currentProgramId: string;
  categorySlug: string;
  difficulty: Difficulty;
  limit?: number;
}

/**
 * Fetch related PUBLISHED programs using deterministic metadata:
 * 1. Same category + Published + Exclude current program (up to limit)
 * 2. If fewer than limit, supplement with other published programs of same difficulty
 * Selects only card fields (no heavy source code).
 */
export async function getRelatedPrograms({
  currentProgramId,
  categorySlug,
  difficulty,
  limit = 3,
}: GetRelatedProgramsParams): Promise<ProgramCardData[]> {
  const cardSelect = {
    id: true,
    title: true,
    slug: true,
    problemStatement: true,
    difficulty: true,
    timeComplexity: true,
    spaceComplexity: true,
    category: {
      select: {
        name: true,
        slug: true,
      },
    },
    languages: {
      select: {
        language: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    },
  } as const;

  // 1. Same category programs (excluding current)
  const sameCategoryRows = await prisma.program.findMany({
    where: {
      status: ProgramStatus.PUBLISHED,
      id: { not: currentProgramId },
      category: { slug: categorySlug },
    },
    orderBy: [{ title: "asc" }],
    take: limit,
    select: cardSelect,
  });

  let combined = [...sameCategoryRows];

  // 2. If fewer than limit, supplement with other published programs of same difficulty
  if (combined.length < limit) {
    const needed = limit - combined.length;
    const excludedIds = [currentProgramId, ...combined.map((p) => p.id)];

    const supplementRows = await prisma.program.findMany({
      where: {
        status: ProgramStatus.PUBLISHED,
        id: { notIn: excludedIds },
        difficulty: difficulty,
      },
      orderBy: [{ title: "asc" }],
      take: needed,
      select: cardSelect,
    });

    combined = [...combined, ...supplementRows];
  }

  return combined.map((prog) => ({
    ...prog,
    languages: [...prog.languages].sort(
      (a, b) =>
        (LANGUAGE_ORDER[a.language.slug] ?? 99) -
        (LANGUAGE_ORDER[b.language.slug] ?? 99)
    ),
  }));
}

