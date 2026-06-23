import { describe, it } from "vitest";

import { Checkbox } from "../checkbox";
import { Field } from "../field";
import { expectNoA11yViolations } from "@/test/a11y";

// A single Radix checkbox (<button role="checkbox">). It needs an accessible name —
// here via the real Field primitive (Label + description) or aria-label.
describe("Checkbox a11y", () => {
  it("has no axe violations (labelled via Field, unchecked)", async () => {
    await expectNoA11yViolations(
      <Field id="agree" label="利用規約に同意する" description="同意しないと登録できません">
        <Checkbox id="agree" />
      </Field>,
    );
  });

  it("has no axe violations (checked + disabled)", async () => {
    await expectNoA11yViolations(
      <>
        <Field id="newsletter" label="ニュースレターを受け取る">
          <Checkbox id="newsletter" defaultChecked />
        </Field>
        <Field id="locked" label="管理者により固定">
          <Checkbox id="locked" defaultChecked disabled />
        </Field>
      </>,
    );
  });

  it("has no axe violations (aria-label, no visible Label)", async () => {
    await expectNoA11yViolations(<Checkbox aria-label="すべて選択" />);
  });
});
