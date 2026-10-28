import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent, within } from "@/test/render";
import { DatePicker } from "../date-picker";
import type { DateRange } from "react-day-picker";
const initial = { from: new Date(2026, 9, 1), to: new Date(2026, 9, 24) };
const day = (n: number) =>
  within(screen.getAllByRole("grid")[0])
    .getAllByRole("button")
    .find((b) => b.textContent === String(n))!;
describe("controlled range draft (gh#1476)", () => {
  it("commits once after both clicks even when the consumer ignores partial ranges", async () => {
    const change = vi.fn();
    function Consumer() {
      const [value, setValue] = React.useState<DateRange | undefined>(initial);
      return (
        <DatePicker
          range
          value={value}
          defaultPickerValue={new Date(2026, 8, 1)}
          onValueChange={(r) => {
            change(r);
            if (r?.from && r.to) setValue(r);
          }}
        />
      );
    }
    renderWithUi(<Consumer />);
    const user = userEvent.setup();
    await user.click(screen.getAllByRole("textbox")[0]);
    await user.click(day(1));
    expect(change).not.toHaveBeenCalled();
    await user.click(day(30));
    expect(change).toHaveBeenCalledExactlyOnceWith({
      from: new Date(2026, 8, 1),
      to: new Date(2026, 8, 30),
    });
  });
  it("discards a half range on Escape and reopens on the committed range", async () => {
    const change = vi.fn();
    const user = userEvent.setup();
    renderWithUi(<DatePicker range value={initial} onValueChange={change} />);
    await user.click(screen.getAllByRole("textbox")[0]);
    await user.click(day(5));
    await user.keyboard("{Escape}");
    expect(change).not.toHaveBeenCalled();
    expect(screen.getAllByRole("textbox")[0]).toHaveValue("2026-10-01");
    await user.click(screen.getAllByRole("textbox")[0]);
    await user.click(day(7));
    await user.click(day(9));
    expect(change).toHaveBeenCalledExactlyOnceWith({
      from: new Date(2026, 9, 7),
      to: new Date(2026, 9, 9),
    });
  });
});
