import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { DatePicker } from "../date-picker";

const field = () => screen.getByRole("combobox");
const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

describe("DatePicker — controlled value", () => {
  it("shows the controlled prop, emits on select, and follows prop updates", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { rerender } = renderWithUi(
      <DatePicker value={new Date(2026, 5, 15)} onValueChange={onValueChange} />,
    );
    expect(field()).toHaveValue("2026-06-15");

    // selecting a day emits but (controlled) does not mutate internal state
    await user.click(field());
    await user.click(screen.getAllByText("20")[0]);
    expect(iso(onValueChange.mock.calls.at(-1)![0])).toBe("2026-06-20");

    // the field follows the prop when the parent commits a new value
    rerender(<DatePicker value={new Date(2026, 5, 25)} onValueChange={onValueChange} />);
    expect(field()).toHaveValue("2026-06-25");
  });
});
