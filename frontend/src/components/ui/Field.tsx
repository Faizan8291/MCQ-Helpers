import type { ReactNode } from "react";

/** Shared input styling so every control in the app looks and behaves alike. */
export const inputClassName =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:ring-zinc-800";

interface FieldProps {
  label: string;
  /** id of the control this label belongs to. */
  htmlFor: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}

/**
 * Label + control + hint/error. The error renders with role="alert" so screen
 * readers announce validation failures the moment they appear.
 */
export default function Field({ label, htmlFor, error, hint, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-zinc-500">{hint}</p>}
      {error && (
        <p role="alert" className="text-xs font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
