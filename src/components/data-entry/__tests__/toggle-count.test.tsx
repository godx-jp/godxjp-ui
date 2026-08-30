import { describe, expect, it, vi } from "vitest";
import * as React from "react";

import { renderWithUi, screen, userEvent } from "@/test/render";
import { AppProvider } from "@/app/app-provider";

import { Toggle } from "../toggle";
import { ToggleGroup, ToggleGroupItem } from "../toggle-group";

/**
 * gh#312 — the counted, pressed chip.
 *
 * Toggle now carries Button's counter-pill vocabulary (`count` / `overflowCount` / `showZero`)
 * plus `countLabel`, which folds the count's UNIT into the accessible name. These tests pin the
 * three things that are easy to get wrong and impossible to see in a screenshot: the number is
 * locale-formatted by `Intl.NumberFormat` (never `String(n)`), the count is part of the ONE
 * accessible name, and it is announced exactly once with no live region.
 *
 * `renderWithUi` mounts AppProvider with `defaultLocale="vi"`, so grouping is `1.000`.
 */
describe("Toggle — counter pill (gh#312)", () => {
  it("renders the count inside the same button, and folds it into the accessible name", () => {
    renderWithUi(<Toggle count={12}>Chưa đọc</Toggle>);
    const chip = screen.getByRole("button", { name: "Chưa đọc, 12" });
    // ONE control: the digits live inside the button[aria-pressed], not in a sibling badge.
    expect(chip).toHaveAttribute("aria-pressed", "false");
    expect(chip.querySelector('[data-slot="toggle-count"]')).toHaveTextContent("12");
    expect(screen.getAllByRole("button")).toHaveLength(1);
  });

  it("countLabel supplies the unit so the control never announces as a bare number", () => {
    renderWithUi(
      <Toggle aria-label="Thích" count={3} countLabel="lượt">
        👍
      </Toggle>,
    );
    // aria-label wins over contents, so the count must be folded INTO it or it would be lost.
    expect(screen.getByRole("button", { name: "Thích, 3 lượt" })).toBeInTheDocument();
  });

  it("appends countLabel as sr-only text when the label comes from contents", () => {
    renderWithUi(
      <Toggle count={3} countLabel="lượt">
        Thích
      </Toggle>,
    );
    expect(screen.getByRole("button", { name: "Thích, 3 lượt" })).toBeInTheDocument();
  });

  it("formats with Intl.NumberFormat on the active locale (vi grouping)", () => {
    renderWithUi(
      <Toggle count={1000} overflowCount={9999}>
        Tất cả
      </Toggle>,
    );
    expect(screen.getByRole("button", { name: "Tất cả, 1.000" })).toBeInTheDocument();
  });

  it("formats with Intl.NumberFormat on the active locale (ja grouping)", () => {
    renderWithUi(
      <AppProvider persist={false} defaultLocale="ja" fallbackLocale="en">
        <Toggle count={1000} overflowCount={9999}>
          すべて
        </Toggle>
      </AppProvider>,
    );
    expect(screen.getByRole("button", { name: "すべて, 1,000" })).toBeInTheDocument();
  });

  it("caps at overflowCount and formats the cap itself (default 99)", () => {
    const { rerender } = renderWithUi(<Toggle count={1000}>Hộp thư</Toggle>);
    expect(screen.getByRole("button", { name: "Hộp thư, 99+" })).toBeInTheDocument();

    rerender(
      <Toggle count={5000} overflowCount={1000}>
        Hộp thư
      </Toggle>,
    );
    expect(screen.getByRole("button", { name: "Hộp thư, 1.000+" })).toBeInTheDocument();
  });

  it("shows the pill at exactly overflowCount, caps only ABOVE it", () => {
    renderWithUi(<Toggle count={99}>Đã đóng</Toggle>);
    expect(screen.getByRole("button", { name: "Đã đóng, 99" })).toBeInTheDocument();
  });

  it("showZero defaults to true (matching Button) and can be turned off", () => {
    const { rerender } = renderWithUi(<Toggle count={0}>Nháp</Toggle>);
    expect(screen.getByRole("button", { name: "Nháp, 0" })).toBeInTheDocument();

    rerender(
      <Toggle count={0} showZero={false}>
        Nháp
      </Toggle>,
    );
    const chip = screen.getByRole("button", { name: "Nháp" });
    expect(chip.querySelector('[data-slot="toggle-count"]')).toBeNull();
  });

  it("omits the pill entirely when count is undefined (unchanged Toggle)", () => {
    renderWithUi(<Toggle>Ghim</Toggle>);
    const chip = screen.getByRole("button", { name: "Ghim" });
    expect(chip.querySelector('[data-slot="toggle-count"]')).toBeNull();
  });

  it("never announces the count change itself — no live region anywhere", () => {
    const { container, rerender } = renderWithUi(<Toggle count={3}>Thích</Toggle>);
    expect(container.querySelector("[aria-live]")).toBeNull();
    expect(container.querySelector("[role='status']")).toBeNull();

    // A count that ticks up as OTHER people react is not this control's status.
    rerender(<Toggle count={4}>Thích</Toggle>);
    expect(screen.getByRole("button", { name: "Thích, 4" })).toBeInTheDocument();
    expect(container.querySelector("[aria-live]")).toBeNull();
  });

  it("renders the number exactly once (visible digits are the announced digits)", () => {
    const { container } = renderWithUi(
      <Toggle count={7} countLabel="lượt">
        Thích
      </Toggle>,
    );
    const chip = screen.getByRole("button", { name: "Thích, 7 lượt" });
    expect(chip.textContent).toBe("Thích7, 7 lượt");
    expect(container.querySelectorAll('[data-slot="toggle-count"]')).toHaveLength(1);
  });

  it("pressed state stays on aria-pressed — the count does not carry it", async () => {
    const user = userEvent.setup();
    function Chip() {
      const [mine, setMine] = React.useState(false);
      return (
        <Toggle pressed={mine} onPressedChange={setMine} count={mine ? 4 : 3} countLabel="lượt">
          Thích
        </Toggle>
      );
    }
    renderWithUi(<Chip />);
    const chip = screen.getByRole("button", { name: "Thích, 3 lượt" });
    expect(chip).toHaveAttribute("data-state", "off");

    await user.click(chip);
    expect(chip).toHaveAttribute("aria-pressed", "true");
    expect(chip).toHaveAttribute("data-state", "on");
    // The name reflects the new count; "selected"/"pressed" is NOT appended to the text.
    expect(chip).toHaveAccessibleName("Thích, 4 lượt");
  });

  it("optimistic press → server rejection → revert keeps name and state consistent", async () => {
    const user = userEvent.setup();
    const reject = vi.fn();
    function Chip() {
      const [mine, setMine] = React.useState(false);
      const [count, setCount] = React.useState(3);
      return (
        <Toggle
          pressed={mine}
          count={count}
          countLabel="lượt"
          onPressedChange={(next) => {
            setMine(next);
            setCount((c) => (next ? c + 1 : c - 1));
            // server says no — revert both halves in the same commit
            reject();
            setMine(false);
            setCount(3);
          }}
        >
          Thích
        </Toggle>
      );
    }
    renderWithUi(<Chip />);
    const chip = screen.getByRole("button", { name: "Thích, 3 lượt" });
    await user.click(chip);
    expect(reject).toHaveBeenCalledTimes(1);
    expect(chip).toHaveAttribute("aria-pressed", "false");
    expect(chip).toHaveAccessibleName("Thích, 3 lượt");
  });

  it("disabled + pressed keeps both the pressed state and the count", () => {
    renderWithUi(
      <Toggle pressed disabled count={12}>
        Chưa đọc
      </Toggle>,
    );
    const chip = screen.getByRole("button", { name: "Chưa đọc, 12" });
    expect(chip).toBeDisabled();
    expect(chip).toHaveAttribute("aria-pressed", "true");
    expect(chip).toHaveAttribute("data-state", "on");
    expect(chip.querySelector('[data-slot="toggle-count"]')).toHaveTextContent("12");
  });
});

describe("ToggleGroupItem — counter pill (gh#312)", () => {
  it("takes variant/size from group context while the count stays per item", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <ToggleGroup type="multiple" size="sm" variant="outline" aria-label="Bộ lọc">
        <ToggleGroupItem value="open" count={42}>
          Đang mở
        </ToggleGroupItem>
        <ToggleGroupItem value="closed" count={118} overflowCount={999}>
          Đã đóng
        </ToggleGroupItem>
      </ToggleGroup>,
    );
    const open = screen.getByRole("button", { name: "Đang mở, 42" });
    const closed = screen.getByRole("button", { name: "Đã đóng, 118" });

    // group context reaches the item box…
    expect(open).toHaveAttribute("data-size", "sm");
    expect(open).toHaveAttribute("data-variant", "outline");
    expect(open.className).toContain("ui-toggle-sm");
    // …and the pill is inside that same one control.
    expect(open.querySelector('[data-slot="toggle-count"]')).toHaveTextContent("42");
    expect(closed.querySelector('[data-slot="toggle-count"]')).toHaveTextContent("118");

    await user.click(open);
    expect(open).toHaveAttribute("aria-pressed", "true");
    expect(closed).toHaveAttribute("aria-pressed", "false");
  });

  it("folds the count into an item's own aria-label", () => {
    renderWithUi(
      <ToggleGroup type="multiple" aria-label="Cảm xúc">
        <ToggleGroupItem value="up" aria-label="Thích" count={2} countLabel="lượt">
          👍
        </ToggleGroupItem>
      </ToggleGroup>,
    );
    expect(screen.getByRole("button", { name: "Thích, 2 lượt" })).toBeInTheDocument();
  });
});
