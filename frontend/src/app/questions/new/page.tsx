"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import QuestionForm from "@/features/questions/components/QuestionForm";
import { questionRepository } from "@/features/questions/repository";
import type { ValidatedQuestionDraft } from "@/features/questions/types";

export default function NewQuestionPage() {
  const router = useRouter();

  async function handleCreate(value: ValidatedQuestionDraft) {
    // Validation happened in QuestionForm; failures here are surfaced there.
    await questionRepository.create(value);
    // Client-side navigation keeps the in-memory store alive, so the bank
    // immediately shows the new question.
    router.push("/");
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-8">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">New question</h1>
      {/*
        The form generates option ids in its initial state via
        crypto.randomUUID(), which is a dynamic API during prerendering.
        With cacheComponents enabled that requires a Suspense boundary;
        outside one, `next build` fails.
      */}
      <Suspense
        fallback={
          <div role="status" aria-label="Loading form" className="h-96 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
        }
      >
        <QuestionForm submitLabel="Save question" onSubmit={handleCreate} />
      </Suspense>
    </div>
  );
}
