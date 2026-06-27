import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@godxjp/ui/navigation";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * Menubar — アプリトップバー型メニュー。MenubarMenu > MenubarTrigger +
 * MenubarContent > items で構成。チェック・ラジオ・サブメニュー・ショートカット対応。
 * デスクトップ風のコマンドパレットや会計ソフトのツールバーに最適。
 * Composed only from real @godxjp/ui components.
 */
export default function Demo() {
  const [autoSave, setAutoSave] = useState(true);
  const [showRuler, setShowRuler] = useState(false);
  const [theme, setTheme] = useState("light");

  return (
    <PageContainer
      title="Menubar"
      subtitle="アプリケーションメニューバー · デスクトップ風のコマンドメニュー"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>会計アプリメニュー</CardTitle>
            <CardDescription>
              ファイル・編集・表示・ヘルプメニューを含む標準的なアプリメニューバー。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Menubar>
              <MenubarMenu>
                <MenubarTrigger>ファイル</MenubarTrigger>
                <MenubarContent>
                  <MenubarItem>
                    新規仕訳
                    <MenubarShortcut>⌘N</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem>
                    開く
                    <MenubarShortcut>⌘O</MenubarShortcut>
                  </MenubarItem>
                  <MenubarSeparator />
                  <MenubarSub>
                    <MenubarSubTrigger>エクスポート</MenubarSubTrigger>
                    <MenubarSubContent>
                      <MenubarItem>仕訳帳 CSV</MenubarItem>
                      <MenubarItem>試算表 PDF</MenubarItem>
                      <MenubarItem>貸借対照表 Excel</MenubarItem>
                    </MenubarSubContent>
                  </MenubarSub>
                  <MenubarSeparator />
                  <MenubarItem>
                    終了
                    <MenubarShortcut>⌘Q</MenubarShortcut>
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>

              <MenubarMenu>
                <MenubarTrigger>編集</MenubarTrigger>
                <MenubarContent>
                  <MenubarItem>
                    元に戻す
                    <MenubarShortcut>⌘Z</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem>
                    やり直す
                    <MenubarShortcut>⇧⌘Z</MenubarShortcut>
                  </MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem>
                    コピー
                    <MenubarShortcut>⌘C</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem>
                    貼り付け
                    <MenubarShortcut>⌘V</MenubarShortcut>
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>

              <MenubarMenu>
                <MenubarTrigger>表示</MenubarTrigger>
                <MenubarContent>
                  <MenubarLabel>オプション</MenubarLabel>
                  <MenubarCheckboxItem checked={autoSave} onCheckedChange={setAutoSave}>
                    自動保存
                  </MenubarCheckboxItem>
                  <MenubarCheckboxItem checked={showRuler} onCheckedChange={setShowRuler}>
                    ルーラーを表示
                  </MenubarCheckboxItem>
                  <MenubarSeparator />
                  <MenubarLabel>テーマ</MenubarLabel>
                  <MenubarRadioGroup value={theme} onValueChange={setTheme}>
                    <MenubarRadioItem value="light">ライト</MenubarRadioItem>
                    <MenubarRadioItem value="dark">ダーク</MenubarRadioItem>
                    <MenubarRadioItem value="system">システム</MenubarRadioItem>
                  </MenubarRadioGroup>
                </MenubarContent>
              </MenubarMenu>

              <MenubarMenu>
                <MenubarTrigger>ヘルプ</MenubarTrigger>
                <MenubarContent>
                  <MenubarItem>ドキュメント</MenubarItem>
                  <MenubarItem>キーボードショートカット</MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem>バージョン情報</MenubarItem>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
