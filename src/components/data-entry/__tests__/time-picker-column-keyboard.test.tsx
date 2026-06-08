import { describe, expect, it, vi } from "vitest";
import { within } from "@testing-library/react";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { TimePicker } from "../time-picker";

const combobox = () => screen.getByRole("combobox");

async function openHourColumn(user: ReturnType<typeof userEvent.setup>) {
  await user.click(combobox());
  const [hourList] = screen.getAllByRole("listbox");
  return within(hourList).getAllByRole("option");
}

describe("TimePicker column — roving keyboard navigation", () => {
  it("ArrowDown / ArrowUp move focus between adjacent options", async () => {
    const user = userEvent.setup();
    renderWithUi(<TimePicker defaultValue="09:00" />);
    const options = await openHourColumn(user);
    options[9].focus(); // "09"
    await user.keyboard("{ArrowDown}");
    expect(options[10]).toHaveFocus();
    await user.keyboard("{ArrowUp}");
    expect(options[9]).toHaveFocus();
  });

  it("Home jumps to the first option, End to the last", async () => {
    const user = userEvent.setup();
    renderWithUi(<TimePicker defaultValue="09:00" />);
    const options = await openHourColumn(user);
    options[9].focus();
    await user.keyboard("{Home}");
    expect(options[0]).toHaveFocus(); // 00
    await user.keyboard("{End}");
    expect(options[options.length - 1]).toHaveFocus(); // 23
  });

  it("ArrowUp at the first option and ArrowDown at the last are clamped", async () => {
    const user = userEvent.setup();
    renderWithUi(<TimePicker defaultValue="09:00" />);
    const options = await openHourColumn(user);
    options[0].focus();
    await user.keyboard("{ArrowUp}");
    expect(options[0]).toHaveFocus(); // clamped to 0
    options[options.length - 1].focus();
    await user.keyboard("{ArrowDown}");
    expect(options[options.length - 1]).toHaveFocus(); // clamped to last
  });

  it("Enter on a focused option selects that hour", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(<TimePicker defaultValue="09:00" onValueChange={onValueChange} />);
    const options = await openHourColumn(user);
    options[12].focus(); // "12"
    await user.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenLastCalledWith("12:00");
  });

  it("Space on a focused option selects that hour too", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(<TimePicker defaultValue="09:00" onValueChange={onValueChange} />);
    const options = await openHourColumn(user);
    options[7].focus(); // "07"
    await user.keyboard("[Space]");
    expect(onValueChange).toHaveBeenLastCalledWith("07:00");
  });
});
