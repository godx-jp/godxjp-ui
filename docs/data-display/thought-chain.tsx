import { useState } from "react";

import { ChatBubble, ThoughtChain, ThoughtChainItem } from "@godxjp/ui/data-display";
import { Text } from "@godxjp/ui/general";
import {
  AppShell,
  Flex,
  PageContainer,
  Sidebar,
  type SidebarSectionProp,
  Topbar,
} from "@godxjp/ui/layout";
import { Bot, MessageSquare, Search, Settings, Users } from "lucide-react";

/**
 * ThoughtChain — the assistant's reasoning, step by step (Ant Design X `ThoughtChain`).
 *
 * Each card is one axis at rest: the chain as it appears above an answer, the four statuses, the
 * three connector strokes, and the standalone `ThoughtChainItem` chip in its three variants.
 *
 * The step that collapses is a real disclosure button, so this page is drivable from the keyboard
 * alone; Ant X's own step is a `<div onClick>`.
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

export default function ThoughtChainDoc() {
  const [open, setOpen] = useState<string[]>(["search"]);

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
        title="思考の手順"
        subtitle="ThoughtChain · 回答の前に何をしたのか。畳める手順は本物の開閉ボタン。"
      >
        {/* IN PLACE: above the answer it explains. */}
        <Flex direction="col" gap="sm">
          <Text size="sm" weight="medium">
            in place · 回答の前
          </Text>
          <ThoughtChain
            label="思考の手順"
            expandedKeys={open}
            onExpand={setOpen}
            items={[
              {
                key: "read",
                title: "添付の請求書を読む",
                description: "3件",
                status: "success",
              },
              {
                key: "search",
                title: "社内規程を検索",
                description: "「支払期日」",
                status: "success",
                collapsible: true,
                content: (
                  <Text size="xs" tone="muted">
                    第4章 支払 — 請求書の支払期日は受領月の翌月末日とする。
                  </Text>
                ),
              },
              {
                key: "write",
                title: "差分をまとめる",
                status: "loading",
                blink: true,
              },
            ]}
          />
          <ChatBubble placement="start" variant="filled">
            差分は3件でした。金額、支払期日、宛名のうちどれから直しますか。
          </ChatBubble>
        </Flex>

        {/* THE FOUR STATUSES. */}
        <Flex direction="col" gap="sm">
          <Text size="sm" weight="medium">
            status · loading · success · error · abort
          </Text>
          <Text size="xs" tone="muted">
            状態は字にもなる。読み上げでは各手順のあとに「完了」「失敗」などが続く。
          </Text>
          <ThoughtChain
            label="状態の一覧"
            items={[
              { key: "a", title: "実行中の手順", status: "loading" },
              { key: "b", title: "終わった手順", status: "success" },
              { key: "c", title: "失敗した手順", status: "error" },
              { key: "d", title: "中断した手順", status: "abort" },
            ]}
          />
        </Flex>

        {/* THE CONNECTOR. */}
        <Flex direction="col" gap="sm">
          <Text size="sm" weight="medium">
            line · solid · dashed · none
          </Text>
          <ThoughtChain
            label="実線"
            line="solid"
            items={[
              { key: "a", title: "一歩目" },
              { key: "b", title: "二歩目" },
            ]}
          />
          <ThoughtChain
            label="破線"
            line="dashed"
            items={[
              { key: "a", title: "一歩目" },
              { key: "b", title: "二歩目" },
            ]}
          />
          <ThoughtChain
            label="線なし"
            line={false}
            items={[
              { key: "a", title: "一歩目" },
              { key: "b", title: "二歩目" },
            ]}
          />
        </Flex>

        {/* THE STANDALONE CHIP. */}
        <Flex direction="col" gap="sm">
          <Text size="sm" weight="medium">
            ThoughtChainItem · solid · outlined · text
          </Text>
          <Text size="xs" tone="muted">
            押せる手順は本物のボタンとして描かれる。押せないものは div のまま。要素が実体に従う。
          </Text>
          <Flex gap="sm">
            <ThoughtChainItem
              variant="solid"
              icon={<Search />}
              title="社内規程を検索"
              description="3件ヒット"
              status="success"
            />
            <ThoughtChainItem variant="outlined" icon={<Search />} title="再検索" />
            <ThoughtChainItem
              variant="text"
              icon={<Search />}
              title="詳細を見る"
              onClick={() => setOpen(["search"])}
            />
          </Flex>
        </Flex>
      </PageContainer>
    </AppShell>
  );
}
