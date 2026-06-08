import { describe, expect, it, vi } from "vitest";
import { within } from "@testing-library/react";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { TimePicker } from "../time-picker";

const combobox = () => screen.getByRole("combobox");
// inside the open panel the only role=textbox is the typeable draft input
const draft = () => screen.getByRole("textbox");

async function openPanel(user: ReturnType<typeof userEvent.setup>) {
  await user.click(combobox());
}

describe("TimePicker panel — typeable draft input", () => {
  it("typing a time then Enter commits it and closes the panel", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(<TimePicker defaultValue="09:00" onValueChange={onValueChange} />);
    await openPanel(user);
    await user.clear(draft());
    await user.type(draft(), "14:45{Enter}");
    expect(onValueChange).toHaveBeenLastCalledWith("14:45");
    expect(screen.queryAllByRole("listbox")).toHaveLength(0); // closed via onDone
  });

  it("blurring the draft normalises a loose value in place", async () => {
    const user = userEvent.setup();
    renderWithUi(<TimePicker defaultValue="09:00" />);
    await openPanel(user);
    await user.clear(draft());
    await user.type(draft(), "8:15");
    await user.tab();
    expect(draft()).toHaveValue("08:15");
  });

  it("Enter on an invalid draft is a no-op (no commit, panel stays open)", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(<TimePicker defaultValue="09:00" onValueChange={onValueChange} />);
    await openPanel(user);
    await user.clear(draft());
    await user.type(draft(), "99{Enter}");
    expect(onValueChange).not.toHaveBeenCalledWith("99");
    expect(screen.getAllByRole("listbox").length).toBeGreaterThan(0); // still open
  });

  it("snaps the selected minute to the step when the value is off-grid", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    // 09:07 with a 15-min step → the minute column has no 07; it falls back to 00
    renderWithUi(<TimePicker defaultValue="09:07" minuteStep={15} onValueChange={onValueChange} />);
    await openPanel(user);
    const [hourList, minuteList] = screen.getAllByRole("listbox");
    // selecting the hour re-commits using the snapped minute (00), not 07
    await user.click(within(hourList).getByRole("option", { name: "10" }));
    expect(onValueChange).toHaveBeenLastCalledWith("10:00");
    expect(minuteList).toBeInTheDocument();
  });
});
