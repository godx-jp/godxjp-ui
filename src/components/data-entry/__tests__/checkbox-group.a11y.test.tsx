import { describe, it } from "vitest";

import { CheckboxGroup } from "../checkbox-group";
import { FormField } from "../form-field";
import { expectNoA11yViolations } from "@/test/a11y";

// A role="group" of checkboxes; each option renders a Field (Label + Checkbox).
// The group itself is named by the surrounding FormField via aria-labelledby.
const CHANNELS = [
  { value: "email", label: "メール" },
  { value: "slack", label: "Slack" },
  { value: "sms", label: "SMS", description: "追加料金が発生します" },
];

describe("CheckboxGroup a11y", () => {
  it("has no axe violations (vertical options with a default selection)", async () => {
    await expectNoA11yViolations(
      <FormField id="channels" label="通知チャネル" helper="複数選択可">
        <CheckboxGroup defaultValue={["email"]} options={CHANNELS} />
      </FormField>,
    );
  });

  it("has no axe violations (horizontal with a disabled option)", async () => {
    await expectNoA11yViolations(
      <FormField id="channels-h" label="通知チャネル">
        <CheckboxGroup
          orientation="horizontal"
          defaultValue={["email", "slack"]}
          options={[
            { value: "email", label: "メール" },
            { value: "slack", label: "Slack" },
            { value: "sms", label: "SMS", disabled: true },
          ]}
        />
      </FormField>,
    );
  });

  it("has no axe violations (whole group disabled)", async () => {
    await expectNoA11yViolations(
      <FormField id="channels-disabled" label="通知チャネル">
        <CheckboxGroup disabled defaultValue={["email"]} options={CHANNELS} />
      </FormField>,
    );
  });
});
