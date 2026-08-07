/**
 * FilterBar typed search/filter/chip/action/reset/result-count model (gh#258).
 *
 * The consumer blocker: `FilterBar`/`FilterBarGroup` were public aliases of the Toolbar primitives,
 * and child composition alone defined no consistent search width, chip lifecycle, reset/action
 * ordering, result count or keyboard order — so every list page re-decided them. These tests pin
 * the contract the bar now owns, and, just as importantly, pin that a bar built the OLD way
 * (children + onClear) emits none of the new regions and is unchanged.
 */
import { describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { renderWithUi, screen, within } from "@/test/render";

import { FilterBar, FilterBarGroup } from "../filter-bar";
import { expectNoA11yViolations } from "@/test/a11y";

describe("FilterBar — backwards compatibility", () => {
  it("emits NONE of the new regions when no new prop is passed", () => {
    const { container } = renderWithUi(
      <FilterBar onClear={() => undefined} hasActiveFilters>
        <FilterBarGroup label="状態" controlId="f-status">
          <select id="f-status" aria-label="状態" />
        </FilterBarGroup>
      </FilterBar>,
    );

    expect(container.querySelector(".ui-filter-bar-search")).toBeNull();
    expect(container.querySelector(".ui-filter-bar-chips")).toBeNull();
    expect(container.querySelector(".ui-filter-bar-count")).toBeNull();
    expect(container.querySelector(".ui-filter-bar-actions")).toBeNull();
    // The pre-gh#258 behaviour is intact.
    expect(screen.getByRole("toolbar")).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "状態" })).toBeInTheDocument();
    expect(container.querySelector(".ui-toolbar-clear")).not.toBeNull();
  });
});

describe("FilterBar — search slot", () => {
  it("wraps the caller's control in the bar's own measured region", () => {
    const { container } = renderWithUi(
      <FilterBar search={<input aria-label="検索" />}>
        <FilterBarGroup label="状態">
          <select aria-label="状態" />
        </FilterBarGroup>
      </FilterBar>,
    );

    const region = container.querySelector(".ui-filter-bar-search");
    expect(region).not.toBeNull();
    expect(within(region as HTMLElement).getByLabelText("検索")).toBeInTheDocument();
  });
});

describe("FilterBar — chip lifecycle", () => {
  const chips = [
    { id: "status", label: "状態: 未払い" },
    { id: "branch", label: "支店: 東京" },
  ];

  it("renders applied chips in a labelled group", () => {
    renderWithUi(
      <FilterBar chips={chips} onChipRemove={() => undefined}>
        <FilterBarGroup label="状態">
          <select aria-label="状態" />
        </FilterBarGroup>
      </FilterBar>,
    );

    const group = screen.getByRole("group", { name: "Bộ lọc đang áp dụng" });
    expect(within(group).getByText("状態: 未払い")).toBeInTheDocument();
    expect(within(group).getByText("支店: 東京")).toBeInTheDocument();
  });

  it("names each remove control after ITS OWN filter, not a generic 'remove'", async () => {
    const user = userEvent.setup();
    const onChipRemove = vi.fn();
    renderWithUi(
      <FilterBar chips={chips} onChipRemove={onChipRemove}>
        <FilterBarGroup label="状態">
          <select aria-label="状態" />
        </FilterBarGroup>
      </FilterBar>,
    );

    // A row of buttons all called "Remove" is unusable from a screen-reader's control list.
    const remove = screen.getByRole("button", { name: "Bỏ bộ lọc 支店: 東京" });
    await user.click(remove);
    expect(onChipRemove).toHaveBeenCalledWith("branch");
  });

  it("calls BOTH the chip's own onRemove and the central onChipRemove", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    const onChipRemove = vi.fn();
    renderWithUi(
      <FilterBar
        chips={[{ id: "status", label: "状態: 未払い", onRemove }]}
        onChipRemove={onChipRemove}
      >
        <FilterBarGroup label="状態">
          <select aria-label="状態" />
        </FilterBarGroup>
      </FilterBar>,
    );

    await user.click(screen.getByRole("button", { name: /状態: 未払い/ }));
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onChipRemove).toHaveBeenCalledWith("status");
  });

  it("renders NO remove control for a chip the user may not lift", () => {
    // A locked scope must not present a disabled ✕ — that is a dead tab stop promising an action
    // the app will never perform.
    renderWithUi(
      <FilterBar chips={[{ id: "tenant", label: "テナント: Acme" }]}>
        <FilterBarGroup label="状態">
          <select aria-label="状態" />
        </FilterBarGroup>
      </FilterBar>,
    );

    expect(screen.getByText("テナント: Acme")).toBeInTheDocument();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("emits no chip row at all for an empty array — never a reserved empty strip", () => {
    const { container } = renderWithUi(
      <FilterBar chips={[]}>
        <FilterBarGroup label="状態">
          <select aria-label="状態" />
        </FilterBarGroup>
      </FilterBar>,
    );

    expect(container.querySelector(".ui-filter-bar-chips")).toBeNull();
  });
});

describe("FilterBar — result count", () => {
  it("announces the count in a polite live region", () => {
    renderWithUi(
      <FilterBar resultCount={128}>
        <FilterBarGroup label="状態">
          <select aria-label="状態" />
        </FilterBarGroup>
      </FilterBar>,
    );

    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
    // Grouped by Intl.NumberFormat for the active locale, never a bare "128".
    expect(status.textContent).toMatch(/128/);
  });

  it("renders the count for 0 — a filter that matches nothing is exactly what must be announced", () => {
    renderWithUi(
      <FilterBar resultCount={0}>
        <FilterBarGroup label="状態">
          <select aria-label="状態" />
        </FilterBarGroup>
      </FilterBar>,
    );

    expect(screen.getByRole("status").textContent).toMatch(/0/);
  });

  it("omits the region entirely when the count is unknown", () => {
    const { container } = renderWithUi(
      <FilterBar>
        <FilterBarGroup label="状態">
          <select aria-label="状態" />
        </FilterBarGroup>
      </FilterBar>,
    );

    expect(container.querySelector(".ui-filter-bar-count")).toBeNull();
  });
});

describe("FilterBar — ordering is the contract (DOM order = tab order)", () => {
  it("orders search → groups → chips → count → reset → actions", () => {
    const { container } = renderWithUi(
      <FilterBar
        search={<input aria-label="検索" />}
        chips={[{ id: "a", label: "状態: 未払い", onRemove: () => undefined }]}
        resultCount={12}
        onClear={() => undefined}
        hasActiveFilters
        actions={<button type="button">エクスポート</button>}
      >
        <FilterBarGroup label="状態" controlId="f-status">
          <select id="f-status" aria-label="状態" />
        </FilterBarGroup>
      </FilterBar>,
    );

    const bar = container.querySelector(".ui-toolbar") as HTMLElement;
    const order = Array.from(bar.children).map((child) => {
      const cls = child.className.toString();
      if (cls.includes("ui-filter-bar-search")) return "search";
      if (cls.includes("ui-toolbar-group")) return "groups";
      if (cls.includes("ui-filter-bar-chips")) return "chips";
      if (cls.includes("ui-filter-bar-count")) return "count";
      if (cls.includes("ui-toolbar-clear")) return "reset";
      if (cls.includes("ui-filter-bar-actions")) return "actions";
      return "?";
    });

    // Reset before actions, deliberately: `clear filters` must never sit at the end of the row
    // beside an unrelated primary action.
    expect(order).toEqual(["search", "groups", "chips", "count", "reset", "actions"]);
  });
});

describe("FilterBar — accessibility", () => {
  it("has no violations with the whole typed model populated", async () => {
    await expectNoA11yViolations(
      <FilterBar
        search={<input aria-label="検索" />}
        chips={[
          { id: "a", label: "状態: 未払い", onRemove: () => undefined },
          { id: "b", label: "テナント: Acme" },
        ]}
        resultCount={128}
        onClear={() => undefined}
        hasActiveFilters
        actions={<button type="button">エクスポート</button>}
      >
        <FilterBarGroup label="状態" controlId="f-status">
          <select id="f-status">
            <option>未払い</option>
          </select>
        </FilterBarGroup>
      </FilterBar>,
    );
  });
});
