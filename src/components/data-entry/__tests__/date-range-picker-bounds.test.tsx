import { describe, expect, it } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { DateRangePicker } from "../date-range-picker";

const fromInput = () => screen.getAllByRole("textbox")[0];

describe("DateRangePicker — fromDate/toDate bounds", () => {
  it("disables days before fromDate and after toDate", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <DateRangePicker
        defaultValue={{ from: new Date(2026, 5, 10) }}
        fromDate={new Date(2026, 5, 5)}
        toDate={new Date(2026, 5, 25)}
      />,
    );
    await user.click(fromInput()); // open the calendar
    // June 3 is before fromDate (5) → disabled
    expect(screen.getAllByText("3")[0].closest("button")).toBeDisabled();
    // June 28 is after toDate (25) → disabled
    expect(screen.getAllByText("28")[0].closest("button")).toBeDisabled();
    // June 15 is within range → enabled
    expect(screen.getAllByText("15")[0].closest("button")).not.toBeDisabled();
  });
});
