/**
 * Showcase · case3 — 欠勤承認ワークフロー (Absence approval workflow)
 *
 * The richest admin screen in dxs-kintai (screens.md §2.4 / ui-kit-surfaces.md §4):
 * a 4-column filter bar, a row-selectable DataTable with a bulk approve/reject +
 * reclassify toolbar, status/type Badge cells, an inline reject prompt that demands
 * a reason, an EmptyState (filtered-to-nothing), and a Skeleton loading variant.
 * Served at `/showcase/case3-approval-workflow`.
 *
 * Built ENTIRELY from real @godxjp/ui primitives — the design-handoff "skeleton,
 * not transcription" rule. Composition map (prototype block → @godxjp/ui primitive):
 *   page chrome ............... AppShell + Sidebar + Topbar
 *   page header + bulk-approve  PageContainer (extra slot) + Button (live count)
 *   4-col filter bar .......... Card + ResponsiveGrid + FormField + Select + DatePicker
 *   bulk toolbar .............. DataTable.Toolbar + DataTable.BulkActions
 *   selectable approval table . DataTable (selectable, getRowId) + ColumnDef
 *   type / status cells ....... Badge tone (fixed color signaling)
 *   inline reject prompt ...... Card + FormField + Input + Button (reason required)
 *   empty (no match) .......... EmptyState
 *   loading ................... DataTable loading / SkeletonTable
 *
 * DNA: compact density, small headings, fixed color signaling — 区分/状態 badges
 * keep one meaning across tenants (a 却下 badge is 茜 danger everywhere); 遅刻 uses
 * 朱 attention (non-destructive), 欠勤 uses 茜 danger. Quiet JP copy, tabular-nums,
 * no emoji. Betoya-tenant accent is optional and would override ONLY --primary
 * (the 一括承認 button + active nav) — semantic status badges stay shared.
 */
import * as React from "react";
import { Check, ClipboardCheck, Clock, Download, Tag, Users, X } from "lucide-react";

import { Button, Logo, Text } from "@godxjp/ui/general";
import {
  Badge,
  type BadgeProps,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DataTable,
  type ColumnDef,
  EmptyState,
} from "@godxjp/ui/data-display";
import { Alert, AlertDescription, SkeletonTable } from "@godxjp/ui/feedback";
import { DatePicker, FormField, Input, Select } from "@godxjp/ui/data-entry";
import {
  AppShell,
  Flex,
  PageContainer,
  ResponsiveGrid,
  Sidebar,
  type SidebarSectionProp,
  Topbar,
} from "@godxjp/ui/layout";

type BadgeTone = NonNullable<BadgeProps["tone"]>;

// ── Domain vocabulary ─────────────────────────────────────────────────────────

type AbsenceType = "paid" | "unpaid" | "late" | "earlyLeave" | "trip";
type AbsenceStatus = "draft" | "approved" | "rejected";

const TYPE_LABEL: Record<AbsenceType, string> = {
  paid: "有給",
  unpaid: "欠勤",
  late: "遅刻",
  earlyLeave: "早退",
  trip: "出張",
};

// Fixed color signaling: 有給/出張 are routine (info/neutral), 遅刻/早退 are
// non-destructive attention (朱), 欠勤 is the destructive case (茜 danger).
const TYPE_TONE: Record<AbsenceType, BadgeTone> = {
  paid: "info",
  trip: "info",
  late: "warning",
  earlyLeave: "warning",
  unpaid: "destructive",
};

const STATUS_LABEL: Record<AbsenceStatus, string> = {
  draft: "下書き",
  approved: "承認済",
  rejected: "却下",
};

const STATUS_TONE: Record<AbsenceStatus, BadgeTone> = {
  draft: "warning",
  approved: "success",
  rejected: "destructive",
};

type AbsenceRow = {
  id: string;
  date: string;
  employee: string;
  type: AbsenceType;
  hours: number | null;
  status: AbsenceStatus;
  reason: string;
};

// Vietnamese staff names under the (optional) Betoya tenant — copy stays mixed JP/VI.
const ROWS: AbsenceRow[] = [
  {
    id: "ABS-0042",
    date: "2026-06-03",
    employee: "EMP-0042 · Trần Mỹ Linh",
    type: "late",
    hours: 0.5,
    status: "draft",
    reason: "電車遅延 (中央線) のため30分遅刻。振替で対応予定。",
  },
  {
    id: "ABS-0041",
    date: "2026-06-03",
    employee: "EMP-0039 · Phạm Quốc Bảo",
    type: "paid",
    hours: 8,
    status: "draft",
    reason: "私用のため終日有給を申請します。",
  },
  {
    id: "ABS-0040",
    date: "2026-06-02",
    employee: "EMP-0051 · Nguyễn Thu Hà",
    type: "unpaid",
    hours: 8,
    status: "draft",
    reason: "体調不良。診断書は後日提出します。",
  },
  {
    id: "ABS-0039",
    date: "2026-06-02",
    employee: "EMP-0044 · Lê Hoàng Nam",
    type: "earlyLeave",
    hours: 2,
    status: "draft",
    reason: "子の通院付き添いのため2時間早退。",
  },
  {
    id: "ABS-0038",
    date: "2026-06-01",
    employee: "EMP-0042 · Trần Mỹ Linh",
    type: "trip",
    hours: null,
    status: "approved",
    reason: "Hà Nội 倉庫の立ち上げ支援 (3日間)。",
  },
  {
    id: "ABS-0037",
    date: "2026-05-30",
    employee: "EMP-0060 · Đỗ Minh Khôi",
    type: "unpaid",
    hours: 8,
    status: "rejected",
    reason: "事前申請なし。勤怠規程によりエントリを修正のこと。",
  },
];

// ── Filter option lists (data-driven Select) ───────────────────────────────────

const TYPE_OPTIONS = [
  { value: "all", label: "すべて" },
  ...(Object.keys(TYPE_LABEL) as AbsenceType[]).map((t) => ({ value: t, label: TYPE_LABEL[t] })),
];

const STATUS_OPTIONS = [
  { value: "all", label: "すべて" },
  ...(Object.keys(STATUS_LABEL) as AbsenceStatus[]).map((s) => ({
    value: s,
    label: STATUS_LABEL[s],
  })),
];

// ── Sidebar ─────────────────────────────────────────────────────────────────

const NAV_SECTIONS: SidebarSectionProp[] = [
  {
    label: "勤怠",
    items: [
      { id: "logs", label: "打刻ログ", icon: Clock },
      { id: "absences", label: "欠勤・遅刻", icon: ClipboardCheck, badge: 12 },
      { id: "entries", label: "勤怠エントリ", icon: ClipboardCheck },
    ],
  },
  {
    label: "組織",
    items: [{ id: "employees", label: "従業員", icon: Users }],
  },
];

const yenlessHours = (h: number | null) => (h === null ? "—" : `${h.toFixed(1)}h`);

export default function Demo() {
  // Each section below owns its own state + data (no shared setters across cards).
  const [type, setType] = React.useState("all");
  const [status, setStatus] = React.useState("draft");
  const [from, setFrom] = React.useState<string | undefined>();
  const [to, setTo] = React.useState<string | undefined>();
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [rejectTargetId, setRejectTargetId] = React.useState<string | null>(null);
  const [rejectReason, setRejectReason] = React.useState("");

  const hasActiveFilters = type !== "all" || status !== "draft" || !!from || !!to;
  const clearFilters = () => {
    setType("all");
    setStatus("draft");
    setFrom(undefined);
    setTo(undefined);
  };

  const filtered = React.useMemo(
    () =>
      ROWS.filter(
        (r) =>
          (type === "all" || r.type === type) &&
          (status === "all" || r.status === status) &&
          (!from || r.date >= from) &&
          (!to || r.date <= to),
      ),
    [type, status, from, to],
  );

  const rejectTarget = ROWS.find((r) => r.id === rejectTargetId) ?? null;

  const columns: ColumnDef<AbsenceRow>[] = [
    { key: "date", header: "日付", width: "w-28", render: (r) => <Text tabular>{r.date}</Text> },
    {
      key: "employee",
      header: "従業員",
      render: (r) => (
        <Text mono size="xs">
          {r.employee}
        </Text>
      ),
    },
    {
      key: "type",
      header: "区分",
      render: (r) => (
        <Badge tone={TYPE_TONE[r.type]} variant="outline">
          {TYPE_LABEL[r.type]}
        </Badge>
      ),
    },
    {
      key: "hours",
      header: "時間",
      align: "right",
      render: (r) => <Text tabular>{yenlessHours(r.hours)}</Text>,
    },
    {
      key: "status",
      header: "状態",
      render: (r) => (
        <Badge tone={STATUS_TONE[r.status]} variant="outline">
          {STATUS_LABEL[r.status]}
        </Badge>
      ),
    },
    {
      key: "reason",
      header: "理由",
      hiddenOnMobile: true,
      render: (r) => (
        <Text as="span" tone="muted" truncate className="block max-w-64" title={r.reason}>
          {r.reason}
        </Text>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      width: "w-32",
      render: (r) =>
        r.status === "draft" ? (
          <Flex direction="row" justify="end" gap="xs">
            <Button size="sm" variant="outline" aria-label={`${r.id} を承認`}>
              <Check aria-hidden="true" />
              承認
            </Button>
            <Button
              size="sm"
              variant="outline"
              aria-label={`${r.id} を却下`}
              onClick={() => {
                setRejectTargetId(r.id);
                setRejectReason("");
              }}
            >
              <X aria-hidden="true" />
              却下
            </Button>
          </Flex>
        ) : (
          // Terminal rows lock actions — the key approval-UX rule.
          <Text size="xs" tone="muted">
            変更不可
          </Text>
        ),
    },
  ];

  const sidebar = (
    <Sidebar
      activeId="absences"
      onSelect={() => {}}
      sections={NAV_SECTIONS}
      product={{ name: "Betoya", role: "勤怠管理 · 本社", color: "hsl(var(--primary))" }}
    />
  );

  return (
    <AppShell sidebar={sidebar} topbar={<Topbar start={<Logo label="dxs · kintai" glyph="d" />} />}>
      <PageContainer
        title="欠勤・遅刻 · Vắng mặt"
        subtitle="12 件未承認 · 申請の承認 / 却下 / 再分類"
        density="compact"
        breadcrumb={[{ label: "勤怠" }, { label: "欠勤・遅刻" }]}
        extra={
          <Flex direction="row" wrap align="center" gap="sm">
            <Button variant="outline" size="sm">
              <Download aria-hidden="true" />
              エクスポート
            </Button>
            <Button size="sm" disabled={selected.size === 0}>
              <Check aria-hidden="true" />
              一括承認 ({selected.size})
            </Button>
          </Flex>
        }
      >
        <Flex direction="col" gap="lg">
          {/* ── 4-column filter bar ───────────────────────────────────────── */}
          <Card className="self-start">
            <CardContent>
              <ResponsiveGrid columns={{ sm: 1, md: 2, lg: 4 }}>
                <FormField id="f-type" label="区分">
                  <Select
                    options={TYPE_OPTIONS}
                    value={type}
                    onValueChange={setType}
                    placeholder="すべて"
                  />
                </FormField>
                <FormField id="f-status" label="状態">
                  <Select
                    options={STATUS_OPTIONS}
                    value={status}
                    onValueChange={setStatus}
                    placeholder="すべて"
                  />
                </FormField>
                <FormField id="f-from" label="期間 (開始)">
                  <DatePicker value={from} onValueChange={setFrom} placeholder="YYYY-MM-DD" />
                </FormField>
                <FormField id="f-to" label="期間 (終了)">
                  <DatePicker value={to} onValueChange={setTo} placeholder="YYYY-MM-DD" />
                </FormField>
              </ResponsiveGrid>
              {hasActiveFilters && (
                <Flex direction="row" justify="end" className="mt-3">
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X aria-hidden="true" />
                    条件をクリア
                  </Button>
                </Flex>
              )}
            </CardContent>
          </Card>

          {/* ── Inline reject prompt (conditional, reason required) ────────── */}
          {rejectTarget && (
            <Card className="border-destructive/40 self-start">
              <CardHeader>
                <CardTitle>申請を却下 · {rejectTarget.id}</CardTitle>
              </CardHeader>
              <CardContent>
                <Flex direction="col" gap="md">
                  <Text as="p" size="sm" tone="muted">
                    {rejectTarget.employee} の「{TYPE_LABEL[rejectTarget.type]}
                    」を却下します。理由を入力してください。
                  </Text>
                  <FormField
                    id="reject-reason"
                    label="却下理由"
                    required
                    error={rejectReason.trim() === "" ? "却下には理由が必要です。" : undefined}
                  >
                    <Input
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="例: 事前申請が必要です。勤怠規程をご確認ください。"
                    />
                  </FormField>
                  <Flex direction="row" justify="end" gap="sm">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setRejectTargetId(null);
                        setRejectReason("");
                      }}
                    >
                      キャンセル
                    </Button>
                    <Button
                      size="sm"
                      disabled={rejectReason.trim() === ""}
                      onClick={() => {
                        setRejectTargetId(null);
                        setRejectReason("");
                      }}
                    >
                      <X aria-hidden="true" />
                      却下する
                    </Button>
                  </Flex>
                </Flex>
              </CardContent>
            </Card>
          )}

          {/* ── Selectable approval table + bulk toolbar ──────────────────── */}
          <Card className="self-start">
            <CardContent flush>
              <DataTable
                data={filtered}
                columns={columns}
                getRowId={(r) => r.id}
                selectable
                selected={selected}
                onSelectChange={setSelected}
                density="compact"
                empty={
                  <EmptyState
                    icon={ClipboardCheck}
                    title="該当する申請はありません"
                    description="フィルター条件を変更すると申請が表示されます。"
                    action={
                      hasActiveFilters ? (
                        <Button variant="outline" size="sm" onClick={clearFilters}>
                          条件をクリア
                        </Button>
                      ) : undefined
                    }
                  />
                }
              >
                <DataTable.Toolbar>
                  <DataTable.BulkActions>
                    <Button size="sm" variant="outline">
                      <Check aria-hidden="true" />
                      承認
                    </Button>
                    <Button size="sm" variant="outline">
                      <X aria-hidden="true" />
                      却下
                    </Button>
                    <Button size="sm" variant="outline">
                      <Tag aria-hidden="true" />
                      有給に再分類
                    </Button>
                    <Button size="sm" variant="outline">
                      <Tag aria-hidden="true" />
                      遅刻に再分類
                    </Button>
                  </DataTable.BulkActions>
                  <DataTable.DensityToggle />
                </DataTable.Toolbar>
              </DataTable>
            </CardContent>
          </Card>

          {/* ── Loading variant (staged visible at rest) ──────────────────── */}
          <Card className="self-start">
            <CardHeader>
              <CardTitle>読み込み中の表示</CardTitle>
            </CardHeader>
            <CardContent flush>
              <SkeletonTable rows={4} columns={6} />
            </CardContent>
          </Card>

          {/* ── Empty variant (staged visible at rest) ────────────────────── */}
          <Card className="self-start">
            <CardHeader>
              <CardTitle>空の表示</CardTitle>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon={ClipboardCheck}
                title="未承認の申請はありません"
                description="新しい欠勤・遅刻の申請が届くとここに表示されます。"
              />
            </CardContent>
          </Card>

          {/* ── Error variant (staged visible at rest) ────────────────────── */}
          <Alert tone="destructive">
            <AlertDescription>
              申請の読み込みに失敗しました。時間をおいて再度お試しください。
            </AlertDescription>
          </Alert>
        </Flex>
      </PageContainer>
    </AppShell>
  );
}
