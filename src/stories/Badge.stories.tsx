import type { Meta, StoryObj } from "@storybook/react";
import { Bell, Inbox, GitPullRequest, AlertCircle } from "lucide-react";
import { Badge } from "../components/primitives/Badge";
import { Button } from "../components/primitives/Button";
import { Avatar } from "../components/primitives/Avatar";
import { Row, Col, Flex, Space } from "../components/primitives/layout";

/**
 * Badge — status pill with an optional colored dot.
 *
 * Visual role: a single short word + at-a-glance semantic color.
 *
 * Variants map onto the brand-bible semantic palette:
 *
 * - `success`   — 若竹  task completed / healthy
 * - `warning`   — 山吹  needs attention, not yet broken
 * - `info`      — 群青  neutral state callout
 * - `error`     — 茜    failed / blocked
 * - `attention` — 朱    pending, awaiting input
 * - `neutral`   — grey  default chrome
 * - `outline`   — empty hairline only
 *
 * Use vs Tag: Badge = compact status pill (1 word, often with `dot`).
 * Tag = label chip (can be multiple per row, often closable).
 */
const meta: Meta<typeof Badge> = {
  title: "Primitives/Badge",
  component: Badge,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Status pill primitive. Pairs naturally with Button (corner " +
          "indicator), Avatar (presence dot), and Table cells (row status).",
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: "inline-radio" },
      options: ["success", "warning", "info", "error", "attention", "neutral", "outline"],
    },
    dot: { control: { type: "boolean" } },
    children: { control: { type: "text" } },
  },
};
export default meta;
type Story = StoryObj<typeof Badge>;

/** Live Controls playground. */
export const Playground: Story = {
  args: { variant: "neutral", dot: false, children: "label" },
};

// ---------------------------------------------------------------------------
// Every semantic variant
// ---------------------------------------------------------------------------

export const VariantSuccess: Story = { args: { variant: "success", children: "healthy" } };
export const VariantWarning: Story = { args: { variant: "warning", children: "needs attention" } };
export const VariantInfo: Story = { args: { variant: "info", children: "in progress" } };
export const VariantError: Story = { args: { variant: "error", children: "failed" } };
export const VariantAttention: Story = { args: { variant: "attention", children: "awaiting input" } };
export const VariantNeutral: Story = { args: { variant: "neutral", children: "draft" } };
export const VariantOutline: Story = { args: { variant: "outline", children: "outline" } };

export const AllVariants: Story = {
  name: "Showcase — every variant",
  render: () => (
    <Flex vertical gap="middle">
      <Space size="small" wrap>
        <Badge variant="success">success</Badge>
        <Badge variant="warning">warning</Badge>
        <Badge variant="info">info</Badge>
        <Badge variant="error">error</Badge>
        <Badge variant="attention">attention</Badge>
        <Badge variant="neutral">neutral</Badge>
        <Badge variant="outline">outline</Badge>
      </Space>
      <Space size="small" wrap>
        <Badge variant="success" dot>healthy</Badge>
        <Badge variant="warning" dot>warning</Badge>
        <Badge variant="info" dot>in progress</Badge>
        <Badge variant="error" dot>failed</Badge>
        <Badge variant="attention" dot>pending</Badge>
        <Badge variant="neutral" dot>draft</Badge>
        <Badge variant="outline" dot>outline</Badge>
      </Space>
    </Flex>
  ),
};

// ---------------------------------------------------------------------------
// Dot mode + count semantics
// ---------------------------------------------------------------------------

export const WithDot: Story = {
  render: () => (
    <Space size="small">
      <Badge variant="success" dot>online</Badge>
      <Badge variant="attention" dot>away</Badge>
      <Badge variant="neutral" dot>offline</Badge>
    </Space>
  ),
};

export const Count: Story = {
  name: "Count — number labels",
  render: () => (
    <Space size="small">
      <Badge variant="info">3</Badge>
      <Badge variant="error">12</Badge>
      <Badge variant="attention">99+</Badge>
      <Badge variant="neutral">0</Badge>
    </Space>
  ),
};

// ---------------------------------------------------------------------------
// Anchored — on Button / Avatar / Icon corners
// ---------------------------------------------------------------------------

function corner(): React.CSSProperties {
  return {
    position: "absolute",
    top: -6,
    right: -6,
  };
}

export const OnButton: Story = {
  name: "Anchored — Button corner",
  render: () => (
    <Space size="middle">
      <span style={{ position: "relative", display: "inline-block" }}>
        <Button variant="secondary">Inbox</Button>
        <span style={corner()}>
          <Badge variant="error">5</Badge>
        </span>
      </span>
      <span style={{ position: "relative", display: "inline-block" }}>
        <Button variant="ghost">Pull requests</Button>
        <span style={corner()}>
          <Badge variant="attention" dot />
        </span>
      </span>
    </Space>
  ),
};

export const OnAvatar: Story = {
  name: "Anchored — Avatar presence",
  render: () => (
    <Space size="middle">
      <span style={{ position: "relative", display: "inline-block" }}>
        <Avatar size="lg" color="oklch(58% 0.16 250)" textColor="white">YT</Avatar>
        <span style={{ ...corner(), top: "auto", bottom: -2, right: -2 }}>
          <Badge variant="success" dot />
        </span>
      </span>
      <span style={{ position: "relative", display: "inline-block" }}>
        <Avatar size="lg" color="oklch(60% 0.15 150)" textColor="white">AS</Avatar>
        <span style={{ ...corner(), top: "auto", bottom: -2, right: -2 }}>
          <Badge variant="attention" dot />
        </span>
      </span>
      <span style={{ position: "relative", display: "inline-block" }}>
        <Avatar size="lg" color="oklch(58% 0.18 25)" textColor="white">KM</Avatar>
        <span style={{ ...corner(), top: "auto", bottom: -2, right: -2 }}>
          <Badge variant="neutral" dot />
        </span>
      </span>
    </Space>
  ),
};

export const OnIcon: Story = {
  name: "Anchored — Top-bar icon",
  render: () => (
    <Space size="middle" align="center">
      <span style={{ position: "relative", display: "inline-flex", padding: 6 }}>
        <Bell size={20} />
        <span style={corner()}>
          <Badge variant="error">3</Badge>
        </span>
      </span>
      <span style={{ position: "relative", display: "inline-flex", padding: 6 }}>
        <Inbox size={20} />
        <span style={corner()}>
          <Badge variant="info">12</Badge>
        </span>
      </span>
      <span style={{ position: "relative", display: "inline-flex", padding: 6 }}>
        <GitPullRequest size={20} />
        <span style={corner()}>
          <Badge variant="attention" dot />
        </span>
      </span>
    </Space>
  ),
};

// ---------------------------------------------------------------------------
// Realistic composition
// ---------------------------------------------------------------------------

export const StatusInRow: Story = {
  name: "Composition — Row status indicator",
  render: () => (
    <Flex vertical gap="small" style={{ width: 360 }}>
      <Flex align="center" gap="small" justify="space-between">
        <Flex gap="small" align="center">
          <Avatar size="sm" color="oklch(58% 0.16 250)" textColor="white">YT</Avatar>
          <span>godxjp-ui · build</span>
        </Flex>
        <Badge variant="success" dot>healthy</Badge>
      </Flex>
      <Flex align="center" gap="small" justify="space-between">
        <Flex gap="small" align="center">
          <Avatar size="sm" color="oklch(60% 0.15 150)" textColor="white">AS</Avatar>
          <span>forge-service · deploy</span>
        </Flex>
        <Badge variant="warning" dot>2 alerts</Badge>
      </Flex>
      <Flex align="center" gap="small" justify="space-between">
        <Flex gap="small" align="center">
          <Avatar size="sm" color="oklch(58% 0.18 25)" textColor="white">KM</Avatar>
          <span>identity-service · auth</span>
        </Flex>
        <Badge variant="error" dot>down</Badge>
      </Flex>
      <Flex align="center" gap="small" justify="space-between">
        <Flex gap="small" align="center">
          <Avatar size="sm" color="oklch(62% 0.14 80)" textColor="white">RH</Avatar>
          <span>me-service · idle</span>
        </Flex>
        <Badge variant="neutral" dot>offline</Badge>
      </Flex>
    </Flex>
  ),
};

export const NotificationDot: Story = {
  name: "Composition — Top-bar notification dot",
  render: () => (
    <Row align="middle" gutter={16} style={{ padding: 12, background: "var(--background)", borderRadius: 8 }}>
      <Col flex="auto">
        <strong>GoDX Forge · Admin</strong>
      </Col>
      <Col>
        <Space size="middle" align="center">
          <span style={{ position: "relative", display: "inline-flex" }}>
            <AlertCircle size={20} />
            <span style={corner()}>
              <Badge variant="error" dot />
            </span>
          </span>
          <span style={{ position: "relative", display: "inline-flex" }}>
            <Bell size={20} />
            <span style={corner()}>
              <Badge variant="info">7</Badge>
            </span>
          </span>
          <Avatar size="sm" color="oklch(58% 0.16 250)" textColor="white">YT</Avatar>
        </Space>
      </Col>
    </Row>
  ),
};
