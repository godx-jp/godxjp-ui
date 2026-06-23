import { describe, it } from "vitest";

import { Field } from "../field";
import { Checkbox } from "../checkbox";
import { Switch } from "../switch";
import { Radio, RadioGroup } from "../radio";
import { expectNoA11yViolations } from "@/test/a11y";

// Field = Label (+ optional description) beside a single checkbox/radio/switch.
// The id must match the control so <label for> wires up the accessible name.
describe("Field a11y", () => {
  it("has no axe violations (checkbox with description)", async () => {
    await expectNoA11yViolations(
      <Field id="agree" label="利用規約に同意する" description="同意しないと登録できません">
        <Checkbox id="agree" defaultChecked />
      </Field>,
    );
  });

  it("has no axe violations (switch, no description)", async () => {
    await expectNoA11yViolations(
      <Field id="active" label="取引を有効にする">
        <Switch id="active" defaultChecked />
      </Field>,
    );
  });

  it("has no axe violations (radio option inside a named group)", async () => {
    await expectNoA11yViolations(
      <RadioGroup aria-label="端数処理" defaultValue="round">
        <Field id="round" label="四捨五入">
          <Radio value="round" id="round" />
        </Field>
        <Field id="floor" label="切り捨て" description="小数点以下を破棄">
          <Radio value="floor" id="floor" />
        </Field>
      </RadioGroup>,
    );
  });
});
