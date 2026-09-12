import { describe, expect, it } from "vitest";
import { renderWithUi, screen } from "@/test/render";

import { DatePicker } from "../date-picker";

const date = new Date(2026, 5, 15);

/**
 * Range / MonthRange trailing actions must ship the same affix hit-target class as the single-date
 * branch (gh#609). jsdom has no hit testing — `scripts/check-number-input-step-target.mjs` measures
 * elementFromPoint on the catalogue frame.
 */
describe("DatePicker range trailing affix — structure", () => {
  it("DateRangePicker clear uses ui-control-inline-affix-action", () => {
    renderWithUi(
      <DatePicker range defaultValue={{ from: date, to: date }} allowClear id="period" />,
    );
    expect(screen.getByRole("button", { name: "Xóa" })).toHaveClass("ui-control-inline-affix-action");
  });

  it("DateRangePicker calendar trigger uses ui-control-inline-affix-action when empty", () => {
    renderWithUi(<DatePicker range id="term" />);
    expect(screen.getByRole("button", { name: "Mở lịch" })).toHaveClass(
      "ui-control-inline-affix-action",
    );
  });

  it("MonthRangePicker calendar trigger uses ui-control-inline-affix-action when empty", () => {
    renderWithUi(<DatePicker range picker="month" id="term-month" />);
    expect(screen.getByRole("button", { name: "Mở chọn tháng" })).toHaveClass(
      "ui-control-inline-affix-action",
    );
  });
});
