import { describe, it } from "vitest";

import { MonthPicker } from "../month-picker";
import { Label } from "../label";
import { expectNoA11yViolations } from "@/test/a11y";

describe("MonthPicker a11y", () => {
  it("has no axe violations (associated Label, default value)", async () => {
    await expectNoA11yViolations(
      <>
        <Label htmlFor="period">対象月</Label>
        <MonthPicker id="period" defaultValue={new Date(2026, 5, 1)} />
      </>,
    );
  });

  it("has no axe violations (placeholder, clear shown with value)", async () => {
    await expectNoA11yViolations(
      <>
        <Label htmlFor="ym">会計月</Label>
        <MonthPicker id="ym" defaultValue={new Date(2026, 0, 1)} placeholder="yyyy/mm" allowClear />
      </>,
    );
  });

  it("has no axe violations (disabled)", async () => {
    await expectNoA11yViolations(
      <>
        <Label htmlFor="ym-d">締め月</Label>
        <MonthPicker id="ym-d" defaultValue={new Date(2026, 2, 1)} disabled />
      </>,
    );
  });
});
