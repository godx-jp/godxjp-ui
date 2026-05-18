import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Time } from "@internationalized/date";
import { TimeField } from "../../components/data-entry/DateTimePicker";
import { TimeInput } from "../../components/data-entry/TimeInput";
import { Flex } from "../../components/layout";

/**
 * data-entry/TimePicker — time input atoms.
 *
 * Two complementary primitives:
 *
 *   - `<TimeField>` — segmented HH:MM (React Aria, timezone-correct,
 *                     locale-aware, keyboard arrow-key increment).
 *   - `<TimeInput>` — plain narrow `<input>` accepting `"HH:mm"` text,
 *                     normalizing on blur. Lighter footprint when no
 *                     segmented UX is needed.
 *
 * Cardinal rules honoured:
 *   §3  — React Aria backing for the segmented variant.
 *   §22 — visual contract lives in `.dt-segments` / `.time-input`.
 *   §25 — story is docs; primitive is the UI.
 */

const meta: Meta<typeof TimeField> = {
  title: "Data Entry/TimePicker",
  component: TimeField,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
**TimeField vs TimeInput**

- \`<TimeField>\` — segmented HH:MM input with arrow-key increment
  (React Aria-backed, ARIA-complete, locale + timezone-aware via
  \`@internationalized/date\`).
- \`<TimeInput>\` — plain narrow \`<input type="text">\` accepting
  free-form HH:MM text and normalizing on blur. Use when the
  segmented UX is overkill (e.g. table cells, filter rows).
        `.trim(),
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof TimeField>;

// ─── TimeField — segmented HH:MM ────────────────────────────────

export const TimeFieldStory: Story = {
  name: "TimeField · 出勤時刻 (segmented)",
  render: () => (
    <div style={{ maxWidth: 240 }}>
      <TimeField
        label="出勤時刻"
        description="矢印キーで時/分を増減できます。"
        defaultValue={new Time(9, 0)}
      />
    </div>
  ),
};

// ─── TimeInput — plain text HH:MM ───────────────────────────────

export const TimeInputStory: Story = {
  name: "TimeInput · plain HH:MM input",
  render: function TimeInputStory() {
    const [value, setValue] = useState("09:30");
    return (
      <Flex vertical gap="small" style={{ maxWidth: 200 }}>
        <label htmlFor="ti-demo" style={{ fontSize: "var(--text-xs)" }}>
          退勤時刻
        </label>
        <TimeInput id="ti-demo" value={value} onChange={setValue} />
        <span
          style={{
            fontSize: "var(--text-xs)",
            color: "var(--muted-foreground)",
          }}
        >
          Normalized value:{" "}
          <code className="mono">{JSON.stringify(value)}</code>
        </span>
      </Flex>
    );
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("typing a new HH:MM value updates the input", async () => {
      const input = canvas.getByDisplayValue("09:30") as HTMLInputElement;
      await userEvent.clear(input);
      await userEvent.type(input, "18:45");
      await waitFor(() => {
        expect(input.value).toBe("18:45");
      });
    });
  },
};

// ─── Disabled ───────────────────────────────────────────────────

export const Disabled: Story = {
  name: "Disabled · both variants",
  render: () => (
    <Flex vertical gap="middle" style={{ maxWidth: 240 }}>
      <TimeField
        label="TimeField (disabled)"
        defaultValue={new Time(17, 30)}
        isDisabled
      />
      <div>
        <label
          htmlFor="ti-disabled"
          style={{
            fontSize: "var(--text-xs)",
            display: "block",
            marginBottom: 4,
          }}
        >
          TimeInput (disabled)
        </label>
        <TimeInput id="ti-disabled" value="17:30" disabled />
      </div>
    </Flex>
  ),
};
