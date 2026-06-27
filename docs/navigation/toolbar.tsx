import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Text } from "@godxjp/ui/general";
import {
  SearchInput,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@godxjp/ui/data-entry";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import { Toolbar, ToolbarGroup } from "@godxjp/ui/navigation";

/**
 * Toolbar + ToolbarGroup — the list-page filter strip (Toolbar is the renamed FilterBar).
 * Place ABOVE the table Card — NEVER inside CardContent flush.
 * Each labelled filter control goes in a ToolbarGroup; SearchInput is placed directly.
 * Composed only from real @godxjp/ui components.
 */
export default function Demo() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [fiscalPeriod, setFiscalPeriod] = useState("all");
  const [department, setDepartment] = useState("all");

  const hasActiveFilters =
    search !== "" || status !== "all" || fiscalPeriod !== "all" || department !== "all";

  function handleClear() {
    setSearch("");
    setStatus("all");
    setFiscalPeriod("all");
    setDepartment("all");
  }

  return (
    <PageContainer
      title="Toolbar / ToolbarGroup"
      subtitle="List-page filter strip · place ABOVE the table card, not inside CardContent"
    >
      <Flex direction="col" gap="lg">
        {/* Full filter bar above a representative table placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>仕訳一覧フィルター</CardTitle>
            <CardDescription>
              Toolbar + ToolbarGroup · SearchInput is placed directly (no ToolbarGroup); every other
              control gets a ToolbarGroup with a label. hasActiveFilters drives the clear-all
              button.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              {/* Toolbar sits ABOVE the table — shown here inside CardContent for demo only */}
              <Toolbar hasActiveFilters={hasActiveFilters} onClear={handleClear}>
                <SearchInput
                  placeholder="仕訳IDまたは摘要で検索"
                  value={search}
                  onSearch={setSearch}
                />
                <ToolbarGroup label="ステータス">
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="すべて" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべて</SelectItem>
                      <SelectItem value="draft">下書き</SelectItem>
                      <SelectItem value="posted">承認済</SelectItem>
                      <SelectItem value="voided">取消済</SelectItem>
                    </SelectContent>
                  </Select>
                </ToolbarGroup>
                <ToolbarGroup label="会計期間">
                  <Select value={fiscalPeriod} onValueChange={setFiscalPeriod}>
                    <SelectTrigger>
                      <SelectValue placeholder="期間を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべて</SelectItem>
                      <SelectItem value="2024-q1">2024年 第1四半期</SelectItem>
                      <SelectItem value="2024-q2">2024年 第2四半期</SelectItem>
                      <SelectItem value="2024-q3">2024年 第3四半期</SelectItem>
                      <SelectItem value="2024-q4">2024年 第4四半期</SelectItem>
                    </SelectContent>
                  </Select>
                </ToolbarGroup>
              </Toolbar>

              {/* Simulated table body */}
              <Text as="div" tone="muted" className="rounded-md border p-4 text-center">
                DataTable がここに入ります · Toolbar は Card の外側 (上) に置く
              </Text>
            </Flex>
          </CardContent>
        </Card>

        {/* Minimal toolbar — search only */}
        <Card>
          <CardHeader>
            <CardTitle>SearchInput のみ (ToolbarGroup なし)</CardTitle>
            <CardDescription>
              SearchInput は自己ラベル付きのためToolbarGroup 不要。 単一フィルターの場合は Toolbar +
              SearchInput だけで完結する。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Toolbar>
              <SearchInput placeholder="取引先名で検索" value={search} onSearch={setSearch} />
            </Toolbar>
          </CardContent>
        </Card>

        {/* Department filter example */}
        <Card>
          <CardHeader>
            <CardTitle>複数 ToolbarGroup · 部門・科目フィルター</CardTitle>
            <CardDescription>
              勤怠・経費レポート向け。各フィルターを ToolbarGroup でラベルを付けて並べる。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Toolbar hasActiveFilters={department !== "all"} onClear={() => setDepartment("all")}>
              <ToolbarGroup label="部門">
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="部門を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部門</SelectItem>
                    <SelectItem value="accounting">経理部</SelectItem>
                    <SelectItem value="sales">営業部</SelectItem>
                    <SelectItem value="engineering">開発部</SelectItem>
                    <SelectItem value="hr">人事部</SelectItem>
                  </SelectContent>
                </Select>
              </ToolbarGroup>
              <ToolbarGroup label="勘定科目">
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue placeholder="科目を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">すべての科目</SelectItem>
                    <SelectItem value="ar">売掛金</SelectItem>
                    <SelectItem value="ap">買掛金</SelectItem>
                    <SelectItem value="cash">現金・預金</SelectItem>
                    <SelectItem value="expense">経費</SelectItem>
                  </SelectContent>
                </Select>
              </ToolbarGroup>
            </Toolbar>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
