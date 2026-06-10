import { describe, it } from "vitest";
import { MonthRangePicker } from "../month-range-picker";
import { expectNoA11yViolations } from "@/test/a11y";

// One input-styled shell holding two labelled yyyy/MM inputs plus icon-only
// clear/grid buttons — every control must carry an accessible name and the
// grid popover must expose correct roles.
describe("MonthRangePicker a11y", () => {
  it("has no axe violations at rest with a value", async () => {
    await expectNoA11yViolations(
      <MonthRangePicker
        value={{ from: new Date(2026, 0, 1), to: new Date(2026, 5, 1) }}
        onValueChange={() => {}}
      />,
    );
  });

  it("has no axe violations while empty and disabled", async () => {
    await expectNoA11yViolations(<MonthRangePicker disabled onValueChange={() => {}} />);
  });
});
