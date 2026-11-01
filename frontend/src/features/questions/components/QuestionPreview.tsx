import Badge from "@/components/ui/Badge";
import type { QuestionDraft } from "../types";
import QuestionDifficultyBadge from "./QuestionDifficultyBadge";

const OPTION_LETTERS = ["A", "B", "C", "D"];

/**
 * Live, read-only rendering of whatever the teacher has typed so far.
 * Takes the raw draft (not a validated question) so it can preview partial
 * input; falls back to an empty state until there is question text.
 */
export default function QuestionPreview({ draft }: { draft: QuestionDraft }) {
  const metadataParts = [draft.metadata.subject, draft.metadata.chapter, draft.metadata.topic].filter(
    Boolean,
  );

  return (
    <section
      aria-label="Question preview"
      className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Preview</h2>
        <Badge tone="neutral">MANUAL</Badge>
      </div>

      {draft.questionText.trim() === "" ? (
        <p className="rounded-lg border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-700">
          Your preview will appear here as you type the question.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-base font-medium leading-6 text-zinc-900 dark:text-zinc-100">
            {draft.questionText}
          </p>

          <ul className="flex flex-col gap-2">
            {draft.options.map((option, index) => {
              const letter = OPTION_LETTERS[index] ?? String(index + 1);
              const isCorrect = option.id === draft.correctOptionId;
              return (
                <li
                  key={option.id}
                  className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-sm ${
                    isCorrect
                      ? "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                      : "border-zinc-200 text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  <span className="font-semibold">{letter}.</span>
                  <span className="flex-1">{option.text || <span className="text-zinc-400">—</span>}</span>
                  {isCorrect && <Badge tone="success">Correct</Badge>}
                </li>
              );
            })}
          </ul>

          <div className="flex flex-wrap items-center gap-2">
            {draft.difficulty ? (
              <QuestionDifficultyBadge difficulty={draft.difficulty} />
            ) : (
              <Badge tone="neutral">Difficulty not set</Badge>
            )}
            {metadataParts.map((part) => (
              <span key={part} className="text-xs text-zinc-500">
                {part}
              </span>
            ))}
          </div>

          {draft.explanation.trim() !== "" && (
            <div className="rounded-lg bg-zinc-50 p-3 text-sm text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              <span className="font-medium text-zinc-700 dark:text-zinc-200">Explanation: </span>
              {draft.explanation}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
