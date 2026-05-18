import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { DropdownMenu } from "../../components/navigation/DropdownMenu";
import { Button } from "../../components/general/Button";

/**
 * Navigation/Dropdown — overlay action menu.
 *
 * Primitive is `DropdownMenu` (Radix-backed). The Storybook group
 * labels it "Dropdown" per the canonical navigation taxonomy
 * (Ant uses both names interchangeably; we prefer the surface name
 * "Dropdown" for grouping but keep the React export
 * `DropdownMenu*` because Radix's library name is the source of
 * truth for the technical contract).
 *
 * Vocabulary: compositional Radix API. `disabled`, `inset`,
 * `aria-*` come from Radix; we add nothing.
 */

const meta: Meta<typeof DropdownMenu> = {
  title: "Navigation/Dropdown",
  component: DropdownMenu,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};
export default meta;

type Story = StoryObj<typeof DropdownMenu>;

export const Default: Story = {
  name: "Default · action menu",
  render: () => (
    <DropdownMenu
      trigger={<Button variant="outline" size="small">アクション ▾</Button>}
      items={[
        { key: "label", type: "label", label: "操作" },
        { key: "edit", label: "編集", shortcut: "⌘E" },
        { key: "duplicate", label: "複製", shortcut: "⌘D" },
        { key: "sep-1", type: "separator" },
        { key: "export", label: "エクスポート", shortcut: "⌘E" },
        { key: "sep-2", type: "separator" },
        { key: "delete", label: "削除", shortcut: "⌫", variant: "destructive" },
      ]}
    />
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const portal = canvasElement.ownerDocument.body;

    await step("clicking trigger opens menu", async () => {
      const trigger = canvas.getByRole("button", { name: /アクション/ });
      await userEvent.click(trigger);
      await waitFor(() => {
        expect(within(portal).getByRole("menu")).toBeVisible();
      });
    });

    await step("menu shows expected items", async () => {
      const items = within(portal).getAllByRole("menuitem");
      await expect(items.length).toBeGreaterThanOrEqual(3);
      await expect(within(portal).getByText(/編集/)).toBeVisible();
    });
  },
};

export const WithDisabled: Story = {
  name: "With disabled items",
  render: () => (
    <DropdownMenu
      trigger={<Button variant="outline" size="small">承認 ▾</Button>}
      items={[
        { key: "approve", label: "一括承認" },
        { key: "reject", label: "差戻し" },
        { key: "no-permission", label: "承認権限なし", disabled: true },
        { key: "sep", type: "separator" },
        { key: "delete", label: "削除（管理者のみ）", disabled: true },
      ]}
    />
  ),
};

export const Grouped: Story = {
  name: "Grouped · with labels",
  render: () => (
    <DropdownMenu
      trigger={<Button variant="outline" size="small">表示 ▾</Button>}
      items={[
        { key: "layout", type: "label", label: "レイアウト" },
        { key: "table", label: "テーブル表示" },
        { key: "card", label: "カード表示" },
        { key: "timeline", label: "タイムライン表示" },
        { key: "sep", type: "separator" },
        { key: "sort", type: "label", label: "並び替え" },
        { key: "name", label: "名前順" },
        { key: "created", label: "作成日順" },
        { key: "updated", label: "更新日順" },
      ]}
    />
  ),
};
