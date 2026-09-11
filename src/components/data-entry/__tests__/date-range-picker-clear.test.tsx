import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";
import { DatePicker } from "../date-picker";

describe("DateRangePicker — inline clear", () => {
  it("shows an inline ✕ when a range is set and clears on click", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <DatePicker
        range
        defaultValue={{ from: new Date(2026, 5, 1), to: new Date(2026, 5, 7) }}
        onValueChange={onValueChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Xóa" }));

    expect(onValueChange).toHaveBeenLastCalledWith(undefined);
  });

  it("renders no clear control when empty", () => {
    renderWithUi(<DatePicker range />);
    expect(screen.queryByRole("button", { name: "Xóa" })).toBeNull();
  });

  it("renders no clear control when allowClear is false", () => {
    renderWithUi(
      <DatePicker
        range
        defaultValue={{ from: new Date(2026, 5, 1), to: new Date(2026, 5, 7) }}
        allowClear={false}
      />,
    );
    expect(screen.queryByRole("button", { name: "Xóa" })).toBeNull();
  });
});
