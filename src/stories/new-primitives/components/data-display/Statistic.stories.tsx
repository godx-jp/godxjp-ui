import type { Meta, StoryObj } from "@storybook/react";
import { Statistic } from "../../../../components/data-display/Statistic";
import { Card } from "../../../../components/data-display/Card";
import { Flex } from "../../../../components/layout";

/**
 * new-primitives/components/data-display/Statistic — KPI tile.
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
 *
 * Stories use documented props only per cardinal rule 25.
 */

const meta: Meta<typeof Statistic> = {
  title: "new-primitives/Components/Data Display/Statistic",
  component: Statistic,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
**Statistic** — Ant-Design KPI tile.

Three slots:
- \`title\` — micro-caption above the value
- \`value\` (+ \`prefix\` / \`suffix\`) — the headline number
- \`precision\` / \`formatter\` — numeric formatting hooks

All visual values flow through \`.statistic-*\` classes; per cardinal
rule 25 stories don't restyle.
        `.trim(),
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Statistic>;

// ─── Default ────────────────────────────────────────────────────

export const Default: Story = {
  name: "Default · plain integer KPI",
  render: () => (
    <Flex gap="middle" wrap>
      <Card padding="default">
        <Statistic title="本日の出勤者" value={42} />
      </Card>
      <Card padding="default">
        <Statistic title="申請待ち" value={7} />
      </Card>
      <Card padding="default">
        <Statistic title="承認済" value={128} />
      </Card>
    </Flex>
  ),
};

// ─── WithSuffix — ¥ / % / + ─────────────────────────────────────

export const WithSuffix: Story = {
  name: "WithSuffix · prefix=¥ · suffix=% · suffix=+",
  render: () => (
    <Flex gap="middle" wrap>
      <Card padding="default">
        <Statistic title="月次売上" value={1284560} prefix="¥" />
      </Card>
      <Card padding="default">
        <Statistic title="出勤率" value={96.8} precision={1} suffix="%" />
      </Card>
      <Card padding="default">
        <Statistic title="新規申請" value={12} suffix="+" />
      </Card>
    </Flex>
  ),
};

// ─── WithPrecision — decimal places ─────────────────────────────

export const WithPrecision: Story = {
  name: "WithPrecision · precision=0 · 1 · 2",
  render: () => (
    <Flex gap="middle" wrap>
      <Card padding="default">
        <Statistic title="平均勤務時間" value={8.0421} precision={0} suffix="h" />
      </Card>
      <Card padding="default">
        <Statistic title="平均勤務時間" value={8.0421} precision={1} suffix="h" />
      </Card>
      <Card padding="default">
        <Statistic title="平均勤務時間" value={8.0421} precision={2} suffix="h" />
      </Card>
    </Flex>
  ),
};

// ─── Loading — string "—" placeholder while data resolves ───────

export const Loading: Story = {
  name: "Loading · em-dash placeholder",
  render: () => (
    <Flex gap="middle" wrap>
      <Card padding="default">
        <Statistic title="本日の出勤者" value="—" />
      </Card>
      <Card padding="default">
        <Statistic title="申請待ち" value="—" />
      </Card>
      <Card padding="default">
        <Statistic title="承認済" value="—" />
      </Card>
    </Flex>
  ),
};
