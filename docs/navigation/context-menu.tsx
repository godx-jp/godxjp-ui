import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@godxjp/ui/navigation";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * ContextMenu — right-click action menu over a target area. Compose
 * ContextMenu > ContextMenuTrigger + ContextMenuContent > items. Supports
 * sub-menus, checkbox/radio items, separators, and keyboard shortcuts.
 * Composed only from real @godxjp/ui components.
 */
export default function Demo() {
  const [showRuby, setShowRuby] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  const [sort, setSort] = useState("date");

  return (
    <PageContainer
      title="ContextMenu"
      subtitle="右クリックで開くコンテキストメニュー — 行・カード・エリアへのアクション"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>基本アクション</CardTitle>
            <CardDescription>
              領域を右クリックするとメニューが開きます。サブメニュー・区切り・ショートカットを含む。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ContextMenu>
              <ContextMenuTrigger className="border-border text-muted-foreground flex h-36 w-full cursor-context-menu items-center justify-center rounded-md border border-dashed text-sm">
                ここを右クリックしてください
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuLabel>仕訳操作</ContextMenuLabel>
                <ContextMenuItem>
                  編集
                  <ContextMenuShortcut>⌘E</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuItem>
                  複製
                  <ContextMenuShortcut>⌘D</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuSub>
                  <ContextMenuSubTrigger>エクスポート</ContextMenuSubTrigger>
                  <ContextMenuSubContent>
                    <ContextMenuItem>CSV</ContextMenuItem>
                    <ContextMenuItem>PDF</ContextMenuItem>
                    <ContextMenuItem>Excel</ContextMenuItem>
                  </ContextMenuSubContent>
                </ContextMenuSub>
                <ContextMenuSeparator />
                <ContextMenuItem variant="destructive">
                  削除
                  <ContextMenuShortcut>⌫</ContextMenuShortcut>
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>チェックボックス・ラジオアイテム</CardTitle>
            <CardDescription>
              表示設定の切り替えに使用。CheckboxItem は個別トグル、RadioGroup は排他選択。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ContextMenu>
              <ContextMenuTrigger className="border-border text-muted-foreground flex h-36 w-full cursor-context-menu items-center justify-center rounded-md border border-dashed text-sm">
                右クリック — 表示設定
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuLabel>表示オプション</ContextMenuLabel>
                <ContextMenuCheckboxItem checked={showRuby} onCheckedChange={setShowRuby}>
                  ルビ表示
                </ContextMenuCheckboxItem>
                <ContextMenuCheckboxItem checked={showGrid} onCheckedChange={setShowGrid}>
                  グリッド線
                </ContextMenuCheckboxItem>
                <ContextMenuSeparator />
                <ContextMenuLabel>並び順</ContextMenuLabel>
                <ContextMenuRadioGroup value={sort} onValueChange={setSort}>
                  <ContextMenuRadioItem value="date">日付順</ContextMenuRadioItem>
                  <ContextMenuRadioItem value="amount">金額順</ContextMenuRadioItem>
                  <ContextMenuRadioItem value="account">科目順</ContextMenuRadioItem>
                </ContextMenuRadioGroup>
              </ContextMenuContent>
            </ContextMenu>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
