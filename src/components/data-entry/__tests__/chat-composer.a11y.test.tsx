import * as React from "react";
import { describe, it } from "vitest";

import { expectNoA11yViolations } from "@/test/a11y";
import { ChatComposer } from "../chat-composer";
import { Button } from "../../general/button";
import { FormField } from "../form-field";

describe("ChatComposer — accessibility", () => {
  it("standalone, with an accessible name of its own", async () => {
    await expectNoA11yViolations(
      <ChatComposer aria-label="メッセージ" placeholder="メッセージを入力" />,
    );
  });

  it("inside a FormField — the label, helper and error all land on the textarea", async () => {
    await expectNoA11yViolations(
      <FormField
        id="composer"
        label="メッセージ"
        helper="Enter で送信、Shift + Enter で改行"
        error="メッセージを入力してください"
      >
        <ChatComposer status="error" />
      </FormField>,
    );
  });

  it("with every slot filled — the icon-only actions must still be named", async () => {
    await expectNoA11yViolations(
      <ChatComposer
        aria-label="メッセージ"
        defaultValue="下書き"
        header={<span>添付ファイル 1件</span>}
        prefix={<Button size="icon-sm" variant="ghost" aria-label="ファイルを添付" />}
        footer={<span>Enter で送信</span>}
        actions={<Button size="icon-sm" variant="ghost" aria-label="絵文字を挿入" />}
      />,
    );
  });

  it("while loading — the trailing action is a named cancel button", async () => {
    await expectNoA11yViolations(
      <ChatComposer aria-label="メッセージ" defaultValue="生成中" loading />,
    );
  });

  it("disabled and read-only", async () => {
    await expectNoA11yViolations(
      <>
        <ChatComposer aria-label="無効なメッセージ" defaultValue="text" disabled />
        <ChatComposer aria-label="読み取り専用メッセージ" defaultValue="text" readOnly />
      </>,
    );
  });
});
