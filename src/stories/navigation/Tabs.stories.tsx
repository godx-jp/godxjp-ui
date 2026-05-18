import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Tabs, type TabsItem } from "../../components/navigation/Tabs";
import { Typography } from "../../components/general/Typography";

const { Paragraph } = Typography;

/**
 * Navigation/Tabs — Radix-backed segmented view switcher.
 *
 * Vocabulary (§23.B):
 *   - `variant` — "line" (default) | "pills"
 *   - `placement` — "top" (default) | "right" | "bottom" | "left"
 *     (drives flex direction of root; vertical tabs auto-set Radix
 *     orientation)
 *   - `value` / `defaultValue` / `onValueChange` — Radix selection
 */

const meta: Meta<typeof Tabs> = {
  title: "Navigation/Tabs",
  component: Tabs,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};
export default meta;

type Story = StoryObj<typeof Tabs>;

const Body = ({ label }: { label: string }) => (
  <div style={{ padding: "var(--spacing-3) 0" }}>
    <Paragraph>
      <strong>{label}</strong> パネルのコンテンツ。タブの選択状態に応じて差し替えられます。
    </Paragraph>
    <Paragraph color="secondary">
      Radix がキーボードナビゲーション + ARIA を提供します。
    </Paragraph>
  </div>
);

const makeItems = (items: Array<[string, string]>): TabsItem[] =>
  items.map(([value, label]) => ({
    value,
    label,
    content: <Body label={label.replace(/\s*\(.+\)$/, "")} />,
  }));

// ════════════════════════════════════════════════════════════════
// Variant · line (default)
// ════════════════════════════════════════════════════════════════

export const Line: Story = {
  name: "Variant · line",
  render: () => (
    <Tabs
      defaultValue="open"
      items={makeItems([
        ["open", "未対応 (12)"],
        ["processing", "進行中 (5)"],
        ["closed", "完了 (108)"],
      ])}
    />
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("default tab is selected", async () => {
      const first = canvas.getByRole("tab", { name: /未対応/ });
      await expect(first).toHaveAttribute("aria-selected", "true");
    });

    await step("clicking tab 2 switches selection", async () => {
      const second = canvas.getByRole("tab", { name: /進行中/ });
      await userEvent.click(second);
      await waitFor(() => {
        expect(second).toHaveAttribute("aria-selected", "true");
      });
      const first = canvas.getByRole("tab", { name: /未対応/ });
      await expect(first).toHaveAttribute("aria-selected", "false");
    });
  },
};

// ════════════════════════════════════════════════════════════════
// Variant · pills (segmented control style)
// ════════════════════════════════════════════════════════════════

export const Pills: Story = {
  name: "Variant · pills",
  render: () => (
    <Tabs
      defaultValue="day"
      variant="pills"
      items={makeItems([
        ["day", "日"],
        ["week", "週"],
        ["month", "月"],
        ["year", "年"],
      ])}
    />
  ),
};

// ════════════════════════════════════════════════════════════════
// Placement · left (vertical tabs)
// ════════════════════════════════════════════════════════════════

export const PlacementLeft: Story = {
  name: "Placement · left",
  render: () => (
    <div style={{ minHeight: 300 }}>
      <Tabs
        defaultValue="profile"
        placement="left"
        items={makeItems([
          ["profile", "プロフィール"],
          ["security", "セキュリティ"],
          ["notifications", "通知"],
          ["billing", "支払い"],
        ])}
      />
    </div>
  ),
};

// ════════════════════════════════════════════════════════════════
// Placement · right (vertical tabs, right-aligned)
// ════════════════════════════════════════════════════════════════

export const PlacementRight: Story = {
  name: "Placement · right",
  render: () => (
    <div style={{ minHeight: 300 }}>
      <Tabs
        defaultValue="overview"
        placement="right"
        items={makeItems([
          ["overview", "概要"],
          ["activity", "アクティビティ"],
          ["settings", "設定"],
        ])}
      />
    </div>
  ),
};

// ════════════════════════════════════════════════════════════════
// Placement · bottom
// ════════════════════════════════════════════════════════════════

export const PlacementBottom: Story = {
  name: "Placement · bottom",
  render: () => (
    <Tabs
      defaultValue="kintai"
      placement="bottom"
      items={makeItems([
        ["kintai", "勤怠"],
        ["shifts", "シフト"],
        ["payroll", "給与"],
      ])}
    />
  ),
};
