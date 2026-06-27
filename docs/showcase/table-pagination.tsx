/**
 * Showcase · table-pagination — ページネーション (V14)
 *
 * Three pagination modes for a 勤怠 (kintai) DataTable, shown side by side so a
 * consumer can pick the right one for their dataset shape:
 *
 *   1. 番号付き + 件数選択 … numbered pages + page-size Select
 *      → real <Pagination showSizeChanger showTotal> (navigation primitive,
 *        which embeds the page-size Select itself). DataTable slices the page.
 *   2. もっと読む … "load more" / infinite-style append button
 *      → real <Button> that grows the visible window; quiet remaining-count copy.
 *   3. カーソル / 期間ジャンプ … cursor first/next + period jump
 *      → real <DataTable.Pagination> (cursor first/next) paired with a period
 *        <Select> to jump between months — for time-series 勤怠 logs where
 *        offset paging is meaningless.
 *
 * Each card is an INDEPENDENT pattern: its own state setters, its own data.
 *
 * Built ENTIRELY from real @godxjp/ui primitives. NO hand-rolled <table>, NO
 * raw HTML controls. dxs-kintai DNA: compact density, tabular-nums on numeric
 * columns, fixed color signaling via Badge status/tone, small headings, quiet
 * JP copy, no emoji.
 */
import * as React from "react";

import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DataTable,
  type ColumnDef,
} from "@godxjp/ui/data-display";
import { Button, Text } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import { Pagination } from "@godxjp/ui/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@godxjp/ui/data-entry";
import { ChevronDown } from "lucide-react";

// ── Domain: a 勤怠 (attendance) record ────────────────────────────────────────

type AttendanceStatus = "active" | "pending" | "failed" | "scheduled";

type Attendance = {
  id: string;
  date: string; // 勤務日
  employee: string; // 従業員
  dept: string; // 部署
  clockIn: string; // 出勤
  clockOut: string; // 退勤
  overtime: number; // 残業 (分)
  /** active=承認済 / pending=承認待ち / failed=打刻漏れ / scheduled=シフト予定 */
  status: AttendanceStatus;
};

const STATUS_LABEL: Record<AttendanceStatus, string> = {
  active: "承認済",
  pending: "承認待ち",
  failed: "打刻漏れ",
  scheduled: "シフト予定",
};

const DEPTS = ["営業部", "開発部", "総務部", "物流部"] as const;
const NAMES = [
  "山田 太郎",
  "佐藤 花子",
  "鈴木 一郎",
  "高橋 美咲",
  "田中 健",
  "伊藤 さくら",
  "渡辺 大輔",
  "中村 由美",
];

// Deterministic, realistic-looking 勤怠 rows (no Math.random — stable at rest).
function makeRows(count: number, prefix = "ATT"): Attendance[] {
  const statuses: AttendanceStatus[] = ["active", "active", "pending", "failed", "scheduled"];
  return Array.from({ length: count }, (_, i) => {
    const ot = [0, 15, 30, 45, 60, 90, 120][i % 7];
    const startHour = 9 + (i % 2);
    return {
      id: `${prefix}-${String(1000 + i)}`,
      date: `2026-06-${String((i % 28) + 1).padStart(2, "0")}`,
      employee: NAMES[i % NAMES.length],
      dept: DEPTS[i % DEPTS.length],
      clockIn: `0${startHour}:${["02", "58", "31", "07"][i % 4]}`,
      clockOut: ot ? `${18 + Math.floor(ot / 60)}:${String(ot % 60).padStart(2, "0")}` : "18:00",
      overtime: ot,
      status: statuses[i % statuses.length],
    };
  });
}

const minutesFmt = (m: number) => (m === 0 ? "—" : `${m}分`);

// Columns are shared between the cards (pure data — no per-card state inside).
const columns: ColumnDef<Attendance>[] = [
  { key: "date", header: "勤務日", width: "w-28" },
  { key: "employee", header: "従業員" },
  { key: "dept", header: "部署", hiddenOnMobile: true },
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
    key: "overtime",
    header: "残業",
    align: "right",
    hiddenOnMobile: true,
    render: (row) => <Text tabular>{minutesFmt(row.overtime)}</Text>,
  },
  {
    key: "status",
    header: "状態",
    align: "center",
    render: (row) => <Badge status={row.status}>{STATUS_LABEL[row.status]}</Badge>,
  },
];

// ── Mode 1: numbered pages + page-size Select ─────────────────────────────────

const NUMBERED_DATA = makeRows(83, "OFS");

function NumberedPaginationCard() {
  const [page, setPage] = React.useState(2); // start mid-set so prev/next are both live
  const [pageSize, setPageSize] = React.useState(10);

  const start = (page - 1) * pageSize;
  const rows = NUMBERED_DATA.slice(start, start + pageSize);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>番号付き + 件数選択</CardTitle>
        <Text size="xs" tone="muted" tabular>
          全 {NUMBERED_DATA.length} 件
        </Text>
      </CardHeader>
      <CardContent flush>
        <DataTable data={rows} columns={columns} getRowId={(row) => row.id} density="compact" />
      </CardContent>
      <CardContent className="border-t">
        <Pagination
          value={page}
          total={NUMBERED_DATA.length}
          pageSize={pageSize}
          pageSizeOptions={[10, 20, 50]}
          showSizeChanger
          showTotal={(total, [from, to]) => `${from}–${to} / ${total} 件`}
          onValueChange={(nextPage, nextSize) => {
            setPage(nextPage);
            setPageSize(nextSize);
          }}
        />
      </CardContent>
    </Card>
  );
}

// ── Mode 2: load-more button ─────────────────────────────────────────────────

const LOADMORE_DATA = makeRows(42, "LDM");
const LOADMORE_STEP = 8;

function LoadMoreCard() {
  // Mid-load state at rest: some rows already revealed, more remaining.
  const [visible, setVisible] = React.useState(LOADMORE_STEP * 2);
  const [loading, setLoading] = React.useState(false);

  const rows = LOADMORE_DATA.slice(0, visible);
  const remaining = LOADMORE_DATA.length - visible;
  const done = remaining <= 0;

  const loadMore = () => {
    if (done || loading) return;
    setLoading(true);
    // Simulate a fetch so the disabled-while-pending state is observable.
    window.setTimeout(() => {
      setVisible((v) => Math.min(v + LOADMORE_STEP, LOADMORE_DATA.length));
      setLoading(false);
    }, 900);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>もっと読む</CardTitle>
        <Text size="xs" tone="muted" tabular>
          {rows.length} / {LOADMORE_DATA.length} 件表示
        </Text>
      </CardHeader>
      <CardContent flush>
        <DataTable data={rows} columns={columns} getRowId={(row) => row.id} density="compact" />
      </CardContent>
      <CardContent className="border-t">
        <Flex direction="col" align="center" gap="xs">
          <Button
            variant="outline"
            size="sm"
            onClick={loadMore}
            disabled={done}
            loading={loading}
            loadingText="読み込み中…"
          >
            {!done && <ChevronDown aria-hidden="true" />}
            {done
              ? "すべて表示しました"
              : `さらに ${Math.min(LOADMORE_STEP, remaining)} 件を読み込む`}
          </Button>
          {!done && (
            <Text size="xs" tone="muted" tabular>
              残り {remaining} 件
            </Text>
          )}
        </Flex>
      </CardContent>
    </Card>
  );
}

// ── Mode 3: cursor first/next + period jump ──────────────────────────────────

// Time-series 勤怠 logs grouped by month — offset paging is meaningless here,
// so we use cursor first/next (DataTable.Pagination) + a period Select to jump.
const PERIODS = [
  { value: "2026-06", label: "2026年 6月" },
  { value: "2026-05", label: "2026年 5月" },
  { value: "2026-04", label: "2026年 4月" },
] as const;

const PERIOD_DATA: Record<string, Attendance[]> = {
  "2026-06": makeRows(7, "CUR-06"),
  "2026-05": makeRows(7, "CUR-05"),
  "2026-04": makeRows(5, "CUR-04"),
};

function CursorPeriodCard() {
  const [period, setPeriod] = React.useState<string>("2026-06");
  // cursor === id of the last row of the previous page; undefined = first page.
  const [cursor, setCursor] = React.useState<string | undefined>(undefined);

  const all = PERIOD_DATA[period] ?? [];
  const PAGE = 4;
  const startIndex = cursor ? all.findIndex((r) => r.id === cursor) + 1 : 0;
  const rows = all.slice(startIndex, startIndex + PAGE);
  const lastVisibleId = rows.at(-1)?.id;
  const hasMore = startIndex + PAGE < all.length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle>カーソル / 期間ジャンプ</CardTitle>
        <Select
          value={period}
          onValueChange={(v: string) => {
            setPeriod(v);
            setCursor(undefined); // jumping period resets the cursor to the first page
          }}
        >
          <SelectTrigger size="sm" aria-label="期間を選択" className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PERIODS.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent flush>
        <DataTable data={rows} columns={columns} getRowId={(row) => row.id} density="compact" />
      </CardContent>
      <CardContent className="border-t">
        <Flex direction="row" align="center" justify="between" wrap gap="sm">
          <Text size="xs" tone="muted" tabular>
            {PERIODS.find((p) => p.value === period)?.label} · {all.length} 件
          </Text>
          <DataTable.Pagination
            cursor={lastVisibleId}
            hasMore={hasMore}
            onChange={(next) => setCursor(next)}
          />
        </Flex>
      </CardContent>
    </Card>
  );
}

export default function Demo() {
  return (
    <PageContainer
      title="ページネーション"
      subtitle="番号付き + 件数選択 · もっと読む · カーソル / 期間ジャンプ。用途に応じて使い分ける 3 つの方式"
      density="compact"
    >
      <Flex direction="col" gap="lg">
        <NumberedPaginationCard />
        <LoadMoreCard />
        <CursorPeriodCard />
      </Flex>
    </PageContainer>
  );
}
