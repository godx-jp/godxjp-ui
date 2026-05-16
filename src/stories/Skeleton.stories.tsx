import type { Meta, StoryObj } from "@storybook/react";
import { Skeleton } from "../components/primitives/Skeleton";
import { Card } from "../components/primitives/Card";
import { Row, Col, Flex, Space } from "../components/primitives/layout";

/**
 * Skeleton — loading placeholder atom.
 *
 * One prop: `className` / `style`. Width + height + radius are
 * supplied per usage so the same primitive renders text lines,
 * paragraphs, avatars (circle/square), buttons, cards, etc.
 *
 * Where it fits: every async view (queries in-flight). Stitch
 * several Skeletons together to mock the eventual layout — the
 * jolt between "loading" and "loaded" should be minimal.
 */
const meta: Meta<typeof Skeleton> = {
  title: "Primitives/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Loading placeholder. Renders the canonical `.skeleton` class " +
          "(animate-skeleton + muted background). Size + shape come from " +
          "the consumer via className/style. Pairs naturally with Card, " +
          "Avatar, Button.",
      },
    },
  },
  argTypes: {
    className: { control: { type: "text" } },
  },
};
export default meta;
type Story = StoryObj<typeof Skeleton>;

/** Live Controls playground. */
export const Playground: Story = {
  args: { style: { width: 200, height: 16, borderRadius: 4 } },
};

// ---------------------------------------------------------------------------
// Primitive shapes
// ---------------------------------------------------------------------------

export const TextLine: Story = {
  name: "Shape — text line",
  args: { style: { height: 14, width: 240 } },
};

export const Paragraph: Story = {
  name: "Shape — paragraph (3 lines)",
  render: () => (
    <Flex vertical gap="small" style={{ width: 360 }}>
      <Skeleton style={{ height: 14, width: "100%" }} />
      <Skeleton style={{ height: 14, width: "92%" }} />
      <Skeleton style={{ height: 14, width: "75%" }} />
    </Flex>
  ),
};

export const AvatarCircle: Story = {
  name: "Shape — avatar (circle)",
  args: { style: { width: 40, height: 40, borderRadius: "50%" } },
};

export const AvatarSquare: Story = {
  name: "Shape — avatar (square)",
  args: { style: { width: 40, height: 40, borderRadius: 8 } },
};

export const AvatarSizes: Story = {
  name: "Shape — avatar sizes",
  render: () => (
    <Space size="middle" align="center">
      <Skeleton style={{ width: 20, height: 20, borderRadius: "50%" }} />
      <Skeleton style={{ width: 24, height: 24, borderRadius: "50%" }} />
      <Skeleton style={{ width: 28, height: 28, borderRadius: "50%" }} />
      <Skeleton style={{ width: 36, height: 36, borderRadius: "50%" }} />
      <Skeleton style={{ width: 48, height: 48, borderRadius: "50%" }} />
    </Space>
  ),
};

export const Button: Story = {
  name: "Shape — button",
  args: { style: { width: 96, height: 32, borderRadius: 6 } },
};

export const Card_: Story = {
  name: "Shape — card block",
  args: { style: { width: 280, height: 160, borderRadius: 12 } },
};

// ---------------------------------------------------------------------------
// Realistic loading compositions
// ---------------------------------------------------------------------------

export const LoadingUserCard: Story = {
  name: "Composition — Loading user card",
  render: () => (
    <Card style={{ width: 320 }}>
      <Flex align="center" gap="small">
        <Skeleton style={{ width: 48, height: 48, borderRadius: "50%" }} />
        <Flex vertical gap="small" style={{ flex: 1 }}>
          <Skeleton style={{ height: 14, width: 160 }} />
          <Skeleton style={{ height: 12, width: 120 }} />
        </Flex>
      </Flex>
      <div style={{ marginTop: 16 }}>
        <Flex vertical gap="small">
          <Skeleton style={{ height: 12, width: "100%" }} />
          <Skeleton style={{ height: 12, width: "92%" }} />
          <Skeleton style={{ height: 12, width: "70%" }} />
        </Flex>
      </div>
    </Card>
  ),
};

export const LoadingList: Story = {
  name: "Composition — Loading list (5 rows)",
  render: () => (
    <Flex vertical gap="middle" style={{ width: 420 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Flex key={i} align="center" gap="small">
          <Skeleton style={{ width: 36, height: 36, borderRadius: "50%" }} />
          <Flex vertical gap="small" style={{ flex: 1 }}>
            <Skeleton style={{ height: 14, width: `${40 + ((i * 17) % 50)}%` }} />
            <Skeleton style={{ height: 12, width: `${20 + ((i * 23) % 40)}%` }} />
          </Flex>
          <Skeleton style={{ width: 64, height: 22, borderRadius: 6 }} />
        </Flex>
      ))}
    </Flex>
  ),
};

export const LoadingCardGrid: Story = {
  name: "Composition — Loading card grid",
  render: () => (
    <Row gutter={[16, 16]}>
      {Array.from({ length: 6 }).map((_, i) => (
        <Col key={i} xs={24} sm={12} md={8}>
          <Card>
            <Flex vertical gap="small">
              <Skeleton style={{ height: 16, width: "55%" }} />
              <Skeleton style={{ height: 30, width: "70%" }} />
              <Skeleton style={{ height: 12, width: "40%" }} />
            </Flex>
          </Card>
        </Col>
      ))}
    </Row>
  ),
};

export const LoadingTable: Story = {
  name: "Composition — Loading table",
  render: () => (
    <Flex vertical gap="small" style={{ width: 560 }}>
      <Flex gap="middle">
        <Skeleton style={{ height: 14, width: 60 }} />
        <Skeleton style={{ height: 14, width: 160, flex: 1 }} />
        <Skeleton style={{ height: 14, width: 80 }} />
        <Skeleton style={{ height: 14, width: 80 }} />
      </Flex>
      {Array.from({ length: 6 }).map((_, i) => (
        <Flex key={i} gap="middle" align="center" style={{ paddingTop: 8, borderTop: "1px solid var(--border)" }}>
          <Skeleton style={{ height: 12, width: 60 }} />
          <Skeleton style={{ height: 12, flex: 1 }} />
          <Skeleton style={{ height: 22, width: 80, borderRadius: 6 }} />
          <Skeleton style={{ height: 12, width: 80 }} />
        </Flex>
      ))}
    </Flex>
  ),
};

// ---------------------------------------------------------------------------
// Showcase
// ---------------------------------------------------------------------------

export const AllVariants: Story = {
  name: "Showcase — every shape",
  render: () => (
    <Flex vertical gap="large">
      <Row gutter={[16, 12]} align="middle">
        <Col span={4}><strong>text line</strong></Col>
        <Col span={20}>
          <Flex vertical gap="small">
            <Skeleton style={{ height: 12, width: 120 }} />
            <Skeleton style={{ height: 14, width: 240 }} />
            <Skeleton style={{ height: 16, width: 360 }} />
          </Flex>
        </Col>
      </Row>
      <Row gutter={[16, 12]} align="middle">
        <Col span={4}><strong>paragraph</strong></Col>
        <Col span={20}>
          <Flex vertical gap="small" style={{ width: 360 }}>
            <Skeleton style={{ height: 14, width: "100%" }} />
            <Skeleton style={{ height: 14, width: "92%" }} />
            <Skeleton style={{ height: 14, width: "75%" }} />
          </Flex>
        </Col>
      </Row>
      <Row gutter={[16, 12]} align="middle">
        <Col span={4}><strong>avatar</strong></Col>
        <Col span={20}>
          <Space size="middle" align="center">
            <Skeleton style={{ width: 20, height: 20, borderRadius: "50%" }} />
            <Skeleton style={{ width: 28, height: 28, borderRadius: "50%" }} />
            <Skeleton style={{ width: 36, height: 36, borderRadius: "50%" }} />
            <Skeleton style={{ width: 48, height: 48, borderRadius: "50%" }} />
            <Skeleton style={{ width: 36, height: 36, borderRadius: 8 }} />
          </Space>
        </Col>
      </Row>
      <Row gutter={[16, 12]} align="middle">
        <Col span={4}><strong>button</strong></Col>
        <Col span={20}>
          <Space size="middle">
            <Skeleton style={{ width: 64, height: 28, borderRadius: 6 }} />
            <Skeleton style={{ width: 96, height: 32, borderRadius: 6 }} />
            <Skeleton style={{ width: 128, height: 40, borderRadius: 8 }} />
          </Space>
        </Col>
      </Row>
      <Row gutter={[16, 12]} align="middle">
        <Col span={4}><strong>card</strong></Col>
        <Col span={20}>
          <Skeleton style={{ width: 280, height: 160, borderRadius: 12 }} />
        </Col>
      </Row>
    </Flex>
  ),
};
