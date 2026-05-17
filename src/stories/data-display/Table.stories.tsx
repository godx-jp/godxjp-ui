import type { Meta, StoryObj } from "@storybook/react";
import { Table, type TableColumn } from "../../components/data-display/Table";
import { Badge } from "../../components/data-display/Badge";
import { Button } from "../../components/general/Button";

const meta: Meta<typeof Table> = {
  title: "Data Display/Table",
  component: Table,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
**Table** — single-component TanStack Table wrapper.

Use only \`<Table columns={columns} data={rows} />\`.
No table subcomponent API is exposed.
        `.trim(),
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Table>;

interface EmployeeRow {
  name: string;
  role: string;
  status: "active" | "leave" | "pending";
}

const EMPLOYEES: EmployeeRow[] = [
  { name: "田中 美咲", role: "店長", status: "active" },
  { name: "佐藤 健太", role: "副店長", status: "active" },
  { name: "鈴木 さくら", role: "スタッフ", status: "pending" },
  { name: "高橋 蓮", role: "スタッフ", status: "active" },
  { name: "伊藤 葵", role: "スタッフ", status: "leave" },
  { name: "渡辺 颯太", role: "スタッフ", status: "active" },
  { name: "山本 結衣", role: "スタッフ", status: "active" },
  { name: "中村 陽斗", role: "アルバイト", status: "pending" },
  { name: "小林 凛", role: "アルバイト", status: "active" },
  { name: "加藤 大翔", role: "アルバイト", status: "active" },
];

function StatusBadge({ status }: { status: EmployeeRow["status"] }) {
  if (status === "active") return <Badge variant="success" dot>稼働中</Badge>;
  if (status === "pending") return <Badge variant="warning" dot>申請中</Badge>;
  return <Badge variant="neutral" dot>休職</Badge>;
}

const EMPLOYEE_COLUMNS: TableColumn<EmployeeRow>[] = [
  {
    accessorKey: "name",
    header: "氏名",
  },
  {
    accessorKey: "role",
    header: "役職",
  },
  {
    accessorKey: "status",
    header: "状態",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
];

export const Default: Story = {
  name: "Default · data driven",
  render: () => (
    <Table
      columns={EMPLOYEE_COLUMNS}
      data={EMPLOYEES}
      getRowId={(row) => row.name}
    />
  ),
};

export const Bordered: Story = {
  name: "Bordered · table-bordered class",
  render: () => (
    <Table
      className="table-bordered"
      columns={EMPLOYEE_COLUMNS}
      data={EMPLOYEES}
      getRowId={(row) => row.name}
    />
  ),
};

export const Density_Compact: Story = {
  name: "Density · compact",
  render: () => (
    <Table
      density="compact"
      columns={EMPLOYEE_COLUMNS}
      data={EMPLOYEES}
      getRowId={(row) => row.name}
    />
  ),
};

export const WithToolbar: Story = {
  name: "WithToolbar · toolbar prop",
  render: () => (
    <Table
      columns={EMPLOYEE_COLUMNS}
      data={EMPLOYEES}
      getRowId={(row) => row.name}
      toolbar={
        <>
          <span className="selection-count">3 件選択中</span>
          <span className="spacer" />
          <Button size="small" variant="ghost">アーカイブ</Button>
          <Button size="small" variant="destructive">削除</Button>
        </>
      }
    />
  ),
};

export const Empty: Story = {
  name: "Empty · custom empty row",
  render: () => (
    <Table
      columns={EMPLOYEE_COLUMNS}
      data={[]}
      empty="該当する従業員がいません"
    />
  ),
};
