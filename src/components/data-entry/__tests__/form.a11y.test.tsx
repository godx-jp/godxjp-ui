import { describe, it } from "vitest";
import { expectNoA11yViolations } from "@/test/a11y";

import { CheckboxGroup } from "../checkbox-group";
import { Field } from "../field";
import { Form } from "../form";
import { FormField } from "../form-field";
import { Input } from "../input";
import { RadioGroup } from "../radio";
import { Select } from "../select";
import { Switch } from "../switch";
import { Textarea } from "../textarea";

/**
 * A11y guard for the comprehensive form (docs/data-entry/form). A representative form covering the
 * common field types in their non-default states (required, helper, error/aria-invalid, disabled,
 * read-only) must have 0 axe violations — labels associated, error announced, valid ARIA.
 */
describe("Form a11y — representative comprehensive form", () => {
  it("a vertical form of mixed field types (required/helper/error/disabled/read-only) has no axe violations", async () => {
    await expectNoA11yViolations(
      <Form aria-label="請求書">
        <FormField id="a-partner" label="取引先名" required helper="最大50文字">
          <Input id="a-partner" defaultValue="株式会社ベトヤ" />
        </FormField>
        <FormField id="a-code" label="取引先コード" required error="取引先コードは必須です">
          <Input id="a-code" />
        </FormField>
        <FormField id="a-account" label="勘定科目" required>
          <Select
            id="a-account"
            name="account"
            defaultValue="sales"
            placeholder="選択してください"
            options={[
              { value: "sales", label: "売上高" },
              { value: "rent", label: "地代家賃" },
            ]}
          />
        </FormField>
        <FormField id="a-memo" label="摘要" helper="任意">
          <Textarea id="a-memo" />
        </FormField>
        <FormField id="a-channels" label="通知チャネル" helper="複数選択可">
          <CheckboxGroup
            defaultValue={["email"]}
            options={[
              { value: "email", label: "メール" },
              { value: "slack", label: "Slack" },
            ]}
          />
        </FormField>
        <FormField id="a-rounding" label="端数処理">
          <RadioGroup
            defaultValue="round"
            orientation="horizontal"
            options={[
              { value: "round", label: "四捨五入" },
              { value: "floor", label: "切り捨て" },
            ]}
          />
        </FormField>
        <FormField id="a-readonly" label="作成日時">
          <Input id="a-readonly" readOnly defaultValue="2026-01-15 09:32" />
        </FormField>
        <FormField id="a-disabled" label="登録番号">
          <Input id="a-disabled" disabled defaultValue="INV-2026-0001" />
        </FormField>
        <Field id="a-active" label="取引を有効にする" description="無効にすると登録できません">
          <Switch id="a-active" defaultChecked />
        </Field>
      </Form>,
    );
  });
});
