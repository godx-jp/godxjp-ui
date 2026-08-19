/**
 * PermissionMatrix — 権限マトリクス (canonical RBAC role × permission grid, gh#257).
 *
 * A REAL export from `@godxjp/ui/data-display` (the gh#251 lesson: a consumer cannot import a
 * docs page). Read-only ✓/— by default; `onGrantChange` switches to editable checkbox cells with
 * locked roles kept read-only; compare + 差分のみ come from `lib/permission-grid`; lifecycle
 * states follow the DataTable #216 vocabulary. Domain data below is demo-only — the library
 * encodes no platform role or permission.
 */
import * as React from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  PermissionMatrix,
} from "@godxjp/ui/data-display";
import { Label, Select, Switch } from "@godxjp/ui/data-entry";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import { grantKey } from "@godxjp/ui/lib/permission-grid";

const ROLES = [
  { id: "admin", name: "管理者", description: "全操作", locked: true },
  { id: "editor", name: "編集者", description: "作成・編集" },
  { id: "viewer", name: "閲覧者", description: "閲覧のみ" },
];

const PERMISSIONS = [
  { id: "user.manage", name: "ユーザー管理", description: "メンバーの追加・停止", group: "管理" },
  { id: "member.invite", name: "メンバー招待", description: "招待リンクの発行", group: "管理" },
  {
    id: "billing.view",
    name: "請求書の閲覧",
    description: "請求・支払い履歴の参照",
    group: "請求",
  },
  { id: "billing.edit", name: "請求書の編集", description: "請求先・明細の変更", group: "請求" },
  {
    id: "report.export",
    name: "レポート出力",
    description: "CSV / PDF のエクスポート",
    group: "レポート",
  },
];

const INITIAL_GRANTS = new Set<string>([
  ...PERMISSIONS.map((p) => grantKey("admin", p.id)),
  grantKey("editor", "member.invite"),
  grantKey("editor", "billing.view"),
  grantKey("editor", "report.export"),
  grantKey("viewer", "billing.view"),
]);

const roleOptions = ROLES.map((r) => ({ value: r.id, label: r.name }));

export default function Demo() {
  const [grants, setGrants] = React.useState<ReadonlySet<string>>(INITIAL_GRANTS);
  const [compareA, setCompareA] = React.useState("editor");
  const [compareB, setCompareB] = React.useState("viewer");
  const [diffOnly, setDiffOnly] = React.useState(false);

  return (
    <PageContainer
      title="PermissionMatrix"
      subtitle="ロール × 権限の付与グリッド。既定は読み取り専用、onGrantChange で編集可能。"
      density="compact"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>読み取り専用（既定）</CardTitle>
            <CardDescription>
              onGrantChange を渡さない限りセルは ✓/—（形状 + sr-only、色のみに依存しない）。
            </CardDescription>
          </CardHeader>
          <CardContent flush>
            <PermissionMatrix roles={ROLES} permissions={PERMISSIONS} grants={grants} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>編集可能 + ロック済みロール</CardTitle>
            <CardDescription>
              onGrantChange があるとセルは実 Checkbox。locked の「管理者」列は読み取り専用のまま。
            </CardDescription>
          </CardHeader>
          <CardContent flush>
            <PermissionMatrix
              roles={ROLES}
              permissions={PERMISSIONS}
              grants={grants}
              onGrantChange={(roleId, permissionId, granted) => {
                setGrants((prev) => {
                  const next = new Set(prev);
                  if (granted) next.add(grantKey(roleId, permissionId));
                  else next.delete(grantKey(roleId, permissionId));
                  return next;
                });
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>比較 + 差分のみ</CardTitle>
            <CardDescription>
              compare の 2 ロール列を強調し、diffOnly で一致行を隠す（lib/permission-grid
              と同一ロジック）。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Flex direction="row" wrap align="end" gap="md">
                <Select
                  value={compareA}
                  onValueChange={setCompareA}
                  options={roleOptions}
                  clearable={false}
                  className="w-40"
                />
                <Select
                  value={compareB}
                  onValueChange={setCompareB}
                  options={roleOptions}
                  clearable={false}
                  className="w-40"
                />
                <Flex direction="row" align="center" gap="sm">
                  <Switch
                    id="pm-doc-diff-only"
                    size="sm"
                    checked={diffOnly}
                    onCheckedChange={setDiffOnly}
                  />
                  <Label htmlFor="pm-doc-diff-only">差分のみ</Label>
                </Flex>
              </Flex>
              <div className="border-border overflow-hidden rounded-md border">
                <PermissionMatrix
                  roles={ROLES}
                  permissions={PERMISSIONS}
                  grants={grants}
                  compare={[compareA, compareB]}
                  diffOnly={diffOnly}
                />
              </div>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>ライフサイクル状態（#216 と同じ語彙）</CardTitle>
            <CardDescription>loading → denied → error → empty の優先順位。</CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <PermissionMatrix roles={ROLES} permissions={PERMISSIONS} grants={grants} loading />
              <PermissionMatrix roles={ROLES} permissions={[]} grants={grants} denied />
              <PermissionMatrix
                roles={ROLES}
                permissions={[]}
                grants={grants}
                error
                onRetry={() => {}}
              />
              <PermissionMatrix roles={ROLES} permissions={[]} grants={grants} />
            </Flex>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
