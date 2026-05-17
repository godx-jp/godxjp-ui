import type { Meta } from "@storybook/react";
import {
  SimpleTooltip,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../../components/data-display/Tooltip";
import { Button } from "../../../../components/general/Button";
import { Flex } from "../../../../components/layout";

/**
 * new-primitives/components/data-display/Tooltip — Radix-backed
 * floating label.
 *
 * Two surfaces:
 *   • Compositional — `Tooltip` / `TooltipTrigger` / `TooltipContent`
 *     wrap Radix verbatim.
 *   • Convenience  — `SimpleTooltip` wires provider + root + trigger
 *     for the common case.
 *
 * Per cardinal rule 23 §B the `placement` prop is the positional
 * anchor vocabulary shared with Popover (top / right / bottom / left).
 */

const meta: Meta<typeof SimpleTooltip> = {
  title: "new-primitives/Components/Data Display/Tooltip",
  component: SimpleTooltip,
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

// ─── SimpleTooltip · 4 placements ───────────────────────────────

export const SimpleTooltip_FourPlacements = {
  name: "SimpleTooltip · top / right / bottom / left",
  render: () => (
    <Flex gap="large" align="center" style={{ padding: 80 }}>
      <SimpleTooltip title="上に表示" placement="top">
        <Button variant="secondary">Top</Button>
      </SimpleTooltip>
      <SimpleTooltip title="右に表示" placement="right">
        <Button variant="secondary">Right</Button>
      </SimpleTooltip>
      <SimpleTooltip title="下に表示" placement="bottom">
        <Button variant="secondary">Bottom</Button>
      </SimpleTooltip>
      <SimpleTooltip title="左に表示" placement="left">
        <Button variant="secondary">Left</Button>
      </SimpleTooltip>
    </Flex>
  ),
};

// ─── Compositional · custom Content ─────────────────────────────

export const Compositional = {
  name: "Compositional · Tooltip + Content (custom)",
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

// ─── Delay · delayDuration=0 ────────────────────────────────────

export const Delay = {
  name: "Delay · delayDuration = 0",
  render: () => (
    <Flex gap="middle" align="center">
      <SimpleTooltip title="即座に表示" placement="top" delayDuration={0}>
        <Button variant="secondary">No delay</Button>
      </SimpleTooltip>
      <SimpleTooltip title="500ms 後に表示" placement="top" delayDuration={500}>
        <Button variant="secondary">500ms delay</Button>
      </SimpleTooltip>
    </Flex>
  ),
};
