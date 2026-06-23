import { describe, it } from "vitest";

import { DateRangePicker } from "../date-range-picker";
import { FormField } from "../form-field";
import { expectNoA11yViolations } from "@/test/a11y";

// One input-styled shell holding two labelled yyyy-MM-dd inputs plus icon-only
// clear/calendar buttons. Each inner input carries its own aria-label (from/to);
// FormField provides the visible group label.
describe("DateRangePicker a11y", () => {
  it("has no axe violations at rest with a value", async () => {
    await expectNoA11yViolations(
      <FormField id="period" label="対象期間">
        <DateRangePicker
          id="period"
          name="period"
          value={{ from: new Date(2026, 0, 1), to: new Date(2026, 5, 30) }}
          onValueChange={() => {}}
        />
      </FormField>,
    );
  });

  it("has no axe violations while empty", async () => {
    await expectNoA11yViolations(
      <FormField id="period-empty" label="対象期間" helper="開始日と終了日を入力">
        <DateRangePicker id="period-empty" onValueChange={() => {}} />
      </FormField>,
    );
  });

  it("has no axe violations while disabled", async () => {
    await expectNoA11yViolations(
      <FormField id="period-disabled" label="対象期間">
        <DateRangePicker id="period-disabled" disabled onValueChange={() => {}} />
      </FormField>,
    );
  });
});
