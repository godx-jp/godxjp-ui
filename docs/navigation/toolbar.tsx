import { useState } from "react";
import { Filter, X } from "lucide-react";

import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@godxjp/ui/data-display";
import { Button, Text } from "@godxjp/ui/general";
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

const STATUS_LABEL: Record<string, string> = {
  active: "有効",
  invited: "招待中",
  suspended: "停止",
};
const ROLE_LABEL: Record<string, string> = {
  admin: "管理者",
  member: "メンバー",
  guest: "ゲスト",
};

/**
 * Toolbar + ToolbarGroup — the list-page filter strip (Toolbar is the renamed FilterBar, #197).
 * Place ABOVE the table Card — NEVER inside CardContent flush.
 * Each labelled filter control goes in a ToolbarGroup; SearchInput is placed directly.
 * Composed only from real @godxjp/ui components.
 */
export default function Demo() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [fiscalPeriod, setFiscalPeriod] = useState("all");
  const [department, setDepartment] = useState("all");

  // #197 — sticky filter strip with active-filter chips (clear-one / clear-all).
  const [memberQuery, setMemberQuery] = useState("田中");
  const [memberStatus, setMemberStatus] = useState("active");
  const [memberRole, setMemberRole] = useState("all");

  const activeChips = [
    memberQuery.trim() && {
      key: "q",
      label: `検索: ${memberQuery.trim()}`,
      tone: undefined as "success" | undefined,
      clear: () => setMemberQuery(""),
    },
    memberStatus !== "all" && {
      key: "status",
      label: `状態: ${STATUS_LABEL[memberStatus]}`,
      tone: "success" as const,
      clear: () => setMemberStatus("all"),
    },
    memberRole !== "all" && {
      key: "role",
      label: `権限: ${ROLE_LABEL[memberRole]}`,
      tone: undefined,
      clear: () => setMemberRole("all"),
    },
  ].filter(Boolean) as { key: string; label: string; tone?: "success"; clear: () => void }[];

  const hasMemberFilters = activeChips.length > 0;
  function clearMemberFilters() {
    setMemberQuery("");
    setMemberStatus("all");
    setMemberRole("all");
  }

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
        {/* #197 — sticky filter strip with active-filter chips over a long list */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>スティッキーフィルター · 適用中のチップ</CardTitle>
            <CardDescription>
              Toolbar `sticky` でリスト上部に固定 · SearchInput + Select
              スロット、適用中の条件を削除可能なチップで表示 (個別解除 × / 一括解除)。 1024px
              以下では縦積みに折り返す。チップの × は Badge の内側ではなく兄弟要素の Button
              として描画する。
            </CardDescription>
          </CardHeader>
          <CardContent flush>
            {/* A scroll container so the sticky strip stays pinned while the list scrolls. */}
            <div className="max-h-80 overflow-y-auto">
              <Toolbar
                sticky
                hasActiveFilters={hasMemberFilters}
                onClear={clearMemberFilters}
                className="border-border bg-card border-b px-4"
              >
                <SearchInput
                  aria-label="メンバーを検索"
                  placeholder="氏名・メールで検索"
                  value={memberQuery}
                  onSearch={setMemberQuery}
                  className="w-full sm:w-56"
                />
                <ToolbarGroup label="ステータス">
                  <Select value={memberStatus} onValueChange={setMemberStatus}>
                    <SelectTrigger aria-label="ステータス">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべて</SelectItem>
                      <SelectItem value="active">有効</SelectItem>
                      <SelectItem value="invited">招待中</SelectItem>
                      <SelectItem value="suspended">停止</SelectItem>
                    </SelectContent>
                  </Select>
                </ToolbarGroup>
                <ToolbarGroup label="権限">
                  <Select value={memberRole} onValueChange={setMemberRole}>
                    <SelectTrigger aria-label="権限">
                      <SelectValue placeholder="すべて" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべて</SelectItem>
                      <SelectItem value="admin">管理者</SelectItem>
                      <SelectItem value="member">メンバー</SelectItem>
                      <SelectItem value="guest">ゲスト</SelectItem>
                    </SelectContent>
                  </Select>
                </ToolbarGroup>
              </Toolbar>

              {/* Active-filter chip row — each chip is a Badge label + a SIBLING × Button. */}
              <Flex
                direction="row"
                wrap
                align="center"
                gap="xs"
                className="border-border bg-muted/40 min-h-9 border-b px-4 py-2"
              >
                <Flex
                  direction="row"
                  align="center"
                  gap="xs"
                  className="text-muted-foreground pe-1"
                >
                  <Filter className="size-3.5" aria-hidden="true" />
                  <Text size="xs">適用中</Text>
                </Flex>
                {!hasMemberFilters && (
                  <Text size="xs" tone="muted">
                    条件なし
                  </Text>
                )}
                {activeChips.map((chip) => (
                  <span key={chip.key} className="inline-flex items-center gap-1">
                    <Badge tone={chip.tone} variant="outline">
                      {chip.label}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`${chip.label} を解除`}
                      onClick={chip.clear}
                    >
                      <X aria-hidden="true" />
                    </Button>
                  </span>
                ))}
                {hasMemberFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ms-auto"
                    onClick={clearMemberFilters}
                  >
                    すべて解除
                  </Button>
                )}
              </Flex>

              {/* Stand-in list body — long enough to scroll under the pinned strip. */}
              <Flex direction="col">
                {Array.from({ length: 14 }).map((_, i) => (
                  <Flex
                    key={i}
                    direction="row"
                    align="center"
                    justify="between"
                    className="border-border/60 border-b px-4 py-2.5"
                  >
                    <Text size="sm">
                      {memberQuery.trim() || "田中"} {i + 1} 番
                    </Text>
                    <Badge tone={memberStatus === "suspended" ? "destructive" : "success"}>
                      {STATUS_LABEL[memberStatus === "all" ? "active" : memberStatus]}
                    </Badge>
                  </Flex>
                ))}
              </Flex>
            </div>
          </CardContent>
        </Card>

        {/* Full filter bar above a representative table placeholder */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>仕訳一覧フィルター</CardTitle>
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
                    <SelectTrigger aria-label="ステータス">
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
                    <SelectTrigger aria-label="会計期間">
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
            <CardTitle level={2}>SearchInput のみ (ToolbarGroup なし)</CardTitle>
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
            <CardTitle level={2}>複数 ToolbarGroup · 部門・科目フィルター</CardTitle>
            <CardDescription>
              勤怠・経費レポート向け。各フィルターを ToolbarGroup でラベルを付けて並べる。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Toolbar hasActiveFilters={department !== "all"} onClear={() => setDepartment("all")}>
              <ToolbarGroup label="部門">
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger aria-label="部門">
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
                  <SelectTrigger aria-label="勘定科目">
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
