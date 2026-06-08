import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

const field = () => screen.getByRole("combobox");

import { DatePicker } from "../date-picker";

describe("DatePicker — calendar deselect", () => {
  it("clicking the already-selected day clears the value (onSelect undefined)", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(<DatePicker defaultValue={new Date(2026, 5, 15)} onValueChange={onValueChange} />);
    await user.click(field());
    // June 15 is the selected day; clicking it again deselects in single mode
    await user.click(screen.getAllByText("15")[0]);
    expect(onValueChange).toHaveBeenLastCalledWith(undefined);
    expect(field()).toHaveValue(""); // text mirror cleared
  });
});
