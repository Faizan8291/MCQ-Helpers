import {
  DIFFICULTIES,
  OPTION_COUNT,
  type QuestionDraft,
  type QuestionMetadata,
  type ValidatedQuestionDraft,
} from "./types";

/** Hard limits, kept in one place so UI hints and tests stay in sync. */
export const LIMITS = {
  questionText: 1000,
  optionText: 500,
  explanation: 2000,
  metadata: 100,
} as const;

export type ValidationField =
  | "questionText"
  | "options"
  | "correctOptionId"
  | "difficulty"
  | "explanation"
  | keyof QuestionMetadata;

export type FieldErrors = Partial<Record<ValidationField, string>>;

export type ValidationResult =
  | { valid: true; value: ValidatedQuestionDraft }
  | { valid: false; errors: FieldErrors };

const METADATA_LABELS: Record<keyof QuestionMetadata, string> = {
  exam: "Exam",
  subject: "Subject",
  chapter: "Chapter",
  topic: "Topic",
};

function optionLabel(index: number): string {
  return `Option ${String.fromCharCode(65 + index)}`;
}

/** Collapses whitespace and lowercases so "Newton " equals "newton". */
function normalizeForComparison(text: string): string {
  return text.trim().replace(/\s+/g, " ").toLowerCase();
}

/**
 * Validates and normalizes a question draft. Pure: no React, no I/O — the UI,
 * the unit tests, and (later) the AI-draft review flow all run the exact same
 * rules. A `valid: true` result guarantees exactly one correct option among
 * four distinct, non-empty, in-limit options.
 */
export function validateQuestionDraft(draft: QuestionDraft): ValidationResult {
  const errors: FieldErrors = {};

  const questionText = draft.questionText.trim();
  if (questionText === "") {
    errors.questionText = "Question text is required.";
  } else if (questionText.length > LIMITS.questionText) {
    errors.questionText = `Question text must be ${LIMITS.questionText} characters or fewer.`;
  }

  if (draft.options.length !== OPTION_COUNT) {
    errors.options = `Exactly ${OPTION_COUNT} options are required.`;
  } else {
    const seen = new Map<string, string>(); // normalized text -> label of first use
    draft.options.forEach((option, index) => {
      if (errors.options) return; // keep the first option error only
      const label = optionLabel(index);
      const text = option.text.trim();
      if (text === "") {
        errors.options = `${label} cannot be empty.`;
        return;
      }
      if (text.length > LIMITS.optionText) {
        errors.options = `${label} must be ${LIMITS.optionText} characters or fewer.`;
        return;
      }
      const key = normalizeForComparison(text);
      const duplicateOf = seen.get(key);
      if (duplicateOf) {
        errors.options = `${label} duplicates ${duplicateOf}. Options must be different.`;
      } else {
        seen.set(key, label);
      }
    });
  }

  if (draft.correctOptionId === "") {
    errors.correctOptionId = "Select the correct answer.";
  } else if (!draft.options.some((option) => option.id === draft.correctOptionId)) {
    errors.correctOptionId = "The selected correct answer does not match any option.";
  }

  const difficulty = DIFFICULTIES.find((level) => level === draft.difficulty);
  if (!difficulty) {
    errors.difficulty = "Choose a difficulty.";
  }

  const explanation = draft.explanation.trim();
  if (explanation.length > LIMITS.explanation) {
    errors.explanation = `Explanation must be ${LIMITS.explanation} characters or fewer.`;
  }

  const metadata = { ...draft.metadata } as QuestionMetadata;
  (Object.keys(METADATA_LABELS) as (keyof QuestionMetadata)[]).forEach((key) => {
    const value = metadata[key].trim();
    if (value.length > LIMITS.metadata) {
      errors[key] = `${METADATA_LABELS[key]} must be ${LIMITS.metadata} characters or fewer.`;
    }
    metadata[key] = value;
  });

  // The `|| !difficulty` branch both guards the return below and narrows the
  // type for TypeScript: after this point `difficulty` is definitely a valid
  // member of DIFFICULTIES.
  if (Object.keys(errors).length > 0 || !difficulty) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    value: {
      questionText,
      options: draft.options.map((option) => ({ id: option.id, text: option.text.trim() })),
      correctOptionId: draft.correctOptionId,
      explanation,
      difficulty,
      metadata,
    },
  };
}
