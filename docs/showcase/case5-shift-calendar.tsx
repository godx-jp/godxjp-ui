/**
 * Showcase · case5 — Shift Calendar (シフトカレンダー)
 *
 * A standalone shift-scheduling screen, served at `/showcase/case5-shift-calendar`.
 * Built ENTIRELY from real @godxjp/ui primitives — the reference-design
 * `admin/[brandSlug]/employee-shifts/calendar` surface recreated as a "skeleton"
 * (intent + look), not a transcription of `comp-calendar.html`.
 *
 * Composition map (prototype block → @godxjp/ui primitive):
 *   page chrome ............. AppShell + Sidebar + Topbar
 *   page header + nav ....... PageContainer (extra slot) + Button + ToggleGroup (月/週/日)
 *   month jump-to ........... Calendar (date-picker) inside a Popover
 *   month event grid ........ Card + Table bordered (one <tr> per week, one <td> per day)
 *   week time-axis + now-line  Card + TimelineGrid (hour axis, day columns, `now` marker)
 *   day staff×time .......... Card + Timeline (per-staff lane) + EmptyState (understaffed)
 *   shift legend ............ Card + the wa-iro decorative palette swatches
 *   date detail (mobile) .... Sheet (master-detail collapses to a drawer < lg)
 *
 * The two grids each take the primitive that fits their shape. A MONTH is a day matrix, so it is
 * a real `Table`. A WEEK is a continuous time axis, so it is `TimelineGrid` — which also places
 * the 木曜 早番/遅番 pair side by side instead of stacking one on top of the other, and clips the
 * 夜勤 22:00–06:00 at the 24:00 edge while the block still prints its real range. `Calendar` keeps
 * its genuine job: a single-date PICKER for jumping to a month.
 *
 * DNA applied: compact density, small headings (20/18/14/13), fixed color signaling
 * (success 若竹 / warning 山吹 / info 群青 / attention 朱 / danger 茜), tabular-nums,
 * wa-iro DECORATIVE palette for the 7 shift types (never remapped to a semantic role),
 * quiet factual JP copy, 1px-border cards with no rest shadow, no emoji.
 */
import * as React from "react";
import {
  CalendarDays,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Clock3,
  LayoutDashboard,
  Plus,
  CalendarClock,
  Users,
  AlertTriangle,
  CalendarCheck,
} from "lucide-react";

import { Button, Text } from "@godxjp/ui/general";
import {
  Badge,
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  ListRow,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Timeline,
  TimelineGrid,
  type TimelineGridColumnProp,
  type TimelineGridEventProp,
  type TimelineItem,
} from "@godxjp/ui/data-display";
import { Calendar, ToggleGroup, ToggleGroupItem } from "@godxjp/ui/data-entry";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@godxjp/ui/feedback";
import {
  AppShell,
  Flex,
  PageContainer,
  ResponsiveGrid,
  Sidebar,
  type SidebarSectionProp,
} from "@godxjp/ui/layout";

// ── Shift-type palette ────────────────────────────────────────────────────────
// The 7-color shift palette uses wa-iro DECORATIVE tokens (charts/tags/tenant) —
// never a semantic role. Each pill carries a 2px left accent border + soft tint,
// exactly as `comp-calendar.html` (.sh) specified.
type ShiftKind = "early" | "late" | "night" | "tsushi" | "ot" | "leave" | "holiday";

const SHIFT_META: Record<
  ShiftKind,
  { label: string; time: string; cssVar: string; muted?: boolean }
> = {
  early: { label: "早番", time: "09:00–17:30", cssVar: "--primary" },
  late: { label: "遅番", time: "13:00–22:00", cssVar: "--wa-gunjo" },
  night: { label: "夜勤", time: "22:00–06:00", cssVar: "--wa-kon" },
  tsushi: { label: "通し", time: "09:00–22:00", cssVar: "--wa-wakatake" },
  ot: { label: "残業", time: "OT", cssVar: "--wa-shu" },
  leave: { label: "休 / 有給", time: "終日", cssVar: "--wa-nezu", muted: true },
  holiday: { label: "祝日", time: "終日", cssVar: "--wa-akane" },
};

/** A shift pill — soft tint + 2px left accent, from a decorative wa-iro token. */
function ShiftPill({
  kind,
  staff,
  className,
}: {
  kind: ShiftKind;
  staff?: string;
  className?: string;
}) {
  const meta = SHIFT_META[kind];
  return (
    <Badge
      data-shift={kind}
      color={`var(${meta.cssVar})`}
      shape="sharp"
      className={`truncate leading-tight ${className ?? ""}`}
      title={`${meta.label} ${meta.time}${staff ? ` · ${staff}` : ""}`}
    >
      <Text as="span" size="2xs" weight="medium">
        {meta.label}
      </Text>
      {staff ? (
        <Text as="span" size="2xs" tone="muted" truncate>
          {staff}
        </Text>
      ) : null}
    </Badge>
  );
}

// ── Month data (2026年5月, 6-week grid = 42 cells) ─────────────────────────────
type DayCell = {
  date: number; // 1..31, or 0 for padding
  dim?: boolean; // other-month
  today?: boolean;
  weekday: number; // 0=Sun .. 6=Sat
  holiday?: string; // holiday name → 祝日 pill
  shifts: Array<{ kind: ShiftKind; staff: string }>;
};

// May 2026 starts on a Friday (weekday index 5).
const MAY_HOLIDAYS: Record<number, string> = {
  3: "憲法記念日",
  4: "みどりの日",
  5: "こどもの日",
};

// A handful of representative shift assignments across the month.
const SHIFTS_BY_DATE: Record<number, Array<{ kind: ShiftKind; staff: string }>> = {
  1: [
    { kind: "early", staff: "田中" },
    { kind: "late", staff: "佐藤" },
  ],
  2: [{ kind: "tsushi", staff: "鈴木" }],
  7: [
    { kind: "early", staff: "田中" },
    { kind: "late", staff: "高橋" },
    { kind: "night", staff: "伊藤" },
  ],
  8: [
    { kind: "early", staff: "佐藤" },
    { kind: "ot", staff: "田中" },
  ],
  12: [{ kind: "leave", staff: "鈴木" }],
  14: [
    { kind: "early", staff: "田中" },
    { kind: "late", staff: "高橋" },
    { kind: "tsushi", staff: "佐藤" },
    { kind: "night", staff: "伊藤" },
  ],
  15: [
    { kind: "early", staff: "佐藤" },
    { kind: "late", staff: "鈴木" },
  ],
  20: [{ kind: "tsushi", staff: "高橋" }],
  22: [
    { kind: "early", staff: "田中" },
    { kind: "ot", staff: "佐藤" },
  ],
  28: [{ kind: "night", staff: "伊藤" }],
};

const TODAY = 14; // 2026-05-14, the "today" / now-line anchor.

function buildMonth(): DayCell[] {
  const startPad = 5; // May 1, 2026 = Friday
  const daysInMonth = 31;
  const cells: DayCell[] = [];
  // Leading padding (late April), dim.
  for (let i = 0; i < startPad; i++) {
    const d = 27 + i; // 27..30 Apr (4 cells) + 1 spillover handled by length
    cells.push({ date: d, dim: true, weekday: i, shifts: [] });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const weekday = (startPad + d - 1) % 7;
    cells.push({
      date: d,
      today: d === TODAY,
      weekday,
      holiday: MAY_HOLIDAYS[d],
      shifts: SHIFTS_BY_DATE[d] ?? [],
    });
  }
  // Trailing padding to fill the last week (early June), dim.
  let next = 1;
  while (cells.length % 7 !== 0) {
    cells.push({
      date: next,
      dim: true,
      weekday: cells.length % 7,
      shifts: [],
    });
    next++;
  }
  return cells;
}

const MONTH_CELLS = buildMonth();
const WEEKDAY_HEAD = ["日", "月", "火", "水", "木", "金", "土"];
/** 42 day cells as six calendar rows — the month grid is a real <table>, one <tr> per week. */
const MONTH_WEEKS = Array.from({ length: MONTH_CELLS.length / 7 }, (_, w) =>
  MONTH_CELLS.slice(w * 7, w * 7 + 7),
);

// ── Week view (2026-05-11 〜 05-17), time axis 06:00–24:00 ─────────────────────
// The week axis is a real `TimelineGrid`: columns are days, blocks are placed by start time and
// duration, and two shifts that overlap are laid out side by side by the primitive.
const WEEK_COLUMNS: TimelineGridColumnProp[] = [
  { date: 11, weekday: 1 },
  { date: 12, weekday: 2 },
  { date: 13, weekday: 3 },
  { date: 14, weekday: 4, current: true },
  { date: 15, weekday: 5 },
  { date: 16, weekday: 6 },
  { date: 17, weekday: 0 },
].map(({ date, weekday, current }) => ({
  id: `05-${date}`,
  label: (
    <Text
      as="span"
      size="2xs"
      weight="medium"
      tabular
      style={{
        color:
          weekday === 0
            ? "var(--destructive)"
            : weekday === 6
              ? "var(--info)"
              : "var(--muted-foreground)",
      }}
    >
      {WEEKDAY_HEAD[weekday]} {date}
    </Text>
  ),
  current,
}));

// 夜勤 22:00→06:00: an end at or before the start means the shift runs into the next day, so the
// grid clips it at the 24:00 edge and still prints the real range on the block.
const WEEK_SHIFTS: TimelineGridEventProp[] = [
  { id: "w1", columnId: "05-14", start: "09:00", end: "17:30", kind: "early", staff: "田中" },
  { id: "w2", columnId: "05-14", start: "13:00", end: "22:00", kind: "late", staff: "高橋" },
  { id: "w3", columnId: "05-14", start: "22:00", end: "06:00", kind: "night", staff: "伊藤" },
  { id: "w4", columnId: "05-11", start: "09:00", end: "22:00", kind: "tsushi", staff: "佐藤" },
  { id: "w5", columnId: "05-15", start: "09:00", end: "17:30", kind: "early", staff: "佐藤" },
  { id: "w6", columnId: "05-15", start: "18:00", end: "21:00", kind: "ot", staff: "鈴木" },
  { id: "w7", columnId: "05-12", start: "06:00", end: "22:00", kind: "leave", staff: "鈴木" },
].map(({ kind, staff, ...event }) => ({
  ...event,
  title: SHIFT_META[kind as ShiftKind].label,
  description: staff,
  color: `var(${SHIFT_META[kind as ShiftKind].cssVar})`,
}));

// ── Day view (2026-05-14) — per-staff lanes via Timeline + understaffed gap ───
const DAY_LANES: Array<{ staff: string; role: string; items: TimelineItem[] }> = [
  {
    staff: "田中 美咲",
    role: "店長",
    items: [
      { title: "早番 · 09:00 開始", time: "09:00", current: true },
      { title: "休憩 12:00–13:00", time: "12:00" },
      { title: "早番 · 17:30 終了", time: "17:30" },
    ],
  },
  {
    staff: "高橋 健",
    role: "スタッフ",
    items: [
      { title: "遅番 · 13:00 開始", time: "13:00" },
      { title: "休憩 17:00–17:45", time: "17:00" },
      { title: "遅番 · 22:00 終了", time: "22:00" },
    ],
  },
  {
    staff: "伊藤 翔",
    role: "スタッフ",
    items: [
      { title: "夜勤 · 22:00 開始", time: "22:00", current: true },
      { title: "夜勤 · 翌 06:00 終了", time: "06:00" },
    ],
  },
];

// ── Sidebar ───────────────────────────────────────────────────────────────────
const NAV_SECTIONS: SidebarSectionProp[] = [
  {
    label: "シフト",
    items: [
      { id: "calendar", label: "シフトカレンダー", icon: CalendarRange },
      { id: "shifts", label: "従業員シフト", icon: Users, badge: 5 },
      { id: "requests", label: "変更申請", icon: CalendarClock, badge: 3 },
    ],
  },
  {
    label: "勤怠",
    items: [
      { id: "dashboard", label: "ダッシュボード", icon: LayoutDashboard },
      { id: "logs", label: "打刻ログ", icon: Clock3 },
    ],
  },
];

type ViewMode = "month" | "week" | "day";

export default function ShiftCalendarShowcase() {
  const [activeNav, setActiveNav] = React.useState("calendar");
  const [view, setView] = React.useState<ViewMode>("month");
  const [jumpMonth, setJumpMonth] = React.useState<Date | undefined>(new Date(2026, 4, 14));
  const [pickerOpen, setPickerOpen] = React.useState(false);
  // Master-detail: tapping a day opens a Sheet (works at any width; on lg the
  // grid is the primary surface and the Sheet is an on-demand detail).
  const [detailDate, setDetailDate] = React.useState<DayCell | null>(null);

  const sidebar = (
    <Sidebar
      activeId={activeNav}
      onSelect={setActiveNav}
      sections={NAV_SECTIONS}
      product={{ name: "famgia", role: "全店舗 · 5月度" }}
    />
  );

  return (
    <AppShell
      sidebar={sidebar}
      topbarLeft={<Text as="strong">シフト管理</Text>}
      topbarRight={
        <Text size="xs" tone="muted" tabular className="whitespace-nowrap">
          famgia · 渋谷店
        </Text>
      }
    >
      <PageContainer
        title="シフトカレンダー"
        subtitle="2026年5月 · 渋谷店"
        density="compact"
        extra={
          <Flex direction="row" gap="sm" className="flex-wrap items-center">
            {/* Month nav segment */}
            <Flex direction="row" gap="xs" className="items-center">
              <Button variant="outline" size="sm" aria-label="前の月">
                <ChevronLeft aria-hidden="true" />
              </Button>
              <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="whitespace-nowrap tabular-nums">
                    <CalendarDays aria-hidden="true" />
                    2026年5月
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto" style={{ padding: 0 }} align="start">
                  <Calendar
                    mode="single"
                    selected={jumpMonth}
                    onSelect={(d) => {
                      setJumpMonth(d);
                      setPickerOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
              <Button variant="outline" size="sm" aria-label="次の月">
                <ChevronRight aria-hidden="true" />
              </Button>
              <Button variant="ghost" size="sm" className="whitespace-nowrap">
                今日
              </Button>
            </Flex>
            {/* 月/週/日 segmented view switch */}
            <ToggleGroup
              type="single"
              value={view}
              onValueChange={(v) => {
                if (v) setView(v as ViewMode);
              }}
              aria-label="表示単位"
            >
              <ToggleGroupItem value="day">日</ToggleGroupItem>
              <ToggleGroupItem value="week">週</ToggleGroupItem>
              <ToggleGroupItem value="month">月</ToggleGroupItem>
            </ToggleGroup>
            <Button size="sm" className="whitespace-nowrap">
              <Plus aria-hidden="true" />
              シフト追加
            </Button>
          </Flex>
        }
      >
        <Flex direction="col" gap="lg">
          {/* ── Shift-type legend (the 7-color wa-iro palette) ── */}
          <Card>
            <CardHeader>
              <CardTitle level={2}>シフト区分</CardTitle>
              <CardAction>
                <Text size="xs" tone="muted" className="whitespace-nowrap">
                  和色（装飾用）
                </Text>
              </CardAction>
            </CardHeader>
            <CardContent>
              <Flex direction="row" gap="sm" wrap>
                {(Object.keys(SHIFT_META) as ShiftKind[]).map((k) => (
                  <Badge key={k} color={`var(${SHIFT_META[k].cssVar})`} shape="sharp">
                    <Text size="xs" weight="medium" className="whitespace-nowrap">
                      {SHIFT_META[k].label}
                    </Text>
                    <Text size="xs" tone="muted" tabular className="whitespace-nowrap">
                      {SHIFT_META[k].time}
                    </Text>
                  </Badge>
                ))}
              </Flex>
            </CardContent>
          </Card>

          {/* ── MONTH view ── */}
          {view === "month" && <MonthGrid onPick={setDetailDate} />}

          {/* ── WEEK view ── */}
          {view === "week" && <WeekTimeline />}

          {/* ── DAY view ── */}
          {view === "day" && <DayLanes />}
        </Flex>
      </PageContainer>

      {/* Master-detail: day detail as a Sheet (drawer) */}
      <Sheet open={detailDate !== null} onOpenChange={(o) => !o && setDetailDate(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="tabular-nums">
              {detailDate ? `2026年5月${detailDate.date}日` : ""}
              {detailDate ? ` (${WEEKDAY_HEAD[detailDate.weekday]})` : ""}
            </SheetTitle>
            <SheetDescription>
              {detailDate?.holiday ? `祝日 · ${detailDate.holiday}` : "この日のシフト割り当て"}
            </SheetDescription>
          </SheetHeader>
          <SheetBody>
            {detailDate && detailDate.shifts.length > 0 ? (
              <Flex direction="col" gap="sm">
                {detailDate.shifts.map((s, i) => (
                  <ListRow
                    key={`${s.kind}-${i}`}
                    density="compact"
                    title={<ShiftPill kind={s.kind} staff={s.staff} />}
                    trailing={
                      <Text size="xs" tone="muted" tabular className="whitespace-nowrap">
                        {SHIFT_META[s.kind].time}
                      </Text>
                    }
                  />
                ))}
              </Flex>
            ) : (
              <EmptyState
                icon={CalendarCheck}
                title="シフトなし"
                description="この日に割り当てられたシフトはありません。"
              />
            )}
          </SheetBody>
        </SheetContent>
      </Sheet>
    </AppShell>
  );
}

// ── Month grid — a real Table: one <tr> per week, one <td> per day ────────────
function MonthGrid({ onPick }: { onPick: (d: DayCell) => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle level={2}>月</CardTitle>
        <CardAction>
          <Text size="xs" tone="muted" tabular className="whitespace-nowrap">
            6週間 · 31日
          </Text>
        </CardAction>
      </CardHeader>
      <CardContent flush>
        {/* Weekday head — Sun→danger, Sat→info; 42 day cells as six <tr> weeks */}
        <Table bordered className="min-w-[720px]">
          <TableHeader className="bg-secondary">
            <TableRow>
              {WEEKDAY_HEAD.map((w, i) => (
                <TableHead
                  key={w}
                  className="text-center"
                  style={{
                    color:
                      i === 0
                        ? "var(--destructive)"
                        : i === 6
                          ? "var(--info)"
                          : "var(--muted-foreground)",
                  }}
                >
                  {w}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {MONTH_WEEKS.map((week, r) => (
              <TableRow key={r}>
                {week.map((cell, c) => {
                  const isSun = cell.weekday === 0;
                  const isSat = cell.weekday === 6;
                  const shown = cell.shifts.slice(0, 3);
                  const overflow = cell.shifts.length - shown.length;
                  return (
                    <TableCell
                      key={c}
                      className="align-top"
                      style={{
                        background: cell.today
                          ? "color-mix(in oklch, var(--primary) 5%, transparent)"
                          : cell.dim
                            ? "color-mix(in oklch, var(--secondary) 40%, transparent)"
                            : undefined,
                        outline: cell.today ? "2px solid var(--primary)" : undefined,
                        outlineOffset: cell.today ? "-2px" : undefined,
                        opacity: cell.dim ? 0.5 : 1,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => onPick(cell)}
                        className="hover:bg-accent focus-visible:ring-ring min-h-[96px] w-full text-start transition-colors focus:outline-none focus-visible:ring-2"
                      >
                        <Flex direction="col" gap="xs">
                          <Flex align="center" justify="between">
                            <Text
                              as="span"
                              size="sm"
                              weight="medium"
                              tabular
                              style={{
                                color: cell.holiday
                                  ? "var(--destructive)"
                                  : isSun
                                    ? "var(--destructive)"
                                    : isSat
                                      ? "var(--info)"
                                      : "var(--foreground)",
                              }}
                            >
                              {cell.date}
                            </Text>
                            {cell.holiday ? (
                              <Badge
                                tone="destructive"
                                variant="outline"
                                shape="sharp"
                                className="text-[var(--font-size-2xs)]"
                              >
                                祝
                              </Badge>
                            ) : null}
                          </Flex>
                          <Flex direction="col" gap="xs">
                            {cell.holiday ? (
                              <ShiftPill kind="holiday" staff={cell.holiday} />
                            ) : null}
                            {shown.map((sh, i) => (
                              <ShiftPill key={`${sh.kind}-${i}`} kind={sh.kind} staff={sh.staff} />
                            ))}
                            {overflow > 0 ? (
                              <Text as="span" size="2xs" tone="muted" tabular>
                                ＋{overflow} 件
                              </Text>
                            ) : null}
                          </Flex>
                        </Flex>
                      </button>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// ── Week time-axis — the TimelineGrid primitive (#354 item 7 closed) ──────────
function WeekTimeline() {
  return (
    <Card>
      <CardHeader>
        <CardTitle level={2}>週</CardTitle>
        <CardAction>
          <Text size="xs" tone="muted" tabular className="whitespace-nowrap">
            5月11日〜17日 · 06:00–24:00
          </Text>
        </CardAction>
      </CardHeader>
      <CardContent flush>
        <TimelineGrid
          label="週シフト 2026年5月11日〜17日"
          columns={WEEK_COLUMNS}
          events={WEEK_SHIFTS}
          start="06:00"
          end="24:00"
          interval={2}
          now="14:35"
        />
      </CardContent>
    </Card>
  );
}

// ── Day view — per-staff lanes (Timeline) + understaffed EmptyState ───────────
function DayLanes() {
  return (
    <Flex direction="col" gap="md">
      <ResponsiveGrid columns={{ sm: 1, lg: 3, md: 1 }} gap="md">
        {DAY_LANES.map((lane) => (
          <Card key={lane.staff} className="self-start">
            <CardHeader>
              <CardTitle level={2} className="truncate">
                {lane.staff}
              </CardTitle>
              <CardAction>
                <Badge tone="neutral" variant="outline" className="whitespace-nowrap">
                  {lane.role}
                </Badge>
              </CardAction>
            </CardHeader>
            <CardContent>
              <Timeline items={lane.items} />
            </CardContent>
          </Card>
        ))}
        {/* Understaffed gap — a calm attention EmptyState, not a dead grey box */}
        <Card className="self-start border-dashed" style={{ borderColor: "var(--attention)" }}>
          <CardHeader>
            <CardTitle level={2} className="truncate whitespace-nowrap">
              夜帯 22:00–06:00
            </CardTitle>
            <CardAction>
              <Badge tone="warning" variant="outline" className="whitespace-nowrap">
                人員不足
              </Badge>
            </CardAction>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={AlertTriangle}
              title="募集中"
              description="この時間帯はあと 1 名必要です。シフトを追加してください。"
              action={
                <Button variant="outline" size="sm">
                  <Plus aria-hidden="true" />
                  募集する
                </Button>
              }
            />
          </CardContent>
        </Card>
      </ResponsiveGrid>
    </Flex>
  );
}
