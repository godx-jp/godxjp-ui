import type { Meta } from "@storybook/react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Tooltip } from "../../components/data-display/Tooltip";
import { Button } from "../../components/general/Button";
import { Flex } from "../../components/layout";
import { GodxConfigProvider } from "../../preferences";

/**
 * data-display/Tooltip — Radix-backed
 * floating label.
 *
 * Two equivalent modes on the SAME primitive (no `SimpleTooltip` —
 * cardinal rule 31 forbids parallel convenience wrappers):
 *
 *   • Data-driven — `<Tooltip content="…" placement="top">child</Tooltip>`
 *     auto-wires root + trigger + content.
 * App-wide timing flows through `<GodxConfigProvider tooltipDelay={…}>` —
 * the consumer never imports a separate `TooltipProvider`. Per-tooltip
 * overrides use the `delayDuration` prop on `<Tooltip>` itself.
 *
 * Per cardinal rule 23 §B the `placement` prop is the positional
 * anchor vocabulary shared with Popover (top / right / bottom / left).
 */

const meta: Meta<typeof Tooltip> = {
  title: "Data Display/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
**Tooltip** — keyboard-accessible floating label on hover / focus.
Wraps \`@radix-ui/react-tooltip\` (cardinal rule 3 — Radix for
interactive primitives).
        `.trim(),
      },
    },
  },
};
export default meta;

// ─── Default · 4 placements (data-driven) ───────────────────────

export const FourPlacements = {
  name: "Default · top / right / bottom / left (content prop)",
  render: () => (
    <Flex gap="large" align="center" style={{ padding: 80 }}>
      <Tooltip content="上に表示" placement="top">
        <Button variant="secondary">Top</Button>
      </Tooltip>
      <Tooltip content="右に表示" placement="right">
        <Button variant="secondary">Right</Button>
      </Tooltip>
      <Tooltip content="下に表示" placement="bottom">
        <Button variant="secondary">Bottom</Button>
      </Tooltip>
      <Tooltip content="左に表示" placement="left">
        <Button variant="secondary">Left</Button>
      </Tooltip>
    </Flex>
  ),
  play: async ({ canvasElement, step }: any) => {
    const canvas = within(canvasElement);
    const portal = canvasElement.ownerDocument.body;

    await step("hovering trigger reveals tooltip content", async () => {
      const trigger = canvas.getByRole("button", { name: "Top" });
      await userEvent.hover(trigger);
      await waitFor(
        () => {
          // Radix renders the title both in the visible tooltip-content div
          // and in an aria-live sr-only span — so >= 1 match is expected.
          const matches = within(portal).getAllByText("上に表示");
          expect(matches.length).toBeGreaterThan(0);
        },
        { timeout: 2000 },
      );
    });
  },
};

// ─── Delay variants — per-tooltip override ──────────────────────

export const Delay = {
  name: "Delay · delayDuration prop overrides the app-wide setting",
  render: () => (
    <Flex gap="middle" align="center">
      <Tooltip content="即座に表示" placement="top" delayDuration={0}>
        <Button variant="secondary">No delay</Button>
      </Tooltip>
      <Tooltip content="500ms 後に表示" placement="top" delayDuration={500}>
        <Button variant="secondary">500ms delay</Button>
      </Tooltip>
    </Flex>
  ),
};

// ─── App-wide via GodxConfigProvider ───────────────────────────

export const SharedTiming = {
  name: "App-wide · GodxConfigProvider tooltipDelay=0",
  render: () => (
    // App roots mount <GodxConfigProvider> exactly once. The
    // `tooltipDelay` (+ optional `tooltipSkipDelay`) flows into every
    // nested <Tooltip>; the consumer never imports a separate
    // TooltipProvider.
    <GodxConfigProvider tooltipDelay={0}>
      <Flex gap="middle" align="center">
        <Tooltip content="共有設定 1" placement="top">
          <Button variant="secondary">A</Button>
        </Tooltip>
        <Tooltip content="共有設定 2" placement="top">
          <Button variant="secondary">B</Button>
        </Tooltip>
      </Flex>
    </GodxConfigProvider>
  ),
  play: async ({ canvasElement, step }: any) => {
    const canvas = within(canvasElement);
    const portal = canvasElement.ownerDocument.body;

    await step("provider delay (0ms) opens tooltip near-instantly", async () => {
      const trigger = canvas.getByRole("button", { name: "A" });
      await userEvent.hover(trigger);
      await waitFor(
        () => {
          const matches = within(portal).getAllByText("共有設定 1");
          expect(matches.length).toBeGreaterThan(0);
        },
        { timeout: 500 },
      );
      await userEvent.unhover(trigger);
    });
  },
};
