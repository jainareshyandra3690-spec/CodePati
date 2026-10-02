export type Role = "USER" | "ADMIN";

export type Difficulty = "BEGINNER" | "MEDIUM" | "ADVANCED";

export type ProgramStatus = "DRAFT" | "PUBLISHED";

export type SubmissionType =
  | "NEW_PROGRAM"
  | "ALTERNATIVE_SOLUTION"
  | "EXPLANATION"
  | "CORRECTION"
  | "ALGORITHM"
  | "LANGUAGE_IMPLEMENTATION";

export type SubmissionStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "REQUIRES_CHANGES";

export interface CategorySummary {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export interface LanguageSummary {
  id: string;
  name: string;
  slug: string;
  fileExtension: string;
}
