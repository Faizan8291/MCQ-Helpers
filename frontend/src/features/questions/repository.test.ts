import { describe, expect, it } from "vitest";
import { createEmptyDraft } from "./drafts";
import { InMemoryQuestionRepository } from "./repository";
import type { ValidatedQuestionDraft } from "./types";
import { validateQuestionDraft } from "./validation";

function buildValidValue(overrides: Partial<ValidatedQuestionDraft> = {}): ValidatedQuestionDraft {
  const draft = createEmptyDraft();
  draft.questionText = "What is 2 + 2?";
  draft.options = draft.options.map((option, index) => ({
    ...option,
    text: ["2", "3", "4", "5"][index] as string,
  }));
  draft.correctOptionId = draft.options[0]!.id;
  draft.difficulty = "MEDIUM";
  const result = validateQuestionDraft(draft);
  if (!result.valid) throw new Error("test fixture must be valid");
  return { ...result.value, ...overrides };
}

/** delayMs 0 keeps tests fast while preserving async semantics. */
function freshRepository() {
  return new InMemoryQuestionRepository(undefined, 0);
}

describe("InMemoryQuestionRepository", () => {
  it("lists the seeded questions", async () => {
    const questions = await freshRepository().list();

    expect(questions).toHaveLength(4);
    expect(questions.every((question) => question.sourceType === "MANUAL")).toBe(true);
  });

  it("creates a question with id, MANUAL source and timestamps", async () => {
    const repo = freshRepository();

    const created = await repo.create(buildValidValue());

    expect(created.id).toBeTruthy();
    expect(created.sourceType).toBe("MANUAL");
    expect(created.createdAt).toBe(created.updatedAt);
    expect(await repo.get(created.id)).toEqual(created);
  });

  it("returns null when getting an unknown id", async () => {
    expect(await freshRepository().get("missing")).toBeNull();
  });

  it("updates a question and keeps its id and creation time", async () => {
    const repo = freshRepository();
    const created = await repo.create(buildValidValue());

    const updated = await repo.update(
      created.id,
      buildValidValue({ questionText: "What is 3 + 3?" }),
    );

    expect(updated.id).toBe(created.id);
    expect(updated.createdAt).toBe(created.createdAt);
    expect(updated.questionText).toBe("What is 3 + 3?");
    expect((await repo.get(created.id))?.questionText).toBe("What is 3 + 3?");
  });

  it("rejects updates and removals of unknown ids", async () => {
    const repo = freshRepository();

    await expect(repo.update("missing", buildValidValue())).rejects.toThrow("not found");
    await expect(repo.remove("missing")).rejects.toThrow("not found");
  });

  it("removes a question", async () => {
    const repo = freshRepository();
    const created = await repo.create(buildValidValue());

    await repo.remove(created.id);

    expect(await repo.get(created.id)).toBeNull();
  });

  it("never hands out references to its internal state", async () => {
    const repo = freshRepository();
    const created = await repo.create(buildValidValue());

    const fetched = await repo.get(created.id);
    if (!fetched) throw new Error("expected question");
    fetched.questionText = "mutated by caller";

    expect((await repo.get(created.id))?.questionText).toBe("What is 2 + 2?");
  });
});
