import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { CheckCircle2, CircleAlert, Mail, Search } from "lucide-react";
import { Input, Textarea } from "../../components/data-entry/Input";
import { InputPassword } from "../../components/data-entry/InputPassword";
import { InputSearch } from "../../components/data-entry/InputSearch";
import { Flex } from "../../components/layout";

/**
 * data-entry/Input — text input family.
 *
 * Four primitives:
 *   - `<Input>`          — base text input + slot props.
 *   - `<Textarea>`       — multi-line variant (autoSize, showCount).
 *   - `<InputPassword>`  — show/hide toggle.
 *   - `<InputSearch>`    — leading magnifier + trailing clear.
 *
 * Cardinal rules honoured:
 *   §14 — native `<input>` (no Radix needed at this level).
 *   §21 — every axis (theme/accent/density/font-size).
 *   §22 — every literal token-pinned (.input height = --density-element-*).
 *   §23 — vocabulary: `size` ("small" | "default" | "large"),
 *          `status` ("default" | "success" | "warning" | "error"),
 *          slot props (`prefix` / `suffix` / `addonBefore` / `addonAfter`).
 *   §24 — mobile-first touch-target floor (44px on xs/sm).
 *   §25 — story is docs; primitive is the UI.
 */

const meta: Meta<typeof Input> = {
  title: "Data Entry/Input",
  component: Input,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
**Input family** — canonical text input atoms. Three sizes × four
status states + four slot positions (\`prefix\` / \`suffix\` INSIDE the
chrome; \`addonBefore\` / \`addonAfter\` OUTSIDE).

Vocabulary per cardinal rule 23 §B:
- \`size\`: \`"small" | "default" | "large"\`
- \`status\`: \`"default" | "success" | "warning" | "error"\`

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
  render: () => (
    <div style={{ maxWidth: 280 }}>
      <Input placeholder="名前を入力" />
    </div>
  ),
};

// ─── WithPrefix — prefix / suffix slot props ────────────────────

export const WithPrefix: Story = {
  name: "WithPrefix · prefix and suffix slots",
  render: () => (
    <Flex vertical gap="small" style={{ maxWidth: 320 }}>
      <Input prefix={<Search size={14} aria-hidden />} placeholder="検索…" />
      <Input
        prefix={<Mail size={14} aria-hidden />}
        placeholder="メールアドレス"
        type="email"
      />
      <Input
        status="success"
        defaultValue="example@famgia.com"
        suffix={
          <CheckCircle2
            size={14}
            aria-hidden
            style={{ color: "var(--success)" }}
          />
        }
      />
      <Input
        status="error"
        defaultValue="invalid-email"
        suffix={
          <CircleAlert
            size={14}
            aria-hidden
            style={{ color: "var(--destructive)" }}
          />
        }
      />
    </Flex>
  ),
};

// ─── Sizes — small / default / large ────────────────────────────

export const Sizes: Story = {
  render: () => (
    <Flex vertical gap="small" style={{ maxWidth: 280 }}>
      <Input size="small" placeholder="small (28px)" />
      <Input size="default" placeholder="default (32px)" />
      <Input size="large" placeholder="large (36px)" />
    </Flex>
  ),
};

// ─── Status — success / warning / error ─────────────────────────

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

// ─── Disabled ───────────────────────────────────────────────────

export const Disabled: Story = {
  render: () => (
    <Flex vertical gap="small" style={{ maxWidth: 280 }}>
      <Input placeholder="入力できません" disabled />
      <Input value="読み取り専用の値" readOnly />
      <Input
        prefix={<Mail size={14} aria-hidden />}
        defaultValue="example@famgia.com"
        disabled
      />
    </Flex>
  ),
};

// ─── Textarea — autoSize + showCount ────────────────────────────

function AutoSizeDemo() {
  const [value, setValue] = useState(
    "auto-grow に応じて高さが自動で広がります。\n改行を増やしてみてください。",
  );
  return (
    <Textarea
      autoSize={{ minRows: 2, maxRows: 6 }}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}

export const TextareaStory: Story = {
  name: "Textarea · autoSize + showCount",
  render: () => (
    <Flex vertical gap="middle" style={{ maxWidth: 360 }}>
      <Textarea rows={3} placeholder="複数行の入力" />
      <AutoSizeDemo />
      <Textarea
        rows={4}
        showCount
        maxLength={140}
        defaultValue="入力できる残り文字数を右下に表示します。"
      />
    </Flex>
  ),
};

// ─── InputPassword — show / hide toggle ─────────────────────────

export const Password: Story = {
  name: "InputPassword · toggle visibility",
  render: () => (
    <Flex vertical gap="small" style={{ maxWidth: 320 }}>
      <InputPassword placeholder="••••••••••" />
      <InputPassword
        defaultValue="Sup3rSecret!"
        defaultRevealed
        toggleLabels={{ show: "表示", hide: "非表示" }}
      />
      <InputPassword
        placeholder="無効化された状態"
        defaultValue="cannot-edit"
        disabled
      />
    </Flex>
  ),
};

// ─── InputSearch — leading icon + clear ─────────────────────────

function ControlledSearch() {
  const [q, setQ] = useState("企画");
  return (
    <Flex vertical gap="small" style={{ maxWidth: 320 }}>
      <InputSearch placeholder="従業員を検索" />
      <InputSearch
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onClear={() => setQ("")}
        placeholder="検索ワード (制御モード)"
      />
      <span
        style={{
          fontSize: "var(--text-xs)",
          color: "var(--muted-foreground)",
        }}
      >
        Current query: <code className="mono">{JSON.stringify(q)}</code>
      </span>
    </Flex>
  );
}

export const SearchStory: Story = {
  name: "InputSearch · with clear button",
  render: () => <ControlledSearch />,
};
