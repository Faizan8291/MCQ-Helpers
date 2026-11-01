import { useCallback, useEffect, useState } from "react";
import { questionRepository, type QuestionRepository } from "./repository";
import type { Question } from "./types";

/**
 * View state for the question list: exactly one of the three UI states the
 * spec requires (loading / error / data), so components can never render an
 * ambiguous mix of them.
 */
export type QuestionsState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; questions: Question[] };

function toMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong while loading questions.";
}

/**
 * Loads questions and exposes reload(). The repository is injectable so tests
 * can pass a fast or failing implementation without mocking globals.
 */
export function useQuestions(repo: QuestionRepository = questionRepository) {
  const [state, setState] = useState<QuestionsState>({ status: "loading" });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    repo
      .list()
      .then((questions) => {
        if (!cancelled) setState({ status: "success", questions });
      })
      .catch((error: unknown) => {
        if (!cancelled) setState({ status: "error", message: toMessage(error) });
      });

    // Ignore results of superseded loads (e.g. double-clicked Retry).
    return () => {
      cancelled = true;
    };
  }, [repo, reloadKey]);

  // Resetting to "loading" happens in the click handler (an event context),
  // not synchronously inside the effect — React's rules of hooks forbid the
  // latter because it cascades renders.
  const reload = useCallback(() => {
    setState({ status: "loading" });
    setReloadKey((key) => key + 1);
  }, []);

  return { state, reload };
}
