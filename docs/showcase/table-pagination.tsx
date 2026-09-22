/**
 * Showcase · table-pagination — ページネーション (V14)
 *
 * Three pagination modes for a 勤怠 (attendance) DataTable, shown side by side so a
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
 * raw HTML controls. reference-design DNA: compact density, tabular-nums on numeric
 * columns, fixed color signaling via Badge status/tone, small headings, quiet
 * JP copy, no emoji.
 */
import * as React from "react";

import {
  Badge,
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
  DataTable,
  type ColumnDef,
} from "@godxjp/ui/data-display";
import { Button, Text } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import { Pagination } from "@godxjp/ui/navigation";
import { useTranslation } from "@godxjp/ui/i18n";
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
      // `0${startHour}` hard-coded the leading zero and printed `010:07` at startHour 10 —
      // the hand-built formatting this repo's own rules forbid. `padStart` on the hour, the
      // same way the line above already does it for the date.
      clockIn: `${String(startHour).padStart(2, "0")}:${["02", "58", "31", "07"][i % 4]}`,
      clockOut: ot
        ? `${String(18 + Math.floor(ot / 60)).padStart(2, "0")}:${String(ot % 60).padStart(2, "0")}`
        : "18:00",
      overtime: ot,
      status: statuses[i % statuses.length],
    };
  });
}

const minutesFmt = (m: number) => (m === 0 ? "—" : `${m}分`);

// Columns are shared between the cards (pure data — no per-card state inside).
/* EVERY column declares a width, not just the first (gh#849).
 *
 * Measured at 2000px before this, as empty pixels between one cell's ink and the next's:
 *
 *   部署 → 出勤   521      残業 → 状態    57
 *   従業員 → 部署 411      勤務日 → 従業員 40
 *   退勤 → 残業   280
 *
 * A 521px hole beside a 40px seam, in one row. Only `勤務日` carried a width, so
 * `table-layout: auto` sized the rest from content and dumped ALL the slack of a 1952px card
 * into the two free-text columns — and because those are start-aligned while the measures are
 * end-aligned, the slack opened as craters BETWEEN columns rather than inside them.
 *
 * With a width on every column the engine distributes the excess proportionally instead, so the
 * gaps scale together and no single one dominates. The numbers are a ratio, not a measurement:
 * the two free-text columns get the larger share because they are the ones that actually wrap. */
const columns: ColumnDef<Attendance>[] = [
  { key: "date", header: "勤務日", width: "w-28" },
  { key: "employee", header: "従業員", width: "w-44" },
  { key: "dept", header: "部署", hiddenOnMobile: true, width: "w-36" },
  {
    key: "clockIn",
    header: "出勤",
    align: "right",
    width: "w-24",
    render: (row) => <Text tabular>{row.clockIn}</Text>,
  },
  {
    key: "clockOut",
    header: "退勤",
    align: "right",
    width: "w-24",
    render: (row) => <Text tabular>{row.clockOut}</Text>,
  },
  {
    key: "overtime",
    header: "残業",
    align: "right",
    hiddenOnMobile: true,
    width: "w-24",
    render: (row) => <Text tabular>{minutesFmt(row.overtime)}</Text>,
  },
  {
    key: "status",
    header: "状態",
    /* END, not CENTER (gh#849). The status column carries the table's right edge; centring a
     * ~90px pill in it put the badges 102px inboard while the header count, the column headers
     * and the pagination all landed on 17px. */
    align: "right",
    width: "w-32",
    render: (row) => <Badge status={row.status}>{STATUS_LABEL[row.status]}</Badge>,
  },
];

// ── Mode 1: numbered pages + page-size Select ─────────────────────────────────

const NUMBERED_DATA = makeRows(83, "OFS");

function NumberedPaginationCard() {
  const { t } = useTranslation();
  const fmt = useFormatters();
  const [page, setPage] = React.useState(2); // start mid-set so prev/next are both live
  const [pageSize, setPageSize] = React.useState(10);

  const start = (page - 1) * pageSize;
  const rows = NUMBERED_DATA.slice(start, start + pageSize);

  return (
    <Card>
      <CardHeader>
        <CardTitle level={2}>番号付き + 件数選択</CardTitle>
        <CardAction>
          <Text size="xs" tone="muted" tabular>
            {t("showcase.pagination.recordCount", { count: NUMBERED_DATA.length })}
          </Text>
        </CardAction>
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
          showTotal={(total, [from, to]) =>
            `${fmt.number(from)}–${fmt.number(to)} / ${t("showcase.pagination.recordCount", { count: total })}`
          }
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
  const { t } = useTranslation();
  const fmt = useFormatters();
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
      <CardHeader>
        <CardTitle level={2}>もっと読む</CardTitle>
        <CardAction>
          <Text size="xs" tone="muted" tabular>
            {fmt.number(rows.length)} /{" "}
            {t("showcase.pagination.recordCount", { count: LOADMORE_DATA.length })}
          </Text>
        </CardAction>
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
              : t("showcase.pagination.loadMore", {
                  count: Math.min(LOADMORE_STEP, remaining),
                })}
          </Button>
          {!done && (
            <Text size="xs" tone="muted" tabular>
              {t("showcase.pagination.recordCount", { count: remaining })}
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
/* The VALUE is data; the LABEL is a formatting decision and belongs to the active locale.
 * Hard-coded "2026年 6月" rendered beside the library's own "Đầu" / "Tiếp" — two languages in one
 * row, which is what the owner photographed. `Intl.DateTimeFormat` gives 「2026年6月」, "June 2026"
 * and "tháng 6 năm 2026" from the same value. */
const PERIODS = [{ value: "2026-06" }, { value: "2026-05" }, { value: "2026-04" }] as const;

const PERIOD_DATA: Record<string, Attendance[]> = {
  "2026-06": makeRows(7, "CUR-06"),
  "2026-05": makeRows(7, "CUR-05"),
  "2026-04": makeRows(5, "CUR-04"),
};

function CursorPeriodCard() {
  const { t } = useTranslation();
  const fmt = useFormatters();
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
      <CardHeader>
        <CardTitle level={2}>カーソル / 期間ジャンプ</CardTitle>
        <CardAction>
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
                  {fmt.month(p.value)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent flush>
        <DataTable data={rows} columns={columns} getRowId={(row) => row.id} density="compact" />
      </CardContent>
      {/* `DataTable.Pagination` owns its own inline inset, because it is normally the lone child
       * of a FLUSH container. Here it shares a padded `CardContent` with the period label, so the
       * two insets stack — measured 28px against the columns' 16px before this. Zeroing the slot's
       * own knob hands the inset to the container that already supplies it; that is what
       * `--table-pagination-padding-x` is for, and an instance override is the right tier for one
       * element in one arrangement (docs/CUSTOMER-THEMING.md, tier 4). */}
      <CardContent
        className="border-t"
        style={{ "--table-pagination-padding-x": "0" } as React.CSSProperties}
      >
        <Flex direction="row" align="center" justify="between" wrap gap="sm">
          <Text size="xs" tone="muted" tabular>
            {fmt.month(period)} · {t("showcase.pagination.recordCount", { count: all.length })}
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

/* COUNTS AND MONTHS FOLLOW THE ACTIVE LOCALE, and this page used to hard-code them.
 *
 * The library's own chrome is localized — the page-size Select renders "10 / trang" under `vi` —
 * so a page that hard-codes `件` puts two languages in one row and they can never agree. That is
 * exactly what the owner photographed: "11–20 / 83 件" beside "10 / trang".
 *
 * `Intl.NumberFormat` groups the number for the locale; the unit word comes from the library's own
 * message catalogue, which already carries a CLDR plural map per language. Nothing here is a
 * hand-built string. */
const useFormatters = () => {
  const { locale } = useTranslation();
  return React.useMemo(() => {
    const number = new Intl.NumberFormat(locale);
    const month = new Intl.DateTimeFormat(locale, { year: "numeric", month: "long" });
    return {
      number: (n: number) => number.format(n),
      month: (iso: string) => month.format(new Date(`${iso}-01T00:00:00`)),
    };
  }, [locale]);
};

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
