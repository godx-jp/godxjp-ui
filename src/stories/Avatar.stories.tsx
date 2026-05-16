import type { Meta, StoryObj } from "@storybook/react";
import { Avatar } from "../components/primitives/Avatar";
import { Space } from "../components/primitives/layout";
import { UserRound } from "lucide-react";

const meta: Meta<typeof Avatar> = {
  title: "Primitives/Avatar",
  component: Avatar,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof Avatar>;

export const Initials: Story = { args: { children: "SF" } };

export const Sizes: Story = {
  render: () => (
    <Space size="middle" align="center">
      <Avatar size="xs">XS</Avatar>
      <Avatar size="sm">SM</Avatar>
      <Avatar>D</Avatar>
      <Avatar size="lg">LG</Avatar>
      <Avatar size="xl">XL</Avatar>
      <Avatar size={64}>64</Avatar>
    </Space>
  ),
};

export const Shapes: Story = {
  render: () => (
    <Space size="middle">
      <Avatar shape="circle">SF</Avatar>
      <Avatar shape="square">SF</Avatar>
    </Space>
  ),
};

export const Brand: Story = {
  args: { variant: "brand", children: "G", size: "lg" },
};

export const TintedByColor: Story = {
  render: () => (
    <Space size="middle">
      <Avatar shape="square" color="oklch(56% 0.15 240)" textColor="white">F</Avatar>
      <Avatar shape="square" color="oklch(58% 0.159 150)" textColor="white">B</Avatar>
      <Avatar shape="square" color="oklch(58% 0.18 25)" textColor="white">T</Avatar>
    </Space>
  ),
};

export const WithIcon: Story = {
  args: { icon: <UserRound size={16} />, size: "lg" },
};
