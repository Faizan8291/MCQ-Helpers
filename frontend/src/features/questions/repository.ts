import { mockQuestions } from "./mockData";
import { createId } from "./ids";
import type { Question, ValidatedQuestionDraft } from "./types";

/**
 * The persistence seam of the whole app.
 *
 * Components only ever talk to this interface. Milestone 1 runs it in memory;
 * Milestone 2 will add an HttpQuestionRepository with the same methods that
 * calls the Spring Boot API — no component changes required.
 *
 * Every method is async on purpose: swapping implementations later must not
 * change any call site.
 */
export interface QuestionRepository {
  /** All questions, newest first. */
  list(): Promise<Question[]>;
  /** null when the id does not exist. */
  get(id: string): Promise<Question | null>;
  create(value: ValidatedQuestionDraft): Promise<Question>;
  /** Rejects when the id does not exist. */
  update(id: string, value: ValidatedQuestionDraft): Promise<Question>;
  /** Rejects when the id does not exist. */
  remove(id: string): Promise<void>;
}

/**
 * Small artificial latency so loading states are genuinely observable in the
 * prototype. Tests construct the repository with 0 ms instead.
 */
const DEFAULT_DELAY_MS = 200;

function wait(ms: number): Promise<void> {
  return ms > 0 ? new Promise((resolve) => setTimeout(resolve, ms)) : Promise.resolve();
}

function byUpdatedAtDescending(a: Question, b: Question): number {
  return b.updatedAt.localeCompare(a.updatedAt);
}

export class InMemoryQuestionRepository implements QuestionRepository {
  private readonly store = new Map<string, Question>();
  private readonly delayMs: number;

  constructor(seed: Question[] = mockQuestions, delayMs: number = DEFAULT_DELAY_MS) {
    // Clone the seed so callers can never mutate our internal state through
    // the shared mockData objects (Vite HMR would otherwise leak edits).
    for (const question of seed) {
      this.store.set(question.id, structuredClone(question));
    }
    this.delayMs = delayMs;
  }

  async list(): Promise<Question[]> {
    await wait(this.delayMs);
    return [...this.store.values()]
      .map((question) => structuredClone(question))
      .sort(byUpdatedAtDescending);
  }

  async get(id: string): Promise<Question | null> {
    await wait(this.delayMs);
    const question = this.store.get(id);
    return question ? structuredClone(question) : null;
  }

  async create(value: ValidatedQuestionDraft): Promise<Question> {
    await wait(this.delayMs);
    const now = new Date().toISOString();
    const question: Question = {
      ...value,
      options: value.options.map((option) => ({ ...option })),
      id: createId(),
      sourceType: "MANUAL",
      createdAt: now,
      updatedAt: now,
    };
    this.store.set(question.id, question);
    return structuredClone(question);
  }

  async update(id: string, value: ValidatedQuestionDraft): Promise<Question> {
    await wait(this.delayMs);
    const existing = this.store.get(id);
    if (!existing) {
      throw new Error(`Question ${id} not found.`);
    }
    const updated: Question = {
      ...existing,
      ...value,
      options: value.options.map((option) => ({ ...option })),
      updatedAt: new Date().toISOString(),
    };
    this.store.set(id, updated);
    return structuredClone(updated);
  }

  async remove(id: string): Promise<void> {
    await wait(this.delayMs);
    if (!this.store.delete(id)) {
      throw new Error(`Question ${id} not found.`);
    }
  }
}

/**
 * The instance the app uses. Module-level so data survives client-side
 * navigation between pages. Known mock limitation: a full page reload
 * re-creates the store from seed data — real persistence arrives in M2.
 */
export const questionRepository: QuestionRepository = new InMemoryQuestionRepository();
