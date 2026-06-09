import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { DatePicker } from "../date-picker";

const field = () => screen.getByRole("combobox");

describe("DatePicker — inline clear", () => {
  it("shows an inline ✕ when a value is set and clears on click", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(<DatePicker defaultValue={new Date(2026, 5, 15)} onValueChange={onValueChange} />);

    const clear = screen.getByRole("button", { name: "Xóa" });
    await user.click(clear);

    expect(onValueChange).toHaveBeenLastCalledWith(undefined);
    expect(field()).toHaveValue("");
  });

  it("renders no clear control when empty", () => {
    renderWithUi(<DatePicker />);
    expect(screen.queryByRole("button", { name: "Xóa" })).toBeNull();
  });

  it("renders no clear control when allowClear is false", () => {
    renderWithUi(<DatePicker defaultValue={new Date(2026, 5, 15)} allowClear={false} />);
    expect(screen.queryByRole("button", { name: "Xóa" })).toBeNull();
  });
});
