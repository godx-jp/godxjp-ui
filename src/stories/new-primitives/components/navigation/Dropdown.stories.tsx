import type { Meta, StoryObj } from "@storybook/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "../../../../components/navigation/DropdownMenu";
import { Button } from "../../../../components/general/Button";

/**
 * Components/Navigation/Dropdown — overlay action menu.
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
  title: "new-primitives/Components/Navigation/Dropdown",
  component: DropdownMenu,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};
export default meta;

type Story = StoryObj<typeof DropdownMenu>;

export const Default: Story = {
  name: "Default · action menu",
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="small">アクション ▾</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>操作</DropdownMenuLabel>
        <DropdownMenuItem>
          編集<DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          複製<DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          エクスポート<DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem style={{ color: "var(--destructive)" }}>
          削除<DropdownMenuShortcut>⌫</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const WithDisabled: Story = {
  name: "With disabled items",
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="small">承認 ▾</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>一括承認</DropdownMenuItem>
        <DropdownMenuItem>差戻し</DropdownMenuItem>
        <DropdownMenuItem disabled>承認権限なし</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>削除（管理者のみ）</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const Grouped: Story = {
  name: "Grouped · with labels",
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="small">表示 ▾</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>レイアウト</DropdownMenuLabel>
        <DropdownMenuItem>テーブル表示</DropdownMenuItem>
        <DropdownMenuItem>カード表示</DropdownMenuItem>
        <DropdownMenuItem>タイムライン表示</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>並び替え</DropdownMenuLabel>
        <DropdownMenuItem>名前順</DropdownMenuItem>
        <DropdownMenuItem>作成日順</DropdownMenuItem>
        <DropdownMenuItem>更新日順</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};
