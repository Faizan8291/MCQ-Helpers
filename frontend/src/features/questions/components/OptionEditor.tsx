import { inputClassName } from "@/components/ui/Field";
import type { QuestionOption } from "../types";

const OPTION_LETTERS = ["A", "B", "C", "D"];

interface OptionEditorProps {
  options: QuestionOption[];
  correctOptionId: string;
  onOptionTextChange: (optionId: string, text: string) => void;
  onCorrectOptionChange: (optionId: string) => void;
  optionError?: string;
  correctError?: string;
}

/**
 * The four-option editor.
 *
 * Design note: the correct answer is chosen with radio inputs sharing one
 * `name`, so the DOM itself enforces "exactly one correct answer" while
 * typing — the user physically cannot select two. Validation still checks the
 * same rule afterwards because it also has to guard AI-supplied data, which
 * never passes through this UI.
 */
export default function OptionEditor({
  options,
  correctOptionId,
  onOptionTextChange,
  onCorrectOptionChange,
  optionError,
  correctError,
}: OptionEditorProps) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Answer options
      </legend>
      <p className="text-xs text-zinc-500">
        Exactly four options. Select the radio button next to the correct answer.
      </p>

      <div className="flex flex-col gap-2">
        {options.map((option, index) => {
          const letter = OPTION_LETTERS[index] ?? String(index + 1);
          return (
            <div key={option.id} className="flex items-center gap-2">
              <span className="w-5 shrink-0 text-center text-sm font-semibold text-zinc-500">
                {letter}
              </span>
              <input
                type="radio"
                name="correct-option"
                aria-label={`Mark option ${letter} as correct`}
                checked={correctOptionId === option.id}
                onChange={() => onCorrectOptionChange(option.id)}
                className="h-4 w-4 shrink-0 accent-emerald-600"
              />
              <input
                type="text"
                aria-label={`Option ${letter} text`}
                value={option.text}
                onChange={(event) => onOptionTextChange(option.id, event.target.value)}
                placeholder={`Option ${letter}`}
                className={inputClassName}
              />
            </div>
          );
        })}
      </div>

      {optionError && (
        <p role="alert" className="text-xs font-medium text-red-600 dark:text-red-400">
          {optionError}
        </p>
      )}
      {correctError && (
        <p role="alert" className="text-xs font-medium text-red-600 dark:text-red-400">
          {correctError}
        </p>
      )}
    </fieldset>
  );
}
