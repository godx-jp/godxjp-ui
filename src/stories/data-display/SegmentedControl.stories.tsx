import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { SegmentedControl } from "../../components/data-display/SegmentedControl";
import { Flex } from "../../components/layout";

/**
 * data-display/SegmentedControl — single-choice
 * toggle group (no tab-panel).
 *
 * Documented props (per `SegmentedControl.tsx`):
 *   items:        SegmentedControlItem[]    { value, label, icon?, disabled? }
 *   value?:       string                    controlled selection
 *   defaultValue?: string                   uncontrolled initial
 *   onChange?:    (next) => void
 *   variant?:     "bar" | "pill"            connected row vs rounded pills
 *   size?:        "sm" | "default"          dimensional scale
 *
 * Stories use only documented props per cardinal rule 25.
 */

const meta: Meta<typeof SegmentedControl> = {
  title: "Data Display/SegmentedControl",
  component: SegmentedControl,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
**SegmentedControl** — bare button-row choice picker.

Two variants:
- \`bar\` (default) — connected row with hairline dividers; matches the
  canonical \`.seg\` strip from \`comp-pageheader.html\`.
- \`pill\` — rounded background; active item lifts onto \`--background\`
  with a soft shadow.

Distinct from \`<Tabs>\`: SegmentedControl drives just a value, never a
panel. Use it for view pickers (day / week / month), density toggles,
and similar toolbars.
        `.trim(),
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof SegmentedControl>;

const DAY_WEEK_MONTH = [
  { value: "day", label: "日" },
  { value: "week", label: "週" },
  { value: "month", label: "月" },
] as const;

// ─── Default — day / week / month picker ────────────────────────

export const Default: Story = {
  name: "Default · day / week / month",
  render: () => (
    <SegmentedControl
      items={[...DAY_WEEK_MONTH]}
      defaultValue="month"
      aria-label="表示単位"
    />
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("clicking a different segment moves active state", async () => {
      const dayRadio = canvas.getByRole("radio", { name: "日" });
      await expect(dayRadio).toHaveAttribute("aria-checked", "false");
      await userEvent.click(dayRadio);
      await waitFor(() => {
        expect(dayRadio).toHaveAttribute("aria-checked", "true");
      });
      const monthRadio = canvas.getByRole("radio", { name: "月" });
      await expect(monthRadio).toHaveAttribute("aria-checked", "false");
    });
  },
};

// ─── Sizes — sm / default × bar / pill ──────────────────────────

export const Sizes: Story = {
  name: "Sizes · sm · default × bar · pill",
  render: () => (
    <Flex vertical gap="middle">
      <SegmentedControl
        items={[...DAY_WEEK_MONTH]}
        defaultValue="month"
        size="sm"
        aria-label="表示単位 (sm · bar)"
      />
      <SegmentedControl
        items={[...DAY_WEEK_MONTH]}
        defaultValue="month"
        aria-label="表示単位 (default · bar)"
      />
      <SegmentedControl
        items={[...DAY_WEEK_MONTH]}
        defaultValue="month"
        variant="pill"
        size="sm"
        aria-label="表示単位 (sm · pill)"
      />
      <SegmentedControl
        items={[...DAY_WEEK_MONTH]}
        defaultValue="month"
        variant="pill"
        aria-label="表示単位 (default · pill)"
      />
    </Flex>
  ),
};

// ─── Disabled — per-item `disabled` flag ────────────────────────

export const Disabled: Story = {
  name: "Disabled · per-item disabled flag",
  render: () => (
    <SegmentedControl
      items={[
        { value: "day", label: "日" },
        { value: "week", label: "週", disabled: true },
        { value: "month", label: "月" },
      ]}
      defaultValue="day"
      aria-label="表示単位 (週は無効)"
    />
  ),
};
