import { describe, it } from "vitest";

import { expectNoA11yViolations } from "@/test/a11y";
import { Avatar, AvatarFallback } from "../avatar";
import { ChatBubble, ChatBubbleList } from "../chat-bubble";

/**
 * A conversation is a live region and a stack of articles, which is exactly where the classic
 * violations live: an unnamed log, an avatar with no accessible text sitting next to the name it
 * duplicates, a status carried by colour alone, and a busy state with no words. Each case below
 * is one of those, rendered at rest so axe can see it.
 */
describe("ChatBubble a11y", () => {
  it("has no axe violations for a named turn with an avatar", async () => {
    await expectNoA11yViolations(
      <ChatBubble
        placement="start"
        header="アシスタント"
        footer="10:24"
        avatar={
          <Avatar aria-hidden="true">
            <AvatarFallback>AI</AvatarFallback>
          </Avatar>
        }
      >
        請求書の下書きを3件作成しました。
      </ChatBubble>,
    );
  });

  it("has no axe violations while the reply is loading", async () => {
    await expectNoA11yViolations(<ChatBubble placement="start" header="アシスタント" loading />);
  });

  it("has no axe violations for every tone", async () => {
    await expectNoA11yViolations(
      <>
        <ChatBubble header="システム" tone="info" variant="outlined">
          モデルを切り替えました。
        </ChatBubble>
        <ChatBubble header="システム" tone="success">
          保存しました。
        </ChatBubble>
        <ChatBubble header="システム" tone="warning">
          利用上限に近づいています。
        </ChatBubble>
        <ChatBubble header="自分" tone="destructive" placement="end">
          送信できませんでした。
        </ChatBubble>
      </>,
    );
  });

  it("has no axe violations across every size and variant", async () => {
    await expectNoA11yViolations(
      <>
        <ChatBubble size="xs" variant="filled" header="自分" placement="end">
          xs
        </ChatBubble>
        <ChatBubble size="sm" variant="outlined" header="アシスタント">
          sm
        </ChatBubble>
        <ChatBubble size="md" variant="borderless" header="アシスタント">
          md
        </ChatBubble>
        <ChatBubble size="lg" variant="filled" header="アシスタント">
          lg
        </ChatBubble>
      </>,
    );
  });
});

describe("ChatBubbleList a11y", () => {
  it("has no axe violations for a named feed", async () => {
    await expectNoA11yViolations(
      <ChatBubbleList
        label="サポートの会話"
        items={[
          { id: "a1", role: "assistant", content: "ご用件をどうぞ。" },
          { id: "a2", role: "user", content: "先週の請求書をまとめてください。" },
          { id: "a3", role: "system", content: "検索ツールを実行しました。" },
          { id: "a4", role: "assistant", loading: true },
        ]}
        roles={{
          assistant: {
            placement: "start",
            variant: "filled",
            header: "アシスタント",
            avatar: (
              <Avatar aria-hidden="true">
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
            ),
          },
          user: { placement: "end", variant: "outlined", header: "自分" },
          system: { placement: "start", variant: "borderless", tone: "info", size: "sm" },
        }}
      />,
    );
  });

  it("has no axe violations for an empty feed", async () => {
    await expectNoA11yViolations(<ChatBubbleList items={[]} />);
  });
});
