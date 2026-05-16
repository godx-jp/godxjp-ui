import type { Meta, StoryObj } from "@storybook/react";
import { TrendingUp } from "lucide-react";
import { Descriptions } from "../components/primitives/Descriptions";
import { Tag } from "../components/primitives/Tag";
import { Badge } from "../components/primitives/Badge";
import { Avatar } from "../components/primitives/Avatar";
import { Statistic } from "../components/primitives/Statistic";
import { Button } from "../components/primitives/Button";
import { Card } from "../components/primitives/Card";
import { Flex } from "../components/primitives/layout";

/**
 * Descriptions — Ant-Design label/value table for static info.
 *
 * Composed of `<Descriptions>` + `<Descriptions.Item label=…>…</Descriptions.Item>`.
 *
 * Props on the root:
 * - **title** / **extra** — header slot.
 * - **column** — number of columns (1..6, default 3).
 * - **layout** — `horizontal` (default, label inline-left) or `vertical` (label above).
 * - **bordered** — show outer + inner borders.
 * - **size** — `small` / `default` / `large` (density step).
 *
 * Item props:
 * - **label** — left/top label node.
 * - **span** — how many columns this item spans (default 1).
 *
 * Where it fits: profile-page field summaries, settings panels, audit
 * detail drawers, anywhere a label → value table is the right shape.
 */
const meta: Meta<typeof Descriptions> = {
  title: "Primitives/Descriptions",
  component: Descriptions,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Label/value grid for static info. Composes naturally with " +
          "Tag (status), Avatar (identity), Statistic (KPIs inside an " +
          "item), and Button (action in an item value).",
      },
    },
  },
  argTypes: {
    title: { control: { type: "text" } },
    column: { control: { type: "number", min: 1, max: 6 } },
    layout: { control: { type: "inline-radio" }, options: ["horizontal", "vertical"] },
    bordered: { control: { type: "boolean" } },
    size: { control: { type: "inline-radio" }, options: ["small", "default", "large"] },
  },
};
export default meta;
type Story = StoryObj<typeof Descriptions>;

// ---------------------------------------------------------------------------
// Playground
// ---------------------------------------------------------------------------

export const Playground: Story = {
  args: {
    title: "User info",
    column: 2,
    layout: "horizontal",
    bordered: false,
    size: "default",
  },
  render: (args) => (
    <Descriptions {...args}>
      <Descriptions.Item label="Name">Yuki Tanaka</Descriptions.Item>
      <Descriptions.Item label="Email">yuki@example.com</Descriptions.Item>
      <Descriptions.Item label="Locale">ja-JP</Descriptions.Item>
      <Descriptions.Item label="Timezone">Asia/Tokyo</Descriptions.Item>
      <Descriptions.Item label="Role" span={2}>Owner · Operations</Descriptions.Item>
    </Descriptions>
  ),
};

// ---------------------------------------------------------------------------
// Layout — horizontal vs vertical
// ---------------------------------------------------------------------------

export const LayoutHorizontal: Story = {
  name: "Layout — horizontal",
  render: () => (
    <Descriptions title="User info" layout="horizontal" column={2}>
      <Descriptions.Item label="Name">Yuki Tanaka</Descriptions.Item>
      <Descriptions.Item label="Email">yuki@example.com</Descriptions.Item>
      <Descriptions.Item label="Locale">ja-JP</Descriptions.Item>
      <Descriptions.Item label="Timezone">Asia/Tokyo</Descriptions.Item>
    </Descriptions>
  ),
};

export const LayoutVertical: Story = {
  name: "Layout — vertical",
  render: () => (
    <Descriptions title="User info" layout="vertical" column={3}>
      <Descriptions.Item label="Name">Yuki Tanaka</Descriptions.Item>
      <Descriptions.Item label="Email">yuki@example.com</Descriptions.Item>
      <Descriptions.Item label="Locale">ja-JP</Descriptions.Item>
      <Descriptions.Item label="Timezone">Asia/Tokyo</Descriptions.Item>
      <Descriptions.Item label="Joined">2024-04-01</Descriptions.Item>
      <Descriptions.Item label="Account type">human</Descriptions.Item>
    </Descriptions>
  ),
};

// ---------------------------------------------------------------------------
// Bordered
// ---------------------------------------------------------------------------

export const Bordered: Story = {
  render: () => (
    <Descriptions title="Billing" bordered column={2}>
      <Descriptions.Item label="Plan">Pro</Descriptions.Item>
      <Descriptions.Item label="Billed">Monthly</Descriptions.Item>
      <Descriptions.Item label="Amount">¥9,800</Descriptions.Item>
      <Descriptions.Item label="Next charge">2026-06-01</Descriptions.Item>
      <Descriptions.Item label="Payment method" span={2}>
        Visa •••• 4242
      </Descriptions.Item>
    </Descriptions>
  ),
};

export const BorderedVertical: Story = {
  name: "Bordered — vertical",
  render: () => (
    <Descriptions title="Billing" bordered layout="vertical" column={4}>
      <Descriptions.Item label="Plan">Pro</Descriptions.Item>
      <Descriptions.Item label="Billed">Monthly</Descriptions.Item>
      <Descriptions.Item label="Amount">¥9,800</Descriptions.Item>
      <Descriptions.Item label="Next charge">2026-06-01</Descriptions.Item>
    </Descriptions>
  ),
};

// ---------------------------------------------------------------------------
// Sizes
// ---------------------------------------------------------------------------

export const SizeSmall: Story = {
  name: "Size — small",
  render: () => (
    <Descriptions title="Compact" size="small" bordered column={2}>
      <Descriptions.Item label="A">1</Descriptions.Item>
      <Descriptions.Item label="B">2</Descriptions.Item>
      <Descriptions.Item label="C">3</Descriptions.Item>
      <Descriptions.Item label="D">4</Descriptions.Item>
    </Descriptions>
  ),
};

export const SizeDefault: Story = {
  name: "Size — default",
  render: () => (
    <Descriptions title="Default" bordered column={2}>
      <Descriptions.Item label="A">1</Descriptions.Item>
      <Descriptions.Item label="B">2</Descriptions.Item>
      <Descriptions.Item label="C">3</Descriptions.Item>
      <Descriptions.Item label="D">4</Descriptions.Item>
    </Descriptions>
  ),
};

export const SizeLarge: Story = {
  name: "Size — large",
  render: () => (
    <Descriptions title="Large" size="large" bordered column={2}>
      <Descriptions.Item label="A">1</Descriptions.Item>
      <Descriptions.Item label="B">2</Descriptions.Item>
      <Descriptions.Item label="C">3</Descriptions.Item>
      <Descriptions.Item label="D">4</Descriptions.Item>
    </Descriptions>
  ),
};

export const Sizes: Story = {
  name: "Showcase — sizes",
  render: () => (
    <Flex vertical gap="large">
      <Descriptions title="Small" size="small" column={2} bordered>
        <Descriptions.Item label="A">1</Descriptions.Item>
        <Descriptions.Item label="B">2</Descriptions.Item>
      </Descriptions>
      <Descriptions title="Default" column={2} bordered>
        <Descriptions.Item label="A">1</Descriptions.Item>
        <Descriptions.Item label="B">2</Descriptions.Item>
      </Descriptions>
      <Descriptions title="Large" size="large" column={2} bordered>
        <Descriptions.Item label="A">1</Descriptions.Item>
        <Descriptions.Item label="B">2</Descriptions.Item>
      </Descriptions>
    </Flex>
  ),
};

// ---------------------------------------------------------------------------
// Column count override
// ---------------------------------------------------------------------------

export const ColumnCount: Story = {
  name: "Column — 1 / 2 / 3 / 4",
  render: () => (
    <Flex vertical gap="large">
      <Descriptions title="1 column" column={1} bordered>
        <Descriptions.Item label="Name">Yuki Tanaka</Descriptions.Item>
        <Descriptions.Item label="Email">yuki@example.com</Descriptions.Item>
        <Descriptions.Item label="Role">Owner</Descriptions.Item>
      </Descriptions>
      <Descriptions title="2 columns" column={2} bordered>
        <Descriptions.Item label="Name">Yuki Tanaka</Descriptions.Item>
        <Descriptions.Item label="Email">yuki@example.com</Descriptions.Item>
        <Descriptions.Item label="Role">Owner</Descriptions.Item>
        <Descriptions.Item label="Joined">2024-04-01</Descriptions.Item>
      </Descriptions>
      <Descriptions title="3 columns (default)" column={3} bordered>
        <Descriptions.Item label="Name">Yuki Tanaka</Descriptions.Item>
        <Descriptions.Item label="Email">yuki@example.com</Descriptions.Item>
        <Descriptions.Item label="Role">Owner</Descriptions.Item>
        <Descriptions.Item label="Joined">2024-04-01</Descriptions.Item>
        <Descriptions.Item label="Locale">ja-JP</Descriptions.Item>
        <Descriptions.Item label="Timezone">Asia/Tokyo</Descriptions.Item>
      </Descriptions>
      <Descriptions title="4 columns" column={4} bordered>
        <Descriptions.Item label="Name">Yuki Tanaka</Descriptions.Item>
        <Descriptions.Item label="Email">yuki@example.com</Descriptions.Item>
        <Descriptions.Item label="Role">Owner</Descriptions.Item>
        <Descriptions.Item label="Joined">2024-04-01</Descriptions.Item>
      </Descriptions>
    </Flex>
  ),
};

// ---------------------------------------------------------------------------
// Span — items that span multiple columns
// ---------------------------------------------------------------------------

export const ItemSpan: Story = {
  name: "Item — span multiple columns",
  render: () => (
    <Descriptions title="Account" column={4} bordered>
      <Descriptions.Item label="Name">Yuki Tanaka</Descriptions.Item>
      <Descriptions.Item label="Email" span={2}>yuki.tanaka@famgia.example</Descriptions.Item>
      <Descriptions.Item label="Locale">ja-JP</Descriptions.Item>
      <Descriptions.Item label="Bio" span={4}>
        プラットフォームエンジニア — Tokyo, Japan. Builds the GoDX dev workspace.
      </Descriptions.Item>
    </Descriptions>
  ),
};

// ---------------------------------------------------------------------------
// Rich values — Tag, Statistic, long-form
// ---------------------------------------------------------------------------

export const WithTags: Story = {
  name: "Rich value — Tags inside an Item",
  render: () => (
    <Descriptions title="Project" column={2} bordered>
      <Descriptions.Item label="Name">godxjp-ui</Descriptions.Item>
      <Descriptions.Item label="Owner">
        <Flex align="center" gap="small">
          <Avatar size="sm" color="oklch(58% 0.16 250)" textColor="white">YT</Avatar>
          Yuki Tanaka
        </Flex>
      </Descriptions.Item>
      <Descriptions.Item label="Status">
        <Badge variant="success" dot>healthy</Badge>
      </Descriptions.Item>
      <Descriptions.Item label="Tags">
        <Flex gap="small" wrap>
          <Tag color="info">frontend</Tag>
          <Tag color="primary">design-system</Tag>
          <Tag color="default">monorepo</Tag>
        </Flex>
      </Descriptions.Item>
      <Descriptions.Item label="Description" span={2}>
        GoDX professional UI framework — design tokens, primitives, shell, i18n, hooks, and toolchain config shared across every service frontend.
      </Descriptions.Item>
    </Descriptions>
  ),
};

export const WithStatistic: Story = {
  name: "Rich value — Statistic inside an Item",
  render: () => (
    <Descriptions title="Tenant — Famgia Co., Ltd." column={3} bordered size="large">
      <Descriptions.Item label="Active users">
        <Statistic value={1024} valueSize={24} />
      </Descriptions.Item>
      <Descriptions.Item label="Revenue / mo">
        <Statistic value={417_600} prefix="¥" valueSize={24} />
      </Descriptions.Item>
      <Descriptions.Item label="MoM growth">
        <Statistic
          value={12.5}
          precision={1}
          suffix="%"
          prefix={<TrendingUp size={14} style={{ color: "var(--success)" }} />}
          valueSize={24}
          style={{ color: "var(--success)" }}
        />
      </Descriptions.Item>
    </Descriptions>
  ),
};

// ---------------------------------------------------------------------------
// Realistic composition — Profile field summary
// ---------------------------------------------------------------------------

export const ProfileSummary: Story = {
  name: "Composition — Profile field summary",
  render: () => (
    <Card
      title="プロフィール"
      extra={<Button variant="secondary" size="sm">編集</Button>}
      style={{ maxWidth: 720 }}
    >
      <Flex vertical gap="middle">
        <Flex align="center" gap="middle">
          <Avatar size="xl" color="oklch(58% 0.16 250)" textColor="white">YT</Avatar>
          <Flex vertical gap={0}>
            <strong style={{ fontSize: 16 }}>Yuki Tanaka</strong>
            <span style={{ color: "var(--muted-foreground)" }}>プラットフォームエンジニア</span>
          </Flex>
        </Flex>
        <Descriptions column={2} bordered>
          <Descriptions.Item label="Name">Yuki Tanaka</Descriptions.Item>
          <Descriptions.Item label="Email">yuki.tanaka@famgia.example</Descriptions.Item>
          <Descriptions.Item label="Role">
            <Tag color="primary" bordered={false}>Owner</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Joined">2024-04-01</Descriptions.Item>
          <Descriptions.Item label="Locale">ja-JP</Descriptions.Item>
          <Descriptions.Item label="Timezone">Asia/Tokyo</Descriptions.Item>
          <Descriptions.Item label="Status">
            <Badge variant="success" dot>active</Badge>
          </Descriptions.Item>
          <Descriptions.Item label="2FA">
            <Badge variant="info" dot>enabled</Badge>
          </Descriptions.Item>
          <Descriptions.Item label="Bio" span={2}>
            Builds the GoDX dev workspace at Famgia. Owns the godxjp-ui design system + plan #31 portal split.
          </Descriptions.Item>
        </Descriptions>
      </Flex>
    </Card>
  ),
};

// ---------------------------------------------------------------------------
// Showcase
// ---------------------------------------------------------------------------

export const AllVariants: Story = {
  name: "Showcase — full matrix",
  render: () => (
    <Flex vertical gap="large">
      <Descriptions title="horizontal · borderless · default" column={3}>
        <Descriptions.Item label="Name">Yuki Tanaka</Descriptions.Item>
        <Descriptions.Item label="Email">yuki@example.com</Descriptions.Item>
        <Descriptions.Item label="Role">Owner</Descriptions.Item>
      </Descriptions>
      <Descriptions title="vertical · borderless · default" layout="vertical" column={3}>
        <Descriptions.Item label="Name">Yuki Tanaka</Descriptions.Item>
        <Descriptions.Item label="Email">yuki@example.com</Descriptions.Item>
        <Descriptions.Item label="Role">Owner</Descriptions.Item>
      </Descriptions>
      <Descriptions title="horizontal · bordered · small" bordered size="small" column={3}>
        <Descriptions.Item label="Name">Yuki Tanaka</Descriptions.Item>
        <Descriptions.Item label="Email">yuki@example.com</Descriptions.Item>
        <Descriptions.Item label="Role">Owner</Descriptions.Item>
      </Descriptions>
      <Descriptions title="horizontal · bordered · default" bordered column={3}>
        <Descriptions.Item label="Name">Yuki Tanaka</Descriptions.Item>
        <Descriptions.Item label="Email">yuki@example.com</Descriptions.Item>
        <Descriptions.Item label="Role">Owner</Descriptions.Item>
      </Descriptions>
      <Descriptions title="horizontal · bordered · large" bordered size="large" column={3}>
        <Descriptions.Item label="Name">Yuki Tanaka</Descriptions.Item>
        <Descriptions.Item label="Email">yuki@example.com</Descriptions.Item>
        <Descriptions.Item label="Role">Owner</Descriptions.Item>
      </Descriptions>
      <Descriptions title="vertical · bordered · default" layout="vertical" bordered column={3}>
        <Descriptions.Item label="Name">Yuki Tanaka</Descriptions.Item>
        <Descriptions.Item label="Email">yuki@example.com</Descriptions.Item>
        <Descriptions.Item label="Role">Owner</Descriptions.Item>
      </Descriptions>
    </Flex>
  ),
};
