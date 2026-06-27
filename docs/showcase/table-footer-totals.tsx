/**
 * Showcase · table-footer-totals — 合計行 (V17)
 *
 * A 勤怠 (kintai) summary table whose numeric columns roll up into a sticky
 * FOOTER totals row. The footer survives vertical scroll: the header stays
 * pinned to the top, the totals stay pinned to the bottom, and the body of
 * 部署 × 従業員 rows scrolls between them.
 *
 * GAP → composition note
 * ──────────────────────
 * `DataTable` (src/components/data-display/data-table.tsx) has NO footer slot:
 * its compound API is Toolbar / SelectAll / BulkActions / DensityToggle /
 * Content / Pagination — `DataTable.Content` renders <thead>+<tbody> only.
 * The `Table` family (src/components/data-display/table.tsx) likewise exports
 * Table / TableHeader / TableBody / TableHead / TableRow / TableCell — there is
 * NO `TableFooter` / <tfoot> primitive. A footer totals row is therefore not
 * expressible through DataTable. Per the rules I compose it from the real
 * Table primitives plus a semantic <tfoot> (a real HTML table section, not a
 * hand-rolled control), and record the missing capability in gapNotes.
 *
 * DNA: compact density, small heading, tabular-nums on every numeric column,
 * fixed colour signalling (warning 山吹 = 残業 over threshold, info 群青 =
 * mid 残業, success 若竹 = on-plan, destructive 茜 = 遅刻 lateness — Badge has
 * no attention/朱 tone), quiet JP copy, no emoji.
 */
import * as React from "react";

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
import { Text } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";

// ── Data ────────────────────────────────────────────────────────────────────
// 2026年5月度 勤怠サマリ — 従業員ごとの月次集計。数値列を合計行へ畳み込む。

type Row = {
  id: string;
  name: string;
  dept: string;
  workDays: number; // 勤務日数
  overtime: number; // 残業時間 (h)
  late: number; // 遅刻回数
  paidLeave: number; // 有給取得 (日)
  pay: number; // 総支給額 (¥)
};

const ROWS: Row[] = [
  {
    id: "E-1042",
    name: "佐藤 美咲",
    dept: "営業一課",
    workDays: 20,
    overtime: 12.5,
    late: 0,
    paidLeave: 1,
    pay: 318500,
  },
  {
    id: "E-1043",
    name: "鈴木 健太",
    dept: "営業一課",
    workDays: 21,
    overtime: 28.0,
    late: 2,
    paidLeave: 0,
    pay: 352000,
  },
  {
    id: "E-1051",
    name: "高橋 直樹",
    dept: "営業二課",
    workDays: 19,
    overtime: 6.0,
    late: 0,
    paidLeave: 2,
    pay: 301200,
  },
  {
    id: "E-1058",
    name: "田中 彩花",
    dept: "営業二課",
    workDays: 20,
    overtime: 15.5,
    late: 1,
    paidLeave: 1,
    pay: 309800,
  },
  {
    id: "E-1064",
    name: "伊藤 拓海",
    dept: "開発部",
    workDays: 21,
    overtime: 31.5,
    late: 0,
    paidLeave: 0,
    pay: 388400,
  },
  {
    id: "E-1067",
    name: "渡辺 さくら",
    dept: "開発部",
    workDays: 18,
    overtime: 8.0,
    late: 3,
    paidLeave: 3,
    pay: 295600,
  },
  {
    id: "E-1071",
    name: "山本 涼介",
    dept: "開発部",
    workDays: 20,
    overtime: 22.0,
    late: 0,
    paidLeave: 1,
    pay: 364100,
  },
  {
    id: "E-1078",
    name: "中村 結衣",
    dept: "管理部",
    workDays: 21,
    overtime: 4.5,
    late: 0,
    paidLeave: 0,
    pay: 286000,
  },
  {
    id: "E-1082",
    name: "小林 大輔",
    dept: "管理部",
    workDays: 19,
    overtime: 18.0,
    late: 1,
    paidLeave: 2,
    pay: 333700,
  },
  {
    id: "E-1090",
    name: "加藤 七海",
    dept: "管理部",
    workDays: 20,
    overtime: 9.5,
    late: 0,
    paidLeave: 1,
    pay: 298400,
  },
];

// ── Aggregation (the totals row) ──────────────────────────────────────────────

const totals = ROWS.reduce(
  (acc, r) => ({
    workDays: acc.workDays + r.workDays,
    overtime: acc.overtime + r.overtime,
    late: acc.late + r.late,
    paidLeave: acc.paidLeave + r.paidLeave,
    pay: acc.pay + r.pay,
  }),
  { workDays: 0, overtime: 0, late: 0, paidLeave: 0, pay: 0 },
);

const yen = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
  maximumFractionDigits: 0,
});
const hours = new Intl.NumberFormat("ja-JP", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const count = new Intl.NumberFormat("ja-JP");

// 残業 fixed-mapping: ≥25h 山吹(warning), ≥15h 群青(info), 以下 若竹(success).
function overtimeTone(h: number): "warning" | "info" | "success" {
  if (h >= 25) return "warning";
  if (h >= 15) return "info";
  return "success";
}

// ── Component ────────────────────────────────────────────────────────────────

export default function Demo() {
  return (
    <PageContainer
      title="勤怠サマリ"
      subtitle="2026年5月度 · 全10名 · 合計行は縦スクロールでも固定"
      density="compact"
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>従業員別 月次集計</CardTitle>
          <Text size="xs" tone="muted" tabular>
            対象 {ROWS.length} 名
          </Text>
        </CardHeader>
        {/* flush so the table meets the card edge; vertical scroll inside the
            card with header pinned top and totals pinned bottom. */}
        <CardContent flush>
          <div className="max-h-80 overflow-auto">
            <Table>
              <TableHeader className="bg-secondary sticky top-0 z-10">
                <TableRow>
                  <TableHead className="w-24">社員番号</TableHead>
                  <TableHead>氏名</TableHead>
                  <TableHead className="hidden md:table-cell">部署</TableHead>
                  <TableHead className="text-end">勤務日数</TableHead>
                  <TableHead className="text-end">残業時間</TableHead>
                  <TableHead className="text-end">遅刻</TableHead>
                  <TableHead className="text-end">有給</TableHead>
                  <TableHead className="text-end">総支給額</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {ROWS.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">{r.id}</TableCell>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell className="text-muted-foreground hidden md:table-cell">
                      {r.dept}
                    </TableCell>
                    <TableCell className="text-end tabular-nums">
                      {count.format(r.workDays)}
                    </TableCell>
                    <TableCell className="text-end tabular-nums">
                      <Badge tone={overtimeTone(r.overtime)} variant="outline">
                        {hours.format(r.overtime)}h
                      </Badge>
                    </TableCell>
                    <TableCell className="text-end tabular-nums">
                      {r.late > 0 ? (
                        <Badge tone="destructive" variant="outline">
                          {count.format(r.late)}
                        </Badge>
                      ) : (
                        <Text tone="muted">0</Text>
                      )}
                    </TableCell>
                    <TableCell className="text-end tabular-nums">
                      {count.format(r.paidLeave)}
                    </TableCell>
                    <TableCell className="text-end tabular-nums">{yen.format(r.pay)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>

              {/* Sticky footer totals row. No TableFooter primitive exists, so we
                  use a semantic <tfoot> with the same cell primitives. It is
                  pinned to the bottom of the scroll container. */}
              <tfoot className="bg-secondary sticky bottom-0 z-10">
                <TableRow className="hover:bg-secondary border-t-2">
                  <TableCell className="font-semibold">合計</TableCell>
                  <TableCell />
                  <TableCell className="hidden md:table-cell" />
                  <TableCell className="text-end font-semibold tabular-nums">
                    {count.format(totals.workDays)}
                  </TableCell>
                  <TableCell className="text-end font-semibold tabular-nums">
                    {hours.format(totals.overtime)}h
                  </TableCell>
                  <TableCell className="text-end font-semibold tabular-nums">
                    {count.format(totals.late)}
                  </TableCell>
                  <TableCell className="text-end font-semibold tabular-nums">
                    {count.format(totals.paidLeave)}
                  </TableCell>
                  <TableCell className="text-end font-semibold tabular-nums">
                    {yen.format(totals.pay)}
                  </TableCell>
                </TableRow>
              </tfoot>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Flex direction="row" align="center" gap="xs" className="mt-3">
        <Text size="xs" tone="muted">
          残業 凡例:
        </Text>
        <Badge tone="success" variant="outline">
          ~15h
        </Badge>
        <Badge tone="info" variant="outline">
          15h~
        </Badge>
        <Badge tone="warning" variant="outline">
          25h~
        </Badge>
        <Text size="xs" tone="muted" className="ms-2">
          遅刻:
        </Text>
        <Badge tone="destructive" variant="outline">
          回数
        </Badge>
      </Flex>
    </PageContainer>
  );
}
