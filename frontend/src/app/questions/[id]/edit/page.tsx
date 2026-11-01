"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import QuestionForm from "@/features/questions/components/QuestionForm";
import { draftFromQuestion } from "@/features/questions/drafts";
import { questionRepository } from "@/features/questions/repository";
import type { Question, ValidatedQuestionDraft } from "@/features/questions/types";

type LoadState =
  | { status: "loading" }
  | { status: "not-found" }
  | { status: "error"; message: string }
  | { status: "ready"; question: Question };

/**
 * With cacheComponents enabled, useParams() suspends during prerendering for
 * dynamic params, so the hook usage must sit below a Suspense boundary —
 * otherwise `next build` fails.
 */
export default function EditQuestionPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <EditQuestionView />
    </Suspense>
  );
}

function LoadingState() {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-8">
      <div role="status" aria-label="Loading question" className="flex flex-col gap-4">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-64 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </div>
  );
}

function Notice({ title, body }: { title: string; body: string }) {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-8">
      <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-lg font-semibold">{title}</h1>
        <p className="mt-2 text-sm text-zinc-500">{body}</p>
        <Link
          href="/"
          className="mt-4 inline-block rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          ← Back to question bank
        </Link>
      </div>
    </div>
  );
}

function EditQuestionView() {
  const { id } = useParams<{ id: string }>();
  // The key remounts the loader whenever the URL id changes, so its state
  // starts fresh at "loading" without a synchronous setState in an effect.
  return <QuestionLoader key={id} id={id} />;
}

function QuestionLoader({ id }: { id: string }) {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    questionRepository
      .get(id)
      .then((question) => {
        if (cancelled) return;
        setState(question ? { status: "ready", question } : { status: "not-found" });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setState({
          status: "error",
          message: error instanceof Error ? error.message : "Failed to load the question.",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (state.status === "loading") return <LoadingState />;
  if (state.status === "not-found") {
    return <Notice title="Question not found" body="It may have been removed." />;
  }
  if (state.status === "error") {
    return <Notice title="Could not load the question" body={state.message} />;
  }

  return <EditForm question={state.question} />;
}

function EditForm({ question }: { question: Question }) {
  async function handleUpdate(value: ValidatedQuestionDraft) {
    await questionRepository.update(question.id, value);
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Edit question</h1>
        <Link
          href="/"
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400"
        >
          ← Back to question bank
        </Link>
      </div>
      <QuestionForm
        initialDraft={draftFromQuestion(question)}
        submitLabel="Save changes"
        onSubmit={handleUpdate}
      />
    </div>
  );
}
