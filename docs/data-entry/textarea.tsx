import * as React from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { FormField, Textarea } from "@godxjp/ui/data-entry";
import { Button } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * Textarea — styled wrapper around the native textarea. Pair with FormField for
 * a labelled field. Composed only from real @godxjp/ui components.
 */

type Message = { id: number; author: string; body: string };

const SEED_MESSAGES: Message[] = [
  { id: 1, author: "佐藤", body: "月次の締め、明日の10時までにお願いします。" },
  { id: 2, author: "Trần", body: "承知しました。INV-2024-0312 の差異だけ確認中です。" },
];

/**
 * The godx-chatter composer (gh#310). One line at rest, grows line by line, scrolls itself past
 * eight rows, and collapses back to one line the moment the post is sent — the send button just
 * resets the controlled value, and `autoGrow` follows it without a single line of layout code.
 */
function Composer() {
  const [messages, setMessages] = React.useState(SEED_MESSAGES);
  const [draft, setDraft] = React.useState("");

  const send = () => {
    const body = draft.trim();
    if (!body) return;
    setMessages((current) => [...current, { id: current.length + 1, author: "自分", body }]);
    setDraft("");
  };

  return (
    <Flex direction="col" gap="md">
      <Flex direction="col" gap="sm">
        {messages.map((message) => (
          <Card key={message.id}>
            <CardContent>
              <CardTitle level={3}>{message.author}</CardTitle>
              <CardDescription>{message.body}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </Flex>

      <Card className="focus-within:ring-ring/50 overflow-hidden focus-within:ring-2">
        <CardContent flush>
          <Textarea
            variant="ghost"
            autoGrow
            minRows={1}
            maxRows={8}
            aria-label="メッセージ"
            placeholder="メッセージを入力... (Shift+Enter で改行)"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
          <Flex direction="row" justify="end" gap="sm" className="px-2 pb-2">
            <Button size="sm" onClick={send}>
              送信
            </Button>
          </Flex>
        </CardContent>
      </Card>
    </Flex>
  );
}

export default function Demo() {
  return (
    <PageContainer
      title="Textarea"
      subtitle="Multi-line text · pair with FormField for label / helper"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>States</CardTitle>
            <CardDescription>Placeholder, filled, and disabled.</CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Textarea aria-label="プレースホルダー状態" placeholder="摘要を入力..." />
              <Textarea aria-label="入力済み状態" defaultValue={"4月分 受注\nINV-2024-0312"} />
              <Textarea aria-label="無効状態" disabled defaultValue="無効 (disabled)" />
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Embedded in a surface · variant="ghost"</CardTitle>
            <CardDescription>
              The Card already draws the box, so the field must not draw a second one. Focus moves
              to the surface via focus-within.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Card className="focus-within:ring-ring/50 overflow-hidden focus-within:ring-2">
                <CardContent flush>
                  <Textarea
                    variant="ghost"
                    className="resize-none"
                    rows={2}
                    aria-label="サーフェス内のテキストエリア"
                    placeholder="メッセージを入力..."
                  />
                  <Flex direction="row" justify="end" className="px-2 pb-2">
                    <Button size="sm">送信</Button>
                  </Flex>
                </CardContent>
              </Card>
              <Textarea
                variant="default"
                rows={2}
                aria-label="単独のテキストエリア"
                defaultValue='variant="default" — 単独のフィールドは自分で枠を描く'
              />
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Chat composer · autoGrow</CardTitle>
            <CardDescription>
              一行から始まり、入力と貼り付けに合わせて行単位で伸び、8行を超えると内部でスクロールし、送信すると一行に戻ります。高さを書くコードはありません。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Composer />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>autoGrow の下限と上限 · minRows / maxRows</CardTitle>
            <CardDescription>
              下限・上限は「行」で指定します。行数なら密度切替や --font-size-base
              の再テーマでも見た目の行数がずれません。上限を超えた分は箱がスクロールします。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <FormField
                id="autogrow-ceiling"
                label="上限あり (minRows=1 / maxRows=3)"
                helper="4行目からは箱が伸びずに内部スクロールへ切り替わります。"
              >
                <Textarea
                  id="autogrow-ceiling"
                  autoGrow
                  minRows={1}
                  maxRows={3}
                  defaultValue={"1行目\n2行目\n3行目\n4行目\n5行目\n6行目"}
                />
              </FormField>

              <FormField
                id="autogrow-floor"
                label="下限あり (minRows=3)"
                helper="空でも3行分の高さを保ちます。"
              >
                <Textarea
                  id="autogrow-floor"
                  autoGrow
                  minRows={3}
                  placeholder="社内メモ..."
                  allowClear
                />
              </FormField>

              <FormField
                id="autogrow-unbounded"
                label="上限なし (maxRows=0)"
                helper="ページ側にスクロールを持つ画面でのみ使ってください。"
              >
                <Textarea
                  id="autogrow-unbounded"
                  autoGrow
                  maxRows={0}
                  defaultValue={
                    "長文の下書きを最後まで見せたい画面向け。\n箱は内容に合わせて伸び続けます。"
                  }
                />
              </FormField>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>In FormField</CardTitle>
            <CardDescription>Labelled with a helper hint.</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="memo" label="摘要" helper="仕訳に表示される説明文です">
              <Textarea id="memo" placeholder="例: 4月分 受注 INV-2024-0312" />
            </FormField>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
