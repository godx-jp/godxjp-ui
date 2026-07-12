import { describe, expect, it } from "vitest";

import { FormField } from "../form-field";
import { Input } from "../input";
import { Textarea } from "../textarea";
import { Select } from "../select";
import { expectNoA11yViolations } from "@/test/a11y";
import { renderWithUi } from "@/test/render";

// FormField wires label (via aria-labelledby), helper (aria-describedby) and error
// (aria-errormessage + aria-invalid) onto a single control child. Every state must
// produce valid ARIA with the control properly named.
describe("FormField a11y", () => {
  it("preserves consumer descriptions and validation while adding field messages", () => {
    const { getByRole } = renderWithUi(
      <>
        <p id="external-help">External help</p>
        <p id="external-error">External error</p>
        <FormField id="merged" label="Name" helper="Field help" error="Field error">
          <input
            aria-describedby="external-help"
            aria-errormessage="external-error"
            aria-required="true"
          />
        </FormField>
      </>,
    );
    const input = getByRole("textbox", { name: "Name" });
    expect(input).toHaveAttribute("aria-describedby", "external-help merged-helper");
    expect(input).toHaveAttribute("aria-errormessage", "external-error merged-error");
    expect(input).toHaveAttribute("aria-required", "true");
    expect(input).toHaveAttribute("aria-invalid", "true");
  });
  it("has no axe violations (required + helper)", async () => {
    await expectNoA11yViolations(
      <FormField id="partner" label="取引先名" required helper="最大50文字">
        <Input id="partner" defaultValue="株式会社ベトヤ" />
      </FormField>,
    );
  });

  it("has no axe violations (error / aria-invalid announced)", async () => {
    await expectNoA11yViolations(
      <FormField id="code" label="取引先コード" required error="取引先コードは必須です">
        <Input id="code" />
      </FormField>,
    );
  });

  it("has no axe violations (composite + textarea, horizontal layout)", async () => {
    await expectNoA11yViolations(
      <>
        <FormField id="account" label="勘定科目" layout="horizontal" required>
          <Select
            id="account"
            name="account"
            defaultValue="sales"
            placeholder="選択してください"
            options={[
              { value: "sales", label: "売上高" },
              { value: "rent", label: "地代家賃" },
            ]}
          />
        </FormField>
        <FormField id="memo" label="摘要" helper="任意">
          <Textarea id="memo" />
        </FormField>
        <FormField id="locked" label="登録番号">
          <Input id="locked" disabled defaultValue="INV-2026-0001" />
        </FormField>
      </>,
    );
  });
});
