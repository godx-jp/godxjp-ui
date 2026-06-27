/**
 * Showcase · table-view-tabs — 保存ビュー (V7)
 *
 * Saved-view ribbon over a 勤怠 (kintai) DataTable. Each saved view is a tab
 * with a colored signal dot + a count pill. Switching the active view swaps
 * the DataTable PRESET: it re-filters the rows AND changes which columns are
 * shown (e.g. the 「要承認」 view surfaces an 申請者/申請時刻 column the default
 * 「全件」 view hides, while 「遅刻・早退」 surfaces a 差異(分) column).
 *
 * Composition map (intent → real @godxjp/ui primitive):
 *   page chrome ............ PageContainer (title + subtitle + extra actions)
 *   saved-view ribbon ...... Tabs (controlled) + TabsList + TabsTrigger
 *                            each trigger = colored dot (Badge tone, dot) + label + count pill
 *   the grid ............... DataTable (per-view columns + filtered data)
 *   status cells ........... Badge tone (fixed signaling) / Badge status
 *   bulk + density ......... DataTable.Toolbar / BulkActions / DensityToggle
 *   pager .................. DataTable.Pagination
 *
 * DNA: compact density, tabular-nums on time/number columns, fixed color
 * signaling (success 若竹 / warning 山吹 / attention→destructive / info 群青),
 * small headings, quiet JP copy, no emoji.
 */
import * as React from "react";
import { Download, RefreshCw, Check, X } from "lucide-react";

import { Button, Text } from "@godxjp/ui/general";
import { Badge, Card, CardContent, DataTable, type ColumnDef } from "@godxjp/ui/data-display";
import { Tabs, TabsList, TabsTrigger } from "@godxjp/ui/navigation";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import type { SortStateProp } from "@godxjp/ui/props";

// ── Domain model ──────────────────────────────────────────────────────────────

type AttendanceStatus = "approved" | "pending" | "late" | "early" | "absent";

type Attendance = {
  id: string;
  date: string; // MM/DD (火)
  employee: string;
  dept: string;
  clockIn: string; // HH:mm or "—"
  clockOut: string; // HH:mm or "—"
  workMin: number; // 実働(分)
  status: AttendanceStatus;
  applicant: string; // 申請者 (承認待ちのみ)
  appliedAt: string; // 申請時刻
  varianceMin: number; // 遅刻/早退の差異(分) — 遅刻=+, 早退=-
};

// 状態 → Badge tone (fixed-mapping, never remap).
const STATUS_LABEL: Record<AttendanceStatus, string> = {
  approved: "承認済",
  pending: "承認待ち",
  late: "遅刻",
  early: "早退",
  absent: "欠勤",
};

const STATUS_TONE: Record<AttendanceStatus, "success" | "warning" | "destructive" | "info"> = {
  approved: "success", // 若竹
  pending: "warning", // 山吹
  late: "destructive", // 朱(注意) — 非破壊だが要対応
  early: "info", // 群青
  absent: "destructive", // 茜
};

// ── Mock 勤怠 data (Saitama 倉庫部 / 配送部 / 事務部) ─────────────────────────────

const RECORDS: Attendance[] = [
  {
    id: "ATT-0512",
    date: "06/03 (火)",
    employee: "佐藤 真琴",
    dept: "倉庫部",
    clockIn: "08:58",
    clockOut: "18:02",
    workMin: 484,
    status: "approved",
    applicant: "—",
    appliedAt: "—",
    varianceMin: 0,
  },
  {
    id: "ATT-0511",
    date: "06/03 (火)",
    employee: "鈴木 大輔",
    dept: "配送部",
    clockIn: "09:14",
    clockOut: "18:05",
    workMin: 471,
    status: "late",
    applicant: "—",
    appliedAt: "—",
    varianceMin: 14,
  },
  {
    id: "ATT-0510",
    date: "06/03 (火)",
    employee: "高橋 恵",
    dept: "事務部",
    clockIn: "09:00",
    clockOut: "16:40",
    workMin: 400,
    status: "early",
    applicant: "—",
    appliedAt: "—",
    varianceMin: -80,
  },
  {
    id: "ATT-0509",
    date: "06/03 (火)",
    employee: "田中 涼介",
    dept: "倉庫部",
    clockIn: "08:55",
    clockOut: "—",
    workMin: 0,
    status: "pending",
    applicant: "田中 涼介",
    appliedAt: "06/03 18:21",
    varianceMin: 0,
  },
  {
    id: "ATT-0508",
    date: "06/03 (火)",
    employee: "伊藤 美咲",
    dept: "配送部",
    clockIn: "—",
    clockOut: "—",
    workMin: 0,
    status: "absent",
    applicant: "—",
    appliedAt: "—",
    varianceMin: 0,
  },
  {
    id: "ATT-0507",
    date: "06/02 (月)",
    employee: "渡辺 健",
    dept: "事務部",
    clockIn: "09:02",
    clockOut: "18:00",
    workMin: 478,
    status: "pending",
    applicant: "渡辺 健",
    appliedAt: "06/02 18:33",
    varianceMin: 0,
  },
  {
    id: "ATT-0506",
    date: "06/02 (月)",
    employee: "山本 千尋",
    dept: "倉庫部",
    clockIn: "09:21",
    clockOut: "18:10",
    workMin: 469,
    status: "late",
    applicant: "—",
    appliedAt: "—",
    varianceMin: 21,
  },
  {
    id: "ATT-0505",
    date: "06/02 (月)",
    employee: "中村 蓮",
    dept: "配送部",
    clockIn: "08:50",
    clockOut: "17:20",
    workMin: 450,
    status: "early",
    applicant: "—",
    appliedAt: "—",
    varianceMin: -40,
  },
  {
    id: "ATT-0504",
    date: "06/02 (月)",
    employee: "小林 葵",
    dept: "事務部",
    clockIn: "08:57",
    clockOut: "18:01",
    workMin: 484,
    status: "approved",
    applicant: "—",
    appliedAt: "—",
    varianceMin: 0,
  },
  {
    id: "ATT-0503",
    date: "06/02 (月)",
    employee: "加藤 直樹",
    dept: "倉庫部",
    clockIn: "09:05",
    clockOut: "—",
    workMin: 0,
    status: "pending",
    applicant: "加藤 直樹",
    appliedAt: "06/02 19:02",
    varianceMin: 0,
  },
];

// 実働(分) → 8:04 形式
const hm = (min: number) => {
  if (min <= 0) return "—";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}:${String(m).padStart(2, "0")}`;
};

// ── Reusable column fragments ───────────────────────────────────────────────────

const statusCell: ColumnDef<Attendance> = {
  key: "status",
  header: "状態",
  align: "center",
  render: (row) => (
    <Badge tone={STATUS_TONE[row.status]} variant="outline">
      {STATUS_LABEL[row.status]}
    </Badge>
  ),
};

const employeeCol: ColumnDef<Attendance> = {
  key: "employee",
  header: "従業員",
  sortable: true,
  render: (row) => (
    <Flex direction="col" gap="xs">
      <Text size="sm" weight="medium">
        {row.employee}
      </Text>
      <Text size="2xs" tone="muted">
        {row.dept}
      </Text>
    </Flex>
  ),
};

const dateCol: ColumnDef<Attendance> = {
  key: "date",
  header: "日付",
  width: "w-28",
  sortable: true,
  render: (row) => <Text tabular>{row.date}</Text>,
};

const idCol: ColumnDef<Attendance> = {
  key: "id",
  header: "勤怠ID",
  width: "w-28",
  hiddenOnMobile: true,
  render: (row) => (
    <Text size="xs" mono tabular>
      {row.id}
    </Text>
  ),
};

const clockCols: ColumnDef<Attendance>[] = [
  {
    key: "clockIn",
    header: "出勤",
    align: "right",
    render: (row) => <Text tabular>{row.clockIn}</Text>,
  },
  {
    key: "clockOut",
    header: "退勤",
    align: "right",
    render: (row) => <Text tabular>{row.clockOut}</Text>,
  },
  {
    key: "workMin",
    header: "実働",
    align: "right",
    hiddenOnMobile: true,
    render: (row) => <Text tabular>{hm(row.workMin)}</Text>,
  },
];

const varianceCol: ColumnDef<Attendance> = {
  key: "varianceMin",
  header: "差異(分)",
  align: "right",
  sortable: true,
  render: (row) => (
    <Text
      tone={row.varianceMin > 0 ? "destructive" : row.varianceMin < 0 ? "info" : "muted"}
      tabular
    >
      {row.varianceMin > 0 ? `+${row.varianceMin}` : row.varianceMin || "—"}
    </Text>
  ),
};

const applicantCols: ColumnDef<Attendance>[] = [
  { key: "applicant", header: "申請者", render: (row) => row.applicant },
  {
    key: "appliedAt",
    header: "申請時刻",
    align: "right",
    hiddenOnMobile: true,
    render: (row) => <Text tabular>{row.appliedAt}</Text>,
  },
];

// ── Saved-view presets (the core of this showcase) ─────────────────────────────
// Each view = { filter, columns }. Switching the tab swaps BOTH.

type ViewId = "all" | "pending" | "late" | "absent" | "approved";

type SavedView = {
  id: ViewId;
  label: string;
  /** signal dot tone — colored Badge dot in the ribbon */
  dot: "success" | "warning" | "destructive" | "info" | "neutral";
  filter: (r: Attendance) => boolean;
  columns: ColumnDef<Attendance>[];
};

const VIEWS: SavedView[] = [
  {
    id: "all",
    label: "全件",
    dot: "neutral",
    filter: () => true,
    columns: [dateCol, employeeCol, ...clockCols, statusCell, idCol],
  },
  {
    id: "pending",
    label: "要承認",
    dot: "warning",
    filter: (r) => r.status === "pending",
    // surfaces 申請者 / 申請時刻 — hides 実働/退勤 noise
    columns: [dateCol, employeeCol, ...applicantCols, statusCell],
  },
  {
    id: "late",
    label: "遅刻・早退",
    dot: "destructive",
    filter: (r) => r.status === "late" || r.status === "early",
    // surfaces 差異(分)
    columns: [dateCol, employeeCol, clockCols[0], clockCols[1], varianceCol, statusCell],
  },
  {
    id: "absent",
    label: "欠勤",
    dot: "info",
    filter: (r) => r.status === "absent",
    columns: [dateCol, employeeCol, statusCell, idCol],
  },
  {
    id: "approved",
    label: "承認済",
    dot: "success",
    filter: (r) => r.status === "approved",
    columns: [dateCol, employeeCol, ...clockCols, statusCell],
  },
];

// dot tone → token class (fixed signaling; no hex)
const DOT_CLASS: Record<SavedView["dot"], string> = {
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
  info: "bg-info",
  neutral: "bg-muted-foreground",
};

function ViewTrigger({ view, count }: { view: SavedView; count: number }) {
  return (
    <span className="flex items-center gap-2">
      <span aria-hidden="true" className={`size-2 rounded-full ${DOT_CLASS[view.dot]}`} />
      <span>{view.label}</span>
      <Text
        as="span"
        size="2xs"
        weight="medium"
        tone="muted"
        tabular
        className="bg-muted inline-flex min-w-5 items-center justify-center rounded-full px-1.5"
      >
        {count}
      </Text>
    </span>
  );
}

export default function Demo() {
  const [view, setView] = React.useState<ViewId>("pending");
  const [selected, setSelected] = React.useState<Set<string>>(new Set(["ATT-0509"]));
  const [sort, setSort] = React.useState<SortStateProp | undefined>({
    key: "date",
    direction: "desc",
  });

  const active = VIEWS.find((v) => v.id === view) ?? VIEWS[0];

  // Per-view counts for the ribbon pills.
  const counts = React.useMemo(() => {
    const map = {} as Record<ViewId, number>;
    for (const v of VIEWS) map[v.id] = RECORDS.filter(v.filter).length;
    return map;
  }, []);

  // Apply the active view's filter, then the (shared) sort.
  const rows = React.useMemo(() => {
    const filtered = RECORDS.filter(active.filter);
    if (!sort) return filtered;
    const dir = sort.direction === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const av = a[sort.key as keyof Attendance] as string | number;
      const bv = b[sort.key as keyof Attendance] as string | number;
      return (av < bv ? -1 : av > bv ? 1 : 0) * dir;
    });
  }, [active, sort]);

  return (
    <PageContainer
      title="勤怠一覧"
      subtitle="埼玉センター · 倉庫部 / 配送部 / 事務部 · 2026年6月"
      density="compact"
      extra={
        <Flex direction="row" gap="sm">
          <Button variant="outline" size="sm">
            <RefreshCw aria-hidden="true" />
            更新
          </Button>
          <Button variant="outline" size="sm">
            <Download aria-hidden="true" />
            CSV出力
          </Button>
        </Flex>
      }
    >
      <Flex direction="col" gap="md">
        {/* Saved-view ribbon — controlled Tabs; switching swaps the preset below. */}
        <Tabs value={view} onValueChange={(v) => setView(v as ViewId)}>
          <TabsList variant="line" className="h-auto flex-wrap gap-1 border-b">
            {VIEWS.map((v) => (
              <TabsTrigger
                key={v.id}
                value={v.id}
                className="data-[state=active]:border-primary rounded-none border-b-2 border-transparent bg-transparent px-3 py-2 shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                <ViewTrigger view={v} count={counts[v.id]} />
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* The grid — columns + data both come from the active saved view. */}
        <Card>
          <CardContent flush>
            <DataTable
              data={rows}
              columns={active.columns}
              getRowId={(row) => row.id}
              selectable
              selected={selected}
              onSelectChange={setSelected}
              onRowClick={() => {}}
              sort={sort}
              onSortChange={setSort}
              empty={<Text tone="muted">このビューに該当する勤怠はありません</Text>}
            >
              <DataTable.Toolbar>
                <DataTable.BulkActions>
                  <Button size="sm" variant="outline">
                    <X aria-hidden="true" />
                    差戻し
                  </Button>
                  <Button size="sm">
                    <Check aria-hidden="true" />
                    一括承認
                  </Button>
                </DataTable.BulkActions>
                <DataTable.DensityToggle />
              </DataTable.Toolbar>
              <DataTable.Content />
              <DataTable.Pagination cursor="ATT-0503" hasMore onChange={() => {}} />
            </DataTable>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
