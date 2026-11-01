import { useState, type FormEvent } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Field, { inputClassName } from "@/components/ui/Field";
import { createEmptyDraft } from "../drafts";
import { DIFFICULTIES, type QuestionDraft, type ValidatedQuestionDraft } from "../types";
import {
  validateQuestionDraft,
  type FieldErrors,
  type ValidationField,
} from "../validation";
import OptionEditor from "./OptionEditor";
import QuestionPreview from "./QuestionPreview";

interface QuestionFormProps {
  /** Prefill for edit mode; omitted for a blank new question. */
  initialDraft?: QuestionDraft;
  submitLabel: string;
  /** Receives a validated draft. Rejections are surfaced inside the form. */
  onSubmit: (value: ValidatedQuestionDraft) => void | Promise<void>;
}

/**
 * Manual question editor: question text, four options with a single correct
 * answer, difficulty, classification and explanation — with a live preview.
 *
 * Validation runs in one place (validateQuestionDraft) on submit; field
 * errors then clear as the teacher edits those fields again.
 */
export default function QuestionForm({ initialDraft, submitLabel, onSubmit }: QuestionFormProps) {
  const [draft, setDraft] = useState<QuestionDraft>(() => initialDraft ?? createEmptyDraft());
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  /** Applies a patch and clears the stale errors of every touched field. */
  function patch(changes: Partial<QuestionDraft>, touched: ValidationField[] = []) {
    setDraft((previous) => ({ ...previous, ...changes }));
    if (touched.length > 0) {
      setErrors((previous) => {
        const next = { ...previous };
        for (const field of touched) delete next[field];
        return next;
      });
    }
    setSaved(false);
    setSubmitError(null);
  }

  const handleQuestionText = (value: string) =>
    patch({ questionText: value }, ["questionText"]);
  const handleDifficulty = (value: QuestionDraft["difficulty"]) =>
    patch({ difficulty: value }, ["difficulty"]);
  const handleExplanation = (value: string) => patch({ explanation: value }, ["explanation"]);

  const handleMetadata = (key: keyof QuestionDraft["metadata"], value: string) =>
    patch({ metadata: { ...draft.metadata, [key]: value } }, [key]);

  const handleOptionText = (optionId: string, text: string) =>
    patch(
      {
        options: draft.options.map((option) =>
          option.id === optionId ? { ...option, text } : option,
        ),
      },
      ["options"],
    );

  const handleCorrectOption = (optionId: string) =>
    patch({ correctOptionId: optionId }, ["correctOptionId"]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // noValidate: the browser's native bubbles are bypassed so every rule
    // lives in validateQuestionDraft — one source of truth, fully unit-tested.
    const result = validateQuestionDraft(draft);
    if (!result.valid) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    setSubmitError(null);
    setSubmitting(true);
    try {
      await onSubmit(result.value);
      setSaved(true);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Something went wrong while saving. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
        {submitError && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
          >
            {submitError}
          </div>
        )}

        <Field label="Question" htmlFor="question-text" error={errors.questionText}>
          <textarea
            id="question-text"
            rows={4}
            value={draft.questionText}
            onChange={(event) => handleQuestionText(event.target.value)}
            placeholder="Type the question…"
            className={inputClassName}
          />
        </Field>

        <OptionEditor
          options={draft.options}
          correctOptionId={draft.correctOptionId}
          onOptionTextChange={handleOptionText}
          onCorrectOptionChange={handleCorrectOption}
          optionError={errors.options}
          correctError={errors.correctOptionId}
        />

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Difficulty</legend>
          <div className="mt-2 flex gap-2">
            {DIFFICULTIES.map((level) => (
              <label
                key={level}
                className={`cursor-pointer rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  draft.difficulty === level
                    ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                    : "border-zinc-300 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                }`}
              >
                <input
                  type="radio"
                  name="difficulty"
                  className="sr-only"
                  aria-label={level}
                  checked={draft.difficulty === level}
                  onChange={() => handleDifficulty(level)}
                />
                {level}
              </label>
            ))}
          </div>
          {errors.difficulty && (
            <p role="alert" className="text-xs font-medium text-red-600 dark:text-red-400">
              {errors.difficulty}
            </p>
          )}
        </fieldset>

        <fieldset className="flex flex-col gap-4">
          <legend className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Classification (optional)
          </legend>
          <div className="mt-2 grid gap-4 sm:grid-cols-2">
            <Field label="Exam" htmlFor="meta-exam" error={errors.exam}>
              <input
                id="meta-exam"
                type="text"
                value={draft.metadata.exam}
                onChange={(event) => handleMetadata("exam", event.target.value)}
                placeholder="e.g. SSC CGL"
                className={inputClassName}
              />
            </Field>
            <Field label="Subject" htmlFor="meta-subject" error={errors.subject}>
              <input
                id="meta-subject"
                type="text"
                value={draft.metadata.subject}
                onChange={(event) => handleMetadata("subject", event.target.value)}
                placeholder="e.g. Physics"
                className={inputClassName}
              />
            </Field>
            <Field label="Chapter" htmlFor="meta-chapter" error={errors.chapter}>
              <input
                id="meta-chapter"
                type="text"
                value={draft.metadata.chapter}
                onChange={(event) => handleMetadata("chapter", event.target.value)}
                placeholder="e.g. Units and Measurements"
                className={inputClassName}
              />
            </Field>
            <Field label="Topic" htmlFor="meta-topic" error={errors.topic}>
              <input
                id="meta-topic"
                type="text"
                value={draft.metadata.topic}
                onChange={(event) => handleMetadata("topic", event.target.value)}
                placeholder="e.g. SI Units"
                className={inputClassName}
              />
            </Field>
          </div>
        </fieldset>

        <Field
          label="Explanation (optional)"
          htmlFor="explanation"
          error={errors.explanation}
          hint="Shown alongside the answer key when you export a paper."
        >
          <textarea
            id="explanation"
            rows={3}
            value={draft.explanation}
            onChange={(event) => handleExplanation(event.target.value)}
            placeholder="Why is the chosen answer correct?"
            className={inputClassName}
          />
        </Field>

        <div className="flex items-center gap-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <Button type="submit" busy={submitting}>
            {submitting ? "Saving…" : saved ? "✓ Saved" : submitLabel}
          </Button>
          <Link
            href="/"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400"
          >
            Cancel
          </Link>
        </div>
      </form>

      <aside className="lg:sticky lg:top-6 lg:self-start">
        <QuestionPreview draft={draft} />
      </aside>
    </div>
  );
}
