import type { Meta, StoryObj } from "@storybook/react";
import { today, getLocalTimeZone, CalendarDate } from "@internationalized/date";
import { Calendar } from "../../../../components/data-display/Calendar";
import { MiniMonth } from "../../../../components/data-display/calendar/MiniMonth";
import { Card } from "../../../../components/data-display/Card";
import { Flex } from "../../../../components/layout";

/**
 * new-primitives/components/data-display/Calendar — date grids.
 *
 * Two exports:
 *
 *   - `<Calendar>` (React Aria) — full month grid with header nav,
 *     keyboard-accessible cells, locale-aware weekday strip.
 *   - `<MiniMonth>` — compact 6×7 grid for sidebar widgets, mon-first,
 *     `today` / `selected` markers, optional event dots.
 *
 * Documented props (per `Calendar.tsx` + `MiniMonth.tsx`):
 *   Calendar:  RACCalendarProps (value, onChange, isDisabled, …) +
 *              className
 *   MiniMonth: year, month, today, selected?, eventDots?, onSelect?,
 *              dowLabels?
 *
 * Stories use the documented APIs only — no inline visual overrides.
 */

const meta: Meta<typeof Calendar> = {
  title: "new-primitives/Components/Data Display/Calendar",
  component: Calendar,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
**Calendar family** — date grid primitives:

- **\`<Calendar>\`** — full month grid (React Aria Components). ARIA
  APG-compliant, keyboard nav (arrows / PageUp/Dn / Home/End),
  timezone-correct via \`@internationalized/date\`.
- **\`<MiniMonth>\`** — compact sidebar grid. Mon-first, JA single-char
  day labels by default, event dots via \`eventDots\` map.

Per cardinal rule 14 the date stack is React Aria + \`@internationalized/date\`
(shadcn community-recommended replacement for \`react-day-picker\`).
        `.trim(),
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Calendar>;

const TZ = getLocalTimeZone();
const TODAY = today(TZ);

// ─── Calendar (full grid, React Aria) ───────────────────────────

export const Default: Story = {
  name: "Calendar · default month grid",
  render: () => (
    <Calendar defaultValue={TODAY} aria-label="日付を選択" />
  ),
};

// ─── MiniMonth (sidebar widget) ─────────────────────────────────

export const MiniMonthSidebar: Story = {
  name: "MiniMonth · sidebar widget",
  render: () => {
    const eventDots: Record<string, boolean> = {};
    // Mark a handful of days in the current month — pinned via the
    // canonical `ymd(y,m,d)` helper shape exported from calendar/time.
    const y = TODAY.year;
    const m = TODAY.month;
    [3, 8, 12, 17, 22, 26].forEach((d) => {
      const key = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      eventDots[key] = true;
    });
    return (
      <Card padding="default" title="2026年 5月" meta="渋谷本店">
        <Flex justify="center">
          <MiniMonth
            year={TODAY.year}
            month={TODAY.month}
            today={{ y: TODAY.year, m: TODAY.month, d: TODAY.day }}
            selected={{ y: TODAY.year, m: TODAY.month, d: TODAY.day }}
            eventDots={eventDots}
          />
        </Flex>
      </Card>
    );
  },
};

// ─── Disabled — read-only state ─────────────────────────────────

export const Disabled: Story = {
  name: "Disabled · isDisabled prop",
  render: () => (
    <Calendar
      isDisabled
      defaultValue={new CalendarDate(TODAY.year, TODAY.month, 15)}
      aria-label="日付を選択 (無効)"
    />
  ),
};
