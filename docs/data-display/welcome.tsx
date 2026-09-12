import { useState } from "react";

import { Welcome } from "@godxjp/ui/data-display";
import { Button, Text } from "@godxjp/ui/general";
import {
  AppShell,
  Flex,
  PageContainer,
  Sidebar,
  type SidebarSectionProp,
  Topbar,
} from "@godxjp/ui/layout";
import { Bot, MessageSquare, Settings, Sparkles, Users } from "lucide-react";

/**
 * Welcome — the greeting block at the head of an empty conversation (Ant Design X `Welcome`).
 *
 * It is the first thing an assistant says, so every slot on this page is one Ant X slot at rest:
 * the full block, the two variants, the block with no glyph, and the `icon`-as-URL rule that Ant
 * ports from a string beginning with `http`.
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

export default function WelcomeDoc() {
  const [dismissed, setDismissed] = useState(false);

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
        title="あいさつ"
        subtitle="Welcome · 会話がまだ一件もない画面の先頭に置く四つのスロット"
      >
        {/* THE WHOLE BLOCK. `extra` sits on the title row, which is the placement a hand-roll
            usually gets wrong (it lands under the description instead). */}
        <Flex direction="col" gap="sm">
          <Text size="sm" weight="medium">
            icon · title · description · extra
          </Text>
          {dismissed ? (
            <Text size="xs" tone="muted">
              閉じました。
            </Text>
          ) : (
            <Welcome
              icon={<Sparkles />}
              title="こんにちは、何からはじめますか"
              description="請求、経費、勤怠のことならお手伝いできます。左の履歴から続きを開くこともできます。"
              extra={
                <Button variant="ghost" size="sm" onClick={() => setDismissed(true)}>
                  閉じる
                </Button>
              }
            />
          )}
        </Flex>

        {/* THE TWO VARIANTS, side by side. */}
        <Flex direction="col" gap="sm">
          <Text size="sm" weight="medium">
            variant · filled と borderless
          </Text>
          <Welcome
            variant="filled"
            icon={<Bot />}
            title="filled"
            description="自分の地色と髪の毛一本分の境界を持つ。カードの中に置いても沈まない。"
          />
          <Welcome
            variant="borderless"
            icon={<Bot />}
            title="borderless"
            description="ページの地の上にそのまま置く。上下に他の要素が続くときはこちら。"
          />
        </Flex>

        {/* NO GLYPH, AND AN IMAGE GLYPH. */}
        <Flex direction="col" gap="sm">
          <Text size="sm" weight="medium">
            icon · 省略と URL
          </Text>
          <Welcome
            title="アイコンなし"
            description="スロットを渡さなければ、その列自体が出ない。"
          />
          <Text size="xs" tone="muted">
            http で始まる文字列は装飾画像として描かれる（Ant Design X と同じ規則、ただし alt
            は空）。
          </Text>
        </Flex>
      </PageContainer>
    </AppShell>
  );
}
