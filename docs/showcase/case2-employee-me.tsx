/**
 * Showcase · case2 — 従業員ダッシュボード (/me)
 *
 * The employee self-service home (`/me/dashboard`), built ENTIRELY from real
 * @godxjp/ui primitives. dxs-kintai design handoff recreated as a "skeleton"
 * (intent + look), not a transcription of its prototype DOM.
 *
 * Composition map (prototype block → @godxjp/ui primitive):
 *   page chrome ............ AppShell + Sidebar + Topbar slots
 *   page header + status ... PageContainer (extra slot) + Badge(tone)
 *   PunchCard FSM .......... Card + Button + Badge(tone) + Alert — renders ONLY
 *                            the valid actions for the current session state
 *                            (Off → Working → Break → Closed); checkout locked
 *                            on break shown via Alert tone="warning".
 *   month KPI 2×2 .......... ResponsiveGrid + StatCard (tabular value + delta)
 *   7-day attendance ....... Card + Table + Badge(tone), tabular-nums
 *   today summary .......... Card + Descriptions-style key/value rows
 *
 * DNA applied: default density (comfortable touch on the punch buttons where
 * tapped), small headings, fixed color signaling (success 若竹 / warning 山吹 /
 * attention 朱 / info 群青), tabular numerics, bilingual JP·VI labels on the
 * shared employee surface, quiet factual copy, no emoji.
 */
import * as React from "react";
import {
  CalendarDays,
  ClipboardList,
  Clock,
  Coffee,
  LayoutDashboard,
  LogIn,
  MapPin,
  RotateCcw,
  Settings,
  Square,
} from "lucide-react";

import { Button, Text } from "@godxjp/ui/general";
import { Alert, AlertDescription, AlertTitle } from "@godxjp/ui/feedback";
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
import {
  AppShell,
  Flex,
  PageContainer,
  ResponsiveGrid,
  Sidebar,
  type SidebarSectionProp,
} from "@godxjp/ui/layout";

/** Badge tone vocabulary (derive from BadgeProps — not separately re-exported). */
type BadgeTone = NonNullable<BadgeProps["tone"]>;

// ── /me sidebar (single section — the employee surface is minimal) ────────────

const NAV_SECTIONS: SidebarSectionProp[] = [
  {
    label: "マイページ",
    items: [
      { id: "dashboard", label: "ダッシュボード", icon: LayoutDashboard },
      { id: "my-shifts", label: "マイシフト", icon: CalendarDays },
      { id: "timesheet", label: "勤怠表", icon: ClipboardList },
      { id: "settings", label: "設定", icon: Settings },
    ],
  },
];

// ── Punch FSM ─────────────────────────────────────────────────────────────────
//
// The cardinal kintai UX rule: render ONLY the actions valid for the current
// session state — never four disabled buttons. State derives from the last punch
// log (CheckIn / BreakStart / BreakEnd / CheckOut).

type PunchState = "off" | "working" | "break" | "closed";

const PUNCH_STATUS: Record<
  PunchState,
  { label: string; tone: Extract<BadgeTone, "success" | "warning" | "neutral">; meta: string }
> = {
  off: { label: "未出勤 · Chưa chấm công", tone: "neutral", meta: "本日の打刻はまだありません" },
  working: {
    label: "勤務中 · Đang làm",
    tone: "success",
    meta: "出勤 09:30 · 渋谷店 · 経過 4時間12分",
  },
  break: { label: "休憩中 · Nghỉ giải lao", tone: "warning", meta: "休憩開始 13:48 · 経過 12分" },
  closed: {
    label: "退勤済 · Đã tan ca",
    tone: "neutral",
    meta: "09:30 → 18:12 · 休憩 24分 · 残業 0時間",
  },
};

/** A punch button descriptor. `comfortable` density floors these at the 44px touch target. */
type PunchAction = {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  variant: NonNullable<React.ComponentProps<typeof Button>["variant"]>;
  next: PunchState;
};

const PUNCH_ACTIONS: Record<PunchState, PunchAction[]> = {
  off: [{ key: "in", label: "出勤 · Check In", icon: LogIn, variant: "default", next: "working" }],
  working: [
    {
      key: "break-start",
      label: "休憩開始 · Nghỉ",
      icon: Coffee,
      variant: "outline",
      next: "break",
    },
    { key: "out", label: "退勤 · Check Out", icon: Square, variant: "destructive", next: "closed" },
  ],
  break: [
    {
      key: "break-end",
      label: "休憩終了 · Kết thúc nghỉ",
      icon: RotateCcw,
      variant: "default",
      next: "working",
    },
  ],
  closed: [],
};

function PunchCard() {
  // Seeded "working" so the open/active state is visible at rest (no click needed).
  const [state, setState] = React.useState<PunchState>("working");
  const [clock, setClock] = React.useState("13:42");
  const status = PUNCH_STATUS[state];
  const actions = PUNCH_ACTIONS[state];

  // The defining behaviour: on break, Check Out is locked until the break ends.
  const checkoutLocked = state === "break";

  return (
    <Card density="cozy" className="self-start" accent={state === "break" ? "warning" : undefined}>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle className="whitespace-nowrap">打刻 · Chấm công</CardTitle>
        <Badge tone={status.tone} variant="outline" className="whitespace-nowrap">
          {status.label}
        </Badge>
      </CardHeader>
      <CardContent>
        <Flex direction="col" gap="md">
          {/* Big tabular clock — the signature employee block. */}
          <div>
            {/* Hero numeral at the system's max step (2xl) — the golden scale tops here by design. */}
            <Text as="div" size="2xl" weight="bold" tabular className="leading-none">
              {clock}
            </Text>
            <Text as="div" size="sm" tone="muted" className="mt-1">
              {status.meta}
            </Text>
          </div>

          {/* Checkout-locked notice (attention, not destructive — it's a fixable hold). */}
          {checkoutLocked ? (
            <Alert tone="warning">
              <AlertTitle>退勤は休憩終了後 · Check Out đang khoá</AlertTitle>
              <AlertDescription>
                休憩中は退勤できません。先に「休憩終了」を打刻してください。
              </AlertDescription>
            </Alert>
          ) : null}

          {/* Valid actions only — comfortable density floors each button at 44px (touch). */}
          {state === "closed" ? (
            <div className="ui-density-comfortable">
              <Button variant="outline" disabled className="w-full">
                <Clock aria-hidden="true" />
                本日の勤務は完了 · Đã hoàn thành
              </Button>
            </div>
          ) : (
            <Flex direction="col" gap="sm">
              <div className="ui-density-comfortable grid grid-cols-1 gap-2 sm:grid-cols-2">
                {actions.map((a) => {
                  const Icon = a.icon;
                  return (
                    <Button
                      key={a.key}
                      variant={a.variant}
                      className="w-full"
                      onClick={() => {
                        setState(a.next);
                        if (a.next === "closed") setClock("18:12");
                      }}
                    >
                      <Icon aria-hidden="true" />
                      {a.label}
                    </Button>
                  );
                })}
              </div>
            </Flex>
          )}

          {/* Geofence caption — the documented punch footer line. */}
          <Flex direction="row" align="center" gap="xs">
            <MapPin className="text-muted-foreground size-3.5 shrink-0" aria-hidden="true" />
            <Text size="2xs" tone="muted" tabular>
              位置情報: 渋谷店 (35.659, 139.700) · 134m
            </Text>
          </Flex>

          {/* Demo state stepper — lets a reader walk every FSM state at rest. */}
          <Flex direction="row" wrap gap="xs" className="border-t pt-3">
            <Text size="2xs" tone="muted" className="mr-1 self-center">
              状態:
            </Text>
            {(["off", "working", "break", "closed"] as PunchState[]).map((s) => (
              <Button
                key={s}
                variant={s === state ? "secondary" : "ghost"}
                size="xs"
                onClick={() => {
                  setState(s);
                  setClock(s === "closed" ? "18:12" : "13:42");
                }}
              >
                {PUNCH_STATUS[s].label.split(" · ")[0]}
              </Button>
            ))}
          </Flex>
        </Flex>
      </CardContent>
    </Card>
  );
}

// ── Month KPI 2×2 ──────────────────────────────────────────────────────────────

const KPIS: Array<{
  label: string;
  value: string;
  hint: string;
  delta?: string;
  inverse?: boolean;
}> = [
  { label: "勤務時間 · Giờ làm", value: "96.5h", hint: "計画 168h · 達成 57%", delta: "+2.0h" },
  { label: "残業 · Overtime", value: "4.2h", hint: "先月比", delta: "-1.8h", inverse: true },
  { label: "出勤日数 · Ngày đi làm", value: "13", hint: "22営業日中" },
  { label: "遅刻 · Đến trễ", value: "1", hint: "12分 · 5/7", delta: "+1", inverse: true },
];

// ── 7-day attendance ────────────────────────────────────────────────────────────

type DayStatus = "present" | "late" | "leave" | "holiday";

const STATUS_DEF: Record<
  DayStatus,
  { label: string; tone: BadgeTone; variant: BadgeProps["variant"] }
> = {
  present: { label: "通常 · Bình thường", tone: "success", variant: "outline" },
  late: { label: "遅刻 · Đến trễ", tone: "warning", variant: "outline" },
  leave: { label: "有給 · Nghỉ phép", tone: "info", variant: "outline" },
  holiday: { label: "休日 · Nghỉ", tone: "neutral", variant: "outline" },
};

const DAYS: Array<{
  date: string;
  weekday: string;
  work: string;
  ot: string;
  status: DayStatus;
}> = [
  { date: "5/08", weekday: "木", work: "8.0h", ot: "0.0h", status: "present" },
  { date: "5/07", weekday: "水", work: "8.5h", ot: "0.5h", status: "present" },
  { date: "5/06", weekday: "火", work: "7.7h", ot: "0.0h", status: "late" },
  { date: "5/05", weekday: "月", work: "—", ot: "—", status: "holiday" },
  { date: "5/04", weekday: "日", work: "—", ot: "—", status: "holiday" },
  { date: "5/03", weekday: "土", work: "—", ot: "—", status: "leave" },
  { date: "5/02", weekday: "金", work: "8.2h", ot: "1.0h", status: "present" },
];

// ── Today summary ────────────────────────────────────────────────────────────────

const SUMMARY: Array<{ label: string; value: string }> = [
  { label: "シフト · Ca", value: "早番 09:00–18:00" },
  { label: "出勤 · Check In", value: "09:30" },
  { label: "休憩 · Nghỉ", value: "12:00–12:24 (24分)" },
  { label: "退勤予定 · Dự kiến", value: "18:00" },
  { label: "勤務地 · Nơi làm", value: "渋谷店" },
];

export default function EmployeeMeShowcase() {
  const [activeNav, setActiveNav] = React.useState("dashboard");

  const sidebar = (
    <Sidebar
      activeId={activeNav}
      onSelect={setActiveNav}
      sections={NAV_SECTIONS}
      product={{ name: "dxs-kintai", role: "田中 美咲 · 渋谷店" }}
    />
  );

  return (
    <AppShell
      sidebar={sidebar}
      topbarLeft={<Text as="strong">マイページ</Text>}
      topbarRight={
        <Flex direction="row" align="center" gap="sm">
          <Badge tone="success" variant="outline" className="whitespace-nowrap">
            勤務中 · 4時間12分
          </Badge>
          <Text size="xs" tone="muted" tabular className="hidden sm:inline">
            2026年5月8日 · 木曜日
          </Text>
        </Flex>
      }
    >
      <PageContainer title="ダッシュボード" subtitle="田中 美咲 · 渋谷店 · 5月度" density="default">
        <Flex direction="col" gap="lg">
          {/* Punch (left) + month KPI 2×2 (right) — stack <lg, side-by-side ≥lg */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:items-start">
            <div className="lg:col-span-1">
              <PunchCard />
            </div>

            <div className="lg:col-span-2">
              <ResponsiveGrid columns={{ sm: 1, md: 2, lg: 2 }}>
                {KPIS.map((k) => (
                  <StatCard
                    key={k.label}
                    label={k.label}
                    value={k.value}
                    hint={k.hint}
                    delta={k.delta}
                    inverse={k.inverse}
                  />
                ))}
              </ResponsiveGrid>
            </div>
          </div>

          {/* 7-day attendance (left, wide) + today summary (right) */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:items-start">
            <Card className="self-start lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between gap-3">
                <CardTitle className="whitespace-nowrap">最近7日 · 7 ngày gần nhất</CardTitle>
                <Text size="xs" tone="muted" className="whitespace-nowrap">
                  勤務 47.4h · 残業 1.5h
                </Text>
              </CardHeader>
              <CardContent flush>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">日付</TableHead>
                      <TableHead className="text-right whitespace-nowrap">勤務</TableHead>
                      <TableHead className="text-right whitespace-nowrap">残業</TableHead>
                      <TableHead className="whitespace-nowrap">状態</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {DAYS.map((d) => {
                      const def = STATUS_DEF[d.status];
                      return (
                        <TableRow key={d.date}>
                          <TableCell className="whitespace-nowrap tabular-nums">
                            {d.date}
                            <Text tone="muted" className="ml-1.5">
                              ({d.weekday})
                            </Text>
                          </TableCell>
                          <TableCell className="text-right tabular-nums">{d.work}</TableCell>
                          <TableCell className="text-right tabular-nums">{d.ot}</TableCell>
                          <TableCell>
                            <Badge
                              tone={def.tone}
                              variant={def.variant}
                              className="whitespace-nowrap"
                            >
                              {def.label}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="self-start lg:col-span-1">
              <CardHeader>
                <CardTitle className="whitespace-nowrap">本日のサマリー · Hôm nay</CardTitle>
              </CardHeader>
              <CardContent flush>
                <dl className="divide-border divide-y">
                  {SUMMARY.map((s) => (
                    <div
                      key={s.label}
                      className="flex items-center justify-between gap-3 px-4 py-2.5"
                    >
                      <Text as="dt" size="sm" tone="muted" className="whitespace-nowrap">
                        {s.label}
                      </Text>
                      <Text as="dd" size="sm" weight="medium" align="end" tabular>
                        {s.value}
                      </Text>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>
          </div>
        </Flex>
      </PageContainer>
    </AppShell>
  );
}
