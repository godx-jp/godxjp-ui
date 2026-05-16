import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import {
  type DateValue,
  type TimeValue,
  Time,
  getLocalTimeZone,
  parseDate,
  parseTime,
  today,
} from "@internationalized/date";
import type { RangeValue } from "react-aria-components";
import {
  DateField,
  TimeField,
  DatePicker,
  DateRangePicker,
} from "../components/primitives/DateTimePicker";
import { Card } from "../components/primitives/Card";
import { Flex, Row, Col } from "../components/primitives/layout";

const meta: Meta = {
  title: "Primitives/Date & Time",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
**DateField / TimeField / DatePicker / DateRangePicker** — segmented
inputs + popover combinations built on
[React Aria Components](https://react-spectrum.adobe.com/react-aria/DatePicker.html) +
[\`@internationalized/date\`](https://react-spectrum.adobe.com/internationalized/date/).

Maps the dxs-kintai handoff patterns A–E
([\`design-handoff/ui-system/dxs-kintai-design-system/project/preview/comp-datetimepicker.html\`](https://github.com/godx-jp/godxjp-ui/blob/main/design-handoff/ui-system/dxs-kintai-design-system/project/preview/comp-datetimepicker.html)):

- **A. DateField** — segmented date input (no popover) for forms
  where keyboard typing matches user intent (date of birth, ID
  expiry, …). Each segment is independently focusable and
  numerically constrained.
- **B. DatePicker** — DateField inline inside a trigger Group, with
  a calendar-icon affordance and a popover that opens the
  \`<Calendar>\`.
- **C. TimeField** — same segmented input pattern, but for time
  (HH:MM, optionally with seconds + AM/PM).
- **D. DatePicker + TimeField side-by-side** — compose the two
  primitives in a Flex container. No combined DateTimePicker; the
  user wires both.
- **E. DateRangePicker** — two DateInputs ([start, end]) inside one
  trigger, popover wraps \`<RangeCalendar>\`.

All four are timezone-correct via \`@internationalized/date\` and
locale-aware via React Aria's I18nProvider.
        `.trim(),
      },
    },
  },
};
export default meta;

const ANCHOR_DATE = parseDate("2026-05-15");

// ─── A — DateField (segmented date, no popover) ────────────────────

function DateFieldDemo() {
  const [value, setValue] = useState<DateValue | null>(ANCHOR_DATE);
  return (
    <DateField
      label="Date of birth"
      description="YYYY/MM/DD — type to navigate segments"
      value={value}
      onChange={setValue}
    />
  );
}

export const DateFieldStory: StoryObj = {
  name: "A. DateField (segmented)",
  render: () => <DateFieldDemo />,
};

// ─── B — DatePicker (trigger + popover + Calendar) ─────────────────

function DatePickerDemo() {
  const [value, setValue] = useState<DateValue | null>(ANCHOR_DATE);
  return (
    <DatePicker
      label="Pick a date"
      description="Type into segments or click the calendar icon"
      value={value}
      onChange={setValue}
    />
  );
}

export const DatePickerStory: StoryObj = {
  name: "B. DatePicker (trigger + popover)",
  render: () => <DatePickerDemo />,
};

// ─── C — TimeField (segmented time) ────────────────────────────────

function TimeFieldDemo() {
  const [value, setValue] = useState<TimeValue | null>(parseTime("09:30"));
  return (
    <TimeField
      label="Start time"
      description="HH:MM — arrow keys to step"
      value={value}
      onChange={setValue}
    />
  );
}

export const TimeFieldStory: StoryObj = {
  name: "C. TimeField (segmented)",
  render: () => <TimeFieldDemo />,
};

// ─── D — DatePicker + TimeField (side-by-side composition) ─────────

function DateTimeComboDemo() {
  const [date, setDate] = useState<DateValue | null>(ANCHOR_DATE);
  const [time, setTime] = useState<TimeValue | null>(new Time(9, 30));
  return (
    <Card title="Shift start" extra={null}>
      <Flex gap="middle" align="end">
        <DatePicker label="Date" value={date} onChange={setDate} />
        <TimeField label="Time" value={time} onChange={setTime} />
      </Flex>
    </Card>
  );
}

export const DateTimeComboStory: StoryObj = {
  name: "D. Date + Time (combined)",
  render: () => <DateTimeComboDemo />,
};

// ─── E — DateRangePicker ───────────────────────────────────────────

function DateRangePickerDemo() {
  const [range, setRange] = useState<RangeValue<DateValue> | null>({
    start: ANCHOR_DATE,
    end: ANCHOR_DATE.add({ days: 4 }),
  });
  return (
    <DateRangePicker
      label="Pick a range"
      description="Start → end · click either segment group to edit"
      value={range}
      onChange={setRange}
    />
  );
}

export const DateRangePickerStory: StoryObj = {
  name: "E. DateRangePicker",
  render: () => <DateRangePickerDemo />,
};

// ─── Bounded date + error states ───────────────────────────────────

function BoundedDemo() {
  const tz = getLocalTimeZone();
  const now = today(tz);
  const [value, setValue] = useState<DateValue | null>(now);
  return (
    <DatePicker
      label="Within next 2 weeks"
      description="minValue=today, maxValue=today+14"
      value={value}
      onChange={setValue}
      minValue={now}
      maxValue={now.add({ days: 14 })}
    />
  );
}

export const Bounded: StoryObj = {
  name: "Bounded (min/max)",
  render: () => <BoundedDemo />,
};

// ─── Disabled / read-only ──────────────────────────────────────────

export const Disabled: StoryObj = {
  name: "Disabled",
  render: () => (
    <Flex vertical gap="middle">
      <DateField label="Disabled DateField" value={ANCHOR_DATE} isDisabled />
      <DatePicker label="Disabled DatePicker" value={ANCHOR_DATE} isDisabled />
      <TimeField
        label="Disabled TimeField"
        value={parseTime("09:30")}
        isDisabled
      />
    </Flex>
  ),
};

// ─── Grid: full pattern matrix ─────────────────────────────────────

function GridDemo() {
  const [date, setDate] = useState<DateValue | null>(ANCHOR_DATE);
  const [time, setTime] = useState<TimeValue | null>(parseTime("09:30"));
  const [range, setRange] = useState<RangeValue<DateValue> | null>({
    start: ANCHOR_DATE,
    end: ANCHOR_DATE.add({ days: 4 }),
  });
  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} md={12}>
        <Card title="A. DateField">
          <DateField value={date} onChange={setDate} />
        </Card>
      </Col>
      <Col xs={24} md={12}>
        <Card title="C. TimeField">
          <TimeField value={time} onChange={setTime} />
        </Card>
      </Col>
      <Col xs={24} md={12}>
        <Card title="B. DatePicker">
          <DatePicker value={date} onChange={setDate} />
        </Card>
      </Col>
      <Col xs={24} md={12}>
        <Card title="E. DateRangePicker">
          <DateRangePicker value={range} onChange={setRange} />
        </Card>
      </Col>
    </Row>
  );
}

export const Grid: StoryObj = {
  name: "Pattern matrix",
  render: () => <GridDemo />,
};
