import { useEffect, useRef, useState } from "react";

import {
  Avatar,
  AvatarFallback,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@godxjp/ui/data-display";
import {
  ChatComposer,
  ChatSuggestion,
  FormField,
  type ChatSuggestionItemProp,
} from "@godxjp/ui/data-entry";
import { Button, Text } from "@godxjp/ui/general";
import {
  AppShell,
  Flex,
  PageContainer,
  ResponsiveGrid,
  Sidebar,
  type SidebarSectionProp,
  Topbar,
} from "@godxjp/ui/layout";
import { Bot, MessageSquare, Paperclip, Settings, Smile, Sparkles, Users } from "lucide-react";

/**
 * ChatComposer — the message input of a conversation, and ChatSuggestion, the trigger-character
 * list over it.
 *
 * The first card is the real screen: a live assistant transcript whose composer sends, streams and
 * cancels, with `/` slash commands and `@` mentions wired to the same draft. Every card after it
 * exists so the whole API is visible AT REST — both `submitType` values, all four `size` steps,
 * every slot, and each non-default state — without having to click anything.
 *
 * Composed only from real @godxjp/ui components.
 */

const sections: SidebarSectionProp[] = [
  {
    label: "アシスタント",
    items: [
      { id: "chat", label: "チャット", icon: MessageSquare },
      { id: "agents", label: "エージェント", icon: Bot },
      { id: "members", label: "メンバー", icon: Users },
    ],
  },
  { label: "管理", items: [{ id: "settings", label: "設定", icon: Settings }] },
];

/** Slash commands — one level of `children` on the template row. */
const COMMANDS: ChatSuggestionItemProp[] = [
  { value: "summarize", label: "要約する", description: "このスレッドを3行で要約します" },
  { value: "translate", label: "翻訳する", description: "英語 ⇄ 日本語" },
  { value: "explain", label: "詳しく説明する" },
  {
    value: "template",
    label: "テンプレート",
    description: "定型文を挿入します",
    children: [
      { value: "template/meeting", label: "議事録", description: "日時・出席者・決定事項" },
      { value: "template/report", label: "週報", description: "実績・課題・来週の予定" },
    ],
  },
  { value: "archive", label: "アーカイブ", description: "権限がありません", disabled: true },
];

/** Mention list — the same component with a different `triggerCharacter`. */
const MEMBERS: ChatSuggestionItemProp[] = [
  { value: "sato", label: "佐藤 花子", description: "経理部" },
  { value: "tanaka", label: "田中 太郎", description: "営業部" },
  { value: "yamada", label: "山田 一郎", description: "開発部" },
];

interface Message {
  id: number;
  author: "you" | "assistant";
  body: string;
}

const OPENING: Message[] = [
  { id: 1, author: "you", body: "先月の交際費の内訳を教えてください。" },
  {
    id: 2,
    author: "assistant",
    body: "先月の交際費は 342,000 円でした。会食が 210,000 円、贈答が 132,000 円です。",
  },
];

/** One transcript line. The message FEED is ChatBubbleList's job; here it only sets the scene. */
function Line({ message }: { message: Message }) {
  const mine = message.author === "you";
  return (
    <Flex direction="row" gap="sm" align="start">
      <Avatar>
        <AvatarFallback>{mine ? "私" : "AI"}</AvatarFallback>
      </Avatar>
      <Flex direction="col" gap="xs">
        <Text size="sm" tone="muted">
          {mine ? "あなた" : "アシスタント"}
        </Text>
        <Text>{message.body}</Text>
      </Flex>
    </Flex>
  );
}

export default function Demo() {
  // ── Card 1: the live screen ───────────────────────────────────────────────────────────────
  const [messages, setMessages] = useState<Message[]>(OPENING);
  const [draft, setDraft] = useState("");
  const [streaming, setStreaming] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function send(text: string) {
    setMessages((current) => [...current, { id: current.length + 1, author: "you", body: text }]);
    setDraft("");
    setStreaming(true);
    // A real delay, so the cancel affordance is reachable instead of resolving instantly.
    timer.current = window.setTimeout(() => {
      setStreaming(false);
      setMessages((current) => [
        ...current,
        { id: current.length + 1, author: "assistant", body: "確認しました。集計を開始します。" },
      ]);
    }, 2500);
  }

  function cancel() {
    window.clearTimeout(timer.current);
    setStreaming(false);
  }

  // ── Card 2: both submitType values, each holding its own draft ────────────────────────────
  const [enterDraft, setEnterDraft] = useState("Enter を押すと送信されます");
  const [shiftDraft, setShiftDraft] = useState("Enter は改行、Shift + Enter で送信");
  const [lastSent, setLastSent] = useState<string>("—");

  // ── Card 3: the four size steps ───────────────────────────────────────────────────────────
  const [sizeDrafts, setSizeDrafts] = useState<Record<string, string>>({
    xs: "xs",
    sm: "sm",
    md: "md",
    lg: "lg",
  });

  // ── Card 4: every slot filled ─────────────────────────────────────────────────────────────
  const [slotDraft, setSlotDraft] = useState("見積書のドラフトを作成してください");

  // ── Card 5: the non-default states ────────────────────────────────────────────────────────
  const [errorDraft, setErrorDraft] = useState("");
  const [warningDraft, setWarningDraft] = useState("送信先が未確定です");
  const [countedDraft, setCountedDraft] = useState("最大 120 文字まで入力できます");

  // ── Card 6: mentions ──────────────────────────────────────────────────────────────────────
  const [mentionDraft, setMentionDraft] = useState("");

  return (
    <AppShell
      sidebar={
        <Sidebar
          activeId="chat"
          sections={sections}
          onSelect={() => {}}
          product={{ name: "CoreDesk", role: "アシスタント", color: "hsl(var(--primary))" }}
        />
      }
      topbar={
        <Topbar
          start={
            <Avatar className="rounded-md">
              <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                C
              </AvatarFallback>
            </Avatar>
          }
        />
      }
    >
      <PageContainer
        title="AI アシスタント"
        subtitle="ChatComposer · ChatSuggestion · 送信 / 停止 / スラッシュコマンド / メンション"
        breadcrumb={[{ label: "アシスタント", to: "#" }, { label: "チャット" }]}
      >
        <Flex direction="col" gap="lg">
          {/* ── 1. The real screen ───────────────────────────────────────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle level={2}>経理アシスタント</CardTitle>
              <CardDescription>
                送信すると 2.5 秒間ストリーミングします。その間、送信ボタンは停止ボタンに
                置き換わります（同時に2つは出ません）。「/」でコマンド一覧が開きます。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Flex direction="col" gap="md">
                {messages.map((message) => (
                  <Line key={message.id} message={message} />
                ))}
                {streaming ? (
                  <Badge tone="info">
                    <Sparkles aria-hidden="true" />
                    生成中…
                  </Badge>
                ) : null}
                <ChatSuggestion items={COMMANDS} onValueChange={(value) => setDraft(`/${value} `)}>
                  {({ onTrigger, onKeyDown }) => (
                    <ChatComposer
                      id="assistant-composer"
                      aria-label="アシスタントへのメッセージ"
                      value={draft}
                      onValueChange={(next) => {
                        setDraft(next);
                        onTrigger(next);
                      }}
                      onKeyDown={onKeyDown}
                      onSubmit={send}
                      loading={streaming}
                      onCancel={cancel}
                      placeholder="メッセージを入力"
                      prefix={
                        <Button size="icon-sm" variant="ghost" aria-label="ファイルを添付">
                          <Paperclip aria-hidden="true" />
                        </Button>
                      }
                      footer={
                        <Text size="xs" tone="muted">
                          Enter で送信 · Shift + Enter で改行
                        </Text>
                      }
                    />
                  )}
                </ChatSuggestion>
              </Flex>
            </CardContent>
          </Card>

          {/* ── 2. submitType, both values ───────────────────────────────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle level={2}>submitType · どのキーで送るか</CardTitle>
              <CardDescription>
                左は「enter」（既定）、右は「shiftEnter」。日本語変換中の Enter は
                どちらでも送信になりません。最後に送信された文面：{lastSent}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveGrid columns={{ base: 1, md: 2 }} gap="md">
                <ChatComposer
                  aria-label="Enter で送信するメッセージ"
                  submitType="enter"
                  value={enterDraft}
                  onValueChange={setEnterDraft}
                  onSubmit={(text) => {
                    setLastSent(text);
                    setEnterDraft("");
                  }}
                  footer={
                    <Text size="xs" tone="muted">
                      Enter で送信 · Shift + Enter で改行
                    </Text>
                  }
                />
                <ChatComposer
                  aria-label="Shift + Enter で送信するメッセージ"
                  submitType="shiftEnter"
                  value={shiftDraft}
                  onValueChange={setShiftDraft}
                  onSubmit={(text) => {
                    setLastSent(text);
                    setShiftDraft("");
                  }}
                  footer={
                    <Text size="xs" tone="muted">
                      Shift + Enter で送信 · Enter で改行
                    </Text>
                  }
                />
              </ResponsiveGrid>
            </CardContent>
          </Card>

          {/* ── 3. Every size step ───────────────────────────────────────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle level={2}>size · xs / sm / md / lg</CardTitle>
              <CardDescription>
                size は --control-height の段位を切り替えます。送信ボタンの一辺と、下書き欄の
                下限（1行ぶん）・上限（その5倍）がこの段位から決まります。上限を超えると枠は
                伸びず、下書き欄の中でスクロールします。1行だけの状態では下限より本文の行の高さ
                が勝つため、枠の高さは4段とも同じです。これは Textarea と同じ挙動です。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Flex direction="col" gap="md">
                {(["xs", "sm", "md", "lg"] as const).map((step) => (
                  <ChatComposer
                    key={step}
                    size={step}
                    aria-label={`size ${step} のメッセージ`}
                    value={sizeDrafts[step]}
                    onValueChange={(next) =>
                      setSizeDrafts((current) => ({ ...current, [step]: next }))
                    }
                    placeholder={`size="${step}"`}
                  />
                ))}
              </Flex>
            </CardContent>
          </Card>

          {/* ── 4. Every slot ────────────────────────────────────────────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle level={2}>スロット · header / prefix / actions / footer</CardTitle>
              <CardDescription>
                header は入力欄の上、prefix は行頭、actions は送信ボタンの手前、footer は下。
                アイコンだけのボタンには必ずアクセシブル名を付けます。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChatComposer
                aria-label="スロットを全て使ったメッセージ"
                value={slotDraft}
                onValueChange={setSlotDraft}
                header={
                  <Flex direction="row" gap="sm" align="center">
                    <Badge tone="neutral">
                      <Paperclip aria-hidden="true" />
                      見積書_v3.pdf
                    </Badge>
                    <Text size="xs" tone="muted">
                      添付 1件
                    </Text>
                  </Flex>
                }
                prefix={
                  <Button size="icon-sm" variant="ghost" aria-label="ファイルを添付">
                    <Paperclip aria-hidden="true" />
                  </Button>
                }
                actions={
                  <Button size="icon-sm" variant="ghost" aria-label="絵文字を挿入">
                    <Smile aria-hidden="true" />
                  </Button>
                }
                footer={
                  <Text size="xs" tone="muted">
                    社外秘の情報は入力しないでください
                  </Text>
                }
              />
            </CardContent>
          </Card>

          {/* ── 5. Non-default states ────────────────────────────────────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle level={2}>
                状態 · error / warning / disabled / readOnly / maxLength
              </CardTitle>
              <CardDescription>
                status=&quot;error&quot; は色だけでなく aria-invalid も立てます（WCAG 1.4.1）。
                空白だけの下書きでは送信ボタンは無効のまま、名前は保持されます。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Flex direction="col" gap="md">
                <FormField
                  id="error-composer"
                  label="お問い合わせ内容"
                  helper="送信前に内容をご確認ください"
                  error="メッセージを入力してください"
                  required
                >
                  <ChatComposer
                    status="error"
                    value={errorDraft}
                    onValueChange={setErrorDraft}
                    placeholder="必須項目です"
                  />
                </FormField>

                <ChatComposer
                  aria-label="警告状態のメッセージ"
                  status="warning"
                  value={warningDraft}
                  onValueChange={setWarningDraft}
                  footer={
                    <Text size="xs" tone="muted">
                      送信先を選択すると警告は消えます
                    </Text>
                  }
                />

                <ChatComposer
                  aria-label="無効なメッセージ"
                  disabled
                  defaultValue="このスレッドは終了しました"
                />

                <ChatComposer
                  aria-label="読み取り専用のメッセージ"
                  readOnly
                  defaultValue="監査ログのため編集できません"
                />

                <ChatComposer
                  aria-label="文字数制限つきのメッセージ"
                  maxLength={120}
                  value={countedDraft}
                  onValueChange={setCountedDraft}
                  footer={
                    <Text size="xs" tone="muted">
                      {countedDraft.length} / 120
                    </Text>
                  }
                />
              </Flex>
            </CardContent>
          </Card>

          {/* ── 6. ChatSuggestion with a different trigger ───────────────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle level={2}>ChatSuggestion · triggerCharacter=&quot;@&quot;</CardTitle>
              <CardDescription>
                同じコンポーネントで、開くきっかけの文字だけを変えたメンション一覧。
                「@」を単語の先頭で入力すると開き、↑↓ で移動、Enter か Tab で確定、Escape
                で閉じます（入力中の文面は消えません）。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChatSuggestion
                items={MEMBERS}
                triggerCharacter="@"
                onValueChange={(value) => setMentionDraft((current) => `${current}${value} `)}
              >
                {({ onTrigger, onKeyDown }) => (
                  <ChatComposer
                    aria-label="メンション付きのメッセージ"
                    value={mentionDraft}
                    onValueChange={(next) => {
                      setMentionDraft(next);
                      onTrigger(next);
                    }}
                    onKeyDown={onKeyDown}
                    placeholder="「@」でメンバー"
                  />
                )}
              </ChatSuggestion>
            </CardContent>
          </Card>
        </Flex>
      </PageContainer>
    </AppShell>
  );
}
