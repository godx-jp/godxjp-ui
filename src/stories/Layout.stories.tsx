import type { Meta, StoryObj } from "@storybook/react";
import { Row, Col, Flex, Space } from "../components/primitives/layout";
import { Card } from "../components/primitives/Card";
import { Button } from "../components/primitives/Button";

const Block = ({ label }: { label: string }) => (
  <div
    style={{
      padding: "12px 16px",
      background: "var(--surface-3)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-md)",
      textAlign: "center",
      fontSize: "var(--text-sm)",
    }}
  >
    {label}
  </div>
);

const meta: Meta = { title: "Layout/Overview", tags: ["autodocs"] };
export default meta;
type Story = StoryObj;

export const RowColGrid: Story = {
  name: "Row + Col (24-col responsive)",
  render: () => (
    <>
      <h3>Equal columns (span 8 × 3)</h3>
      <Row gutter={16}>
        <Col span={8}><Block label="span 8" /></Col>
        <Col span={8}><Block label="span 8" /></Col>
        <Col span={8}><Block label="span 8" /></Col>
      </Row>
      <h3 style={{ marginTop: 24 }}>Responsive — xs=24, md=8/16</h3>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}><Block label="side" /></Col>
        <Col xs={24} md={16}><Block label="main" /></Col>
      </Row>
      <h3 style={{ marginTop: 24 }}>Auto-wrap when sum &gt; 24</h3>
      <Row gutter={8}>
        <Col span={12}><Block label="12" /></Col>
        <Col span={12}><Block label="12" /></Col>
        <Col span={12}><Block label="12" /></Col>
        <Col span={12}><Block label="12" /></Col>
      </Row>
    </>
  ),
};

export const FlexVariants: Story = {
  render: () => (
    <Flex vertical gap="middle">
      <Flex gap="small">
        <Button>One</Button>
        <Button variant="secondary">Two</Button>
        <Button variant="ghost">Three</Button>
      </Flex>
      <Flex gap="large" justify="space-between">
        <Block label="left" />
        <Block label="center" />
        <Block label="right" />
      </Flex>
      <Flex gap="middle" wrap>
        {Array.from({ length: 6 }).map((_, i) => (
          <Block key={i} label={`#${i + 1}`} />
        ))}
      </Flex>
    </Flex>
  ),
};

export const SpaceWithSplit: Story = {
  render: () => (
    <Space size="middle" split="·">
      <span>Tokyo</span>
      <span>Asia/Tokyo</span>
      <span>JPY</span>
      <span>ja-JP</span>
    </Space>
  ),
};

export const InsideCard: Story = {
  name: "Composed inside a Card",
  render: () => (
    <Card title="Composition example" extra={<Button size="sm">Action</Button>}>
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Flex vertical gap="small">
            <Block label="A1" />
            <Block label="A2" />
          </Flex>
        </Col>
        <Col xs={24} md={12}>
          <Flex vertical gap="small">
            <Block label="B1" />
            <Block label="B2" />
          </Flex>
        </Col>
      </Row>
    </Card>
  ),
};
