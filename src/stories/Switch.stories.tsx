import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Switch } from "../components/primitives/Switch";
import { Label } from "../components/primitives/Label";
import { Flex, Space } from "../components/primitives/layout";

const meta: Meta<typeof Switch> = {
  title: "Primitives/Switch",
  component: Switch,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
**Switch** — binary on/off toggle, Radix-backed.

Wraps \`@radix-ui/react-switch\` so \`role="switch"\`, focus ring, and keyboard
(\`Space\` to toggle) are handled. Visual contract lives in \`.switch-root\` /
\`.switch-thumb\` in \`tokens.css\`; \`className\` is layout glue, never re-skinning.

**When to use Switch vs Checkbox**

- \`Switch\` — preference / setting that applies immediately ("Email notifications",
  "Dark mode"). No "Save" button needed.
- \`Checkbox\` — selection within a form ("I agree", "Remember me", multi-select
  permissions). Submitted with the form.

**Accessibility (WCAG 2.1 AA)** — Radix sets \`role="switch"\` + \`aria-checked\` and
manages focus. Always pair with \`<Label htmlFor>\` for screen-reader naming and
click-target expansion. Disabled state propagates as \`aria-disabled\` via the
native \`disabled\` attribute.
        `.trim(),
      },
    },
  },
  argTypes: {
    checked: { control: "boolean", description: "Controlled on/off state." },
    defaultChecked: { control: "boolean", description: "Uncontrolled initial state." },
    disabled: { control: "boolean" },
    required: { control: "boolean" },
    id: { control: "text" },
    name: { control: "text" },
    value: { control: "text" },
    onCheckedChange: { action: "checkedChange" },
  },
};
export default meta;

type Story = StoryObj<typeof Switch>;

export const Playground: Story = {
  args: { id: "playground", defaultChecked: false, disabled: false },
  render: (args) => (
    <Space size="middle" align="center">
      <Switch {...args} />
      <Label htmlFor={args.id ?? "playground"}>Toggle me</Label>
    </Space>
  ),
};

export const Off: Story = { args: { id: "off" } };
export const On: Story = { args: { id: "on", defaultChecked: true } };

export const States: Story = {
  name: "Showcase — all states",
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex vertical gap="middle">
      <Space size="middle" align="center">
        <Switch id="s-off" />
        <Label htmlFor="s-off">Off</Label>
      </Space>
      <Space size="middle" align="center">
        <Switch id="s-on" defaultChecked />
        <Label htmlFor="s-on">On</Label>
      </Space>
      <Space size="middle" align="center">
        <Switch id="s-disabled-off" disabled />
        <Label htmlFor="s-disabled-off">Disabled off</Label>
      </Space>
      <Space size="middle" align="center">
        <Switch id="s-disabled-on" disabled defaultChecked />
        <Label htmlFor="s-disabled-on">Disabled on</Label>
      </Space>
    </Flex>
  ),
};

export const Disabled: Story = {
  name: "States — disabled",
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex vertical gap="small">
      <Space size="middle" align="center">
        <Switch id="ds1" disabled />
        <Label htmlFor="ds1">Disabled off</Label>
      </Space>
      <Space size="middle" align="center">
        <Switch id="ds2" disabled defaultChecked />
        <Label htmlFor="ds2">Disabled on</Label>
      </Space>
    </Flex>
  ),
};

function ThemeToggleDemo() {
  const [dark, setDark] = useState(false);
  return (
    <Space size="middle" align="center">
      <Sun size={16} aria-hidden style={{ color: dark ? "var(--muted-foreground)" : "var(--foreground)" }} />
      <Switch
        id="theme"
        checked={dark}
        onCheckedChange={setDark}
        aria-label="Toggle dark mode"
      />
      <Moon size={16} aria-hidden style={{ color: dark ? "var(--foreground)" : "var(--muted-foreground)" }} />
    </Space>
  );
}

export const ThemeToggle: Story = {
  name: "Composition — theme toggle",
  parameters: { controls: { disable: true } },
  render: () => <ThemeToggleDemo />,
};

interface SettingRow {
  id: string;
  label: string;
  description: string;
  defaultOn: boolean;
}
const NOTIFY_SETTINGS: SettingRow[] = [
  {
    id: "n-mentions",
    label: "メンション",
    description: "コメントでメンションされたら通知します。",
    defaultOn: true,
  },
  {
    id: "n-assignments",
    label: "タスク割り当て",
    description: "新しいタスクが割り当てられたら通知します。",
    defaultOn: true,
  },
  {
    id: "n-deploy",
    label: "デプロイ完了",
    description: "本番環境へのデプロイが完了したら通知します。",
    defaultOn: false,
  },
  {
    id: "n-weekly",
    label: "ウィークリーサマリー",
    description: "毎週月曜日にアクティビティをまとめて送信します。",
    defaultOn: false,
  },
];

export const SettingsPanel: Story = {
  name: "Composition — settings panel",
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex
      vertical
      gap="middle"
      style={{
        width: 420,
        padding: "var(--spacing-6)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        background: "var(--card)",
      }}
    >
      <h4 style={{ margin: 0, fontWeight: 600 }}>通知</h4>
      <p style={{ margin: 0, color: "var(--muted-foreground)", fontSize: 13 }}>
        Configure which events trigger a notification.
      </p>
      <Flex vertical gap="middle">
        {NOTIFY_SETTINGS.map((row) => (
          <Flex key={row.id} justify="space-between" align="start" gap="middle">
            <Flex vertical gap="small" style={{ flex: 1 }}>
              <Label htmlFor={row.id}>{row.label}</Label>
              <span style={{ color: "var(--muted-foreground)", fontSize: 12 }}>
                {row.description}
              </span>
            </Flex>
            <Switch id={row.id} defaultChecked={row.defaultOn} />
          </Flex>
        ))}
      </Flex>
    </Flex>
  ),
};

function ControlledDemo() {
  const [on, setOn] = useState(true);
  return (
    <Flex vertical gap="small">
      <Space size="middle" align="center">
        <Switch id="controlled" checked={on} onCheckedChange={setOn} />
        <Label htmlFor="controlled">Controlled — state: {on ? "on" : "off"}</Label>
      </Space>
      <span style={{ color: "var(--muted-foreground)", fontSize: 12 }}>
        Parent owns state; child reflects.
      </span>
    </Flex>
  );
}

export const Controlled: Story = {
  name: "Behaviour — controlled",
  parameters: { controls: { disable: true } },
  render: () => <ControlledDemo />,
};
