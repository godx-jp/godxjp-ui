import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent, within } from "@/test/render";

import { Badge } from "../../data-display/badge";
import { RadioGroup } from "../radio";

const OPTIONS = [
  {
    label: "Organizations · 2",
    options: [
      { value: "acme", label: "Acme", description: "Owner", extra: <Badge>Last used</Badge> },
      { value: "globex", label: "Globex", description: "Member" },
    ],
  },
  { label: "Personal", options: [{ value: "me", label: "Personal workspace" }] },
];

describe('RadioGroup optionType="list"', () => {
  it("is still one radiogroup: one surface per section, section labels name the groups", () => {
    const { container } = renderWithUi(
      <RadioGroup aria-label="Context" optionType="list" options={OPTIONS} defaultValue="acme" />,
    );
    const group = screen.getByRole("radiogroup", { name: "Context" });
    expect(group).toHaveAttribute("data-option-type", "list");
    expect(group).toHaveClass("ui-radio-list");
    expect(screen.getAllByRole("radio")).toHaveLength(3);
    expect(container.querySelectorAll(".ui-radio-list-surface")).toHaveLength(2);
    const org = screen.getByRole("group", { name: "Organizations · 2" });
    expect(within(org).getAllByRole("radio")).toHaveLength(2);
    expect(screen.getByRole("radio", { name: "Acme" })).toBeChecked();
  });

  it("walks the arrow keys across sections and selects on press anywhere in the row", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <RadioGroup
        aria-label="Context"
        optionType="list"
        options={OPTIONS}
        defaultValue="globex"
        onValueChange={onValueChange}
      />,
    );
    await user.tab();
    expect(screen.getByRole("radio", { name: "Globex" })).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("radio", { name: "Personal workspace" })).toHaveFocus();
    expect(onValueChange).toHaveBeenLastCalledWith("me");
    await user.click(screen.getByText("Owner"));
    expect(onValueChange).toHaveBeenLastCalledWith("acme");
  });

  it("puts loose options in one surface of their own", () => {
    const { container } = renderWithUi(
      <RadioGroup
        aria-label="Plan"
        optionType="list"
        options={[
          { value: "a", label: "A" },
          { value: "b", label: "B" },
        ]}
      />,
    );
    expect(container.querySelectorAll(".ui-radio-list-surface")).toHaveLength(1);
  });
});
