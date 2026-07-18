import { describe, it } from "vitest";

import { expectNoA11yViolations } from "@/test/a11y";
import { QrCode } from "../qr-code";

describe("QrCode a11y", () => {
  it("has no axe violations with a purpose-specific accessible name", async () => {
    await expectNoA11yViolations(
      <QrCode
        value="otpauth://totp/GoDX:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=GoDX"
        label="Two-factor authentication setup code"
      />,
    );
  });

  it("has no axe violations at the smallest responsive size", async () => {
    await expectNoA11yViolations(
      <QrCode value="https://godx.jp/account" label="Open the Godx account page" size="xs" />,
    );
  });
});
