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
 * DropdownMenu — react-aria dropdown. Compose root/Trigger(asChild)/Content/Item/Separator.
 * Use asChild on Trigger so a godx-ui Button is the real trigger (no double-button).
 * `trigger` picks the gestures (click / hover / contextMenu) — antd's own prop.
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
      subtitle="trigger: click / hover / contextMenu · Trigger asChild + Content + Item/Separator/Sub"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>メニュー幅</CardTitle>
          </CardHeader>
          <CardContent>
            <Flex wrap gap="md">
              {(["auto", "trigger", "sm", "md", "lg"] as const).map((width) => (
                <DropdownMenu key={width}>
                  <DropdownMenuTrigger asChild>
                    <Button id={`menu-width-${width}`} variant="outline">
                      {width}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent width={width}>
                    <DropdownMenuItem>編集</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ))}
            </Flex>
          </CardContent>
        </Card>
        {/* Row action menu — the most common use */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>行アクションメニュー (DataTable 行の &quot;…&quot;)</CardTitle>
            <CardDescription>
              DropdownMenuTrigger に asChild を付けて godx-ui Button をトリガーにする。
              DropdownMenuItem の variant は default と destructive の 2 つ。削除だけを
              variant=&quot;destructive&quot; にし、className で色を上書きしない。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="row" align="center" gap="md" wrap>
              <Text>JE-0042 · 売上計上 ¥480,000</Text>
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
                  <DropdownMenuItem variant="default">アーカイブに移動</DropdownMenuItem>
                  <DropdownMenuItem variant="destructive">削除</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </Flex>
          </CardContent>
        </Card>

        {/* antd `trigger` — which gestures open the menu */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>trigger · 右クリック（コンテキストメニュー）</CardTitle>
            <CardDescription>
              trigger={"{"}[&quot;contextMenu&quot;]{"}"} は右クリックの位置にメニューを開き、
              ブラウザ標準のメニューを抑止する。左クリックでは開かない。キーボードからは Shift+F10
              または ContextMenu キーで開く（トリガーにフォーカスしてから）。専用の ContextMenu
              コンポーネントは v23 で廃止され、これがその置き換え。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="row" align="center" gap="md" wrap>
              <DropdownMenu trigger={["contextMenu"]}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">仕訳 JE-0042 を右クリック</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>編集</DropdownMenuItem>
                  <DropdownMenuItem>複製</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive">削除</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>trigger · ホバーで開く</CardTitle>
            <CardDescription>
              trigger={"{"}[&quot;hover&quot;]{"}"} はポインタが乗ると mouseEnterDelay（既定 0.15
              秒）後に開き、離れると mouseLeaveDelay（既定 0.1
              秒）後に閉じる。トリガーとメニューの間の隙間を渡れるよう、閉じるのは取り消せる予約。
              ホバーでフォーカスは移動せず、キーボードでは Enter / Space / ↓
              で開くので、ポインタ専用にはならない。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="row" align="center" gap="md" wrap>
              <DropdownMenu trigger={["hover"]}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">エクスポート</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>CSV</DropdownMenuItem>
                  <DropdownMenuItem>PDF</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu trigger={["click", "contextMenu"]}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">クリックでも右クリックでも</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>編集</DropdownMenuItem>
                  <DropdownMenuItem>複製</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu disabled>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">無効（disabled）</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>編集</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </Flex>
          </CardContent>
        </Card>

        {/* Status quick-change with RadioGroup */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>RadioGroup · ステータス即時変更</CardTitle>
            <CardDescription>
              DropdownMenuRadioGroup + DropdownMenuRadioItem でステータスを切り替える。 Select
              の代替。フォーム外でのインライン状態遷移に使う。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="row" align="center" gap="md" wrap>
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
            <CardTitle level={2}>CheckboxItem · 列の表示 / 非表示</CardTitle>
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
            <CardTitle level={2}>Sub-menu · エクスポート形式の選択</CardTitle>
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
            <CardTitle level={2}>アカウントメニュー · トップバーのアバターチップ</CardTitle>
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
        {/* defaultOpen — OPEN ON MOUNT, on purpose, and this is the only example on the page that
            is. A menu paints nothing until it is opened, so for as long as this page has existed
            no sweep has ever measured a single menu pixel: that is how
            `.ui-dropdown-menu-item[data-variant="destructive"]` — the label on a Delete row, i.e.
            prose — kept the destructive FILL tier at 2.95:1 on dark (gh#612). Same reasoning as
            `?toast=` in check-contrast's route list: a surface that needs an interaction is a
            surface no gate sees. */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>defaultOpen · 計測できる状態で開いておく</CardTitle>
            <CardDescription>
              antd の open/defaultOpen。ここだけはマウント時から開いたままにしてある。
              閉じたメニューは 1 ピクセルも描かないので、どのスイープにも測れない。
              destructive の行が読める色で描かれているかは、開いていて初めて測れる。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DropdownMenu defaultOpen>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  仕訳アクション
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem>編集</DropdownMenuItem>
                <DropdownMenuItem>複製</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">削除</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
