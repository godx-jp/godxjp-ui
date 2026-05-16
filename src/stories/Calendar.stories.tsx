import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import {
  type DateValue,
  getLocalTimeZone,
  parseDate,
  today,
} from "@internationalized/date";
import type { RangeValue } from "react-aria-components";
import { Calendar, RangeCalendar } from "../components/primitives/Calendar";
import { Flex } from "../components/primitives/layout";
import { Card } from "../components/primitives/Card";
import { Tag } from "../components/primitives/Tag";

const meta: Meta<typeof Calendar> = {
  title: "Primitives/Calendar",
  component: Calendar,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
**Calendar** — accessible date grid built on [React Aria Components](https://react-spectrum.adobe.com/react-aria/Calendar.html) + [@internationalized/date](https://react-spectrum.adobe.com/internationalized/date/).

Adobe React Aria is the shadcn / Radix-ecosystem recommendation for
date input: ARIA APG-compliant, full keyboard navigation (arrow keys,
PageUp/PageDown, Home/End), locale-aware, and timezone-correct.

Two exports:

- \`<Calendar>\` — single date selection. \`value\` is a
  \`CalendarDate\` (or null); convert to/from JS \`Date\` via
  \`parseDate\` / \`today\` / \`getLocalTimeZone\` from
  \`@internationalized/date\`.
- \`<RangeCalendar>\` — contiguous range selection. \`value\` is
  \`{ start, end } | null\`.

Visual theming flows through the four theme axes
([\`new-docs/01-theme-axes.md\`](https://github.com/godx-jp/godxjp-ui/blob/main/new-docs/01-theme-axes.md)):
\`data-theme\`, \`data-accent\`, \`data-density\`, \`data-font-size\`.
        `.trim(),
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Calendar>;

const ANCHOR = parseDate("2026-05-15");

// ─── Single date ────────────────────────────────────────────────────

function SingleDemo() {
  const [value, setValue] = useState<DateValue | null>(ANCHOR);
  return (
    <Flex vertical gap="middle">
      <Calendar value={value} onChange={setValue} aria-label="Pick a date" />
      <Tag color={value ? "success" : "default"}>
        {value ? `Selected: ${value.toString()}` : "No date selected"}
      </Tag>
    </Flex>
  );
}

export const Single: Story = { render: () => <SingleDemo /> };

// ─── Today + min/max bounds ─────────────────────────────────────────

function BoundedDemo() {
  const tz = getLocalTimeZone();
  const now = today(tz);
  const [value, setValue] = useState<DateValue | null>(now);
  return (
    <Calendar
      value={value}
      onChange={setValue}
      minValue={now.subtract({ months: 1 })}
      maxValue={now.add({ months: 2 })}
      aria-label="Pick a date within the allowed window"
    />
  );
}

export const Bounded: Story = { render: () => <BoundedDemo /> };

// ─── Range ──────────────────────────────────────────────────────────

function RangeDemo() {
  const [range, setRange] = useState<RangeValue<DateValue> | null>({
    start: ANCHOR,
    end: ANCHOR.add({ days: 4 }),
  });
  return (
    <Flex vertical gap="middle">
      <RangeCalendar
        value={range}
        onChange={setRange}
        aria-label="Pick a range"
      />
      <Tag color={range ? "success" : "default"}>
        {range
          ? `${range.start.toString()} → ${range.end.toString()}`
          : "No range selected"}
      </Tag>
    </Flex>
  );
}

export const Range: Story = { render: () => <RangeDemo /> };

// ─── Inside a Card ──────────────────────────────────────────────────

function InCardDemo() {
  const [value, setValue] = useState<DateValue | null>(ANCHOR);
  return (
    <Card title="Pick a date" extra={<Tag>{value ? value.toString() : "—"}</Tag>}>
      <Calendar value={value} onChange={setValue} aria-label="Pick a date" />
    </Card>
  );
}

export const InCard: Story = { render: () => <InCardDemo /> };

// ─── Disabled (read-only) ───────────────────────────────────────────

export const Disabled: Story = {
  render: () => (
    <Calendar
      value={ANCHOR}
      isDisabled
      aria-label="A disabled calendar"
    />
  ),
};
