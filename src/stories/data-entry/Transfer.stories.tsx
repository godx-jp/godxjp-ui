import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Transfer, type TransferItem } from "../../components/data-entry/Transfer";
import { Flex } from "../../components/layout";

/**
 * data-entry/Transfer — dual list-box.
 *
 * Cardinal rules honoured:
 *   §14 — structural primitive composing `<Checkbox>` (Radix) +
 *          `<IconButton>` peers; no external library needed.
 *   §21 — every nested primitive flows axes already.
 *   §22 — `.transfer` / `.transfer-list` / `.transfer-actions`
 *          rules in `30-input.css` pin sizes via spacing tokens.
 *   §23 — vocabulary: `value` / `defaultValue` / `onValueChange`
 *          (Radix-style — keys on the right column). NOT
 *          \`targetKeys\` (Ant alias).
 *   §25 — story shows variants; primitive owns the layout.
 */

const employees: TransferItem[] = [
  { key: "yamada", label: "山田 太郎 / エンジニア" },
  { key: "suzuki", label: "鈴木 花子 / デザイナー" },
  { key: "tanaka", label: "田中 一郎 / プロダクト" },
  { key: "sato", label: "佐藤 真理子 / マーケ" },
  { key: "ito", label: "伊藤 健 / セールス" },
  { key: "watanabe", label: "渡辺 美咲 / カスタマーサクセス" },
  { key: "kobayashi", label: "小林 翔 / QA" },
  { key: "kato", label: "加藤 桜 / データ" },
  { key: "yoshida", label: "吉田 大輔 / リクルート" },
  { key: "yamamoto", label: "山本 千夏 / 経理", disabled: true },
];

const meta: Meta<typeof Transfer> = {
  title: "Data Entry/Transfer",
  component: Transfer,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
**Transfer** — dual list-box. Left column is "available"; right
column is the "chosen" set; \`value\` is the array of chosen keys.

Vocabulary per cardinal rule 23 §B:
- \`value\` / \`defaultValue\` / \`onValueChange\` — Radix-style.
  NOT \`targetKeys\` (Ant alias for the same concept).
- \`size\`: \`"small" | "default" | "large"\`
- \`disabled\` — disables the whole control.
- \`showSearch\` — toggles a search input above each column.
        `.trim(),
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Transfer>;

// ─── Default ────────────────────────────────────────────────────

export const Default: Story = {
  render: function Default() {
    const [chosen, setChosen] = useState<string[]>(["suzuki"]);
    return (
      <Flex vertical gap="small">
        <Transfer
          dataSource={employees}
          value={chosen}
          onValueChange={setChosen}
          titles={["利用可能", "アサイン済み"]}
        />
        <span style={{ fontSize: "var(--text-2xs)", color: "var(--muted-foreground)" }}>
          選択中: {chosen.join(", ") || "(なし)"}
        </span>
      </Flex>
    );
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("both columns render with titles", async () => {
      await expect(canvas.getByText(/利用可能/)).toBeInTheDocument();
      await expect(canvas.getByText(/アサイン済み/)).toBeInTheDocument();
    });

    await step("move-right action button is reachable", async () => {
      const moveRight = canvas.getByRole("button", { name: /Move right/i });
      await expect(moveRight).toBeInTheDocument();
    });
  },
};

// ─── WithSearch ─────────────────────────────────────────────────

export const WithSearch: Story = {
  render: () => (
    <Transfer
      dataSource={employees}
      defaultValue={["tanaka"]}
      titles={["メンバー一覧", "プロジェクト参加"]}
      showSearch
      searchPlaceholder="名前で検索"
    />
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("ticking a left item + Move right grows the target column", async () => {
      await expect(canvas.getByText(/プロジェクト参加 \(1\)/)).toBeInTheDocument();
      // First checkbox in the left column corresponds to a non-disabled item.
      const checkboxes = canvas.getAllByRole("checkbox");
      await userEvent.click(checkboxes[0]);
      const moveRight = canvas.getByRole("button", { name: /Move right/i });
      await userEvent.click(moveRight);
      await waitFor(() => {
        expect(canvas.getByText(/プロジェクト参加 \(2\)/)).toBeInTheDocument();
      });
    });
  },
};

// ─── Sizes ──────────────────────────────────────────────────────

export const Sizes: Story = {
  render: () => (
    <Flex vertical gap="middle">
      <div>
        <div style={{ fontSize: "var(--text-2xs)", color: "var(--muted-foreground)", marginBottom: 4 }}>
          size="small"
        </div>
        <Transfer
          dataSource={employees.slice(0, 4)}
          size="small"
          titles={["候補", "選択"]}
        />
      </div>
      <div>
        <div style={{ fontSize: "var(--text-2xs)", color: "var(--muted-foreground)", marginBottom: 4 }}>
          size="default"
        </div>
        <Transfer
          dataSource={employees.slice(0, 4)}
          size="default"
          titles={["候補", "選択"]}
        />
      </div>
      <div>
        <div style={{ fontSize: "var(--text-2xs)", color: "var(--muted-foreground)", marginBottom: 4 }}>
          size="large"
        </div>
        <Transfer
          dataSource={employees.slice(0, 4)}
          size="large"
          titles={["候補", "選択"]}
        />
      </div>
    </Flex>
  ),
};

// ─── Disabled ───────────────────────────────────────────────────

export const Disabled: Story = {
  render: () => (
    <Transfer
      dataSource={employees}
      defaultValue={["yamada", "suzuki"]}
      titles={["利用可能", "アサイン済み"]}
      disabled
    />
  ),
};
