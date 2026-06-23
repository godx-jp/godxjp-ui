import { describe, it } from "vitest";

import { Switch } from "../switch";
import { Label } from "../label";
import { expectNoA11yViolations } from "@/test/a11y";

describe("Switch a11y", () => {
  it("has no axe violations (aria-label)", async () => {
    await expectNoA11yViolations(<Switch aria-label="通知を有効化" defaultChecked />);
  });

  it("has no axe violations (label + control)", async () => {
    await expectNoA11yViolations(
      <div className="flex items-center gap-2">
        <Switch id="notify" aria-label="通知を有効化" />
        <Label htmlFor="notify">通知を有効化</Label>
      </div>,
    );
  });

  it("has no axe violations (disabled / checked)", async () => {
    await expectNoA11yViolations(
      <>
        <Switch aria-label="確定" checked disabled />
        <Switch aria-label="未確定" checked={false} disabled />
      </>,
    );
  });
});
