import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { TimePicker } from "../time-picker";

const field = () => screen.getByRole("combobox");

describe("TimePicker — inline clear", () => {
  it("shows an inline ✕ when a value is set and clears on click", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(<TimePicker defaultValue="09:30" onValueChange={onValueChange} />);

    await user.click(screen.getByRole("button", { name: "Xóa" }));

    expect(onValueChange).toHaveBeenLastCalledWith("");
    expect(field()).toHaveValue("");
  });

  it("renders no clear control when empty", () => {
    renderWithUi(<TimePicker />);
    expect(screen.queryByRole("button", { name: "Xóa" })).toBeNull();
  });

  it("renders no clear control when allowClear is false", () => {
    renderWithUi(<TimePicker defaultValue="09:30" allowClear={false} />);
    expect(screen.queryByRole("button", { name: "Xóa" })).toBeNull();
  });
});
