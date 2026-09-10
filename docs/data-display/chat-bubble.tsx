import * as React from "react";
import { Bot, RotateCcw, User } from "lucide-react";
import {
  Avatar,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  ChatBubble,
  ChatBubbleList,
  type ChatBubbleProp,
  type ChatMessageProp,
} from "@godxjp/ui/data-display";
import { formatAppTime } from "@godxjp/ui/datetime";
import { Button, Text } from "@godxjp/ui/general";
import { Flex, PageContainer, ResponsiveGrid } from "@godxjp/ui/layout";

/**
 * ChatBubble · ChatBubbleList — 会話の1発言と、その発言が流れるフィード。
 *
 * ChatBubbleList が持っているのは「一番下に貼りつく」挙動です。読み手がすでに最下部にいる間だけ
 * 新着に追従し、履歴を読み返そうとスクロールを上げた瞬間に追従をやめて、戻るためのボタンを出しま
 * す。読んでいる途中で最下部へ引き戻すのは、機械が勝手に文脈を変える操作（WCAG 3.2.5）です。
 *
 * 入力欄は ChatComposer（data-entry）が担当します。このページはフィード側だけを扱います。
 */

const ASSISTANT_AVATAR = (
  <Avatar aria-hidden="true" appearance="tinted" shape="square">
    <Bot />
  </Avatar>
);

const USER_AVATAR = (
  <Avatar aria-hidden="true" shape="square">
    <User />
  </Avatar>
);

/** 1つのフィードの見た目を1か所で決める。各メッセージ側の指定が常に優先されます。 */
const ROLES: Record<string, Partial<ChatBubbleProp>> = {
  assistant: {
    placement: "start",
    variant: "filled",
    header: "アシスタント",
    avatar: ASSISTANT_AVATAR,
  },
  user: {
    placement: "end",
    variant: "outlined",
    header: "自分",
    avatar: USER_AVATAR,
  },
  system: {
    placement: "start",
    variant: "borderless",
    tone: "info",
    size: "sm",
    header: "システム",
  },
};

/**
 * Times are formatted INSIDE the component, not at module scope: formatAppTime reads the
 * AppProvider's locale and IANA timezone, and at module-evaluation time that context has not been
 * synced yet — a module-level call silently formats against the pre-provider default and drifts
 * from every other time on the page.
 */
const AT = (hhmm: string) => formatAppTime(`2026-09-10T${hhmm}:00+07:00`);

const conversation = (): ChatMessageProp[] => [
  {
    id: "c1",
    role: "assistant",
    content: "おはようございます。今日は何をお手伝いしましょうか。",
    footer: AT("09:02"),
  },
  {
    id: "c2",
    role: "user",
    content: "先週受領した請求書のうち、まだ承認されていないものを一覧にしてください。",
    footer: AT("09:03"),
  },
  {
    id: "c3",
    role: "system",
    content: "検索ツールを実行しました（対象 128 件 / 該当 7 件）。",
  },
  {
    id: "c4",
    role: "assistant",
    content:
      "未承認の請求書は 7 件です。合計 1,284,000 円。\n最も古いものは 9月1日受領の株式会社青葉商事 分で、支払期限まであと 3 日です。",
    footer: AT("09:03"),
    typing: { step: 2, interval: 40 },
  },
  {
    id: "c5",
    role: "user",
    content: "その 7 件を承認待ちのまま経理へ回してください。",
    footer: AT("09:05"),
  },
  {
    id: "c6",
    role: "assistant",
    loading: true,
  },
];

/** 上へ戻って読み返せるだけの長さがあるフィード。追従が切れる様子を実際に確かめる用。 */
const LONG_THREAD: ChatMessageProp[] = Array.from({ length: 24 }, (_, index) => ({
  id: `t${String(index)}`,
  role: index % 2 === 0 ? "assistant" : "user",
  content:
    index % 2 === 0
      ? `${String(index + 1)} 件目の集計が終わりました。差異は見つかりません。`
      : `${String(index + 1)} 件目もお願いします。`,
}));

const RTL_THREAD: ChatMessageProp[] = [
  { id: "r1", role: "assistant", content: "كيف يمكنني المساعدة؟" },
  { id: "r2", role: "user", content: "لخّص فواتير الأسبوع الماضي." },
];

const LTR_THREAD: ChatMessageProp[] = [
  { id: "l1", role: "assistant", content: "How can I help?" },
  { id: "l2", role: "user", content: "Summarise last week's invoices." },
];

const ARCHIVE: ChatMessageProp[] = Array.from({ length: 12 }, (_, index) => ({
  id: `a${String(index)}`,
  role: index % 2 === 0 ? "user" : "assistant",
  content:
    index % 2 === 0
      ? `${String(index + 1)} 番目の質問です。`
      : `${String(index + 1)} 番目の回答です。記録として保存されています。`,
}));

export default function Demo() {
  // 「新しい会話」を押すと typing がもう一度先頭から流れる。id が変わる = 別の発言。
  const [run, setRun] = React.useState(0);
  const live = React.useMemo(
    () => conversation().map((m) => (m.id === "c4" ? { ...m, id: `c4-${String(run)}` } : m)),
    [run],
  );

  return (
    <PageContainer
      title="ChatBubble · ChatBubbleList"
      subtitle="会話の1発言とフィード · 最下部への貼りつき · typing / loading · placement は論理軸"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>アシスタントの会話</CardTitle>
            <CardDescription>
              roles で assistant / user / system の既定値を1か所に書き、items は中身だけを持ちま
              す。最後の発言は loading（Skeleton と aria-busy、読み上げ用の文言つき）、その1つ前は
              typing で1文字ずつ流れます。prefers-reduced-motion: reduce の環境では、アニメーショ
              ンは動かず全文がそのまま表示されます。時刻は formatAppTime（Intl.DateTimeFormat と
              AppProvider のタイムゾーン）で整形しています。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Card variant="outline">
              <CardContent flush>
                <ChatBubbleList
                  className="h-96"
                  label="アシスタントとの会話"
                  items={live}
                  roles={ROLES}
                />
              </CardContent>
            </Card>
          </CardContent>
          <CardFooter>
            <Flex gap="sm" wrap>
              <Button type="button" variant="outline" onClick={() => setRun((n) => n + 1)}>
                <RotateCcw aria-hidden="true" />
                返答をもう一度流す
              </Button>
              <Text size="xs" tone="muted">
                入力欄は ChatComposer（data-entry）が担当します。
              </Text>
            </Flex>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>最下部への貼りつきと、戻るためのボタン</CardTitle>
            <CardDescription>
              下のフィードを少しだけ上へスクロールしてください。追従がその場で止まり、
              フィードの下端に「最新へ移動」ボタンが出ます。離れている間に届いた件数は
              Intl.PluralRules で数えて文言に入ります。ボタンはフォーカスできる本物のボタンなの
              で、キーボードだけでも最新へ戻れます。自動で引き戻すことは一度もありません。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Card variant="outline">
              <CardContent flush>
                <ChatBubbleList
                  className="h-64"
                  label="集計の進捗"
                  items={LONG_THREAD}
                  roles={ROLES}
                />
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>
              placement は論理軸（dir=&quot;rtl&quot; で自動的に反転）
            </CardTitle>
            <CardDescription>
              同じ items と同じ roles を、左が dir=&quot;ltr&quot;、右が dir=&quot;rtl&quot; で描
              いています。placement=&quot;end&quot; の自分の発言は、ltr では右、rtl では左に寄り
              ます。ロケールで分岐したコードは1行もありません。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveGrid columns={{ base: 1, md: 2 }} gap="md">
              <Card variant="outline">
                <CardContent flush>
                  <div dir="ltr">
                    <ChatBubbleList
                      className="h-48"
                      label="ltr conversation"
                      items={LTR_THREAD}
                      roles={ROLES}
                    />
                  </div>
                </CardContent>
              </Card>
              <Card variant="outline">
                <CardContent flush>
                  <div dir="rtl">
                    <ChatBubbleList
                      className="h-48"
                      label="محادثة"
                      items={RTL_THREAD}
                      roles={ROLES}
                    />
                  </div>
                </CardContent>
              </Card>
            </ResponsiveGrid>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>variant · 3つすべて</CardTitle>
            <CardDescription>
              variant は構造の軸です。filled は既定の面、outlined は 1px の枠だけ、borderless は
              面も枠も持たず本文としてそのまま読ませます。色で状態を示すのは tone の役目で、 variant
              には状態を表す値がありません。Ant Design X の shadow は、このデザインシステ
              ムが影を使わないため意図的にありません。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <ChatBubble variant="filled" header="アシスタント" avatar={ASSISTANT_AVATAR}>
                filled · 既定の面。相手の発言に使います。
              </ChatBubble>
              <ChatBubble variant="outlined" header="アシスタント" avatar={ASSISTANT_AVATAR}>
                outlined · 面を持たず 1px の枠だけ。
              </ChatBubble>
              <ChatBubble variant="borderless" header="アシスタント" avatar={ASSISTANT_AVATAR}>
                borderless · 長い回答を本文として読ませたいとき。面も枠もありません。
              </ChatBubble>
              <ChatBubble variant="filled" placement="end" header="自分" avatar={USER_AVATAR}>
                filled · placement=&quot;end&quot; は自分の発言用の色を持ちます。
              </ChatBubble>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>size · xs / sm / md / lg</CardTitle>
            <CardDescription>
              size は文字の段と内側の余白を同時に動かします。既定は md。&quot;default&quot; という
              値はありません。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <ChatBubble size="xs" header="アシスタント" avatar={ASSISTANT_AVATAR}>
                xs · 監査ログのように密度を上げたいとき。
              </ChatBubble>
              <ChatBubble size="sm" header="アシスタント" avatar={ASSISTANT_AVATAR}>
                sm · システムの注記など、会話の脇に置くもの。
              </ChatBubble>
              <ChatBubble size="md" header="アシスタント" avatar={ASSISTANT_AVATAR}>
                md · 既定。ふつうの会話。
              </ChatBubble>
              <ChatBubble size="lg" header="アシスタント" avatar={ASSISTANT_AVATAR}>
                lg · 画面いっぱいのアシスタント面で、長文を読ませるとき。
              </ChatBubble>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>tone · 色だけで状態を伝えない</CardTitle>
            <CardDescription>
              tone は会話そのものではない発言（送信失敗、上限の警告、ツールの結果）のための状態
              です。Alert と同じ役割色を薄く敷き、同時に読み上げ用の状態語（情報 / 成功 / 警告 /
              エラー）を必ず入れます。色を見分けられない読み手にも状態が届きます。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <ChatBubble header="アシスタント" avatar={ASSISTANT_AVATAR}>
                default · 状態なし。ふつうの発言です。
              </ChatBubble>
              <ChatBubble tone="info" variant="outlined" size="sm" header="システム">
                info · モデルを gpt-5 に切り替えました。
              </ChatBubble>
              <ChatBubble tone="success" variant="outlined" size="sm" header="システム">
                success · 7 件の請求書を経理へ回しました。
              </ChatBubble>
              <ChatBubble tone="warning" variant="outlined" size="sm" header="システム">
                warning · 今月の利用上限の 90% に達しています。
              </ChatBubble>
              <ChatBubble tone="destructive" placement="end" header="自分" avatar={USER_AVATAR}>
                destructive · 送信できませんでした。もう一度お試しください。
              </ChatBubble>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>loading と typing</CardTitle>
            <CardDescription>
              loading は「返答を頼んだが、まだ届いていない」状態です。Skeleton の棒は装飾なので
              支援技術からは隠し、代わりに aria-busy と読み上げ用の1行を置きます。typing は文字列
              の本文だけを流します（ReactNode には流す単位がないので、そのまま全部出ます）。
              流れている間の途中の文字は読み上げ対象から外れ、完成した本文だけが1回だけ読み上げ
              られます。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <ChatBubble header="アシスタント" avatar={ASSISTANT_AVATAR} loading />
              <ChatBubble
                key={`typing-${String(run)}`}
                header="アシスタント"
                avatar={ASSISTANT_AVATAR}
                typing={{ step: 1, interval: 60 }}
                footer={AT("09:12")}
              >
                typing · 1文字ずつ流れます。上の「返答をもう一度流す」でやり直せます。
              </ChatBubble>
              <ChatBubble header="アシスタント" avatar={ASSISTANT_AVATAR} typing>
                <Text size="sm">
                  ReactNode の本文。typing を渡しても流れず、そのまま表示されます。
                </Text>
              </ChatBubble>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>autoScroll=&#123;false&#125; · 読み終えた記録</CardTitle>
            <CardDescription>
              保管された記録を引用から開くときは、最新の発言に飛ばされたくありません。autoScroll
              を切ると、フィードは先頭のまま開き、新しい要素が増えても動きません。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Card variant="outline">
              <CardContent flush>
                <ChatBubbleList
                  className="h-64"
                  label="保管された会話"
                  items={ARCHIVE}
                  roles={ROLES}
                  autoScroll={false}
                />
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
