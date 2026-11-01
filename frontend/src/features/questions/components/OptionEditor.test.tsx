import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OptionEditor from "./OptionEditor";
import { createEmptyDraft } from "../drafts";

function setup(overrides: Partial<Parameters<typeof OptionEditor>[0]> = {}) {
  const draft = createEmptyDraft();
  const onOptionTextChange = vi.fn();
  const onCorrectOptionChange = vi.fn();

  render(
    <OptionEditor
      options={draft.options}
      correctOptionId={draft.correctOptionId}
      onOptionTextChange={onOptionTextChange}
      onCorrectOptionChange={onCorrectOptionChange}
      {...overrides}
    />,
  );

  return { draft, onOptionTextChange, onCorrectOptionChange };
}

describe("OptionEditor", () => {
  it("renders exactly four labelled option inputs", () => {
    setup();

    expect(screen.getAllByRole("textbox")).toHaveLength(4);
    for (const letter of ["A", "B", "C", "D"]) {
      expect(screen.getByLabelText(`Option ${letter} text`)).toBeInTheDocument();
      expect(screen.getByLabelText(`Mark option ${letter} as correct`)).toBeInTheDocument();
    }
  });

  it("reports text edits with the id of the edited option", async () => {
    const user = userEvent.setup();
    const { draft, onOptionTextChange } = setup();

    await user.type(screen.getByLabelText("Option B text"), "Newtown");

    expect(onOptionTextChange).toHaveBeenCalledWith(draft.options[1]!.id, "N");
  });

  it("reports which option was marked as correct", async () => {
    const user = userEvent.setup();
    const { draft, onCorrectOptionChange } = setup();

    await user.click(screen.getByLabelText("Mark option D as correct"));

    expect(onCorrectOptionChange).toHaveBeenCalledWith(draft.options[3]!.id);
  });

  it("reflects the current correct option as checked", () => {
    const draft = createEmptyDraft();
    render(
      <OptionEditor
        options={draft.options}
        correctOptionId={draft.options[2]!.id}
        onOptionTextChange={() => {}}
        onCorrectOptionChange={() => {}}
      />,
    );

    expect(screen.getByLabelText("Mark option C as correct")).toBeChecked();
    expect(screen.getByLabelText("Mark option A as correct")).not.toBeChecked();
  });

  it("surfaces option and correct-answer errors", () => {
    setup({ optionError: "Option A cannot be empty.", correctError: "Select the correct answer." });

    const alerts = screen.getAllByRole("alert");
    expect(alerts.map((node) => node.textContent)).toEqual([
      "Option A cannot be empty.",
      "Select the correct answer.",
    ]);
  });
});
