// FilterBar responsive overflow (gh#216). The strategy is expressed as a data attribute so the
// CSS owns the geometry (no page-local filter geometry — an acceptance criterion of #216) and so
// the choice is assertable without a layout engine.
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "@/test/a11y";
import { renderWithUi, screen } from "@/test/render";
import { FilterBar, FilterBarGroup } from "../filter-bar";
import { Select } from "../../data-entry/select";

const OPTIONS = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
];

function bar(overflow?: "wrap" | "scroll") {
  return (
    <FilterBar overflow={overflow} onClear={() => undefined} hasActiveFilters>
      {/* `controlId` makes the visible group caption the control's real <label>, so the filter is
       * named by the text the user sees instead of being nameless (axe: select-name). */}
      <FilterBarGroup label="申請の状態（すべての区分を含む）" controlId="f-status">
        <Select id="f-status" options={OPTIONS} defaultValue="all" />
      </FilterBarGroup>
      <FilterBarGroup label="Trạng thái phê duyệt của toàn bộ phòng ban" controlId="f-approval">
        <Select id="f-approval" options={OPTIONS} defaultValue="open" />
      </FilterBarGroup>
    </FilterBar>
  );
}

describe("FilterBar overflow", () => {
  it("defaults to the wrapping strategy", () => {
    renderWithUi(bar());
    expect(screen.getByRole("toolbar")).toHaveAttribute("data-overflow", "wrap");
  });

  it("opts into the bounded single-row scroll strategy", () => {
    renderWithUi(bar("scroll"));
    expect(screen.getByRole("toolbar")).toHaveAttribute("data-overflow", "scroll");
  });

  it("keeps every group labelled and the clear action reachable in scroll mode", () => {
    renderWithUi(bar("scroll"));

    expect(
      screen.getByRole("group", { name: "申請の状態（すべての区分を含む）" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("group", { name: "Trạng thái phê duyệt của toàn bộ phòng ban" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Xóa bộ lọc/i })).toBeInTheDocument();
  });

  it("has no a11y violations in either strategy (long JA/VI labels)", async () => {
    await expectNoA11yViolations(bar("wrap"));
    await expectNoA11yViolations(bar("scroll"));
  });
});
