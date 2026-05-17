import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { CheckCircle2, CircleAlert, Mail, Search } from "lucide-react";
import { Input, Textarea } from "../../../../components/primitives/Input";
import { Flex } from "../../../../components/primitives/layout";

/**
 * new-primitives/components/data-entry/Input — text input atom.
 *
 * 100% mapped to dxs-kintai design canon
 * (`design-handoff/.../preview/comp-inputs.html` — 619-line spec).
 *
 * Cardinal rules honoured:
 *   §14 — native `<input>` (no Radix needed at this level)
 *   §21 — every axis (theme/accent/density/font-size)
 *   §22 — every literal token-pinned (.input height = --density-element-*)
 *   §23 — vocabulary: `size` ("small" | "default" | "large"),
 *          `status` ("default" | "success" | "warning" | "error"),
 *          slot props (`prefix` / `suffix` / `addonBefore` /
 *          `addonAfter`) per new-docs/04 §J
 *   §24 — mobile-first touch-target floor (@media <md → 44px)
 *   §25 — story is docs; primitive is the UI (see Input.tsx +
 *          `.input` / `.input-wrap` CSS in shell.css)
 */

const meta: Meta<typeof Input> = {
  title: "new-primitives/Components/Data Entry/Input",
  component: Input,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
**Input** — canonical text input atom. Three sizes × four status
states + four slot positions (\`prefix\` / \`suffix\` INSIDE the
chrome; \`addonBefore\` / \`addonAfter\` OUTSIDE).

Vocabulary per cardinal rule 23 §B:
- \`size\`: \`"small" | "default" | "large"\`
- \`status\`: \`"default" | "success" | "warning" | "error"\`
  (form-field validation state — drives border + ring + helper)

Mobile-first per cardinal rule 24: input height floors to 44px on
\`xs/sm\` viewports for WCAG touch-target compliance.
        `.trim(),
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Input>;

// ─── Default ────────────────────────────────────────────────────

export const Default: Story = {
  render: () => <Input placeholder="名前を入力" />,
};

// ─── Sizes ──────────────────────────────────────────────────────

export const Sizes: Story = {
  render: () => (
    <Flex vertical gap="small" style={{ maxWidth: 280 }}>
      <Input size="small" placeholder="small (28px)" />
      <Input size="default" placeholder="default (32px)" />
      <Input size="large" placeholder="large (36px)" />
    </Flex>
  ),
};

// ─── Status (validation) ────────────────────────────────────────

export const Status: Story = {
  render: () => (
    <Flex vertical gap="small" style={{ maxWidth: 320 }}>
      <Input placeholder="default" />
      <Input status="success" defaultValue="example@famgia.com" />
      <Input status="warning" defaultValue="weak password" />
      <Input status="error" defaultValue="invalid-email" />
    </Flex>
  ),
};

// ─── Affixes — prefix / suffix INSIDE the chrome ────────────────

export const Affixes: Story = {
  name: "Slots · prefix / suffix",
  render: () => (
    <Flex vertical gap="small" style={{ maxWidth: 320 }}>
      <Input prefix={<Search size={14} aria-hidden />} placeholder="検索…" />
      <Input prefix={<Mail size={14} aria-hidden />} placeholder="メール" type="email" />
      <Input
        status="success"
        defaultValue="example@famgia.com"
        suffix={<CheckCircle2 size={14} aria-hidden style={{ color: "var(--success)" }} />}
      />
      <Input
        status="error"
        defaultValue="invalid-email"
        suffix={<CircleAlert size={14} aria-hidden style={{ color: "var(--destructive)" }} />}
      />
    </Flex>
  ),
};

// ─── Addons — addonBefore / addonAfter OUTSIDE the chrome ───────

export const Addons: Story = {
  name: "Slots · addonBefore / addonAfter",
  render: () => (
    <Flex vertical gap="small" style={{ maxWidth: 360 }}>
      <Input addonBefore="https://" placeholder="example" addonAfter=".com" />
      <Input addonBefore="¥" type="number" defaultValue="2900" addonAfter="/月" />
      <Input addonBefore="+81" placeholder="090-1234-5678" type="tel" />
    </Flex>
  ),
};

// ─── States ─────────────────────────────────────────────────────

export const States: Story = {
  render: () => (
    <Flex vertical gap="small" style={{ maxWidth: 280 }}>
      <Input placeholder="enabled" />
      <Input placeholder="disabled" disabled />
      <Input value="readonly value" readOnly />
      <Input placeholder="required" required />
    </Flex>
  ),
};

// ─── Controlled ─────────────────────────────────────────────────

function ControlledDemo() {
  const [value, setValue] = useState("");
  return (
    <Flex vertical gap="small" style={{ maxWidth: 320 }}>
      <Input
        placeholder="Type something"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        suffix={
          value
            ? <CheckCircle2 size={14} aria-hidden style={{ color: "var(--success)" }} />
            : undefined
        }
        status={value ? "success" : "default"}
      />
      <span style={{ fontSize: "var(--text-xs)", color: "var(--muted-foreground)" }}>
        Current value: <code className="mono">{JSON.stringify(value)}</code>
      </span>
    </Flex>
  );
}

export const Controlled: Story = {
  render: () => <ControlledDemo />,
};

// ─── Textarea ───────────────────────────────────────────────────

export const TextareaBase: Story = {
  name: "Textarea · base",
  render: () => (
    <Textarea rows={4} placeholder="複数行入力" style={{ maxWidth: 360 }} />
  ),
};

export const TextareaWithCount: Story = {
  name: "Textarea · showCount + maxLength",
  render: () => (
    <div style={{ maxWidth: 360 }}>
      <Textarea
        rows={4}
        showCount
        maxLength={140}
        defaultValue="入力できる残り文字数を右下に表示します。"
      />
    </div>
  ),
};

export const TextareaResize: Story = {
  name: "Textarea · resize axis",
  render: () => (
    <Flex vertical gap="middle" style={{ maxWidth: 360 }}>
      <div>
        <div style={{ fontSize: "var(--text-xs)", color: "var(--muted-foreground)", marginBottom: 4 }}>
          resize="none" (default)
        </div>
        <Textarea rows={3} resize="none" defaultValue="フレームは固定" />
      </div>
      <div>
        <div style={{ fontSize: "var(--text-xs)", color: "var(--muted-foreground)", marginBottom: 4 }}>
          resize="vertical"
        </div>
        <Textarea rows={3} resize="vertical" defaultValue="縦方向にリサイズ可" />
      </div>
    </Flex>
  ),
};

// ─── Mobile-first touch target ──────────────────────────────────

export const MobileTouchTarget: Story = {
  name: "Mobile-first touch target (cardinal rule 24)",
  parameters: {
    docs: {
      description: {
        story: `Resize the Storybook canvas (Viewports toolbar) to **mobile1**
(< 768px) and observe every input flooring to 44px min-height —
WCAG 2.1 AA touch target.`.trim(),
      },
    },
  },
  render: () => (
    <Flex vertical gap="small" style={{ maxWidth: 320 }}>
      <Input size="small" placeholder="small (floors to 44 on mobile)" />
      <Input size="default" placeholder="default" />
      <Input size="large" placeholder="large" />
    </Flex>
  ),
};
