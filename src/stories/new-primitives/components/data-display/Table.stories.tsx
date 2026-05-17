import type { Meta, StoryObj } from "@storybook/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableToolbar,
} from "../../../../components/data-display/Table";
import { Badge } from "../../../../components/data-display/Badge";
import { Button } from "../../../../components/general/Button";

/**
 * new-primitives/components/data-display/Table — semantic table family.
 *
 * Documented exports (per `Table.tsx`):
 *   <Table density? stickyHeader? containerClassName?>
 *   <TableHeader sticky?>
 *   <TableBody>
 *   <TableFooter>
 *   <TableRow>
 *   <TableHead>      ← th
 *   <TableCell>      ← td
 *   <TableCaption>
 *   <TableToolbar>   ← translucent action band over selected rows
 *
 * Stories pin the visual contract via the `.table` / `.table-toolbar`
 * classes — no inline visual overrides per cardinal rule 25.
 */

const meta: Meta<typeof Table> = {
  title: "new-primitives/Components/Data Display/Table",
  component: Table,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
**Table** — semantic table wrapper.

Two density steps:
- \`default\` — 32 / 36 row heights, base font.
- \`compact\` — 28 / 32 row heights, \`text-xs\` font.

Optional \`stickyHeader\` pins \`<thead>\` during vertical scroll.
Compose with the matching atoms (\`TableHeader\` / \`TableBody\` /
\`TableRow\` / \`TableHead\` / \`TableCell\`) like shadcn.
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

function rows() {
  return EMPLOYEES.map((emp) => (
    <TableRow key={emp.name}>
      <TableCell>{emp.name}</TableCell>
      <TableCell>{emp.role}</TableCell>
      <TableCell>
        <StatusBadge status={emp.status} />
      </TableCell>
    </TableRow>
  ));
}

// ─── Default — 10-row employee roster ───────────────────────────

export const Default: Story = {
  name: "Default · 10 employees · name / role / status",
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>氏名</TableHead>
          <TableHead>役職</TableHead>
          <TableHead>状態</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>{rows()}</TableBody>
    </Table>
  ),
};

// ─── Bordered — class hook on the table root ────────────────────

export const Bordered: Story = {
  name: "Bordered · table-bordered class",
  render: () => (
    <Table className="table-bordered">
      <TableHeader>
        <TableRow>
          <TableHead>氏名</TableHead>
          <TableHead>役職</TableHead>
          <TableHead>状態</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>{rows()}</TableBody>
    </Table>
  ),
};

// ─── Density · Compact ──────────────────────────────────────────

export const Density_Compact: Story = {
  name: "Density · compact (28 / 32 row heights)",
  render: () => (
    <Table density="compact">
      <TableHeader>
        <TableRow>
          <TableHead>氏名</TableHead>
          <TableHead>役職</TableHead>
          <TableHead>状態</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>{rows()}</TableBody>
    </Table>
  ),
};

// ─── WithToolbar — translucent action band over selected rows ───

export const WithToolbar: Story = {
  name: "WithToolbar · selection action band",
  render: () => (
    <>
      <TableToolbar>
        <span className="selection-count">3 件選択中</span>
        <span className="spacer" />
        <Button size="small" variant="ghost">アーカイブ</Button>
        <Button size="small" variant="destructive">削除</Button>
      </TableToolbar>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>氏名</TableHead>
            <TableHead>役職</TableHead>
            <TableHead>状態</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>{rows()}</TableBody>
      </Table>
    </>
  ),
};
