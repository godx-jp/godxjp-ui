import { describe, it } from "vitest";

import { Form } from "../form";
import { FormErrors } from "../form-errors";
import { FormField } from "../form-field";
import { Input } from "../input";
import { expectNoA11yViolations } from "@/test/a11y";

// FormErrors composes Alert tone="destructive" (role="alert"), so unclaimed server errors are
// announced assertively the moment they appear. Every state must produce valid ARIA alongside
// the FormField error wiring (aria-invalid + aria-errormessage).
describe("FormErrors a11y", () => {
  it("has no axe violations with a mixed claimed/unclaimed bag", async () => {
    await expectNoA11yViolations(
      <Form errors={{ customer_nm: "顧客名は必須です", action_mode: "操作モードが不正です" }}>
        <FormErrors />
        <FormField name="customer_nm" label="顧客名">
          <Input defaultValue="株式会社ベトヤ" />
        </FormField>
      </Form>,
    );
  });

  it("has no axe violations with array messages and a custom title", async () => {
    await expectNoA11yViolations(
      <Form errors={{ page: ["ページ番号が不正です", "ページ範囲を超えています"] }}>
        <FormErrors title="入力エラー" />
        <FormField label="顧客名">
          <Input />
        </FormField>
      </Form>,
    );
  });
});
