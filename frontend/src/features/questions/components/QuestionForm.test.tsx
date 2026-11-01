import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import QuestionForm from "./QuestionForm";
import { draftFromQuestion } from "../drafts";
import { mockQuestions } from "../mockData";
import type { ValidatedQuestionDraft } from "../types";

function renderForm(onSubmit = vi.fn()) {
  const user = userEvent.setup();
  render(<QuestionForm submitLabel="Save question" onSubmit={onSubmit} />);
  return { user, onSubmit };
}

async function fillValidQuestion(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Question"), "What is the capital of India?");
  for (const letter of ["A", "B", "C", "D"]) {
    await user.type(screen.getByLabelText(`Option ${letter} text`), `Answer ${letter}`);
  }
  await user.click(screen.getByLabelText("Mark option B as correct"));
  await user.click(screen.getByLabelText("MEDIUM"));
}

describe("QuestionForm", () => {
  it("blocks submission of an empty form and explains every missing field", async () => {
    const { user, onSubmit } = renderForm();

    await user.click(screen.getByRole("button", { name: "Save question" }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(await screen.findByText("Question text is required.")).toBeInTheDocument();
    expect(screen.getByText("Option A cannot be empty.")).toBeInTheDocument();
    expect(screen.getByText("Select the correct answer.")).toBeInTheDocument();
    expect(screen.getByText("Choose a difficulty.")).toBeInTheDocument();
  });

  it("submits a validated, trimmed draft with the selected correct option", async () => {
    const { user, onSubmit } = renderForm();
    await fillValidQuestion(user);

    await user.click(screen.getByRole("button", { name: "Save question" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const value = onSubmit.mock.calls[0]![0] as ValidatedQuestionDraft;
    expect(value.questionText).toBe("What is the capital of India?");
    expect(value.difficulty).toBe("MEDIUM");
    expect(value.options).toHaveLength(4);
    expect(value.correctOptionId).toBe(value.options[1]!.id);
  });

  it("shows ✓ Saved after a successful save and reverts the label when edited again", async () => {
    const { user } = renderForm();
    await fillValidQuestion(user);
    await user.click(screen.getByRole("button", { name: "Save question" }));

    expect(await screen.findByRole("button", { name: "✓ Saved" })).toBeInTheDocument();

    await user.type(screen.getByLabelText("Question"), "!");

    expect(screen.getByRole("button", { name: "Save question" })).toBeInTheDocument();
  });

  it("shows the persistence error inside the form when onSubmit rejects", async () => {
    const failing = vi.fn().mockRejectedValue(new Error("Database is down"));
    const { user } = renderForm(failing);
    await fillValidQuestion(user);

    await user.click(screen.getByRole("button", { name: "Save question" }));

    expect(await screen.findByText("Database is down")).toBeInTheDocument();
  });

  it("prefills every field when given an initial draft", () => {
    const question = mockQuestions[0]!;
    render(
      <QuestionForm
        initialDraft={draftFromQuestion(question)}
        submitLabel="Save changes"
        onSubmit={() => {}}
      />,
    );

    expect(screen.getByLabelText("Question")).toHaveValue(question.questionText);
    expect(screen.getByLabelText("Option A text")).toHaveValue(question.options[0]!.text);
    expect(screen.getByLabelText("Mark option B as correct")).toBeChecked();
    expect(screen.getByLabelText(question.difficulty)).toBeChecked();
    expect(screen.getByLabelText("Exam")).toHaveValue(question.metadata.exam);
  });
});
