import type { Meta, StoryObj } from "@storybook/react";
import { Mail, User } from "lucide-react";
import { Label } from "../components/primitives/Label";
import { Input, Textarea } from "../components/primitives/Input";
import { Checkbox } from "../components/primitives/Checkbox";
import { Switch } from "../components/primitives/Switch";
import { Flex, Space } from "../components/primitives/layout";

const meta: Meta<typeof Label> = {
  title: "Primitives/Label",
  component: Label,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
**Label** — form-field label, Radix-backed.

Wraps \`@radix-ui/react-label\` so the native \`htmlFor\` / click-to-focus contract works
out of the box. Visual contract lives in the \`.label\` class in \`tokens.css\` — change
the token, every Label updates. The \`className\` prop is for layout glue only.

Pair with any focusable primitive: \`Input\`, \`Textarea\`, \`Checkbox\`, \`Switch\`,
\`Select\`, \`TimeInput\`. Required-field hint (\`*\`) is content, not a prop — render it
inline; ARIA-required lives on the input via \`aria-required\` / \`required\`.

**Accessibility (WCAG 2.1 AA)** — Radix Label clicks proxy focus to the matched
\`htmlFor\` target; screen readers announce label content as the field's accessible
name. Always provide \`htmlFor\` when the label is not wrapping its control.
        `.trim(),
      },
    },
  },
  argTypes: {
    children: { control: "text", description: "Label text." },
    htmlFor: {
      control: "text",
      description: "ID of the form control this labels (required for click-to-focus).",
    },
  },
};
export default meta;

type Story = StoryObj<typeof Label>;

export const Playground: Story = {
  args: { children: "Display name", htmlFor: "playground" },
  render: (args) => (
    <Flex vertical gap="small" style={{ maxWidth: 320 }}>
      <Label {...args} />
      <Input id="playground" placeholder="Yuki Tanaka" />
    </Flex>
  ),
};

export const Default: Story = { args: { children: "Display name" } };

export const PairedWithInput: Story = {
  name: "Composition — paired with Input",
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex vertical gap="small" style={{ maxWidth: 320 }}>
      <Label htmlFor="display_name">表示名</Label>
      <Input id="display_name" prefix={<User size={14} />} placeholder="Yuki Tanaka" />
      <span className="help" style={{ color: "var(--muted-foreground)", fontSize: 12 }}>
        Visible to teammates on every project.
      </span>
    </Flex>
  ),
};

export const RequiredField: Story = {
  name: "Composition — required field",
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex vertical gap="small" style={{ maxWidth: 320 }}>
      <Label htmlFor="req_email">
        メールアドレス <span style={{ color: "var(--destructive)" }} aria-hidden>*</span>
      </Label>
      <Input
        id="req_email"
        type="email"
        required
        aria-required
        prefix={<Mail size={14} />}
        placeholder="you@example.com"
      />
    </Flex>
  ),
};

export const PairedWithTextarea: Story = {
  name: "Composition — paired with Textarea",
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex vertical gap="small" style={{ maxWidth: 360 }}>
      <Label htmlFor="bio">自己紹介</Label>
      <Textarea id="bio" rows={4} maxLength={140} showCount placeholder="A short bio…" />
    </Flex>
  ),
};

export const PairedWithCheckbox: Story = {
  name: "Composition — paired with Checkbox",
  parameters: { controls: { disable: true } },
  render: () => (
    <Space size="middle" align="center">
      <Checkbox id="agree" />
      <Label htmlFor="agree">利用規約に同意します</Label>
    </Space>
  ),
};

export const PairedWithSwitch: Story = {
  name: "Composition — paired with Switch",
  parameters: { controls: { disable: true } },
  render: () => (
    <Space size="middle" align="center">
      <Switch id="notify-email" defaultChecked />
      <Label htmlFor="notify-email">メール通知を受け取る</Label>
    </Space>
  ),
};

export const InlineSpacing: Story = {
  name: "Spacing — stacked vs inline",
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex vertical gap="large" style={{ maxWidth: 360 }}>
      <Flex vertical gap="small">
        <Label htmlFor="stacked">Stacked label</Label>
        <Input id="stacked" placeholder="Field content" />
      </Flex>
      <Flex gap="middle" align="center">
        <Label htmlFor="inline" style={{ minWidth: 100 }}>Inline label</Label>
        <Input id="inline" placeholder="Field content" />
      </Flex>
    </Flex>
  ),
};
