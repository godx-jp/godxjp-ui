/**
 * Showcase · table-density — 密度切替 (V4)
 *
 * One and the SAME DataTable, retuned across the three row densities of the
 * dxs-kintai token scale:
 *
 *   compact     行高 28px (1.75rem)  — 監視・大量行向け
 *   default     行高 32px (2rem)     — 標準
 *   comfortable 行高 44px (2.75rem)  — タッチ下限 44px
 *
 * Density is a single knob: switching it only re-binds `--table-row-height`
 * (+ cell padding / control heights) via the public `ui-density-*` class —
 * the column definitions, data, sort, and selection never change. A
 * three-way ToggleGroup drives it; a numeric readout proves the px retune.
 *
 * Real @godxjp/ui primitives only: DataTable / Table family, Badge(tone),
 * ToggleGroup, Card, Button — no hand-rolled table, no raw controls.
 *
 * DNA: small headings, tabular-nums on 時刻/時間, fixed color signaling
 * (出勤=success若竹 · 遅刻=attention朱→destructive · 早退=warning山吹 ·
 * 承認待ち=info群青), quiet JP copy, no emoji.
 */
import * as React from "react";
import { Clock } from "lucide-react";

import {
  Badge,
  type BadgeProps,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DataTable,
  type ColumnDef,
} from "@godxjp/ui/data-display";
import { Button } from "@godxjp/ui/general";
import { ToggleGroup, ToggleGroupItem } from "@godxjp/ui/data-entry";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import type { TableDensityProp } from "@godxjp/ui/props";

type BadgeTone = NonNullable<BadgeProps["tone"]>;

// ── The three densities of the dxs-kintai token scale ─────────────────────────
// DataTable's own `density` prop is TableDensityProp = "compact" | "comfortable"
// (it excludes "default"). To showcase all THREE token steps over the same table
// we drive the row retune through the public `ui-density-*` class — the same knob
// PageContainer's `density` prop sets — and pass the supported value to the prop
// where it exists. See gapNotes.
type DensityKey = "compact" | "default" | "comfortable";

const DENSITY_META: Record<DensityKey, { label: string; px: number; cls: string; note: string }> = {
  compact: { label: "compact", px: 28, cls: "ui-density-compact", note: "監視・大量行" },
  default: { label: "default", px: 32, cls: "ui-density-default", note: "標準" },
  comfortable: { label: "comfortable", px: 44, cls: "ui-density-comfortable", note: "タッチ 44px" },
};

const DENSITY_ORDER: DensityKey[] = ["compact", "default", "comfortable"];

// `default` is not part of DataTable's density prop; fall back to compact for the
// prop (lowest CSS precedence) and let the appended class win the cascade.
const toTableDensityProp = (d: DensityKey): TableDensityProp =>
  d === "comfortable" ? "comfortable" : "compact";

// ── Realistic kintai data — 本日の打刻 ────────────────────────────────────────

type AttendanceStatus = "present" | "late" | "leftEarly" | "pending" | "absent";

type Attendance = {
  id: string;
  employee: string;
  dept: string;
  shift: string;
  clockIn: string;
  clockOut: string;
  workHours: string;
  overtime: string;
  status: AttendanceStatus;
};

const STATUS_META: Record<AttendanceStatus, { label: string; tone: BadgeTone }> = {
  present: { label: "出勤", tone: "success" }, // 若竹
  late: { label: "遅刻", tone: "destructive" }, // 朱寄り — 非破壊だが注意喚起
  leftEarly: { label: "早退", tone: "warning" }, // 山吹
  pending: { label: "承認待ち", tone: "info" }, // 群青
  absent: { label: "欠勤", tone: "neutral" },
};

const ROWS: Attendance[] = [
  {
    id: "E-1042",
    employee: "佐藤 健一",
    dept: "倉庫課",
    shift: "早番 09:00–18:00",
    clockIn: "08:54",
    clockOut: "18:03",
    workHours: "8.0",
    overtime: "0.1",
    status: "present",
  },
  {
    id: "E-1043",
    employee: "鈴木 美咲",
    dept: "倉庫課",
    shift: "早番 09:00–18:00",
    clockIn: "09:21",
    clockOut: "18:00",
    workHours: "7.6",
    overtime: "0.0",
    status: "late",
  },
  {
    id: "E-1051",
    employee: "高橋 直樹",
    dept: "検品課",
    shift: "中番 11:00–20:00",
    clockIn: "10:58",
    clockOut: "16:40",
    workHours: "5.7",
    overtime: "0.0",
    status: "leftEarly",
  },
  {
    id: "E-1067",
    employee: "田中 彩花",
    dept: "出荷課",
    shift: "遅番 13:00–22:00",
    clockIn: "12:55",
    clockOut: "22:18",
    workHours: "8.4",
    overtime: "0.4",
    status: "pending",
  },
  {
    id: "E-1078",
    employee: "渡辺 翔太",
    dept: "検品課",
    shift: "早番 09:00–18:00",
    clockIn: "08:49",
    clockOut: "18:02",
    workHours: "8.0",
    overtime: "0.0",
    status: "present",
  },
  {
    id: "E-1090",
    employee: "伊藤 結衣",
    dept: "出荷課",
    shift: "中番 11:00–20:00",
    clockIn: "—",
    clockOut: "—",
    workHours: "0.0",
    overtime: "0.0",
    status: "absent",
  },
  {
    id: "E-1102",
    employee: "山本 大輔",
    dept: "倉庫課",
    shift: "遅番 13:00–22:00",
    clockIn: "12:58",
    clockOut: "22:05",
    workHours: "8.1",
    overtime: "0.1",
    status: "present",
  },
  {
    id: "E-1118",
    employee: "中村 さくら",
    dept: "検品課",
    shift: "早番 09:00–18:00",
    clockIn: "09:33",
    clockOut: "18:10",
    workHours: "7.6",
    overtime: "0.2",
    status: "late",
  },
];

const num = (v: string) => <span className="tabular-nums">{v}</span>;

const columns: ColumnDef<Attendance>[] = [
  { key: "id", header: "社員番号", width: "w-24", render: (r) => <span className="font-mono text-xs">{r.id}</span> },
  { key: "employee", header: "従業員", sortable: true },
  { key: "dept", header: "部署", hiddenOnMobile: true },
  { key: "shift", header: "シフト", hiddenOnMobile: true },
  { key: "clockIn", header: "出勤", align: "right", render: (r) => num(r.clockIn) },
  { key: "clockOut", header: "退勤", align: "right", render: (r) => num(r.clockOut) },
  {
    key: "workHours",
    header: "実働(h)",
    align: "right",
    sortable: true,
    render: (r) => num(r.workHours),
  },
  {
    key: "overtime",
    header: "残業(h)",
    align: "right",
    hiddenOnMobile: true,
    render: (r) => num(r.overtime),
  },
  {
    key: "status",
    header: "状態",
    align: "center",
    render: (r) => {
      const m = STATUS_META[r.status];
      return <Badge tone={m.tone}>{m.label}</Badge>;
    },
  },
];

export default function Demo() {
  const [density, setDensity] = React.useState<DensityKey>("compact");
  const [selected, setSelected] = React.useState<Set<string>>(new Set(["E-1043"]));
  const meta = DENSITY_META[density];

  return (
    <PageContainer
      title="密度切替 (V4)"
      subtitle="同一 DataTable を compact 28 / default 32 / comfortable 44 で再調整 — 行は --table-row-height で再バインド"
      density="compact"
    >
      <Flex direction="col" gap="lg">
        {/* Control + live readout */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle>行密度</CardTitle>
            <Flex direction="row" align="center" gap="md">
              <span className="text-muted-foreground inline-flex items-center gap-1.5 text-xs">
                <Clock className="size-3.5" aria-hidden="true" />
                行高
                <strong className="text-foreground tabular-nums">{meta.px}px</strong>
                <span aria-hidden="true">·</span>
                {meta.note}
              </span>
              <ToggleGroup
                type="single"
                value={density}
                onValueChange={(v) => {
                  if (v) setDensity(v as DensityKey);
                }}
                variant="outline"
                size="sm"
                aria-label="行密度を切り替え"
              >
                {DENSITY_ORDER.map((key) => (
                  <ToggleGroupItem key={key} value={key} aria-label={`${DENSITY_META[key].label} ${DENSITY_META[key].px}px`}>
                    <Flex direction="row" align="center" gap="xs">
                      <span>{DENSITY_META[key].label}</span>
                      <span className="text-muted-foreground tabular-nums text-[11px]">
                        {DENSITY_META[key].px}
                      </span>
                    </Flex>
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </Flex>
          </CardHeader>
          <CardContent flush>
            {/* The SAME DataTable. Only the density class changes — same columns,
                data, sort and selection. The appended ui-density-* class wins the
                token cascade so all three steps (incl. 32px default) render. */}
            <DataTable
              key={density}
              data={ROWS}
              columns={columns}
              getRowId={(row) => row.id}
              selectable
              selected={selected}
              onSelectChange={setSelected}
              density={toTableDensityProp(density)}
              className={meta.cls}
            >
              <DataTable.Toolbar>
                <DataTable.BulkActions>
                  <Button size="sm" variant="outline">
                    勤怠を承認
                  </Button>
                  <Button size="sm" variant="outline">
                    打刻修正
                  </Button>
                </DataTable.BulkActions>
                <span className="text-muted-foreground text-xs tabular-nums">
                  {ROWS.length} 名 · 2026-06-04
                </span>
              </DataTable.Toolbar>
              <DataTable.Content />
            </DataTable>
          </CardContent>
        </Card>

        {/* Side-by-side reference — all three densities at rest, same table shape.
            Proves the retune statically without toggling (Rule #2). */}
        <Flex direction="col" gap="sm">
          <div className="text-sm font-medium">3 密度の比較（静止状態）</div>
          <Flex direction="col" gap="lg">
            {DENSITY_ORDER.map((key) => {
              const m = DENSITY_META[key];
              return (
                <Card key={key}>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>{m.label}</CardTitle>
                    <span className="text-muted-foreground text-xs tabular-nums">
                      行高 {m.px}px · {m.note}
                    </span>
                  </CardHeader>
                  <CardContent flush>
                    <DataTable
                      data={ROWS.slice(0, 4)}
                      columns={columns}
                      getRowId={(row) => row.id}
                      density={toTableDensityProp(key)}
                      className={m.cls}
                    />
                  </CardContent>
                </Card>
              );
            })}
          </Flex>
        </Flex>
      </Flex>
    </PageContainer>
  );
}
