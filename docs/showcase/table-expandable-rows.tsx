/**
 * Showcase · table-expandable-rows — 展開行 (V9)
 *
 * Expandable detail row pattern for a 勤怠 (kintai) admin list. Clicking a row
 * reveals an inline detail panel (border-left 3px primary) directly beneath it;
 * the toggle is EXCLUSIVE — opening one row collapses any other.
 *
 * Why compose from <Table> instead of <DataTable>:
 *   DataTable.Content renders each row from the column defs and offers no slot to
 *   inject an extra <tr> (the detail panel) between data rows, nor an expanded /
 *   exclusive-open state. So the master list is built from the real low-level
 *   Table family (Table / TableHeader / TableRow / TableHead / TableCell) — the
 *   same primitives DataTable itself uses — and the panel is a spanning <tr>.
 *   See gapNotes. Everything else (Badge tone, Button, Card, StatCard) is a real
 *   @godxjp/ui primitive; no hand-rolled controls, tokens only.
 *
 * DNA: compact density, tabular-nums on numbers, fixed color signaling
 * (success 若竹 / warning 山吹 / attention 朱 via destructive tone reserved for
 * 欠勤), small headings, quiet JP copy, no emoji.
 */
import * as React from "react";
import { ChevronRight, Clock, Coffee, MapPin } from "lucide-react";

import {
  Badge,
  type BadgeProps,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  StatCard,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@godxjp/ui/data-display";
import { Button, Text } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";

type BadgeTone = NonNullable<BadgeProps["tone"]>;

// ── Mock kintai data ──────────────────────────────────────────────────────────

type ShiftStatus = "出勤" | "遅刻" | "早退" | "欠勤";

const STATUS_TONE: Record<
  ShiftStatus,
  Extract<BadgeTone, "success" | "warning" | "destructive">
> = {
  出勤: "success",
  遅刻: "warning",
  早退: "warning",
  欠勤: "destructive",
};

type DayLog = {
  date: string;
  weekday: string;
  status: ShiftStatus;
  clockIn: string;
  clockOut: string;
  break: string;
  work: string;
  note?: string;
};

type Employee = {
  id: string;
  code: string;
  name: string;
  dept: string;
  site: string;
  workDays: number;
  lateCount: number;
  overtime: string; // 残業 累計
  status: ShiftStatus; // 直近の状態
  days: DayLog[];
};

const EMPLOYEES: Employee[] = [
  {
    id: "E-1042",
    code: "1042",
    name: "佐藤 健太",
    dept: "製造一課",
    site: "埼玉センター",
    workDays: 19,
    lateCount: 0,
    overtime: "12:30",
    status: "出勤",
    days: [
      {
        date: "06/02",
        weekday: "月",
        status: "出勤",
        clockIn: "08:58",
        clockOut: "18:05",
        break: "1:00",
        work: "8:07",
      },
      {
        date: "06/03",
        weekday: "火",
        status: "出勤",
        clockIn: "08:55",
        clockOut: "19:40",
        break: "1:00",
        work: "9:45",
        note: "残業 1:40（出荷対応）",
      },
      {
        date: "06/04",
        weekday: "水",
        status: "出勤",
        clockIn: "08:52",
        clockOut: "18:02",
        break: "1:00",
        work: "8:10",
      },
    ],
  },
  {
    id: "E-1043",
    code: "1043",
    name: "鈴木 美咲",
    dept: "品質管理課",
    site: "埼玉センター",
    workDays: 18,
    lateCount: 2,
    overtime: "03:10",
    status: "遅刻",
    days: [
      {
        date: "06/02",
        weekday: "月",
        status: "出勤",
        clockIn: "09:00",
        clockOut: "18:00",
        break: "1:00",
        work: "8:00",
      },
      {
        date: "06/03",
        weekday: "火",
        status: "遅刻",
        clockIn: "09:24",
        clockOut: "18:00",
        break: "1:00",
        work: "7:36",
        note: "電車遅延（承認待ち）",
      },
      {
        date: "06/04",
        weekday: "水",
        status: "遅刻",
        clockIn: "09:18",
        clockOut: "18:05",
        break: "1:00",
        work: "7:47",
        note: "申請理由 未入力",
      },
    ],
  },
  {
    id: "E-1044",
    code: "1044",
    name: "高橋 大輔",
    dept: "物流課",
    site: "千葉センター",
    workDays: 17,
    lateCount: 1,
    overtime: "06:45",
    status: "早退",
    days: [
      {
        date: "06/02",
        weekday: "月",
        status: "出勤",
        clockIn: "08:50",
        clockOut: "18:10",
        break: "1:00",
        work: "8:20",
      },
      {
        date: "06/03",
        weekday: "火",
        status: "早退",
        clockIn: "08:55",
        clockOut: "15:30",
        break: "0:45",
        work: "5:50",
        note: "通院（承認済）",
      },
      {
        date: "06/04",
        weekday: "水",
        status: "出勤",
        clockIn: "08:48",
        clockOut: "18:02",
        break: "1:00",
        work: "8:14",
      },
    ],
  },
  {
    id: "E-1045",
    code: "1045",
    name: "田中 由紀",
    dept: "総務課",
    site: "埼玉センター",
    workDays: 16,
    lateCount: 0,
    overtime: "00:00",
    status: "欠勤",
    days: [
      {
        date: "06/02",
        weekday: "月",
        status: "出勤",
        clockIn: "08:59",
        clockOut: "17:45",
        break: "1:00",
        work: "7:46",
      },
      {
        date: "06/03",
        weekday: "火",
        status: "欠勤",
        clockIn: "—",
        clockOut: "—",
        break: "—",
        work: "0:00",
        note: "有給休暇（承認済）",
      },
      {
        date: "06/04",
        weekday: "水",
        status: "出勤",
        clockIn: "08:57",
        clockOut: "17:50",
        break: "1:00",
        work: "7:53",
      },
    ],
  },
];

// ── Shared cell padding to match compact DataTable density ─────────────────────

const CELL = "px-3 py-2 align-middle";
const HEAD = "px-3";

function StatusBadge({ status }: { status: ShiftStatus }) {
  return (
    <Badge tone={STATUS_TONE[status]} variant="outline">
      {status}
    </Badge>
  );
}

// ── Inline detail panel (border-left 3px primary) ──────────────────────────────

function DetailPanel({ employee }: { employee: Employee }) {
  return (
    <div className="border-s-primary bg-muted/30 border-s-[3px] px-4 py-3">
      <Flex direction="col" gap="md">
        <Flex direction="row" wrap align="center" gap="md">
          <Text size="sm" weight="medium">
            {employee.name} · {employee.dept}
          </Text>
          <Text size="xs" tone="muted" className="inline-flex items-center gap-1">
            <MapPin className="size-3.5" aria-hidden="true" />
            {employee.site}
          </Text>
        </Flex>

        {/* KPI mini-row inside the panel — real StatCard primitives */}
        <Flex direction="row" wrap gap="sm">
          <StatCard label="出勤日数" value={employee.workDays} layout="inline" />
          <StatCard
            label="遅刻回数"
            value={employee.lateCount}
            layout="inline"
            inverse
            delta={employee.lateCount === 0 ? "問題なし" : "要確認"}
          />
          <StatCard
            label="残業 累計"
            value={<Text tabular>{employee.overtime}</Text>}
            layout="inline"
          />
        </Flex>

        {/* Per-day breakdown — quiet nested list, real Card chrome */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-[var(--font-size-xs)]">今週の打刻</CardTitle>
            <Text size="xs" tone="muted" className="inline-flex items-center gap-1">
              <Clock className="size-3.5" aria-hidden="true" />
              直近 3 日
            </Text>
          </CardHeader>
          <CardContent flush>
            <Table>
              <TableHeader className="bg-secondary">
                <TableRow>
                  <TableHead className={HEAD}>日付</TableHead>
                  <TableHead className={HEAD}>状態</TableHead>
                  <TableHead className={HEAD}>出勤</TableHead>
                  <TableHead className={HEAD}>退勤</TableHead>
                  <TableHead className={HEAD}>休憩</TableHead>
                  <TableHead className={`${HEAD} text-end`}>実働</TableHead>
                  <TableHead className={HEAD}>備考</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employee.days.map((d) => (
                  <TableRow key={d.date}>
                    <TableCell className={`${CELL} text-xs whitespace-nowrap tabular-nums`}>
                      {d.date}（{d.weekday}）
                    </TableCell>
                    <TableCell className={CELL}>
                      <StatusBadge status={d.status} />
                    </TableCell>
                    <TableCell className={`${CELL} tabular-nums`}>{d.clockIn}</TableCell>
                    <TableCell className={`${CELL} tabular-nums`}>{d.clockOut}</TableCell>
                    <TableCell
                      className={`${CELL} text-muted-foreground inline-flex items-center gap-1 tabular-nums`}
                    >
                      <Coffee className="size-3.5" aria-hidden="true" />
                      {d.break}
                    </TableCell>
                    <TableCell className={`${CELL} text-end font-medium tabular-nums`}>
                      {d.work}
                    </TableCell>
                    <TableCell className={`${CELL} text-muted-foreground text-xs`}>
                      {d.note ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Flex direction="row" gap="sm">
          <Button size="sm" variant="outline">
            勤怠詳細を開く
          </Button>
          <Button size="sm">承認する</Button>
        </Flex>
      </Flex>
    </div>
  );
}

// ── Master list with exclusive expandable rows ─────────────────────────────────

const COLSPAN = 6; // toggle + 従業員 + 部署 + 直近 + 出勤日数 + 残業

function ExpandableList() {
  // Exclusive open: a single id (or null) — opening one collapses any other.
  const [openId, setOpenId] = React.useState<string | null>("E-1043");

  const toggle = (id: string) => {
    setOpenId((cur) => (cur === id ? null : id));
  };

  return (
    <Table>
      <TableHeader className="bg-secondary sticky top-0 z-10">
        <TableRow>
          <TableHead className={`${HEAD} w-10`} aria-label="展開" />
          <TableHead className={HEAD}>従業員</TableHead>
          <TableHead className={HEAD}>部署</TableHead>
          <TableHead className={`${HEAD} text-center`}>直近の状態</TableHead>
          <TableHead className={`${HEAD} text-end`}>出勤日数</TableHead>
          <TableHead className={`${HEAD} text-end`}>残業 累計</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {EMPLOYEES.map((emp) => {
          const isOpen = openId === emp.id;
          const panelId = `kintai-detail-${emp.id}`;
          return (
            <React.Fragment key={emp.id}>
              <TableRow
                data-state={isOpen ? "selected" : undefined}
                tabIndex={0}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => {
                  toggle(emp.id);
                }}
                onKeyDown={(e) => {
                  if (e.key !== "Enter" && e.key !== " ") return;
                  if (e.target !== e.currentTarget) return;
                  e.preventDefault();
                  toggle(emp.id);
                }}
                className="hover:bg-muted/50 focus-visible:ring-ring cursor-pointer focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset"
              >
                <TableCell className={CELL}>
                  <ChevronRight
                    className={`text-muted-foreground size-4 transition-transform ${isOpen ? "rotate-90" : ""}`}
                    aria-hidden="true"
                  />
                </TableCell>
                <TableCell className={CELL}>
                  <Text as="div" weight="medium">
                    {emp.name}
                  </Text>
                  <Text as="div" size="xs" tone="muted" tabular>
                    {emp.id} · No.{emp.code}
                  </Text>
                </TableCell>
                <TableCell className={`${CELL} text-muted-foreground`}>{emp.dept}</TableCell>
                <TableCell className={`${CELL} text-center`}>
                  <StatusBadge status={emp.status} />
                </TableCell>
                <TableCell className={`${CELL} text-end tabular-nums`}>{emp.workDays}</TableCell>
                <TableCell className={`${CELL} text-end tabular-nums`}>{emp.overtime}</TableCell>
              </TableRow>
              {isOpen && (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={COLSPAN} className="p-0" id={panelId}>
                    <DetailPanel employee={emp} />
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          );
        })}
      </TableBody>
    </Table>
  );
}

export default function Demo() {
  return (
    <PageContainer
      title="展開行"
      subtitle="行クリックでインライン詳細を展開 · 排他トグル（同時に開くのは 1 行のみ）"
      density="compact"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>従業員の勤怠（今週）</CardTitle>
            <Text size="xs" tone="muted" tabular>
              4 名 · 06/04 時点
            </Text>
          </CardHeader>
          <CardContent flush>
            <ExpandableList />
          </CardContent>
        </Card>

        <Text as="p" size="xs" tone="muted">
          行を選択すると直下に詳細パネル（左罫線 3px
          primary）が開きます。別の行を開くと前の行は自動的に閉じます。 キーボードでは行に Tab
          で移動し、Enter / Space で開閉できます。
        </Text>
      </Flex>
    </PageContainer>
  );
}
