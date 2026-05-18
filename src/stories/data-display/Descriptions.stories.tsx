import type { Meta, StoryObj } from "@storybook/react";
import { Descriptions } from "../../components/data-display/Descriptions";

const meta: Meta<typeof Descriptions> = {
  title: "Data Display/Descriptions",
  component: Descriptions,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof Descriptions>;

const items = [
  { label: "氏名", value: "田中 美咲" },
  { label: "社員番号", value: "EMP-00482" },
  { label: "所属", value: "渋谷本店" },
  { label: "役職", value: "店長" },
  { label: "入社日", value: "2021年4月1日" },
  { label: "連絡先", value: "090-1234-5678" },
];

export const Default: Story = {
  name: "Default · employee profile (6 entries)",
  render: () => <Descriptions title="従業員情報" column={3} items={items} />,
};

export const Bordered: Story = {
  name: "Bordered · outer + inner hairlines",
  render: () => <Descriptions title="従業員情報" column={3} bordered items={items} />,
};

export const Layout_Vertical: Story = {
  name: "Layout · vertical (label above value)",
  render: () => <Descriptions title="従業員情報" column={3} layout="vertical" items={items} />,
};
