import { describe, expect, it } from "vitest";
import { createEmptyDraft } from "./drafts";
import type { Difficulty, QuestionDraft } from "./types";
import { LIMITS, validateQuestionDraft } from "./validation";

/** A minimal draft that passes every rule; individual tests then break one rule. */
function validDraft(): QuestionDraft {
  const draft = createEmptyDraft();
  draft.questionText = "What is the SI unit of force?";
  draft.options = draft.options.map((option, index) => ({
    ...option,
    text: ["Joule", "Newton", "Watt", "Pascal"][index] as string,
  }));
  draft.correctOptionId = draft.options[1]!.id;
  draft.difficulty = "EASY";
  return draft;
}

function errorsOf(draft: QuestionDraft) {
  const result = validateQuestionDraft(draft);
  expect(result.valid).toBe(false);
  if (result.valid) throw new Error("unreachable");
  return result.errors;
}

describe("validateQuestionDraft", () => {
  it("accepts a fully valid draft and trims its text", () => {
    const draft = validDraft();
    draft.questionText = `  ${draft.questionText}  `;

    const result = validateQuestionDraft(draft);

    expect(result.valid).toBe(true);
    if (!result.valid) throw new Error("expected valid");
    expect(result.value.questionText).toBe("What is the SI unit of force?");
    expect(result.value.difficulty).toBe("EASY");
    expect(result.value.correctOptionId).toBe(draft.options[1]!.id);
  });

  it("rejects an empty draft with errors for all four core fields", () => {
    const errors = errorsOf(createEmptyDraft());

    expect(errors.questionText).toBe("Question text is required.");
    expect(errors.options).toBe("Option A cannot be empty.");
    expect(errors.correctOptionId).toBe("Select the correct answer.");
    expect(errors.difficulty).toBe("Choose a difficulty.");
  });

  it("rejects question text above the limit", () => {
    const draft = validDraft();
    draft.questionText = "x".repeat(LIMITS.questionText + 1);

    expect(errorsOf(draft).questionText).toContain(`${LIMITS.questionText} characters or fewer`);
  });

  it("rejects an empty option and names it", () => {
    const draft = validDraft();
    draft.options[2]!.text = "   ";

    expect(errorsOf(draft).options).toBe("Option C cannot be empty.");
  });

  it("rejects duplicate options regardless of case and spacing", () => {
    const draft = validDraft();
    draft.options[3]!.text = "  newton  ";

    expect(errorsOf(draft).options).toContain("duplicates");
  });

  it("rejects an option above the limit", () => {
    const draft = validDraft();
    draft.options[0]!.text = "x".repeat(LIMITS.optionText + 1);

    expect(errorsOf(draft).options).toContain(`Option A must be ${LIMITS.optionText} characters`);
  });

  it("requires a correct answer to be selected", () => {
    const draft = validDraft();
    draft.correctOptionId = "";

    expect(errorsOf(draft).correctOptionId).toBe("Select the correct answer.");
  });

  it("rejects a correct answer id that matches no option", () => {
    const draft = validDraft();
    draft.correctOptionId = "does-not-exist";

    expect(errorsOf(draft).correctOptionId).toBe(
      "The selected correct answer does not match any option.",
    );
  });

  it("rejects an unknown difficulty value", () => {
    const draft = validDraft();
    draft.difficulty = "JUNIOR" as Difficulty;

    expect(errorsOf(draft).difficulty).toBe("Choose a difficulty.");
  });

  it("allows the explanation to stay empty but enforces its limit", () => {
    const draft = validDraft();
    draft.explanation = "";

    expect(validateQuestionDraft(draft).valid).toBe(true);

    draft.explanation = "x".repeat(LIMITS.explanation + 1);
    expect(errorsOf(draft).explanation).toContain(`${LIMITS.explanation} characters`);
  });

  it("treats metadata as optional but limits its length", () => {
    const draft = validDraft();

    expect(validateQuestionDraft(draft).valid).toBe(true);

    draft.metadata.exam = "x".repeat(LIMITS.metadata + 1);
    expect(errorsOf(draft).exam).toBe(`Exam must be ${LIMITS.metadata} characters or fewer.`);
  });
});
