import * as React from "react";
import { describe, expect, it, vi } from "vitest";

import { renderWithUi, screen, userEvent, waitFor } from "@/test/render";

import { DatePicker } from "../date-picker";
import { TimePicker } from "../time-picker";

/**
 * gh#390 · lát 1 — A PICKER CAN CARRY A BUSINESS RULE.
 *
 * The report that opened this was a 開始/終了 time pair with nothing stopping the end time being
 * set before the start time: the columns offered every hour, and the field accepted anything the
 * parser could read. `fromDate`/`toDate` could not express the date half of the same problem
 * either — a business calendar is rarely one contiguous range (土日, a closed accounting period, a
 * 祝日, a day already fully booked).
 *
 * THE RULE HAS TO HOLD ON BOTH ROUTES. Every one of these pickers has two ways into its value: the
 * panel, and a real typeable input. Guarding only the panel would leave the keyboard as a way
 * around the rule the mouse obeys, and the value would then fail server-side with nothing on
 * screen saying which field caused it. So each case below is asserted twice — once through the
 * panel, once through the field.
 */

describe("TimePicker disabledTime (gh#390)", () => {
  const before10 = () => ({ disabledHours: () => [7, 8, 9] });

  it("refuses a forbidden hour in the column, and says so rather than hiding it", async () => {
    const user = userEvent.setup();
    renderWithUi(<TimePicker defaultValue="11:00" disabledTime={before10} />);

    await user.click(screen.getByLabelText(/open time picker|chọn giờ/i));
    const nine = await screen.findByRole("option", { name: "09" });

    // Present and announced, not absent: a refused option is how the reader learns the rule exists.
    expect(nine).toHaveAttribute("aria-disabled", "true");
    await user.click(nine);
    expect(screen.getByRole("combobox")).toHaveValue("11:00");
  });

  it("still accepts an hour the rule allows", async () => {
    const user = userEvent.setup();
    renderWithUi(<TimePicker defaultValue="11:00" disabledTime={before10} />);

    await user.click(screen.getByLabelText(/open time picker|chọn giờ/i));
    await user.click(await screen.findByRole("option", { name: "14" }));

    await waitFor(() => expect(screen.getByRole("combobox")).toHaveValue("14:00"));
  });

  it("refuses the same hour typed into the field", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    renderWithUi(<TimePicker disabledTime={before10} onValueChange={onValueChange} />);

    const field = screen.getByRole("combobox");
    await user.type(field, "09:30");

    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("accepts an allowed time typed into the field", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    renderWithUi(<TimePicker disabledTime={before10} onValueChange={onValueChange} />);

    await user.type(screen.getByRole("combobox"), "14:30");

    expect(onValueChange).toHaveBeenLastCalledWith("14:30");
  });

  it("refuses a minute the rule forbids only inside its own hour", async () => {
    // The ordinary pair rule: the start hour is partly open, every earlier hour is shut.
    const after0915 = () => ({
      disabledHours: () => [7, 8],
      disabledMinutes: (hour: number) => (hour === 9 ? [0] : []),
    });
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    renderWithUi(<TimePicker disabledTime={after0915} onValueChange={onValueChange} />);

    await user.type(screen.getByRole("combobox"), "09:00");
    expect(onValueChange).not.toHaveBeenCalled();

    await user.clear(screen.getByRole("combobox"));
    await user.type(screen.getByRole("combobox"), "10:00");
    expect(onValueChange).toHaveBeenLastCalledWith("10:00");
  });

  it("drops the refused options entirely when asked to", async () => {
    const user = userEvent.setup();
    renderWithUi(<TimePicker defaultValue="11:00" disabledTime={before10} hideDisabledOptions />);

    await user.click(screen.getByLabelText(/open time picker|chọn giờ/i));
    await screen.findByRole("option", { name: "11" });

    expect(screen.queryByRole("option", { name: "09" })).toBeNull();
  });
});

describe("DatePicker disabledDate (gh#390)", () => {
  // 土日 — the rule `fromDate`/`toDate` cannot express at all.
  const weekends = (date: Date) => date.getDay() === 0 || date.getDay() === 6;

  it("refuses a forbidden date typed into the field", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    renderWithUi(<DatePicker disabledDate={weekends} onValueChange={onValueChange} />);

    // 2026-09-05 is a Saturday.
    await user.type(screen.getByRole("combobox"), "2026-09-05");

    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("accepts a date the rule allows", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    renderWithUi(<DatePicker disabledDate={weekends} onValueChange={onValueChange} />);

    // 2026-09-07 is a Monday.
    await user.type(screen.getByRole("combobox"), "2026-09-07");

    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange.mock.calls[0][0]?.getDate()).toBe(7);
  });

  it("does not leave a refused date sitting in the field on blur", async () => {
    const user = userEvent.setup();
    renderWithUi(<DatePicker disabledDate={weekends} />);

    const field = screen.getByRole("combobox");
    await user.type(field, "2026-09-05");
    await user.tab();

    expect(field).toHaveValue("");
  });
});

describe("Calendar cellRender (gh#390 · lát 2)", () => {
  // 2026-09-21 is 敬老の日 — the ordinary reason a Japanese business calendar needs this at all.
  const isHoliday = (date: Date) => date.getMonth() === 8 && date.getDate() === 21;

  it("decorates the marked day and leaves the rest alone", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <DatePicker
        defaultValue={new Date(2026, 8, 7)}
        cellRender={(date, { originNode }) => (
          <>
            {originNode}
            {isHoliday(date) ? <span data-test="holiday" /> : null}
          </>
        )}
      />,
    );

    await user.click(screen.getByLabelText(/open calendar|mở lịch/i));
    await screen.findByRole("grid");

    expect(document.querySelectorAll('[data-test="holiday"]')).toHaveLength(1);
  });

  it("keeps the day still selectable — the marker wraps the button, it does not replace it", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    renderWithUi(
      <DatePicker
        defaultValue={new Date(2026, 8, 7)}
        onValueChange={onValueChange}
        cellRender={(date, { originNode }) => (
          <>
            {originNode}
            {isHoliday(date) ? <span data-test="holiday" /> : null}
          </>
        )}
      />,
    );

    await user.click(screen.getByLabelText(/open calendar|mở lịch/i));
    await user.click(await screen.findByRole("button", { name: /21/ }));

    // Rebuilding the cell instead of wrapping it would lose exactly this.
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange.mock.calls[0][0]?.getDate()).toBe(21);
  });
});
