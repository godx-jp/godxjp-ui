import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { screen, userEvent } from "@/test/render";
import { AppProvider } from "@/app/app-provider";

import { TimePicker } from "../time-picker";

function render12h(ui: React.ReactElement) {
  return render(ui, {
    wrapper: ({ children }) => (
      <AppProvider persist={false} defaultLocale="en" fallbackLocale="en" defaultTimeFormat="12h">
        <MemoryRouter>{children}</MemoryRouter>
      </AppProvider>
    ),
  });
}

const combobox = () => screen.getByRole("combobox");

describe("TimePicker 12h — hour + minute selection", () => {
  it("selecting an hour converts the 12h display back to canonical 24h", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render12h(<TimePicker defaultValue="09:00" onValueChange={onValueChange} />); // 9 AM
    await user.click(combobox());
    const [hourList] = screen.getAllByRole("listbox");
    await user.click(within(hourList).getByRole("option", { name: "11" }));
    expect(onValueChange).toHaveBeenLastCalledWith("11:00"); // 11 AM → 11:00
  });

  it("hour 12 in the AM maps to 00 (midnight hour)", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render12h(<TimePicker defaultValue="09:00" onValueChange={onValueChange} />);
    await user.click(combobox());
    const [hourList] = screen.getAllByRole("listbox");
    await user.click(within(hourList).getByRole("option", { name: "12" }));
    expect(onValueChange).toHaveBeenLastCalledWith("00:00"); // 12 AM → 00:00
  });

  it("selecting a minute keeps the 24h hour and closes the panel", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render12h(
      <TimePicker defaultValue="21:00" minuteStep={15} onValueChange={onValueChange} />, // 9 PM
    );
    await user.click(combobox());
    const minuteList = screen.getAllByRole("listbox")[1];
    await user.click(within(minuteList).getByRole("option", { name: "30" }));
    expect(onValueChange).toHaveBeenLastCalledWith("21:30"); // stays PM/21h
    expect(screen.queryAllByRole("listbox")).toHaveLength(0);
  });
});
