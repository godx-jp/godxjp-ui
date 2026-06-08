import { describe, expect, it } from "vitest";
import { within } from "@testing-library/react";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { TimePicker } from "../time-picker";

describe("TimePicker column — unhandled key", () => {
  it("a key the column does not handle is a no-op (default branch)", async () => {
    const user = userEvent.setup();
    renderWithUi(<TimePicker defaultValue="09:00" />);
    await user.click(screen.getByRole("combobox"));
    const [hourList] = screen.getAllByRole("listbox");
    const option = within(hourList).getAllByRole("option")[9]; // "09"
    option.focus();
    await user.keyboard("z"); // not Arrow/Home/End/Enter/Space → switch default → break
    expect(option).toHaveFocus(); // focus unchanged, no selection
  });
});
