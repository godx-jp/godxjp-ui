import type { Meta, StoryObj } from "@storybook/react";
import { Separator } from "../../components/data-display/Separator";
import { Flex } from "../../components/layout";
import { Typography } from "../../components/general/Typography";

const { Text } = Typography;

/**
 * data-display/Separator — Radix-backed divider.
 *
 * Documented props (per `Separator.tsx`):
 *   orientation?: "horizontal" | "vertical"   default "horizontal"
 *   decorative?:  boolean                      default true (ARIA hidden)
 *
 * Maps to the canonical `.divider` style in tokens.css for horizontal,
 * inline 1px var(--border) for vertical. Per cardinal rule 25 stories
 * exercise the documented API — visual contract lives in tokens.
 */

const meta: Meta<typeof Separator> = {
  title: "Data Display/Separator",
  component: Separator,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
**Separator** — Radix-backed horizontal / vertical divider. ARIA
\`role="separator"\` (or hidden when \`decorative\`). Visual contract
pinned to \`.divider\` for horizontal and a 1px \`var(--border)\` rule
for vertical.
        `.trim(),
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Separator>;

// ─── Default — horizontal divider ────────────────────────────────

export const Default: Story = {
  name: "Default · horizontal",
  render: () => (
    <Flex vertical gap="middle" style={{ maxWidth: 360 }}>
      <Text>渋谷本店 · 田中 美咲</Text>
      <Separator />
      <Text>新宿支店 · 佐藤 健太</Text>
    </Flex>
  ),
};

// ─── Vertical — inline divider between flex children ─────────────

export const Vertical: Story = {
  name: "Vertical · inline divider between flex items",
  render: () => (
    <Flex
      align="center"
      gap="middle"
      style={{ height: 24, maxWidth: 360 }}
    >
      <Text>渋谷本店</Text>
      <Separator orientation="vertical" />
      <Text>店長 田中 美咲</Text>
      <Separator orientation="vertical" />
      <Text className="muted">24 名</Text>
    </Flex>
  ),
};

// ─── Inline — between paragraph fragments ────────────────────────

export const Inline: Story = {
  name: "Inline · separates two text blocks",
  render: () => (
    <Flex vertical gap="small" style={{ maxWidth: 480 }}>
      <Text>シフトを提出すると、店長 田中 美咲 さんに通知されます。</Text>
      <Separator />
      <Text className="muted">
        承認後は変更できません。修正が必要な場合は店長へ連絡してください。
      </Text>
    </Flex>
  ),
};

// ─── WithLabel — centered label using flex + two separators ──────

export const WithLabel: Story = {
  name: "WithLabel · centered text framed by two separators",
  render: () => (
    <Flex align="center" gap="small" style={{ maxWidth: 360 }}>
      <Separator style={{ flex: 1 }} />
      <Text className="muted">または</Text>
      <Separator style={{ flex: 1 }} />
    </Flex>
  ),
};
