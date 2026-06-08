import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { renderWithUi, screen, userEvent } from "@/test/render";
import { expectNoA11yViolations } from "@/test/a11y";
import { AppProvider } from "@/app/app-provider";

import { TimePicker } from "../time-picker";

const combobox = () => screen.getByRole("combobox");

/** Render with the 12-hour clock forced on (meridiem column + 1–12 hours). */
function render12h(ui: React.ReactElement) {
  return render(ui, {
    wrapper: ({ children }) => (
      <AppProvider persist={false} defaultLocale="en" fallbackLocale="en" defaultTimeFormat="12h">
        <MemoryRouter>{children}</MemoryRouter>
      </AppProvider>
    ),
  });
}

describe("TimePicker — typing on the canonical input", () => {
  it("renders a combobox input with the placeholder", () => {
    renderWithUi(<TimePicker placeholder="hh:mm" />);
    expect(combobox()).toHaveAttribute("aria-haspopup", "dialog");
    expect(combobox()).toHaveAttribute("placeholder", "hh:mm");
  });

  it("typing a canonical HH:mm emits it through onValueChange", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(<TimePicker onValueChange={onValueChange} />);
    await user.type(combobox(), "13:30");
    expect(onValueChange).toHaveBeenLastCalledWith("13:30");
  });

  it("normalises a loose H:mm to zero-padded HH:mm", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(<TimePicker onValueChange={onValueChange} />);
    await user.type(combobox(), "9:30");
    expect(onValueChange).toHaveBeenLastCalledWith("09:30");
  });

  it("blurring invalid text clears it back to empty", async () => {
    const user = userEvent.setup();
    renderWithUi(<TimePicker />);
    const input = combobox();
    await user.type(input, "99");
    await user.tab();
    expect(input).toHaveValue("");
  });
});

describe("TimePicker — popover panel", () => {
  it("ArrowDown opens the panel with hour + minute listboxes", async () => {
    const user = userEvent.setup();
    renderWithUi(<TimePicker defaultValue="09:00" />);
    await user.type(combobox(), "{ArrowDown}");
    expect(combobox()).toHaveAttribute("aria-expanded", "true");
    expect(screen.getAllByRole("listbox")).toHaveLength(2);
  });

  it("selecting an hour updates the value but keeps the panel open", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(<TimePicker defaultValue="09:00" onValueChange={onValueChange} />);
    await user.click(combobox());
    const [hourLb] = screen.getAllByRole("listbox");
    await user.click(within(hourLb).getByRole("option", { name: "13" }));
    expect(onValueChange).toHaveBeenLastCalledWith("13:00");
    expect(combobox()).toHaveAttribute("aria-expanded", "true"); // hour does not close
  });

  it("selecting a minute commits and closes the panel", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(<TimePicker defaultValue="09:00" minuteStep={15} onValueChange={onValueChange} />);
    await user.click(combobox());
    const minLb = screen.getAllByRole("listbox")[1];
    await user.click(within(minLb).getByRole("option", { name: "30" }));
    expect(onValueChange).toHaveBeenLastCalledWith("09:30");
    expect(screen.queryAllByRole("listbox")).toHaveLength(0); // closed via onDone
  });

  it("Escape closes an open panel", async () => {
    const user = userEvent.setup();
    renderWithUi(<TimePicker defaultValue="09:00" />);
    await user.type(combobox(), "{ArrowDown}");
    expect(combobox()).toHaveAttribute("aria-expanded", "true");
    await user.type(combobox(), "{Escape}");
    expect(combobox()).toHaveAttribute("aria-expanded", "false");
  });
});

describe("TimePicker — disabled + 12h + a11y", () => {
  it("disabled: input cannot be focused/opened", async () => {
    const user = userEvent.setup();
    renderWithUi(<TimePicker disabled defaultValue="09:00" />);
    expect(combobox()).toBeDisabled();
    await user.click(combobox());
    expect(combobox()).toHaveAttribute("aria-expanded", "false");
  });

  it("12h clock: a third (meridiem) column appears and PM maps to 24h", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render12h(<TimePicker defaultValue="09:00" onValueChange={onValueChange} />);
    await user.click(combobox());
    const listboxes = screen.getAllByRole("listbox");
    expect(listboxes).toHaveLength(3); // hour, minute, meridiem
    // hour column shows 1–12, not 00–23
    expect(within(listboxes[0]).getByRole("option", { name: "12" })).toBeInTheDocument();
    expect(within(listboxes[0]).queryByRole("option", { name: "00" })).toBeNull();
    // pick PM (second meridiem option) → 09:00 AM becomes 21:00
    const meridiem = listboxes[2];
    await user.click(within(meridiem).getAllByRole("option")[1]);
    expect(onValueChange).toHaveBeenLastCalledWith("21:00");
  });

  it("has no a11y violations", async () => {
    await expectNoA11yViolations(<TimePicker defaultValue="09:00" />);
  });
});
