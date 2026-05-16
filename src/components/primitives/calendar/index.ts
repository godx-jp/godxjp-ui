// Calendar / scheduling primitive layer. Each atom is a generic
// presentation building block consumed by the calendar screen
// compositions under `components/composites/calendar/`. Per cardinal
// rule #19 these never reference a specific service / product name.

export { IconRow } from "./IconRow";
export type { IconRowProps, IconRowAlign } from "./IconRow";

export { AvatarStack } from "./AvatarStack";
export type { AvatarStackProps, AvatarStackItem } from "./AvatarStack";

export { ColorSwatchCheckbox } from "./ColorSwatchCheckbox";
export type { ColorSwatchCheckboxProps } from "./ColorSwatchCheckbox";

export { CalendarOption } from "./CalendarOption";
export type { CalendarOptionProps } from "./CalendarOption";

export { AttendeeChip } from "./AttendeeChip";
export type { AttendeeChipProps } from "./AttendeeChip";

export { AttendeeListItem } from "./AttendeeListItem";
export type { AttendeeListItemProps } from "./AttendeeListItem";

export { AllDayChip } from "./AllDayChip";
export type { AllDayChipProps, AllDayChipSize } from "./AllDayChip";

export { DayHeaderPill } from "./DayHeaderPill";
export type { DayHeaderPillProps, DayHeaderPillState } from "./DayHeaderPill";

export { GridColumn, TimeGutter, NowLine } from "./TimeGrid";
export type { GridColumnProps, TimeGutterProps, NowLineProps } from "./TimeGrid";

export { EventBlock, layoutEvents } from "./EventBlock";
export type { EventBlockProps, LanedEvent } from "./EventBlock";

export { MonthCell } from "./MonthCell";
export type { MonthCellProps } from "./MonthCell";

export { EventPill } from "./EventPill";
export type { EventPillProps } from "./EventPill";

export { MiniMonth } from "./MiniMonth";
export type { MiniMonthProps, MiniMonthYMD } from "./MiniMonth";

export { AvailabilityRow } from "./AvailabilityRow";
export type { AvailabilityRowProps } from "./AvailabilityRow";

export { SuggestedSlotCard } from "./SuggestedSlotCard";
export type { SuggestedSlotCardProps } from "./SuggestedSlotCard";

export {
  DEFAULT_GRID,
  buildMonthGrid,
  fmtHour,
  minToY,
  parseHM,
  ymd,
} from "./time";
export type { TimeLocale, MonthCellRef } from "./time";

export type {
  CalendarEvent,
  CalendarRef,
  PersonRef,
  EventBlockVariant,
} from "./types";
