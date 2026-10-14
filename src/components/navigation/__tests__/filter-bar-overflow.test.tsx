// FilterBar has no `overflow` prop (33.0.0): the bar always wraps, and nothing on it selects a
// horizontally scrolling strip. The geometry is pinned in filter-bar-overflow-geometry.test.ts.
import { describe, expect, it } from "vitest";

import { renderWithUi, screen } from "@/test/render";
import { FilterBar, FilterBarGroup } from "../toolbar";
import { Select } from "../../data-entry/select";

const OPTIONS = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
];

const groups = (
  <>
    {/* `controlId` makes the visible group caption the control's real <label>, so the filter is
     * named by the text the user sees instead of being nameless (axe: select-name). */}
    <FilterBarGroup label="申請の状態（すべての区分を含む）" controlId="f-status">
      <Select id="f-status" options={OPTIONS} defaultValue="all" />
    </FilterBarGroup>
    <FilterBarGroup label="Trạng thái phê duyệt của toàn bộ phòng ban" controlId="f-approval">
      <Select id="f-approval" options={OPTIONS} defaultValue="open" />
    </FilterBarGroup>
  </>
);

describe("FilterBar overflow", () => {
  it("renders the wrapping strip with no overflow strategy attribute", () => {
    renderWithUi(
      <FilterBar onClear={() => undefined} hasActiveFilters>
        {groups}
      </FilterBar>,
    );
    expect(screen.getByRole("toolbar")).not.toHaveAttribute("data-overflow");
  });

  it("rejects `overflow` at compile time and ignores it at runtime", () => {
    renderWithUi(
      // @ts-expect-error — `overflow` was removed: a filter bar wraps, it never scrolls sideways.
      <FilterBar overflow="scroll" onClear={() => undefined} hasActiveFilters>
        {groups}
      </FilterBar>,
    );
    expect(screen.getByRole("toolbar")).not.toHaveAttribute("data-overflow");
  });

  it("keeps every group labelled and the clear action reachable", () => {
    renderWithUi(
      <FilterBar onClear={() => undefined} hasActiveFilters>
        {groups}
      </FilterBar>,
    );

    expect(
      screen.getByRole("group", { name: "申請の状態（すべての区分を含む）" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("group", { name: "Trạng thái phê duyệt của toàn bộ phòng ban" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Xóa bộ lọc/i })).toBeInTheDocument();
  });
});
