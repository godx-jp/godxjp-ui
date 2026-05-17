// Generic calendar / event data shapes consumed by the calendar
// primitives. These stay vocabulary-light on purpose — a downstream
// product layers its own categorisation on top via the `type` /
// `status` strings.

export interface CalendarEvent {
  id: string;
  /** Color reference — `CalendarRef.id` whose `color` paints the event. */
  calId: string;
  title: string;
  /** YYYY-MM-DD. */
  date: string;
  allDay?: boolean;
  /** HH:MM (24h). Required when `allDay` is false. */
  start?: string;
  /** HH:MM (24h). Required when `allDay` is false. */
  end?: string;
  attendees: string[];
  /** Free-form status — caller decides which strings are meaningful. */
  status?: string;
  /** Free-form event kind — caller decides. */
  type?: string;
  location?: string;
  note?: string;
}

export interface CalendarRef {
  id: string;
  name: string;
  color: string;
  shown?: boolean;
  /** Optional grouping bucket used by sidebar lists. */
  group?: string;
  /** True for read-only feeds (e.g. national holidays). */
  readonly?: boolean;
}

export interface PersonRef {
  id: string;
  name: string;
  /** Short label (2–3 chars) for avatar text. */
  short: string;
  color: string;
  email?: string;
  org?: string;
  role?: string;
  /** Marks the viewer themselves. */
  self?: boolean;
}

/**
 * Visual treatment hint for an EventBlock — separated from
 * `CalendarEvent.status` so the primitive stays generic. Consumers map
 * their `type` + `status` into one of these.
 */
export type EventBlockVariant = "solid" | "tint" | "tentative" | "focus";
