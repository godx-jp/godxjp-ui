import type { Meta, StoryObj } from "@storybook/react";
import { today, getLocalTimeZone } from "@internationalized/date";
import {
  DateField,
  DatePicker,
  DateRangePicker,
} from "../../components/data-entry/DateTimePicker";
import { Flex } from "../../components/layout";

/**
 * data-entry/DatePicker — date input atoms.
 *
 * Three exports from `DateTimePicker.tsx`, each backed by Adobe React
 * Aria Components + `@internationalized/date`:
 *
 *   - `<DateField>`        — segmented date input (no popover trigger).
 *   - `<DatePicker>`       — segmented trigger + Calendar popover.
 *   - `<DateRangePicker>`  — start / end trigger + RangeCalendar popover.
 *
 * All three are timezone-correct and locale-aware. Visual contract
 * lives in the `.dt-*` classes (tokens.css) — stories don't restyle.
 *
 * Cardinal rules honoured:
 *   §3  — React Aria for keyboard / ARIA / focus.
 *   §21 — every axis (theme/accent/density/font-size) flows via tokens.
 *   §22 — every literal token-pinned through `.dt-*` classes.
 *   §25 — story is docs; primitive is the UI.
 */

const meta: Meta<typeof DatePicker> = {
  title: "Data Entry/DatePicker",
  component: DatePicker,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
**DatePicker family** — three React-Aria-backed date atoms:

- \`<DateField>\` — segmented date input only (no popover).
- \`<DatePicker>\` — segmented trigger + popup Calendar.
- \`<DateRangePicker>\` — start / end segments + popup RangeCalendar.

Values are \`@internationalized/date\` types (\`CalendarDate\`,
\`DateValue\`) so timezone and locale never drift. Convert to JS Date
via \`parseDate\` / \`today(getLocalTimeZone())\`.
        `.trim(),
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof DatePicker>;

// ─── Single date — DatePicker with calendar popover ─────────────

export const SingleDate: Story = {
  name: "DatePicker · single date",
  render: () => (
    <div style={{ maxWidth: 320 }}>
      <DatePicker
        label="入社日"
        description="カレンダーから選択するか直接入力できます。"
        defaultValue={today(getLocalTimeZone())}
      />
    </div>
  ),
};

// ─── Date range — DateRangePicker ───────────────────────────────

export const DateRange: Story = {
  name: "DateRangePicker · 期間",
  render: () => {
    const start = today(getLocalTimeZone());
    const end = start.add({ days: 14 });
    return (
      <div style={{ maxWidth: 380 }}>
        <DateRangePicker
          label="勤務期間"
          description="開始日と終了日を選んでください。"
          defaultValue={{ start, end }}
        />
      </div>
    );
  },
};

// ─── DateField — segmented input only (no popover) ──────────────

export const DateFieldOnly: Story = {
  name: "DateField · segmented input",
  render: () => (
    <Flex vertical gap="middle" style={{ maxWidth: 320 }}>
      <DateField
        label="生年月日"
        description="YYYY/MM/DD で直接入力可能。"
        defaultValue={today(getLocalTimeZone()).subtract({ years: 30 })}
      />
      <DateField
        label="希望日"
        errorMessage="過去の日付は選択できません。"
        isInvalid
        defaultValue={today(getLocalTimeZone()).subtract({ days: 3 })}
      />
    </Flex>
  ),
};

// ─── Disabled ───────────────────────────────────────────────────

export const Disabled: Story = {
  name: "Disabled · all three variants",
  render: () => (
    <Flex vertical gap="middle" style={{ maxWidth: 380 }}>
      <DateField
        label="DateField (disabled)"
        defaultValue={today(getLocalTimeZone())}
        isDisabled
      />
      <DatePicker
        label="DatePicker (disabled)"
        defaultValue={today(getLocalTimeZone())}
        isDisabled
      />
      <DateRangePicker
        label="DateRangePicker (disabled)"
        defaultValue={{
          start: today(getLocalTimeZone()),
          end: today(getLocalTimeZone()).add({ days: 7 }),
        }}
        isDisabled
      />
    </Flex>
  ),
};
