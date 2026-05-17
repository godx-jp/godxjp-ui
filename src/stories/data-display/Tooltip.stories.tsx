import type { Meta } from "@storybook/react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/data-display/Tooltip";
import { Button } from "../../components/general/Button";
import { Flex } from "../../components/layout";

/**
 * data-display/Tooltip — Radix-backed
 * floating label.
 *
 * Two equivalent modes on the SAME primitive (no `SimpleTooltip` —
 * cardinal rule 31 forbids parallel convenience wrappers):
 *
 *   • Data-driven — `<Tooltip content="…" placement="top">child</Tooltip>`
 *     auto-wires provider + root + trigger + content.
 *   • Compositional — omit `content`, supply your own `TooltipTrigger` +
 *     `TooltipContent` children inside a `<TooltipProvider>`.
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

// ─── Compositional · rich Content ───────────────────────────────

export const Compositional = {
  name: "Compositional · custom multi-line content",
  render: () => (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="primary">Hover me</Button>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={8}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <strong>カスタム本文</strong>
            <span>複数行の説明も表示できます。</span>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};

// ─── Delay variants ─────────────────────────────────────────────

export const Delay = {
  name: "Delay · delayDuration = 0 / 500ms",
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

// ─── Nested · data-driven Tooltip inside TooltipProvider ────────

export const NestedProvider = {
  name: "Nested · data-driven inside TooltipProvider (no double-wrap)",
  render: () => (
    // Outer provider sets the shared delay. Inner data-driven
    // <Tooltip>s detect it and skip their own Provider — the outer
    // delayDuration governs every tip.
    <TooltipProvider delayDuration={0}>
      <Flex gap="middle" align="center">
        <Tooltip content="共有 Provider 1" placement="top">
          <Button variant="secondary">A</Button>
        </Tooltip>
        <Tooltip content="共有 Provider 2" placement="top">
          <Button variant="secondary">B</Button>
        </Tooltip>
      </Flex>
    </TooltipProvider>
  ),
  play: async ({ canvasElement, step }: any) => {
    const canvas = within(canvasElement);
    const portal = canvasElement.ownerDocument.body;

    await step("outer-provider delay (0ms) opens tooltip near-instantly", async () => {
      const trigger = canvas.getByRole("button", { name: "A" });
      await userEvent.hover(trigger);
      // With outer delay=0 the tip should appear quickly.
      await waitFor(
        () => {
          const matches = within(portal).getAllByText("共有 Provider 1");
          expect(matches.length).toBeGreaterThan(0);
        },
        { timeout: 500 },
      );
      await userEvent.unhover(trigger);
    });
  },
};
