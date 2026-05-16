import type { Meta, StoryObj } from "@storybook/react";
import { Tag } from "../components/primitives/Tag";
import { Space } from "../components/primitives/layout";
import { ShieldCheck, Star } from "lucide-react";

const meta: Meta<typeof Tag> = {
  title: "Primitives/Tag",
  component: Tag,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof Tag>;

export const Default: Story = { args: { children: "default" } };

export const Presets: Story = {
  render: () => (
    <Space size="small" wrap>
      <Tag color="default">default</Tag>
      <Tag color="primary">primary</Tag>
      <Tag color="success">success</Tag>
      <Tag color="warning">warning</Tag>
      <Tag color="error">error</Tag>
      <Tag color="info">info</Tag>
      <Tag color="attention">attention</Tag>
    </Space>
  ),
};

export const Borderless: Story = {
  render: () => (
    <Space size="small" wrap>
      <Tag color="success" bordered={false}>勤怠管理</Tag>
      <Tag color="primary" bordered={false}>課題管理</Tag>
      <Tag color="info" bordered={false}>給与明細</Tag>
    </Space>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <Space size="small" wrap>
      <Tag color="success" icon={<ShieldCheck size={12} />}>二段階認証 有効</Tag>
      <Tag color="attention" icon={<Star size={12} />}>Owner</Tag>
    </Space>
  ),
};

export const Closable: Story = {
  args: {
    children: "removable",
    color: "default",
    closable: true,
    onClose: () => alert("closed"),
  },
};

export const CustomColor: Story = {
  args: {
    children: "oklch(56% 0.15 240)",
    color: "oklch(56% 0.15 240)",
  },
};
