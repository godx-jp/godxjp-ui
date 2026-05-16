import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Bell, Clock, Globe, Users } from "lucide-react";
import {
  AllDayChip,
  AttendeeChip,
  AttendeeListItem,
  AvailabilityRow,
  AvatarStack,
  CalendarOption,
  DayHeaderPill,
  EventBlock,
  EventPill,
  GridColumn,
  IconRow,
  MonthCell,
  NowLine,
  SuggestedSlotCard,
  TimeGutter,
  type CalendarEvent,
} from "../components/primitives/calendar";
import { Badge } from "../components/primitives/Badge";
import { ASAGI_ACCENT, EVENTS, PEOPLE } from "./calendar-fixtures";

/**
 * Aggregate stories for the calendar primitive layer. Each top-level
 * `export` covers one primitive with its meaningful variants — kept
 * grouped here so the Storybook tree shows `Primitives/Calendar/*` as
 * a single navigable section.
 */

const accentDecorator = (Story: React.ComponentType) => (
  <div style={{ padding: 16, ["--accent-color" as never]: ASAGI_ACCENT }}>
    <Story />
  </div>
);

// ── IconRow ─────────────────────────────────────────────────────
const iconRowMeta: Meta<typeof IconRow> = {
  title: "Primitives/Calendar/IconRow",
  component: IconRow,
  decorators: [accentDecorator],
  tags: ["autodocs"],
};
export default iconRowMeta;
type IconRowStory = StoryObj<typeof IconRow>;

export const IconRowDefault: IconRowStory = {
  name: "IconRow / Default",
  render: () => (
    <div style={{ width: 320 }}>
      <IconRow icon={<Clock size={15} />}>
        <div style={{ fontSize: 13, fontWeight: 500 }}>15:00 – 16:00</div>
        <div style={{ fontSize: 11.5, color: "var(--muted-foreground)" }}>
          Wed, May 20 · GMT+09
        </div>
      </IconRow>
    </div>
  ),
};

export const IconRowMultiline: IconRowStory = {
  name: "IconRow / Multiline body",
  render: () => (
    <div style={{ width: 320 }}>
      <IconRow icon={<Users size={15} />}>
        <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 6 }}>
          3 attendees · 3 confirmed
        </div>
        <AttendeeListItem
          name="Yuki Tanaka"
          short="YT"
          color="#1e50a2"
          isSelf
          org="Famgia"
        />
      </IconRow>
    </div>
  ),
};

// ── AvatarStack ─────────────────────────────────────────────────
export const AvatarStackThree: StoryObj = {
  name: "AvatarStack / Three",
  render: () => (
    <AvatarStack
      items={PEOPLE.slice(0, 3).map((p) => ({
        id: p.id,
        short: p.short,
        color: p.color,
        name: p.name,
      }))}
    />
  ),
};

export const AvatarStackMany: StoryObj = {
  name: "AvatarStack / Many (+N overflow)",
  render: () => (
    <AvatarStack
      items={PEOPLE.map((p) => ({
        id: p.id,
        short: p.short,
        color: p.color,
        name: p.name,
      }))}
      max={3}
    />
  ),
};

export const AvatarStackSizes: StoryObj = {
  name: "AvatarStack / Sizes",
  render: () => (
    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
      {[16, 22, 32].map((size) => (
        <AvatarStack
          key={size}
          size={size}
          items={PEOPLE.slice(0, 4).map((p) => ({ id: p.id, short: p.short, color: p.color, name: p.name }))}
          max={3}
        />
      ))}
    </div>
  ),
};

// ── CalendarOption ──────────────────────────────────────────────
export const CalendarOptionDefault: StoryObj = {
  name: "CalendarOption / Default",
  render: () => <CalendarOption color="#4c6cb3" name="godx-admin · Product" />,
};
export const CalendarOptionReadOnly: StoryObj = {
  name: "CalendarOption / Read-only",
  render: () => (
    <CalendarOption color="#949495" name="Ngày lễ Nhật Bản" meta="read-only" />
  ),
};

// ── AttendeeChip ────────────────────────────────────────────────
export const AttendeeChipDefault: StoryObj = {
  name: "AttendeeChip / Default",
  render: () => (
    <AttendeeChip name="Yuki Tanaka" short="YT" color="#1e50a2" />
  ),
};
export const AttendeeChipRemovable: StoryObj = {
  name: "AttendeeChip / Removable",
  render: () => (
    <AttendeeChip
      name="佐藤 聡"
      short="聡"
      color="#165e83"
      onRemove={() => undefined}
    />
  ),
};

// ── AttendeeListItem ────────────────────────────────────────────
export const AttendeeListItemSelf: StoryObj = {
  name: "AttendeeListItem / Self",
  render: () => (
    <div style={{ width: 320 }}>
      <AttendeeListItem
        name="Yuki Tanaka"
        short="YT"
        color="#1e50a2"
        isSelf
        isOrganizer
        org="Famgia"
        status={<Badge variant="success">OK</Badge>}
      />
    </div>
  ),
};
export const AttendeeListItemGuest: StoryObj = {
  name: "AttendeeListItem / Guest",
  render: () => (
    <div style={{ width: 320 }}>
      <AttendeeListItem
        name="Kenji Saito"
        short="KS"
        color="#7c3aed"
        org="Tempo"
        status={<Badge variant="warning">Pending</Badge>}
      />
    </div>
  ),
};

// ── AllDayChip ──────────────────────────────────────────────────
export const AllDayChipCompact: StoryObj = {
  name: "AllDayChip / Compact",
  render: () => (
    <AllDayChip color="#b94047" size="compact">
      🏔 開発合宿 · 箱根
    </AllDayChip>
  ),
};
export const AllDayChipPill: StoryObj = {
  name: "AllDayChip / Pill",
  render: () => (
    <AllDayChip color="#b94047" size="pill">
      🏔 開発合宿 · 箱根
    </AllDayChip>
  ),
};

// ── DayHeaderPill ───────────────────────────────────────────────
export const DayHeaderPillStates: StoryObj = {
  name: "DayHeaderPill / States",
  decorators: [accentDecorator],
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, width: 480 }}>
      <DayHeaderPill dow="T2" day={18} />
      <DayHeaderPill dow="T4" day={20} state="today" />
      <DayHeaderPill dow="T5" day={21} state="selected" />
      <DayHeaderPill dow="CN" day={24} />
    </div>
  ),
};

// ── EventBlock ──────────────────────────────────────────────────
function blockDemo(variant: CalendarEvent extends infer _ ? string : never, ev: CalendarEvent, color: string) {
  return (
    <div style={{ position: "relative", width: 220, height: 200, border: "1px solid var(--border)" }}>
      <EventBlock
        event={ev}
        color={color}
        // @ts-expect-error story narrows variant string
        variant={variant}
      />
    </div>
  );
}

const sampleEvent: CalendarEvent = {
  id: "demo",
  calId: "godx-prod",
  title: "Customer · Tempo VN onboarding",
  date: "2026-05-20",
  start: "07:00",
  end: "08:30",
  attendees: ["yuki", "kenji"],
  status: "organizer",
  type: "customer",
  location: "Zoom",
};

export const EventBlockVariants: StoryObj = {
  name: "EventBlock / Variants",
  decorators: [accentDecorator],
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
      {blockDemo("solid", { ...sampleEvent, title: "Solid (customer)" }, "#4c6cb3")}
      {blockDemo("tint", { ...sampleEvent, title: "Tint (accepted)" }, "#4c6cb3")}
      {blockDemo("tentative", { ...sampleEvent, title: "Tentative" }, "#eb6101")}
      {blockDemo("focus", { ...sampleEvent, title: "Focus" }, "#595857")}
    </div>
  ),
};
export const EventBlockSelected: StoryObj = {
  name: "EventBlock / Selected",
  decorators: [accentDecorator],
  render: () => (
    <div style={{ position: "relative", width: 220, height: 200, border: "1px solid var(--border)" }}>
      <EventBlock event={sampleEvent} color="#4c6cb3" variant="solid" selected />
    </div>
  ),
};
export const EventBlockMultiLane: StoryObj = {
  name: "EventBlock / Multi-lane",
  decorators: [accentDecorator],
  render: () => (
    <div style={{ position: "relative", width: 220, height: 200, border: "1px solid var(--border)" }}>
      <EventBlock event={sampleEvent} color="#4c6cb3" variant="tint" lane={0} lanes={2} />
      <EventBlock
        event={{ ...sampleEvent, id: "demo-2", title: "Overlap", start: "07:30", end: "08:30" }}
        color="#b94047"
        variant="solid"
        lane={1}
        lanes={2}
      />
    </div>
  ),
};

// ── TimeGrid (composed) ─────────────────────────────────────────
export const TimeGridDemo: StoryObj = {
  name: "TimeGrid / Composed demo",
  decorators: [accentDecorator],
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "60px 1fr", border: "1px solid var(--border)", maxHeight: 540, overflow: "hidden" }}>
      <TimeGutter locale="en" />
      <GridColumn isToday>
        {EVENTS.filter((e) => e.date === "2026-05-20" && !e.allDay).slice(0, 4).map((ev, i, arr) => (
          <EventBlock
            key={ev.id}
            event={ev}
            color="#4c6cb3"
            variant={i === 0 ? "solid" : "tint"}
            lane={0}
            lanes={1}
          />
        ))}
        <NowLine nowDate={new Date(2026, 4, 20, 16, 7)} />
      </GridColumn>
    </div>
  ),
};

// ── MonthCell ───────────────────────────────────────────────────
export const MonthCellStates: StoryObj = {
  name: "MonthCell / States",
  decorators: [accentDecorator],
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 200px)", gap: 1, background: "var(--border)" }}>
      <MonthCell day={20} today events={<EventPill color="#4c6cb3" time="15:00" title="Customer · Tempo" />} />
      <MonthCell day={11} dim />
      <MonthCell day={23} weekend events={<AllDayChip color="#b94047" size="month">🏔 開発合宿</AllDayChip>} />
      <MonthCell
        day={22}
        events={
          <>
            <EventPill color="#165e83" time="09:00" title="Demo day" />
            <EventPill color="#4c6cb3" time="11:00" title="Customer · Acme" />
          </>
        }
        overflow={3}
        formatOverflow={(n) => `+ ${n} more`}
      />
    </div>
  ),
};

// ── EventPill ───────────────────────────────────────────────────
export const EventPillDefault: StoryObj = {
  name: "EventPill / Default",
  render: () => (
    <div style={{ width: 240 }}>
      <EventPill color="#4c6cb3" time="10:00" title="Product strategy · Q3" />
    </div>
  ),
};

// ── AvailabilityRow ─────────────────────────────────────────────
export const AvailabilityAllFree: StoryObj = {
  name: "AvailabilityRow / All free",
  decorators: [accentDecorator],
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", width: 720 }}>
      <AvailabilityRow
        person={<span style={{ fontSize: 12, fontWeight: 500 }}>Yuki Tanaka</span>}
        slots={Array.from({ length: 18 }, () => 0 as const)}
      />
    </div>
  ),
};
export const AvailabilityMixed: StoryObj = {
  name: "AvailabilityRow / Mixed busy/tentative",
  decorators: [accentDecorator],
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", width: 720 }}>
      <AvailabilityRow
        person={<span style={{ fontSize: 12, fontWeight: 500 }}>Linh Trần</span>}
        slots={[0, 0, 2, 2, 1, 1, 0, 0, 2, 2, 2, 2, 0, 0, 1, 1, 0, 0]}
      />
    </div>
  ),
};
export const AvailabilityWithSelection: StoryObj = {
  name: "AvailabilityRow / With selection",
  decorators: [accentDecorator],
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", width: 720 }}>
      <AvailabilityRow
        person={<span style={{ fontSize: 12, fontWeight: 500 }}>Yuki Tanaka</span>}
        slots={[0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0]}
        selectedRange={[10, 12]}
      />
    </div>
  ),
};

// ── SuggestedSlotCard ───────────────────────────────────────────
export const SuggestedSlotDefault: StoryObj = {
  name: "SuggestedSlotCard / Default",
  decorators: [accentDecorator],
  render: () => <SuggestedSlotCard label="14:00 – 14:30" meta="7 người" />,
};
export const SuggestedSlotBest: StoryObj = {
  name: "SuggestedSlotCard / Best",
  decorators: [accentDecorator],
  render: () => <SuggestedSlotCard label="14:00 – 15:00" meta="7 người" best />,
};
