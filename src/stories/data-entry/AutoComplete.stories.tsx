import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { AutoComplete, type AutoCompleteOption } from "../../components/data-entry/AutoComplete";
import { Flex } from "../../components/layout";

/**
 * data-entry/AutoComplete — free-text input with
 * filtered suggestions (cmdk + Radix Popover).
 *
 * Cardinal rules honoured:
 *   §3  — Radix Popover + cmdk for keyboard / ARIA
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
  title: "Data Entry/AutoComplete",
  component: AutoComplete,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
**AutoComplete** — free-text input with case-insensitive suggestion
filtering (cmdk + Radix Popover). Selecting a suggestion commits its
\`value\`; typing keeps the popover open so the dropdown stays in-sync.

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

export const Default: Story = {
  render: function Default() {
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
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("combobox");

    await step("typing updates the input", async () => {
      await userEvent.type(input, "田");
      await expect(input).toHaveValue("田");
    });
  },
};

// ─── WithCustomValue ────────────────────────────────────────────

export const WithCustomValue: Story = {
  render: function WithCustomValue() {
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
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("typing a non-matching value commits the custom text", async () => {
      const input = canvas.getByRole("combobox") as HTMLInputElement;
      await userEvent.click(input);
      await userEvent.type(input, "新規候補者");
      await waitFor(() => {
        expect(input.value).toBe("新規候補者");
      });
    });
  },
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

// ─── EmailDomain · autocomplete email suffix ────────────────────

const emailDomains: AutoCompleteOption[] = [
  { value: "gmail.com", label: "@gmail.com" },
  { value: "outlook.com", label: "@outlook.com" },
  { value: "yahoo.co.jp", label: "@yahoo.co.jp" },
  { value: "icloud.com", label: "@icloud.com" },
  { value: "famgia.com", label: "@famgia.com (社内)" },
];

export const EmailDomain: Story = {
  name: "Email domain · autocomplete suffix",
  render: function EmailDomain() {
    const [value, setValue] = useState("");
    return (
      <Flex vertical gap="small" style={{ maxWidth: 320 }}>
        <AutoComplete
          options={emailDomains}
          value={value}
          onValueChange={setValue}
          allowCustomValue
          placeholder="example@gmail.com"
        />
        <span style={{ fontSize: "var(--text-xs)", color: "var(--muted-foreground)" }}>
          ドメイン候補が表示されます
        </span>
      </Flex>
    );
  },
};

// ─── Tags · suggest existing tags ───────────────────────────────

const tagSuggestions: AutoCompleteOption[] = [
  { value: "frontend", label: "frontend" },
  { value: "react", label: "react" },
  { value: "typescript", label: "typescript" },
  { value: "tailwind", label: "tailwind" },
  { value: "backend", label: "backend" },
  { value: "node", label: "node" },
  { value: "postgres", label: "postgres" },
  { value: "design-system", label: "design-system" },
  { value: "a11y", label: "a11y" },
  { value: "performance", label: "performance" },
];

export const TagSuggest: Story = {
  name: "Tag suggest · existing tags + new",
  render: function TagSuggest() {
    const [value, setValue] = useState("");
    return (
      <Flex vertical gap="small" style={{ maxWidth: 320 }}>
        <AutoComplete
          options={tagSuggestions}
          value={value}
          onValueChange={setValue}
          allowCustomValue
          placeholder="タグを入力 (例: react)"
        />
        <span style={{ fontSize: "var(--text-xs)", color: "var(--muted-foreground)" }}>
          既存タグから補完。新規タグも作成できます。
        </span>
      </Flex>
    );
  },
};

// ─── LocationSearch · cities ────────────────────────────────────

const cities: AutoCompleteOption[] = [
  { value: "tokyo", label: "東京 — JP" },
  { value: "osaka", label: "大阪 — JP" },
  { value: "kyoto", label: "京都 — JP" },
  { value: "hokkaido", label: "札幌 — JP" },
  { value: "fukuoka", label: "福岡 — JP" },
  { value: "hanoi", label: "Hà Nội — VN" },
  { value: "hcm", label: "TP Hồ Chí Minh — VN" },
  { value: "manila", label: "Manila — PH" },
  { value: "cebu", label: "Cebu — PH" },
];

export const LocationSearch: Story = {
  name: "Location search · global cities",
  render: function LocationSearch() {
    const [value, setValue] = useState("");
    return (
      <div style={{ maxWidth: 320 }}>
        <AutoComplete
          options={cities}
          value={value}
          onValueChange={setValue}
          placeholder="都市を検索"
        />
      </div>
    );
  },
};
