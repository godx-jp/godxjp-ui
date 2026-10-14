/**
 * Showcase · table-master-detail — マスター詳細 (V20) · the DETAIL exemplar (DESIGN.md "Detail")
 *
 * Gmail-style master/detail: a master DataTable on the fixed rail drives the record on the
 * fluid side. Selecting a row updates the record. One Card is the only boundary (the split);
 * the record inside it is sections, not Cards.
 *
 * Composition map (intent → real @godxjp/ui primitive):
 *   split .................. MasterDetail (tokenized rail; stacks 一覧 → 詳細 below `md`)
 *   master list ............ DataTable (compact, clickable rows, selected row)
 *   status cell ............ Badge tone (出勤/遅刻/早退/休暇 — fixed signaling)
 *   detail header .......... Avatar + Heading + status Badge + actions (one primary)
 *   detail metadata ........ Descriptions (replaces hand-rolled <dl>)
 *   打刻 history ............ Heading + Timeline (no icon beside the heading)
 *   empty (nothing picked) . EmptyState: one sentence, no icon
 *
 * DNA: compact density, tabular-nums on times/numbers, small headings, fixed
 * color signaling (success 若竹 / warning 山吹 / attention 朱 / info 群青),
 * quiet JP copy, no emoji.
 */
import * as React from "react";
import { Check, Pencil } from "lucide-react";

import { Button, Heading, Text } from "@godxjp/ui/general";
import {
  Avatar,
  AvatarFallback,
  Badge,
  Card,
  CardContent,
  DataTable,
  Descriptions,
  EmptyState,
  Timeline,
  type BadgeProps,
  type ColumnDef,
  type TimelineItem,
} from "@godxjp/ui/data-display";
import { Flex, MasterDetail, PageContainer, Separator } from "@godxjp/ui/layout";

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
      { title: "出勤打刻", time: "09:24", note: "遅刻 24分 · 電車遅延届あり" },
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
              <Heading level={2}>{employee.name}</Heading>
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
        <Heading level={3}>本日の打刻</Heading>
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
      title="本日の勤怠"
      subtitle={`2026-06-04 · ${EMPLOYEES.length}名`}
      density="compact"
    >
      {/* One boundary: the split itself. The list sits on the fixed rail, the record is fluid,
          and below `md` MasterDetail stacks 一覧 → 詳細 — no second "narrow layout" demo. */}
      <Card>
        <CardContent flush>
          <MasterDetail
            rail="master"
            railWidth="wide"
            collapseBelow="md"
            masterLabel="従業員一覧"
            detailLabel="従業員の詳細"
            master={
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
            }
          >
            <CardContent solo>
              {selected ? (
                <EmployeeDetail employee={selected} />
              ) : (
                <EmptyState
                  variant="section"
                  title="従業員を選択してください"
                  description="一覧から行を選ぶと詳細が表示されます。"
                />
              )}
            </CardContent>
          </MasterDetail>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
