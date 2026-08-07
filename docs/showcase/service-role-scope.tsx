/**
 * Showcase · service-role-scope — サービスロールと適用範囲 (SCR-203 / SCR-111b)
 *
 * The canonical answer to gh#257: `ServiceRolePanel` and `BranchScopePicker`.
 *
 * GATE 0 — both are COMPOSITION PATTERNS, not framework components
 * (docs/COMPOSITION-VS-COMPONENT.md). Recorded verdict:
 *
 *   ServiceRolePanel    C1 ❌ RBAC-admin-specific, not a cross-domain capability
 *                       C2 ❌ owns no behaviour beyond ListRow + Select
 *                       C3 ❌ expressible today from Card + ListRow + Select + tokens
 *                       C4 ❌ a screen-shaped grab-bag API (services × roles × locks)
 *                       C5 ✅ fully tokenized
 *                       C6 ❌ the i18n/a11y cost buys nothing the primitives don't already pay
 *                       C7 ❌ one admin surface, not every app
 *
 *   BranchScopePicker   C1 ❌  C2 ❌  C3 ❌  C4 ❌  C5 ✅  C6 ❌  C7 ❌
 *                       — and worse than a FAIL: a hierarchical multi-select with parent/child
 *                       aggregation is EXACTLY `TreeSelect`. Adding it would DUPLICATE a
 *                       primitive, which the cardinal no-duplication rule forbids outright.
 *
 * So both are built HERE from real primitives. The permission matrix — the third contract in
 * gh#257 — has its own showcase (docs/showcase/permission-matrix.tsx) and its reusable half, the
 * grant/diff data logic, already ships as the pure `@godxjp/ui/lib/permission-grid` util.
 *
 * This page exists to prove the states gh#257 asked for are reachable with NO consumer CSS and no
 * new component: read-only/locked · loading · empty · validation · error · permission-denied ·
 * destructive-confirmation. Layout is `MasterDetail`, so there is no grid-template-columns and no
 * media query at 1440 / 1024 / 390.
 *
 * DNA: read-only is a Badge STATING the fact, never a disabled control (a disabled Select is a
 * dead tab stop that implies "editable later"); every state is shape- or text-encoded, never
 * colour alone; quiet JP copy; no emoji.
 */
import * as React from "react";

import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  ListRow,
} from "@godxjp/ui/data-display";
import {
  FormField,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SHOW_PARENT,
  TreeSelect,
} from "@godxjp/ui/data-entry";
import { Alert, AlertDescription, AlertDialog, AlertTitle, Skeleton } from "@godxjp/ui/feedback";
import { Button, Text } from "@godxjp/ui/general";
import { Flex, MasterDetail, PageContainer } from "@godxjp/ui/layout";

// ── ドメイン: ロール（左）· サービス（右）· 支店ツリー ────────────────────────────────────
type Role = { id: string; name: string; hint: string };
type Service = {
  id: string;
  name: string;
  description: string;
  roleId: string;
  /** 経路や権限によって固定されているサービス（ユーザーは変更できない）。 */
  locked?: boolean;
};

/** 一覧の状態 — gh#257 が列挙した各状態を実際に描画するためのスイッチ。 */
type PanelState = "ready" | "loading" | "empty" | "error" | "denied";

const ROLES: Role[] = [
  { id: "admin", name: "管理者", hint: "全操作" },
  { id: "editor", name: "編集者", hint: "作成・編集" },
  { id: "viewer", name: "閲覧者", hint: "閲覧のみ" },
];

const SERVICES: Service[] = [
  { id: "billing", name: "請求管理", description: "請求書の発行と入金消込", roleId: "editor" },
  { id: "hr", name: "勤怠管理", description: "打刻と勤務表の承認", roleId: "viewer" },
  {
    id: "audit",
    name: "監査ログ",
    description: "組織全体の操作履歴（閲覧専用）",
    roleId: "viewer",
    locked: true,
  },
];

const BRANCHES = [
  {
    value: "jp",
    label: "日本",
    children: [
      {
        value: "jp-east",
        label: "東日本",
        children: [
          { value: "jp-tokyo", label: "東京本社" },
          { value: "jp-saitama", label: "さいたま支店" },
        ],
      },
      {
        value: "jp-west",
        label: "西日本",
        children: [
          { value: "jp-osaka", label: "大阪支店" },
          { value: "jp-fukuoka", label: "福岡支店（九州エリア統括拠点）" },
        ],
      },
    ],
  },
];

const PANEL_STATES: PanelState[] = ["ready", "loading", "empty", "error", "denied"];

export default function Demo() {
  const [roleId, setRoleId] = React.useState(ROLES[0].id);
  const [services, setServices] = React.useState(SERVICES);
  const [scope, setScope] = React.useState<string[]>(["jp-tokyo"]);
  const [panelState, setPanelState] = React.useState<PanelState>("ready");
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const role = ROLES.find((r) => r.id === roleId) ?? ROLES[0];
  // 検証: 適用範囲が空のロールは何も許可しないため、保存させない。
  const scopeError = scope.length === 0 ? "少なくとも1つの支店を選択してください。" : undefined;

  const assign = (serviceId: string, nextRoleId: string) =>
    setServices((prev) => prev.map((s) => (s.id === serviceId ? { ...s, roleId: nextRoleId } : s)));

  return (
    <PageContainer
      title="サービスロールと適用範囲"
      subtitle="ServiceRolePanel · BranchScopePicker · いずれもコンポーネントではなく合成パターン (gh#257)"
      meta={<Badge tone="info">gh#257</Badge>}
      extra={
        <Flex direction="row" gap="xs" wrap>
          {PANEL_STATES.map((state) => (
            <Button
              key={state}
              size="sm"
              variant={state === panelState ? "secondary" : "ghost"}
              aria-pressed={state === panelState}
              onClick={() => setPanelState(state)}
            >
              {state}
            </Button>
          ))}
        </Flex>
      }
    >
      {/* MasterDetail がトラック・ギャップ・折り返し閾値をトークンで所有するので、
          このページには grid-template-columns もメディアクエリもない。 */}
      <MasterDetail
        masterLabel="ロール一覧"
        detailLabel={`${role.name} の設定`}
        detailId="service-role-detail"
        master={
          <Flex direction="col" gap="xs">
            {ROLES.map((item) => (
              <Button
                key={item.id}
                variant={item.id === roleId ? "secondary" : "ghost"}
                aria-pressed={item.id === roleId}
                aria-controls="service-role-detail"
                onClick={() => setRoleId(item.id)}
              >
                {item.name}
                <Badge tone="neutral">{item.hint}</Badge>
              </Button>
            ))}
          </Flex>
        }
      >
        <Flex direction="col" gap="lg">
          {/* ── 1. SERVICE ROLE PANEL ─────────────────────────────────────────────────────
                 Card + CardContent flush + <ul> of ListRow as="li"。行間の区切り線は
                 flush が与えるもので、サービスごとにカードを積むのではない。 ── */}
          <Card>
            <CardHeader>
              <CardTitle level={2}>サービス権限</CardTitle>
              <CardDescription>
                {role.name} がサービスごとに持つロールです。変更は保存時に適用されます。
              </CardDescription>
            </CardHeader>
            <CardContent flush={panelState === "ready"}>
              {panelState === "ready" && (
                <ul>
                  {services.map((service) => (
                    <ListRow
                      as="li"
                      key={service.id}
                      title={service.name}
                      description={service.description}
                      trailing={
                        service.locked ? (
                          // READ-ONLY / LOCKED は事実を述べる Badge。無効化した Select は
                          // 「あとで編集できる」と誤解させるだけの死んだタブストップになる。
                          <Badge tone="neutral">
                            {ROLES.find((r) => r.id === service.roleId)?.name}（変更不可）
                          </Badge>
                        ) : (
                          <Select
                            value={service.roleId}
                            onValueChange={(next: string) => assign(service.id, next)}
                          >
                            <SelectTrigger aria-label={`${service.name} のロール`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ROLES.map((item) => (
                                <SelectItem key={item.id} value={item.id}>
                                  {item.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )
                      }
                    />
                  ))}
                </ul>
              )}

              {/* LOADING — 確定後の行と同じ高さのスケルトン。高さが違うと確定時に飛ぶ。 */}
              {panelState === "loading" && (
                <Flex direction="col" gap="sm">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </Flex>
              )}

              {panelState === "empty" && (
                <EmptyState
                  title="割り当て可能なサービスがありません"
                  description="組織にサービスを追加すると、ここでロールを設定できます。"
                />
              )}

              {panelState === "error" && (
                <Alert tone="destructive">
                  <AlertTitle>サービス一覧を取得できませんでした</AlertTitle>
                  <AlertDescription>
                    通信エラーが発生しました。しばらくしてから再試行してください。
                  </AlertDescription>
                  <Alert.Actions>
                    <Button variant="outline" size="sm">
                      再試行
                    </Button>
                  </Alert.Actions>
                </Alert>
              )}

              {/* PERMISSION-DENIED — セクション単位なので Alert。ページ全体が禁止なら
                  ErrorSurface mode="denied" に置き換える（見えてはいけないリソース名を
                  ページヘッダーが漏らさないため）。 */}
              {panelState === "denied" && (
                <Alert tone="warning">
                  <AlertTitle>この設定を表示する権限がありません</AlertTitle>
                  <AlertDescription>
                    サービス権限の閲覧には組織管理者のロールが必要です。
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* ── 2. BRANCH SCOPE PICKER ────────────────────────────────────────────────────
                 階層つき複数選択そのもの = TreeSelect。チェックボックスツリーを手書き
                 しないこと、そして BranchScopePicker を追加しないこと（プリミティブの
                 重複になる）。SHOW_PARENT は「全社」を 42 個のチップではなく 1 個に畳む。
                 検証エラーは FormField の error（aria-errormessage 経由で読み上げられる）
                 であって、色だけの表現ではない。 ── */}
          <Card>
            <CardHeader>
              <CardTitle level={2}>適用範囲</CardTitle>
              <CardDescription>
                選択した支店とその配下にのみ、上のロールが適用されます。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Flex direction="col" gap="md">
                <FormField
                  label="適用範囲（支店）"
                  required
                  helper="親を選ぶと配下の支店もすべて含まれます。"
                  error={scopeError}
                >
                  <TreeSelect
                    multiple
                    treeCheckable
                    showSearch
                    allowClear
                    showCheckedStrategy={SHOW_PARENT}
                    treeDefaultExpandAll
                    treeData={BRANCHES}
                    value={scope}
                    onValueChange={(next: string | string[] | undefined) =>
                      setScope(Array.isArray(next) ? next : next ? [String(next)] : [])
                    }
                    disabled={panelState === "denied"}
                    placeholder="支店を選択"
                  />
                </FormField>

                <Text tone="muted" size="xs">
                  選択中: {scope.length} 件
                </Text>
              </Flex>
            </CardContent>
          </Card>

          {/* ── 3. DESTRUCTIVE CONFIRMATION ──────────────────────────────────────────────
                 ロールの剥奪は UI から取り消せないので Dialog mode="confirm" を通す。 ── */}
          <Flex direction="row" gap="sm" wrap>
            <Button disabled={Boolean(scopeError) || panelState !== "ready"}>保存</Button>
            <Button
              variant="destructive"
              disabled={panelState !== "ready"}
              onClick={() => setConfirmOpen(true)}
            >
              このロールを剥奪
            </Button>
          </Flex>

          <AlertDialog
            open={confirmOpen}
            onOpenChange={setConfirmOpen}
            variant="destructive"
            title={`${role.name} を剥奪しますか？`}
            description="このロールに紐づくすべてのサービス権限と適用範囲が失われます。この操作は取り消せません。"
            confirmLabel="剥奪する"
            cancelLabel="キャンセル"
            onConfirm={() => setConfirmOpen(false)}
          />
        </Flex>
      </MasterDetail>
    </PageContainer>
  );
}
