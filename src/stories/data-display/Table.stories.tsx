import type { Meta, StoryObj } from "@storybook/react";
import { useMemo, useState } from "react";
import { expect, within } from "storybook/test";
import { Badge } from "../../components/data-display/Badge";
import {
  Table,
  type TableColumn,
  type TableColumnVisibility,
  type TableFilter,
  type TableSort,
  type TableSortState,
  type TableViewItem,
} from "../../components/data-display/Table";
import { InputSearch } from "../../components/data-entry/InputSearch";
import { Button } from "../../components/general/Button";
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

const SHOP_OPTIONS = [
  { value: "渋谷", label: "渋谷" },
  { value: "表参道", label: "表参道" },
  { value: "新宿", label: "新宿" },
  { value: "自由が丘", label: "自由が丘" },
];

const KIND_OPTIONS = [
  { value: "late", label: "遅刻" },
  { value: "paid", label: "有給" },
  { value: "trip", label: "出張" },
  { value: "absence", label: "欠勤" },
  { value: "normal", label: "通常" },
];

const COLUMN_SETTINGS = [
  { key: "date", label: "日付" },
  { key: "name", label: "従業員" },
  { key: "role", label: "役職" },
  { key: "shop", label: "店舗" },
  { key: "kind", label: "区分" },
  { key: "hours", label: "時間" },
  { key: "status", label: "状態" },
] as const;

const DEFAULT_COLUMN_VISIBILITY: TableColumnVisibility = { hours: false };
const DEFAULT_SORT: TableSort = { key: "date", direction: "desc" };

interface StoryTableView extends TableViewItem {
  key: string;
  label: string;
  filters: TableFilter[];
  sort: TableSort | null;
  columnVisibility: TableColumnVisibility;
}

const BUILT_IN_VIEWS: StoryTableView[] = [
  {
    key: "all",
    label: "すべて",
    filters: [],
    sort: DEFAULT_SORT,
    columnVisibility: DEFAULT_COLUMN_VISIBILITY,
  },
  {
    key: "pending",
    label: "承認待ち",
    filters: [{ key: "status", operator: "eq", value: "pending" }],
    sort: DEFAULT_SORT,
    columnVisibility: DEFAULT_COLUMN_VISIBILITY,
  },
  {
    key: "late",
    label: "遅刻 / 早退",
    filters: [{ key: "kind", operator: "eq", value: "late" }],
    sort: DEFAULT_SORT,
    columnVisibility: DEFAULT_COLUMN_VISIBILITY,
  },
  {
    key: "confirmed",
    label: "今月確定",
    filters: [{ key: "status", operator: "eq", value: "active" }],
    sort: DEFAULT_SORT,
    columnVisibility: { ...DEFAULT_COLUMN_VISIBILITY, status: false },
  },
  {
    key: "shibuya",
    label: "マイビュー · 渋谷店のみ",
    filters: [{ key: "shop", operator: "eq", value: "渋谷" }],
    sort: DEFAULT_SORT,
    columnVisibility: { ...DEFAULT_COLUMN_VISIBILITY, shop: true },
  },
];

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
      <Badge variant="error" dot={false}>
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
      meta: { sortable: true },
    },
    {
      accessorKey: "name",
      header: "従業員",
      minSize: 180,
      cell: ({ row }) => <AvatarCell row={row.original} />,
      meta: { filterable: true },
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
      meta: { filterable: true, filterOptions: SHOP_OPTIONS },
    },
    {
      accessorKey: "kind",
      header: "区分",
      cell: ({ row }) => <KindBadge kind={row.original.kind} />,
      meta: { filterable: true, filterOptions: KIND_OPTIONS },
    },
    {
      accessorKey: "hours",
      header: "時間",
      meta: { className: "num", sortable: true },
    },
    {
      accessorKey: "status",
      header: "状態",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
      meta: {
        filterable: true,
        filterOptions: [
          { value: "active", label: "稼働中" },
          { value: "pending", label: "申請中" },
          { value: "leave", label: "休職" },
        ],
      },
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
      meta: { className: "actions", sticky: "right", hideable: false },
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

function matchesTableFilters(row: EmployeeRow, filters: TableFilter[]) {
  return filters.every((filter) => {
    const value = String(filter.value ?? "").trim();
    if (value === "") return true;
    if (filter.key === "name") {
      return `${row.name} ${row.kana ?? ""} ${row.shop} ${row.role}`
        .toLowerCase()
        .includes(value.toLowerCase());
    }
    if (filter.key === "shop") return row.shop === value;
    if (filter.key === "kind") return row.kind === value;
    if (filter.key === "status") return row.status === value;
    return true;
  });
}

function countRowsForView(view: StoryTableView) {
  return EMPLOYEES.filter((row) => matchesTableFilters(row, view.filters))
    .length;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function decorateView(view: StoryTableView): TableViewItem {
  const isBuiltInView = BUILT_IN_VIEWS.some((item) => item.key === view.key);
  return {
    ...view,
    count: countRowsForView(view),
    deletable: !isBuiltInView,
    dotColor:
      view.key === "pending"
        ? "var(--warning)"
        : view.key === "late"
          ? "var(--attention)"
          : undefined,
  };
}

function batchActionsFor(
) {
  return (
    <>
      <Button size="small" variant="outline">
        一括承認
      </Button>
      <Button size="small" variant="outline">
        CSV 出力
      </Button>
      <Button size="small" variant="destructive">
        却下
      </Button>
    </>
  );
}

export const Default: Story = {
  name: "Default · plain table",
  render: () => (
    <Table
      columns={EMPLOYEE_COLUMNS}
      data={EMPLOYEES.slice(0, 5)}
      rowKey="id"
      rowClassName={rowState}
    />
  ),
};

export const PackagedFeatures: Story = {
  name: "Packaged features · views · columns · batch actions",
  parameters: {
    // The story's prop tree (TanStack column defs + view items + batch
    // actions JSX + 12-row dataset) overflows Storybook's runtime
    // `prettyPrint2` serializer (RangeError: Invalid string length).
    // Pin the Code panel to the static source extracted at build time
    // instead of the dynamic runtime walk.
    docs: { source: { type: "code" } },
  },
  render: () => {
    const [activeViewKey, setActiveViewKey] = useState("all");
    const [filters, setFilters] = useState<TableFilter[]>([]);
    const [sort, setSort] = useState<TableSortState>(DEFAULT_SORT);
    const [selectedIds, setSelectedIds] = useState<string[]>(["emp-002"]);
    const [columnVisibility, setColumnVisibility] =
      useState<TableColumnVisibility>(DEFAULT_COLUMN_VISIBILITY);
    const viewItems = useMemo(
      () => BUILT_IN_VIEWS.map(decorateView),
      [],
    );

    function markCustomView() {
      setActiveViewKey("custom");
    }

    function setFilterValue(
      key: string,
      value: string,
      operator: TableFilter["operator"] = "eq",
    ) {
      setFilters((current) => {
        const next = current.filter((filter) => filter.key !== key);
        if (value.trim() === "") return next;
        return [...next, { key, operator, value }];
      });
      markCustomView();
    }

    function updateFilters(nextFilters: TableFilter[]) {
      setFilters(nextFilters);
      markCustomView();
    }

    function applyView(view: TableViewItem) {
      setActiveViewKey(view.key);
      setFilters(view.filters ?? []);
      setSort("sort" in view ? (view.sort ?? null) : DEFAULT_SORT);
      setColumnVisibility(view.columnVisibility ?? DEFAULT_COLUMN_VISIBILITY);
    }

    const filtered = useMemo(() => {
      return EMPLOYEES.filter((row) => matchesTableFilters(row, filters));
    }, [filters]);

    const sortedRows = useMemo(() => {
      const head = Array.isArray(sort) ? (sort[0] ?? null) : sort;
      if (head === null) return filtered;
      return [...filtered].sort((a, b) => {
        const direction = head.direction === "asc" ? 1 : -1;
        if (head.key === "hours") {
          const left =
            a.hours === "—"
              ? Number.NEGATIVE_INFINITY
              : Number(a.hours.replace("h", ""));
          const right =
            b.hours === "—"
              ? Number.NEGATIVE_INFINITY
              : Number(b.hours.replace("h", ""));
          return (left - right) * direction;
        }
        const left = String(a[head.key as keyof EmployeeRow] ?? "");
        const right = String(b[head.key as keyof EmployeeRow] ?? "");
        return left.localeCompare(right) * direction;
      });
    }, [filtered, sort]);

    const allSelectableRows = sortedRows.filter(
      (row) => row.state !== "disabled",
    );

    function reset() {
      const defaultView = BUILT_IN_VIEWS[0];
      setActiveViewKey(defaultView.key);
      setFilters(defaultView.filters);
      setSort(defaultView.sort);
      setColumnVisibility(defaultView.columnVisibility);
    }

    function updateColumnVisibility(nextVisibility: TableColumnVisibility) {
      setColumnVisibility(nextVisibility);
      markCustomView();
    }

    return (
        <Table
          containerClassName="tbl-shell"
          columns={EMPLOYEE_COLUMNS}
          data={sortedRows}
          defaultColumnVisibility={DEFAULT_COLUMN_VISIBILITY}
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={updateColumnVisibility}
          rowKey="id"
          rowClassName={(row) =>
            selectedIds.includes(row.original.id) ? "selected" : rowState(row)
          }
          views={{
            items: viewItems,
            activeKey: activeViewKey,
            onActiveKeyChange: setActiveViewKey,
            onViewApply: applyView,
          }}
          toolbar={{
            columns: {},
            primaryAction: {
              label: "＋ 新規申請",
            },
          }}
          filters={filters}
          onFiltersChange={updateFilters}
          batchActions={{
            selectedRowKeys: selectedIds,
            onSelectedRowKeysChange: setSelectedIds,
            getCheckboxDisabled: (row) => row.original.state === "disabled",
            selectAllLabel: () => `全 ${allSelectableRows.length} 件を選択`,
            actions: batchActionsFor(),
          }}
          sort={sort}
          onSortChange={(nextSort) => {
            setSort(nextSort);
            markCustomView();
          }}
          onResetFilters={reset}
          footer={
            <div className="totals">
              <span>
                選択 <b>{selectedIds.length}</b> 件
              </span>
              <span>
                表示中の合計{" "}
                <b>
                  {sortedRows
                    .filter((row) => row.hours !== "—")
                    .reduce(
                      (sum, row) => sum + Number(row.hours.replace("h", "")),
                      0,
                    )
                    .toFixed(1)}{" "}
                  h
                </b>
              </span>
            </div>
          }
        />
    );
  },
};

export const InteractionRegression: Story = {
  ...PackagedFeatures,
  name: "Default · interaction regression",
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await expect(canvas.getByText("田中 美咲")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: /承認待ち/ }));
    await expect(canvas.getByText("Nguyễn Lan")).toBeVisible();
    await expect(canvas.queryByText("田中 美咲")).toBeNull();

    const savedViewLabel = `Story regression view ${Date.now()}`;
    await userEvent.click(
      canvas.getByRole("button", { name: /列設定|Columns|Cột|Mga column/ }),
    );
    await body.findByRole("dialog", { name: /列設定|Columns|Cột|Mga column/ });
    await userEvent.click(
      body.getByRole("button", { name: /閉じる|Close|Đóng|Isara/ }),
    );
    await expect(
      body.queryByRole("heading", { name: /列設定|Columns|Cột|Mga column/ }),
    ).toBeNull();

    await userEvent.click(
      canvas.getByRole("button", {
        name: /ビューを保存|Save view|Lưu view|I-save ang view/,
      }),
    );
    await body.findByRole("dialog", {
      name: /ビューを保存|Save view|Lưu view|I-save ang view/,
    });
    const viewName = body.getByLabelText(/ビュー名|View name|Tên view|Pangalan ng view/);
    await userEvent.clear(viewName);
    await userEvent.type(viewName, savedViewLabel);
    await userEvent.click(
      body.getByRole("button", {
        name: /保存|Save|Continue|Lưu|Tiếp tục|I-save|Magpatuloy/,
      }),
    );
    await expect(
      await canvas.findByText(savedViewLabel),
    ).toBeVisible();
    // Use findByRole so we wait for the delete button — the saved-view
    // label and the adjacent delete button render together but the
    // synchronous getByRole can race the second commit.
    const deleteButton = await canvas.findByRole("button", {
      name: new RegExp(
        `(削除|Delete|Xóa|Tanggalin).*${escapeRegExp(savedViewLabel)}`,
      ),
    });
    await userEvent.click(deleteButton);
    await expect(canvas.queryByText(savedViewLabel)).toBeNull();

    await userEvent.click(canvas.getByLabelText(/Select row emp-001|row emp-001/));
    await expect(
      canvas.getByText(/件選択中|selected|Đã chọn|ang napili/),
    ).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: /選択解除|Clear selection|Bỏ chọn|Alisin/ }),
    ).toBeVisible();
  },
};

export const SearchMode_Submit: Story = {
  name: "SearchMode · submit only",
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
      <div style={{ display: "grid", gap: "var(--spacing-3)" }}>
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
      </div>
    );
  },
};

export const Basic: Story = {
  name: "Basic · plain data table",
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

export const WithToolbar: Story = {
  name: "WithToolbar · toolbar prop",
  render: () => (
    <Table
      columns={EMPLOYEE_COLUMNS}
      data={EMPLOYEES}
      getRowId={(row) => row.name}
      rowClassName={rowState}
      toolbar={
        <>
          <span className="selection-count">3 件選択中</span>
          <span className="spacer" />
          <Button size="small" variant="ghost">
            アーカイブ
          </Button>
          <Button size="small" variant="destructive">
            削除
          </Button>
        </>
      }
    />
  ),
};

export const BulkActions: Story = {
  name: "Bulk actions · selection mode",
  render: () => (
    <Table
      containerClassName="tbl-shell"
      columns={EMPLOYEE_COLUMNS}
      data={EMPLOYEES}
      getRowId={(row) => row.name}
      rowClassName={rowState}
      toolbar={
        <>
          <span className="selection-count">3 件選択中</span>
          <Button size="small" variant="ghost">
            全 1,284 件を選択
          </Button>
          <span className="spacer" />
          <Button size="small" variant="ghost">
            一括承認
          </Button>
          <Button size="small" variant="outline">
            CSV 出力
          </Button>
          <Button size="small" variant="destructive">
            却下
          </Button>
        </>
      }
    />
  ),
};

export const Empty: Story = {
  name: "Empty · default state",
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
                  <span style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                    <Button size="x-small" variant="ghost">
                      却下
                    </Button>
                    <Button size="x-small">承認</Button>
                  </span>
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
    meta: { className: "actions", sticky: "right", hideable: false },
  },
];

export const StickyColumns: Story = {
  name: "A9 · Sticky columns (left avatar + right actions)",
  parameters: {
    docs: {
      description: {
        story:
          "`meta.sticky: 'left' | 'right'` pins columns at the table edges. The column-manager Sheet renders a 🔒 / 🔓 toggle so users can lock / unlock columns at runtime. The canvas is narrow — scroll horizontally to confirm both sticky bands stay put.",
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
          toolbar={{
            columns: {},
            primaryAction: false,
          }}
        />
      </div>
    );
  },
};

// ─────────────────────────────────────────────────────────────────
// A10 — Pagination · 3 variants · canon ⑩
// ─────────────────────────────────────────────────────────────────

export const Pagination_Numbered: Story = {
  name: "A10a · Pagination — numbered (default)",
  render: function PaginationNumbered() {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);
    return (
      <Table
        containerClassName="tbl-shell"
        columns={EMPLOYEE_COLUMNS}
        data={EMPLOYEES.slice(0, pageSize)}
        rowKey="id"
        pagination={{
          type: "numbered",
          current: page,
          pageSize,
          total: 1284,
          pageSizeOptions: [25, 50, 100],
          onChange: (nextPage, nextPageSize) => {
            setPage(nextPage);
            setPageSize(nextPageSize);
          },
        }}
      />
    );
  },
};

export const Pagination_LoadMore: Story = {
  name: "A10b · Pagination — load-more (feed)",
  render: function PaginationLoadMore() {
    const [count, setCount] = useState(25);
    return (
      <Table
        containerClassName="tbl-shell"
        columns={EMPLOYEE_COLUMNS}
        data={EMPLOYEES.slice(0, 3)}
        rowKey="id"
        pagination={{
          type: "load-more",
          hasMore: count < 1284,
          onLoadMore: () => setCount((current) => Math.min(current + 50, 1284)),
          currentCount: count,
          total: 1284,
          batchSize: 50,
          loadMoreLabel: <>さらに 50 件読み込む</>,
          progressLabel: (current, total) => (
            <>{`${current} / ${total.toLocaleString()} 件 表示中`}</>
          ),
        }}
      />
    );
  },
};

export const Pagination_Cursor: Story = {
  name: "A10c · Pagination — cursor (jump-to-month)",
  render: function PaginationCursor() {
    const [month, setMonth] = useState("2026-05");
    return (
      <Table
        containerClassName="tbl-shell"
        columns={EMPLOYEE_COLUMNS}
        data={EMPLOYEES.slice(0, 3)}
        rowKey="id"
        pagination={{
          type: "cursor",
          value: month,
          inputType: "month",
          label: <>{`${month.replace("-", "年 ")}月 (820 件)`}</>,
          onChange: (next) => setMonth(next),
          prevLabel: <>← 前の月</>,
          nextLabel: <>次の月 →</>,
          jumpToLatestLabel: <>{"<< 最新"}</>,
          onJumpToLatest: () => setMonth("2026-05"),
          onPrev: () => {
            const [y, m] = month.split("-").map(Number);
            const d = new Date(y, m - 2, 1);
            setMonth(
              `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
            );
          },
          onNext: () => {
            const [y, m] = month.split("-").map(Number);
            const d = new Date(y, m, 1);
            setMonth(
              `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
            );
          },
        }}
      />
    );
  },
};
