/**
 * Showcase · permission-matrix — 権限マトリクス (RBAC role × permission grid)
 *
 * A role × permission matrix with a STICKY first column (権限), ✓/— cells, a
 * two-role COMPARE mode, and a 差分のみ (differences-only) filter — the pattern
 * DXS role tabs (SCR-203) and the org role editor (SCR-111b) each hand-rolled
 * (godxjp-ui#194). Read-only by default.
 *
 * SINCE gh#257 the grid itself IS a package export — `PermissionMatrix` from
 * `@godxjp/ui/data-display` (see docs/data-display/permission-matrix.tsx). The
 * original Gate-0 "composition pattern" verdict was OUTCOME-corrected the same
 * way ErrorSurface was (gh#251): a consumer cannot import a docs page, so the
 * canonical grid needed an importable home. Prefer the export in app code.
 *
 * This showcase remains as the COMPOSED form of the same screen — the full
 * hand-built Table-family version with its own compare controls — for consumers
 * who need a variant the export does not model. The shared grant/diff DATA
 * logic stays in the pure, tested `@godxjp/ui/lib/permission-grid` util (no
 * strings, no React), used identically by the export and by this composition.
 *
 * GAP: DataTable/ColumnDef cannot pin the FIRST column (only the header row and a
 * single trailing `pin:'end'` column). So the sticky-権限 column is composed from
 * the real Table family primitives with `sticky start-0` + a token edge — exactly
 * as docs/showcase/table-sticky-columns.tsx does. No hand-rolled <table>, no raw
 * HTML controls: role pickers = Select, the diff toggle = Switch, cells = Badge.
 *
 * DNA: compact density, semantic tokens only (success ✓, muted —, warning 差分),
 * shape-encoded state (Check vs Minus icon, never colour-only) + sr-only text for
 * screen readers, quiet JP copy, no emoji.
 */
import * as React from "react";
import { Check, Minus } from "lucide-react";

import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@godxjp/ui/data-display";
import { FormField, Label, Select, Switch } from "@godxjp/ui/data-entry";
import { Text } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import { cn } from "@godxjp/ui/lib/utils";
import {
  type ComparePair,
  countDifferences,
  countGrants,
  grantKey,
  hasGrant,
  rolesDifferOnPermission,
  visibleRows,
} from "@godxjp/ui/lib/permission-grid";

// ── ドメイン: ロール（列）と権限（行） ───────────────────────────────────────
type Role = { id: string; name: string; hint: string };
type Permission = { id: string; name: string; description: string; category: string };

const ROLES: Role[] = [
  { id: "admin", name: "管理者", hint: "全操作" },
  { id: "editor", name: "編集者", hint: "作成・編集" },
  { id: "viewer", name: "閲覧者", hint: "閲覧のみ" },
  { id: "guest", name: "ゲスト", hint: "限定共有" },
];

const PERMISSIONS: Permission[] = [
  {
    id: "user.manage",
    name: "ユーザー管理",
    description: "メンバーの追加・停止・権限変更",
    category: "管理",
  },
  { id: "member.invite", name: "メンバー招待", description: "招待リンクの発行", category: "管理" },
  {
    id: "billing.view",
    name: "請求書の閲覧",
    description: "請求・支払い履歴の参照",
    category: "請求",
  },
  { id: "billing.edit", name: "請求書の編集", description: "請求先・明細の変更", category: "請求" },
  {
    id: "report.export",
    name: "レポート出力",
    description: "CSV / PDF のエクスポート",
    category: "レポート",
  },
  { id: "audit.view", name: "監査ログ閲覧", description: "操作履歴の参照", category: "レポート" },
  {
    id: "apikey.issue",
    name: "APIキー発行",
    description: "連携用トークンの発行",
    category: "連携",
  },
  { id: "settings.edit", name: "設定変更", description: "組織設定・SSO の変更", category: "設定" },
];

/** 付与マトリクス（authz キャッシュと同じ `role permission` タプルの Set）。 */
const GRANTS: ReadonlySet<string> = new Set<string>([
  // 管理者: 全権限
  ...PERMISSIONS.map((p) => grantKey("admin", p.id)),
  // 編集者
  grantKey("editor", "member.invite"),
  grantKey("editor", "billing.view"),
  grantKey("editor", "report.export"),
  grantKey("editor", "apikey.issue"),
  // 閲覧者
  grantKey("viewer", "billing.view"),
  grantKey("viewer", "report.export"),
  grantKey("viewer", "audit.view"),
  // ゲスト
  grantKey("guest", "billing.view"),
]);

const roleOptions = ROLES.map((r) => ({ value: r.id, label: r.name }));
const roleName = (id: string) => ROLES.find((r) => r.id === id)?.name ?? id;

// ── セル: ✓ 許可 / — 不許可（shape + sr-only、色のみで状態を示さない） ────────
function GrantCell({ granted }: { granted: boolean }) {
  return granted ? (
    <Badge tone="success" variant="outline" className="justify-center">
      <Check aria-hidden="true" />
      <span className="sr-only">許可</span>
    </Badge>
  ) : (
    <span className="text-muted-foreground inline-flex items-center justify-center">
      <Minus aria-hidden="true" className="size-4" />
      <span className="sr-only">不許可</span>
    </span>
  );
}

// 固定列（先頭 = 権限）— スクロールする本体が下を通るので不透明背景 + トークン端。
const PIN_START = "sticky start-0 z-20 bg-inherit border-e border-border";

export default function Demo() {
  const [compareA, setCompareA] = React.useState("editor");
  const [compareB, setCompareB] = React.useState("viewer");
  const [diffOnly, setDiffOnly] = React.useState(false);

  const compare = React.useMemo<ComparePair>(() => [compareA, compareB], [compareA, compareB]);
  const compared = new Set(compare);
  const sameRole = compareA === compareB;

  const rows = visibleRows(PERMISSIONS, GRANTS, { compare, diffOnly: diffOnly && !sameRole });
  const diffN = sameRole ? 0 : countDifferences(PERMISSIONS, GRANTS, compare);

  return (
    <PageContainer
      title="権限マトリクス"
      subtitle="ロール × 権限の付与状況。先頭列を固定し、2 ロールを比較して差分のみ抽出できる（既定は読み取り専用）。"
      density="compact"
    >
      <Flex direction="col" gap="lg">
        {/* ── 比較コントロール ── */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>比較</CardTitle>
            <Text size="xs" tone="muted">
              2 つのロールを選ぶと差分を強調表示。「差分のみ」で一致行を隠す。
            </Text>
          </CardHeader>
          <CardContent>
            <Flex direction="row" wrap align="end" gap="md">
              <FormField label="比較 A">
                <Select
                  value={compareA}
                  onValueChange={setCompareA}
                  options={roleOptions}
                  clearable={false}
                  className="w-40"
                />
              </FormField>
              <FormField label="比較 B">
                <Select
                  value={compareB}
                  onValueChange={setCompareB}
                  options={roleOptions}
                  clearable={false}
                  className="w-40"
                />
              </FormField>
              <Flex direction="row" align="center" gap="sm">
                <Switch
                  id="pm-diff-only"
                  size="sm"
                  checked={diffOnly}
                  onCheckedChange={setDiffOnly}
                  disabled={sameRole}
                />
                <Label htmlFor="pm-diff-only">差分のみ</Label>
              </Flex>
              <Flex direction="row" align="center" gap="xs" aria-live="polite">
                {sameRole ? (
                  <Text size="xs" tone="muted">
                    同一ロールを比較中
                  </Text>
                ) : (
                  <>
                    <Badge tone={diffN > 0 ? "warning" : "success"} variant="outline">
                      差分 {diffN} 件
                    </Badge>
                    <Text size="xs" tone="muted">
                      {roleName(compareA)} vs {roleName(compareB)}
                    </Text>
                  </>
                )}
              </Flex>
            </Flex>
          </CardContent>
        </Card>

        {/* ── マトリクス本体 ── */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle level={2}>ロール × 権限</CardTitle>
            <Text size="xs" tone="muted" tabular>
              権限 {rows.length} / {PERMISSIONS.length} 件 · ロール {ROLES.length}
            </Text>
          </CardHeader>
          <CardContent flush>
            <div className="overflow-x-auto">
              <Table className="min-w-[760px]">
                <TableHeader className="bg-secondary [&_tr]:bg-secondary">
                  <TableRow className="bg-secondary hover:bg-secondary">
                    <TableHead className={cn(PIN_START, "w-64 min-w-64")}>権限</TableHead>
                    {ROLES.map((role) => {
                      const isCompared = !sameRole && compared.has(role.id);
                      return (
                        <TableHead
                          key={role.id}
                          className={cn("text-center", isCompared && "bg-primary/[0.06]")}
                          aria-label={isCompared ? `${role.name}（比較対象）` : role.name}
                        >
                          <span className="inline-flex flex-col items-center leading-tight">
                            <span className="inline-flex items-center gap-1">
                              <Text weight="medium">{role.name}</Text>
                              {isCompared && (
                                <Badge tone="primary" variant="outline">
                                  {role.id === compareA ? "A" : "B"}
                                </Badge>
                              )}
                            </span>
                            <Text size="2xs" tone="muted">
                              {role.hint} · {countGrants(PERMISSIONS, GRANTS, role.id)}件
                            </Text>
                          </span>
                        </TableHead>
                      );
                    })}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((perm) => {
                    const isDiffRow =
                      !sameRole && rolesDifferOnPermission(GRANTS, compare, perm.id);
                    return (
                      <TableRow
                        key={perm.id}
                        className={cn(isDiffRow && "bg-warning/[0.07] hover:bg-warning/10")}
                        aria-label={isDiffRow ? `${perm.name} · 比較ロール間で差分あり` : undefined}
                      >
                        <TableCell className={cn(PIN_START, "w-64 min-w-64 align-middle")}>
                          <div className="flex flex-col leading-tight">
                            <span className="inline-flex items-center gap-1.5">
                              <Text weight="medium">{perm.name}</Text>
                              {isDiffRow && (
                                <Badge tone="warning" variant="outline">
                                  差分
                                </Badge>
                              )}
                            </span>
                            <Text size="2xs" tone="muted">
                              {perm.category} · {perm.description}
                            </Text>
                          </div>
                        </TableCell>
                        {ROLES.map((role) => {
                          const isCompared = !sameRole && compared.has(role.id);
                          return (
                            <TableCell
                              key={role.id}
                              className={cn(
                                "text-center align-middle",
                                isCompared && "bg-primary/[0.04]",
                              )}
                            >
                              <GrantCell granted={hasGrant(GRANTS, role.id, perm.id)} />
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* ── 凡例 ── */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>凡例</CardTitle>
          </CardHeader>
          <CardContent>
            <Flex direction="row" wrap gap="md" align="center">
              <Flex direction="row" align="center" gap="xs">
                <Badge tone="success" variant="outline" className="justify-center">
                  <Check aria-hidden="true" />
                </Badge>
                <Text size="xs" tone="muted">
                  許可
                </Text>
              </Flex>
              <Flex direction="row" align="center" gap="xs">
                <span className="text-muted-foreground inline-flex">
                  <Minus aria-hidden="true" className="size-4" />
                </span>
                <Text size="xs" tone="muted">
                  不許可
                </Text>
              </Flex>
              <Flex direction="row" align="center" gap="xs">
                <Badge tone="warning" variant="outline">
                  差分
                </Badge>
                <Text size="xs" tone="muted">
                  比較 A / B で付与が異なる行
                </Text>
              </Flex>
            </Flex>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
