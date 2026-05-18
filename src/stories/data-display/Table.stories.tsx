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
  render: () => {
    const [activeViewKey, setActiveViewKey] = useState("all");
    const [filters, setFilters] = useState<TableFilter[]>([]);
    const [sort, setSort] = useState<TableSort | null>(DEFAULT_SORT);
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
      if (sort === null) return filtered;
      return [...filtered].sort((a, b) => {
        const direction = sort.direction === "asc" ? 1 : -1;
        if (sort.key === "hours") {
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
        const left = String(a[sort.key as keyof EmployeeRow] ?? "");
        const right = String(b[sort.key as keyof EmployeeRow] ?? "");
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
    await userEvent.click(
      canvas.getByRole("button", {
        name: new RegExp(
          `(削除|Delete|Xóa|Tanggalin).*${escapeRegExp(savedViewLabel)}`,
        ),
      }),
    );
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
