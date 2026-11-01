import Link from "next/link";
import type { Question } from "../types";
import QuestionDifficultyBadge from "./QuestionDifficultyBadge";

/**
 * Summary tile for one stored question. The whole tile links to the edit
 * page, which is the only destination a question has in Milestone 1.
 */
export default function QuestionCard({ question }: { question: Question }) {
  const metadataParts = [
    question.metadata.subject,
    question.metadata.chapter,
    question.metadata.topic,
  ].filter(Boolean);

  return (
    <li>
      <Link
        href={`/questions/${question.id}/edit`}
        className="group flex h-full flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600"
      >
        <p className="line-clamp-3 text-sm leading-5 text-zinc-800 dark:text-zinc-200">
          {question.questionText}
        </p>
        <div className="mt-auto flex flex-wrap items-center gap-2">
          <QuestionDifficultyBadge difficulty={question.difficulty} />
          {metadataParts.map((part) => (
            <span key={part} className="text-xs text-zinc-500">
              {part}
            </span>
          ))}
          <span className="ml-auto text-xs font-medium text-zinc-500 opacity-0 transition group-hover:opacity-100">
            Edit →
          </span>
        </div>
      </Link>
    </li>
  );
}
