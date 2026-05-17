import type { Meta, StoryObj } from "@storybook/react";
import { Descriptions } from "../../components/data-display/Descriptions";

/**
 * data-display/Descriptions — Ant-shaped
 * label/value table for static info.
 *
 * Documented props (per `Descriptions.tsx`):
 *   title?:    ReactNode
 *   extra?:    ReactNode
 *   column?:   number                 columns at default breakpoint
 *   layout?:   "horizontal" | "vertical"
 *   bordered?: boolean
 *   size?:     "small" | "default" | "large"
 *
 *   Item.label, Item.span
 *
 * Stories render an employee-profile fixture with 6 entries. Japanese
 * copy mirrors realistic shop / role / shift data.
 */

const meta: Meta<typeof Descriptions> = {
  title: "Data Display/Descriptions",
  component: Descriptions,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
**Descriptions** — Ant-Design label/value table.

Three orthogonal axes:
- \`column\` — grid track count at default breakpoint
- \`layout\` — \`horizontal\` (inline label + value) vs \`vertical\`
  (stacked)
- \`bordered\` — outer + inner hairlines

Each item carries \`label\` + \`span\` (column span). All values pinned
to design tokens via the \`.descriptions-*\` class family.
        `.trim(),
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Descriptions>;

// ─── Default — 6-entry employee profile ─────────────────────────

export const Default: Story = {
  name: "Default · employee profile (6 entries)",
  render: () => (
    <Descriptions title="従業員情報" column={3}>
      <Descriptions.Item label="氏名">田中 美咲</Descriptions.Item>
      <Descriptions.Item label="社員番号">EMP-00482</Descriptions.Item>
      <Descriptions.Item label="所属">渋谷本店</Descriptions.Item>
      <Descriptions.Item label="役職">店長</Descriptions.Item>
      <Descriptions.Item label="入社日">2021年4月1日</Descriptions.Item>
      <Descriptions.Item label="連絡先">090-1234-5678</Descriptions.Item>
    </Descriptions>
  ),
};

// ─── Bordered ───────────────────────────────────────────────────

export const Bordered: Story = {
  name: "Bordered · outer + inner hairlines",
  render: () => (
    <Descriptions title="従業員情報" column={3} bordered>
      <Descriptions.Item label="氏名">田中 美咲</Descriptions.Item>
      <Descriptions.Item label="社員番号">EMP-00482</Descriptions.Item>
      <Descriptions.Item label="所属">渋谷本店</Descriptions.Item>
      <Descriptions.Item label="役職">店長</Descriptions.Item>
      <Descriptions.Item label="入社日">2021年4月1日</Descriptions.Item>
      <Descriptions.Item label="連絡先">090-1234-5678</Descriptions.Item>
    </Descriptions>
  ),
};

// ─── Layout · Vertical ──────────────────────────────────────────

export const Layout_Vertical: Story = {
  name: "Layout · vertical (label above value)",
  render: () => (
    <Descriptions title="従業員情報" column={3} layout="vertical">
      <Descriptions.Item label="氏名">田中 美咲</Descriptions.Item>
      <Descriptions.Item label="社員番号">EMP-00482</Descriptions.Item>
      <Descriptions.Item label="所属">渋谷本店</Descriptions.Item>
      <Descriptions.Item label="役職">店長</Descriptions.Item>
      <Descriptions.Item label="入社日">2021年4月1日</Descriptions.Item>
      <Descriptions.Item label="連絡先">090-1234-5678</Descriptions.Item>
    </Descriptions>
  ),
};
