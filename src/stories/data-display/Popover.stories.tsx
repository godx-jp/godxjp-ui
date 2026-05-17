import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/data-display/Popover";
import { Button } from "../../components/general/Button";
import { Flex } from "../../components/layout";

/**
 * data-display/Popover — floating anchored panel.
 *
 * Documented exports (per `Popover.tsx`):
 *   <Popover>            Radix Root
 *   <PopoverTrigger>     Radix Trigger (use `asChild` for own element)
 *   <PopoverAnchor>      Radix Anchor (rarely used)
 *   <PopoverContent>     Portal-rendered floating panel
 *     align?:        "start" | "center" | "end"
 *     side?:         "top" | "right" | "bottom" | "left"
 *     sideOffset?:   number (default 6)
 *
 * Per cardinal rule 25 stories use the Radix API verbatim — visual
 * contract lives in the `.popover-content` class in tokens.css.
 */

const meta: Meta<typeof Popover> = {
  title: "Data Display/Popover",
  component: Popover,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
**Popover** — Radix-backed floating panel anchored to a trigger.

Three exports:
- \`<Popover>\` — root state (open / onOpenChange).
- \`<PopoverTrigger>\` — anchor element; \`asChild\` lets you pass any
  trigger button.
- \`<PopoverContent>\` — portal-rendered floating panel; \`side\` +
  \`align\` + \`sideOffset\` position it relative to the trigger.

Per cardinal rule 23 §B the placement vocabulary is \`side\` (Radix
canonical) — matches the Tooltip vocabulary across the framework.
        `.trim(),
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Popover>;

// ─── Default ────────────────────────────────────────────────────

export const Default: Story = {
  name: "Default · trigger + panel",
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="secondary">詳細を表示</Button>
      </PopoverTrigger>
      <PopoverContent>
        <p style={{ margin: 0 }}>渋谷本店 · 田中 美咲 さんの勤怠詳細</p>
      </PopoverContent>
    </Popover>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const portal = canvasElement.ownerDocument.body;

    await step("clicking trigger opens popover content", async () => {
      const trigger = canvas.getByRole("button", { name: /詳細を表示/ });
      await expect(trigger).toHaveAttribute("aria-expanded", "false");
      await userEvent.click(trigger);
      await waitFor(() => {
        expect(trigger).toHaveAttribute("aria-expanded", "true");
      });
      await waitFor(() => {
        expect(
          within(portal).getByText("渋谷本店 · 田中 美咲 さんの勤怠詳細"),
        ).toBeInTheDocument();
      });
    });
  },
};

// ─── WithRichContent — multi-line + actions ─────────────────────

export const WithRichContent: Story = {
  name: "WithRichContent · header + body + footer",
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="secondary">勤怠詳細</Button>
      </PopoverTrigger>
      <PopoverContent>
        <Flex vertical gap="small">
          <strong>田中 美咲</strong>
          <span className="muted">渋谷本店 · 店長</span>
          <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: 0 }} />
          <span>出勤 09:02 · 退勤 18:14</span>
          <span>休憩 60分 · 残業 0分</span>
          <Flex gap="small" justify="end">
            <Button size="small" variant="ghost">閉じる</Button>
            <Button size="small" variant="primary">承認</Button>
          </Flex>
        </Flex>
      </PopoverContent>
    </Popover>
  ),
};

// ─── Placement — top / right / bottom / left grid ───────────────

export const Placement: Story = {
  name: "Placement · side prop sweep (top · right · bottom · left)",
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "var(--spacing-6)",
        padding: "var(--spacing-8)",
        placeItems: "center",
      }}
    >
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <Popover key={side}>
          <PopoverTrigger asChild>
            <Button variant="secondary">side=&quot;{side}&quot;</Button>
          </PopoverTrigger>
          <PopoverContent side={side}>
            <span>渋谷本店 · {side}</span>
          </PopoverContent>
        </Popover>
      ))}
    </div>
  ),
};
