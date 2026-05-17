import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Switch } from "../../components/data-entry/Switch";
import { Flex } from "../../components/layout";

/**
 * data-entry/Switch — boolean toggle.
 *
 * Cardinal rules:
 *   §3  — Radix @radix-ui/react-switch.
 *   §23 — `checked` / `defaultChecked` / `onCheckedChange` per Radix
 *          for a boolean control. `disabled` is the shared axis.
 *   §25 — story is documentation; primitive owns the UI.
 */

const meta: Meta<typeof Switch> = {
  title: "Data Entry/Switch",
  component: Switch,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof Switch>;

export const Default: Story = {
  render: () => <Switch defaultChecked />,
};

export const Disabled: Story = {
  render: () => (
    <Flex gap="middle" align="center">
      <Switch disabled />
      <Switch disabled defaultChecked />
    </Flex>
  ),
};

function ControlledDemo() {
  const [on, setOn] = useState(false);
  return (
    <Flex vertical gap="small" align="start">
      <Switch checked={on} onCheckedChange={setOn} />
      <code className="mono" style={{ fontSize: "var(--text-xs)" }}>
        {on ? "ON" : "OFF"}
      </code>
    </Flex>
  );
}

export const Controlled: Story = {
  render: () => <ControlledDemo />,
};

export const WithLabel: Story = {
  name: "With label",
  render: () => (
    <Flex vertical gap="small" align="start">
      <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <Switch defaultChecked />
        <span>メール通知を受け取る</span>
      </label>
      <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <Switch />
        <span>ダークモード</span>
      </label>
    </Flex>
  ),
};
