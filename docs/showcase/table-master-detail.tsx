/**
 * Showcase · table-master-detail — マスター詳細 (V20)
 *
 * Gmail-style master/detail split: a master DataTable (left) drives a detail
 * pane (right). Selecting a row updates the pane with that 従業員's full record.
 * The split is RESIZABLE — built on @godxjp/ui ResizablePanelGroup, so the
 * operator can widen the list when scanning or the detail when reviewing.
 *
 * Composition map (intent → real @godxjp/ui primitive):
 *   resizable split ........ ResizablePanelGroup + ResizablePanel + ResizableHandle
 *   master list ............ DataTable (compact, clickable rows, selected row)
 *   status cell ............ Badge tone (出勤/遅刻/早退/休暇 — fixed signaling)
 *   detail header .......... Avatar + heading + Badge + action Buttons
 *   detail metadata ........ Descriptions (replaces hand-rolled <dl>)
 *   打刻 history ............ Timeline
 *   empty (nothing picked) . EmptyState (inside the pane)
 *
 * The narrow-viewport fallback (no room for a side pane) is shown too: the same
 * data rendered as a single master DataTable with the detail stacked under it.
 *
 * DNA: compact density, tabular-nums on times/numbers, small headings, fixed
 * color signaling (success 若竹 / warning 山吹 / attention 朱 / info 群青),
 * quiet JP copy, no emoji.
 */
import * as React from "react";
import { Check, Clock, Pencil, UserRound } from "lucide-react";

import { Button, Text } from "@godxjp/ui/general";
import {
  Avatar,
  AvatarFallback,
  Badge,
  type BadgeProps,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  type ColumnDef,
  DataTable,
  Descriptions,
  EmptyState,
  Timeline,
  type TimelineItem,
} from "@godxjp/ui/data-display";
import {
  Flex,
  PageContainer,
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  Separator,
} from "@godxjp/ui/layout";

type BadgeTone = NonNullable<BadgeProps["tone"]>;

// ── Domain model ───────────────────────────────────────────────────────────

type AttendanceStatus = "present" | "late" | "early" | "leave";

type Employee = {
  id: string;
  code: string;
  name: string;
  kana: string;
  dept: string;
  role: string;
  status: AttendanceStatus;
  clockIn: string; // HH:mm or "—"
  clockOut: string;
  workedMin: number; // worked minutes today
  email: string;
  shift: string;
  manager: string;
  joined: string;
  punches: TimelineItem[];
};

const STATUS_LABEL: Record<AttendanceStatus, string> = {
  present: "出勤",
  late: "遅刻",
  early: "早退",
  leave: "休暇",
};

// Fixed color signaling — present 若竹 / late 朱(attention via destructive-adjacent? no:
// lateness is non-destructive → warning 山吹 is reserved for pending; we use the
// attention reading by tone "destructive" only for hard violations). Here:
//   present → success, late → warning, early → info, leave → muted.
const STATUS_TONE: Record<AttendanceStatus, BadgeTone> = {
  present: "success",
  late: "warning",
  early: "info",
  leave: "muted",
};

const EMPLOYEES: Employee[] = [
  {
    id: "E-1042",
    code: "1042",
    name: "佐藤 健",
    kana: "サトウ ケン",
    dept: "製造一課",
    role: "ライン主任",
    status: "present",
    clockIn: "08:58",
    clockOut: "—",
    workedMin: 392,
    email: "sato.ken@example.co.jp",
    shift: "日勤 09:00–18:00",
    manager: "田中 浩二",
    joined: "2019-04-01",
    punches: [
      { title: "出勤打刻", time: "08:58", note: "正門ゲート" },
      { title: "休憩開始", time: "12:00" },
      { title: "休憩終了", time: "12:45", current: true },
    ],
  },
  {
    id: "E-1043",
    code: "1043",
    name: "鈴木 美咲",
    kana: "スズキ ミサキ",
    dept: "品質保証課",
    role: "検査員",
    status: "late",
    clockIn: "09:24",
    clockOut: "—",
    workedMin: 356,
    email: "suzuki.misaki@example.co.jp",
    shift: "日勤 09:00–18:00",
    manager: "高橋 由美",
    joined: "2021-10-01",
    punches: [
      { title: "出勤打刻", time: "09:24", note: "遅刻 24分 — 電車遅延届あり" },
      { title: "休憩開始", time: "12:10" },
      { title: "休憩終了", time: "12:55", current: true },
    ],
  },
  {
    id: "E-1044",
    code: "1044",
    name: "高橋 大悟",
    kana: "タカハシ ダイゴ",
    dept: "製造二課",
    role: "オペレーター",
    status: "early",
    clockIn: "08:55",
    clockOut: "16:30",
    workedMin: 415,
    email: "takahashi.daigo@example.co.jp",
    shift: "日勤 09:00–18:00",
    manager: "田中 浩二",
    joined: "2018-04-01",
    punches: [
      { title: "出勤打刻", time: "08:55" },
      { title: "休憩終了", time: "12:50" },
      { title: "早退打刻", time: "16:30", note: "私用早退届 承認済み", current: true },
    ],
  },
  {
    id: "E-1045",
    code: "1045",
    name: "渡辺 葵",
    kana: "ワタナベ アオイ",
    dept: "物流課",
    role: "出荷担当",
    status: "leave",
    clockIn: "—",
    clockOut: "—",
    workedMin: 0,
    email: "watanabe.aoi@example.co.jp",
    shift: "有給休暇",
    manager: "高橋 由美",
    joined: "2022-04-01",
    punches: [{ title: "有給休暇 取得", time: "終日", note: "事前申請 承認済み", current: true }],
  },
  {
    id: "E-1046",
    code: "1046",
    name: "伊藤 翔",
    kana: "イトウ ショウ",
    dept: "製造一課",
    role: "ライン作業",
    status: "present",
    clockIn: "08:51",
    clockOut: "—",
    workedMin: 401,
    email: "ito.sho@example.co.jp",
    shift: "日勤 09:00–18:00",
    manager: "田中 浩二",
    joined: "2020-07-01",
    punches: [
      { title: "出勤打刻", time: "08:51" },
      { title: "休憩開始", time: "12:05" },
      { title: "休憩終了", time: "12:50", current: true },
    ],
  },
  {
    id: "E-1047",
    code: "1047",
    name: "山本 麻衣",
    kana: "ヤマモト マイ",
    dept: "品質保証課",
    role: "主任検査員",
    status: "present",
    clockIn: "08:47",
    clockOut: "—",
    workedMin: 408,
    email: "yamamoto.mai@example.co.jp",
    shift: "日勤 09:00–18:00",
    manager: "高橋 由美",
    joined: "2017-04-01",
    punches: [
      { title: "出勤打刻", time: "08:47" },
      { title: "休憩開始", time: "11:55" },
      { title: "休憩終了", time: "12:40", current: true },
    ],
  },
];

// ── Formatting helpers ──────────────────────────────────────────────────────

function fmtWorked(min: number): string {
  if (min === 0) return "—";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}時間${String(m).padStart(2, "0")}分`;
}

function initials(name: string): string {
  // First character of the family name as a compact avatar fallback.
  return name.trim().charAt(0);
}

// ── Master columns ──────────────────────────────────────────────────────────

const columns: ColumnDef<Employee>[] = [
  {
    key: "name",
    header: "従業員",
    render: (row) => (
      <div className="min-w-0">
        <Text as="div" size="sm" weight="medium" truncate>
          {row.name}
        </Text>
        <Text as="div" size="2xs" tone="muted" truncate>
          {row.dept} · {row.role}
        </Text>
      </div>
    ),
  },
  {
    key: "status",
    header: "状態",
    align: "center",
    width: "w-24",
    render: (row) => (
      <Badge tone={STATUS_TONE[row.status]} variant="outline">
        {STATUS_LABEL[row.status]}
      </Badge>
    ),
  },
  {
    key: "clockIn",
    header: "出勤",
    align: "right",
    width: "w-20",
    hiddenOnMobile: true,
    render: (row) => <Text tabular>{row.clockIn}</Text>,
  },
];

// ── Detail pane ─────────────────────────────────────────────────────────────

function EmployeeDetail({ employee }: { employee: Employee }) {
  return (
    <Flex direction="col" gap="lg">
      {/* Header: identity + status + primary actions */}
      <Flex direction="row" align="center" justify="between" gap="md" wrap>
        <Flex direction="row" align="center" gap="md">
          <Avatar>
            <AvatarFallback>{initials(employee.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <Flex direction="row" align="center" gap="sm" wrap>
              <h2 className="text-base font-bold">{employee.name}</h2>
              <Badge tone={STATUS_TONE[employee.status]} variant="outline">
                {STATUS_LABEL[employee.status]}
              </Badge>
            </Flex>
            <Text as="div" size="xs" tone="muted">
              {employee.kana} · {employee.id}
            </Text>
          </div>
        </Flex>
        <Flex direction="row" gap="sm">
          <Button variant="outline" size="sm">
            <Pencil aria-hidden="true" />
            編集
          </Button>
          <Button size="sm">
            <Check aria-hidden="true" />
            承認
          </Button>
        </Flex>
      </Flex>

      <Separator />

      {/* Metadata grid */}
      <Descriptions columns={2}>
        <Descriptions.Item label="社員番号" mono>
          {employee.code}
        </Descriptions.Item>
        <Descriptions.Item label="部署">{employee.dept}</Descriptions.Item>
        <Descriptions.Item label="役割">{employee.role}</Descriptions.Item>
        <Descriptions.Item label="上長">{employee.manager}</Descriptions.Item>
        <Descriptions.Item label="シフト" span={2}>
          {employee.shift}
        </Descriptions.Item>
        <Descriptions.Item label="出勤">
          <Text tabular>{employee.clockIn}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="退勤">
          <Text tabular>{employee.clockOut}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="実労働">
          <Text tabular>{fmtWorked(employee.workedMin)}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="入社日">
          <Text tabular>{employee.joined}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="メール" span={2} mono>
          {employee.email}
        </Descriptions.Item>
      </Descriptions>

      <Separator />

      {/* Punch history */}
      <Flex direction="col" gap="sm">
        <Flex direction="row" align="center" gap="sm">
          <Clock className="text-muted-foreground size-4" aria-hidden="true" />
          <Text weight="medium">本日の打刻</Text>
        </Flex>
        <Timeline items={employee.punches} />
      </Flex>
    </Flex>
  );
}

// ── Showcase ────────────────────────────────────────────────────────────────

export default function Demo() {
  // Pre-select a row at rest so the master/detail link is visible without
  // clicking (the late employee — the case an operator would inspect).
  const [selectedId, setSelectedId] = React.useState<string>("E-1043");

  const selected = EMPLOYEES.find((e) => e.id === selectedId) ?? null;

  return (
    <PageContainer
      title="勤怠 マスター詳細"
      subtitle="一覧で従業員を選ぶと右ペインに当日の勤怠が表示されます · 分割は可変幅"
      density="compact"
    >
      <Flex direction="col" gap="lg">
        {/* ── Resizable master/detail split (Gmail-style) ── */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>本日の出勤状況</CardTitle>
            <Text size="xs" tone="muted" tabular>
              2026-06-04 · {EMPLOYEES.length}名
            </Text>
          </CardHeader>
          <CardContent flush>
            <ResizablePanelGroup direction="horizontal" className="min-h-[460px]">
              {/* Master list */}
              <ResizablePanel defaultSize={42} minSize={28}>
                <DataTable
                  data={EMPLOYEES}
                  columns={columns}
                  getRowId={(row) => row.id}
                  density="compact"
                  selected={selected ? new Set([selected.id]) : new Set()}
                  onRowClick={(row) => {
                    setSelectedId(row.id);
                  }}
                />
              </ResizablePanel>

              <ResizableHandle />

              {/* Detail pane */}
              <ResizablePanel defaultSize={58} minSize={34}>
                <div className="h-full overflow-auto p-5">
                  {selected ? (
                    <EmployeeDetail employee={selected} />
                  ) : (
                    <Flex direction="col" align="center" justify="center" className="h-full">
                      <EmptyState
                        icon={UserRound}
                        title="従業員を選択してください"
                        description="左の一覧から行を選ぶと、ここに当日の勤怠が表示されます。"
                      />
                    </Flex>
                  )}
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </CardContent>
        </Card>

        {/* ── Empty detail state (nothing selected) ── */}
        <Card>
          <CardHeader>
            <CardTitle>未選択の状態</CardTitle>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="lg" align="start" className="lg:flex-row lg:items-start">
              <div className="w-full lg:w-56 lg:shrink-0">
                <DataTable
                  data={EMPLOYEES.slice(0, 3)}
                  columns={columns}
                  getRowId={(row) => row.id}
                  density="compact"
                  onRowClick={() => {}}
                />
              </div>
              <Separator className="lg:hidden" />
              <Separator orientation="vertical" className="hidden self-stretch lg:block" />
              <div className="w-full flex-1 rounded-md border border-dashed p-8">
                <EmptyState
                  icon={UserRound}
                  title="従業員を選択してください"
                  description="一覧から行を選ぶと詳細が表示されます。"
                />
              </div>
            </Flex>
          </CardContent>
        </Card>

        {/* ── Narrow fallback: stacked list + detail (no side room) ── */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>狭幅レイアウト（縦積み）</CardTitle>
            <Text size="xs" tone="muted">
              サイドペインが取れない幅では一覧の下に詳細を重ねます
            </Text>
          </CardHeader>
          <CardContent flush>
            <DataTable
              data={EMPLOYEES.slice(0, 4)}
              columns={columns}
              getRowId={(row) => row.id}
              density="compact"
              selected={new Set(["E-1042"])}
              onRowClick={() => {}}
            />
            <Separator />
            <div className="p-5">
              <EmployeeDetail employee={EMPLOYEES[0]} />
            </div>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
