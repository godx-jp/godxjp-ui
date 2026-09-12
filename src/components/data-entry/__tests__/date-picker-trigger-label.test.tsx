import { describe, expect, it } from "vitest";
import { renderWithUi, screen } from "@/test/render";

import { DatePicker } from "../date-picker";

/*
 * Three date fields on one form gave a screen reader three buttons with the identical name and
 * nothing to say which field each one opened (gh#551, WCAG 2.2 SC 2.4.6). The consumer's only
 * recourse was suppressing the finding per element in their own audit —
 * `'accessible-name-duplicate' => '[data-slot="popover-trigger"]'` — which hides every other
 * duplicate on that selector too, including the ones worth catching.
 *
 * `triggerLabel` is deliberately the same axis and the same shape as Select's `clearLabel`: the
 * package already solved "name this control after the field it serves" once.
 */

describe("DatePicker triggerLabel (gh#551)", () => {
  it("three pickers with no label still collide — the default is unchanged", () => {
    renderWithUi(
      <>
        <DatePicker />
        <DatePicker />
        <DatePicker />
      </>,
    );

    // The test locale is vi, so the default reads 「Mở lịch」 here and 「カレンダーを開く」 in the
    // consumer that filed this. Pinning the DEFAULT matters: the fix must add an axis, not silently rename every existing
    // button in every consumer that upgrades.
    expect(screen.getAllByRole("button", { name: "Mở lịch" })).toHaveLength(3);
  });

  it("each picker takes the name of the field it belongs to", () => {
    renderWithUi(
      <>
        <DatePicker triggerLabel="開始日のカレンダーを開く" />
        <DatePicker triggerLabel="終了日のカレンダーを開く" />
        <DatePicker triggerLabel="受験日のカレンダーを開く" />
      </>,
    );

    for (const name of [
      "開始日のカレンダーを開く",
      "終了日のカレンダーを開く",
      "受験日のカレンダーを開く",
    ]) {
      expect(screen.getAllByRole("button", { name })).toHaveLength(1);
    }
    expect(screen.queryByRole("button", { name: "Mở lịch" })).toBeNull();
  });

  it("applies to the range and period variants, which render the trigger down another branch", () => {
    renderWithUi(
      <>
        <DatePicker range triggerLabel="期間のカレンダーを開く" />
        <DatePicker picker="month" triggerLabel="月のグリッドを開く" />
      </>,
    );

    expect(screen.getByRole("button", { name: "期間のカレンダーを開く" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "月のグリッドを開く" })).toBeTruthy();
  });
});
