/**
 * Showcase · case5 — Shift Calendar (シフトカレンダー)
 *
 * A standalone shift-scheduling screen, served at `/showcase/case5-shift-calendar`.
 * Built ENTIRELY from real @godxjp/ui primitives — the dxs-kintai
 * `admin/[brandSlug]/employee-shifts/calendar` surface recreated as a "skeleton"
 * (intent + look), not a transcription of `comp-calendar.html`.
 *
 * Composition map (prototype block → @godxjp/ui primitive):
 *   page chrome ............. AppShell + Sidebar + Topbar
 *   page header + nav ....... PageContainer (extra slot) + Button + ToggleGroup (月/週/日)
 *   month jump-to ........... Calendar (date-picker) inside a Popover
 *   month event grid ........ Card + a 7-col CSS grid of day cells + shift "pills"  ── GAP, see below
 *   week time-axis + now-line  Card + a 06–21 row grid + an absolutely-placed now bar ── GAP, see below
 *   day staff×time .......... Card + Timeline (per-staff lane) + EmptyState (understaffed)
 *   shift legend ............ Card + the wa-iro decorative palette swatches
 *   date detail (mobile) .... Sheet (master-detail collapses to a drawer < lg)
 *
 * GAP (documented in .design/research/screens.md §6 + ui-kit-surfaces.md §9):
 *   @godxjp/ui's `Calendar` is a single-date PICKER, not a month/week event grid.
 *   There is no `ShiftCalendar` / scheduling-grid primitive. The month grid and the
 *   week time-axis are therefore COMPOSED from real primitives (Card + token-driven
 *   CSS grid + Badge), never a hand-rolled faux component. The real Calendar is still
 *   used for its genuine job (jumping to a month). See `gapNotes`.
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
  Popover,
  PopoverContent,
  PopoverTrigger,
  Timeline,
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
import { AppShell, Flex, PageContainer, Sidebar, type SidebarSectionProp } from "@godxjp/ui/layout";

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
    <span
      data-shift={kind}
      className={`flex items-center gap-1 truncate rounded-[3px] border-l-2 px-1.5 py-0.5 leading-tight ${className ?? ""}`}
      style={{
        borderLeftColor: `var(${meta.cssVar})`,
        background: `color-mix(in oklch, var(${meta.cssVar}) 12%, transparent)`,
        color: meta.muted ? "var(--muted-foreground)" : "var(--foreground)",
      }}
      title={`${meta.label} ${meta.time}${staff ? ` · ${staff}` : ""}`}
    >
      <Text as="span" size="2xs" weight="medium" style={{ color: "inherit" }}>
        {meta.label}
      </Text>
      {staff ? (
        <Text as="span" size="2xs" tone="muted" truncate>
          {staff}
        </Text>
      ) : null}
    </span>
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

// ── Week view (2026-05-11 〜 05-17), time axis 06:00–22:00 ─────────────────────
const WEEK_DATES = [
  { date: 11, weekday: 1 },
  { date: 12, weekday: 2 },
  { date: 13, weekday: 3 },
  { date: 14, weekday: 4, today: true },
  { date: 15, weekday: 5 },
  { date: 16, weekday: 6 },
  { date: 17, weekday: 0 },
];
const HOURS = [6, 8, 10, 12, 14, 16, 18, 20, 22];

type WeekBlock = {
  col: number; // 0..6 day index
  kind: ShiftKind;
  staff: string;
  startHour: number;
  endHour: number; // for night/通し may exceed 24 → clamp display
};
const WEEK_BLOCKS: WeekBlock[] = [
  { col: 3, kind: "early", staff: "田中", startHour: 9, endHour: 17.5 },
  { col: 3, kind: "late", staff: "高橋", startHour: 13, endHour: 22 },
  { col: 3, kind: "night", staff: "伊藤", startHour: 22, endHour: 30 },
  { col: 0, kind: "tsushi", staff: "佐藤", startHour: 9, endHour: 22 },
  { col: 4, kind: "early", staff: "佐藤", startHour: 9, endHour: 17.5 },
  { col: 4, kind: "ot", staff: "鈴木", startHour: 18, endHour: 21 },
  { col: 1, kind: "leave", staff: "鈴木", startHour: 6, endHour: 22 },
];

const AXIS_START = 6;
const AXIS_END = 22; // display window; night spills are clamped + noted
const NOW_HOUR = 14 + 35 / 60; // 14:35 now-line

function hourToPct(h: number): number {
  const clamped = Math.max(AXIS_START, Math.min(AXIS_END, h));
  return ((clamped - AXIS_START) / (AXIS_END - AXIS_START)) * 100;
}

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
                <PopoverContent className="w-auto p-0" align="start">
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
              <CardTitle>シフト区分</CardTitle>
              <CardAction>
                <Text size="xs" tone="muted" className="whitespace-nowrap">
                  和色（装飾用）
                </Text>
              </CardAction>
            </CardHeader>
            <CardContent>
              <Flex direction="row" gap="sm" wrap>
                {(Object.keys(SHIFT_META) as ShiftKind[]).map((k) => (
                  <span
                    key={k}
                    className="inline-flex items-center gap-2 rounded-[3px] border px-2 py-1 text-xs"
                  >
                    <span
                      aria-hidden="true"
                      className="size-3 shrink-0 rounded-[2px]"
                      style={{ background: `var(${SHIFT_META[k].cssVar})` }}
                    />
                    <Text size="xs" weight="medium" className="whitespace-nowrap">
                      {SHIFT_META[k].label}
                    </Text>
                    <Text size="xs" tone="muted" tabular className="whitespace-nowrap">
                      {SHIFT_META[k].time}
                    </Text>
                  </span>
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
                  <div
                    key={`${s.kind}-${i}`}
                    className="flex items-center justify-between gap-2 rounded-[6px] border px-3 py-2"
                  >
                    <ShiftPill kind={s.kind} staff={s.staff} />
                    <Text size="xs" tone="muted" tabular className="whitespace-nowrap">
                      {SHIFT_META[s.kind].time}
                    </Text>
                  </div>
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

// ── Month grid — composed from primitives (GAP: no event-calendar primitive) ──
function MonthGrid({ onPick }: { onPick: (d: DayCell) => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>月</CardTitle>
        <CardAction>
          <Text size="xs" tone="muted" tabular className="whitespace-nowrap">
            6週間 · 31日
          </Text>
        </CardAction>
      </CardHeader>
      <CardContent flush>
        <div className="overflow-x-auto">
          <div className="min-w-[720px]">
            {/* Weekday head — Sun→danger, Sat→info */}
            <div className="bg-secondary grid grid-cols-7 border-b">
              {WEEKDAY_HEAD.map((w, i) => (
                <Text
                  as="div"
                  key={w}
                  size="2xs"
                  weight="medium"
                  align="center"
                  className="px-2 py-1.5"
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
                </Text>
              ))}
            </div>
            {/* 42 cells */}
            <div className="grid grid-cols-7">
              {MONTH_CELLS.map((cell, idx) => {
                const isSun = cell.weekday === 0;
                const isSat = cell.weekday === 6;
                const shown = cell.shifts.slice(0, 3);
                const overflow = cell.shifts.length - shown.length;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onPick(cell)}
                    className="hover:bg-accent focus-visible:ring-ring flex min-h-[96px] flex-col gap-1 border-r border-b p-1.5 text-left transition-colors focus:outline-none focus-visible:ring-2 [&:nth-child(7n)]:border-r-0"
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
                    <div className="flex items-center justify-between">
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
                          className="px-1 py-0 text-[10px]"
                        >
                          祝
                        </Badge>
                      ) : null}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      {cell.holiday ? <ShiftPill kind="holiday" staff={cell.holiday} /> : null}
                      {shown.map((s, i) => (
                        <ShiftPill key={`${s.kind}-${i}`} kind={s.kind} staff={s.staff} />
                      ))}
                      {overflow > 0 ? (
                        <Text as="span" size="2xs" tone="muted" tabular className="px-1">
                          ＋{overflow} 件
                        </Text>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Week time-axis with a now-line (GAP: no time-grid primitive) ──────────────
function WeekTimeline() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>週</CardTitle>
        <CardAction>
          <Text size="xs" tone="muted" tabular className="whitespace-nowrap">
            5月11日〜17日 · 06:00–22:00
          </Text>
        </CardAction>
      </CardHeader>
      <CardContent flush>
        <div className="overflow-x-auto">
          <div className="min-w-[760px]">
            {/* Day header row */}
            <div className="bg-secondary grid grid-cols-[48px_repeat(7,1fr)] border-b">
              <div aria-hidden="true" />
              {WEEK_DATES.map((d) => (
                <Text
                  as="div"
                  key={d.date}
                  size="2xs"
                  weight="medium"
                  tabular
                  align="center"
                  className="px-2 py-1.5"
                  style={{
                    color:
                      d.weekday === 0
                        ? "var(--destructive)"
                        : d.weekday === 6
                          ? "var(--info)"
                          : "var(--muted-foreground)",
                    background:
                      "today" in d && d.today
                        ? "color-mix(in oklch, var(--primary) 6%, transparent)"
                        : undefined,
                  }}
                >
                  {WEEKDAY_HEAD[d.weekday]} {d.date}
                </Text>
              ))}
            </div>
            {/* Time grid body */}
            <div className="relative grid grid-cols-[48px_repeat(7,1fr)]">
              {/* Hour axis labels */}
              <div className="relative" style={{ height: `${(AXIS_END - AXIS_START) * 22}px` }}>
                {HOURS.map((h) => (
                  <Text
                    as="div"
                    key={h}
                    size="2xs"
                    tone="muted"
                    tabular
                    className="absolute right-1.5 -translate-y-1/2"
                    style={{ top: `${hourToPct(h)}%` }}
                  >
                    {String(h).padStart(2, "0")}:00
                  </Text>
                ))}
              </div>
              {/* 7 day columns */}
              {WEEK_DATES.map((d, col) => (
                <div
                  key={d.date}
                  className="relative border-l"
                  style={{ height: `${(AXIS_END - AXIS_START) * 22}px` }}
                >
                  {/* hour gridlines */}
                  {HOURS.map((h) => (
                    <div
                      key={h}
                      aria-hidden="true"
                      className="border-border/60 absolute inset-x-0 border-t"
                      style={{ top: `${hourToPct(h)}%` }}
                    />
                  ))}
                  {/* shift blocks for this column */}
                  {WEEK_BLOCKS.filter((b) => b.col === col).map((b, i) => {
                    const top = hourToPct(b.startHour);
                    const bottom = hourToPct(b.endHour);
                    const meta = SHIFT_META[b.kind];
                    const spills = b.endHour > AXIS_END;
                    return (
                      <div
                        key={`${b.kind}-${i}`}
                        className="absolute inset-x-0.5 overflow-hidden rounded-[3px] border-l-2 px-1 py-0.5 leading-tight"
                        style={{
                          top: `${top}%`,
                          height: `${Math.max(bottom - top, 4)}%`,
                          borderLeftColor: `var(${meta.cssVar})`,
                          background: `color-mix(in oklch, var(${meta.cssVar}) 14%, transparent)`,
                          color: meta.muted ? "var(--muted-foreground)" : "var(--foreground)",
                        }}
                        title={`${meta.label} ${meta.time} · ${b.staff}`}
                      >
                        <Text
                          as="div"
                          size="2xs"
                          weight="medium"
                          truncate
                          style={{ color: "inherit" }}
                        >
                          {meta.label}
                        </Text>
                        <Text as="div" size="2xs" tone="muted" truncate>
                          {b.staff}
                        </Text>
                        {spills ? (
                          <Text as="div" size="2xs" tone="muted" tabular>
                            翌日へ ↓
                          </Text>
                        ) : null}
                      </div>
                    );
                  })}
                  {/* now-line — only on "today" (col 3), 14:35 */}
                  {"today" in d && d.today ? (
                    <div
                      aria-label="現在時刻 14:35"
                      className="pointer-events-none absolute inset-x-0 z-10"
                      style={{ top: `${hourToPct(NOW_HOUR)}%` }}
                    >
                      <div className="h-[1.5px]" style={{ background: "var(--destructive)" }} />
                      <div
                        className="absolute -top-1 -left-1 size-2 rounded-full"
                        style={{ background: "var(--destructive)" }}
                      />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Day view — per-staff lanes (Timeline) + understaffed EmptyState ───────────
function DayLanes() {
  return (
    <Flex direction="col" gap="md">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {DAY_LANES.map((lane) => (
          <Card key={lane.staff} className="self-start">
            <CardHeader>
              <CardTitle className="truncate">{lane.staff}</CardTitle>
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
            <CardTitle className="truncate whitespace-nowrap">夜帯 22:00–06:00</CardTitle>
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
      </div>
    </Flex>
  );
}
