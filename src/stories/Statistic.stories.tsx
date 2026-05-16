import type { Meta, StoryObj } from "@storybook/react";
import { Statistic } from "../components/primitives/Statistic";
import { Row, Col } from "../components/primitives/layout";
import { TrendingUp } from "lucide-react";

const meta: Meta<typeof Statistic> = {
  title: "Primitives/Statistic",
  component: Statistic,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof Statistic>;

export const Default: Story = {
  args: { title: "Active users", value: 1024 },
};

export const WithPrefixSuffix: Story = {
  args: {
    title: "Take-home pay",
    value: 417_600,
    prefix: "¥",
    suffix: "/mo",
  },
};

export const WithPrecision: Story = {
  args: {
    title: "Uptime",
    value: 99.973,
    precision: 2,
    suffix: "%",
  },
};

export const KPIGrid: Story = {
  render: () => (
    <Row gutter={16}>
      <Col xs={24} sm={12} md={6}>
        <Statistic title="所属組織" value={2} />
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Statistic title="過去の組織" value={2} />
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Statistic title="未読の招待" value={2} />
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Statistic
          title="Growth"
          value={12.5}
          precision={1}
          suffix="%"
          prefix={<TrendingUp size={16} />}
        />
      </Col>
    </Row>
  ),
};
