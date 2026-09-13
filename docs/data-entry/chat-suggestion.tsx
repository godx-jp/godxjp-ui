import { useState } from "react";

import {
  Avatar,
  AvatarFallback,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@godxjp/ui/data-display";
import {
  ChatComposer,
  ChatSuggestion,
  type ChatSuggestionItemProp,
} from "@godxjp/ui/data-entry";
import { Text } from "@godxjp/ui/general";
import {
  AppShell,
  Flex,
  PageContainer,
  Sidebar,
  type SidebarSectionProp,
  Topbar,
} from "@godxjp/ui/layout";
import { AtSign, Bot, Hash, MessageSquare, Settings, Slash, Users } from "lucide-react";

/**
 * ChatSuggestion — the trigger-character list that completes a draft in place.
 *
 * It owns the part `Command` does not: watching a TEXTAREA for a trigger character at the caret,
 * tracking the query as the caret moves, and closing on Escape, on blur and on a word break —
 * while the list itself stays the real `Command` inside a real `Popover`, so the listbox ARIA is
 * cmdk's and not hand-rolled.
 *
 * Every card here is one axis at rest, so the whole API is visible without clicking:
 * `triggerCharacter`, one level of `children`, a disabled row, an empty result, and the
 * open/defaultOpen/onOpenChange triad. `ChatComposer`'s own page shows it wired into a live
 * transcript; this page is about the completion behaviour alone.
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

/** Slash commands — the `template` row carries one level of `children`. */
const COMMANDS: ChatSuggestionItemProp[] = [
  { value: "summarize", label: "要約する", description: "このスレッドを3行で要約します" },
  { value: "translate", label: "翻訳する", description: "英語 ⇄ 日本語" },
  { value: "explain", label: "詳しく説明する" },
  {
    value: "archive",
    label: "アーカイブする",
    description: "権限がないため選択できません",
    disabled: true,
  },
  {
    value: "template",
    label: "テンプレート",
    description: "定型文を挿入します",
    children: [
      { value: "minutes", label: "議事録" },
      { value: "weekly", label: "週報" },
    ],
  },
];

const MEMBERS: ChatSuggestionItemProp[] = [
  { value: "sato", label: "佐藤 花子", description: "経理" },
  { value: "tanaka", label: "田中 太郎", description: "開発" },
  { value: "nguyen", label: "Nguyễn Minh", description: "Design" },
];

const CHANNELS: ChatSuggestionItemProp[] = [
  { value: "general", label: "general", description: "全社アナウンス" },
  { value: "accounting", label: "accounting", description: "経理チーム" },
];

export default function Demo() {
  const [slashDraft, setSlashDraft] = useState("");
  const [mentionDraft, setMentionDraft] = useState("");
  const [channelDraft, setChannelDraft] = useState("");
  const [emptyDraft, setEmptyDraft] = useState("");
  const [controlledDraft, setControlledDraft] = useState("");
  const [controlledOpen, setControlledOpen] = useState(false);

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
        title="入力補完"
        subtitle="ChatSuggestion · トリガー文字 / 階層 / 無効行 / 該当なし / 制御された開閉"
        breadcrumb={[{ label: "アシスタント", to: "#" }, { label: "入力補完" }]}
      >
        <Flex direction="col" gap="lg">
          {/* ── 1. The default trigger, and one level of children ────────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle level={2}>
                <Slash aria-hidden="true" />
                スラッシュコマンド
              </CardTitle>
              <CardDescription>
                「/」を入力すると開きます。「テンプレート」は子を持つので、Enter
                はまだ確定せず一段深く入ります。Escape
                は閉じるだけで、入力済みの文字はそのまま残ります。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChatSuggestion
                items={COMMANDS}
                onValueChange={(value) => setSlashDraft(`/${value} `)}
              >
                {({ onTrigger, onKeyDown }) => (
                  <ChatComposer
                    id="slash-composer"
                    aria-label="スラッシュコマンドを試す"
                    value={slashDraft}
                    onValueChange={(next) => {
                      setSlashDraft(next);
                      onTrigger(next);
                    }}
                    onKeyDown={onKeyDown}
                    onSubmit={() => setSlashDraft("")}
                    placeholder="「/」でコマンド一覧"
                  />
                )}
              </ChatSuggestion>
            </CardContent>
          </Card>

          {/* ── 2. triggerCharacter="@" ──────────────────────────────────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle level={2}>
                <AtSign aria-hidden="true" />
                triggerCharacter=&quot;@&quot;
              </CardTitle>
              <CardDescription>
                トリガー文字は差し替えられます。1つの入力欄に対して1つの
                ChatSuggestion。2種類を同時に見張るのではなく、用途ごとに別の欄にします。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChatSuggestion
                items={MEMBERS}
                triggerCharacter="@"
                onValueChange={(value) => setMentionDraft(`@${value} `)}
              >
                {({ onTrigger, onKeyDown }) => (
                  <ChatComposer
                    id="mention-composer"
                    aria-label="メンバーをメンション"
                    value={mentionDraft}
                    onValueChange={(next) => {
                      setMentionDraft(next);
                      onTrigger(next);
                    }}
                    onKeyDown={onKeyDown}
                    onSubmit={() => setMentionDraft("")}
                    placeholder="「@」でメンバー一覧"
                  />
                )}
              </ChatSuggestion>
            </CardContent>
          </Card>

          {/* ── 3. triggerCharacter="#" ──────────────────────────────────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle level={2}>
                <Hash aria-hidden="true" />
                triggerCharacter=&quot;#&quot;
              </CardTitle>
              <CardDescription>チャンネル参照。項目が少なくても扱いは同じです。</CardDescription>
            </CardHeader>
            <CardContent>
              <ChatSuggestion
                items={CHANNELS}
                triggerCharacter="#"
                onValueChange={(value) => setChannelDraft(`#${value} `)}
              >
                {({ onTrigger, onKeyDown }) => (
                  <ChatComposer
                    id="channel-composer"
                    aria-label="チャンネルを参照"
                    value={channelDraft}
                    onValueChange={(next) => {
                      setChannelDraft(next);
                      onTrigger(next);
                    }}
                    onKeyDown={onKeyDown}
                    onSubmit={() => setChannelDraft("")}
                    placeholder="「#」でチャンネル一覧"
                    size="sm"
                  />
                )}
              </ChatSuggestion>
            </CardContent>
          </Card>

          {/* ── 4. No items — the empty state is the component's, not the caller's ───────── */}
          <Card>
            <CardHeader>
              <CardTitle level={2}>該当なし</CardTitle>
              <CardDescription>
                候補が0件でもパネルは開き、件数は読み上げ用の status
                で通知されます。空の list を黙って閉じると、利用者には「効かない」ように見えます。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChatSuggestion items={[]} onValueChange={() => {}}>
                {({ onTrigger, onKeyDown }) => (
                  <ChatComposer
                    id="empty-composer"
                    aria-label="候補が0件の例"
                    value={emptyDraft}
                    onValueChange={(next) => {
                      setEmptyDraft(next);
                      onTrigger(next);
                    }}
                    onKeyDown={onKeyDown}
                    onSubmit={() => setEmptyDraft("")}
                    placeholder="「/」を押しても候補はありません"
                  />
                )}
              </ChatSuggestion>
            </CardContent>
          </Card>

          {/* ── 5. open / onOpenChange — the controlled triad ────────────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle level={2}>open · onOpenChange</CardTitle>
              <CardDescription>
                開閉も制御できます。下の行は現在の状態をそのまま映したもので、
                トリガー文字・Escape・語の区切りのいずれでも同じ値が動きます。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Flex direction="col" gap="sm">
                <ChatSuggestion
                  items={COMMANDS}
                  open={controlledOpen}
                  onOpenChange={setControlledOpen}
                  onValueChange={(value) => setControlledDraft(`/${value} `)}
                >
                  {({ onTrigger, onKeyDown }) => (
                    <ChatComposer
                      id="controlled-composer"
                      aria-label="開閉を制御した例"
                      value={controlledDraft}
                      onValueChange={(next) => {
                        setControlledDraft(next);
                        onTrigger(next);
                      }}
                      onKeyDown={onKeyDown}
                      onSubmit={() => setControlledDraft("")}
                      placeholder="「/」で開き、Escape で閉じます"
                    />
                  )}
                </ChatSuggestion>
                <Text size="xs" tone="muted">
                  open = {controlledOpen ? "true" : "false"}
                </Text>
              </Flex>
            </CardContent>
          </Card>
        </Flex>
      </PageContainer>
    </AppShell>
  );
}
