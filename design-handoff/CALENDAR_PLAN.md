# Calendar app — implementation plan

Source handoff: `design-handoff/calendar/godx-admin/project/` (calendar.html
+ calendar-data.jsx + calendar-shell.jsx + calendar-views.jsx +
calendar-extras.jsx).

Target package: `@godxjp/ui`. Goal: rebuild the four artboards (Week,
Month, Day + EventDetail, Agenda) plus the two flow artboards
(CreateEvent modal, FindATime) inside `@godxjp/ui` so a downstream
`services/koyomi-service/frontend/` (or equivalent calendar SPA) can
consume the components 1:1.

CLAUDE.md gate: every primitive added MUST ship a paired
`src/stories/<Name>.stories.tsx`, a `docs/reference/<group>/<Name>.md`,
add tokens FIRST to `src/styles/theme.css`/`tokens-ext.css` if needed,
and follow cardinal rules 1, 2, 13, 17, 18, 19. The calendar product is
service-specific (`暦`/Koyomi), so all `Cal*` / `Koyomi` page-level
compositions land under `src/components/screens/calendar/` (mirroring
`screens/IssueDetailScreen.tsx` precedent). Reusable atoms (EventChip,
MiniMonth, NowLine, etc.) land under `src/components/primitives/` so
other product surfaces can use them. Rule 19 — `koyomi`, `暦`, "Calendar
service", "Famgia" must NOT appear in primitive code or comments; those
strings live only in the screen-level composition + Storybook stories.

## 1. Component map

Coordinates are `<file>:<line>` of the exported function definition.
"Action" classifications:

- **NEW** — no equivalent in `@godxjp/ui` today, must be created.
- **REUSE** — existing primitive covers it as-is.
- **EXTEND** — existing primitive covers it but needs a new prop /
  variant / slot.
- **COMPOSE** — no single new component; a screen-level page composes
  existing primitives + a few NEW atoms.

| Handoff name (file:line) | Shape | Target file in `@godxjp/ui` | Reuse target / notes | Action |
|---|---|---|---|---|
| `MiniMonth` (calendar-shell.jsx:10) | 6×7 month grid with today/selected pill + per-day event dot; Mon-first; `<button>` cells with `--cal-accent` background | `src/components/primitives/MiniMonth.tsx` | Cannot use existing `Calendar` (react-day-picker is a full picker; we need a 22px-cell mini with event dots). NEW primitive. Standalone — does NOT depend on `EventDay` data model; takes `eventDots: Record<YMD, boolean>` map. | **NEW** |
| `CalRow` (calendar-shell.jsx:60) | Calendar-list checkbox row: color-swatch checkbox (border = cal color, fill = cal color when shown) + name + optional "R" read-only marker + hidden native checkbox | `src/components/primitives/ColorSwatchCheckbox.tsx` (atom) — reused by `CalendarList` in the screen | `Checkbox.tsx` uses Radix + checkmark icon; the handoff variant is colored-square style. Add a `variant="swatch"` + `color` prop OR ship dedicated `ColorSwatchCheckbox`. Prefer dedicated component (semantics + a11y label differ — label text wraps the swatch). | **NEW** |
| `CalSidebar` (calendar-shell.jsx:85) | Fixed-width 264px aside: "Create event" pill button + MiniMonth + people search + 3 grouped CalRow sections | `src/components/screens/calendar/CalendarSidebar.tsx` | Not a primitive — page-level shell aside specific to calendar. Composes: `Button` (rounded pill variant — see EXTEND note below), `MiniMonth`, `Input` (search slot), `ColorSwatchCheckbox`. The 8-side `aside` chrome (264px, border-right, scroll) is bespoke to this view, but mirrors the existing `Sidebar` patterns enough to NOT need a new shell primitive. | **COMPOSE (NEW screen)** |
| `CalTopbar` (calendar-shell.jsx:192) | 60px tall topbar: 暦 sticker + product name + Today button + prev/next nav + title H1 + search field + bell/settings icon buttons + 4-tab view switcher (segmented) + avatar | `src/components/screens/calendar/CalendarTopbar.tsx` | Existing `Topbar` is breadcrumb+search+icon-tray shape (different topology). Calendar's topbar has a unique segment-control + date-nav cluster. Build as a screen-level component composing: `Button` (with new icon-only size), new `SegmentedControl` (see below), `Avatar`, `Input` (read-only "search trigger" presentation). | **COMPOSE (NEW screen)** |
| View switcher segment (calendar-shell.jsx:243) | Inline segmented control: `month`/`week`/`day`/`agenda` with active = white bg + border, inactive = transparent on `--surface-2` track | `src/components/primitives/SegmentedControl.tsx` | No existing primitive. Different from `Tabs` (tabs are flat-underline; this is pill-track). Generic — useful across products. ARIA: `role="radiogroup"`, items `role="radio"`. | **NEW** |
| `WeekView` (calendar-views.jsx:127) | 7-column scrolling time grid; header row with day-of-week + day-of-month pill (today highlighted with `--cal-accent`); all-day band row; hour gutter (60px) + 7 GridColumns; now-line on today | `src/components/screens/calendar/WeekView.tsx` | Composition. Atoms it uses (`GridColumn`, `EventBlock`, `NowLine`, `AllDayChip`, `DayHeaderPill`) become primitives so `DayView` and (future) custom views reuse them. | **COMPOSE (NEW screen)** |
| `MonthView` (calendar-views.jsx:255) | 6×7 month grid (Mon-first), each cell shows up to 4 events; weekend tint + dim out-of-month + today pill; "+N more" overflow row; all-day events render as solid color bar, timed events as dot+time+title row | `src/components/screens/calendar/MonthView.tsx` | Composition. Atoms: `MonthCell`, `EventPill` (compact one-line: dot + time + title) become primitives. | **COMPOSE (NEW screen)** |
| `DayView` (calendar-views.jsx:366) | Single-column time grid; large H1 with date number + dow + "Today" pill; all-day chip row; hour gutter + GridColumn + EventBlocks + NowLine | `src/components/screens/calendar/DayView.tsx` | Composition. Re-uses `GridColumn`, `EventBlock`, `NowLine`, `AllDayChip`, `DayHeaderHero` (NEW atom). | **COMPOSE (NEW screen)** |
| `AgendaView` (calendar-views.jsx:465) | List grouped by date; 92px date gutter (dow + day-of-month + month label + NOW pill) | 1fr rail of EventRow buttons with time, title, location, avatar stack | `src/components/screens/calendar/AgendaView.tsx` | Composition. Atoms: `AgendaDayGutter`, `AgendaEventRow`, `AvatarStack` (NEW shared primitive). | **COMPOSE (NEW screen)** |
| `EventBlock` (calendar-views.jsx:26) | Absolutely-positioned timed-event chip with multi-lane horizontal split; 4 visual treatments (organizer/accepted solid-tint, customer solid-color, tentative diagonal-stripes, focus repeating-stripes); selected outline ring | `src/components/primitives/EventBlock.tsx` | NEW primitive. Props: `event`, `color`, `lane`, `lanes`, `selected`, `pxPerMin`, `dayStartH`, `variant: "solid" \| "tint" \| "tentative" \| "focus"`, `onClick`. Must read `--cal-accent` for selected ring but accept `color` prop so it stays service-agnostic. | **NEW** |
| `GridColumn` (calendar-views.jsx:108) | Day column: hour-line divs (60×PX_PER_MIN px) + relative position for absolutely-placed EventBlocks; today background tint | `src/components/primitives/TimeGrid/GridColumn.tsx` | NEW primitive. Sibling: `TimeGutter` (the 60px-wide hour-label column). Both packaged under a `TimeGrid` namespace. Configurable `dayStartH`, `dayEndH`, `pxPerMin`. | **NEW** |
| Hour gutter (calendar-views.jsx:212, 427) | Absolute-positioned hour labels next to each row; `fmtHour(h, locale)` produces `09:00` or `9時` | `src/components/primitives/TimeGrid/TimeGutter.tsx` | NEW primitive sibling to `GridColumn`. Takes `locale`, `dayStartH`, `dayEndH`, `pxPerMin`; renders the column. | **NEW** |
| Now-line indicator (calendar-views.jsx:240, 451) | Horizontal 2px line + 10px dot on a day column at current time, painted in `--cal-accent` | `src/components/primitives/TimeGrid/NowLine.tsx` | NEW primitive. Props: `nowMinutes` (or `nowDate`), `dayStartH`, `pxPerMin`. Auto-refresh on a 1-min interval via internal `useEffect` so consumers don't manage time. | **NEW** |
| Day-header pill (calendar-views.jsx:158-180) | Above each WeekView column: small dow label + 32px circular day number; today = filled `--cal-accent` w/ white, selected = soft tint w/ accent text | `src/components/primitives/DayHeaderPill.tsx` | NEW primitive. Props: `dow`, `day`, `state: "default" \| "today" \| "selected"`. | **NEW** |
| Day-header hero (calendar-views.jsx:387-403) | Above DayView: 32px day number + dow + month + "Today" badge + event-count summary | `src/components/screens/calendar/DayHeaderHero.tsx` | Composition: large `Statistic`-like + `Badge`. Screen-level (page header for DayView), not generic. | **COMPOSE** |
| Month cell (calendar-views.jsx:300-358) | One day of MonthView: day-of-month pill + up-to-4 events + "+N more" overflow | `src/components/primitives/MonthCell.tsx` | NEW primitive. Generic over event-renderer (slot/render-prop) so the cell is reusable for any "calendar with events per day" UI. | **NEW** |
| Event pill (calendar-views.jsx:338-352) | One-line clickable row in MonthCell: 6px color dot + tabular time + title | `src/components/primitives/EventPill.tsx` | NEW primitive. Cousin of `EventBlock` — same data, different layout (single row, no time-grid positioning). | **NEW** |
| All-day event chip (calendar-views.jsx:192-204, 410-421) | Compact rounded button used in WeekView all-day band, DayView header strip, and MonthView all-day rows: solid color bg + white text + truncated title | `src/components/primitives/AllDayChip.tsx` | NEW primitive. Two density modes: `compact` (week-band, monthcell) vs `pill` (dayview header, 99px radius). | **NEW** |
| Attendee avatar stack (calendar-views.jsx:521-546) | Overlapping 22px circle avatars (3 visible) + `+N` pill, border = `--background` for "knockout" effect | `src/components/primitives/AvatarStack.tsx` | NEW primitive — generic, useful beyond calendar. `Avatar.tsx` exists but stacking is bespoke. Props: `items: { id, short, color, name }[]`, `max?: number`, `size?: number`. | **NEW** |
| `EventDetail` (calendar-extras.jsx:10) | Right-side 360px panel: header (dot + title + cal name + status + edit/delete/close icon row), body with 4 icon-prefixed sections (when, where, attendees, description, notifications), footer with RSVP 3-button row | `src/components/screens/calendar/EventDetailPanel.tsx` | Composition. Existing primitives carry most weight: `Button`, `Badge`, `Avatar`. NEW atom: `IconRow` (the consistent 20px-icon + content layout used in the panel body and CreateEventModal). | **COMPOSE (NEW screen)** |
| Icon-prefixed detail row (calendar-extras.jsx:47-59, 199-212, etc.) | `grid-template-columns: 20px 1fr; gap: 10px` row used for when/where/attendees/description/notifications in both EventDetail and CreateEventModal | `src/components/primitives/IconRow.tsx` | NEW primitive. Props: `icon`, `children`. Generic. | **NEW** |
| Attendee chip in modal (calendar-extras.jsx:241-258) | Pill with 18px avatar + name + close ✕; used in CreateEventModal attendee field | `src/components/primitives/AttendeeChip.tsx` | NEW primitive. Cousin of `Tag` but with leading-avatar. Could be Tag variant; prefer dedicated for clearer API. | **NEW** |
| Attendee list row (calendar-extras.jsx:83-103) | EventDetail row: 26px avatar + name + (you) marker + org + RSVP badge | `src/components/primitives/AttendeeListItem.tsx` | NEW primitive. Used in the EventDetail panel attendees section. | **NEW** |
| RSVP button row (calendar-extras.jsx:138-142) | 3-button row: "Có" (primary, `--cal-accent` bg) / "Có thể" (secondary) / "Không" (secondary) | uses existing `Button` with new `accent="cal"` indirection | The handoff inlines `style={{ background: "var(--cal-accent)" }}`. Add a `tone="accent"` token slot to Button OR document the screen-level inline style is acceptable for this single page. Prefer EXTEND: add `tone` prop to `Button` accepting `"primary" \| "accent"` resolving to `var(--primary)` / `var(--accent-color)`, then screen sets `--accent-color: var(--cal-accent)` on its root. | **EXTEND** (Button + screen wrapper var) |
| `CreateEventModal` (calendar-extras.jsx:150) | 880×640 modal with 2-column body (left = form, right = "options" rail). Title input, 4 tabs (event/task/focus/ooo), when/where/attendees/desc sections, footer (cancel / save). Right rail: cal select, free/busy toggle, notifications list, guest permissions checkboxes, info card. | `src/components/screens/calendar/CreateEventDialog.tsx` | Existing `Dialog.tsx` (Radix) provides backdrop + a11y. Compose: `Dialog`, `Tabs` (NOTE: handoff uses `.tabs/.tab` CSS classes directly; will the new screen use `Tabs` primitive or shell CSS? — use primitive for a11y), `Input`, `Select`, `Checkbox`, `Button`, `IconRow`, `AttendeeChip`, `Badge`. NO new primitive. | **COMPOSE (NEW screen)** |
| Repeat-rule selector (calendar-extras.jsx:215-223) | `<select>` styled with `.input` class, 5 options (Không lặp / Hàng ngày / Hàng tuần · thứ 4 / Mỗi 2 tuần / Hàng tháng) | uses existing `Select` primitive | The handoff renders a native `<select>` with `.input`. Real implementation uses `Select.tsx` (Radix). The repeat-options data is consumer-supplied (locale-dependent strings). | **REUSE** |
| Location input + "Tạo Meet" button (calendar-extras.jsx:226-232) | Standard `Input` + secondary `Button` w/ leading lightning icon | existing primitives | Composition pattern, no new primitive. | **REUSE** |
| Cal-select dropdown in right rail (calendar-extras.jsx:289-294) | `<select>` listing user-writable calendars | existing `Select` | The option label can include a leading color-swatch (see `CalendarOption` below). | **REUSE / EXTEND** |
| Calendar option with color swatch | Used inside the cal-select dropdown (option label = swatch + name) | `src/components/primitives/CalendarOption.tsx` | NEW small atom (reused by CreateEventModal and CalendarSidebar). Renders 14×14 colored square + truncated name + optional "(read-only)" suffix. | **NEW** |
| `FindATime` (calendar-extras.jsx:348) | 1100×720 standalone panel: header (title + nav + people count + duration + apply CTA) + grid (180px name col + N-column slot grid for 9-18h × 30min) + per-person row showing busy/tentative/free + chosen-time overlay + suggested-slot chips footer + legend | `src/components/screens/calendar/FindATimePanel.tsx` | Composition. NEW atoms below. | **COMPOSE (NEW screen)** |
| Availability grid row (calendar-extras.jsx:404-444) | Per-person row: avatar/name col + 18 half-hour cells colored by busy/tentative/free | `src/components/primitives/AvailabilityRow.tsx` | NEW primitive. Generic (works for any "person × time-slot" matrix — useful for FocusTime visualisations, on-call planners, etc.). Props: `slots: 0\|1\|2[]`, `selectedRange: [number, number] \| null`. | **NEW** |
| Slot-grid overlay (chosen-time selection) | The accented rectangle inside an AvailabilityRow showing the picked slot range | (atom inside `AvailabilityRow`) | Part of `AvailabilityRow` API — `selectedRange` prop renders it. | (covered above) |
| Suggested-slot chip (calendar-extras.jsx:461-474) | Card-like button: title + sub ("7 người"), accented border if `best` | `src/components/primitives/SuggestedSlotCard.tsx` | NEW primitive — small button card. Variants: `default` / `best` (accent border + accent text). | **NEW** |
| Legend row (calendar-extras.jsx:480-485) | Footer of FindATime: three legend squares + text | inline composition | No new primitive — just `Row` + colored `<span>`s. | **REUSE** |
| `TweaksUI` (calendar.html:81-113) | Tweaks panel listing density/theme/weekStart/showDeclined/accent/locale tweaks | existing `TweaksPanel` + `TweakSection` + `TweakRadio` + `TweakSelect` + `TweakToggle` | Already shipped in `@godxjp/ui` (see Topbar/TweaksPanel stories). The calendar story will configure these with calendar-specific options (accent palette of asagi/ruri/wakatake/shu/fuji). | **REUSE** |

Summary count:
- **NEW primitives** (10): `MiniMonth`, `ColorSwatchCheckbox`, `SegmentedControl`, `EventBlock`, `GridColumn`, `TimeGutter`, `NowLine`, `DayHeaderPill`, `MonthCell`, `EventPill`, `AllDayChip`, `AvatarStack`, `IconRow`, `AttendeeChip`, `AttendeeListItem`, `CalendarOption`, `AvailabilityRow`, `SuggestedSlotCard`. (Actually 18 — accurate count.)
- **NEW screen-level pages** (9): `CalendarSidebar`, `CalendarTopbar`, `WeekView`, `MonthView`, `DayView`, `AgendaView`, `DayHeaderHero`, `EventDetailPanel`, `CreateEventDialog`, `FindATimePanel` (10).
- **EXTEND** (1): `Button` gains `tone="accent"` resolving to `var(--accent-color)` so calendar screens can recolor without inline styles.
- **REUSE** (~6): `Tabs`, `Input`, `Select`, `Checkbox`, `Avatar`, `Badge`, `Button`, `Dialog`, `TweaksPanel*`.

## 2. CSS classes required

Greppable inventory of every `className="…"` literal in the four JSX
sources. The handoff also uses lots of inline `style={{ … }}` — those
inline styles will largely move to tokenised primitive CSS classes when
ported.

| className token | Used in | Status in `src/styles/shell.css` | Action |
|---|---|---|---|
| `cal-frame` | calendar.html:24 (the page-level wrapper) | **MISSING** | Page-level, lives in the screen component's own scoped class, not shell.css. Or add `.cal-frame { width:100%; height:100%; display:flex; flex-direction:column; background:var(--background); color:var(--foreground); overflow:hidden; }` to `src/components/screens/calendar/calendar.css`. |
| `cal-body` | calendar.html:30 | **MISSING** | Same — scoped to the calendar screen. `.cal-body { flex:1; display:flex; min-height:0; overflow:hidden; }`. |
| `modal-backdrop` | calendar.html:33 | **MISSING** | NOT needed in real impl — Radix `Dialog` (existing) provides the backdrop. Drop this class. |
| `row` | shell:368 | **PRESENT** | reuse |
| `col` | shell:370 | **PRESENT** | reuse |
| `row gap-1` | views:84, etc. | **PRESENT** (`.row` + `.gap-1`) | reuse |
| `row gap-2` | shell:62, 121, ext:84, etc. | **PRESENT** | reuse |
| `ml-auto` | shell:123, ext:402, etc. | **PRESENT** (shell:394) | reuse |
| `ml-auto row gap-2` | shell:225, ext:279 | **PRESENT** | reuse |
| `dot` | ext:100, ext:317 | **PRESENT** (shell:390) | reuse |
| `btn btn-primary btn-sm` | ext:139, ext:281, ext:377 | **PRESENT** (shell:192, 196, 212) | reuse. Inline `style={{ background: "var(--cal-accent)" }}` becomes the new `tone="accent"` prop on `Button`. |
| `btn btn-secondary btn-sm` | shell:214, ext:140, etc. | **PRESENT** (shell:200, 212) | reuse |
| `btn btn-ghost btn-sm` | shell:124, 176, 216, ext:38, etc. | **PRESENT** (shell:204, 212) | reuse. Used heavily for 22-30px icon-only buttons — confirm `.btn-sm` is the right density (yes: `--density-element-sm`). |
| `tabs` | ext:185 | **PRESENT** (shell:272) | reuse. Real impl uses `Tabs.tsx` (Radix) for a11y, but the underlying class names are compatible. |
| `tab` | ext:192 | **PRESENT** (shell:274) | reuse |
| `tab[data-active="true"]` (state) | ext:192 | **PRESENT** (shell:278) | reuse |
| `input` | shell:138 (search slot), ext:202, 204, 206, 216, 229, 258, 271, 290 | **PRESENT** (shell:216) | reuse. Used as both `<input>` and as a styled `<div>`/`<select>` "input shell" — Tailwind-friendly. |
| `badge` | ext:100, 317, 318, 373, 374 | **PRESENT** (shell:226) | reuse |
| `badge badge-success` | ext:100 | **PRESENT** (shell:226, 230) | reuse |
| `badge badge-info` | ext:317, 318, 373 | **PRESENT** (shell:226, 238) | reuse |
| `badge badge-neutral` | ext:374 | **PRESENT** (shell:226, 250) | reuse |

**No new shell.css classes required**. Every primitive listed in §1
either (a) renders into inline-styled JSX in the handoff that gets
moved into the primitive's own colocated CSS module in
`src/styles/shell.css` (the established convention — see how
`.kanban-col`, `.issue-card`, `.kpi` already live in shell.css), or
(b) reuses an existing token-driven class.

New class names to add to `src/styles/shell.css` when the primitives
land (one canonical block per primitive — rule 16: tokens FIRST in
`tokens.css`/`tokens-ext.css`, then a class):

| Primitive | New class block in shell.css |
|---|---|
| `MiniMonth` | `.mini-month`, `.mini-month-cell`, `.mini-month-cell[data-state="today"]`, `…[data-state="selected"]`, `…[data-dim="true"]` |
| `ColorSwatchCheckbox` | `.swatch-check`, `.swatch-check-box`, `.swatch-check[data-on="true"]` |
| `SegmentedControl` | `.segctl`, `.segctl-item`, `.segctl-item[data-active="true"]` |
| `EventBlock` | `.event-block`, `.event-block[data-variant="solid\|tint\|tentative\|focus"]`, `.event-block[data-selected="true"]` |
| `TimeGrid/GridColumn` | `.tg-col`, `.tg-col[data-today="true"]`, `.tg-hour-row` |
| `TimeGrid/TimeGutter` | `.tg-gutter`, `.tg-hour-label` |
| `TimeGrid/NowLine` | `.tg-now`, `.tg-now-dot`, `.tg-now-line` |
| `DayHeaderPill` | `.day-pill`, `.day-pill-dow`, `.day-pill-num`, `.day-pill[data-state="today\|selected"]` |
| `MonthCell` | `.month-cell`, `.month-cell-num`, `.month-cell-num[data-state="today"]`, `.month-cell[data-dim="true"]`, `.month-cell[data-weekend="true"]`, `.month-cell-more` |
| `EventPill` | `.event-pill`, `.event-pill-dot`, `.event-pill-time`, `.event-pill-title` |
| `AllDayChip` | `.allday-chip`, `.allday-chip[data-size="compact\|pill"]` |
| `AvatarStack` | `.avatar-stack`, `.avatar-stack-item`, `.avatar-stack-overflow` |
| `IconRow` | `.icon-row`, `.icon-row-icon`, `.icon-row-body` |
| `AttendeeChip` | `.attendee-chip`, `.attendee-chip-avatar`, `.attendee-chip-close` |
| `AttendeeListItem` | `.attendee-row`, `.attendee-row-avatar`, `.attendee-row-name`, `.attendee-row-org`, `.attendee-row-status` |
| `CalendarOption` | `.cal-opt`, `.cal-opt-swatch`, `.cal-opt-name` |
| `AvailabilityRow` | `.avail-row`, `.avail-row-person`, `.avail-row-cells`, `.avail-cell[data-state="0\|1\|2"]`, `.avail-row-overlay` |
| `SuggestedSlotCard` | `.slot-card`, `.slot-card[data-best="true"]`, `.slot-card-label`, `.slot-card-meta` |
| Page wrappers | `.cal-frame`, `.cal-body`, `.cal-sidebar` (264px aside), `.cal-detail-aside` (360px aside) |

## 3. Tokens / theme

The handoff introduces a service-level accent variable
`--cal-accent` and a soft companion `--cal-accent-soft`:

```css
/* calendar.html:15-21 */
:root {
  --cal-accent: oklch(55% 0.12 220);                                /* 浅葱 (asagi) teal */
  --cal-accent-soft: color-mix(in oklch, var(--cal-accent) 14%, transparent);
}
[data-theme="dark"] {
  --cal-accent: oklch(70% 0.13 220);
}
```

Plus a curated palette switcher (`asagi` / `ruri` / `wakatake` / `shu`
/ `fuji`) set via inline `documentElement.style.setProperty` in
`calendar.html:202`.

Existing tokens already in `@godxjp/ui` that the handoff references:

- `--wa-akane` (`theme.css:75`), `--wa-yamabuki` (`theme.css:73`),
  `--wa-ruri` (`theme.css:69`) — used in FindATime busy/tentative cell
  colors + Topbar avatar. **PRESENT, no action.**
- `--surface-1` / `--surface-2` / `--surface-3` / `--surface-inset` —
  used throughout. **PRESENT.**
- `--cal-accent`, `--cal-accent-soft` — **MISSING from `@godxjp/ui`.**

### Recommendation

`--cal-accent` is service-specific (Koyomi/Calendar) per the handoff's
own framing ("Service identity inside the Famgia platform: distinct from
kintai purple, task blue, payslip green, tax orange"). Cardinal rule 19
forbids service-specific tokens in `@godxjp/ui` source. The right
shape is:

1. **Do NOT add `--cal-accent` to `src/styles/theme.css`** (base, cross-tenant).
2. **Do** add a generic `--accent-color` slot to `theme.css` that
   defaults to `var(--primary)` so screen-level pages can re-target it:
   ```css
   :root { --accent-color: var(--primary); }
   ```
3. Calendar primitives (EventBlock selected ring, DayHeaderPill today
   state, MiniMonth today cell, NowLine, AllDayChip primary, etc.)
   reference `var(--accent-color)`, NOT a hardcoded `--cal-accent`.
4. The screen-level wrapper `CalendarApp` (in the downstream
   `services/koyomi-service/frontend/`) sets the calendar service accent
   ONCE on its root:
   ```css
   [data-app="calendar"] {
     --accent-color: oklch(55% 0.12 220);
     --accent-color-soft: color-mix(in oklch, var(--accent-color) 14%, transparent);
   }
   [data-theme="dark"][data-app="calendar"] {
     --accent-color: oklch(70% 0.13 220);
   }
   ```
5. The accent palette switcher (asagi/ruri/wakatake/shu/fuji) lives in
   the consumer's tweaks UI, mutating `--accent-color` on the calendar
   app root.

This keeps `@godxjp/ui` service-agnostic per rule 19 while preserving
the design intent (every primitive's "primary" highlight defers to
whatever the embedding app picks). For Storybook the calendar stories
set `--accent-color` in the story `decorator` so the screenshots match
the handoff.

Companion soft tint:

```css
:root { --accent-color-soft: color-mix(in oklch, var(--accent-color) 14%, transparent); }
```

Already an `--accent` and `--accent-foreground` exist in theme.css (Radix
convention); these are unrelated colour-surfaces (hover background).
Use a distinct name `--accent-color` (or `--brand-accent`) to avoid
collision. Final name decision: `--accent-color` (paired with
`--accent-color-soft`) — short, doesn't conflict, semantically clear.

## 4. Data shape

From `calendar-data.jsx:149` `window.CAL_DATA = { CALENDARS, PEOPLE,
EVENTS, AVAILABILITY, NOTIF_RULES, TODAY, WEEK_START, ymd }`. Storybook
stories should mock the same shape so atoms render realistic content.

### `TODAY` / `WEEK_START` — { y, m, d }

```ts
type YMD = { y: number; m: number; d: number };
const TODAY: YMD       = { y: 2026, m: 5, d: 20 }; // Wed
const WEEK_START: YMD  = { y: 2026, m: 5, d: 18 }; // Mon
```

Helper: `ymd(y, m, d) => "YYYY-MM-DD"` (zero-padded), used as event-key.

### `CALENDARS` — `Calendar[]`

```ts
interface Calendar {
  id: string;                              // "me", "godx-prod", "hol-jp", ...
  name: string;
  owner: "self" | "org" | "shared" | "ext";
  color: string;                           // hex, picked from wa-* palette
  group: "mine" | "org" | "shared";        // sidebar grouping
  shown: boolean;                          // visibility toggle
  org?: string;                            // "godx" | "famgia" | "betoya" | "tempo"
  sharedBy?: string;                       // display name when owner=shared
  readonly?: boolean;                      // hol-* national-holiday cals
}
```

Sample row (calendar-data.jsx:23):
`{ id: "godx-prod", name: "godx-admin · Product", owner: "org", color: "#4c6cb3", group: "org", shown: true, org: "godx" }`.

11 calendars across 3 groups (3 mine + 5 org + 3 shared).

### `PEOPLE` — `Person[]`

```ts
interface Person {
  id: string;            // "yuki", "ha", "minh", ...
  name: string;
  short: string;         // 2-char avatar text ("YT", "HN", "聡")
  email: string;
  org: string;           // "Famgia", "Betoya", "Tempo", "Acme"
  role: string;          // "PM", "Designer", "Director", "CTO", "Buyer"
  color: string;         // hex for avatar
  self?: boolean;        // true for the current viewer (yuki)
}
```

7 people. `yuki` is the viewer (self=true).

### `EVENTS` — `Event[]`

```ts
interface Event {
  id: string;                 // "e-101"
  calId: string;              // ref Calendar.id
  title: string;
  date: string;               // "YYYY-MM-DD"
  allDay?: boolean;
  start?: string;             // "HH:MM" (24h)
  end?: string;               // "HH:MM" (24h)
  attendees: string[];        // ref Person.id[]
  status: "accepted" | "tentative" | "declined" | "organizer";
  type: "meet" | "focus" | "customer" | "personal" | "company";
  location?: string;
  note?: string;
}
```

~30 events across the current week (5/18–5/24) plus ~8 more in
adjacent weeks for MonthView texture. Mix of timed (most), all-day
(holidays + offsite + release-freeze + birthdays), and a few in June.

### `AVAILABILITY` — `Record<personId, number[]>`

18 slots × 5 days (9:00–18:00 in 30-min steps), values:
- `0` = free
- `1` = tentative (yellow stripes)
- `2` = busy (red tint)

Computed at module-load from `EVENTS` so attendees of timed events on
Wed 5/20 show busy automatically; some manual noise added for
kenji/linh/amy.

### `NOTIF_RULES` — `NotifRule[]`

Three example rules (10min before meet, 30min before customer, 08:30
all-day notify). Used in the CreateEventModal notifications section.

## 5. Storybook story plan

Per CLAUDE.md rule 1 + 17 every component ships a paired story. Title
convention follows existing tree: `Primitives/*`, `Composites/*`,
`Shell/*`, `Screens/*`. The calendar pages slot under `Screens/Calendar/*`
to align with the existing precedent (`Pages/` from the task prompt
maps to `Screens/` in this codebase — existing stories use
`title: "Screens/IssueDetailScreen"` style; the calendar tree should
mirror that).

### Screen-level stories

- `Screens/Calendar/Week` — default. Mock `CAL_DATA` baked into story
  args. The "selected event" highlight (`e-124`) is the default arg so
  the screenshot matches handoff artboard A.
- `Screens/Calendar/Month` — matches handoff artboard B; selected month
  = 5/2026.
- `Screens/Calendar/Day` — single-column DayView, today=5/20.
- `Screens/Calendar/DayWithDetail` — DayView + EventDetailPanel
  opened on `e-124`. Matches handoff artboard C.
- `Screens/Calendar/Agenda` — 14-day agenda list, matches artboard D.
- `Screens/Calendar/CreateEvent` — Dialog open, faded-out WeekView
  behind. Matches artboard E.
- `Screens/Calendar/FindATime` — standalone FindATimePanel on
  `--surface-2` background. Matches artboard F.

Each screen story exports 2 story variants — `Default` (light) and
`Dark` (`<div data-theme="dark">` decorator). The `Week` story also
includes a `WithDeclined` variant to exercise the `showDeclined` tweak.

### Per-primitive stories (NEW primitives only)

Standard story shape: `Default`, plus state/variant stories where
relevant.

- `Primitives/MiniMonth` — Default, WithEventDots, DarkTheme.
- `Primitives/ColorSwatchCheckbox` — On, Off, Disabled, ReadonlyMarker.
- `Primitives/SegmentedControl` — TwoItems, FourItems, Disabled.
- `Primitives/EventBlock` — Solid, Tint, Tentative, Focus, Customer,
  Selected, MultiLane.
- `Primitives/TimeGrid` — single story file covering `GridColumn` +
  `TimeGutter` + `NowLine` composed into a one-day demo with several
  EventBlocks.
- `Primitives/DayHeaderPill` — Default, Today, Selected, Weekend.
- `Primitives/MonthCell` — Default, Today, OutOfMonth, Weekend,
  WithOverflow (+N more).
- `Primitives/EventPill` — Default, AllDayVariant.
- `Primitives/AllDayChip` — Compact, Pill.
- `Primitives/AvatarStack` — Three, Many (+N overflow), Sizes.
- `Primitives/IconRow` — Default, MultilineBody.
- `Primitives/AttendeeChip` — Default, Removable.
- `Primitives/AttendeeListItem` — Self, Organizer, Guest, Declined,
  Tentative.
- `Primitives/CalendarOption` — Default, ReadOnly.
- `Primitives/AvailabilityRow` — AllFree, MixedBusyTentative, WithSelection.
- `Primitives/SuggestedSlotCard` — Default, Best.

### Reused-with-extension stories

- `Primitives/Button` — add story variant `ToneAccent` once the
  `tone="accent"` prop lands.

## 6. Implementation order

Dependency-ordered. Each step ships a self-contained PR with: primitive
source + tokens (if any) + paired story + reference docpage + CHANGELOG
entry. Steps that share a single tightly-coupled namespace (e.g. the
`TimeGrid/*` trio) ship together.

**Phase A — tokens + button (foundation).**

1. Add `--accent-color` + `--accent-color-soft` to `src/styles/theme.css`
   defaulting to `var(--primary)` / soft-mix. Document in
   `docs/tokens.md`.
2. EXTEND `Button` with `tone?: "primary" | "accent"` (default
   `"primary"`); accent maps to `var(--accent-color)` background. Story
   + docs update.

**Phase B — pure presentation atoms (no time math, no event types).**

3. `IconRow` (used everywhere).
4. `AvatarStack`.
5. `ColorSwatchCheckbox`.
6. `CalendarOption`.
7. `AttendeeChip`.
8. `AttendeeListItem`.
9. `SegmentedControl`.
10. `AllDayChip`.
11. `DayHeaderPill`.

**Phase C — time-grid primitives (introduce minute-to-px math + now-line).**

12. `TimeGrid` namespace — `GridColumn`, `TimeGutter`, `NowLine` together.
    Includes the helpers `minToY`, `parseHM`, `fmtHour` exported from
    `src/components/primitives/TimeGrid/time.ts` so screens can reuse.
13. `EventBlock` — depends on TimeGrid math.

**Phase D — month / pill atoms (depend on Phase B).**

14. `MonthCell`.
15. `EventPill`.
16. `MiniMonth` (depends on shared Mon-first grid logic; extract helper
    `buildMonthGrid(y, m)` colocated under
    `src/components/primitives/MiniMonth/grid.ts`).

**Phase E — availability + scheduling atoms.**

17. `AvailabilityRow` (depends on grid math reused from TimeGrid).
18. `SuggestedSlotCard`.

**Phase F — screen-level compositions.**

19. `CalendarSidebar` (uses `MiniMonth`, `ColorSwatchCheckbox`, Button,
    Input).
20. `CalendarTopbar` (uses `SegmentedControl`, Button, Avatar, Input).
21. `WeekView` (uses TimeGrid, EventBlock, DayHeaderPill, AllDayChip).
22. `MonthView` (uses MonthCell, EventPill, AllDayChip).
23. `DayView` + `DayHeaderHero` (uses TimeGrid, EventBlock, AllDayChip,
    Badge).
24. `AgendaView` (uses AvatarStack).
25. `EventDetailPanel` (uses IconRow, AttendeeListItem, AvatarStack,
    Badge, Button).
26. `CreateEventDialog` (uses Dialog, Tabs, IconRow, AttendeeChip,
    CalendarOption, Select, Input, Checkbox, Button).
27. `FindATimePanel` (uses AvailabilityRow, SuggestedSlotCard, Badge,
    Button, AvatarStack).

**Phase G — Storybook screen wiring + parity.**

28. Add `Screens/Calendar/*` story file with the 7 story variants from
    §5; mock `CAL_DATA` from `design-handoff/calendar/.../calendar-data.jsx`
    (port to TS).
29. Run `scripts/check-stories-parity.mjs`, `check-docs-parity.mjs`,
    a11y + visual regression. Update `CHANGELOG.md` + adoption tracker
    in `libs/ts/godxjp-ui/README.md`.

Each phase is independently shippable; phases B, D, E can fan out in
parallel once Phase A lands. Phase F items 21–24 (the four views) and
25–27 (the side-panels/modals) can also fan out in parallel within F
once Phases B–E are in. The 7 Storybook stories in Phase G land in
their respective view PRs so each PR is self-validating.
