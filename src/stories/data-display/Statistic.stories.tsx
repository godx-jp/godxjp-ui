import type { Meta, StoryObj } from "@storybook/react";
import { Statistic } from "../../components/data-display/Statistic";
import { Flex } from "../../components/layout";

/**
 * data-display/Statistic — KPI tile.
 *
 * Documented props (per `Statistic.tsx`):
 *   title?:          ReactNode
 *   value:           number | string
 *   precision?:      number          decimal places (when value is number)
 *   prefix?:         ReactNode       prepended (¥, icon)
 *   suffix?:         ReactNode       appended (%, /mo)
 *   groupSeparator?: boolean         Intl.NumberFormat grouping
 *   formatter?:      (v) => ReactNode
 *   align?:          "left" | "right" | "center"
 *   valueSize?:      number          px override for value font-size
 *   bordered?:       boolean         standalone card surface (border + padding + bg)
 *
 * Stories use documented props only per cardinal rule 25.
 */

const meta: Meta<typeof Statistic> = {
  title: "Data Display/Statistic",
  component: Statistic,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
**Statistic** — Ant-Design KPI tile.

- \`title\` — micro-caption above the value.
- \`value\` (+ \`prefix\` / \`suffix\`) — the headline number.
- \`precision\` / \`formatter\` — numeric formatting hooks.
- \`bordered\` — render with its own card surface (border + padding +
  bg) so you don't wrap with \`<Card>\` just for chrome.

All visual values flow through \`.statistic-*\` classes; per cardinal
rule 25 stories don't restyle.
        `.trim(),
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Statistic>;

// ─── Default — transparent tile (composes inside grids) ─────────

export const Default: Story = {
  name: "Default · transparent tile",
  render: () => (
    <Flex gap="default" wrap>
      <Statistic title="本日の出勤者" value={42} />
      <Statistic title="申請待ち" value={7} />
      <Statistic title="承認済" value={128} />
    </Flex>
  ),
};

// ─── Bordered — standalone card surface ─────────────────────────

export const Bordered: Story = {
  name: "Bordered · standalone card surface",
  render: () => (
    <Flex gap="default" wrap>
      <Statistic bordered title="本日の出勤者" value={42} />
      <Statistic bordered title="申請待ち" value={7} />
      <Statistic bordered title="承認済" value={128} />
    </Flex>
  ),
};

// ─── WithSuffix — ¥ / % / + ─────────────────────────────────────

export const WithSuffix: Story = {
  name: "WithSuffix · prefix=¥ · suffix=% · suffix=+",
  render: () => (
    <Flex gap="default" wrap>
      <Statistic bordered title="月次売上" value={1284560} prefix="¥" />
      <Statistic bordered title="出勤率" value={96.8} precision={1} suffix="%" />
      <Statistic bordered title="新規申請" value={12} suffix="+" />
    </Flex>
  ),
};

// ─── WithPrecision — decimal places ─────────────────────────────

export const WithPrecision: Story = {
  name: "WithPrecision · precision=0 · 1 · 2",
  render: () => (
    <Flex gap="default" wrap>
      <Statistic bordered title="平均勤務時間" value={8.0421} precision={0} suffix="h" />
      <Statistic bordered title="平均勤務時間" value={8.0421} precision={1} suffix="h" />
      <Statistic bordered title="平均勤務時間" value={8.0421} precision={2} suffix="h" />
    </Flex>
  ),
};

// ─── Loading — string "—" placeholder while data resolves ───────

export const Loading: Story = {
  name: "Loading · em-dash placeholder",
  render: () => (
    <Flex gap="default" wrap>
      <Statistic bordered title="本日の出勤者" value="—" />
      <Statistic bordered title="申請待ち" value="—" />
      <Statistic bordered title="承認済" value="—" />
    </Flex>
  ),
};
