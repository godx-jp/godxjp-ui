import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { TimePicker } from "../time-picker";

const field = () => screen.getByRole("combobox");

describe("TimePicker — controlled value", () => {
  it("shows the controlled prop, emits on type, and follows prop updates", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { rerender } = renderWithUi(<TimePicker value="09:00" onValueChange={onValueChange} />);
    expect(field()).toHaveValue("09:00");

    // typing a complete time emits via onValueChange (controlled → no internal mutation)
    await user.clear(field());
    await user.type(field(), "14:30");
    expect(onValueChange).toHaveBeenLastCalledWith("14:30");

    // the field follows the prop when the parent commits a new value
    rerender(<TimePicker value="18:45" onValueChange={onValueChange} />);
    expect(field()).toHaveValue("18:45");
  });
});
