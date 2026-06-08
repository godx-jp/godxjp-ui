/**
 * Showcase · table-crud-list — CRUD一覧 (V1)
 *
 * The canonical kintai 勤怠 admin 一覧 (list page), assembled entirely from real
 * @godxjp/ui primitives. This is the pattern a consumer should copy when building
 * an admin list screen:
 *
 *   header toolbar ......... PageContainer (title + `extra`) → SearchInput + primary Button
 *   filter row ............. Card + Flex + Select (部署 / 状態 / 期間) + ghost "クリア"
 *   data grid .............. DataTable (sortable columns · row selection · bulk actions ·
 *                            density toggle · row kebab via DropdownMenu)
 *   footer totals .......... CardFooter — selected count + 出勤/遅刻/承認待ち tallies (tabular-nums)
 *   pagination ............. Pagination (numbered · showTotal · showSizeChanger)
 *
 * All behaviour is real and client-driven so it is observable AT REST:
 *   - sort seeded on 勤務時間 desc (header arrow visible without clicking)
 *   - two rows pre-selected (bulk-action bar + footer tally visible without clicking)
 *   - page 2 of 4 seeded so the numbered pagination shows an active middle page
 *
 * DNA: compact density, small headings, tabular-nums on numeric/time columns, fixed
 * color signaling (success 若竹 出勤 · warning 山吹 遅刻/早退 · info 群青 シフト · danger 茜
 * 欠勤 · neutral 未提出), quiet factual JP copy, no emoji.
 */
import * as React from "react";
import { Download, Plus, Check, X } from "lucide-react";

import { Button, Text } from "@godxjp/ui/general";
import {
  Badge,
  Card,
  CardContent,
  CardFooter,
  DataTable,
  type ColumnDef,
} from "@godxjp/ui/data-display";
import { SearchInput, Select } from "@godxjp/ui/data-entry";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Pagination,
} from "@godxjp/ui/navigation";
import type { SortStateProp, TableDensityProp } from "@godxjp/ui/props";
import { MoreHorizontal, Pencil, CheckCircle2, Trash2 } from "lucide-react";

// ── Domain ────────────────────────────────────────────────────────────────────

/** 勤怠ステータス → Badge `status` keys are mapped to fixed tones by the library:
 *  active→success / pending→warning / failed→destructive / scheduled→info / draft→neutral.
 *  We label them in JP via the column renderer. */
type Status = "active" | "pending" | "scheduled" | "failed" | "draft";

const STATUS_LABEL: Record<Status, string> = {
  active: "出勤",
  pending: "遅刻",
  scheduled: "シフト",
  failed: "欠勤",
  draft: "未提出",
};

type Attendance = {
  id: string;
  code: string;
  name: string;
  dept: string;
  date: string;
  clockIn: string;
  clockOut: string;
  /** 勤務時間 (minutes) — numeric sort key. */
  worked: number;
  /** 残業 (minutes). */
  overtime: number;
  status: Status;
  approved: boolean;
};

const DEPTS = ["全部署", "営業部", "開発部", "管理部", "物流部"] as const;

const ROWS: Attendance[] = [
  {
    id: "ATT-2041",
    code: "E-0162",
    name: "佐藤 健",
    dept: "開発部",
    date: "06/03",
    clockIn: "09:01",
    clockOut: "19:48",
    worked: 587,
    overtime: 108,
    status: "active",
    approved: false,
  },
  {
    id: "ATT-2040",
    code: "E-0148",
    name: "鈴木 美咲",
    dept: "営業部",
    date: "06/03",
    clockIn: "09:32",
    clockOut: "18:05",
    worked: 453,
    overtime: 0,
    status: "pending",
    approved: false,
  },
  {
    id: "ATT-2039",
    code: "E-0203",
    name: "高橋 大輔",
    dept: "物流部",
    date: "06/03",
    clockIn: "08:55",
    clockOut: "18:00",
    worked: 485,
    overtime: 25,
    status: "active",
    approved: true,
  },
  {
    id: "ATT-2038",
    code: "E-0119",
    name: "田中 由紀",
    dept: "管理部",
    date: "06/03",
    clockIn: "—",
    clockOut: "—",
    worked: 0,
    overtime: 0,
    status: "failed",
    approved: false,
  },
  {
    id: "ATT-2037",
    code: "E-0177",
    name: "伊藤 翔太",
    dept: "開発部",
    date: "06/03",
    clockIn: "10:02",
    clockOut: "—",
    worked: 0,
    overtime: 0,
    status: "scheduled",
    approved: false,
  },
  {
    id: "ATT-2036",
    code: "E-0091",
    name: "渡辺 彩",
    dept: "営業部",
    date: "06/03",
    clockIn: "08:58",
    clockOut: "17:30",
    worked: 452,
    overtime: 0,
    status: "active",
    approved: true,
  },
  {
    id: "ATT-2035",
    code: "E-0210",
    name: "山本 拓海",
    dept: "物流部",
    date: "06/03",
    clockIn: "—",
    clockOut: "—",
    worked: 0,
    overtime: 0,
    status: "draft",
    approved: false,
  },
  {
    id: "ATT-2034",
    code: "E-0134",
    name: "中村 真央",
    dept: "開発部",
    date: "06/03",
    clockIn: "09:00",
    clockOut: "20:15",
    worked: 615,
    overtime: 135,
    status: "active",
    approved: false,
  },
];

// ── Formatting helpers ──────────────────────────────────────────────────────────

/** minutes → H:MM (e.g. 587 → "9:47"). 0 renders as a quiet dash. */
function fmtDuration(min: number): string {
  if (min <= 0) return "—";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}:${String(m).padStart(2, "0")}`;
}

const DEPT_OPTIONS = DEPTS.map((d) => ({ value: d, label: d }));
const STATUS_OPTIONS = [
  { value: "all", label: "すべての状態" },
  { value: "active", label: STATUS_LABEL.active },
  { value: "pending", label: STATUS_LABEL.pending },
  { value: "scheduled", label: STATUS_LABEL.scheduled },
  { value: "failed", label: STATUS_LABEL.failed },
  { value: "draft", label: STATUS_LABEL.draft },
];
const PERIOD_OPTIONS = [
  { value: "today", label: "本日" },
  { value: "week", label: "今週" },
  { value: "month", label: "今月" },
];

// ── Columns ──────────────────────────────────────────────────────────────────────

const columns: ColumnDef<Attendance>[] = [
  {
    key: "code",
    header: "社員番号",
    width: "w-28",
    render: (r) => (
      <Text size="xs" mono tabular>
        {r.code}
      </Text>
    ),
  },
  { key: "name", header: "従業員", sortable: true },
  { key: "dept", header: "部署", hiddenOnMobile: true },
  {
    key: "date",
    header: "日付",
    align: "center",
    width: "w-16",
    hiddenOnMobile: true,
    render: (r) => <Text tabular>{r.date}</Text>,
  },
  {
    key: "clockIn",
    header: "出勤",
    align: "center",
    width: "w-16",
    render: (r) => <Text tabular>{r.clockIn}</Text>,
  },
  {
    key: "clockOut",
    header: "退勤",
    align: "center",
    width: "w-16",
    render: (r) => <Text tabular>{r.clockOut}</Text>,
  },
  {
    key: "worked",
    header: "勤務",
    align: "right",
    width: "w-16",
    sortable: true,
    render: (r) => <Text tabular>{fmtDuration(r.worked)}</Text>,
  },
  {
    key: "overtime",
    header: "残業",
    align: "right",
    width: "w-16",
    sortable: true,
    hiddenOnMobile: true,
    render: (r) => (
      <Text tone="muted" tabular>
        {fmtDuration(r.overtime)}
      </Text>
    ),
  },
  {
    key: "status",
    header: "状態",
    align: "center",
    render: (r) => (
      <Badge status={r.status} variant="outline">
        {STATUS_LABEL[r.status]}
      </Badge>
    ),
  },
  {
    key: "approved",
    header: "承認",
    align: "center",
    width: "w-20",
    render: (r) =>
      r.approved ? (
        <Badge tone="success" variant="outline">
          承認済
        </Badge>
      ) : (
        <Badge tone="muted" variant="outline">
          承認待ち
        </Badge>
      ),
  },
  {
    key: "_actions",
    header: "",
    align: "right",
    width: "w-12",
    render: (r) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={`${r.name} の操作`}>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <Pencil />
            編集
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CheckCircle2 />
            承認
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">
            <Trash2 />
            削除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 8;
const TOTAL = 31; // 4 pages worth — seeds a realistic numbered pagination.

export default function Demo() {
  const [query, setQuery] = React.useState("");
  const [dept, setDept] = React.useState<string>("全部署");
  const [status, setStatus] = React.useState<string>("all");
  const [period, setPeriod] = React.useState<string>("today");

  // Seed sort, selection, density and page so every behaviour is visible at rest.
  const [sort, setSort] = React.useState<SortStateProp | undefined>({
    key: "worked",
    direction: "desc",
  });
  const [selected, setSelected] = React.useState<Set<string>>(new Set(["ATT-2041", "ATT-2034"]));
  const [density, setDensity] = React.useState<TableDensityProp>("compact");
  const [page, setPage] = React.useState(2);
  const [pageSize, setPageSize] = React.useState(PAGE_SIZE);

  const hasActiveFilters =
    query !== "" || dept !== "全部署" || status !== "all" || period !== "today";

  const clearFilters = () => {
    setQuery("");
    setDept("全部署");
    setStatus("all");
    setPeriod("today");
  };

  // Client-side filter + sort so the demo is fully interactive without a backend.
  const rows = React.useMemo(() => {
    let out = ROWS.filter((r) => {
      if (dept !== "全部署" && r.dept !== dept) return false;
      if (status !== "all" && r.status !== status) return false;
      if (query) {
        const q = query.toLowerCase();
        if (!r.name.toLowerCase().includes(q) && !r.code.toLowerCase().includes(q)) return false;
      }
      return true;
    });
    if (sort) {
      const dir = sort.direction === "asc" ? 1 : -1;
      out = [...out].sort((a, b) => {
        const av = a[sort.key as keyof Attendance];
        const bv = b[sort.key as keyof Attendance];
        return (av < bv ? -1 : av > bv ? 1 : 0) * dir;
      });
    }
    return out;
  }, [dept, status, query, sort]);

  // Footer tallies over the current (filtered) page.
  const tally = React.useMemo(
    () => ({
      present: rows.filter((r) => r.status === "active").length,
      late: rows.filter((r) => r.status === "pending").length,
      pendingApproval: rows.filter(
        (r) => !r.approved && r.status !== "draft" && r.status !== "failed",
      ).length,
    }),
    [rows],
  );

  return (
    <PageContainer
      title="勤怠一覧"
      subtitle="本日 · 2026/06/03 · 開発拠点 さいたま"
      density="compact"
      extra={
        <Flex direction="row" gap="sm" align="center" wrap>
          <SearchInput
            value={query}
            onValueChange={setQuery}
            onSearch={() => setPage(1)}
            placeholder="従業員名・社員番号で検索"
            ariaLabel="勤怠を検索"
            className="w-full sm:w-64"
          />
          <Button variant="outline" size="sm">
            <Download aria-hidden="true" />
            CSV出力
          </Button>
          <Button size="sm">
            <Plus aria-hidden="true" />
            新規登録
          </Button>
        </Flex>
      }
    >
      <Flex direction="col" gap="md">
        {/* Filter row — real Select primitives, data-driven API. */}
        <Card>
          <CardContent>
            <Flex direction="row" gap="sm" align="center" wrap>
              <Select
                options={DEPT_OPTIONS}
                value={dept}
                onValueChange={(v) => {
                  setDept(v);
                  setPage(1);
                }}
                placeholder="部署"
                className="w-full sm:w-40"
              />
              <Select
                options={STATUS_OPTIONS}
                value={status}
                onValueChange={(v) => {
                  setStatus(v);
                  setPage(1);
                }}
                placeholder="状態"
                className="w-full sm:w-40"
              />
              <Select
                options={PERIOD_OPTIONS}
                value={period}
                onValueChange={setPeriod}
                placeholder="期間"
                className="w-full sm:w-32"
              />
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X aria-hidden="true" />
                  条件をクリア
                </Button>
              )}
              <Text size="xs" tone="muted" tabular className="ml-auto">
                {rows.length} 件表示
              </Text>
            </Flex>
          </CardContent>
        </Card>

        {/* Data grid + footer totals, wrapped so footer reads as one surface. */}
        <Card>
          <CardContent flush>
            <DataTable
              data={rows}
              columns={columns}
              getRowId={(row) => row.id}
              selectable
              selected={selected}
              onSelectChange={setSelected}
              density={density}
              onDensityChange={setDensity}
              sort={sort}
              onSortChange={setSort}
              empty={<Text tone="muted">条件に一致する勤怠はありません。</Text>}
            >
              <DataTable.Toolbar>
                <DataTable.BulkActions>
                  <Button size="sm" variant="outline">
                    <Check aria-hidden="true" />
                    一括承認
                  </Button>
                  <Button size="sm" variant="outline">
                    リマインド送信
                  </Button>
                </DataTable.BulkActions>
                <DataTable.DensityToggle />
              </DataTable.Toolbar>
              <DataTable.Content />
            </DataTable>
          </CardContent>

          {/* Footer totals — composed from CardFooter + Badge, not a hand-rolled bar. */}
          <CardFooter className="flex-wrap justify-between gap-3">
            <Flex direction="row" gap="md" align="center" wrap>
              <Text size="xs" tone="muted">
                選択中{" "}
                <Text as="strong" weight="medium" tabular>
                  {selected.size}
                </Text>{" "}
                件
              </Text>
              <Badge tone="success" variant="outline">
                出勤{" "}
                <Text as="span" tabular className="ml-1">
                  {tally.present}
                </Text>
              </Badge>
              <Badge tone="warning" variant="outline">
                遅刻{" "}
                <Text as="span" tabular className="ml-1">
                  {tally.late}
                </Text>
              </Badge>
              <Badge tone="muted" variant="outline">
                承認待ち{" "}
                <Text as="span" tabular className="ml-1">
                  {tally.pendingApproval}
                </Text>
              </Badge>
            </Flex>
            <Pagination
              value={page}
              total={TOTAL}
              pageSize={pageSize}
              showTotal
              showSizeChanger
              onValueChange={(p, s) => {
                setPage(p);
                setPageSize(s);
              }}
            />
          </CardFooter>
        </Card>
      </Flex>
    </PageContainer>
  );
}
