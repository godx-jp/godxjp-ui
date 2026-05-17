import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { AutoComplete, type AutoCompleteOption } from "../../../../components/primitives/AutoComplete";
import { Flex } from "../../../../components/primitives/layout";

/**
 * new-primitives/components/data-entry/AutoComplete — Combobox-backed
 * filtered text input.
 *
 * Cardinal rules honoured:
 *   §3  — Radix Popover + cmdk via Combobox primitives
 *   §21 — every axis (theme/accent/density/font-size)
 *   §23 — vocabulary: `value` / `defaultValue` / `onValueChange`,
 *          `size`, `disabled`, `open` / `defaultOpen` / `onOpenChange`,
 *          `allowCustomValue`
 *   §25 — story is docs; primitive is the UI
 */

const employees: AutoCompleteOption[] = [
  { value: "tanaka-misaki", label: "田中 美咲" },
  { value: "sato-kenji", label: "佐藤 健治" },
  { value: "suzuki-rina", label: "鈴木 莉奈" },
  { value: "takahashi-haruto", label: "高橋 陽斗" },
  { value: "nguyen-lan", label: "Nguyễn Lan" },
];

const meta: Meta<typeof AutoComplete> = {
  title: "new-primitives/Components/Data Entry/AutoComplete",
  component: AutoComplete,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
**AutoComplete** — Combobox-backed text input with case-insensitive
suggestion filtering. Selecting a suggestion commits its \`value\`;
typing keeps the popover open so the dropdown stays in-sync.

Vocabulary per cardinal rule 23 §B:
- \`value\` / \`defaultValue\` / \`onValueChange\` — selection state
- \`size\`: \`"small" | "default" | "large"\`
- \`allowCustomValue\`: keep the typed text even when no option matches
        `.trim(),
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof AutoComplete>;

// ─── Default ────────────────────────────────────────────────────

function DefaultDemo() {
  const [value, setValue] = useState("");
  return (
    <div style={{ maxWidth: 280 }}>
      <AutoComplete
        options={employees}
        value={value}
        onValueChange={setValue}
        placeholder="名前を入力"
      />
    </div>
  );
}

export const Default: Story = {
  render: () => <DefaultDemo />,
};

// ─── WithCustomValue ────────────────────────────────────────────

function CustomValueDemo() {
  const [value, setValue] = useState("");
  return (
    <Flex vertical gap="small" style={{ maxWidth: 320 }}>
      <AutoComplete
        options={employees}
        value={value}
        onValueChange={setValue}
        allowCustomValue
        placeholder="社員名 or 自由入力"
      />
      <span style={{ fontSize: "var(--text-xs)", color: "var(--muted-foreground)" }}>
        Current value: <code className="mono">{JSON.stringify(value)}</code>
      </span>
    </Flex>
  );
}

export const WithCustomValue: Story = {
  render: () => <CustomValueDemo />,
};

// ─── Sizes ──────────────────────────────────────────────────────

export const Sizes: Story = {
  render: () => (
    <Flex vertical gap="small" style={{ maxWidth: 280 }}>
      <AutoComplete options={employees} size="small" placeholder="small (28px)" />
      <AutoComplete options={employees} size="default" placeholder="default (32px)" />
      <AutoComplete options={employees} size="large" placeholder="large (36px)" />
    </Flex>
  ),
};

// ─── Disabled ───────────────────────────────────────────────────

export const Disabled: Story = {
  render: () => (
    <div style={{ maxWidth: 280 }}>
      <AutoComplete
        options={employees}
        disabled
        defaultValue="tanaka-misaki"
        placeholder="disabled"
      />
    </div>
  ),
};
