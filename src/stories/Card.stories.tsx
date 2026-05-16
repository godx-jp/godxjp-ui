import type { Meta, StoryObj } from "@storybook/react";
import { ExternalLink, MoreHorizontal, TrendingUp, Users } from "lucide-react";
import { Card } from "../components/primitives/Card";
import { Button } from "../components/primitives/Button";
import { Tag } from "../components/primitives/Tag";
import { Badge } from "../components/primitives/Badge";
import { Avatar } from "../components/primitives/Avatar";
import { Statistic } from "../components/primitives/Statistic";
import { Row, Col, Flex, Space } from "../components/primitives/layout";

/**
 * Card — surface container, Ant-Design-shaped.
 *
 * Header slots: **title**, **subtitle**, **extra** (right-side action).
 * Footer slot: **actions** (separated by a divider).
 *
 * Visual axes:
 * - **variant** — `outlined` (default) / `filled` (no border, surface-2) / `borderless` (no border, no bg).
 * - **size** — `small` (compact padding) / `default`.
 * - **hoverable** — adds hover affordance + pointer cursor.
 *
 * Where it fits: every dashboard tile, every Statistic wrapper, every
 * settings panel section. Cards are the surface unit of GoDX UI.
 */
const meta: Meta<typeof Card> = {
  title: "Primitives/Card",
  component: Card,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Surface container with optional header (title / subtitle / " +
          "extra) and footer (actions). Composes naturally with " +
          "Statistic, Tag, Avatar, Button. Supports outlined / filled / " +
          "borderless variants and small / default sizes.",
      },
    },
  },
  argTypes: {
    title: { control: { type: "text" } },
    subtitle: { control: { type: "text" } },
    variant: {
      control: { type: "inline-radio" },
      options: ["outlined", "filled", "borderless"],
    },
    size: {
      control: { type: "inline-radio" },
      options: ["small", "default"],
    },
    hoverable: { control: { type: "boolean" } },
  },
};
export default meta;
type Story = StoryObj<typeof Card>;

/** Live Controls playground. */
export const Playground: Story = {
  args: {
    title: "Pull requests",
    subtitle: "Open / merged this week",
    variant: "outlined",
    size: "default",
    hoverable: false,
    children: "Card body content.",
  },
};

// ---------------------------------------------------------------------------
// Header slot combinations
// ---------------------------------------------------------------------------

export const Plain: Story = {
  args: { children: "Just a card body — no header." },
};

export const TitleOnly: Story = {
  args: { title: "Pull requests", children: "Open / merged this week" },
};

export const TitleAndExtra: Story = {
  args: {
    title: "Pull requests",
    extra: <a href="#">All →</a>,
    children: "12 open · 4 merged this week",
  },
};

export const TitleSubtitleExtra: Story = {
  args: {
    title: "Pull requests",
    subtitle: "Open / merged this week",
    extra: <Tag color="primary">new</Tag>,
    children: "12 open · 4 merged this week",
  },
};

export const WithActions: Story = {
  args: {
    title: "Card with footer actions",
    children: "Body content goes here.",
    actions: (
      <Flex gap="small">
        <Button variant="secondary" size="sm">Cancel</Button>
        <Button size="sm">Confirm</Button>
      </Flex>
    ),
  },
};

// ---------------------------------------------------------------------------
// Variants
// ---------------------------------------------------------------------------

export const VariantOutlined: Story = {
  args: { variant: "outlined", title: "Outlined (default)", children: "Bordered surface." },
};

export const VariantFilled: Story = {
  args: { variant: "filled", title: "Filled", children: "Surface-2 background, no border." },
};

export const VariantBorderless: Story = {
  args: { variant: "borderless", title: "Borderless", children: "No border, no background." },
};

export const Variants: Story = {
  name: "Showcase — variants",
  render: () => (
    <Row gutter={[16, 16]}>
      <Col xs={24} md={8}>
        <Card title="Outlined" variant="outlined">Default — bordered surface.</Card>
      </Col>
      <Col xs={24} md={8}>
        <Card title="Filled" variant="filled">Surface-2 bg, no border.</Card>
      </Col>
      <Col xs={24} md={8}>
        <Card title="Borderless" variant="borderless">No border, no background.</Card>
      </Col>
    </Row>
  ),
};

// ---------------------------------------------------------------------------
// Sizes
// ---------------------------------------------------------------------------

export const SizeSmall: Story = {
  args: { size: "small", title: "Small (compact)", children: "Compact padding." },
};

export const SizeDefault: Story = {
  args: { size: "default", title: "Default", children: "Default padding." },
};

export const Sizes: Story = {
  name: "Showcase — sizes",
  render: () => (
    <Row gutter={[16, 16]}>
      <Col xs={24} md={12}>
        <Card title="Small" size="small">
          Compact padding — fits tighter layouts.
        </Card>
      </Col>
      <Col xs={24} md={12}>
        <Card title="Default" size="default">
          Default padding — the standard surface.
        </Card>
      </Col>
    </Row>
  ),
};

// ---------------------------------------------------------------------------
// Hoverable
// ---------------------------------------------------------------------------

export const Hoverable: Story = {
  args: {
    title: "Hoverable",
    subtitle: "Cursor + border tint on hover",
    extra: <Tag color="primary">new</Tag>,
    hoverable: true,
    children: "Hover this card.",
  },
};

// ---------------------------------------------------------------------------
// Nested Cards
// ---------------------------------------------------------------------------

export const Nested: Story = {
  name: "Composition — Nested card",
  render: () => (
    <Card title="Outer card" extra={<Button size="sm" variant="ghost">More</Button>}>
      <Flex vertical gap="middle">
        <Card variant="filled" size="small" title="Inner — filled small">
          Nested filled card as a sub-section.
        </Card>
        <Card variant="borderless" size="small" title="Inner — borderless small">
          Nested borderless card as a sub-section.
        </Card>
      </Flex>
    </Card>
  ),
};

// ---------------------------------------------------------------------------
// With Statistic inside
// ---------------------------------------------------------------------------

export const WithStatistic: Story = {
  name: "Composition — Card + Statistic",
  render: () => (
    <Card style={{ width: 240 }} title="MoM growth" extra={<Tag color="success">+5%</Tag>}>
      <Statistic
        value={12.5}
        precision={1}
        suffix="%"
        prefix={<TrendingUp size={16} style={{ color: "var(--success)" }} />}
        valueSize={28}
      />
    </Card>
  ),
};

// ---------------------------------------------------------------------------
// KPI Card grid — Row + Col of 3 Statistic Cards
// ---------------------------------------------------------------------------

export const KPIGrid: Story = {
  name: "Composition — KPI Card grid",
  render: () => (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} md={8}>
        <Card>
          <Statistic
            title="所属組織"
            value={2}
            prefix={<Users size={16} style={{ color: "var(--muted-foreground)" }} />}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={8}>
        <Card>
          <Statistic
            title="アクティブセッション"
            value={14}
            valueSize={28}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={8}>
        <Card>
          <Statistic
            title="MoM growth"
            value={12.5}
            precision={1}
            suffix="%"
            prefix={<TrendingUp size={16} style={{ color: "var(--success)" }} />}
            valueSize={28}
            style={{ color: "var(--success)" }}
          />
        </Card>
      </Col>
    </Row>
  ),
};

// ---------------------------------------------------------------------------
// Org tile grid — title + subtitle + extra, hoverable
// ---------------------------------------------------------------------------

type Org = { name: string; slug: string; role: string; tag: "primary" | "success" | "info" | "warning"; tagLabel: string; initials: string; color: string };

const orgs: Org[] = [
  { name: "GoDX Inc.",        slug: "godx.jp",         role: "Owner",      tag: "primary", tagLabel: "Owner",     initials: "GX", color: "oklch(58% 0.16 250)" },
  { name: "Famgia Co., Ltd.", slug: "famgia.co.jp",    role: "Engineer",   tag: "info",    tagLabel: "Engineer",  initials: "FG", color: "oklch(60% 0.15 150)" },
  { name: "Sandbox Labs",     slug: "sandbox.local",   role: "Reviewer",   tag: "warning", tagLabel: "Reviewer",  initials: "SL", color: "oklch(62% 0.14 80)"  },
  { name: "プロジェクト 五月",   slug: "may-project",     role: "Admin",      tag: "success", tagLabel: "Active",    initials: "5月", color: "oklch(58% 0.18 25)"  },
];

export const OrgTileGrid: Story = {
  name: "Composition — Org tile grid",
  render: () => (
    <Row gutter={[16, 16]}>
      {orgs.map((o) => (
        <Col key={o.slug} xs={24} sm={12} md={12} lg={6}>
          <Card
            hoverable
            title={
              <Flex align="center" gap="small">
                <Avatar shape="square" color={o.color} textColor="white" size="default">
                  {o.initials}
                </Avatar>
                <span>{o.name}</span>
              </Flex>
            }
            subtitle={o.slug}
            extra={
              <Button variant="ghost" size="sm" aria-label="more">
                <MoreHorizontal size={16} />
              </Button>
            }
            actions={
              <Flex justify="space-between" align="center">
                <Tag color={o.tag} bordered={false}>{o.tagLabel}</Tag>
                <Button variant="ghost" size="sm">
                  Open <ExternalLink size={12} style={{ marginLeft: 4 }} />
                </Button>
              </Flex>
            }
          >
            <Space size="small" wrap>
              <Badge variant="info" dot>{o.role}</Badge>
              <Badge variant="neutral">3 projects</Badge>
              <Badge variant="success" dot>healthy</Badge>
            </Space>
          </Card>
        </Col>
      ))}
    </Row>
  ),
};

// ---------------------------------------------------------------------------
// All variants showcase
// ---------------------------------------------------------------------------

export const AllVariants: Story = {
  name: "Showcase — full matrix",
  render: () => (
    <Flex vertical gap="large">
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card title="outlined / default" variant="outlined">Default surface.</Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="filled / default" variant="filled">No border, surface-2 bg.</Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="borderless / default" variant="borderless">No border, no bg.</Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card title="outlined / small" variant="outlined" size="small">Compact padding.</Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="filled / small" variant="filled" size="small">Compact padding.</Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="borderless / small" variant="borderless" size="small">Compact padding.</Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title="hoverable" hoverable subtitle="border tints on hover">
            Hover this card.
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card
            title="actions"
            actions={
              <Flex gap="small" justify="end">
                <Button variant="secondary" size="sm">Cancel</Button>
                <Button size="sm">Save</Button>
              </Flex>
            }
          >
            Footer action area.
          </Card>
        </Col>
      </Row>
    </Flex>
  ),
};
