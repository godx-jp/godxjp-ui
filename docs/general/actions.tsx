import { useState } from "react";

import { ChatBubble } from "@godxjp/ui/data-display";
import {
  Actions,
  ActionsCopy,
  ActionsFeedback,
  ActionsItem,
  type ActionsFeedbackValueProp,
  Text,
} from "@godxjp/ui/general";
import {
  AppShell,
  Flex,
  PageContainer,
  Sidebar,
  type SidebarSectionProp,
  Topbar,
} from "@godxjp/ui/layout";
import {
  Bot,
  Flag,
  MessageSquare,
  RefreshCw,
  Settings,
  Share2,
  Users,
  Volume2,
} from "lucide-react";

/**
 * Actions — the strip of actions under an assistant message (Ant Design X `Actions`).
 *
 * Every card is one axis at rest. The first shows the strip where it belongs, under a real
 * `ChatBubble`; the rest are the three variants, the `subItems` menu, the four `ActionsItem`
 * statuses, and the two ready-made actions (`ActionsCopy`, `ActionsFeedback`).
 *
 * The strip is a WAI-ARIA toolbar: one Tab reaches it, the arrows move inside it. Ant X's own
 * strip is a row of `<div onClick>` and cannot be reached from the keyboard at all.
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

const ANSWER = "差分は3件でした。金額、支払期日、宛名のうちどれから直しますか。";

export default function ActionsDoc() {
  const [vote, setVote] = useState<ActionsFeedbackValueProp>("default");
  const [log, setLog] = useState("まだ何も押されていません。");

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
        title="回答の操作"
        subtitle="Actions · 一つの回答にぶら下がる操作の帯。Tab は一回、中は矢印キー。"
      >
        {/* WHERE IT BELONGS: under the answer it acts on. */}
        <Flex direction="col" gap="sm">
          <Text size="sm" weight="medium">
            in place · 回答の下
          </Text>
          <ChatBubble placement="start" variant="filled">
            {ANSWER}
          </ChatBubble>
          <Actions
            label="回答の操作"
            items={[
              { key: "retry", label: "やり直す", icon: <RefreshCw /> },
              { key: "copy", actionRender: <ActionsCopy text={ANSWER} /> },
              {
                key: "feedback",
                actionRender: <ActionsFeedback value={vote} onChange={setVote} />,
              },
              {
                key: "more",
                label: "その他",
                subItems: [
                  { key: "share", label: "共有", icon: <Share2 /> },
                  { key: "report", label: "報告", icon: <Flag />, danger: true },
                ],
              },
            ]}
            onClick={({ key, keyPath }) => setLog(`${key} — keyPath: ${keyPath.join(" ← ")}`)}
          />
          <Text size="xs" tone="muted">
            {log}
          </Text>
        </Flex>

        {/* THE THREE VARIANTS. */}
        <Flex direction="col" gap="sm">
          <Text size="sm" weight="medium">
            variant · borderless · filled · outlined
          </Text>
          <Actions
            label="borderless の例"
            variant="borderless"
            items={[
              { key: "a", label: "やり直す", icon: <RefreshCw /> },
              { key: "b", label: "共有", icon: <Share2 /> },
            ]}
          />
          <Actions
            label="filled の例"
            variant="filled"
            items={[
              { key: "a", label: "やり直す", icon: <RefreshCw /> },
              { key: "b", label: "共有", icon: <Share2 /> },
            ]}
          />
          <Actions
            label="outlined の例"
            variant="outlined"
            items={[
              { key: "a", label: "やり直す", icon: <RefreshCw /> },
              { key: "b", label: "共有", icon: <Share2 /> },
            ]}
          />
        </Flex>

        {/* ACTIONSITEM — the four statuses, side by side. */}
        <Flex direction="col" gap="sm">
          <Text size="sm" weight="medium">
            ActionsItem · status
          </Text>
          <Text size="xs" tone="muted">
            状態は字にもなる。読み上げのボタン名に「実行中」「失敗」が入るので、
            アイコンの差し替えだけに頼らない。
          </Text>
          <Flex gap="sm">
            <ActionsItem defaultIcon={<Volume2 />} label="読み上げ" />
            <ActionsItem defaultIcon={<Volume2 />} label="読み上げ" status="running" />
            <ActionsItem defaultIcon={<Volume2 />} label="読み上げ" status="loading" />
            <ActionsItem defaultIcon={<Volume2 />} label="読み上げ" status="error" />
          </Flex>
        </Flex>

        {/* THE TWO READY-MADE ACTIONS, alone. */}
        <Flex direction="col" gap="sm">
          <Text size="sm" weight="medium">
            ActionsCopy · ActionsFeedback
          </Text>
          <Text size="xs" tone="muted">
            どちらも両方のボタンが画面に残る。押した側は aria-pressed
            で示され、押していない側が消えることはない。
          </Text>
          <Flex gap="sm">
            <ActionsCopy text={ANSWER} />
            <ActionsFeedback value={vote} onChange={setVote} />
          </Flex>
        </Flex>
      </PageContainer>
    </AppShell>
  );
}
