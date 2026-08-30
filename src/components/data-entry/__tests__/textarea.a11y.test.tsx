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

  it("has no axe violations (autoGrow at every height, incl. past the ceiling)", async () => {
    await expectNoA11yViolations(
      <>
        <Textarea aria-label="空の作成欄" autoGrow placeholder="メッセージを入力..." />
        <Textarea aria-label="伸びた作成欄" autoGrow defaultValue={"一行目\n二行目\n三行目"} />
        <Textarea
          aria-label="上限を超えた作成欄"
          autoGrow
          minRows={1}
          maxRows={3}
          defaultValue={"1\n2\n3\n4\n5\n6\n7\n8"}
        />
        <Textarea aria-label="消去できる作成欄" autoGrow allowClear defaultValue={"あ\nい"} />
      </>,
    );
  });

  it("has no axe violations (autoGrow inside a labelled field)", async () => {
    await expectNoA11yViolations(
      <div className="ui-stack-xs">
        <Label htmlFor="composer">本文</Label>
        <Textarea
          id="composer"
          autoGrow
          maxRows={6}
          aria-describedby="composer-help"
          defaultValue="出荷前に確認してください。"
        />
        <p id="composer-help">Enter で送信されます。</p>
      </div>,
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
