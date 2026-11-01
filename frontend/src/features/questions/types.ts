/**
 * Domain types for the question bank.
 *
 * These intentionally mirror the Spring Boot DTOs/entities that Milestone 2
 * will introduce, so the shape of data here becomes the shape of the API.
 */

/** Allowed difficulty levels, fixed by the product spec. */
export const DIFFICULTIES = ["EASY", "MEDIUM", "HARD"] as const;

export type Difficulty = (typeof DIFFICULTIES)[number];

/**
 * Where a question came from. AI questions will stay drafts until the teacher
 * approves them (Milestone 4) — the field exists from day one so the schema
 * never needs a migration for it.
 */
export type SourceType = "MANUAL" | "AI";

/** The MVP fixes the format at exactly four options. */
export const OPTION_COUNT = 4;

export interface QuestionOption {
  /**
   * Stable id. The correct answer references an option by id, never by array
   * index, so reordering options can never silently repoint the answer.
   */
  id: string;
  text: string;
}

export interface QuestionMetadata {
  exam: string;
  subject: string;
  chapter: string;
  topic: string;
}

/** A stored question: everything the form produces, plus identity/audit fields. */
export interface Question {
  id: string;
  questionText: string;
  /** Always exactly OPTION_COUNT entries. */
  options: QuestionOption[];
  correctOptionId: string;
  explanation: string;
  difficulty: Difficulty;
  sourceType: SourceType;
  metadata: QuestionMetadata;
  /** ISO-8601 timestamps. */
  createdAt: string;
  updatedAt: string;
}

/**
 * Mutable form state. Deliberately looser than Question: fields may be empty
 * or invalid while the teacher is still typing.
 */
export interface QuestionDraft {
  questionText: string;
  options: QuestionOption[];
  /** "" until the teacher picks the correct option. */
  correctOptionId: string;
  explanation: string;
  /** "" until the teacher picks a difficulty. */
  difficulty: Difficulty | "";
  metadata: QuestionMetadata;
}

/**
 * A draft that passed validateQuestionDraft(): every field present, trimmed,
 * within limits, with exactly one correct option. This is the only shape the
 * repository layer is allowed to persist — and the same gate AI output will
 * have to pass in Milestone 4.
 */
export type ValidatedQuestionDraft = Omit<
  Question,
  "id" | "sourceType" | "createdAt" | "updatedAt"
>;
