import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { ja } from "react-day-picker/locale";
import { CalendarDays, ChevronDown } from "lucide-react";
import { Calendar } from "../components/primitives/Calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/primitives/Popover";
import { Button } from "../components/primitives/Button";
import { Flex, Space, Row, Col } from "../components/primitives/layout";
import { Card } from "../components/primitives/Card";
import { Tag } from "../components/primitives/Tag";
import { Separator } from "../components/primitives/Separator";

const meta: Meta<typeof Calendar> = {
  title: "Primitives/Calendar",
  component: Calendar,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
**Calendar** — date picker grid backed by [react-day-picker v9](https://daypicker.dev).

The primitive is a thin wrapper that themes \`<DayPicker>\` with the
brand tokens via the canonical \`.calendar\` class in \`tokens.css\`.
All standard \`DayPickerProps\` flow through: \`mode\`, \`selected\`,
\`onSelect\`, \`disabled\` (matcher), \`locale\`, \`weekStartsOn\`,
\`numberOfMonths\`, \`footer\`, \`fromDate\` / \`toDate\`,
\`showOutsideDays\`, …

**Selection modes** (per \`mode\` prop):

- \`"single"\` — one day; \`selected: Date | undefined\`.
- \`"multiple"\` — any number of days; \`selected: Date[] | undefined\`.
- \`"range"\` — contiguous span; \`selected: { from, to } | undefined\`.

**Disabling days.** Pass \`disabled\` a \`Matcher\` — a \`Date\`, a
\`{ from, to }\` range, a day-of-week predicate, or a \`(day) =>
boolean\` function. Disabled days are not selectable and announce
appropriately.

**Locale.** Default is English (date-fns \`enUS\`). For Japanese,
import \`{ ja }\` from \`react-day-picker/locale\` and pass
\`locale={ja}\` — month / weekday labels switch to 日 / 月 / 火 / 水 /
木 / 金 / 土. Set \`weekStartsOn={1}\` for Monday-first if the locale
doesn't already imply it.

**Accessibility (WCAG 2.1 AA).** react-day-picker emits a
\`role="grid"\` with proper \`gridcell\` semantics, full keyboard
support (arrow keys / PageUp/PageDown / Home/End), and an optional
\`footer\` slot rendered as a live region so selection changes are
announced to screen readers.
        `.trim(),
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Calendar>;

// ─────────────────────────────────────────────────────────────────────────
// Single-day selection
// ─────────────────────────────────────────────────────────────────────────

const ANCHOR_DATE = new Date(2026, 4, 15); // 2026-05-15 — story anchor date

function SingleDemo() {
  const [date, setDate] = useState<Date | undefined>(ANCHOR_DATE);
  return (
    <Flex vertical gap="middle">
      <Calendar mode="single" selected={date} onSelect={setDate} defaultMonth={ANCHOR_DATE} />
      <Tag color={date ? "success" : "default"}>
        {date ? `Selected: ${date.toISOString().slice(0, 10)}` : "No date selected"}
      </Tag>
    </Flex>
  );
}

export const Default: Story = {
  name: "Default — single-day mode",
  parameters: { controls: { disable: true } },
  render: () => <SingleDemo />,
};

// ─────────────────────────────────────────────────────────────────────────
// Range mode
// ─────────────────────────────────────────────────────────────────────────

function RangeDemo() {
  const [range, setRange] = useState<DateRange | undefined>({
    from: new Date(2026, 4, 10),
    to: new Date(2026, 4, 17),
  });
  return (
    <Flex vertical gap="middle">
      <Calendar mode="range" selected={range} onSelect={setRange} defaultMonth={ANCHOR_DATE} />
      <Space size="small" align="center">
        <Tag color="info">from: {range?.from?.toISOString().slice(0, 10) ?? "—"}</Tag>
        <Tag color="info">to: {range?.to?.toISOString().slice(0, 10) ?? "—"}</Tag>
      </Space>
    </Flex>
  );
}

export const Range: Story = {
  name: "Variants — range mode",
  parameters: { controls: { disable: true } },
  render: () => <RangeDemo />,
};

// ─────────────────────────────────────────────────────────────────────────
// Multiple
// ─────────────────────────────────────────────────────────────────────────

function MultipleDemo() {
  const [days, setDays] = useState<Date[] | undefined>([
    new Date(2026, 4, 5),
    new Date(2026, 4, 12),
    new Date(2026, 4, 15),
  ]);
  return (
    <Flex vertical gap="middle">
      <Calendar mode="multiple" selected={days} onSelect={setDays} defaultMonth={ANCHOR_DATE} />
      <Space size="small" wrap>
        {(days ?? []).map((d) => (
          <Tag key={d.toISOString()} color="info">
            {d.toISOString().slice(0, 10)}
          </Tag>
        ))}
        {(days ?? []).length === 0 && <span style={{ color: "var(--muted-foreground)" }}>No days selected</span>}
      </Space>
    </Flex>
  );
}

export const Multiple: Story = {
  name: "Variants — multiple-day mode",
  parameters: { controls: { disable: true } },
  render: () => <MultipleDemo />,
};

// ─────────────────────────────────────────────────────────────────────────
// Disabled past dates
// ─────────────────────────────────────────────────────────────────────────

export const DisabledPast: Story = {
  name: "States — disabled past dates",
  parameters: { controls: { disable: true } },
  render: () => (
    <Calendar
      mode="single"
      defaultMonth={ANCHOR_DATE}
      disabled={{ before: ANCHOR_DATE }}
    />
  ),
};

// ─────────────────────────────────────────────────────────────────────────
// Disabled weekends
// ─────────────────────────────────────────────────────────────────────────

export const DisabledWeekends: Story = {
  name: "States — disabled weekends",
  parameters: { controls: { disable: true } },
  render: () => (
    <Calendar
      mode="single"
      defaultMonth={ANCHOR_DATE}
      disabled={(day) => day.getDay() === 0 || day.getDay() === 6}
    />
  ),
};

// ─────────────────────────────────────────────────────────────────────────
// Disabled specific range
// ─────────────────────────────────────────────────────────────────────────

export const DisabledRange: Story = {
  name: "States — block a date window",
  parameters: { controls: { disable: true } },
  render: () => (
    <Calendar
      mode="single"
      defaultMonth={ANCHOR_DATE}
      disabled={{ from: new Date(2026, 4, 18), to: new Date(2026, 4, 22) }}
    />
  ),
};

// ─────────────────────────────────────────────────────────────────────────
// fromDate / toDate (bounded picker)
// ─────────────────────────────────────────────────────────────────────────

export const BoundedRange: Story = {
  name: "Variants — bounded with fromDate / toDate",
  parameters: { controls: { disable: true } },
  render: () => (
    <Calendar
      mode="single"
      defaultMonth={ANCHOR_DATE}
      fromDate={new Date(2026, 4, 1)}
      toDate={new Date(2026, 4, 31)}
    />
  ),
};

// ─────────────────────────────────────────────────────────────────────────
// With footer (announces selection to AT)
// ─────────────────────────────────────────────────────────────────────────

function FooterDemo() {
  const [date, setDate] = useState<Date | undefined>(ANCHOR_DATE);
  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      defaultMonth={ANCHOR_DATE}
      footer={
        <div style={{ paddingTop: 8, fontSize: 13, color: "var(--muted-foreground)" }}>
          {date ? <>Selected: <strong>{date.toISOString().slice(0, 10)}</strong></> : "Pick a day"}
        </div>
      }
    />
  );
}

export const WithFooter: Story = {
  name: "Variants — with footer slot",
  parameters: { controls: { disable: true } },
  render: () => <FooterDemo />,
};

// ─────────────────────────────────────────────────────────────────────────
// Multi-month
// ─────────────────────────────────────────────────────────────────────────

export const TwoMonths: Story = {
  name: "Variants — numberOfMonths={2}",
  parameters: { controls: { disable: true } },
  render: () => (
    <Calendar
      mode="range"
      defaultMonth={ANCHOR_DATE}
      numberOfMonths={2}
    />
  ),
};

// ─────────────────────────────────────────────────────────────────────────
// Locale (ja-JP)
// ─────────────────────────────────────────────────────────────────────────

function LocaleJaDemo() {
  const [date, setDate] = useState<Date | undefined>(ANCHOR_DATE);
  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      defaultMonth={ANCHOR_DATE}
      locale={ja}
      weekStartsOn={1}
    />
  );
}

export const LocaleJa: Story = {
  name: "Variants — locale={ja} (Japanese)",
  parameters: { controls: { disable: true } },
  render: () => <LocaleJaDemo />,
};

// ─────────────────────────────────────────────────────────────────────────
// Week starts on Monday
// ─────────────────────────────────────────────────────────────────────────

export const MondayFirst: Story = {
  name: "Variants — weekStartsOn={1} (Monday)",
  parameters: { controls: { disable: true } },
  render: () => (
    <Calendar
      mode="single"
      defaultMonth={ANCHOR_DATE}
      weekStartsOn={1}
    />
  ),
};

// ─────────────────────────────────────────────────────────────────────────
// Hide outside-month days
// ─────────────────────────────────────────────────────────────────────────

export const HideOutsideDays: Story = {
  name: "Variants — showOutsideDays={false}",
  parameters: { controls: { disable: true } },
  render: () => (
    <Calendar
      mode="single"
      defaultMonth={ANCHOR_DATE}
      showOutsideDays={false}
    />
  ),
};

// ─────────────────────────────────────────────────────────────────────────
// Showcase
// ─────────────────────────────────────────────────────────────────────────

export const AllVariants: Story = {
  name: "Showcase — all variants",
  parameters: { controls: { disable: true } },
  render: () => (
    <Row gutter={[16, 16]}>
      <Col xs={24} md={12}>
        <Card title="Single" size="small">
          <Calendar mode="single" defaultMonth={ANCHOR_DATE} selected={ANCHOR_DATE} />
        </Card>
      </Col>
      <Col xs={24} md={12}>
        <Card title="Range" size="small">
          <Calendar
            mode="range"
            defaultMonth={ANCHOR_DATE}
            selected={{ from: new Date(2026, 4, 12), to: new Date(2026, 4, 17) }}
          />
        </Card>
      </Col>
      <Col xs={24} md={12}>
        <Card title="Disabled past" size="small">
          <Calendar mode="single" defaultMonth={ANCHOR_DATE} disabled={{ before: ANCHOR_DATE }} />
        </Card>
      </Col>
      <Col xs={24} md={12}>
        <Card title="Locale ja-JP, Monday-first" size="small">
          <Calendar
            mode="single"
            defaultMonth={ANCHOR_DATE}
            locale={ja}
            weekStartsOn={1}
            selected={ANCHOR_DATE}
          />
        </Card>
      </Col>
    </Row>
  ),
};

// ─────────────────────────────────────────────────────────────────────────
// Realistic composition — date-range filter in a Popover
// ─────────────────────────────────────────────────────────────────────────

function fmt(d: Date | undefined): string {
  if (!d) return "—";
  return d.toISOString().slice(0, 10);
}

function DateRangeFilterDemo() {
  const [range, setRange] = useState<DateRange | undefined>({
    from: new Date(2026, 4, 8),
    to: ANCHOR_DATE,
  });
  const label =
    range?.from && range?.to
      ? `${fmt(range.from)} → ${fmt(range.to)}`
      : "Pick a date range";

  return (
    <Card
      title="Activity"
      subtitle="Filter sandbox events by date"
      extra={
        <Popover>
          <PopoverTrigger asChild>
            <Button size="sm" variant="secondary">
              <CalendarDays size={14} /> {label} <ChevronDown size={14} />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" style={{ width: "auto", padding: 12 }}>
            <Flex vertical gap="small">
              <Calendar
                mode="range"
                selected={range}
                onSelect={setRange}
                defaultMonth={ANCHOR_DATE}
                numberOfMonths={2}
              />
              <Separator />
              <Flex justify="end" gap="small">
                <Button size="sm" variant="ghost" onClick={() => setRange(undefined)}>
                  Clear
                </Button>
                <Button size="sm" variant="primary">Apply</Button>
              </Flex>
            </Flex>
          </PopoverContent>
        </Popover>
      }
    >
      <Flex vertical gap="small">
        <Space size="small" align="center">
          <Tag color="info">from: {fmt(range?.from)}</Tag>
          <Tag color="info">to: {fmt(range?.to)}</Tag>
        </Space>
        <p style={{ margin: 0, fontSize: 13, color: "var(--muted-foreground)" }}>
          Showing activity from {fmt(range?.from)} through {fmt(range?.to)} (Asia/Tokyo).
        </p>
      </Flex>
    </Card>
  );
}

export const DateRangeFilter: Story = {
  name: "Composition — date-range filter (Popover + Calendar)",
  parameters: { controls: { disable: true } },
  render: () => <DateRangeFilterDemo />,
};
