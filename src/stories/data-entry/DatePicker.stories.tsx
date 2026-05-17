import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import {
  CalendarDate,
  now,
  parseDate,
  today,
  getLocalTimeZone,
} from "@internationalized/date";
import { I18nProvider } from "react-aria-components";
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
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const portal = canvasElement.ownerDocument.body;

    await step("calendar trigger renders", async () => {
      const trigger = canvas.getByRole("button");
      await expect(trigger).toBeInTheDocument();
    });

    await step("clicking trigger opens the calendar dialog", async () => {
      const trigger = canvas.getByRole("button");
      await userEvent.click(trigger);
      await waitFor(() => {
        expect(within(portal).getByRole("dialog")).toBeInTheDocument();
      });
    });
  },
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

// ─── Empty + placeholderValue — segment formatting before input ─

export const Placeholder: Story = {
  name: "Placeholder · empty state shows segment format",
  render: () => (
    <Flex vertical gap="middle" style={{ maxWidth: 380 }}>
      <DateField
        label="生年月日"
        description="未入力時は yyyy/mm/dd 形式の placeholder が見えます。"
        placeholderValue={new CalendarDate(1990, 1, 1)}
      />
      <DatePicker
        label="申請日"
        description="`placeholderValue` で空欄時の format hint をコントロール。"
        placeholderValue={today(getLocalTimeZone())}
      />
      <DateRangePicker
        label="勤務期間"
        description="開始 / 終了の両セグメントが placeholder を継承。"
        placeholderValue={today(getLocalTimeZone())}
      />
    </Flex>
  ),
};

// ─── Granularity — date + time segments (hour / minute) ─────────

export const Granularity_DateTime: Story = {
  name: "Granularity · day · hour · minute (datetime input)",
  render: () => (
    <Flex vertical gap="middle" style={{ maxWidth: 380 }}>
      <DatePicker
        label="打刻時刻 (分単位)"
        description='`granularity="minute"` で時刻セグメントが付与される。'
        granularity="minute"
        hourCycle={24}
        placeholderValue={now(getLocalTimeZone())}
      />
      <DatePicker
        label="会議 (時単位 · 12h cycle)"
        description='`granularity="hour"` + `hourCycle={12}` で AM/PM 表示。'
        granularity="hour"
        hourCycle={12}
        placeholderValue={now(getLocalTimeZone())}
      />
    </Flex>
  ),
};

// ─── Min/Max — date range constraint ────────────────────────────

export const MinMaxConstrained: Story = {
  name: "Min / Max · constrained selectable range",
  render: () => {
    const anchor = today(getLocalTimeZone());
    return (
      <Flex vertical gap="middle" style={{ maxWidth: 380 }}>
        <DatePicker
          label="入社希望日 (今日以降のみ)"
          description="`minValue={today}` で過去日を非活性化。"
          minValue={anchor}
          placeholderValue={anchor}
        />
        <DatePicker
          label="申請日 (90日先まで)"
          description="`maxValue={today.add({ days: 90 })}` で未来 3 か月以内に制約。"
          maxValue={anchor.add({ days: 90 })}
          placeholderValue={anchor}
        />
      </Flex>
    );
  },
};

// ─── Locale formatting — JP / US / DE rendering ─────────────────

export const Format_Locales: Story = {
  name: "Format · locale-aware segment order (ja-JP · en-US · de-DE)",
  render: () => {
    const date = parseDate("2026-05-17");
    return (
      <Flex vertical gap="middle" style={{ maxWidth: 380 }}>
        <I18nProvider locale="ja-JP">
          <DateField label="ja-JP" defaultValue={date} description="年/月/日 順 · 西暦" />
        </I18nProvider>
        <I18nProvider locale="en-US">
          <DateField label="en-US" defaultValue={date} description="month / day / year" />
        </I18nProvider>
        <I18nProvider locale="de-DE">
          <DateField label="de-DE" defaultValue={date} description="dd.mm.yyyy" />
        </I18nProvider>
      </Flex>
    );
  },
};
