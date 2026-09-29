import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent, within } from "@/test/render";

import { DatePicker } from "../date-picker";

/*
 * gh#1076 — `<DatePicker showTime>` (needConfirm on by default): pick a day, type a time into the
 * time box inside the popover, press Enter. antd commits that like OK; ours closed the popover and
 * dropped the pick, leaving the field on its placeholder with no message.
 */
const timeBox = () => within(screen.getByRole("dialog")).getAllByRole("combobox")[0];

describe("DatePicker showTime — Enter in the time box confirms", () => {
  it("commits the picked day at the typed time, like OK", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <DatePicker
        showTime
        defaultPickerValue={new Date(2026, 8, 1)}
        onValueChange={onValueChange}
      />,
    );
    const field = screen.getAllByRole("combobox")[0];
    await user.click(field);
    await user.click(screen.getByText("28"));
    expect(onValueChange).not.toHaveBeenCalled();

    await user.clear(timeBox());
    await user.type(timeBox(), "10:00{Enter}");

    expect(onValueChange).toHaveBeenCalledTimes(1);
    const picked = onValueChange.mock.calls[0][0] as Date;
    expect([picked.getFullYear(), picked.getMonth(), picked.getDate()]).toEqual([2026, 8, 28]);
    expect([picked.getHours(), picked.getMinutes()]).toEqual([10, 0]);
    expect(screen.getAllByRole("combobox")[0]).toHaveValue("2026-09-28 10:00");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("Escape in the time box keeps an already confirmed value", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <DatePicker
        showTime
        defaultValue={new Date(2026, 8, 28, 10, 0)}
        onValueChange={onValueChange}
      />,
    );
    const field = screen.getAllByRole("combobox")[0];
    await user.click(field);
    await user.click(timeBox());
    await user.keyboard("{Escape}");
    await user.keyboard("{Escape}");
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getAllByRole("combobox")[0]).toHaveValue("2026-09-28 10:00");
  });
});
