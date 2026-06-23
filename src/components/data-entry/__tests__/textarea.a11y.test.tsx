import { describe, it } from "vitest";

import { Textarea } from "../textarea";
import { Label } from "../label";
import { expectNoA11yViolations } from "@/test/a11y";

describe("Textarea a11y", () => {
  it("has no axe violations (label + control)", async () => {
    await expectNoA11yViolations(
      <div className="ui-stack-xs">
        <Label htmlFor="note">備考</Label>
        <Textarea id="note" defaultValue="出荷前に確認してください。" rows={4} />
      </div>,
    );
  });

  it("has no axe violations (allowClear with text)", async () => {
    await expectNoA11yViolations(
      <Textarea aria-label="備考" allowClear defaultValue="クリア可能なテキスト" />,
    );
  });

  it("has no axe violations (disabled / readOnly / invalid)", async () => {
    await expectNoA11yViolations(
      <>
        <Textarea aria-label="確定済み" value="読み取り専用" readOnly />
        <Textarea aria-label="無効" value="無効" disabled />
        <Textarea aria-label="エラー" defaultValue="不正な値" aria-invalid="true" />
      </>,
    );
  });
});
