import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Globe } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "../components/primitives/Select";
import { Label } from "../components/primitives/Label";
import { Flex, Space } from "../components/primitives/layout";

const meta: Meta = {
  title: "Primitives/Select",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
**Select** — dropdown field, Radix-backed.

Wraps \`@radix-ui/react-select\` so portalled popover, keyboard navigation, type-ahead,
focus management, and \`role="listbox"\` semantics are handled. Visual contract:
trigger uses \`.input\` + \`.select-trigger\`; the popover uses \`.select-content\` /
\`.select-item\` / \`.select-label\` / \`.select-separator\` from \`tokens.css\`.

This primitive is a **composite** — you assemble it from the exported parts so
forks (per shadcn philosophy) stay easy:

\`\`\`tsx
<Select defaultValue="ja-JP">
  <SelectTrigger><SelectValue placeholder="Choose…" /></SelectTrigger>
  <SelectContent>
    <SelectItem value="ja-JP">日本語</SelectItem>
    <SelectItem value="en-US">English</SelectItem>
  </SelectContent>
</Select>
\`\`\`

Use \`SelectGroup\` + \`SelectLabel\` + \`SelectSeparator\` to break long lists into
labelled sections. \`SelectScrollUpButton\` / \`SelectScrollDownButton\` are mounted
inside \`SelectContent\` automatically; they appear only when the list overflows.

**Accessibility (WCAG 2.1 AA)** — Radix manages \`role="combobox"\` on the trigger,
\`role="listbox"\` on the content, \`aria-activedescendant\`, type-ahead, focus return
to trigger on close, and reduced-motion respect. Pair the trigger with
\`<Label htmlFor>\` (the trigger forwards \`id\`).
        `.trim(),
      },
    },
  },
};
export default meta;

type Story = StoryObj;

const LOCALES = [
  { v: "ja-JP", label: "日本語" },
  { v: "en-US", label: "English" },
  { v: "vi-VN", label: "Tiếng Việt" },
  { v: "fil-PH", label: "Filipino" },
  { v: "ko-KR", label: "한국어" },
];

export const Playground: Story = {
  args: {
    placeholder: "Choose a locale",
    disabled: false,
  },
  argTypes: {
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
  },
  render: (args) => (
    <div style={{ width: 240 }}>
      <Select disabled={args.disabled as boolean | undefined}>
        <SelectTrigger>
          <SelectValue placeholder={args.placeholder as string} />
        </SelectTrigger>
        <SelectContent>
          {LOCALES.map((l) => (
            <SelectItem key={l.v} value={l.v}>{l.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  ),
};

export const Default: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ width: 240 }}>
      <Select defaultValue="ja-JP">
        <SelectTrigger>
          <SelectValue placeholder="Choose a locale" />
        </SelectTrigger>
        <SelectContent>
          {LOCALES.map((l) => (
            <SelectItem key={l.v} value={l.v}>{l.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  ),
};

export const WithPlaceholder: Story = {
  name: "States — empty (placeholder shown)",
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ width: 240 }}>
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="未選択 — 地域を選択" />
        </SelectTrigger>
        <SelectContent>
          {LOCALES.map((l) => (
            <SelectItem key={l.v} value={l.v}>{l.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  ),
};

export const Disabled: Story = {
  name: "States — disabled",
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ width: 240 }}>
      <Select disabled defaultValue="ja-JP">
        <SelectTrigger>
          <SelectValue placeholder="Choose…" />
        </SelectTrigger>
        <SelectContent>
          {LOCALES.map((l) => (
            <SelectItem key={l.v} value={l.v}>{l.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  ),
};

export const DisabledItem: Story = {
  name: "Items — some disabled",
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ width: 280 }}>
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Choose a plan" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="starter">Starter — ¥0/mo</SelectItem>
          <SelectItem value="pro">Pro — ¥980/mo</SelectItem>
          <SelectItem value="team" disabled>Team — ¥4,800/mo (sold out)</SelectItem>
          <SelectItem value="enterprise">Enterprise — Contact us</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};

export const Grouped: Story = {
  name: "Items — grouped + separators",
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ width: 280 }}>
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Choose timezone" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>アジア</SelectLabel>
            <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
            <SelectItem value="Asia/Seoul">Asia/Seoul</SelectItem>
            <SelectItem value="Asia/Singapore">Asia/Singapore</SelectItem>
            <SelectItem value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>ヨーロッパ</SelectLabel>
            <SelectItem value="Europe/London">Europe/London</SelectItem>
            <SelectItem value="Europe/Berlin">Europe/Berlin</SelectItem>
            <SelectItem value="Europe/Paris">Europe/Paris</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>アメリカ</SelectLabel>
            <SelectItem value="America/New_York">America/New_York</SelectItem>
            <SelectItem value="America/Los_Angeles">America/Los_Angeles</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  ),
};

const MANY = Array.from({ length: 24 }, (_, i) => ({
  v: `proj-${(i + 1).toString().padStart(3, "0")}`,
  label: `Project ${(i + 1).toString().padStart(3, "0")} — ${
    ["godx-admin", "godx-forge", "godxjp-ui", "media-service", "knowledge-service"][i % 5]
  }`,
}));

export const LongList: Story = {
  name: "Items — long list (scroll buttons)",
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ width: 320 }}>
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="プロジェクトを選択" />
        </SelectTrigger>
        <SelectContent style={{ maxHeight: 220 }}>
          {MANY.map((m) => (
            <SelectItem key={m.v} value={m.v}>{m.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  ),
};

function ControlledDemo() {
  const [v, setV] = useState("starter");
  return (
    <Flex vertical gap="small" style={{ width: 280 }}>
      <Label htmlFor="plan-select">プラン</Label>
      <Select value={v} onValueChange={setV}>
        <SelectTrigger id="plan-select">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="starter">Starter — ¥0/mo</SelectItem>
          <SelectItem value="pro">Pro — ¥980/mo</SelectItem>
          <SelectItem value="team">Team — ¥4,800/mo</SelectItem>
          <SelectItem value="enterprise">Enterprise — Contact us</SelectItem>
        </SelectContent>
      </Select>
      <span style={{ color: "var(--muted-foreground)", fontSize: 12 }}>
        Selected: <code>{v}</code>
      </span>
    </Flex>
  );
}

export const Controlled: Story = {
  name: "Behaviour — controlled",
  parameters: { controls: { disable: true } },
  render: () => <ControlledDemo />,
};

export const WithLabel: Story = {
  name: "Composition — paired with Label",
  parameters: { controls: { disable: true } },
  render: () => (
    <Flex vertical gap="small" style={{ width: 280 }}>
      <Label htmlFor="locale-trigger">表示言語</Label>
      <Select defaultValue="ja-JP">
        <SelectTrigger id="locale-trigger">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {LOCALES.map((l) => (
            <SelectItem key={l.v} value={l.v}>{l.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Flex>
  ),
};

export const FilterBar: Story = {
  name: "Composition — filter bar",
  parameters: { controls: { disable: true } },
  render: () => (
    <Space size="middle" align="center">
      <Globe size={16} aria-hidden />
      <Select defaultValue="all">
        <SelectTrigger style={{ width: 180 }}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">すべての地域</SelectItem>
          <SelectItem value="jp">日本</SelectItem>
          <SelectItem value="apac">APAC</SelectItem>
          <SelectItem value="emea">EMEA</SelectItem>
          <SelectItem value="amer">Americas</SelectItem>
        </SelectContent>
      </Select>
      <Select defaultValue="active">
        <SelectTrigger style={{ width: 160 }}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="paused">Paused</SelectItem>
          <SelectItem value="archived">Archived</SelectItem>
        </SelectContent>
      </Select>
    </Space>
  ),
};
