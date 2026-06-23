import { describe, it } from "vitest";
import { Bold } from "lucide-react";

import { Toggle } from "../toggle";
import { expectNoA11yViolations } from "@/test/a11y";

describe("Toggle a11y", () => {
  it("has no axe violations (icon toggle with aria-label)", async () => {
    await expectNoA11yViolations(
      <Toggle aria-label="太字" defaultPressed>
        <Bold className="size-4" aria-hidden="true" />
      </Toggle>,
    );
  });

  it("has no axe violations (text toggle, outline variant)", async () => {
    await expectNoA11yViolations(
      <Toggle variant="outline" size="lg">
        自動保存
      </Toggle>,
    );
  });

  it("has no axe violations (disabled / pressed states)", async () => {
    await expectNoA11yViolations(
      <>
        <Toggle aria-label="押下" pressed disabled>
          <Bold className="size-4" aria-hidden="true" />
        </Toggle>
        <Toggle aria-label="未押下" pressed={false} disabled>
          <Bold className="size-4" aria-hidden="true" />
        </Toggle>
      </>,
    );
  });
});
