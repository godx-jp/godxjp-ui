import type { Meta, StoryObj } from "@storybook/react";
import { useMemo, useState } from "react";
import { Badge } from "../../components/data-display/Badge";
import {
  Table,
  type TableColumn,
  type TableSort,
  type TableSortState,
} from "../../components/data-display/Table";
import { InputSearch } from "../../components/data-entry/InputSearch";
import { Button } from "../../components/general/Button";
import { Flex } from "../../components/layout";
import employeeRows from "./fixtures/table-employees.json";

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
  id: string;
  date: string;
  name: string;
  kana?: string;
  role: string;
  shop: string;
  kind: "paid" | "late" | "trip" | "absence" | "normal";
  hours: string;
  status: "active" | "leave" | "pending";
  state?: "selected" | "new" | "error" | "disabled" | "editing";
}

const EMPLOYEES = employeeRows as EmployeeRow[];

function getSearchShortcutLabel() {
  if (typeof navigator === "undefined") return "Ctrl K";
  const agent = navigator as Navigator & {
    userAgentData?: { platform?: string };
  };
  const platform = agent.userAgentData?.platform ?? navigator.platform;
  return /mac|iphone|ipad|ipod/i.test(platform) ? "⌘ K" : "Ctrl K";
}

function StatusBadge({ status }: { status: EmployeeRow["status"] }) {
  if (status === "active")
    return (
      <Badge variant="success" dot>
        稼働中
      </Badge>
    );
  if (status === "pending")
    return (
      <Badge variant="warning" dot>
        申請中
      </Badge>
    );
  return (
    <Badge variant="neutral" dot>
      休職
    </Badge>
  );
}

function KindBadge({ kind }: { kind: EmployeeRow["kind"] }) {
  if (kind === "paid")
    return (
      <Badge variant="primary" dot={false}>
        有給
      </Badge>
    );
  if (kind === "late")
    return (
      <Badge variant="attention" dot={false}>
        遅刻
      </Badge>
    );
  if (kind === "trip")
    return (
      <Badge variant="info" dot={false}>
        出張
      </Badge>
    );
  if (kind === "absence")
    return (
      <Badge variant="destructive" dot={false}>
        欠勤
      </Badge>
    );
  return (
    <Badge variant="neutral" dot={false}>
      通常
    </Badge>
  );
}

function AvatarCell({ row }: { row: EmployeeRow }) {
  return (
    <span className="c-avatar">
      <span className="ava">{row.name.slice(0, 1)}</span>
      <span>
        <span className="name">{row.name}</span>
        {row.kana !== undefined && <span className="sub">{row.kana}</span>}
      </span>
    </span>
  );
}

function employeeColumns(): TableColumn<EmployeeRow>[] {
  return [
    {
      accessorKey: "date",
      header: "日付",
      size: 112,
      minSize: 112,
      maxSize: 112,
      meta: {
        sortable: true,
        sticky: { side: "left", from: "md" },
      },
    },
    {
      accessorKey: "name",
      header: "従業員",
      minSize: 180,
      cell: ({ row }) => <AvatarCell row={row.original} />,
      meta: {
        sticky: { side: "left", from: "md" },
      },
    },
    {
      accessorKey: "role",
      header: "役職",
      minSize: 120,
    },
    {
      accessorKey: "shop",
      header: "店舗",
      minSize: 96,
      cell: ({ row }) => <span className="c-mono">{row.original.shop}</span>,
    },
    {
      accessorKey: "kind",
      header: "区分",
      minSize: 88,
      cell: ({ row }) => <KindBadge kind={row.original.kind} />,
    },
    {
      accessorKey: "hours",
      header: "時間",
      minSize: 80,
      meta: { className: "num", sortable: true },
    },
    {
      accessorKey: "status",
      header: "状態",
      minSize: 96,
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      header: "操作",
      size: 56,
      minSize: 56,
      maxSize: 56,
      cell: () => (
        <span className="row-actions">
          <button className="iconbtn" aria-label="操作メニュー">
            ⋯
          </button>
        </span>
      ),
      meta: {
        className: "actions",
        sticky: { side: "right", from: "md" },
      },
    },
  ];
}

const EMPLOYEE_COLUMNS = employeeColumns();

function rowState(row: { original: EmployeeRow }) {
  if (row.original.state === "new") return "is-new";
  if (row.original.state === "error") return "is-error";
  if (row.original.state === "disabled") return "disabled";
  if (row.original.state === "editing") return "is-editing";
  return undefined;
}


export const Default: Story = {
  name: "Default · plain table",
  parameters: {
    docs: {
      source: {
        // Override the auto-generated source — Storybook's react-docgen
        // serializer strips every `cell: ({ row }) => <JSX/>` to
        // `cell: () => {}` (it can't introspect function bodies). The
        // literal string below is what dev sees in the Code panel and
        // is copy-paste-ready: column-by-column with the inline JSX
        // renderers, the data array, and the row helpers (StatusBadge,
        // KindBadge, AvatarCell, rowState) declared as locals.
        language: "tsx",
        code: `import { Table, type TableColumn } from "@godxjp/ui"
import { Badge, Avatar, Typography, Flex } from "@godxjp/ui"

type EmployeeRow = {
  id: string
  date: string
  name: string
  role: string
  shop: string
  kind: "paid" | "late" | "trip" | "absence" | "normal"
  hours: string
  status: "active" | "pending" | "leave"
  kana?: string
  state?: "new" | "error" | "disabled" | "editing" | "selected"
}

// ── Inline cell helpers ────────────────────────────────────────
function StatusBadge({ status }: { status: EmployeeRow["status"] }) {
  if (status === "active")  return <Badge variant="success" dot>稼働中</Badge>
  if (status === "pending") return <Badge variant="warning" dot>申請中</Badge>
  return <Badge variant="neutral" dot>休職</Badge>
}

function KindBadge({ kind }: { kind: EmployeeRow["kind"] }) {
  if (kind === "paid")    return <Badge variant="primary"     dot={false}>有給</Badge>
  if (kind === "late")    return <Badge variant="attention"   dot={false}>遅刻</Badge>
  if (kind === "trip")    return <Badge variant="info"        dot={false}>出張</Badge>
  if (kind === "absence") return <Badge variant="destructive" dot={false}>欠勤</Badge>
  return <Badge variant="neutral" dot={false}>通常</Badge>
}

function AvatarCell({ row }: { row: EmployeeRow }) {
  return (
    <Flex align="center" gap="small">
      <Avatar size="sm" alt={row.name} />
      <Flex vertical gap={2}>
        <Typography.Text strong>{row.name}</Typography.Text>
        {row.kana && (
          <Typography.Text color="secondary" style={{ fontSize: "var(--text-xs)" }}>
            {row.kana}
          </Typography.Text>
        )}
      </Flex>
    </Flex>
  )
}

function rowState(row: { original: EmployeeRow }) {
  if (row.original.state === "new")      return "is-new"
  if (row.original.state === "error")    return "is-error"
  if (row.original.state === "disabled") return "disabled"
  if (row.original.state === "editing")  return "is-editing"
  return undefined
}

// ── Column definitions ────────────────────────────────────────
const columns: TableColumn<EmployeeRow>[] = [
  {
    accessorKey: "date",
    header: "日付",
    size: 112, minSize: 112, maxSize: 112,
    meta: { sortable: true, sticky: { side: "left", from: "md" } },
  },
  {
    accessorKey: "name",
    header: "従業員",
    minSize: 180,
    cell: ({ row }) => <AvatarCell row={row.original} />,
    meta: { sticky: { side: "left", from: "md" } },
  },
  { accessorKey: "role",  header: "役職",  minSize: 120 },
  {
    accessorKey: "shop",
    header: "店舗",
    minSize: 96,
    cell: ({ row }) => <span className="c-mono">{row.original.shop}</span>,
  },
  {
    accessorKey: "kind",
    header: "区分",
    minSize: 88,
    cell: ({ row }) => <KindBadge kind={row.original.kind} />,
  },
  {
    accessorKey: "hours",
    header: "時間",
    minSize: 80,
    meta: { className: "num", sortable: true },
  },
  {
    accessorKey: "status",
    header: "状態",
    minSize: 96,
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: "actions",
    header: "操作",
    size: 56, minSize: 56, maxSize: 56,
    meta: { className: "actions", sticky: { side: "right", from: "md" } },
    cell: () => (
      <span className="row-actions">
        <button className="iconbtn" aria-label="操作メニュー">⋯</button>
      </span>
    ),
  },
]

const data: EmployeeRow[] = [
  { id: "emp-001", date: "05/14 (水)", name: "田中 美咲",   role: "店長",     shop: "渋谷",     kind: "paid",    hours: "8.0h", status: "active" },
  { id: "emp-002", date: "05/14 (水)", name: "Nguyễn Lan", role: "スタッフ", shop: "表参道",   kind: "late",    hours: "0.2h", status: "pending", state: "selected" },
  { id: "emp-003", date: "05/14 (水)", name: "佐藤 健一",   role: "副店長",   shop: "自由が丘", kind: "trip",    hours: "—",    status: "leave",   state: "new" },
  { id: "emp-004", date: "05/13 (火)", name: "山田 太郎",   role: "アルバイト", shop: "新宿",   kind: "absence", hours: "—",    status: "leave" },
  { id: "emp-005", date: "04/30 (水)", name: "高橋 由美",   role: "スタッフ", shop: "渋谷",     kind: "normal",  hours: "8.0h", status: "active",  state: "disabled" },
]

export default function () {
  return (
    <Table
      columns={columns}
      data={data}
      rowKey="id"
      rowClassName={rowState}
    />
  )
}`,
      },
    },
  },
  render: () => (
    <Table
      columns={EMPLOYEE_COLUMNS}
      data={EMPLOYEES.slice(0, 5)}
      rowKey="id"
      rowClassName={rowState}
    />
  ),
};

// Stage 4b: `PackagedFeatures` + `InteractionRegression` moved to
// `src/stories/composites/DataTable.stories.tsx` — the chrome
// (toolbar, views, batch action band, filter chips, pagination) now
// lives on the `<DataTable>` composite.

export const SearchMode_Submit: Story = {
  name: "SearchMode · submit only",
  parameters: {
    docs: {
      source: {
        // Override the auto-generated source — Storybook's react-docgen
        // serializer strips every `cell: ({ row }) => <JSX/>` and
        // `rowClassName` callback to `() => {}`. The literal string
        // below is what dev sees in the Code panel: a self-contained
        // submit-only search wired to <Table>, with the column defs,
        // helpers, and data inlined.
        language: "tsx",
        code: `import { useMemo, useState } from "react"
import {
  Table,
  type TableColumn,
  Badge,
  InputSearch,
  Flex,
} from "@godxjp/ui"

type EmployeeRow = {
  id: string
  date: string
  name: string
  role: string
  shop: string
  kind: "paid" | "late" | "trip" | "absence" | "normal"
  hours: string
  status: "active" | "pending" | "leave"
  kana?: string
  state?: "new" | "error" | "disabled" | "editing" | "selected"
}

function getSearchShortcutLabel() {
  if (typeof navigator === "undefined") return "Ctrl K"
  const platform =
    (navigator as Navigator & { userAgentData?: { platform?: string } })
      .userAgentData?.platform ?? navigator.platform
  return /mac|iphone|ipad|ipod/i.test(platform) ? "⌘ K" : "Ctrl K"
}

function rowState(row: { original: EmployeeRow }) {
  if (row.original.state === "new")      return "is-new"
  if (row.original.state === "error")    return "is-error"
  if (row.original.state === "disabled") return "disabled"
  if (row.original.state === "editing")  return "is-editing"
  return undefined
}

const columns: TableColumn<EmployeeRow>[] = [
  {
    accessorKey: "date",
    header: "日付",
    size: 112, minSize: 112, maxSize: 112,
    meta: { sortable: true, sticky: { side: "left", from: "md" } },
  },
  {
    accessorKey: "name",
    header: "従業員",
    minSize: 180,
    cell: ({ row }) => (
      <span className="c-avatar">
        <span className="ava">{row.original.name.slice(0, 1)}</span>
        <span>
          <span className="name">{row.original.name}</span>
          {row.original.kana !== undefined && (
            <span className="sub">{row.original.kana}</span>
          )}
        </span>
      </span>
    ),
    meta: { sticky: { side: "left", from: "md" } },
  },
  { accessorKey: "role", header: "役職", minSize: 120 },
  {
    accessorKey: "shop",
    header: "店舗",
    minSize: 96,
    cell: ({ row }) => <span className="c-mono">{row.original.shop}</span>,
  },
  {
    accessorKey: "kind",
    header: "区分",
    minSize: 88,
    cell: ({ row }) => {
      const k = row.original.kind
      if (k === "paid")    return <Badge variant="primary"     dot={false}>有給</Badge>
      if (k === "late")    return <Badge variant="attention"   dot={false}>遅刻</Badge>
      if (k === "trip")    return <Badge variant="info"        dot={false}>出張</Badge>
      if (k === "absence") return <Badge variant="destructive" dot={false}>欠勤</Badge>
      return <Badge variant="neutral" dot={false}>通常</Badge>
    },
  },
  {
    accessorKey: "hours",
    header: "時間",
    minSize: 80,
    meta: { className: "num", sortable: true },
  },
  {
    accessorKey: "status",
    header: "状態",
    minSize: 96,
    cell: ({ row }) => {
      const s = row.original.status
      if (s === "active")  return <Badge variant="success" dot>稼働中</Badge>
      if (s === "pending") return <Badge variant="warning" dot>申請中</Badge>
      return <Badge variant="neutral" dot>休職</Badge>
    },
  },
  {
    id: "actions",
    header: "操作",
    size: 56, minSize: 56, maxSize: 56,
    meta: { className: "actions", sticky: { side: "right", from: "md" } },
    cell: () => (
      <span className="row-actions">
        <button className="iconbtn" aria-label="操作メニュー">⋯</button>
      </span>
    ),
  },
]

// Same fixture used by Default · plain table.
const EMPLOYEES: EmployeeRow[] = [
  { id: "emp-001", date: "05/14 (水)", name: "田中 美咲",   role: "店長",     shop: "渋谷",     kind: "paid",    hours: "8.0h", status: "active" },
  { id: "emp-002", date: "05/14 (水)", name: "Nguyễn Lan", role: "スタッフ", shop: "表参道",   kind: "late",    hours: "0.2h", status: "pending", state: "selected" },
  { id: "emp-003", date: "05/14 (水)", name: "佐藤 健一",   role: "副店長",   shop: "自由が丘", kind: "trip",    hours: "—",    status: "leave",   state: "new" },
  { id: "emp-004", date: "05/13 (火)", name: "山田 太郎",   role: "スタッフ", shop: "渋谷",     kind: "absence", hours: "—",    status: "leave",   state: "error" },
  { id: "emp-005", date: "04/30 (水)", name: "高橋 由美",   role: "スタッフ", shop: "渋谷",     kind: "normal",  hours: "8.0h", status: "active",  state: "disabled" },
  // …+7 more (emp-006 … emp-012)
]

export default function () {
  const [draft, setDraft] = useState("")
  const [query, setQuery] = useState("")

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q === "") return EMPLOYEES.slice(0, 5)
    return EMPLOYEES.filter((row) =>
      \`\${row.name} \${row.kana ?? ""} \${row.shop} \${row.role}\`
        .toLowerCase()
        .includes(q),
    )
  }, [query])

  return (
    <Flex vertical gap="default">
      <InputSearch
        aria-label="送信型検索"
        style={{ maxWidth: 360 }}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onSearch={setQuery}
        onClear={() => { setDraft(""); setQuery("") }}
        placeholder="Enter または検索アイコンで検索"
        suffix={<span className="table-kbd">{getSearchShortcutLabel()}</span>}
      />
      <p className="muted" style={{ margin: 0 }}>
        検索条件: {query === "" ? "未実行" : query}
      </p>
      <Table
        columns={columns}
        data={rows}
        getRowId={(row) => row.id}
        rowClassName={rowState}
      />
    </Flex>
  )
}`,
      },
    },
  },
  render: () => {
    const [draft, setDraft] = useState("");
    const [query, setQuery] = useState("");
    const rows = useMemo(() => {
      const normalized = query.trim().toLowerCase();
      if (normalized === "") return EMPLOYEES.slice(0, 5);
      return EMPLOYEES.filter((row) =>
        `${row.name} ${row.kana ?? ""} ${row.shop} ${row.role}`
          .toLowerCase()
          .includes(normalized),
      );
    }, [query]);

    return (
      <Flex vertical gap="default">
        <InputSearch
          aria-label="送信型検索"
          style={{ maxWidth: 360 }}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onSearch={setQuery}
          onClear={() => {
            setDraft("");
            setQuery("");
          }}
          placeholder="Enter または検索アイコンで検索"
          suffix={<span className="table-kbd">{getSearchShortcutLabel()}</span>}
        />
        <p className="muted" style={{ margin: 0 }}>
          検索条件: {query === "" ? "未実行" : query}
        </p>
        <Table
          columns={EMPLOYEE_COLUMNS}
          data={rows}
          getRowId={(row) => row.id}
          rowClassName={rowState}
        />
      </Flex>
    );
  },
};

export const Basic: Story = {
  name: "Basic · plain data table",
  parameters: {
    docs: {
      source: {
        // Override the auto-generated source — Storybook's react-docgen
        // serializer strips every `cell: ({ row }) => <JSX/>` and
        // `rowClassName` callback to `() => {}`. The literal below is
        // the copy-paste-ready Code-panel view: the full 12-row fixture
        // and the column defs with inline cell JSX.
        language: "tsx",
        code: `import { Table, type TableColumn, Badge } from "@godxjp/ui"

type EmployeeRow = {
  id: string
  date: string
  name: string
  role: string
  shop: string
  kind: "paid" | "late" | "trip" | "absence" | "normal"
  hours: string
  status: "active" | "pending" | "leave"
  kana?: string
  state?: "new" | "error" | "disabled" | "editing" | "selected"
}

function rowState(row: { original: EmployeeRow }) {
  if (row.original.state === "new")      return "is-new"
  if (row.original.state === "error")    return "is-error"
  if (row.original.state === "disabled") return "disabled"
  if (row.original.state === "editing")  return "is-editing"
  return undefined
}

const columns: TableColumn<EmployeeRow>[] = [
  {
    accessorKey: "date",
    header: "日付",
    size: 112, minSize: 112, maxSize: 112,
    meta: { sortable: true, sticky: { side: "left", from: "md" } },
  },
  {
    accessorKey: "name",
    header: "従業員",
    minSize: 180,
    cell: ({ row }) => (
      <span className="c-avatar">
        <span className="ava">{row.original.name.slice(0, 1)}</span>
        <span>
          <span className="name">{row.original.name}</span>
          {row.original.kana !== undefined && (
            <span className="sub">{row.original.kana}</span>
          )}
        </span>
      </span>
    ),
    meta: { sticky: { side: "left", from: "md" } },
  },
  { accessorKey: "role", header: "役職", minSize: 120 },
  {
    accessorKey: "shop",
    header: "店舗",
    minSize: 96,
    cell: ({ row }) => <span className="c-mono">{row.original.shop}</span>,
  },
  {
    accessorKey: "kind",
    header: "区分",
    minSize: 88,
    cell: ({ row }) => {
      const k = row.original.kind
      if (k === "paid")    return <Badge variant="primary"     dot={false}>有給</Badge>
      if (k === "late")    return <Badge variant="attention"   dot={false}>遅刻</Badge>
      if (k === "trip")    return <Badge variant="info"        dot={false}>出張</Badge>
      if (k === "absence") return <Badge variant="destructive" dot={false}>欠勤</Badge>
      return <Badge variant="neutral" dot={false}>通常</Badge>
    },
  },
  {
    accessorKey: "hours",
    header: "時間",
    minSize: 80,
    meta: { className: "num", sortable: true },
  },
  {
    accessorKey: "status",
    header: "状態",
    minSize: 96,
    cell: ({ row }) => {
      const s = row.original.status
      if (s === "active")  return <Badge variant="success" dot>稼働中</Badge>
      if (s === "pending") return <Badge variant="warning" dot>申請中</Badge>
      return <Badge variant="neutral" dot>休職</Badge>
    },
  },
  {
    id: "actions",
    header: "操作",
    size: 56, minSize: 56, maxSize: 56,
    meta: { className: "actions", sticky: { side: "right", from: "md" } },
    cell: () => (
      <span className="row-actions">
        <button className="iconbtn" aria-label="操作メニュー">⋯</button>
      </span>
    ),
  },
]

const data: EmployeeRow[] = [
  { id: "emp-001", date: "05/14 (水)", name: "田中 美咲",   role: "店長",       shop: "渋谷",     kind: "paid",    hours: "8.0h", status: "active" },
  { id: "emp-002", date: "05/14 (水)", name: "Nguyễn Lan", role: "スタッフ",   shop: "表参道",   kind: "late",    hours: "0.2h", status: "pending", state: "selected" },
  { id: "emp-003", date: "05/14 (水)", name: "佐藤 健一",   role: "副店長",     shop: "自由が丘", kind: "trip",    hours: "—",    status: "leave",   state: "new" },
  { id: "emp-004", date: "05/13 (火)", name: "山田 太郎",   role: "スタッフ",   shop: "渋谷",     kind: "absence", hours: "—",    status: "leave",   state: "error" },
  { id: "emp-005", date: "04/30 (水)", name: "高橋 由美",   role: "スタッフ",   shop: "渋谷",     kind: "normal",  hours: "8.0h", status: "active",  state: "disabled" },
  { id: "emp-006", date: "05/12 (月)", name: "鈴木 さくら", role: "アルバイト", shop: "新宿",     kind: "late",    hours: "0.5h", status: "pending", state: "editing" },
  { id: "emp-007", date: "05/11 (日)", name: "渡辺 颯太",   role: "スタッフ",   shop: "表参道",   kind: "normal",  hours: "8.0h", status: "active" },
  { id: "emp-008", date: "05/10 (土)", name: "山本 結衣",   role: "スタッフ",   shop: "渋谷",     kind: "paid",    hours: "7.5h", status: "active" },
  { id: "emp-009", date: "05/09 (金)", name: "中村 陽斗",   role: "アルバイト", shop: "新宿",     kind: "late",    hours: "0.1h", status: "pending" },
  { id: "emp-010", date: "05/08 (木)", name: "小林 凛",     role: "アルバイト", shop: "自由が丘", kind: "trip",    hours: "—",    status: "active" },
  { id: "emp-011", date: "05/07 (水)", name: "加藤 大翔",   role: "アルバイト", shop: "表参道",   kind: "normal",  hours: "6.0h", status: "active" },
  { id: "emp-012", date: "05/06 (火)", name: "井上 真央",   role: "スタッフ",   shop: "渋谷",     kind: "absence", hours: "—",    status: "leave" },
]

export default function () {
  return (
    <Table
      columns={columns}
      data={data}
      getRowId={(row) => row.name}
      rowClassName={rowState}
    />
  )
}`,
      },
    },
  },
  render: () => (
    <Table
      columns={EMPLOYEE_COLUMNS}
      data={EMPLOYEES}
      getRowId={(row) => row.name}
      rowClassName={rowState}
    />
  ),
};

export const Bordered: Story = {
  name: "Bordered · table-bordered class",
  parameters: {
    docs: {
      source: {
        // Override the auto-generated source — Storybook's react-docgen
        // serializer strips every `cell: ({ row }) => <JSX/>` and
        // `rowClassName` callback to `() => {}`. Same column/data setup
        // as Basic, with the `table-bordered` className opt-in spelled
        // out so dev can copy-paste-run.
        language: "tsx",
        code: `import { Table, type TableColumn, Badge } from "@godxjp/ui"

type EmployeeRow = {
  id: string
  date: string
  name: string
  role: string
  shop: string
  kind: "paid" | "late" | "trip" | "absence" | "normal"
  hours: string
  status: "active" | "pending" | "leave"
  kana?: string
  state?: "new" | "error" | "disabled" | "editing" | "selected"
}

function rowState(row: { original: EmployeeRow }) {
  if (row.original.state === "new")      return "is-new"
  if (row.original.state === "error")    return "is-error"
  if (row.original.state === "disabled") return "disabled"
  if (row.original.state === "editing")  return "is-editing"
  return undefined
}

const columns: TableColumn<EmployeeRow>[] = [
  {
    accessorKey: "date",
    header: "日付",
    size: 112, minSize: 112, maxSize: 112,
    meta: { sortable: true, sticky: { side: "left", from: "md" } },
  },
  {
    accessorKey: "name",
    header: "従業員",
    minSize: 180,
    cell: ({ row }) => (
      <span className="c-avatar">
        <span className="ava">{row.original.name.slice(0, 1)}</span>
        <span>
          <span className="name">{row.original.name}</span>
          {row.original.kana !== undefined && (
            <span className="sub">{row.original.kana}</span>
          )}
        </span>
      </span>
    ),
    meta: { sticky: { side: "left", from: "md" } },
  },
  { accessorKey: "role", header: "役職", minSize: 120 },
  {
    accessorKey: "shop",
    header: "店舗",
    minSize: 96,
    cell: ({ row }) => <span className="c-mono">{row.original.shop}</span>,
  },
  {
    accessorKey: "kind",
    header: "区分",
    minSize: 88,
    cell: ({ row }) => {
      const k = row.original.kind
      if (k === "paid")    return <Badge variant="primary"     dot={false}>有給</Badge>
      if (k === "late")    return <Badge variant="attention"   dot={false}>遅刻</Badge>
      if (k === "trip")    return <Badge variant="info"        dot={false}>出張</Badge>
      if (k === "absence") return <Badge variant="destructive" dot={false}>欠勤</Badge>
      return <Badge variant="neutral" dot={false}>通常</Badge>
    },
  },
  {
    accessorKey: "hours",
    header: "時間",
    minSize: 80,
    meta: { className: "num", sortable: true },
  },
  {
    accessorKey: "status",
    header: "状態",
    minSize: 96,
    cell: ({ row }) => {
      const s = row.original.status
      if (s === "active")  return <Badge variant="success" dot>稼働中</Badge>
      if (s === "pending") return <Badge variant="warning" dot>申請中</Badge>
      return <Badge variant="neutral" dot>休職</Badge>
    },
  },
  {
    id: "actions",
    header: "操作",
    size: 56, minSize: 56, maxSize: 56,
    meta: { className: "actions", sticky: { side: "right", from: "md" } },
    cell: () => (
      <span className="row-actions">
        <button className="iconbtn" aria-label="操作メニュー">⋯</button>
      </span>
    ),
  },
]

const data: EmployeeRow[] = [
  { id: "emp-001", date: "05/14 (水)", name: "田中 美咲",   role: "店長",       shop: "渋谷",     kind: "paid",    hours: "8.0h", status: "active" },
  { id: "emp-002", date: "05/14 (水)", name: "Nguyễn Lan", role: "スタッフ",   shop: "表参道",   kind: "late",    hours: "0.2h", status: "pending", state: "selected" },
  { id: "emp-003", date: "05/14 (水)", name: "佐藤 健一",   role: "副店長",     shop: "自由が丘", kind: "trip",    hours: "—",    status: "leave",   state: "new" },
  { id: "emp-004", date: "05/13 (火)", name: "山田 太郎",   role: "スタッフ",   shop: "渋谷",     kind: "absence", hours: "—",    status: "leave",   state: "error" },
  { id: "emp-005", date: "04/30 (水)", name: "高橋 由美",   role: "スタッフ",   shop: "渋谷",     kind: "normal",  hours: "8.0h", status: "active",  state: "disabled" },
  { id: "emp-006", date: "05/12 (月)", name: "鈴木 さくら", role: "アルバイト", shop: "新宿",     kind: "late",    hours: "0.5h", status: "pending", state: "editing" },
  { id: "emp-007", date: "05/11 (日)", name: "渡辺 颯太",   role: "スタッフ",   shop: "表参道",   kind: "normal",  hours: "8.0h", status: "active" },
  { id: "emp-008", date: "05/10 (土)", name: "山本 結衣",   role: "スタッフ",   shop: "渋谷",     kind: "paid",    hours: "7.5h", status: "active" },
  { id: "emp-009", date: "05/09 (金)", name: "中村 陽斗",   role: "アルバイト", shop: "新宿",     kind: "late",    hours: "0.1h", status: "pending" },
  { id: "emp-010", date: "05/08 (木)", name: "小林 凛",     role: "アルバイト", shop: "自由が丘", kind: "trip",    hours: "—",    status: "active" },
  { id: "emp-011", date: "05/07 (水)", name: "加藤 大翔",   role: "アルバイト", shop: "表参道",   kind: "normal",  hours: "6.0h", status: "active" },
  { id: "emp-012", date: "05/06 (火)", name: "井上 真央",   role: "スタッフ",   shop: "渋谷",     kind: "absence", hours: "—",    status: "leave" },
]

// "table-bordered" is a CSS opt-in that adds vertical column separators
// + a rule under the header row. Style sheet: src/styles/shell/40-table.css.
export default function () {
  return (
    <Table
      className="table-bordered"
      columns={columns}
      data={data}
      getRowId={(row) => row.name}
      rowClassName={rowState}
    />
  )
}`,
      },
    },
  },
  render: () => (
    <Table
      className="table-bordered"
      columns={EMPLOYEE_COLUMNS}
      data={EMPLOYEES}
      getRowId={(row) => row.name}
      rowClassName={rowState}
    />
  ),
};

export const Density_Compact: Story = {
  name: "Density · compact",
  parameters: {
    docs: {
      source: {
        // Override: Storybook's react-docgen serializer strips every
        // `cell: ({ row }) => <JSX/>` and `rowClassName` to `() => {}`.
        // The literal below is copy-paste-ready: column-by-column with
        // the inline JSX renderers, the data array, and the row helper
        // spelled out as a local.
        language: "tsx",
        code: `import { Table, type TableColumn } from "@godxjp/ui"
import { Badge } from "@godxjp/ui"

type EmployeeRow = {
  id: string
  date: string
  name: string
  role: string
  shop: string
  kind: "paid" | "late" | "trip" | "absence" | "normal"
  hours: string
  status: "active" | "pending" | "leave"
  kana?: string
  state?: "new" | "error" | "disabled" | "editing" | "selected"
}

function rowState(row: { original: EmployeeRow }) {
  if (row.original.state === "new")      return "is-new"
  if (row.original.state === "error")    return "is-error"
  if (row.original.state === "disabled") return "disabled"
  if (row.original.state === "editing")  return "is-editing"
  return undefined
}

const columns: TableColumn<EmployeeRow>[] = [
  {
    accessorKey: "date",
    header: "日付",
    size: 112, minSize: 112, maxSize: 112,
    meta: { sortable: true, sticky: { side: "left", from: "md" } },
  },
  {
    accessorKey: "name",
    header: "従業員",
    minSize: 180,
    cell: ({ row }) => (
      <span className="c-avatar">
        <span className="ava">{row.original.name.slice(0, 1)}</span>
        <span>
          <span className="name">{row.original.name}</span>
          {row.original.kana !== undefined && (
            <span className="sub">{row.original.kana}</span>
          )}
        </span>
      </span>
    ),
    meta: { sticky: { side: "left", from: "md" } },
  },
  { accessorKey: "role", header: "役職", minSize: 120 },
  {
    accessorKey: "shop",
    header: "店舗",
    minSize: 96,
    cell: ({ row }) => <span className="c-mono">{row.original.shop}</span>,
  },
  {
    accessorKey: "kind",
    header: "区分",
    minSize: 88,
    cell: ({ row }) => {
      const k = row.original.kind
      if (k === "paid")    return <Badge variant="primary"     dot={false}>有給</Badge>
      if (k === "late")    return <Badge variant="attention"   dot={false}>遅刻</Badge>
      if (k === "trip")    return <Badge variant="info"        dot={false}>出張</Badge>
      if (k === "absence") return <Badge variant="destructive" dot={false}>欠勤</Badge>
      return <Badge variant="neutral" dot={false}>通常</Badge>
    },
  },
  {
    accessorKey: "hours",
    header: "時間",
    minSize: 80,
    meta: { className: "num", sortable: true },
  },
  {
    accessorKey: "status",
    header: "状態",
    minSize: 96,
    cell: ({ row }) => {
      const s = row.original.status
      if (s === "active")  return <Badge variant="success" dot>稼働中</Badge>
      if (s === "pending") return <Badge variant="warning" dot>申請中</Badge>
      return <Badge variant="neutral" dot>休職</Badge>
    },
  },
  {
    id: "actions",
    header: "操作",
    size: 56, minSize: 56, maxSize: 56,
    meta: { className: "actions", sticky: { side: "right", from: "md" } },
    cell: () => (
      <span className="row-actions">
        <button className="iconbtn" aria-label="操作メニュー">⋯</button>
      </span>
    ),
  },
]

const data: EmployeeRow[] = [
  { id: "emp-001", date: "05/14 (水)", name: "田中 美咲",   role: "店長",       shop: "渋谷",     kind: "paid",    hours: "8.0h", status: "active" },
  { id: "emp-002", date: "05/14 (水)", name: "Nguyễn Lan", role: "スタッフ",   shop: "表参道",   kind: "late",    hours: "0.2h", status: "pending", state: "selected" },
  { id: "emp-003", date: "05/14 (水)", name: "佐藤 健一",   role: "副店長",     shop: "自由が丘", kind: "trip",    hours: "—",    status: "leave",   state: "new" },
  { id: "emp-004", date: "05/13 (火)", name: "山田 太郎",   role: "スタッフ",   shop: "渋谷",     kind: "absence", hours: "—",    status: "leave",   state: "error" },
  { id: "emp-005", date: "04/30 (水)", name: "高橋 由美",   role: "スタッフ",   shop: "渋谷",     kind: "normal",  hours: "8.0h", status: "active",  state: "disabled" },
  { id: "emp-006", date: "05/12 (月)", name: "鈴木 さくら", role: "アルバイト", shop: "新宿",     kind: "late",    hours: "0.5h", status: "pending", state: "editing" },
  { id: "emp-007", date: "05/11 (日)", name: "渡辺 颯太",   role: "スタッフ",   shop: "表参道",   kind: "normal",  hours: "8.0h", status: "active" },
  { id: "emp-008", date: "05/10 (土)", name: "山本 結衣",   role: "スタッフ",   shop: "渋谷",     kind: "paid",    hours: "7.5h", status: "active" },
  { id: "emp-009", date: "05/09 (金)", name: "中村 陽斗",   role: "アルバイト", shop: "新宿",     kind: "late",    hours: "0.1h", status: "pending" },
  { id: "emp-010", date: "05/08 (木)", name: "小林 凛",     role: "アルバイト", shop: "自由が丘", kind: "trip",    hours: "—",    status: "active" },
  { id: "emp-011", date: "05/07 (水)", name: "加藤 大翔",   role: "アルバイト", shop: "表参道",   kind: "normal",  hours: "6.0h", status: "active" },
  { id: "emp-012", date: "05/06 (火)", name: "井上 真央",   role: "スタッフ",   shop: "渋谷",     kind: "absence", hours: "—",    status: "leave" },
]

export default function () {
  return (
    <Table
      density="compact"
      columns={columns}
      data={data}
      getRowId={(row) => row.name}
      rowClassName={rowState}
    />
  )
}`,
      },
    },
  },
  render: () => (
    <Table
      density="compact"
      columns={EMPLOYEE_COLUMNS}
      data={EMPLOYEES}
      getRowId={(row) => row.name}
      rowClassName={rowState}
    />
  ),
};

// Stage 4b: `WithToolbar` moved to `composites/DataTable.stories.tsx`
// (chrome lives on the composite). `BulkActions` is covered by
// `Composites/DataTable::BulkActions` and was removed here.

export const Empty: Story = {
  name: "Empty · default state",
  parameters: {
    docs: {
      source: {
        // Override: Storybook's react-docgen serializer strips every
        // `cell: ({ row }) => <JSX/>` to `() => {}`. The literal below is
        // copy-paste-ready: column-by-column with the inline JSX renderers
        // and an empty data array — the table renders its default empty
        // state when `data` is `[]`.
        language: "tsx",
        code: `import { Table, type TableColumn } from "@godxjp/ui"
import { Badge } from "@godxjp/ui"

type EmployeeRow = {
  id: string
  date: string
  name: string
  role: string
  shop: string
  kind: "paid" | "late" | "trip" | "absence" | "normal"
  hours: string
  status: "active" | "pending" | "leave"
  kana?: string
}

const columns: TableColumn<EmployeeRow>[] = [
  {
    accessorKey: "date",
    header: "日付",
    size: 112, minSize: 112, maxSize: 112,
    meta: { sortable: true, sticky: { side: "left", from: "md" } },
  },
  {
    accessorKey: "name",
    header: "従業員",
    minSize: 180,
    cell: ({ row }) => (
      <span className="c-avatar">
        <span className="ava">{row.original.name.slice(0, 1)}</span>
        <span>
          <span className="name">{row.original.name}</span>
          {row.original.kana !== undefined && (
            <span className="sub">{row.original.kana}</span>
          )}
        </span>
      </span>
    ),
    meta: { sticky: { side: "left", from: "md" } },
  },
  { accessorKey: "role", header: "役職", minSize: 120 },
  {
    accessorKey: "shop",
    header: "店舗",
    minSize: 96,
    cell: ({ row }) => <span className="c-mono">{row.original.shop}</span>,
  },
  {
    accessorKey: "kind",
    header: "区分",
    minSize: 88,
    cell: ({ row }) => {
      const k = row.original.kind
      if (k === "paid")    return <Badge variant="primary"     dot={false}>有給</Badge>
      if (k === "late")    return <Badge variant="attention"   dot={false}>遅刻</Badge>
      if (k === "trip")    return <Badge variant="info"        dot={false}>出張</Badge>
      if (k === "absence") return <Badge variant="destructive" dot={false}>欠勤</Badge>
      return <Badge variant="neutral" dot={false}>通常</Badge>
    },
  },
  {
    accessorKey: "hours",
    header: "時間",
    minSize: 80,
    meta: { className: "num", sortable: true },
  },
  {
    accessorKey: "status",
    header: "状態",
    minSize: 96,
    cell: ({ row }) => {
      const s = row.original.status
      if (s === "active")  return <Badge variant="success" dot>稼働中</Badge>
      if (s === "pending") return <Badge variant="warning" dot>申請中</Badge>
      return <Badge variant="neutral" dot>休職</Badge>
    },
  },
  {
    id: "actions",
    header: "操作",
    size: 56, minSize: 56, maxSize: 56,
    meta: { className: "actions", sticky: { side: "right", from: "md" } },
    cell: () => (
      <span className="row-actions">
        <button className="iconbtn" aria-label="操作メニュー">⋯</button>
      </span>
    ),
  },
]

// Empty data array → Table renders its default empty state.
const data: EmployeeRow[] = []

export default function () {
  return (
    <Table
      containerClassName="tbl-shell"
      columns={columns}
      data={data}
    />
  )
}`,
      },
    },
  },
  render: () => (
    <Table
      containerClassName="tbl-shell"
      columns={EMPLOYEE_COLUMNS}
      data={[]}
    />
  ),
};

// ─────────────────────────────────────────────────────────────────
// A5 — Sort & resize · canon ⑤
// ─────────────────────────────────────────────────────────────────

interface SortRow {
  id: string;
  date: string;
  name: string;
  hours: number;
  shop: string;
  updatedAt: string;
}

const SORT_ROWS: SortRow[] = [
  {
    id: "s1",
    date: "05/14 (水)",
    name: "田中 美咲",
    hours: 8.0,
    shop: "渋谷",
    updatedAt: "14:32",
  },
  {
    id: "s2",
    date: "05/14 (水)",
    name: "Nguyễn Lan",
    hours: 8.0,
    shop: "表参道",
    updatedAt: "11:18",
  },
  {
    id: "s3",
    date: "05/14 (水)",
    name: "佐藤 健一",
    hours: 8.2,
    shop: "自由が丘",
    updatedAt: "09:02",
  },
  {
    id: "s4",
    date: "05/13 (火)",
    name: "高橋 由美",
    hours: 7.8,
    shop: "渋谷",
    updatedAt: "12:11",
  },
  {
    id: "s5",
    date: "05/13 (火)",
    name: "山田 太郎",
    hours: 0,
    shop: "新宿",
    updatedAt: "10:05",
  },
];

const SORT_COLUMNS: TableColumn<SortRow>[] = [
  {
    accessorKey: "date",
    header: "日付",
    size: 120,
    meta: { sortable: true },
  },
  {
    accessorKey: "name",
    header: "従業員",
    minSize: 160,
    meta: { sortable: true },
  },
  {
    accessorKey: "hours",
    header: "時間",
    size: 100,
    cell: ({ row }) => `${row.original.hours.toFixed(1)}h`,
    meta: { className: "num", sortable: true },
  },
  {
    accessorKey: "shop",
    header: "店舗",
    size: 100,
    cell: ({ row }) => <span className="c-mono">{row.original.shop}</span>,
    meta: { sortable: true },
  },
  {
    accessorKey: "updatedAt",
    header: "更新日時",
    size: 120,
    cell: ({ row }) => (
      <span className="c-mono">{row.original.updatedAt}</span>
    ),
    meta: { className: "num", sortable: true },
  },
];

export const SortAndResize: Story = {
  name: "A5 · Sort + multi-sort + resize",
  parameters: {
    docs: {
      description: {
        story:
          "Single-click = single sort. Shift-click = multi-sort (header shows 1 / 2 / 3 priority badge). Drag the 4px right-edge grip to resize; double-click to auto-fit. `resizable` enables TanStack column-resize mode.",
      },
      source: {
        // Override: Storybook's react-docgen serializer strips every
        // `cell: ({ row }) => <JSX/>` and `onSortChange` to `() => {}`.
        // The literal below is copy-paste-ready: SortRow type, column
        // defs with inline `cell` renderers, the data array, and the
        // controlled-sort wiring (initial multi-sort priority, comparator
        // that handles both numeric and string columns).
        language: "tsx",
        code: `import { useMemo, useState } from "react"
import {
  Table,
  type TableColumn,
  type TableSort,
  type TableSortState,
} from "@godxjp/ui"

type SortRow = {
  id: string
  date: string
  name: string
  hours: number
  shop: string
  updatedAt: string
}

const columns: TableColumn<SortRow>[] = [
  {
    accessorKey: "date",
    header: "日付",
    size: 120,
    meta: { sortable: true },
  },
  {
    accessorKey: "name",
    header: "従業員",
    minSize: 160,
    meta: { sortable: true },
  },
  {
    accessorKey: "hours",
    header: "時間",
    size: 100,
    cell: ({ row }) => \`\${row.original.hours.toFixed(1)}h\`,
    meta: { className: "num", sortable: true },
  },
  {
    accessorKey: "shop",
    header: "店舗",
    size: 100,
    cell: ({ row }) => <span className="c-mono">{row.original.shop}</span>,
    meta: { sortable: true },
  },
  {
    accessorKey: "updatedAt",
    header: "更新日時",
    size: 120,
    cell: ({ row }) => (
      <span className="c-mono">{row.original.updatedAt}</span>
    ),
    meta: { className: "num", sortable: true },
  },
]

const data: SortRow[] = [
  { id: "s1", date: "05/14 (水)", name: "田中 美咲",   hours: 8.0, shop: "渋谷",     updatedAt: "14:32" },
  { id: "s2", date: "05/14 (水)", name: "Nguyễn Lan", hours: 8.0, shop: "表参道",   updatedAt: "11:18" },
  { id: "s3", date: "05/14 (水)", name: "佐藤 健一",   hours: 8.2, shop: "自由が丘", updatedAt: "09:02" },
  { id: "s4", date: "05/13 (火)", name: "高橋 由美",   hours: 7.8, shop: "渋谷",     updatedAt: "12:11" },
  { id: "s5", date: "05/13 (火)", name: "山田 太郎",   hours: 0,   shop: "新宿",     updatedAt: "10:05" },
]

export default function () {
  // Initial multi-sort priority: date desc → hours asc → updatedAt desc.
  const initial: TableSort[] = [
    { key: "date",      direction: "desc" },
    { key: "hours",     direction: "asc"  },
    { key: "updatedAt", direction: "desc" },
  ]
  const [sort, setSort] = useState<TableSortState>(initial)

  const sortedRows = useMemo(() => {
    const list = Array.isArray(sort) ? sort : sort ? [sort] : []
    if (list.length === 0) return data
    return [...data].sort((a, b) => {
      for (const entry of list) {
        const sign = entry.direction === "asc" ? 1 : -1
        const left  = a[entry.key as keyof SortRow]
        const right = b[entry.key as keyof SortRow]
        if (typeof left === "number" && typeof right === "number") {
          if (left !== right) return (left - right) * sign
        } else {
          const cmp = String(left).localeCompare(String(right))
          if (cmp !== 0) return cmp * sign
        }
      }
      return 0
    })
  }, [sort])

  return (
    <Table
      containerClassName="tbl-shell"
      columns={columns}
      data={sortedRows}
      rowKey="id"
      resizable
      sort={sort}
      onSortChange={setSort}
    />
  )
}`,
      },
    },
  },
  render: function SortAndResize() {
    const initial: TableSort[] = [
      { key: "date", direction: "desc" },
      { key: "hours", direction: "asc" },
      { key: "updatedAt", direction: "desc" },
    ];
    const [sort, setSort] = useState<TableSortState>(initial);
    const sortedRows = useMemo(() => {
      const list = Array.isArray(sort) ? sort : sort ? [sort] : [];
      if (list.length === 0) return SORT_ROWS;
      return [...SORT_ROWS].sort((a, b) => {
        for (const entry of list) {
          const sign = entry.direction === "asc" ? 1 : -1;
          const left = a[entry.key as keyof SortRow];
          const right = b[entry.key as keyof SortRow];
          if (typeof left === "number" && typeof right === "number") {
            if (left !== right) return (left - right) * sign;
          } else {
            const cmp = String(left).localeCompare(String(right));
            if (cmp !== 0) return cmp * sign;
          }
        }
        return 0;
      });
    }, [sort]);
    return (
      <Table
        containerClassName="tbl-shell"
        columns={SORT_COLUMNS}
        data={sortedRows}
        rowKey="id"
        resizable
        sort={sort}
        onSortChange={setSort}
      />
    );
  },
};

// ─────────────────────────────────────────────────────────────────
// A6 — Expand row · canon ⑥
// ─────────────────────────────────────────────────────────────────

interface RequestRow {
  id: string;
  requestNumber: string;
  applicant: string;
  amount: string;
  status: "draft" | "pending" | "approved";
  detail?: {
    plannedHours: string;
    actualHours: string;
    overtime: string;
    kind: string;
    approver: string;
    deadline: string;
    reason: string;
    attachments: string;
    submittedAt: string;
    updatedAt: string;
  };
}

const REQUEST_ROWS: RequestRow[] = [
  {
    id: "REQ-12483",
    requestNumber: "REQ-12483",
    applicant: "田中 美咲 · 経費精算 (5月)",
    amount: "¥ 8,520",
    status: "pending",
  },
  {
    id: "REQ-12482",
    requestNumber: "REQ-12482",
    applicant: "Nguyễn Lan · 残業申請 (5/13)",
    amount: "2.5 h",
    status: "pending",
    detail: {
      plannedHours: "8.0 h",
      actualHours: "10.5 h",
      overtime: "2.5 h",
      kind: "通常残業",
      approver: "店長 田中 美咲",
      deadline: "本日 23:59",
      reason: "来店客対応 (棚卸し延長)",
      attachments: "2 件 · receipt-001.jpg, log.csv",
      submittedAt: "申請 · 5/14 09:42",
      updatedAt: "最終更新 · 5/14 11:18",
    },
  },
  {
    id: "REQ-12481",
    requestNumber: "REQ-12481",
    applicant: "佐藤 健一 · 出張申請 (5/20)",
    amount: "¥ 24,800",
    status: "draft",
  },
];

const REQUEST_COLUMNS: TableColumn<RequestRow>[] = [
  {
    accessorKey: "requestNumber",
    header: "申請番号",
    size: 90,
    cell: ({ row }) => (
      <span className="c-mono">{row.original.requestNumber}</span>
    ),
  },
  {
    accessorKey: "applicant",
    header: "従業員 / 件名",
    minSize: 220,
  },
  {
    accessorKey: "amount",
    header: "金額",
    size: 80,
    meta: { className: "num" },
  },
  {
    accessorKey: "status",
    header: "状態",
    size: 90,
    cell: ({ row }) => {
      if (row.original.status === "draft")
        return <Badge variant="neutral" dot={false}>下書き</Badge>;
      if (row.original.status === "approved")
        return <Badge variant="success" dot={false}>承認</Badge>;
      return <Badge variant="warning" dot={false}>申請中</Badge>;
    },
  },
];

export const ExpandRow: Story = {
  name: "A6 · Expand row (detail panel)",
  parameters: {
    docs: {
      description: {
        story:
          "Click ▶ to expand one row at a time (canon: exclusive). The detail panel has a 3px primary left border so it visually stays attached to its row when scrolling.",
      },
      source: {
        // Override: Storybook's react-docgen serializer strips every
        // `cell: ({ row }) => <JSX/>`, `rowExpandable`, and
        // `renderExpandedRow` to `() => {}`. The literal below is
        // copy-paste-ready: RequestRow type, column defs with inline
        // Badge renderers, the data array (one row with `detail`), and
        // the controlled `expandable` wiring (exclusive expansion via
        // `expandedRowKeys` / `onExpandedRowsChange`, the detail panel
        // <dl> markup, and the footer actions).
        language: "tsx",
        code: `import { useState } from "react"
import { Table, type TableColumn, Badge, Button, Flex } from "@godxjp/ui"

type RequestRow = {
  id: string
  requestNumber: string
  applicant: string
  amount: string
  status: "draft" | "pending" | "approved"
  detail?: {
    plannedHours: string
    actualHours: string
    overtime: string
    kind: string
    approver: string
    deadline: string
    reason: string
    attachments: string
    submittedAt: string
    updatedAt: string
  }
}

const columns: TableColumn<RequestRow>[] = [
  {
    accessorKey: "requestNumber",
    header: "申請番号",
    size: 90,
    cell: ({ row }) => (
      <span className="c-mono">{row.original.requestNumber}</span>
    ),
  },
  {
    accessorKey: "applicant",
    header: "従業員 / 件名",
    minSize: 220,
  },
  {
    accessorKey: "amount",
    header: "金額",
    size: 80,
    meta: { className: "num" },
  },
  {
    accessorKey: "status",
    header: "状態",
    size: 90,
    cell: ({ row }) => {
      const s = row.original.status
      if (s === "draft")    return <Badge variant="neutral" dot={false}>下書き</Badge>
      if (s === "approved") return <Badge variant="success" dot={false}>承認</Badge>
      return <Badge variant="warning" dot={false}>申請中</Badge>
    },
  },
]

const data: RequestRow[] = [
  {
    id: "REQ-12483",
    requestNumber: "REQ-12483",
    applicant: "田中 美咲 · 経費精算 (5月)",
    amount: "¥ 8,520",
    status: "pending",
  },
  {
    id: "REQ-12482",
    requestNumber: "REQ-12482",
    applicant: "Nguyễn Lan · 残業申請 (5/13)",
    amount: "2.5 h",
    status: "pending",
    detail: {
      plannedHours: "8.0 h",
      actualHours:  "10.5 h",
      overtime:     "2.5 h",
      kind:         "通常残業",
      approver:     "店長 田中 美咲",
      deadline:     "本日 23:59",
      reason:       "来店客対応 (棚卸し延長)",
      attachments:  "2 件 · receipt-001.jpg, log.csv",
      submittedAt:  "申請 · 5/14 09:42",
      updatedAt:    "最終更新 · 5/14 11:18",
    },
  },
  {
    id: "REQ-12481",
    requestNumber: "REQ-12481",
    applicant: "佐藤 健一 · 出張申請 (5/20)",
    amount: "¥ 24,800",
    status: "draft",
  },
]

export default function () {
  // Exclusive expansion — only one row open at a time. Pass the
  // single id as an array; the framework treats subsequent expands
  // as replacements (canon ⑥).
  const [expanded, setExpanded] = useState<string[]>(["REQ-12482"])

  return (
    <Table
      containerClassName="tbl-shell"
      columns={columns}
      data={data}
      rowKey="id"
      expandable={{
        expandedRowKeys: expanded,
        onExpandedRowsChange: setExpanded,
        rowExpandable: (row) => row.original.detail !== undefined,
        renderExpandedRow: (row) => {
          const detail = row.original.detail
          if (detail === undefined) return null
          return (
            <div className="expand-body">
              <h4>残業内訳 · 5月 13日 (火)</h4>
              <dl className="grid">
                <div><dt>所定時間</dt><dd>{detail.plannedHours}</dd></div>
                <div><dt>実働時間</dt><dd>{detail.actualHours}</dd></div>
                <div><dt>残業時間</dt><dd>{detail.overtime}</dd></div>
                <div><dt>区分</dt>    <dd>{detail.kind}</dd></div>
                <div><dt>承認者</dt>  <dd>{detail.approver}</dd></div>
                <div>
                  <dt>承認期限</dt>
                  <dd style={{ color: "var(--attention)" }}>{detail.deadline}</dd>
                </div>
                <div>
                  <dt>事由</dt>
                  <dd style={{ fontWeight: 400, color: "var(--muted-foreground)" }}>
                    {detail.reason}
                  </dd>
                </div>
                <div><dt>添付</dt><dd>{detail.attachments}</dd></div>
              </dl>
              <div className="meta">
                <span>{detail.submittedAt}</span>
                <span>{detail.updatedAt}</span>
                <Flex gap={6} style={{ marginLeft: "auto" }}>
                  <Button size="x-small" variant="ghost">却下</Button>
                  <Button size="x-small">承認</Button>
                </Flex>
              </div>
            </div>
          )
        },
      }}
    />
  )
}`,
      },
    },
  },
  render: function ExpandRow() {
    const [expanded, setExpanded] = useState<string[]>(["REQ-12482"]);
    return (
      <Table
        containerClassName="tbl-shell"
        columns={REQUEST_COLUMNS}
        data={REQUEST_ROWS}
        rowKey="id"
        expandable={{
          expandedRowKeys: expanded,
          onExpandedRowsChange: setExpanded,
          rowExpandable: (row) => row.original.detail !== undefined,
          renderExpandedRow: (row) => {
            const detail = row.original.detail;
            if (detail === undefined) return null;
            return (
              <div className="expand-body">
                <h4>残業内訳 · 5月 13日 (火)</h4>
                <dl className="grid">
                  <div>
                    <dt>所定時間</dt>
                    <dd>{detail.plannedHours}</dd>
                  </div>
                  <div>
                    <dt>実働時間</dt>
                    <dd>{detail.actualHours}</dd>
                  </div>
                  <div>
                    <dt>残業時間</dt>
                    <dd>{detail.overtime}</dd>
                  </div>
                  <div>
                    <dt>区分</dt>
                    <dd>{detail.kind}</dd>
                  </div>
                  <div>
                    <dt>承認者</dt>
                    <dd>{detail.approver}</dd>
                  </div>
                  <div>
                    <dt>承認期限</dt>
                    <dd style={{ color: "var(--attention)" }}>
                      {detail.deadline}
                    </dd>
                  </div>
                  <div>
                    <dt>事由</dt>
                    <dd
                      style={{
                        fontWeight: 400,
                        color: "var(--muted-foreground)",
                      }}
                    >
                      {detail.reason}
                    </dd>
                  </div>
                  <div>
                    <dt>添付</dt>
                    <dd>{detail.attachments}</dd>
                  </div>
                </dl>
                <div className="meta">
                  <span>{detail.submittedAt}</span>
                  <span>{detail.updatedAt}</span>
                  <Flex gap={6} style={{ marginLeft: "auto" }}>
                    <Button size="x-small" variant="ghost">
                      却下
                    </Button>
                    <Button size="x-small">承認</Button>
                  </Flex>
                </div>
              </div>
            );
          },
        }}
      />
    );
  },
};

// ─────────────────────────────────────────────────────────────────
// A7 — Editable row · canon ⑦
// ─────────────────────────────────────────────────────────────────

interface KintaiRow {
  id: string;
  date: string;
  name: string;
  kind: string;
  hours: string;
  status: "draft" | "pending" | "approved" | "confirmed";
}

const KINTAI_ROWS: KintaiRow[] = [
  {
    id: "k1",
    date: "05/14",
    name: "田中 美咲",
    kind: "有給",
    hours: "8.0h",
    status: "approved",
  },
  {
    id: "k2",
    date: "2026/05/14",
    name: "Nguyễn Lan",
    kind: "遅刻",
    hours: "0.5",
    status: "pending",
  },
  {
    id: "k3",
    date: "05/13",
    name: "佐藤 健一",
    kind: "出張",
    hours: "—",
    status: "draft",
  },
  {
    id: "k4",
    date: "05/12",
    name: "高橋 由美",
    kind: "通常",
    hours: "8.0h",
    status: "confirmed",
  },
];

const KINTAI_COLUMNS: TableColumn<KintaiRow>[] = [
  { accessorKey: "date", header: "日付", size: 90 },
  { accessorKey: "name", header: "従業員", minSize: 180 },
  { accessorKey: "kind", header: "区分", size: 120 },
  { accessorKey: "hours", header: "時間", size: 80, meta: { className: "num" } },
  {
    accessorKey: "status",
    header: "状態",
    size: 100,
    cell: ({ row }) => {
      const s = row.original.status;
      if (s === "draft") return <Badge variant="neutral" dot={false}>下書き</Badge>;
      if (s === "pending") return <Badge variant="warning" dot={false}>申請中</Badge>;
      if (s === "confirmed") return <Badge variant="success" dot={false}>確定</Badge>;
      return <Badge variant="success" dot={false}>承認</Badge>;
    },
  },
];

export const EditableRow: Story = {
  name: "A7 · Editable row (inline + dirty banner)",
  parameters: {
    docs: {
      description: {
        story:
          "Double-click a row to enter editing mode (canon ⑦). Dirty cells get a yellow dot via `dirtyCellIds`. The footer banner shows the unsaved count with Save-all / Cancel-all actions. Confirmed rows are read-only — `isRowReadOnly` blocks the double-click.",
      },
      source: {
        // Override: Storybook's react-docgen serializer strips every
        // `cell: ({ row }) => <JSX/>`, `renderEditCell`, `isRowReadOnly`,
        // and the `onStart` / `onCancel` / `onCommit` / `onSaveAll` /
        // `onCancelAll` callbacks to `() => {}`. The literal below is
        // copy-paste-ready: KintaiRow type, column defs with the inline
        // status-Badge renderer, the data array, and the controlled
        // `editing` wiring with the per-column edit-cell renderer
        // (`<select>` for kind, `<input>` for hours and free fields).
        language: "tsx",
        code: `import { useState } from "react"
import { Table, type TableColumn, Badge } from "@godxjp/ui"

type KintaiRow = {
  id: string
  date: string
  name: string
  kind: string
  hours: string
  status: "draft" | "pending" | "approved" | "confirmed"
}

const columns: TableColumn<KintaiRow>[] = [
  { accessorKey: "date",  header: "日付",   size: 90 },
  { accessorKey: "name",  header: "従業員", minSize: 180 },
  { accessorKey: "kind",  header: "区分",   size: 120 },
  { accessorKey: "hours", header: "時間",   size: 80, meta: { className: "num" } },
  {
    accessorKey: "status",
    header: "状態",
    size: 100,
    cell: ({ row }) => {
      const s = row.original.status
      if (s === "draft")     return <Badge variant="neutral" dot={false}>下書き</Badge>
      if (s === "pending")   return <Badge variant="warning" dot={false}>申請中</Badge>
      if (s === "confirmed") return <Badge variant="success" dot={false}>確定</Badge>
      return <Badge variant="success" dot={false}>承認</Badge>
    },
  },
]

const data: KintaiRow[] = [
  { id: "k1", date: "05/14",      name: "田中 美咲",   kind: "有給", hours: "8.0h", status: "approved"  },
  { id: "k2", date: "2026/05/14", name: "Nguyễn Lan", kind: "遅刻", hours: "0.5",  status: "pending"   },
  { id: "k3", date: "05/13",      name: "佐藤 健一",   kind: "出張", hours: "—",    status: "draft"     },
  { id: "k4", date: "05/12",      name: "高橋 由美",   kind: "通常", hours: "8.0h", status: "confirmed" },
]

export default function () {
  // Controlled editing — the canon flow: one row in edit mode,
  // dirty cells flagged via \`<rowId>:<columnKey>\` ids. Confirmed
  // rows are blocked via \`isRowReadOnly\`.
  const [editingRowId, setEditingRowId] = useState<string | null>("k2")
  const [dirtyRowIds,  setDirtyRowIds]  = useState<string[]>(["k2"])
  const [dirtyCellIds, setDirtyCellIds] = useState<string[]>([
    "k2:kind",
    "k2:hours",
  ])

  const clear = () => {
    setEditingRowId(null)
    setDirtyRowIds([])
    setDirtyCellIds([])
  }

  return (
    <Table
      containerClassName="tbl-shell"
      columns={columns}
      data={data}
      rowKey="id"
      editing={{
        rowId: editingRowId,
        dirtyRowIds,
        dirtyCellIds,
        isRowReadOnly: (row) => row.original.status === "confirmed",
        onStart:  (id) => setEditingRowId(id),
        onCancel: clear,
        onCommit: clear,
        renderEditCell: (column, row) => {
          const key = (column as { accessorKey?: string }).accessorKey
          if (key === undefined) return null
          const value = String(
            (row.original as unknown as Record<string, unknown>)[key] ?? "",
          )
          if (key === "kind") {
            return (
              <select className="cell-select" defaultValue={value}>
                <option>遅刻</option>
                <option>早退</option>
                <option>有給</option>
              </select>
            )
          }
          if (key === "hours") {
            return (
              <input
                className="cell-input"
                defaultValue={value}
                style={{ textAlign: "right" }}
                aria-label="hours"
              />
            )
          }
          return (
            <input
              className="cell-input"
              defaultValue={value}
              aria-label={key}
            />
          )
        },
        onSaveAll:   clear,
        onCancelAll: clear,
      }}
    />
  )
}`,
      },
    },
  },
  render: function EditableRow() {
    const [editingRowId, setEditingRowId] = useState<string | null>("k2");
    const [dirtyRowIds, setDirtyRowIds] = useState<string[]>(["k2"]);
    const [dirtyCellIds, setDirtyCellIds] = useState<string[]>([
      "k2:kind",
      "k2:hours",
    ]);
    return (
      <Table
        containerClassName="tbl-shell"
        columns={KINTAI_COLUMNS}
        data={KINTAI_ROWS}
        rowKey="id"
        editing={{
          rowId: editingRowId,
          dirtyRowIds,
          dirtyCellIds,
          isRowReadOnly: (row) => row.original.status === "confirmed",
          onStart: (id) => setEditingRowId(id),
          onCancel: () => {
            setEditingRowId(null);
            setDirtyRowIds([]);
            setDirtyCellIds([]);
          },
          onCommit: () => {
            setEditingRowId(null);
            setDirtyRowIds([]);
            setDirtyCellIds([]);
          },
          renderEditCell: (column, row) => {
            const key = (column as { accessorKey?: string }).accessorKey;
            if (key === undefined) return null;
            const value = String(
              (row.original as unknown as Record<string, unknown>)[key] ?? "",
            );
            if (key === "kind") {
              return (
                <select className="cell-select" defaultValue={value}>
                  <option>遅刻</option>
                  <option>早退</option>
                  <option>有給</option>
                </select>
              );
            }
            if (key === "hours") {
              return (
                <input
                  className="cell-input"
                  defaultValue={value}
                  style={{ textAlign: "right" }}
                  aria-label="hours"
                />
              );
            }
            return (
              <input
                className="cell-input"
                defaultValue={value}
                aria-label={key}
              />
            );
          },
          onSaveAll: () => {
            setEditingRowId(null);
            setDirtyRowIds([]);
            setDirtyCellIds([]);
          },
          onCancelAll: () => {
            setEditingRowId(null);
            setDirtyRowIds([]);
            setDirtyCellIds([]);
          },
        }}
      />
    );
  },
};

// ─────────────────────────────────────────────────────────────────
// A8 — Grouped + tree rows · canon ⑧
// ─────────────────────────────────────────────────────────────────

interface GroupRow {
  id: string;
  name: string;
  workedHours: number;
  overtime: number;
  shop: string;
  status: "approved" | "pending" | "attention";
}

const GROUP_ROWS: GroupRow[] = [
  {
    id: "g1",
    name: "田中 美咲",
    workedHours: 168.5,
    overtime: 4.2,
    shop: "渋谷",
    status: "approved",
  },
  {
    id: "g2",
    name: "佐藤 健一",
    workedHours: 172.0,
    overtime: 8.5,
    shop: "渋谷",
    status: "pending",
  },
  {
    id: "g3",
    name: "Nguyễn Lan",
    workedHours: 160.0,
    overtime: 2.0,
    shop: "表参道",
    status: "attention",
  },
];

const GROUP_COLUMNS: TableColumn<GroupRow>[] = [
  {
    accessorKey: "name",
    header: "従業員 / 部門",
    minSize: 220,
    cell: ({ row }) => (
      <span className="c-avatar">
        <span className="ava">{row.original.name.slice(0, 1)}</span>
        <span className="name">{row.original.name}</span>
      </span>
    ),
  },
  {
    accessorKey: "workedHours",
    header: "実働 h",
    size: 100,
    cell: ({ row }) => row.original.workedHours.toFixed(1),
    meta: { className: "num" },
  },
  {
    accessorKey: "overtime",
    header: "残業 h",
    size: 80,
    cell: ({ row }) => `${row.original.overtime.toFixed(1)} h`,
  },
  {
    accessorKey: "shop",
    header: "店舗",
    size: 100,
    cell: ({ row }) => <span className="c-mono">{row.original.shop}</span>,
  },
  {
    accessorKey: "status",
    header: "状態",
    size: 90,
    cell: ({ row }) => {
      if (row.original.status === "approved")
        return <Badge variant="success" dot={false}>確定</Badge>;
      if (row.original.status === "attention")
        return <Badge variant="attention" dot={false}>遅刻あり</Badge>;
      return <Badge variant="warning" dot={false}>確認中</Badge>;
    },
  },
];

export const GroupedRows: Story = {
  name: "A8a · Grouped rows (店舗 grouping)",
  parameters: {
    docs: {
      description: {
        story:
          "`groupBy` returns a descriptor per row. The framework emits a full-width header row with title + count + right-aligned total, and renders the rest of the body inside the group. Click the ▼ to collapse the group.",
      },
      source: {
        // Override: Storybook's react-docgen serializer strips every
        // `cell: ({ row }) => <JSX/>` and the `groupBy` row-mapper to
        // `() => {}`. The literal below is copy-paste-ready: GroupRow
        // type, column defs with the inline avatar + status-Badge
        // renderers, the data array, and the `groupBy` descriptor with
        // per-shop label / count / total totals.
        language: "tsx",
        code: `import { Table, type TableColumn, Badge } from "@godxjp/ui"

type GroupRow = {
  id: string
  name: string
  workedHours: number
  overtime: number
  shop: string
  status: "approved" | "pending" | "attention"
}

const columns: TableColumn<GroupRow>[] = [
  {
    accessorKey: "name",
    header: "従業員 / 部門",
    minSize: 220,
    cell: ({ row }) => (
      <span className="c-avatar">
        <span className="ava">{row.original.name.slice(0, 1)}</span>
        <span className="name">{row.original.name}</span>
      </span>
    ),
  },
  {
    accessorKey: "workedHours",
    header: "実働 h",
    size: 100,
    cell: ({ row }) => row.original.workedHours.toFixed(1),
    meta: { className: "num" },
  },
  {
    accessorKey: "overtime",
    header: "残業 h",
    size: 80,
    cell: ({ row }) => \`\${row.original.overtime.toFixed(1)} h\`,
  },
  {
    accessorKey: "shop",
    header: "店舗",
    size: 100,
    cell: ({ row }) => <span className="c-mono">{row.original.shop}</span>,
  },
  {
    accessorKey: "status",
    header: "状態",
    size: 90,
    cell: ({ row }) => {
      const s = row.original.status
      if (s === "approved")  return <Badge variant="success"   dot={false}>確定</Badge>
      if (s === "attention") return <Badge variant="attention" dot={false}>遅刻あり</Badge>
      return <Badge variant="warning" dot={false}>確認中</Badge>
    },
  },
]

const data: GroupRow[] = [
  { id: "g1", name: "田中 美咲",   workedHours: 168.5, overtime: 4.2, shop: "渋谷",   status: "approved"  },
  { id: "g2", name: "佐藤 健一",   workedHours: 172.0, overtime: 8.5, shop: "渋谷",   status: "pending"   },
  { id: "g3", name: "Nguyễn Lan", workedHours: 160.0, overtime: 2.0, shop: "表参道", status: "attention" },
]

export default function () {
  return (
    <Table
      containerClassName="tbl-shell"
      columns={columns}
      data={data}
      rowKey="id"
      groupBy={(row) => {
        if (row.shop === "渋谷")
          return {
            key: "shibuya",
            label: "渋谷店",
            count: <>8 名</>,
            total: <>1,344.5 h · 残業 36.2 h</>,
          }
        if (row.shop === "表参道")
          return {
            key: "omotesando",
            label: "表参道店",
            count: <>5 名</>,
            total: <>820.0 h · 残業 18.0 h</>,
          }
        return {
          key: "jiyugaoka",
          label: "自由が丘店",
          count: <>3 名</>,
          total: <>480.0 h · 残業 6.0 h</>,
        }
      }}
    />
  )
}`,
      },
    },
  },
  render: function GroupedRows() {
    return (
      <Table
        containerClassName="tbl-shell"
        columns={GROUP_COLUMNS}
        data={GROUP_ROWS}
        rowKey="id"
        groupBy={(row) => {
          if (row.shop === "渋谷")
            return {
              key: "shibuya",
              label: "渋谷店",
              count: <>8 名</>,
              total: <>1,344.5 h · 残業 36.2 h</>,
            };
          if (row.shop === "表参道")
            return {
              key: "omotesando",
              label: "表参道店",
              count: <>5 名</>,
              total: <>820.0 h · 残業 18.0 h</>,
            };
          return {
            key: "jiyugaoka",
            label: "自由が丘店",
            count: <>3 名</>,
            total: <>480.0 h · 残業 6.0 h</>,
          };
        }}
      />
    );
  },
};

interface TreeNode {
  id: string;
  name: string;
  count: number;
  jurisdiction: string;
  status: "active" | "preparing" | "reference";
  children?: TreeNode[];
}

const TREE_ROWS: TreeNode[] = [
  {
    id: "org",
    name: "famgia ホールディングス",
    count: 128,
    jurisdiction: "全社",
    status: "active",
    children: [
      {
        id: "betoya",
        name: "ベトヤ Co.,Ltd.",
        count: 42,
        jurisdiction: "飲食",
        status: "active",
        children: [
          {
            id: "betoya-shibuya",
            name: "ベトヤ 渋谷店",
            count: 18,
            jurisdiction: "店舗",
            status: "active",
          },
          {
            id: "betoya-omote",
            name: "ベトヤ 表参道店",
            count: 15,
            jurisdiction: "店舗",
            status: "active",
            children: [
              {
                id: "betoya-omote-kitchen",
                name: "キッチン",
                count: 7,
                jurisdiction: "部門",
                status: "reference",
              },
              {
                id: "betoya-omote-hall",
                name: "ホール",
                count: 8,
                jurisdiction: "部門",
                status: "reference",
              },
            ],
          },
          {
            id: "betoya-jiyugaoka",
            name: "ベトヤ 自由が丘店",
            count: 9,
            jurisdiction: "店舗",
            status: "preparing",
          },
        ],
      },
    ],
  },
];

const TREE_COLUMNS: TableColumn<TreeNode>[] = [
  {
    accessorKey: "name",
    header: "組織",
    minSize: 280,
    cell: ({ row }) => (
      <span style={{ fontWeight: 500 }}>{row.original.name}</span>
    ),
  },
  {
    accessorKey: "count",
    header: "人数",
    size: 80,
    meta: { className: "num" },
  },
  {
    accessorKey: "jurisdiction",
    header: "管轄",
    size: 100,
  },
  {
    accessorKey: "status",
    header: "状態",
    size: 90,
    cell: ({ row }) => {
      if (row.original.status === "active")
        return <Badge variant="success" dot={false}>有効</Badge>;
      if (row.original.status === "preparing")
        return <Badge variant="warning" dot={false}>準備中</Badge>;
      return <Badge variant="neutral" dot={false}>参考</Badge>;
    },
  },
];

export const TreeRows: Story = {
  name: "A8b · Tree rows (org hierarchy)",
  parameters: {
    docs: {
      description: {
        story:
          "`tree.children` returns the child rows per parent. The first cell indents 14px per level + a twirl ▶ button on parent rows. Leaf rows align with the leftmost indent step.",
      },
      source: {
        // Override: Storybook's react-docgen serializer strips every
        // `cell: ({ row }) => <JSX/>` and the `tree.children`
        // child-mapper to `() => {}`. The literal below is
        // copy-paste-ready: TreeNode type, column defs with the inline
        // status-Badge renderer, the nested data array, and the
        // controlled `tree` wiring (initial expanded nodes via
        // `expandedNodes` / `onExpandedNodesChange`).
        language: "tsx",
        code: `import { useState } from "react"
import { Table, type TableColumn, Badge } from "@godxjp/ui"

type TreeNode = {
  id: string
  name: string
  count: number
  jurisdiction: string
  status: "active" | "preparing" | "reference"
  children?: TreeNode[]
}

const columns: TableColumn<TreeNode>[] = [
  {
    accessorKey: "name",
    header: "組織",
    minSize: 280,
    cell: ({ row }) => (
      <span style={{ fontWeight: 500 }}>{row.original.name}</span>
    ),
  },
  {
    accessorKey: "count",
    header: "人数",
    size: 80,
    meta: { className: "num" },
  },
  {
    accessorKey: "jurisdiction",
    header: "管轄",
    size: 100,
  },
  {
    accessorKey: "status",
    header: "状態",
    size: 90,
    cell: ({ row }) => {
      const s = row.original.status
      if (s === "active")    return <Badge variant="success" dot={false}>有効</Badge>
      if (s === "preparing") return <Badge variant="warning" dot={false}>準備中</Badge>
      return <Badge variant="neutral" dot={false}>参考</Badge>
    },
  },
]

const data: TreeNode[] = [
  {
    id: "org",
    name: "famgia ホールディングス",
    count: 128,
    jurisdiction: "全社",
    status: "active",
    children: [
      {
        id: "betoya",
        name: "ベトヤ Co.,Ltd.",
        count: 42,
        jurisdiction: "飲食",
        status: "active",
        children: [
          {
            id: "betoya-shibuya",
            name: "ベトヤ 渋谷店",
            count: 18,
            jurisdiction: "店舗",
            status: "active",
          },
          {
            id: "betoya-omote",
            name: "ベトヤ 表参道店",
            count: 15,
            jurisdiction: "店舗",
            status: "active",
            children: [
              { id: "betoya-omote-kitchen", name: "キッチン", count: 7, jurisdiction: "部門", status: "reference" },
              { id: "betoya-omote-hall",    name: "ホール",   count: 8, jurisdiction: "部門", status: "reference" },
            ],
          },
          {
            id: "betoya-jiyugaoka",
            name: "ベトヤ 自由が丘店",
            count: 9,
            jurisdiction: "店舗",
            status: "preparing",
          },
        ],
      },
    ],
  },
]

export default function () {
  const [expanded, setExpanded] = useState<string[]>([
    "org",
    "betoya",
    "betoya-omote",
  ])

  return (
    <Table
      containerClassName="tbl-shell"
      columns={columns}
      data={data}
      rowKey="id"
      tree={{
        children: (row) => row.children,
        expandedNodes: expanded,
        onExpandedNodesChange: setExpanded,
      }}
    />
  )
}`,
      },
    },
  },
  render: function TreeRows() {
    const [expanded, setExpanded] = useState<string[]>([
      "org",
      "betoya",
      "betoya-omote",
    ]);
    return (
      <Table
        containerClassName="tbl-shell"
        columns={TREE_COLUMNS}
        data={TREE_ROWS}
        rowKey="id"
        tree={{
          children: (row) => row.children,
          expandedNodes: expanded,
          onExpandedNodesChange: setExpanded,
        }}
      />
    );
  },
};

// ─────────────────────────────────────────────────────────────────
// A9 — Sticky columns (with column-manager lock toggle) · canon ⑨
// ─────────────────────────────────────────────────────────────────

interface WeekRow {
  id: string;
  initial: string;
  name: string;
  shop: string;
  d12: string;
  d13: string;
  d14: string;
  d15: string;
  d16: string;
  total: string;
  overtime: string;
  overtimeAttention?: boolean;
}

const WEEK_ROWS: WeekRow[] = [
  {
    id: "w1",
    initial: "田",
    name: "田中 美咲",
    shop: "渋谷",
    d12: "8.0",
    d13: "8.2",
    d14: "8.5",
    d15: "休",
    d16: "8.0",
    total: "32.7",
    overtime: "0.7",
  },
  {
    id: "w2",
    initial: "N",
    name: "Nguyễn Lan",
    shop: "表参道",
    d12: "9.0",
    d13: "10.5",
    d14: "8.0",
    d15: "8.0",
    d16: "休",
    total: "35.5",
    overtime: "3.5",
    overtimeAttention: true,
  },
  {
    id: "w3",
    initial: "佐",
    name: "佐藤 健一",
    shop: "自由が丘",
    d12: "8.0",
    d13: "8.0",
    d14: "8.2",
    d15: "8.5",
    d16: "8.0",
    total: "40.7",
    overtime: "0.7",
  },
];

const WEEK_COLUMNS: TableColumn<WeekRow>[] = [
  {
    accessorKey: "name",
    header: "従業員",
    size: 140,
    cell: ({ row }) => (
      <span className="c-avatar">
        <span className="ava">{row.original.initial}</span>
        <span className="name">{row.original.name}</span>
      </span>
    ),
    meta: { sticky: "left" },
  },
  {
    accessorKey: "shop",
    header: "店舗",
    size: 100,
    cell: ({ row }) => <span className="c-mono">{row.original.shop}</span>,
  },
  { accessorKey: "d12", header: "5/12", size: 80, meta: { className: "num" } },
  { accessorKey: "d13", header: "5/13", size: 90, meta: { className: "num" } },
  { accessorKey: "d14", header: "5/14", size: 90, meta: { className: "num" } },
  { accessorKey: "d15", header: "5/15", size: 90, meta: { className: "num" } },
  { accessorKey: "d16", header: "5/16", size: 90, meta: { className: "num" } },
  {
    accessorKey: "total",
    header: "合計",
    size: 90,
    cell: ({ row }) => <b>{row.original.total}</b>,
    meta: { className: "num" },
  },
  {
    accessorKey: "overtime",
    header: "残業",
    size: 90,
    cell: ({ row }) =>
      row.original.overtimeAttention === true ? (
        <span style={{ color: "var(--attention)" }}>{row.original.overtime}</span>
      ) : (
        row.original.overtime
      ),
    meta: { className: "num" },
  },
  {
    id: "actions",
    header: "操作",
    size: 80,
    cell: () => (
      <span className="row-actions">
        <button className="iconbtn" aria-label="操作">
          ⋯
        </button>
      </span>
    ),
    meta: { className: "actions", sticky: "right" },
  },
];

export const StickyColumns: Story = {
  name: "A9 · Sticky columns (left avatar + right actions)",
  parameters: {
    docs: {
      description: {
        story:
          "`meta.sticky: 'left' | 'right'` pins columns at the table edges — primitive concern, driven by column metadata. The canvas is narrow — scroll horizontally to confirm both sticky bands stay put. Runtime lock/unlock toggling lives on the `<DataTable>` composite's column-manager Sheet.",
      },
      source: {
        // Override: Storybook's react-docgen serializer strips every
        // `cell: ({ row }) => <JSX/>` to `() => {}`. The literal below
        // is copy-paste-ready: WeekRow type, column defs with the
        // inline avatar / overtime-attention renderers, the data array,
        // and the `meta.sticky` flags that pin the first column (left)
        // and the action column (right). The outer `<div>` clamps the
        // canvas so horizontal scroll demonstrates the sticky bands.
        language: "tsx",
        code: `import { Table, type TableColumn } from "@godxjp/ui"

type WeekRow = {
  id: string
  initial: string
  name: string
  shop: string
  d12: string
  d13: string
  d14: string
  d15: string
  d16: string
  total: string
  overtime: string
  overtimeAttention?: boolean
}

const columns: TableColumn<WeekRow>[] = [
  {
    accessorKey: "name",
    header: "従業員",
    size: 140,
    cell: ({ row }) => (
      <span className="c-avatar">
        <span className="ava">{row.original.initial}</span>
        <span className="name">{row.original.name}</span>
      </span>
    ),
    meta: { sticky: "left" },
  },
  {
    accessorKey: "shop",
    header: "店舗",
    size: 100,
    cell: ({ row }) => <span className="c-mono">{row.original.shop}</span>,
  },
  { accessorKey: "d12", header: "5/12", size: 80, meta: { className: "num" } },
  { accessorKey: "d13", header: "5/13", size: 90, meta: { className: "num" } },
  { accessorKey: "d14", header: "5/14", size: 90, meta: { className: "num" } },
  { accessorKey: "d15", header: "5/15", size: 90, meta: { className: "num" } },
  { accessorKey: "d16", header: "5/16", size: 90, meta: { className: "num" } },
  {
    accessorKey: "total",
    header: "合計",
    size: 90,
    cell: ({ row }) => <b>{row.original.total}</b>,
    meta: { className: "num" },
  },
  {
    accessorKey: "overtime",
    header: "残業",
    size: 90,
    cell: ({ row }) =>
      row.original.overtimeAttention === true ? (
        <span style={{ color: "var(--attention)" }}>{row.original.overtime}</span>
      ) : (
        row.original.overtime
      ),
    meta: { className: "num" },
  },
  {
    id: "actions",
    header: "操作",
    size: 80,
    cell: () => (
      <span className="row-actions">
        <button className="iconbtn" aria-label="操作">⋯</button>
      </span>
    ),
    meta: { className: "actions", sticky: "right" },
  },
]

const data: WeekRow[] = [
  { id: "w1", initial: "田", name: "田中 美咲",   shop: "渋谷",     d12: "8.0", d13: "8.2",  d14: "8.5", d15: "休",  d16: "8.0", total: "32.7", overtime: "0.7" },
  { id: "w2", initial: "N", name: "Nguyễn Lan", shop: "表参道",   d12: "9.0", d13: "10.5", d14: "8.0", d15: "8.0", d16: "休",  total: "35.5", overtime: "3.5", overtimeAttention: true },
  { id: "w3", initial: "佐", name: "佐藤 健一",   shop: "自由が丘", d12: "8.0", d13: "8.0",  d14: "8.2", d15: "8.5", d16: "8.0", total: "40.7", overtime: "0.7" },
]

export default function () {
  // Narrow the canvas so horizontal scroll demonstrates both
  // sticky bands (left avatar column + right action column) hold
  // their position.
  return (
    <div style={{ maxWidth: 660 }}>
      <Table
        containerClassName="tbl-shell"
        columns={columns}
        data={data}
        rowKey="id"
      />
    </div>
  )
}`,
      },
    },
  },
  render: function StickyColumns() {
    return (
      <div style={{ maxWidth: 660 }}>
        <Table
          containerClassName="tbl-shell"
          columns={WEEK_COLUMNS}
          data={WEEK_ROWS}
          rowKey="id"
        />
      </div>
    );
  },
};

// Stage 4b: A10 Pagination_* stories moved to
// `src/stories/composites/DataTable.stories.tsx` — the pagination
// band lives on the `<DataTable>` composite.
