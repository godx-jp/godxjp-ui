import { describe, expect, it } from "vitest";
import * as React from "react";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { DatePicker } from "../date-picker";
import { DateRangePicker } from "../date-range-picker";

/**
 * Regression: typing a date CHAR-BY-CHAR must not get mangled. The bug fed every partial
 * keystroke to the lenient parser (parseISO("20") = a real date), which changed `value`,
 * and a text-mirror effect rewrote the field mid-type → "2026-06-01" became "6-06-01".
 * Fixed by only committing a complete yyyy-MM-dd.
 */
describe("date inputs — char-by-char typing not mangled (regression)", () => {
  it("DatePicker: typing a full ISO date key-by-key sticks", async () => {
    const user = userEvent.setup();
    function Wrap() {
      const [v, setV] = React.useState<Date | undefined>(undefined);
      return <DatePicker value={v} onValueChange={setV} />;
    }
    renderWithUi(<Wrap />);
    const input = screen.getByRole("combobox");
    await user.type(input, "2026-06-01");
    expect(input).toHaveValue("2026-06-01");
  });

  it("DateRangePicker: typing into the From input key-by-key sticks", async () => {
    const user = userEvent.setup();
    renderWithUi(<DateRangePicker />);
    const from = screen.getAllByRole("textbox")[0];
    await user.type(from, "2026-06-01");
    expect(from).toHaveValue("2026-06-01");
  });
});
