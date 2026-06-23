import { describe, it } from "vitest";

import { PasswordStrength } from "../password-strength";
import { expectNoA11yViolations } from "@/test/a11y";

describe("PasswordStrength a11y", () => {
  it("has no axe violations (empty value, checklist shown)", async () => {
    await expectNoA11yViolations(<PasswordStrength value="" />);
  });

  it("has no axe violations (strong value, full checklist)", async () => {
    await expectNoA11yViolations(<PasswordStrength value="Abcdef1!" />);
  });

  it("has no axe violations (custom labels, checklist hidden)", async () => {
    await expectNoA11yViolations(
      <PasswordStrength
        value="Ab1!"
        showChecklist={false}
        labels={{ weak: "弱い", fair: "普通", strong: "強い" }}
      />,
    );
  });
});
