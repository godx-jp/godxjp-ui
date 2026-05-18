import type { Meta, StoryObj } from "@storybook/react";
import { useMemo, useState } from "react";
import { Badge } from "../../components/data-display/Badge";
import type {
  TableColumn,
  TableColumnVisibility,
  TableFilter,
  TableSort,
  TableSortState,
  TableViewItem,
} from "../../components/data-display/Table";
import {
  DataTable,
  useDataTable,
} from "../../components/composites/data-table";
import { Button } from "../../components/general/Button";
import {
  useTablePagination,
  useTableSelection,
  useTableState,
  useTableViews,
} from "../../hooks";
import employeeRows from "../data-display/fixtures/table-employees.json";

/**
 * Composites/DataTable — packaged table built over the slim `<Table>`
 * primitive + the table hooks (`useTablePagination`,
 * `useTableSelection`, `useTableViews`, `useTableState`). Stage 3 of
 * the table refactor (Plan §3).
 *
 * The hook-based API is the ergonomic surface; bare `<Table>` is
 * still available for consumers who want only the primitive.
 */

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

const DEFAULT_VISIBILITY: TableColumnVisibility = { hours: false };
const DEFAULT_SORT: TableSort = { key: "date", direction: "desc" };

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
  const map = {
    paid: { variant: "primary" as const, label: "有給" },
    late: { variant: "attention" as const, label: "遅刻" },
    trip: { variant: "info" as const, label: "出張" },
    absence: { variant: "error" as const, label: "欠勤" },
    normal: { variant: "neutral" as const, label: "通常" },
  };
  const { variant, label } = map[kind];
  return (
    <Badge variant={variant} dot={false}>
      {label}
    </Badge>
  );
}

const COLUMNS: TableColumn<EmployeeRow>[] = [
  {
    accessorKey: "date",
    header: "日付",
    size: 112,
    minSize: 112,
    meta: { sortable: true, sticky: { side: "left", from: "md" } },
  },
  {
    accessorKey: "name",
    header: "従業員",
    minSize: 180,
    meta: { filterable: true, sticky: { side: "left", from: "md" } },
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
    meta: { filterable: true, filterOptions: SHOP_OPTIONS },
  },
  {
    accessorKey: "kind",
    header: "区分",
    minSize: 88,
    cell: ({ row }) => <KindBadge kind={row.original.kind} />,
    meta: { filterable: true, filterOptions: KIND_OPTIONS },
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
    meta: {
      className: "actions",
      sticky: { side: "right", from: "md" },
      hideable: false,
    },
  },
];

const BUILT_IN_VIEWS: TableViewItem[] = [
  { key: "all", label: "すべて", filters: [], sort: DEFAULT_SORT },
  {
    key: "pending",
    label: "承認待ち",
    filters: [{ key: "status", operator: "eq", value: "pending" }],
    sort: DEFAULT_SORT,
  },
  {
    key: "late",
    label: "遅刻 / 早退",
    filters: [{ key: "kind", operator: "eq", value: "late" }],
    sort: DEFAULT_SORT,
  },
];

function matches(row: EmployeeRow, filters: TableFilter[]) {
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

function sortRows(rows: EmployeeRow[], sort: TableSortState): EmployeeRow[] {
  const head = Array.isArray(sort) ? (sort[0] ?? null) : sort;
  if (head === null) return rows;
  const direction = head.direction === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    if (head.key === "hours") {
      const toNum = (v: string) =>
        v === "—" ? Number.NEGATIVE_INFINITY : Number(v.replace("h", ""));
      return (toNum(a.hours) - toNum(b.hours)) * direction;
    }
    const left = String(a[head.key as keyof EmployeeRow] ?? "");
    const right = String(b[head.key as keyof EmployeeRow] ?? "");
    return left.localeCompare(right) * direction;
  });
}

function replaceFilter(
  filters: TableFilter[],
  next: TableFilter,
): TableFilter[] {
  const rest = filters.filter((f) => f.key !== next.key);
  const value = String(next.value ?? "").trim();
  return value === "" ? rest : [...rest, next];
}

const meta: Meta<typeof DataTable> = {
  title: "Composites/DataTable",
  component: DataTable,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      // Pin every story's Code panel to the static source extract.
      // Storybook's runtime `prettyPrint2` chokes on the TanStack
      // column-def + composite prop tree (RangeError: Invalid string
      // length) and freezes the autodocs view when several heavy
      // stories render at once.
      source: { type: "code" },
      description: {
        component: `
**DataTable** — packaged table composite. Pairs the slim
\`<Table>\` primitive with hook-based state slices
(\`useTablePagination\`, \`useTableSelection\`, \`useTableViews\`,
\`useTableState\`). Reach for it when you need the canonical
"data-table page" experience; reach for \`<Table>\` directly when
you only need rows + columns rendering.
        `.trim(),
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof DataTable>;

// ─────────────────────────────────────────────────────────────────
// 1 — Basic. Minimal hook-based usage.
// ─────────────────────────────────────────────────────────────────

export const Basic: Story = {
  name: "Basic · hook-based minimal example",
  render: function Basic() {
    const pagination = useTablePagination({ defaultPageSize: 5 });
    const data = useMemo(
      () =>
        EMPLOYEES.slice(
          (pagination.page - 1) * pagination.pageSize,
          pagination.page * pagination.pageSize,
        ),
      [pagination.page, pagination.pageSize],
    );

    const table = useDataTable({
      data,
      columns: COLUMNS,
      rowKey: "id",
      pagination,
      total: EMPLOYEES.length,
      defaultColumnVisibility: DEFAULT_VISIBILITY,
    });

    return <DataTable table={table} containerClassName="tbl-shell" />;
  },
};

// ─────────────────────────────────────────────────────────────────
// 2 — Bulk actions. Selection slice.
// ─────────────────────────────────────────────────────────────────

export const BulkActions: Story = {
  name: "BulkActions · useTableSelection slice",
  render: function BulkActions() {
    const selection = useTableSelection({ defaultSelected: ["emp-002"] });
    const pagination = useTablePagination({ defaultPageSize: 5 });
    const data = useMemo(
      () =>
        EMPLOYEES.slice(
          (pagination.page - 1) * pagination.pageSize,
          pagination.page * pagination.pageSize,
        ),
      [pagination.page, pagination.pageSize],
    );

    const table = useDataTable({
      data,
      columns: COLUMNS,
      rowKey: "id",
      selection,
      pagination,
      total: EMPLOYEES.length,
      defaultColumnVisibility: DEFAULT_VISIBILITY,
      batchActions: {
        actions: (
          <>
            <Button size="small" variant="outline">
              一括承認
            </Button>
            <Button size="small" variant="outline">
              CSV 出力
            </Button>
            <Button size="small" variant="destructive" onClick={selection.clear}>
              却下
            </Button>
          </>
        ),
        getCheckboxDisabled: (row) => row.original.state === "disabled",
      },
    });

    return <DataTable table={table} containerClassName="tbl-shell" />;
  },
};

// ─────────────────────────────────────────────────────────────────
// 3 — PackagedFeatures. The full integration — views + toolbar
//     + filters + selection + pagination + persistence.
// ─────────────────────────────────────────────────────────────────

export const PackagedFeatures: Story = {
  name: "PackagedFeatures · views · toolbar · batch · persisted views",
  // Excluded from the autodocs view — mounting this on the same page
  // as the other DataTable stories froze Storybook (4 TanStack
  // instances + cmdk + sheet + dialog all simultaneously). Still
  // available via the sidebar.
  tags: ["!autodocs"],
  parameters: { docs: { source: { type: "code" } } },
  render: function PackagedFeatures() {
    const [filters, setFilters] = useState<TableFilter[]>([]);
    const [sort, setSort] = useState<TableSortState>(DEFAULT_SORT);
    const [searchDraft, setSearchDraft] = useState("");
    const [columnVisibility, setColumnVisibility] =
      useTableState<TableColumnVisibility>({
        storageKey: "composites.DataTable.packaged.columnVisibility",
        defaultValue: DEFAULT_VISIBILITY,
        version: 1,
      });

    const selection = useTableSelection({ defaultSelected: ["emp-002"] });
    const pagination = useTablePagination({ defaultPageSize: 5 });
    const views = useTableViews({
      items: BUILT_IN_VIEWS,
      storageKey: "composites.DataTable.packaged.views",
    });

    const matched = useMemo(
      () => sortRows(EMPLOYEES.filter((row) => matches(row, filters)), sort),
      [filters, sort],
    );
    const rows = useMemo(
      () =>
        matched.slice(
          (pagination.page - 1) * pagination.pageSize,
          pagination.page * pagination.pageSize,
        ),
      [matched, pagination.page, pagination.pageSize],
    );

    const table = useDataTable({
      data: rows,
      columns: COLUMNS,
      rowKey: "id",
      pagination,
      total: matched.length,
      pageSizeOptions: [5, 10, 20],
      selection,
      views,
      columnVisibility,
      defaultColumnVisibility: DEFAULT_VISIBILITY,
      onColumnVisibilityChange: (next) => {
        setColumnVisibility(next);
        views.markCustom();
      },
      filters,
      onFiltersChange: (next) => {
        setFilters(next);
        pagination.resetPage();
        views.markCustom();
      },
      sort,
      onSortChange: (next) => {
        setSort(next);
        views.markCustom();
      },
      onResetFilters: () => {
        const defaultView = BUILT_IN_VIEWS[0];
        setFilters(defaultView.filters ?? []);
        setSort(defaultView.sort ?? null);
        setSearchDraft("");
        pagination.resetPage();
        views.setActiveKey(defaultView.key);
      },
      onViewApply: (view) => {
        setFilters(view.filters ?? []);
        setSort(view.sort ?? null);
        if (view.columnVisibility !== undefined)
          setColumnVisibility(view.columnVisibility);
        setSearchDraft("");
        pagination.resetPage();
      },
      toolbar: {
        search: {
          value: searchDraft,
          onValueChange: setSearchDraft,
          onSearch: (value) => {
            setFilters((prev) =>
              replaceFilter(prev, {
                key: "name",
                operator: "contains",
                value,
              }),
            );
            pagination.resetPage();
            views.markCustom();
          },
          onClear: () => {
            setFilters((prev) =>
              replaceFilter(prev, {
                key: "name",
                operator: "contains",
                value: "",
              }),
            );
            pagination.resetPage();
            views.markCustom();
          },
          placeholder: "名前 / かな / 役職 / 店舗 で検索",
        },
        columns: {},
      },
      batchActions: {
        actions: (
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
        ),
        getCheckboxDisabled: (row) => row.original.state === "disabled",
      },
    });

    return (
      <DataTable
        table={table}
        containerClassName="tbl-shell"
        slots={{
          primaryAction: { label: "＋ 新規申請" },
          footer: (
            <div className="totals">
              <span>
                選択 <b>{selection.count}</b> 件
              </span>
              <span>
                該当 <b>{matched.length}</b> 件
              </span>
            </div>
          ),
        }}
      />
    );
  },
};

// ─────────────────────────────────────────────────────────────────
// 4 — Persistent columns. useTableState persists visibility.
// ─────────────────────────────────────────────────────────────────

export const PersistentVisibility: Story = {
  name: "Persistent visibility · useTableState",
  parameters: {
    docs: {
      description: {
        story:
          "Persists column visibility under a versioned localStorage key via `useTableState`. Refresh the page after toggling visibility — settings stick.",
      },
    },
  },
  render: function PersistentVisibility() {
    const [columnVisibility, setColumnVisibility] =
      useTableState<TableColumnVisibility>({
        storageKey: "composites.DataTable.persistent.columnVisibility",
        defaultValue: DEFAULT_VISIBILITY,
        version: 1,
      });
    const pagination = useTablePagination({ defaultPageSize: 8 });
    const data = useMemo(
      () =>
        EMPLOYEES.slice(
          (pagination.page - 1) * pagination.pageSize,
          pagination.page * pagination.pageSize,
        ),
      [pagination.page, pagination.pageSize],
    );

    const table = useDataTable({
      data,
      columns: COLUMNS,
      rowKey: "id",
      pagination,
      total: EMPLOYEES.length,
      columnVisibility,
      defaultColumnVisibility: DEFAULT_VISIBILITY,
      onColumnVisibilityChange: setColumnVisibility,
      toolbar: { columns: {} },
    });

    return <DataTable table={table} containerClassName="tbl-shell" />;
  },
};
