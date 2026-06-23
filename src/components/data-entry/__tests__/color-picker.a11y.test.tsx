import { describe, it } from "vitest";

import { ColorPicker } from "../color-picker";
import { FormField } from "../form-field";
import { expectNoA11yViolations } from "@/test/a11y";

// A native <input type="color"> swatch + an optional hex text Input. Both inner
// controls carry their own aria-label from i18n; FormField adds the visible label.
describe("ColorPicker a11y", () => {
  it("has no axe violations (swatch + hex input, labelled via FormField)", async () => {
    await expectNoA11yViolations(
      <FormField id="brand" label="ブランドカラー">
        <ColorPicker id="brand" value="#2563eb" onValueChange={() => {}} />
      </FormField>,
    );
  });

  it("has no axe violations (swatch only, hex input hidden)", async () => {
    await expectNoA11yViolations(
      <FormField id="accent" label="アクセントカラー">
        <ColorPicker id="accent" value="#16a34a" showHexInput={false} onValueChange={() => {}} />
      </FormField>,
    );
  });

  it("has no axe violations (disabled)", async () => {
    await expectNoA11yViolations(
      <FormField id="brand-disabled" label="ブランドカラー">
        <ColorPicker id="brand-disabled" value="#dc2626" disabled onValueChange={() => {}} />
      </FormField>,
    );
  });
});
