import { describe, expect, it } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { DatePicker } from "../date-picker";

const field = () => screen.getByRole("combobox");

describe("DatePicker — toDate upper bound", () => {
  it("disables days after the toDate boundary", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <DatePicker defaultValue={new Date(2026, 5, 10)} toDate={new Date(2026, 5, 20)} />,
    );
    await user.click(field());
    // day 25 is after the toDate (June 20) boundary → disabled (the `toDate ? [{after}]` branch)
    expect(screen.getByText("25").closest("button")).toBeDisabled();
    // day 15 is within range → enabled
    expect(screen.getByText("15").closest("button")).not.toBeDisabled();
  });
});
