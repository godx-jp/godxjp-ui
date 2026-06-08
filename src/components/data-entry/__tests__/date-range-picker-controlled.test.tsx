import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { DateRangePicker } from "../date-range-picker";

const inputs = () => screen.getAllByRole("textbox"); // [from, to]
const iso = (d: Date | undefined) =>
  d
    ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
    : "";

describe("DateRangePicker — controlled value", () => {
  it("shows the controlled range, emits on type, and follows prop updates", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { rerender } = renderWithUi(
      <DateRangePicker
        value={{ from: new Date(2026, 2, 10), to: new Date(2026, 2, 20) }}
        onValueChange={onValueChange}
      />,
    );
    const [from, to] = inputs();
    expect(from).toHaveValue("2026-03-10");
    expect(to).toHaveValue("2026-03-20");

    // editing the `from` edge emits a new range (controlled → no internal mutation)
    await user.clear(from);
    await user.type(from, "2026-03-05");
    const last = onValueChange.mock.calls.at(-1)![0];
    expect(iso(last.from)).toBe("2026-03-05");

    // the inputs follow the prop when the parent commits a new range
    rerender(
      <DateRangePicker
        value={{ from: new Date(2026, 6, 1), to: new Date(2026, 6, 8) }}
        onValueChange={onValueChange}
      />,
    );
    expect(inputs()[0]).toHaveValue("2026-07-01");
    expect(inputs()[1]).toHaveValue("2026-07-08");
  });
});
