import { createId } from "./ids";
import {
  OPTION_COUNT,
  type Question,
  type QuestionDraft,
  type QuestionMetadata,
  type QuestionOption,
} from "./types";

function createDefaultOptions(): QuestionOption[] {
  return Array.from({ length: OPTION_COUNT }, () => ({
    id: createId(),
    text: "",
  }));
}

function createEmptyMetadata(): QuestionMetadata {
  return { exam: "", subject: "", chapter: "", topic: "" };
}

/** A blank slate for the "New question" form. */
export function createEmptyDraft(): QuestionDraft {
  return {
    questionText: "",
    options: createDefaultOptions(),
    correctOptionId: "",
    explanation: "",
    difficulty: "",
    metadata: createEmptyMetadata(),
  };
}

/**
 * Editable copy of a stored question. Returns a deep-enough copy so typing in
 * the form never mutates the stored object.
 */
export function draftFromQuestion(question: Question): QuestionDraft {
  return {
    questionText: question.questionText,
    options: question.options.map((option) => ({ ...option })),
    correctOptionId: question.correctOptionId,
    explanation: question.explanation,
    difficulty: question.difficulty,
    metadata: { ...question.metadata },
  };
}
