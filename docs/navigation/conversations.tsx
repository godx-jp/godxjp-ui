import { useState } from "react";

import { ChatBubbleList, type ChatMessageProp } from "@godxjp/ui/data-display";
import { ChatComposer } from "@godxjp/ui/data-entry";
import { Text } from "@godxjp/ui/general";
import {
  AppShell,
  Flex,
  MasterDetail,
  PageContainer,
  Sidebar,
  type SidebarSectionProp,
  Topbar,
} from "@godxjp/ui/layout";
import { Conversations, type ConversationsEntryProp } from "@godxjp/ui/navigation";
import { Bot, MessageSquare, Pencil, Settings, Trash2, Users } from "lucide-react";

/**
 * Conversations — the session rail of a chat surface (Ant Design X `Conversations`).
 *
 * This page is the whole surface gh#559 is about: the rail on the left, the feed and the composer
 * on the right. They were shipped one half at a time, and the missing half is why every consumer
 * hand-rolled a stack of full-width Buttons — one tab stop per conversation, no per-row menu, no
 * recency buckets.
 *
 * The three cards below are one axis each, at rest, so the API is visible without clicking:
 * the live surface, the recency buckets (`groupable`), and the flat rail with a divider and a
 * disabled row. Composed only from real @godxjp/ui components.
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

/** The rail's data, bucketed by recency — the `group` field is what `groupable` reads. */
const HISTORY: ConversationsEntryProp[] = [
  { key: "invoice", label: "請求書の下書きを直す", group: "今日" },
  { key: "expense", label: "経費精算の規則をまとめる", group: "今日" },
  { key: "travel", label: "出張手当の確認", group: "過去7日間" },
  { key: "onboarding", label: "入社手続きのチェックリスト", group: "過去7日間" },
  { key: "payroll", label: "給与計算の締め日について", group: "それ以前" },
];

/** A flat rail — no buckets, one rule, one archived row. */
const FLAT: ConversationsEntryProp[] = [
  { key: "invoice", label: "請求書の下書きを直す", icon: <MessageSquare /> },
  { key: "expense", label: "経費精算の規則をまとめる", icon: <MessageSquare /> },
  { type: "divider", key: "rule" },
  { key: "archived", label: "アーカイブ済みの相談", icon: <MessageSquare />, disabled: true },
];

const TRANSCRIPT: Record<string, ChatMessageProp[]> = {
  invoice: [
    { id: "m1", role: "user", content: "先月分の請求書の下書きを直したいです。" },
    {
      id: "m2",
      role: "assistant",
      content: "差分は3件でした。金額、支払期日、宛名のうちどれから直しますか。",
    },
  ],
  expense: [
    { id: "m1", role: "user", content: "経費精算の規則を3行でまとめてください。" },
    {
      id: "m2",
      role: "assistant",
      content: "領収書は原本、申請は当月末まで、3万円以上は事前承認が要ります。",
    },
  ],
};

export default function ConversationsDoc() {
  const [active, setActive] = useState("invoice");
  const [draft, setDraft] = useState("");

  const menu = {
    items: [
      { key: "rename", label: "名前を変更", icon: <Pencil /> },
      { key: "delete", label: "削除", icon: <Trash2 />, danger: true },
    ],
  };

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
      topbar={<Topbar />}
    >
      <PageContainer
        title="会話の履歴"
        subtitle="過去の会話を選び、名前を変更し、不要になったものを消す · チャット面の左半分。"
      >
        {/* THE SURFACE. The rail is the master; the feed and the composer are the detail. */}
        <MasterDetail
          rail="master"
          railWidth="compact"
          masterViewport="compact"
          masterLabel="会話の履歴"
          detailLabel="選択中の会話"
          detailId="assistant-transcript"
          master={
            <Conversations
              label="会話の履歴"
              items={HISTORY}
              activeKey={active}
              onActiveChange={setActive}
              groupable={{ collapsible: true }}
              creation={{ label: "新しい会話", onClick: () => setActive("invoice") }}
              menu={menu}
            />
          }
        >
          <Flex direction="col" gap="md">
            <ChatBubbleList
              label="会話"
              className="h-96"
              items={TRANSCRIPT[active] ?? []}
              roles={{
                assistant: { placement: "start", variant: "filled" },
                user: { placement: "end" },
              }}
            />
            <ChatComposer
              aria-label="メッセージ"
              value={draft}
              onValueChange={setDraft}
              onSubmit={() => setDraft("")}
              placeholder="メッセージを入力"
            />
          </Flex>
        </MasterDetail>

        {/* BUCKETS, EXPANDED. `groupable` with no options groups but never collapses. */}
        <Flex direction="col" gap="sm">
          <Text size="sm" weight="medium">
            recency buckets · groupable
          </Text>
          <Text size="xs" tone="muted">
            バケットの見出しは同じローヴィング順に入るので、畳む操作もレールを離れずに届く。
          </Text>
          <Conversations
            label="会話の履歴（分類のみ）"
            items={HISTORY}
            defaultActiveKey="travel"
            groupable
            menu={menu}
          />
        </Flex>

        {/* FLAT, WITH A RULE AND A DISABLED ROW. */}
        <Flex direction="col" gap="sm">
          <Text size="sm" weight="medium">
            flat rail · divider and a disabled row
          </Text>
          <Text size="xs" tone="muted">
            無効な行は見えるが選べず、矢印キーの巡回からも外れる。無効なコントロールは
            フォーカスを受け取らないため。
          </Text>
          <Conversations label="会話の履歴（フラット）" items={FLAT} defaultActiveKey="invoice" />
        </Flex>
      </PageContainer>
    </AppShell>
  );
}
