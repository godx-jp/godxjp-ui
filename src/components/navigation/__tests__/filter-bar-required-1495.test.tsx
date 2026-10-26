import { describe, expect, it } from "vitest";
import { renderWithUi, screen } from "@/test/render";

import { FilterBar } from "../toolbar";

/**
 * gh#1495 — every typed FilterBar filter rendered a ✕, so a SCOPE filter that may never be empty
 * (the branch, the month) offered a clear that did nothing useful, and consumers rebuilt the
 * filter by hand on the bar's internal class. `required` drops the ✕ and marks the control
 * aria-required; `allowClear={false}` drops the ✕ alone.
 */
const OPTIONS = [
  { value: "tokyo", label: "東京店" },
  { value: "osaka", label: "大阪店" },
];

const clearButtons = (container: HTMLElement) => [
  ...container.querySelectorAll(".ui-control-affix-action"),
];

describe("FilterBar — required and non-clearable filters (gh#1495)", () => {
  it("a required filter with a value renders no ✕ and is aria-required", () => {
    const { container } = renderWithUi(
      <FilterBar
        filters={[
          { value: "branch", label: "Branch", options: OPTIONS, selected: "tokyo", required: true },
        ]}
      />,
    );
    expect(clearButtons(container)).toHaveLength(0);
    expect(screen.getByRole("combobox", { name: "Branch" })).toHaveAttribute(
      "aria-required",
      "true",
    );
  });

  it("allowClear={false} drops the ✕ without marking the filter required", () => {
    const { container } = renderWithUi(
      <FilterBar
        filters={[
          {
            value: "branch",
            label: "Branch",
            options: OPTIONS,
            selected: "tokyo",
            allowClear: false,
          },
        ]}
      />,
    );
    expect(clearButtons(container)).toHaveLength(0);
    expect(screen.getByRole("combobox", { name: "Branch" })).not.toHaveAttribute("aria-required");
  });

  it("an ordinary filter keeps its ✕ beside a required one (negative case)", () => {
    const { container } = renderWithUi(
      <FilterBar
        filters={[
          { value: "branch", label: "Branch", options: OPTIONS, selected: "tokyo", required: true },
          { value: "status", label: "Status", options: OPTIONS, selected: "osaka" },
        ]}
      />,
    );
    const clears = clearButtons(container);
    expect(clears).toHaveLength(1);
    expect(clears[0]!.getAttribute("aria-label")).toContain("Status");
    expect(screen.getByRole("combobox", { name: "Status" })).not.toHaveAttribute("aria-required");
  });
});
