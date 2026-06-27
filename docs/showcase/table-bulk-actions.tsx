/**
 * Showcase · table-bulk-actions — 一括操作 (V2)
 *
 * Pattern: row selection REPLACES the list toolbar with a dedicated bulk-action
 * bar. When nothing is selected the table shows its normal toolbar (search +
 * 部署 filter + density). The moment one row is checked, that whole toolbar row
 * is swapped for a primary-tint bar that:
 *   - states the selected count and offers a cross-page "全 N 件を選択" escalation
 *   - groups the safe batch actions (一括承認 / CSV出力) on the left
 *   - ISOLATES the one destructive action (一括削除, tone 茜/destructive) on the
 *     right, gated behind an AlertDialog confirm — never sat next to the safe ones
 *   - offers 解除 to clear the selection and restore the toolbar
 *
 * Built only from real @godxjp/ui primitives — DataTable / Button / Badge /
 * Checkbox / SearchInput / Select / AlertDialog. The swap + tint bar is an
 * app-level COMPOSITION around DataTable.Content (see gapNotes): the library's
 * built-in DataTable.BulkActions sits *inside* the toolbar and has no
 * cross-page-select / isolated-destructive / tinted-replacement behaviour, so we
 * compose it from primitives rather than fake a component.
 *
 * DNA: compact density, small headings, tabular-nums numerics, fixed colour
 * signaling (承認済 若竹/success · 申請中 山吹/warning · 要確認 朱→attention via
 * destructive-restraint, here info 群青 for シフト) , quiet JP copy, no emoji.
 */
import * as React from "react";
import { CheckCheck, Download, Trash2, X } from "lucide-react";

import { Button, Text } from "@godxjp/ui/general";
import {
  Badge,
  type BadgeProps,
  Card,
  CardContent,
  DataTable,
  type ColumnDef,
} from "@godxjp/ui/data-display";
import { SearchInput, Select } from "@godxjp/ui/data-entry";
import { AlertDialog } from "@godxjp/ui/feedback";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import type { SortStateProp } from "@godxjp/ui/props";

// ── Domain model: 勤怠申請 (attendance / leave requests awaiting approval) ──────

type BadgeTone = NonNullable<BadgeProps["tone"]>;

type RequestStatus = "approved" | "pending" | "review" | "shift";

const STATUS_META: Record<
  RequestStatus,
  { label: string; tone: Extract<BadgeTone, "success" | "warning" | "destructive" | "info"> }
> = {
  approved: { label: "承認済", tone: "success" }, // 若竹
  pending: { label: "申請中", tone: "warning" }, // 山吹
  review: { label: "要確認", tone: "destructive" }, // 茜 (差戻し候補)
  shift: { label: "シフト変更", tone: "info" }, // 群青
};

type AttendanceRequest = {
  id: string;
  employee: string;
  dept: string;
  type: string;
  date: string;
  hours: number;
  status: RequestStatus;
};

const DEPARTMENTS = ["営業部", "開発部", "総務部", "カスタマーサポート"] as const;

const REQUESTS: AttendanceRequest[] = [
  {
    id: "REQ-2041",
    employee: "佐藤 美咲",
    dept: "営業部",
    type: "残業申請",
    date: "2026-06-03",
    hours: 2.5,
    status: "pending",
  },
  {
    id: "REQ-2040",
    employee: "鈴木 健一",
    dept: "開発部",
    type: "有給休暇",
    date: "2026-06-03",
    hours: 8.0,
    status: "approved",
  },
  {
    id: "REQ-2039",
    employee: "高橋 さくら",
    dept: "総務部",
    type: "遅刻届",
    date: "2026-06-02",
    hours: 1.0,
    status: "review",
  },
  {
    id: "REQ-2038",
    employee: "田中 大輔",
    dept: "カスタマーサポート",
    type: "シフト変更",
    date: "2026-06-02",
    hours: 0,
    status: "shift",
  },
  {
    id: "REQ-2037",
    employee: "伊藤 陽菜",
    dept: "営業部",
    type: "早退届",
    date: "2026-06-01",
    hours: 3.0,
    status: "pending",
  },
  {
    id: "REQ-2036",
    employee: "渡辺 翔太",
    dept: "開発部",
    type: "残業申請",
    date: "2026-06-01",
    hours: 4.0,
    status: "pending",
  },
  {
    id: "REQ-2035",
    employee: "山本 結衣",
    dept: "総務部",
    type: "有給休暇",
    date: "2026-05-30",
    hours: 8.0,
    status: "approved",
  },
  {
    id: "REQ-2034",
    employee: "中村 拓海",
    dept: "カスタマーサポート",
    type: "遅刻届",
    date: "2026-05-30",
    hours: 0.5,
    status: "review",
  },
];

const TOTAL_ACROSS_PAGES = 124; // server-reported total matching the active filter

const hours = new Intl.NumberFormat("ja-JP", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const columns: ColumnDef<AttendanceRequest>[] = [
  { key: "id", header: "申請番号", width: "w-28" },
  { key: "employee", header: "従業員", sortable: true },
  { key: "dept", header: "部署", hiddenOnMobile: true },
  { key: "type", header: "種別", hiddenOnMobile: true },
  { key: "date", header: "対象日", align: "right", sortable: true },
  {
    key: "hours",
    header: "時間",
    align: "right",
    sortable: true,
    render: (row) => <Text tabular>{row.hours === 0 ? "—" : `${hours.format(row.hours)} h`}</Text>,
  },
  {
    key: "status",
    header: "状態",
    align: "center",
    render: (row) => {
      const m = STATUS_META[row.status];
      return (
        <Badge tone={m.tone} variant="outline">
          {m.label}
        </Badge>
      );
    },
  },
];

// ── The bulk-action bar (composition that REPLACES the toolbar) ────────────────

function BulkActionBar({
  count,
  total,
  pageAllSelected,
  spanAll,
  onSelectSpanAll,
  onApprove,
  onExport,
  onDelete,
  onClear,
}: {
  count: number;
  total: number;
  pageAllSelected: boolean;
  spanAll: boolean;
  onSelectSpanAll: () => void;
  onApprove: () => void;
  onExport: () => void;
  onDelete: () => void;
  onClear: () => void;
}) {
  const effective = spanAll ? total : count;
  return (
    <div
      role="region"
      aria-label="一括操作"
      className="bg-primary/5 border-primary/30 flex flex-wrap items-center gap-3 rounded-md border px-3 py-2"
    >
      {/* left: count + cross-page select-all escalation + safe batch actions */}
      <Flex direction="row" align="center" gap="sm" className="min-w-0 flex-1">
        <Text tone="primary" weight="medium" tabular className="whitespace-nowrap">
          {effective}件を選択中
        </Text>

        {/* cross-page select-all: only offered once the whole page is selected */}
        {pageAllSelected &&
          (spanAll ? (
            <Text size="xs" tone="muted">
              フィルタ条件の全{" "}
              <Text as="span" tabular>
                {total}
              </Text>{" "}
              件を選択しました
            </Text>
          ) : (
            <Button variant="link" size="sm" onClick={onSelectSpanAll}>
              全 <span className="tabular-nums">{total}</span> 件を選択
            </Button>
          ))}

        <span className="bg-border h-4 w-px" aria-hidden="true" />

        <Button variant="outline" size="sm" onClick={onApprove}>
          <CheckCheck aria-hidden="true" />
          一括承認
        </Button>
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download aria-hidden="true" />
          CSV出力
        </Button>
      </Flex>

      {/* right: ISOLATED destructive action, kept apart from the safe ones */}
      <Flex direction="row" align="center" gap="sm">
        <Button variant="destructive" size="sm" onClick={onDelete}>
          <Trash2 aria-hidden="true" />
          一括削除
        </Button>
        <span className="bg-border h-4 w-px" aria-hidden="true" />
        <Button variant="ghost" size="sm" onClick={onClear} aria-label="選択を解除">
          <X aria-hidden="true" />
          解除
        </Button>
      </Flex>
    </div>
  );
}

// ── The normal list toolbar (search + 部署 filter + density) ────────────────────

function ListToolbar({
  query,
  onQuery,
  dept,
  onDept,
}: {
  query: string;
  onQuery: (q: string) => void;
  dept: string;
  onDept: (d: string) => void;
}) {
  return (
    <DataTable.Toolbar>
      <Flex direction="row" align="center" gap="sm" wrap>
        <SearchInput
          value={query}
          onValueChange={onQuery}
          placeholder="従業員・申請番号で検索"
          className="w-56"
        />
        <Select
          value={dept}
          onValueChange={onDept}
          options={[
            { value: "all", label: "全部署" },
            ...DEPARTMENTS.map((d) => ({ value: d, label: d })),
          ]}
          aria-label="部署で絞り込み"
        />
      </Flex>
      <DataTable.DensityToggle />
    </DataTable.Toolbar>
  );
}

// ── A self-contained table card: owns its own selection + toolbar/bulk swap ─────

function BulkSwapTable({
  initialSelected,
  defaultDensity = "compact",
}: {
  initialSelected?: string[];
  defaultDensity?: "compact" | "comfortable";
}) {
  const [selected, setSelected] = React.useState<Set<string>>(() => new Set(initialSelected ?? []));
  const [spanAll, setSpanAll] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [dept, setDept] = React.useState("all");
  const [sort, setSort] = React.useState<SortStateProp | undefined>({
    key: "date",
    direction: "desc",
  });
  const [density, setDensity] = React.useState<"compact" | "comfortable">(defaultDensity);
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  const rows = React.useMemo(() => {
    let list = REQUESTS;
    if (dept !== "all") list = list.filter((r) => r.dept === dept);
    if (query.trim()) {
      const q = query.trim();
      list = list.filter((r) => r.employee.includes(q) || r.id.includes(q));
    }
    if (!sort) return list;
    const dir = sort.direction === "asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      const av = a[sort.key as keyof AttendanceRequest];
      const bv = b[sort.key as keyof AttendanceRequest];
      return (av < bv ? -1 : av > bv ? 1 : 0) * dir;
    });
  }, [dept, query, sort]);

  const pageAllSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));
  const hasSelection = selected.size > 0;

  const clearSelection = () => {
    setSelected(new Set());
    setSpanAll(false);
  };

  const onSelectChange = (next: Set<string>) => {
    setSelected(next);
    // any manual change drops out of the cross-page span-all mode
    setSpanAll(false);
  };

  const confirmCount = spanAll ? TOTAL_ACROSS_PAGES : selected.size;

  return (
    <Card>
      <CardContent flush>
        <DataTable
          data={rows}
          columns={columns}
          getRowId={(row) => row.id}
          selectable
          selected={selected}
          onSelectChange={onSelectChange}
          sort={sort}
          onSortChange={setSort}
          density={density}
          onDensityChange={setDensity}
        >
          {/* THE SWAP: bulk bar replaces the toolbar when a row is selected */}
          {hasSelection ? (
            <BulkActionBar
              count={selected.size}
              total={TOTAL_ACROSS_PAGES}
              pageAllSelected={pageAllSelected}
              spanAll={spanAll}
              onSelectSpanAll={() => {
                setSpanAll(true);
              }}
              onApprove={clearSelection}
              onExport={() => {}}
              onDelete={() => {
                setConfirmDelete(true);
              }}
              onClear={clearSelection}
            />
          ) : (
            <ListToolbar query={query} onQuery={setQuery} dept={dept} onDept={setDept} />
          )}

          <DataTable.Content />
          <DataTable.Pagination cursor="REQ-2034" hasMore onChange={() => {}} />
        </DataTable>
      </CardContent>

      <AlertDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        variant="destructive"
        title={`${confirmCount}件の申請を削除しますか`}
        description="削除した勤怠申請は元に戻せません。承認待ちの申請も対象に含まれます。"
        confirmLabel="削除する"
        cancelLabel="キャンセル"
        pending={pending}
        onConfirm={async () => {
          setPending(true);
          await new Promise((r) => setTimeout(r, 800));
          clearSelection();
          setPending(false);
        }}
      />
    </Card>
  );
}

export default function Demo() {
  return (
    <PageContainer
      title="一括操作"
      subtitle="行を選択するとツールバーが一括操作バーに切り替わります · クロスページ選択・破壊的操作の分離"
      density="compact"
    >
      <Flex direction="col" gap="lg">
        {/* 1 · At rest, NO selection — the normal toolbar (search / 部署 / density). */}
        <Flex direction="col" gap="sm">
          <Flex direction="row" align="center" gap="sm">
            <Text weight="medium">未選択 · 通常ツールバー</Text>
            <Text size="xs" tone="muted">
              検索・部署フィルタ・密度切替が表示される
            </Text>
          </Flex>
          <BulkSwapTable />
        </Flex>

        {/* 2 · Selected (page fully selected) — toolbar SWAPPED for the bulk bar,
            cross-page "全 124 件を選択" offered, 一括削除 isolated on the right. */}
        <Flex direction="col" gap="sm">
          <Flex direction="row" align="center" gap="sm">
            <Text weight="medium">選択中 · 一括操作バー</Text>
            <Text size="xs" tone="muted">
              primary-tint 背景・クロスページ選択・破壊的操作を右端に隔離
            </Text>
          </Flex>
          <BulkSwapTable initialSelected={REQUESTS.map((r) => r.id)} defaultDensity="comfortable" />
        </Flex>

        {/* 3 · Partial selection — a few rows checked, bulk bar shows the page
            count without the cross-page escalation (page not fully selected). */}
        <Flex direction="col" gap="sm">
          <Flex direction="row" align="center" gap="sm">
            <Text weight="medium">一部選択 · クロスページ選択なし</Text>
            <Text size="xs" tone="muted">
              ページ全選択でないため「全件選択」は出ない
            </Text>
          </Flex>
          <BulkSwapTable initialSelected={["REQ-2041", "REQ-2037"]} />
        </Flex>
      </Flex>
    </PageContainer>
  );
}
