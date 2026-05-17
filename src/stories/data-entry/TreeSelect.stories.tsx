import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { TreeSelect, type TreeSelectOption } from "../../components/data-entry/TreeSelect";
import { Flex } from "../../components/layout";

/**
 * data-entry/TreeSelect — tree-structured
 * Select primitive (single + multi).
 *
 * Cardinal rules honoured:
 *   §3  — Radix Popover + Checkbox (multi mode)
 *   §21 — every axis (theme/accent/density/font-size)
 *   §22 — every literal token-pinned
 *   §23 — vocabulary: `value` / `defaultValue` / `onValueChange`,
 *          `multiple` (boolean — NEVER `mode="multiple"`),
 *          `size`, `open` / `defaultOpen` / `onOpenChange`,
 *          `defaultExpandAll`
 *   §25 — story is docs; primitive is the UI
 */

const orgTree: TreeSelectOption[] = [
  {
    value: "godx-tokyo",
    label: "GoDX 東京本社",
    children: [
      {
        value: "engineering",
        label: "エンジニアリング部",
        children: [
          { value: "frontend", label: "フロントエンド課" },
          { value: "backend", label: "バックエンド課" },
          { value: "platform", label: "プラットフォーム課" },
        ],
      },
      {
        value: "design",
        label: "デザイン部",
        children: [
          { value: "product-design", label: "プロダクトデザイン課" },
          { value: "brand", label: "ブランド課" },
        ],
      },
    ],
  },
  {
    value: "stores",
    label: "店舗",
    children: [
      { value: "shibuya-honten", label: "渋谷本店" },
      { value: "omotesando", label: "表参道店" },
      { value: "yokohama", label: "横浜店" },
    ],
  },
];

const departments: TreeSelectOption[] = [
  {
    value: "engineering",
    label: "エンジニアリング",
    children: [
      { value: "frontend", label: "フロントエンド" },
      { value: "backend", label: "バックエンド" },
      { value: "qa", label: "QA" },
    ],
  },
  {
    value: "business",
    label: "ビジネス",
    children: [
      { value: "sales", label: "営業" },
      { value: "marketing", label: "マーケティング" },
      { value: "support", label: "カスタマーサポート" },
    ],
  },
  {
    value: "ops",
    label: "管理",
    children: [
      { value: "hr", label: "人事" },
      { value: "finance", label: "経理" },
    ],
  },
];

const meta: Meta<typeof TreeSelect> = {
  title: "Data Entry/TreeSelect",
  component: TreeSelect,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
**TreeSelect** — recursive tree Select. Renders a Popover with
expandable nodes; \`multiple\` toggles between single-radio and
multi-checkbox selection.

Vocabulary per cardinal rule 23 §B:
- \`value\` / \`defaultValue\` / \`onValueChange\` — selection state
  (single: \`string\`; multi: \`string[]\`)
- \`multiple\`: boolean — NEVER \`mode="multiple"\`
- \`size\`: \`"small" | "default" | "large"\`
- \`defaultExpandAll\`: expand every node on first render
        `.trim(),
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof TreeSelect>;

// ─── Single (org tree) ──────────────────────────────────────────

export const Single: Story = {
  render: function Single() {
    const [value, setValue] = useState<string | string[]>("frontend");
    return (
      <Flex vertical gap="small" style={{ maxWidth: 320 }}>
        <TreeSelect
          options={orgTree}
          value={value}
          onValueChange={setValue}
          placeholder="所属部署を選択"
        />
        <span style={{ fontSize: "var(--text-xs)", color: "var(--muted-foreground)" }}>
          Selected: <code className="mono">{JSON.stringify(value)}</code>
        </span>
      </Flex>
    );
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const portal = canvasElement.ownerDocument.body;

    await step("trigger shows initial selection", async () => {
      const trigger = canvas.getByRole("combobox");
      await expect(trigger).toBeInTheDocument();
    });

    await step("clicking trigger opens the tree popover", async () => {
      const trigger = canvas.getByRole("combobox");
      await userEvent.click(trigger);
      await waitFor(() => {
        expect(within(portal).getByText("GoDX 東京本社")).toBeInTheDocument();
      });
    });
  },
};

// ─── Multi (departments multi-select) ───────────────────────────

export const Multi: Story = {
  render: function Multi() {
    const [value, setValue] = useState<string | string[]>(["frontend", "sales"]);
    return (
      <Flex vertical gap="small" style={{ maxWidth: 360 }}>
        <TreeSelect
          options={departments}
          value={value}
          onValueChange={setValue}
          multiple
          placeholder="部門を複数選択"
        />
        <span style={{ fontSize: "var(--text-xs)", color: "var(--muted-foreground)" }}>
          Selected: <code className="mono">{JSON.stringify(value)}</code>
        </span>
      </Flex>
    );
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const portal = canvasElement.ownerDocument.body;

    await step("opening + ticking a node grows the selected array", async () => {
      const trigger = canvas.getByRole("combobox");
      await userEvent.click(trigger);
      await waitFor(() => {
        expect(within(portal).getByText("バックエンド")).toBeInTheDocument();
      });
      await userEvent.click(within(portal).getByText("バックエンド"));
      await waitFor(() => {
        expect(canvas.getByText(/"backend"/)).toBeInTheDocument();
      });
    });
  },
};

// ─── ExpandedByDefault ──────────────────────────────────────────

export const ExpandedByDefault: Story = {
  render: () => (
    <div style={{ maxWidth: 360 }}>
      <TreeSelect
        options={orgTree}
        defaultValue="brand"
        defaultExpandAll
        placeholder="(全て展開済み)"
      />
    </div>
  ),
};
