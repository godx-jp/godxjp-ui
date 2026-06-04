/**
 * Showcase · table-sticky-columns — 固定列 (V13)
 *
 * Sticky/pinned first (識別子 = 従業員) + last (操作) columns over a
 * horizontal-scroll 勤怠 matrix (week grid, `min-w` on the table). The pinned
 * edges carry an inset shadow that reveals there is more content to scroll.
 *
 * GAP: @godxjp/ui `DataTable` / `ColumnDef` has NO column-pinning capability —
 * it only sticks the HEADER row (top), not LEFT/RIGHT columns. So the pinned-
 * column matrix is COMPOSED from the real `Table` family primitives
 * (Table/TableHeader/TableBody/TableRow/TableHead/TableCell) with
 * `sticky left-0` / `sticky right-0` + a background + edge shadow — no hand-
 * rolled <table>, no raw HTML controls. Status/識別子 cells reuse Badge/Button.
 *
 * DNA applied: compact density, small headings, tabular-nums on the matrix,
 * fixed color signaling (出勤 若竹/success · 遅刻 朱/attention via warning ·
 * 欠勤 茜/destructive · 有休 群青/info), quiet JP copy, no emoji.
 */
import * as React from "react";
import { Check } from "lucide-react";

import { Button } from "@godxjp/ui/general";
import {
  Badge,
  type BadgeProps,
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
import { Flex, PageContainer } from "@godxjp/ui/layout";

type BadgeTone = NonNullable<BadgeProps["tone"]>;

// ── Domain: a one-week 勤怠 matrix per 従業員 ───────────────────────────────

/** Per-day attendance mark. Tone follows the fixed kintai signaling map. */
type Mark = "present" | "late" | "absent" | "paid" | "off";

const MARK: Record<Mark, { label: string; tone: BadgeTone | "muted" }> = {
  present: { label: "出勤", tone: "success" }, // 若竹
  late: { label: "遅刻", tone: "warning" }, // 朱/山吹 — non-destructive attention
  absent: { label: "欠勤", tone: "destructive" }, // 茜
  paid: { label: "有休", tone: "info" }, // 群青
  off: { label: "—", tone: "muted" }, // 公休 / 非番
};

const DAYS = [
  { key: "mon", label: "月", date: "6/1" },
  { key: "tue", label: "火", date: "6/2" },
  { key: "wed", label: "水", date: "6/3" },
  { key: "thu", label: "木", date: "6/4" },
  { key: "fri", label: "金", date: "6/5" },
  { key: "sat", label: "土", date: "6/6" },
  { key: "sun", label: "日", date: "6/7" },
] as const;

type DayKey = (typeof DAYS)[number]["key"];

type Employee = {
  id: string;
  name: string;
  dept: string;
  marks: Record<DayKey, Mark>;
  /** 実働合計（時間） for the week. */
  total: number;
  /** 遅刻回数 for the week. */
  lateCount: number;
};

const EMPLOYEES: Employee[] = [
  {
    id: "E-1042",
    name: "佐藤 美咲",
    dept: "受付",
    marks: { mon: "present", tue: "present", wed: "late", thu: "present", fri: "present", sat: "off", sun: "off" },
    total: 38.5,
    lateCount: 1,
  },
  {
    id: "E-1043",
    name: "鈴木 健一",
    dept: "倉庫",
    marks: { mon: "present", tue: "late", wed: "late", thu: "present", fri: "absent", sat: "present", sun: "off" },
    total: 40.0,
    lateCount: 2,
  },
  {
    id: "E-1044",
    name: "高橋 結衣",
    dept: "受付",
    marks: { mon: "paid", tue: "paid", wed: "present", thu: "present", fri: "present", sat: "off", sun: "off" },
    total: 24.0,
    lateCount: 0,
  },
  {
    id: "E-1045",
    name: "田中 大輔",
    dept: "配送",
    marks: { mon: "present", tue: "present", wed: "present", thu: "present", fri: "present", sat: "present", sun: "off" },
    total: 46.0,
    lateCount: 0,
  },
  {
    id: "E-1046",
    name: "渡辺 さくら",
    dept: "配送",
    marks: { mon: "absent", tue: "present", wed: "present", thu: "late", fri: "present", sat: "off", sun: "off" },
    total: 31.5,
    lateCount: 1,
  },
  {
    id: "E-1047",
    name: "伊藤 翔太",
    dept: "倉庫",
    marks: { mon: "present", tue: "present", wed: "present", thu: "paid", fri: "paid", sat: "off", sun: "off" },
    total: 23.0,
    lateCount: 0,
  },
];

// ── Sticky-edge styling (composed — DataTable cannot pin columns) ───────────

/**
 * Pinned columns must paint an opaque background (the scrolling body slides
 * UNDER them) and a hard edge so the seam reads as "more to scroll". The edge
 * is the `--border` token (`border-border`) — a token-only inset cue; the
 * `bg-inherit` lets each row's tint (selected/hover) bleed into the pinned cell.
 * Header cells inherit `bg-secondary`; body cells inherit the row background.
 */
const PIN_LEFT = "sticky left-0 z-20 bg-inherit border-r border-border";
const PIN_RIGHT = "sticky right-0 z-20 bg-inherit border-l border-border";

function MarkCell({ mark }: { mark: Mark }) {
  const def = MARK[mark];
  if (mark === "off") {
    return <span className="text-muted-foreground tabular-nums">—</span>;
  }
  return (
    <Badge tone={def.tone === "muted" ? "muted" : def.tone} variant="outline">
      {def.label}
    </Badge>
  );
}

export default function Demo() {
  const [approved, setApproved] = React.useState<Set<string>>(new Set(["E-1044"]));

  const toggleApprove = (id: string) => {
    setApproved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <PageContainer
      title="固定列 — 週次勤怠マトリクス"
      subtitle="先頭列（従業員）と末尾列（操作）を固定し、中央の日付グリッドのみ横スクロール。固定端には inset シャドウ。"
      density="compact"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>2026年6月 第1週</CardTitle>
            <span className="text-muted-foreground text-xs tabular-nums">
              従業員 {EMPLOYEES.length} 名 · 横スクロールで全日表示
            </span>
          </CardHeader>
          <CardContent flush>
            {/* The scroll container. `overflow-x-auto` clips; the table holds a
                min width wider than the viewport so the matrix must scroll. */}
            <div className="overflow-x-auto">
              <Table className="min-w-[860px]">
                <TableHeader className="bg-secondary [&_tr]:bg-secondary">
                  <TableRow className="bg-secondary hover:bg-secondary">
                    {/* Pinned-left identifier header */}
                    <TableHead className={`${PIN_LEFT} w-56 min-w-56`}>従業員</TableHead>
                    {DAYS.map((d) => (
                      <TableHead key={d.key} className="text-center">
                        <span className="flex flex-col leading-tight">
                          <span className="font-medium">{d.label}</span>
                          <span className="text-muted-foreground text-[11px] tabular-nums">
                            {d.date}
                          </span>
                        </span>
                      </TableHead>
                    ))}
                    <TableHead className="text-right tabular-nums">実働</TableHead>
                    {/* Pinned-right action header */}
                    <TableHead className={`${PIN_RIGHT} w-28 min-w-28 text-right`}>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {EMPLOYEES.map((emp) => {
                    const isApproved = approved.has(emp.id);
                    return (
                      <TableRow
                        key={emp.id}
                        data-state={isApproved ? "selected" : undefined}
                        className={isApproved ? "bg-primary/[0.04]" : "bg-background"}
                      >
                        {/* Pinned-left: 識別子 (従業員 + 部署 + ID) */}
                        <TableCell className={`${PIN_LEFT} w-56 min-w-56 align-middle`}>
                          <div className="flex flex-col leading-tight">
                            <span className="font-medium">{emp.name}</span>
                            <span className="text-muted-foreground text-[11px]">
                              {emp.dept} ·{" "}
                              <span className="font-mono tabular-nums">{emp.id}</span>
                            </span>
                          </div>
                        </TableCell>

                        {/* Scrolling day grid */}
                        {DAYS.map((d) => (
                          <TableCell key={d.key} className="text-center align-middle">
                            <MarkCell mark={emp.marks[d.key]} />
                          </TableCell>
                        ))}

                        {/* 実働合計 — numeric, tabular */}
                        <TableCell className="text-right align-middle tabular-nums">
                          {emp.total.toFixed(1)}
                          <span className="text-muted-foreground text-[11px]">h</span>
                        </TableCell>

                        {/* Pinned-right: 操作 */}
                        <TableCell className={`${PIN_RIGHT} w-28 min-w-28 text-right align-middle`}>
                          <Button
                            size="sm"
                            variant={isApproved ? "outline" : "default"}
                            onClick={() => {
                              toggleApprove(emp.id);
                            }}
                            aria-pressed={isApproved}
                          >
                            {isApproved ? (
                              <>
                                <Check aria-hidden="true" />
                                承認済
                              </>
                            ) : (
                              "承認"
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Legend — the fixed color-signaling map, shown at rest. */}
        <Card>
          <CardHeader>
            <CardTitle>凡例</CardTitle>
          </CardHeader>
          <CardContent>
            <Flex direction="row" wrap gap="md">
              <Flex direction="row" align="center" gap="xs">
                <Badge tone="success" variant="outline">出勤</Badge>
                <span className="text-muted-foreground text-xs">通常勤務</span>
              </Flex>
              <Flex direction="row" align="center" gap="xs">
                <Badge tone="warning" variant="outline">遅刻</Badge>
                <span className="text-muted-foreground text-xs">非破壊的な注意</span>
              </Flex>
              <Flex direction="row" align="center" gap="xs">
                <Badge tone="destructive" variant="outline">欠勤</Badge>
                <span className="text-muted-foreground text-xs">未承認の不在</span>
              </Flex>
              <Flex direction="row" align="center" gap="xs">
                <Badge tone="info" variant="outline">有休</Badge>
                <span className="text-muted-foreground text-xs">有給休暇</span>
              </Flex>
              <Flex direction="row" align="center" gap="xs">
                <span className="text-muted-foreground tabular-nums">—</span>
                <span className="text-muted-foreground text-xs">公休 / 非番</span>
              </Flex>
            </Flex>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
