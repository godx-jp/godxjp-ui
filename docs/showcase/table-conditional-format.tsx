/**
 * Showcase · table-conditional-format — 条件付き書式 (V19)
 *
 * Conditional row / cell formatting by threshold on a 勤怠 (attendance) summary:
 *   - 遅刻 (late arrivals) ≥ 5回   → 行全体を danger(茜) で淡くティント
 *   - 早退 (early leave) > 2.0h     → セルを attention(朱) で強調
 *   - 残業 (overtime) ≥ 45h         → セルを warning(山吹) で注意喚起
 *
 * すべて semantic token 経由（bg-destructive/10・text-attention・text-warning-foreground）で、
 * raw hex は一切使わない。閾値判定は純粋関数に集約し、書式は token クラスにマップする。
 *
 * GAP: DataTable の ColumnDef は per-row / per-cell の className フックを持たない
 *      (render は ReactNode を返すのみ)。行全体のティントには @godxjp/ui が同梱する
 *      実 primitive の Table / TableRow ファミリ（DataTable 内部と同一）で組み立て、
 *      TableRow に token クラスを渡す。セル単位の書式は ColumnDef でも表現できるため、
 *      下段で DataTable + render の cell-only 版も併示する。
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@godxjp/ui/data-display";
import { Text } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import { cn } from "@godxjp/ui/lib/utils";

// ── 勤怠データ（当月締め · 製造部 第2ライン） ────────────────────────────────
type Attendance = {
  id: string;
  name: string;
  dept: string;
  workdays: number; // 出勤日数
  late: number; // 遅刻回数
  earlyLeaveHours: number; // 早退時間 (h)
  overtime: number; // 残業時間 (h)
  status: "approved" | "pending" | "review";
};

const ROWS: Attendance[] = [
  {
    id: "E-1042",
    name: "田中 美咲",
    dept: "製造1課",
    workdays: 20,
    late: 1,
    earlyLeaveHours: 0,
    overtime: 12.5,
    status: "approved",
  },
  {
    id: "E-1043",
    name: "佐藤 健",
    dept: "製造1課",
    workdays: 19,
    late: 6,
    earlyLeaveHours: 1.5,
    overtime: 8,
    status: "review",
  },
  {
    id: "E-1044",
    name: "鈴木 陽子",
    dept: "製造2課",
    workdays: 20,
    late: 0,
    earlyLeaveHours: 2.5,
    overtime: 31,
    status: "pending",
  },
  {
    id: "E-1045",
    name: "高橋 大輔",
    dept: "製造2課",
    workdays: 18,
    late: 3,
    earlyLeaveHours: 0,
    overtime: 46.5,
    status: "review",
  },
  {
    id: "E-1046",
    name: "伊藤 さくら",
    dept: "検査課",
    workdays: 20,
    late: 0,
    earlyLeaveHours: 0,
    overtime: 4,
    status: "approved",
  },
  {
    id: "E-1047",
    name: "渡辺 翔",
    dept: "検査課",
    workdays: 17,
    late: 8,
    earlyLeaveHours: 3.0,
    overtime: 22,
    status: "review",
  },
  {
    id: "E-1048",
    name: "山本 直樹",
    dept: "出荷課",
    workdays: 20,
    late: 2,
    earlyLeaveHours: 0.5,
    overtime: 15,
    status: "approved",
  },
  {
    id: "E-1049",
    name: "中村 あおい",
    dept: "出荷課",
    workdays: 19,
    late: 5,
    earlyLeaveHours: 2.25,
    overtime: 48,
    status: "review",
  },
];

// ── 閾値（しきい値） ───────────────────────────────────────────────────────
const LATE_DANGER = 5; // 遅刻 ≥ 5回 → 行ティント (danger 茜)
const EARLY_ATTENTION = 2; // 早退 > 2.0h → セル強調 (attention 朱)
const OVERTIME_WARNING = 45; // 残業 ≥ 45h → セル注意 (warning 山吹)

const isLateRow = (r: Attendance) => r.late >= LATE_DANGER;
const isEarlyCell = (r: Attendance) => r.earlyLeaveHours > EARLY_ATTENTION;
const isOvertimeCell = (r: Attendance) => r.overtime >= OVERTIME_WARNING;

const num = new Intl.NumberFormat("ja-JP", { maximumFractionDigits: 2 });
const hours = (h: number) => `${num.format(h)}h`;

// ── 凡例（しきい値の色対応を明示） ─────────────────────────────────────────
const LEGEND: Array<{ swatch: string; label: string }> = [
  {
    swatch: "bg-destructive/15 border-destructive/40",
    label: `遅刻 ${LATE_DANGER}回以上 → 行を強調（茜）`,
  },
  {
    swatch: "bg-attention/15 border-attention/40",
    label: `早退 ${EARLY_ATTENTION}.0h 超 → セル強調（朱）`,
  },
  {
    swatch: "bg-warning/15 border-warning/40",
    label: `残業 ${OVERTIME_WARNING}h 以上 → セル注意（山吹）`,
  },
];

function Legend() {
  return (
    <Flex direction="row" wrap gap="md" align="center">
      {LEGEND.map((l) => (
        <Flex key={l.label} direction="row" align="center" gap="xs">
          <span
            aria-hidden="true"
            className={cn("inline-block size-3 rounded-sm border", l.swatch)}
          />
          <Text size="xs" tone="muted">
            {l.label}
          </Text>
        </Flex>
      ))}
    </Flex>
  );
}

export default function Demo() {
  // ── 下段 DataTable 用カラム（セル単位の条件付き書式は render で表現可能） ──
  const columns: ColumnDef<Attendance>[] = [
    { key: "id", header: "社員番号", width: "w-24" },
    { key: "name", header: "氏名" },
    { key: "dept", header: "部署", hiddenOnMobile: true },
    {
      key: "late",
      header: "遅刻",
      align: "right",
      sortable: true,
      render: (r) => (
        <Text
          tabular
          tone={r.late >= LATE_DANGER ? "destructive" : "default"}
          weight={r.late >= LATE_DANGER ? "medium" : "regular"}
        >
          {r.late}回
        </Text>
      ),
    },
    {
      key: "earlyLeaveHours",
      header: "早退",
      align: "right",
      sortable: true,
      render: (r) =>
        isEarlyCell(r) ? (
          <span className="bg-attention/10 text-attention inline-flex rounded-sm px-1.5 py-0.5">
            <Text as="span" weight="medium" tabular style={{ color: "inherit" }}>
              {hours(r.earlyLeaveHours)}
            </Text>
          </span>
        ) : (
          <Text tabular>{hours(r.earlyLeaveHours)}</Text>
        ),
    },
    {
      key: "overtime",
      header: "残業",
      align: "right",
      sortable: true,
      render: (r) =>
        isOvertimeCell(r) ? (
          <span className="bg-warning/10 text-warning-foreground inline-flex rounded-sm px-1.5 py-0.5">
            <Text as="span" weight="medium" tabular style={{ color: "inherit" }}>
              {hours(r.overtime)}
            </Text>
          </span>
        ) : (
          <Text tabular>{hours(r.overtime)}</Text>
        ),
    },
    {
      key: "status",
      header: "承認",
      align: "center",
      render: (r) => <Badge status={r.status} />,
    },
  ];

  return (
    <PageContainer
      title="条件付き書式"
      subtitle="しきい値による行・セルの自動強調 · 遅刻≥5回で行（茜）・早退>2.0hでセル（朱）・残業≥45hでセル（山吹）"
      density="compact"
    >
      <Flex direction="col" gap="lg">
        {/* ── 行レベル + セルレベルの条件付き書式（実 Table primitive で合成） ── */}
        <Card>
          <CardHeader className="gap-2">
            <Flex direction="row" wrap align="center" justify="between" gap="sm">
              <CardTitle>勤怠サマリ · 製造部（当月締め）</CardTitle>
              <Text size="xs" tone="muted" tabular>
                対象 {ROWS.length}名 · 2026-05
              </Text>
            </Flex>
            <Legend />
          </CardHeader>
          <CardContent flush>
            <Table>
              <TableHeader className="bg-secondary">
                <TableRow>
                  <TableHead className="w-24">社員番号</TableHead>
                  <TableHead>氏名</TableHead>
                  <TableHead className="hidden md:table-cell">部署</TableHead>
                  <TableHead className="text-end">出勤</TableHead>
                  <TableHead className="text-end">遅刻</TableHead>
                  <TableHead className="text-end">早退</TableHead>
                  <TableHead className="text-end">残業</TableHead>
                  <TableHead className="text-center">承認</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ROWS.map((r) => {
                  const lateRow = isLateRow(r);
                  return (
                    <TableRow
                      key={r.id}
                      // 行レベル条件付き書式: 遅刻≥5回 → danger(茜) で淡くティント。
                      // semantic token のみ（bg-destructive/…）。hover でも判別できるよう強めに上書き。
                      className={cn(lateRow && "bg-destructive/[0.07] hover:bg-destructive/10")}
                      // しきい値超過行はスクリーンリーダーにも明示。
                      aria-label={
                        lateRow ? `${r.name} · 遅刻が基準値（${LATE_DANGER}回）以上` : undefined
                      }
                    >
                      <TableCell className="font-mono text-xs">{r.id}</TableCell>
                      <TableCell className="font-medium">
                        <Flex direction="row" align="center" gap="xs">
                          {r.name}
                          {lateRow && (
                            <Badge tone="destructive" variant="outline">
                              遅刻多
                            </Badge>
                          )}
                        </Flex>
                      </TableCell>
                      <TableCell className="text-muted-foreground hidden md:table-cell">
                        {r.dept}
                      </TableCell>
                      <TableCell className="text-end tabular-nums">{r.workdays}日</TableCell>
                      {/* 遅刻セル: しきい値以上は茜文字で前景強調 */}
                      <TableCell className="text-end">
                        <Text
                          tabular
                          tone={lateRow ? "destructive" : "default"}
                          weight={lateRow ? "medium" : "regular"}
                        >
                          {r.late}回
                        </Text>
                      </TableCell>
                      {/* 早退セル: > 2.0h は attention(朱) で背景＋前景強調 */}
                      <TableCell className="text-end">
                        {isEarlyCell(r) ? (
                          <span className="bg-attention/10 text-attention inline-flex rounded-sm px-1.5 py-0.5">
                            <Text as="span" weight="medium" tabular style={{ color: "inherit" }}>
                              {hours(r.earlyLeaveHours)}
                            </Text>
                          </span>
                        ) : (
                          <Text tone="muted" tabular>
                            {hours(r.earlyLeaveHours)}
                          </Text>
                        )}
                      </TableCell>
                      {/* 残業セル: ≥ 45h は warning(山吹) で注意 */}
                      <TableCell className="text-end">
                        {isOvertimeCell(r) ? (
                          <span className="bg-warning/10 text-warning-foreground inline-flex rounded-sm px-1.5 py-0.5">
                            <Text as="span" weight="medium" tabular style={{ color: "inherit" }}>
                              {hours(r.overtime)}
                            </Text>
                          </span>
                        ) : (
                          <Text tabular>{hours(r.overtime)}</Text>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge status={r.status} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* ── DataTable 版（セル単位の条件付き書式は ColumnDef.render で表現） ── */}
        <Card>
          <CardHeader>
            <CardTitle>DataTable 版 · セル単位の条件付き書式</CardTitle>
            <Text size="xs" tone="muted">
              ColumnDef.render 内でしきい値判定 → token クラスを付与。行全体のティントは ColumnDef
              では表現できないため上段の実 Table 合成を参照（gapNotes 参照）。
            </Text>
          </CardHeader>
          <CardContent flush>
            <DataTable data={ROWS} columns={columns} getRowId={(r) => r.id}>
              <DataTable.Content />
            </DataTable>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
