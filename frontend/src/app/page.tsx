"use client";
import Link from "next/link";
import { useQuestions } from "@/features/questions/useQuestions";
import QuestionList from "@/features/questions/components/QuestionList";

export default function HomePage() {
  const { state, reload } = useQuestions();

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Question Bank
          </h1>
          <p className="text-sm text-zinc-500">
            {state.status === "success"
              ? `${state.questions.length} question${state.questions.length === 1 ? "" : "s"}`
              : "Your private collection of MCQs"}
          </p>
        </div>
        <Link
          href="/questions/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900"
        >
          New question
        </Link>
      </div>

      <QuestionList state={state} onRetry={reload} />
    </div>
  );
}
