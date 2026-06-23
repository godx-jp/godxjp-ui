import { describe, it } from "vitest";

import { Label } from "../label";
import { Input } from "../input";
import { expectNoA11yViolations } from "@/test/a11y";

describe("Label a11y", () => {
  it("has no axe violations (htmlFor associates a control)", async () => {
    await expectNoA11yViolations(
      <>
        <Label htmlFor="account">勘定科目</Label>
        <Input id="account" defaultValue="現金" />
      </>,
    );
  });

  it("has no axe violations (wrapping a control)", async () => {
    await expectNoA11yViolations(
      <Label>
        担当者
        <Input defaultValue="山田" />
      </Label>,
    );
  });
});
