import Link from "next/link";
import type { QuestionsState } from "../useQuestions";
import QuestionCard from "./QuestionCard";

interface QuestionListProps {
  state: QuestionsState;
  onRetry: () => void;
}

/**
 * Renders exactly one of the three required UI states: loading skeleton,
 * error with retry, empty state, or the list itself. Branching on a
 * discriminated union means impossible combinations ("loading AND error")
 * cannot be rendered at all.
 */
export default function QuestionList({ state, onRetry }: QuestionListProps) {
  if (state.status === "loading") {
    return (
      <div
        role="status"
        aria-label="Loading questions"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            className="h-32 animate-pulse rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900"
          />
        ))}
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div
        role="alert"
        className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950"
      >
        <p className="font-medium text-red-800 dark:text-red-300">Could not load questions.</p>
        <p className="mt-1 text-sm text-red-700 dark:text-red-400">{state.message}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500"
        >
          Try again
        </button>
      </div>
    );
  }

  if (state.questions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 p-10 text-center dark:border-zinc-700">
        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">No questions yet</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Create your first question to start building your bank.
        </p>
        <Link
          href="/questions/new"
          className="mt-4 inline-block rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900"
        >
          Create question
        </Link>
      </div>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {state.questions.map((question) => (
        <QuestionCard key={question.id} question={question} />
      ))}
    </ul>
  );
}
