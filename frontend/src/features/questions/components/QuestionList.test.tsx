import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import QuestionList from "./QuestionList";
import { mockQuestions } from "../mockData";
import type { QuestionsState } from "../useQuestions";

describe("QuestionList", () => {
  it("renders the loading skeleton while loading", () => {
    const state: QuestionsState = { status: "loading" };

    render(<QuestionList state={state} onRetry={() => {}} />);

    expect(screen.getByRole("status", { name: "Loading questions" })).toBeInTheDocument();
  });

  it("renders the error with a working retry action", async () => {
    const onRetry = vi.fn();
    const state: QuestionsState = { status: "error", message: "Network down" };

    render(<QuestionList state={state} onRetry={onRetry} />);

    expect(screen.getByRole("alert")).toHaveTextContent("Could not load questions.");
    expect(screen.getByText("Network down")).toBeInTheDocument();

    await screen.getByRole("button", { name: "Try again" }).click();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("renders an empty state with a create link when there are no questions", () => {
    const state: QuestionsState = { status: "success", questions: [] };

    render(<QuestionList state={state} onRetry={() => {}} />);

    expect(screen.getByText("No questions yet")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Create question" })).toHaveAttribute(
      "href",
      "/questions/new",
    );
  });

  it("renders one linked card per question", () => {
    const state: QuestionsState = { status: "success", questions: mockQuestions };

    render(<QuestionList state={state} onRetry={() => {}} />);

    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(mockQuestions.length);
    expect(links[0]).toHaveAttribute("href", `/questions/${mockQuestions[0]!.id}/edit`);
    expect(screen.getByText(mockQuestions[0]!.questionText)).toBeInTheDocument();
  });
});
