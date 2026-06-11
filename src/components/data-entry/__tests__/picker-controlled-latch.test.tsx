import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen } from "@/test/render";

import { DatePicker } from "../date-picker";
import { DateRangePicker } from "../date-range-picker";
import { MonthPicker } from "../month-picker";
import { MonthRangePicker } from "../month-range-picker";

/**
 * Controlled-ness LATCH (useControlledLatch): a picker mounted with
 * `value={undefined}` (an empty form) must still display a value the parent
 * passes LATER (e.g. restoring a saved search), and must show empty again when
 * the parent clears it — controlled-empty, not a fallback to stale internal
 * state. Fixing controlled-ness at mount broke exactly this flow.
 */
describe("pickers — value arriving after an undefined mount is honored", () => {
  it("DatePicker", () => {
    const onValueChange = vi.fn();
    const { rerender } = renderWithUi(
      <DatePicker value={undefined} onValueChange={onValueChange} />,
    );
    // DatePicker's input is the combobox that opens the calendar popover.
    expect(screen.getByRole("combobox")).toHaveValue("");

    rerender(<DatePicker value={new Date(2026, 3, 15)} onValueChange={onValueChange} />);
    expect(screen.getByRole("combobox")).toHaveValue("2026-04-15");

    rerender(<DatePicker value={undefined} onValueChange={onValueChange} />);
    expect(screen.getByRole("combobox")).toHaveValue("");
  });

  it("DateRangePicker", () => {
    const onValueChange = vi.fn();
    const { rerender } = renderWithUi(
      <DateRangePicker value={undefined} onValueChange={onValueChange} />,
    );
    const empty = screen.getAllByRole("textbox");
    expect(empty[0]).toHaveValue("");
    expect(empty[1]).toHaveValue("");

    rerender(
      <DateRangePicker
        value={{ from: new Date(2026, 3, 1), to: new Date(2026, 8, 30) }}
        onValueChange={onValueChange}
      />,
    );
    const filled = screen.getAllByRole("textbox");
    expect(filled[0]).toHaveValue("2026-04-01");
    expect(filled[1]).toHaveValue("2026-09-30");

    rerender(<DateRangePicker value={undefined} onValueChange={onValueChange} />);
    const cleared = screen.getAllByRole("textbox");
    expect(cleared[0]).toHaveValue("");
    expect(cleared[1]).toHaveValue("");
  });

  it("MonthPicker", () => {
    const onValueChange = vi.fn();
    const { rerender } = renderWithUi(
      <MonthPicker value={undefined} onValueChange={onValueChange} />,
    );
    expect(screen.getByRole("textbox")).toHaveValue("");

    rerender(<MonthPicker value={new Date(2026, 4, 1)} onValueChange={onValueChange} />);
    expect(screen.getByRole("textbox")).toHaveValue("2026/05");

    rerender(<MonthPicker value={undefined} onValueChange={onValueChange} />);
    expect(screen.getByRole("textbox")).toHaveValue("");
  });

  it("MonthRangePicker", () => {
    const onValueChange = vi.fn();
    const { rerender } = renderWithUi(
      <MonthRangePicker value={undefined} onValueChange={onValueChange} />,
    );
    const empty = screen.getAllByRole("textbox");
    expect(empty[0]).toHaveValue("");
    expect(empty[1]).toHaveValue("");

    rerender(
      <MonthRangePicker
        value={{ from: new Date(2026, 0, 1), to: new Date(2026, 5, 1) }}
        onValueChange={onValueChange}
      />,
    );
    const filled = screen.getAllByRole("textbox");
    expect(filled[0]).toHaveValue("2026/01");
    expect(filled[1]).toHaveValue("2026/06");

    rerender(<MonthRangePicker value={undefined} onValueChange={onValueChange} />);
    const cleared = screen.getAllByRole("textbox");
    expect(cleared[0]).toHaveValue("");
    expect(cleared[1]).toHaveValue("");
  });
});
