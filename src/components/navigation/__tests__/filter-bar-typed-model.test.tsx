import { describe, expect, it, vi } from "vitest";
import * as React from "react";
import { renderWithUi, screen, userEvent, waitFor } from "@/test/render";

import { FilterBar, FilterBarGroup, Toolbar } from "../filter-bar";
import type { FilterBarChipProp, FilterBarProps } from "../filter-bar";
import { SearchInput } from "../../data-entry/search-input";
import { expectNoA11yViolations } from "@/test/a11y";

/**
 * FilterBar typed model (gh#258) — public type + runtime contract.
 *
 * The model props (search/filters/chips/onChipRemove/actions/resultCount/loading/disabled/error)
 * switch the bar to the canonical model layout; without any of them the legacy
 * children-composition markup renders unchanged. Everything is consumer data — the bar renders
 * state, it never owns it. Locale under renderWithUi is vi (fallback en).
 */

const STATUS_OPTIONS = [
  { value: "active", label: "有効" },
  { value: "invited", label: "招待中" },
];

const CHIPS: FilterBarChipProp[] = [
  { value: "q", label: "検索: 田中" },
  { value: "status", label: "状態: 有効" },
];

function modelBar(overrides: Partial<FilterBarProps> = {}) {
  return (
    <FilterBar
      search={{ defaultValue: "田中", ariaLabel: "メンバーを検索" }}
      filters={[
        {
          value: "status",
          label: "ステータス",
          options: STATUS_OPTIONS,
          defaultSelected: "active",
        },
      ]}
      chips={CHIPS}
      onChipRemove={() => {}}
      onClear={() => {}}
      hasActiveFilters
      resultCount={2}
      actions={<button type="button">メンバーを追加</button>}
      {...overrides}
    />
  );
}

describe("FilterBar typed model — slots and canonical order", () => {
  it("renders search → filter → children → reset → actions → chips in DOM order", () => {
    renderWithUi(
      modelBar({
        children: <input aria-label="custom-extra" />,
      }),
    );

    const search = screen.getByRole("searchbox", { name: "メンバーを検索" });
    const filter = screen.getByRole("combobox", { name: "ステータス" });
    const custom = screen.getByRole("textbox", { name: "custom-extra" });
    const reset = screen.getByRole("button", { name: /xóa bộ lọc/i });
    const action = screen.getByRole("button", { name: "メンバーを追加" });
    const chipRemove = screen.getByRole("button", { name: "Bỏ bộ lọc: 検索: 田中" });

    const inOrder = [search, filter, custom, reset, action, chipRemove];
    for (let i = 0; i < inOrder.length - 1; i += 1) {
      expect(
        // eslint-disable-next-line no-bitwise
        inOrder[i].compareDocumentPosition(inOrder[i + 1]) & Node.DOCUMENT_POSITION_FOLLOWING,
        `expected slot ${i} to precede slot ${i + 1}`,
      ).toBeTruthy();
    }

    // The strip is still one role="toolbar" region with its localized name.
    expect(screen.getByRole("toolbar", { name: "Bộ lọc" })).toBeInTheDocument();
    // The chips row is a labelled group.
    expect(screen.getByRole("group", { name: "Bộ lọc đang áp dụng" })).toBeInTheDocument();
  });

  it("keyboard (tab) order follows the canonical slot order", async () => {
    const user = userEvent.setup();
    renderWithUi(modelBar());

    await user.tab();
    expect(screen.getByRole("searchbox", { name: "メンバーを検索" })).toHaveFocus();
    await user.tab(); // SearchInput's own clear affordance is not in the tab order when empty…
    // …the next tabbable control must be the filter Select trigger.
    const afterSearch = document.activeElement;
    const filter = screen.getByRole("combobox", { name: "ステータス" });
    if (afterSearch !== filter) {
      // A non-empty search renders its clear button between the two — skip it explicitly.
      await user.tab();
    }
    expect(filter).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: /xóa bộ lọc/i })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "メンバーを追加" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Bỏ bộ lọc: 検索: 田中" })).toHaveFocus();
  });
});

describe("FilterBar typed model — search + filters are consumer-controlled", () => {
  it("search slot fires onValueChange per keystroke with the controlled value shown", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <FilterBar
        search={{ value: "", onValueChange, ariaLabel: "メンバーを検索" }}
        resultCount={0}
      />,
    );
    await user.type(screen.getByRole("searchbox", { name: "メンバーを検索" }), "a");
    expect(onValueChange).toHaveBeenCalledWith("a");
  });

  it("typed filter renders its visible label as the control's real label and reports selection", async () => {
    const user = userEvent.setup();
    const onSelectedChange = vi.fn();
    renderWithUi(
      modelBar({
        filters: [
          { value: "status", label: "ステータス", options: STATUS_OPTIONS, onSelectedChange },
        ],
      }),
    );

    // The visible caption labels BOTH the group wrapper and (via htmlFor) the control itself.
    const trigger = screen.getByRole("combobox", { name: "ステータス" });
    expect(screen.getByRole("group", { name: "ステータス" })).toContainElement(trigger);
    await user.click(trigger);
    await user.click(await screen.findByRole("option", { name: "招待中" }));
    await waitFor(() => expect(onSelectedChange).toHaveBeenCalledWith("invited"));
  });
});

describe("FilterBar typed model — chip lifecycle (add / remove / clear)", () => {
  it("chips are pure data: adding to the array adds a chip, remove fires onChipRemove(value)", async () => {
    const user = userEvent.setup();
    const onChipRemove = vi.fn();
    const { rerender } = renderWithUi(modelBar({ chips: [CHIPS[0]], onChipRemove }));

    const chipsRow = screen.getByRole("group", { name: "Bộ lọc đang áp dụng" });
    expect(chipsRow).toHaveTextContent("検索: 田中");
    expect(chipsRow).not.toHaveTextContent("状態: 有効");

    // ADD — the consumer includes a second chip.
    rerender(modelBar({ chips: CHIPS, onChipRemove }));
    expect(screen.getByRole("group", { name: "Bộ lọc đang áp dụng" })).toHaveTextContent(
      "状態: 有効",
    );

    // REMOVE — each chip's × button reports the chip's stable value.
    await user.click(screen.getByRole("button", { name: "Bỏ bộ lọc: 状態: 有効" }));
    expect(onChipRemove).toHaveBeenCalledExactlyOnceWith("status");

    // The consumer drops the chip from its data → the chip leaves the DOM.
    rerender(modelBar({ chips: [CHIPS[0]], onChipRemove }));
    expect(screen.queryByRole("button", { name: "Bỏ bộ lọc: 状態: 有効" })).not.toBeInTheDocument();

    // An EMPTY chips array renders no chips row at all.
    rerender(modelBar({ chips: [], onChipRemove }));
    expect(screen.queryByRole("group", { name: "Bộ lọc đang áp dụng" })).not.toBeInTheDocument();
  });

  it("clear-all is the bar's reset: onClear fires, and it hides with hasActiveFilters=false", async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    const { rerender } = renderWithUi(modelBar({ onClear }));
    await user.click(screen.getByRole("button", { name: /xóa bộ lọc/i }));
    expect(onClear).toHaveBeenCalledOnce();

    rerender(modelBar({ onClear, hasActiveFilters: false }));
    expect(screen.queryByRole("button", { name: /xóa bộ lọc/i })).not.toBeInTheDocument();
  });
});

describe("FilterBar typed model — result count, error, loading, disabled", () => {
  it("resultCount renders a localized pluralized role='status' line (0 = visible empty state)", () => {
    const { rerender } = renderWithUi(modelBar({ resultCount: 2 }));
    expect(screen.getByRole("status")).toHaveTextContent("2 kết quả");

    rerender(modelBar({ resultCount: 0 }));
    expect(screen.getByRole("status")).toHaveTextContent("0 kết quả");
  });

  it("error replaces the count with a role='alert' line", () => {
    renderWithUi(modelBar({ error: "Không tải được kết quả." }));
    expect(screen.getByRole("alert")).toHaveTextContent("Không tải được kết quả.");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("loading marks the strip aria-busy and the root data-loading", () => {
    const { container } = renderWithUi(modelBar({ loading: true }));
    expect(screen.getByRole("toolbar", { name: "Bộ lọc" })).toHaveAttribute("aria-busy", "true");
    expect(container.querySelector(".ui-filter-bar")).toHaveAttribute("data-loading", "true");
  });

  it("disabled reaches every model-rendered control", () => {
    renderWithUi(modelBar({ disabled: true }));
    expect(screen.getByRole("searchbox", { name: "メンバーを検索" })).toBeDisabled();
    expect(screen.getByRole("combobox", { name: "ステータス" })).toBeDisabled();
    expect(screen.getByRole("button", { name: /xóa bộ lọc/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Bỏ bộ lọc: 検索: 田中" })).toBeDisabled();
  });
});

describe("FilterBar — legacy children composition is unchanged (backward compatible)", () => {
  it("without any model prop the root IS the role='toolbar' element (no model wrapper)", async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    const { container } = renderWithUi(
      <Toolbar onClear={onClear} hasActiveFilters>
        <SearchInput ariaLabel="メンバーを検索" defaultValue="田中" />
        <FilterBarGroup label="Trạng thái">
          <span>Đang hoạt động</span>
        </FilterBarGroup>
      </Toolbar>,
    );

    expect(container.querySelector(".ui-filter-bar")).toBeNull();
    const toolbar = screen.getByRole("toolbar", { name: "Bộ lọc" });
    expect(toolbar.classList.contains("ui-toolbar")).toBe(true);
    expect(toolbar.closest(".ui-filter-bar")).toBeNull();
    await user.click(screen.getByRole("button", { name: /xóa bộ lọc/i }));
    expect(onClear).toHaveBeenCalledOnce();
  });
});

describe("FilterBar typed model — accessibility", () => {
  it("full model render has no axe violations", async () => {
    await expectNoA11yViolations(
      modelBar({
        loading: true,
        resultCount: 2,
      }),
    );
  });
});

describe("FilterBar typed model — public type contract", () => {
  it("compile-time shape is enforced (see @ts-expect-error markers)", () => {
    // Children stay OPTIONAL: a pure model usage needs no children.
    const pureModel: FilterBarProps = { resultCount: 0 };
    // Legacy composition stays valid without any model prop.
    const legacy: FilterBarProps = { children: <span /> };
    // @ts-expect-error — a chip requires its stable `value` identity.
    const badChip: FilterBarChipProp = { label: "x" };
    // @ts-expect-error — resultCount is a number, never a preformatted string.
    const badCount: FilterBarProps = { resultCount: "2 results" };
    expect([pureModel, legacy, badChip, badCount].length).toBe(4);
  });
});
