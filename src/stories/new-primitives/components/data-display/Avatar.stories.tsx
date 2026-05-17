import type { Meta, StoryObj } from "@storybook/react";
import { Avatar } from "../../../../components/data-display/Avatar";
import { Flex } from "../../../../components/layout";

/**
 * new-primitives/components/data-display/Avatar — Ant-shaped avatar.
 *
 * Documented props (per `Avatar.tsx`):
 *   shape?:   "circle" | "square"
 *   size?:    "xs" | "sm" | "default" | "lg" | "xl" | number
 *   src?:     string                      image URL (wins over icon / children)
 *   alt?:     string
 *   icon?:    ReactNode                   wins over children when src unset
 *   name?:    string                      derived to 2-char initials fallback
 *   color?:   string                      background tint (any CSS colour)
 *   textColor?: string
 *   variant?: "default" | "brand"
 *
 * Stories use ONLY these documented props per cardinal rule 25 — the
 * primitive owns the visual contract. Initial / image / icon fall-back
 * chain matches `Avatar.tsx`.
 */

const meta: Meta<typeof Avatar> = {
  title: "new-primitives/Components/Data Display/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
**Avatar** — Ant-Design-shaped avatar primitive.

Five named sizes (\`xs / sm / default / lg / xl\`) plus arbitrary
\`number\` for one-off cases. Two shapes (\`circle\` / \`square\`).
Content fall-back chain: \`src\` → \`icon\` → \`children\` → initials
derived from \`name\`.

Per cardinal rule 23 §B the prop axis is \`size\` (dimensional scale)
and \`shape\` (geometry); colour is a free-form CSS string so callers
can paint role-coded initials without coining a new enum.
        `.trim(),
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Avatar>;

// ─── Default — initials fallback ────────────────────────────────

export const Default: Story = {
  name: "Default · initials from `name`",
  render: () => (
    <Flex gap="middle" align="center">
      <Avatar name="田中 美咲" />
      <Avatar name="佐藤 健太" />
      <Avatar name="鈴木 さくら" />
      <Avatar name="Satoshi F" />
    </Flex>
  ),
};

// ─── With image ─────────────────────────────────────────────────

export const WithImage: Story = {
  name: "WithImage · `src` wins over fallback chain",
  render: () => (
    <Flex gap="middle" align="center">
      <Avatar
        src="https://i.pravatar.cc/96?img=12"
        alt="田中 美咲"
        name="田中 美咲"
      />
      <Avatar
        src="https://i.pravatar.cc/96?img=33"
        alt="佐藤 健太"
        name="佐藤 健太"
      />
      <Avatar
        src="https://i.pravatar.cc/96?img=47"
        alt="鈴木 さくら"
        name="鈴木 さくら"
      />
    </Flex>
  ),
};

// ─── Sizes ──────────────────────────────────────────────────────

export const Sizes: Story = {
  name: "Sizes · xs · sm · default · lg · xl",
  render: () => (
    <Flex gap="middle" align="center">
      <Avatar size="xs" name="田中 美咲" />
      <Avatar size="sm" name="田中 美咲" />
      <Avatar size="default" name="田中 美咲" />
      <Avatar size="lg" name="田中 美咲" />
      <Avatar size="xl" name="田中 美咲" />
    </Flex>
  ),
};

// ─── Shapes ─────────────────────────────────────────────────────

export const Shapes: Story = {
  name: "Shapes · circle · square",
  render: () => (
    <Flex gap="middle" align="center">
      <Avatar shape="circle" size="lg" name="渋谷本店" />
      <Avatar shape="square" size="lg" name="渋谷本店" />
      <Avatar
        shape="circle"
        size="lg"
        src="https://i.pravatar.cc/96?img=15"
        alt="渋谷本店"
      />
      <Avatar
        shape="square"
        size="lg"
        src="https://i.pravatar.cc/96?img=15"
        alt="渋谷本店"
      />
    </Flex>
  ),
};

// ─── Colors — semantic role tint via free-form CSS color prop ───

export const Colors: Story = {
  name: "Colors · semantic role tint",
  render: () => (
    <Flex gap="middle" align="center" wrap>
      <Avatar
        size="lg"
        name="田中 美咲"
        color="var(--primary)"
        textColor="var(--primary-foreground)"
      />
      <Avatar
        size="lg"
        name="佐藤 健太"
        color="var(--success)"
        textColor="var(--primary-foreground)"
      />
      <Avatar
        size="lg"
        name="鈴木 さくら"
        color="var(--warning)"
        textColor="var(--primary-foreground)"
      />
      <Avatar
        size="lg"
        name="高橋 蓮"
        color="var(--destructive)"
        textColor="var(--primary-foreground)"
      />
      <Avatar
        size="lg"
        name="伊藤 葵"
        color="var(--info)"
        textColor="var(--primary-foreground)"
      />
      <Avatar size="lg" variant="brand" name="渋谷本店" />
    </Flex>
  ),
};
