import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Button, Text } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@godxjp/ui/navigation";
import { MoreHorizontal } from "lucide-react";

/**
 * DropdownMenu — Radix dropdown. Compose root/Trigger(asChild)/Content/Item/Separator.
 * Use asChild on Trigger so a godx-ui Button is the real trigger (no double-button).
 * Composed only from real @godxjp/ui components.
 */
export default function Demo() {
  const [status, setStatus] = useState("draft");
  const [showAmount, setShowAmount] = useState(true);
  const [showPartner, setShowPartner] = useState(true);
  const [showDate, setShowDate] = useState(false);

  return (
    <PageContainer
      title="DropdownMenu"
      subtitle="Radix dropdown — Trigger asChild + Content + Item/Separator/Sub"
    >
      <Flex direction="col" gap="lg">
        {/* Row action menu — the most common use */}
        <Card>
          <CardHeader>
            <CardTitle>行アクションメニュー (DataTable 行の &quot;…&quot;)</CardTitle>
            <CardDescription>
              DropdownMenuTrigger に asChild を付けて godx-ui Button をトリガーにする。 削除は
              variant=&quot;destructive&quot; — className で色を上書きしない。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="row" align="center" gap="md">
              <Text>JE-0042 — 売上計上 ¥480,000</Text>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm" aria-label="行アクション">
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>編集</DropdownMenuItem>
                  <DropdownMenuItem>複製</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive">削除</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </Flex>
          </CardContent>
        </Card>

        {/* Status quick-change with RadioGroup */}
        <Card>
          <CardHeader>
            <CardTitle>RadioGroup — ステータス即時変更</CardTitle>
            <CardDescription>
              DropdownMenuRadioGroup + DropdownMenuRadioItem でステータスを切り替える。 Select
              の代替 — フォーム外でのインライン状態遷移に使う。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="row" align="center" gap="md">
              <span className="text-sm">
                現在のステータス:{" "}
                <strong>
                  {status === "draft" ? "下書き" : status === "posted" ? "承認済" : "取消済"}
                </strong>
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    ステータスを変更
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>ステータス</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup value={status} onValueChange={setStatus}>
                    <DropdownMenuRadioItem value="draft">下書き</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="posted">承認済</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="voided">取消済</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </Flex>
          </CardContent>
        </Card>

        {/* Column visibility toggle */}
        <Card>
          <CardHeader>
            <CardTitle>CheckboxItem — 列の表示 / 非表示</CardTitle>
            <CardDescription>
              DropdownMenuCheckboxItem で DataTable の列表示を切り替える。 checked + onCheckedChange
              で各列の状態を管理する。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  列の設定
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>表示する列</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem checked={showAmount} onCheckedChange={setShowAmount}>
                  金額
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={showPartner} onCheckedChange={setShowPartner}>
                  取引先
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={showDate} onCheckedChange={setShowDate}>
                  日付
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardContent>
        </Card>

        {/* Nested sub-menu for export */}
        <Card>
          <CardHeader>
            <CardTitle>Sub-menu — エクスポート形式の選択</CardTitle>
            <CardDescription>
              DropdownMenuSub + DropdownMenuSubTrigger + DropdownMenuSubContent でネスト。
              ChevronRight は DropdownMenuSubTrigger が自動で表示する。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  一括操作
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuGroup>
                  <DropdownMenuItem>承認</DropdownMenuItem>
                  <DropdownMenuItem>却下</DropdownMenuItem>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>エクスポート</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem>CSV</DropdownMenuItem>
                      <DropdownMenuItem>Excel (.xlsx)</DropdownMenuItem>
                      <DropdownMenuItem>PDF</DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">一括削除</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardContent>
        </Card>

        {/* Avatar chip / account menu */}
        <Card>
          <CardHeader>
            <CardTitle>アカウントメニュー — トップバーのアバターチップ</CardTitle>
            <CardDescription>
              DropdownMenuLabel でユーザー情報を表示し、アクションを下に並べる標準パターン。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  田中 太郎
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>
                  <Text as="div" weight="medium">
                    田中 太郎
                  </Text>
                  <Text as="div" size="xs" tone="muted">
                    tanaka@example.co.jp
                  </Text>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>プロフィール</DropdownMenuItem>
                <DropdownMenuItem>設定</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">ログアウト</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
