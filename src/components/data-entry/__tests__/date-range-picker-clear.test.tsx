import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { DateRangePicker } from "../date-range-picker";

describe("DateRangePicker — inline clear", () => {
  it("shows an inline ✕ when a range is set and clears on click", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <DateRangePicker
        defaultValue={{ from: new Date(2026, 5, 1), to: new Date(2026, 5, 7) }}
        onValueChange={onValueChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Xóa" }));

    expect(onValueChange).toHaveBeenLastCalledWith(undefined);
  });

  it("renders no clear control when empty", () => {
    renderWithUi(<DateRangePicker />);
    expect(screen.queryByRole("button", { name: "Xóa" })).toBeNull();
  });

  it("renders no clear control when allowClear is false", () => {
    renderWithUi(
      <DateRangePicker
        defaultValue={{ from: new Date(2026, 5, 1), to: new Date(2026, 5, 7) }}
        allowClear={false}
      />,
    );
    expect(screen.queryByRole("button", { name: "Xóa" })).toBeNull();
  });
});
