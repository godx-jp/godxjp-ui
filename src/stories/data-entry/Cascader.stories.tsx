import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Cascader, type CascaderOption } from "../../components/data-entry/Cascader";
import { Flex } from "../../components/layout";

/**
 * data-entry/Cascader — nested column
 * navigation primitive.
 *
 * Cardinal rules honoured:
 *   §3  — Radix Popover for the floating panel
 *   §21 — every axis (theme/accent/density/font-size) via token chain
 *   §22 — every literal token-pinned (column min-width, paddings)
 *   §23 — vocabulary: `value` / `defaultValue` / `onValueChange`,
 *          `size`, `disabled`, `open` / `defaultOpen` / `onOpenChange`
 *   §25 — story is docs; primitive is the UI
 */

const prefectureTree: CascaderOption[] = [
  {
    value: "tokyo",
    label: "東京都",
    children: [
      {
        value: "shibuya",
        label: "渋谷区",
        children: [
          { value: "shibuya-1", label: "渋谷1丁目" },
          { value: "shibuya-2", label: "渋谷2丁目" },
          { value: "ebisu", label: "恵比寿" },
          { value: "omotesando", label: "表参道" },
        ],
      },
      {
        value: "shinjuku",
        label: "新宿区",
        children: [
          { value: "shinjuku-1", label: "新宿1丁目" },
          { value: "kabukicho", label: "歌舞伎町" },
        ],
      },
    ],
  },
  {
    value: "kanagawa",
    label: "神奈川県",
    children: [
      {
        value: "yokohama",
        label: "横浜市",
        children: [
          { value: "naka-ku", label: "中区" },
          { value: "minato-mirai", label: "みなとみらい" },
        ],
      },
    ],
  },
];

const productCategories: CascaderOption[] = [
  {
    value: "electronics",
    label: "電子機器",
    children: [
      { value: "smartphones", label: "スマートフォン" },
      { value: "laptops", label: "ノートパソコン" },
      { value: "tablets", label: "タブレット" },
    ],
  },
  {
    value: "apparel",
    label: "アパレル",
    children: [
      { value: "tops", label: "トップス" },
      { value: "bottoms", label: "ボトムス" },
      { value: "shoes", label: "シューズ" },
    ],
  },
  {
    value: "food",
    label: "食品",
    children: [
      { value: "snacks", label: "スナック" },
      { value: "drinks", label: "ドリンク" },
    ],
  },
];

const meta: Meta<typeof Cascader> = {
  title: "Data Entry/Cascader",
  component: Cascader,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
**Cascader** — nested column navigation. Each level renders a vertical
list of options; clicking a non-leaf opens the next column to the
right; selecting a leaf commits the full path of values.

Vocabulary per cardinal rule 23 §B:
- \`value\` / \`defaultValue\` / \`onValueChange\` — path of values
- \`size\`: \`"small" | "default" | "large"\`
- \`showFullPath\`: breadcrumb-style label vs leaf label
        `.trim(),
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Cascader>;

// ─── PrefectureCityWard ─────────────────────────────────────────

export const PrefectureCityWard: Story = {
  render: function PrefectureCityWard() {
    const [path, setPath] = useState<string[]>([]);
    return (
      <Flex vertical gap="small" style={{ maxWidth: 360 }}>
        <Cascader
          options={prefectureTree}
          value={path}
          onValueChange={(next) => setPath(next)}
          placeholder="都道府県 → 市区 → 町名"
        />
        <span style={{ fontSize: "var(--text-xs)", color: "var(--muted-foreground)" }}>
          Selected path: <code className="mono">{JSON.stringify(path)}</code>
        </span>
      </Flex>
    );
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const portal = canvasElement.ownerDocument.body;

    await step("clicking trigger opens the first column", async () => {
      const trigger = canvas.getByText("都道府県 → 市区 → 町名");
      await userEvent.click(trigger);
      await waitFor(() => {
        expect(within(portal).getByText("東京都")).toBeInTheDocument();
      });
    });
  },
};

// ─── ProductCategory ────────────────────────────────────────────

export const ProductCategory: Story = {
  render: function ProductCategory() {
    const [path, setPath] = useState<string[]>(["electronics", "smartphones"]);
    return (
      <Flex vertical gap="small" style={{ maxWidth: 320 }}>
        <Cascader
          options={productCategories}
          value={path}
          onValueChange={(next) => setPath(next)}
          showFullPath={false}
          placeholder="カテゴリ"
        />
        <span style={{ fontSize: "var(--text-xs)", color: "var(--muted-foreground)" }}>
          Leaf only: <code className="mono">{JSON.stringify(path)}</code>
        </span>
      </Flex>
    );
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const portal = canvasElement.ownerDocument.body;

    await step("opening + clicking a parent reveals the child column", async () => {
      const trigger = canvas.getByRole("combobox");
      await userEvent.click(trigger);
      await waitFor(() => {
        expect(within(portal).getByText("食品")).toBeInTheDocument();
      });
      await userEvent.click(within(portal).getByText("アパレル"));
      await waitFor(() => {
        expect(within(portal).getByText("トップス")).toBeInTheDocument();
      });
    });
  },
};

// ─── Disabled ───────────────────────────────────────────────────

export const Disabled: Story = {
  render: () => (
    <div style={{ maxWidth: 320 }}>
      <Cascader
        options={prefectureTree}
        defaultValue={["tokyo", "shibuya", "shibuya-1"]}
        disabled
      />
    </div>
  ),
};
