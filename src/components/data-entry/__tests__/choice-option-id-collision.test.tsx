/**
 * An option's id is `<group id>-<value>` (gh#337), and FormField spells its own nodes the same
 * way: `<id>-label`, `-helper`, `-feedback`, `-error`. An option whose value is one of those words
 * used to take the field's id — two elements with one id, the group's `aria-labelledby` naming the
 * radio instead of the field's label, and the field's label no longer the one `for` points at.
 * Such an option now moves to `<group id>-option-<value>`; every other value keeps its stable id.
 */
import { describe, expect, it } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { FormField } from "../form-field";
import { Radio } from "../radio";
import { Checkbox } from "../checkbox";

const SOURCES = [
  { value: "prompt", label: "Fixed prompt" },
  { value: "label", label: "Issues with a label" },
  { value: "error", label: "Errors" },
];

function duplicateIds(): string[] {
  const seen = new Map<string, number>();
  for (const el of document.querySelectorAll("[id]")) seen.set(el.id, (seen.get(el.id) ?? 0) + 1);
  return [...seen].filter(([, n]) => n > 1).map(([id]) => id);
}

describe("choice option ids never take the field's own ids", () => {
  it("radio: an option valued `label` does not collide with the field label", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <FormField id="source" label="What to work on" helper="Pick one" error="Required">
        <Radio.Group options={SOURCES} defaultValue="prompt" />
      </FormField>,
    );
    expect(duplicateIds()).toEqual([]);
    // The group is still named by the field's label, not by an option.
    expect(screen.getByRole("radiogroup", { name: "What to work on" })).toBeInTheDocument();
    expect(document.getElementById("source-label")?.tagName).not.toBe("INPUT");
    // Ordinary values keep the stable gh#337 id.
    expect(document.getElementById("source-prompt")).toHaveRole("radio");
    // The clashing ones move under `-option-`, and their labels still select them.
    expect(document.getElementById("source-option-label")).toHaveRole("radio");
    await user.click(screen.getByText("Issues with a label"));
    expect(screen.getByRole("radio", { name: "Issues with a label" })).toBeChecked();
    await user.click(screen.getByText("Errors"));
    expect(screen.getByRole("radio", { name: "Errors" })).toBeChecked();
    // Clicking the field's label selects no option.
    await user.click(screen.getByText("What to work on"));
    expect(screen.getByRole("radio", { name: "Errors" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Issues with a label" })).not.toBeChecked();
  });

  it("checkbox group: an option valued `label` or `select-all` keeps an id of its own", () => {
    renderWithUi(
      <FormField id="flags" label="Flags">
        <Checkbox.Group
          options={[...SOURCES, { value: "select-all", label: "Literally select-all" }]}
          selectAll
          value={[]}
        />
      </FormField>,
    );
    expect(duplicateIds()).toEqual([]);
    expect(document.getElementById("flags-option-label")).toHaveRole("checkbox");
    expect(document.getElementById("flags-option-select-all")).toHaveRole("checkbox");
    expect(document.getElementById("flags-prompt")).toHaveRole("checkbox");
  });
});
