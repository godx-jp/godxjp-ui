import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "../components/primitives/Card";
import { Button } from "../components/primitives/Button";
import { Tag } from "../components/primitives/Tag";

const meta: Meta<typeof Card> = {
  title: "Primitives/Card",
  component: Card,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof Card>;

export const Plain: Story = {
  args: { children: "Just a card body — no header." },
};

export const WithTitleAndExtra: Story = {
  args: {
    title: "Pull requests",
    extra: <a href="#">All →</a>,
    children: "Open / merged this week",
  },
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(3, 1fr)" }}>
      <Card title="Outlined" variant="outlined">Default</Card>
      <Card title="Filled" variant="filled">Surface-2 background, no border</Card>
      <Card title="Borderless" variant="borderless">No border, no padding</Card>
    </div>
  ),
};

export const Hoverable: Story = {
  args: {
    title: "Hoverable",
    subtitle: "Cursor changes + border tints primary on hover",
    extra: <Tag color="primary">new</Tag>,
    hoverable: true,
    children: "Hover this card",
  },
};

export const WithActions: Story = {
  args: {
    title: "Card with actions",
    children: "Body content goes here.",
    actions: (
      <>
        <Button variant="secondary" size="sm">Cancel</Button>
        <Button size="sm">Confirm</Button>
      </>
    ),
  },
};
