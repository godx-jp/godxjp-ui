import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useState } from "react";
import { expect, waitFor, within } from "storybook/test";
import { Badge } from "../../components/data-display/Badge";
import type {
  TableColumn,
  TableColumnVisibility,
  TableFilter,
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
import {
  BUILT_IN_VIEWS,
  fetchEmployees,
  KIND_OPTIONS,
  SHOP_OPTIONS,
  type EmployeeRow,
  type FetchEmployeesResponse,
} from "./fixtures/employees-api";

/**
 * Composites/DataTable — packaged table built over the slim `<Table>`
 * primitive + the table hooks (`useTablePagination`,
 * `useTableSelection`, `useTableViews`, `useTableState`).
 *
 * Stories fetch employee data via a mock `fetchEmployees()` async
 * helper. The "fetch on dependency change → setState" pattern in each
 * `render` body is the canonical integration path — swap
 * `fetchEmployees` for your real HTTP client (REST, GraphQL,
 * tRPC, …) and the rest carries over.
 */

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
  { accessorKey: "role", header: "役職", minSize: 120 },
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

const DEFAULT_VISIBILITY: TableColumnVisibility = { hours: false };
const DEFAULT_SORT = { key: "date", direction: "desc" as const };

const EMPTY_RESPONSE: FetchEmployeesResponse = { rows: [], total: 0 };

const meta: Meta<typeof DataTable> = {
  title: "Composites/DataTable",
  component: DataTable,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      // Pin every story's Code panel to the static source extract.
      // Storybook's runtime `prettyPrint2` chokes on the TanStack
      // column-def + composite prop tree and freezes the autodocs
      // view when several heavy stories render at once.
      source: { type: "code" },
      description: {
        component: `
**DataTable** — packaged table composite. Pairs the slim
\`<Table>\` primitive with hook-based state slices
(\`useTablePagination\`, \`useTableSelection\`, \`useTableViews\`,
\`useTableState\`). Reach for it when you need the canonical
"data-table page" experience; reach for \`<Table>\` directly when
you only need rows + columns rendering.

Every story fetches via the \`fetchEmployees(params)\` mock so the
Code panel shows the canonical pattern: \`useEffect\` re-fetches on
pagination / filter / sort / view changes, the response feeds
\`useDataTable({ data, total })\`. Replace the import with your real
HTTP client to ship.
        `.trim(),
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof DataTable>;

// ─────────────────────────────────────────────────────────────────
// 1 — Basic. Fetch + paginate.
// ─────────────────────────────────────────────────────────────────

export const Basic: Story = {
  name: "Basic · fetch + pagination",
  render: function Basic() {
    const pagination = useTablePagination({ defaultPageSize: 5 });
    const [data, setData] = useState<FetchEmployeesResponse>(EMPTY_RESPONSE);

    useEffect(() => {
      fetchEmployees({
        page: pagination.page,
        pageSize: pagination.pageSize,
      }).then(setData);
    }, [pagination.page, pagination.pageSize]);

    const table = useDataTable({
      data: data.rows,
      columns: COLUMNS,
      rowKey: "id",
      pagination,
      total: data.total,
      defaultColumnVisibility: DEFAULT_VISIBILITY,
    });

    return <DataTable table={table} containerClassName="tbl-shell" />;
  },
};

// ─────────────────────────────────────────────────────────────────
// 2 — Bulk actions. Selection slice + batch band.
// ─────────────────────────────────────────────────────────────────

export const BulkActions: Story = {
  name: "BulkActions · useTableSelection slice",
  render: function BulkActions() {
    const pagination = useTablePagination({ defaultPageSize: 5 });
    const selection = useTableSelection({ defaultSelected: ["emp-002"] });
    const [data, setData] = useState<FetchEmployeesResponse>(EMPTY_RESPONSE);

    useEffect(() => {
      fetchEmployees({
        page: pagination.page,
        pageSize: pagination.pageSize,
      }).then(setData);
    }, [pagination.page, pagination.pageSize]);

    const table = useDataTable({
      data: data.rows,
      columns: COLUMNS,
      rowKey: "id",
      pagination,
      total: data.total,
      selection,
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
            <Button
              size="small"
              variant="destructive"
              onClick={selection.clear}
            >
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
// 3 — WithToolbar. Toolbar primary action + columns button.
// ─────────────────────────────────────────────────────────────────

export const WithToolbar: Story = {
  name: "WithToolbar · primary action + columns button",
  render: function WithToolbar() {
    const pagination = useTablePagination({ defaultPageSize: 5 });
    const [data, setData] = useState<FetchEmployeesResponse>(EMPTY_RESPONSE);

    useEffect(() => {
      fetchEmployees({
        page: pagination.page,
        pageSize: pagination.pageSize,
      }).then(setData);
    }, [pagination.page, pagination.pageSize]);

    const table = useDataTable({
      data: data.rows,
      columns: COLUMNS,
      rowKey: "id",
      pagination,
      total: data.total,
      defaultColumnVisibility: DEFAULT_VISIBILITY,
      toolbar: {
        columns: {},
        primaryAction: { label: "＋ 新規申請" },
      },
    });

    return <DataTable table={table} containerClassName="tbl-shell" />;
  },
};

// ─────────────────────────────────────────────────────────────────
// 4 — PackagedFeatures. The full integration — fetch with all params.
// ─────────────────────────────────────────────────────────────────

export const PackagedFeatures: Story = {
  name: "PackagedFeatures · views · toolbar · batch · search",
  tags: ["!autodocs"], // heavy story — keep off the docs page
  parameters: { docs: { source: { type: "code" } } },
  render: function PackagedFeatures() {
    const pagination = useTablePagination({ defaultPageSize: 5 });
    const selection = useTableSelection({ defaultSelected: ["emp-002"] });
    const views = useTableViews({
      items: BUILT_IN_VIEWS,
      storageKey: "composites.DataTable.packaged.views",
    });
    const [columnVisibility, setColumnVisibility] =
      useTableState<TableColumnVisibility>({
        storageKey: "composites.DataTable.packaged.columnVisibility",
        defaultValue: DEFAULT_VISIBILITY,
        version: 1,
      });

    const [filters, setFilters] = useState<TableFilter[]>([]);
    const [sort, setSort] = useState<TableSortState>(DEFAULT_SORT);
    const [searchDraft, setSearchDraft] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const [data, setData] = useState<FetchEmployeesResponse>(EMPTY_RESPONSE);

    useEffect(() => {
      fetchEmployees({
        page: pagination.page,
        pageSize: pagination.pageSize,
        filters,
        sort,
        q: searchQuery,
      }).then(setData);
    }, [
      pagination.page,
      pagination.pageSize,
      filters,
      sort,
      searchQuery,
    ]);

    const table = useDataTable({
      data: data.rows,
      columns: COLUMNS,
      rowKey: "id",
      pagination,
      total: data.total,
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
        setSearchQuery("");
        pagination.resetPage();
        views.setActiveKey(defaultView.key);
      },
      onViewApply: (view) => {
        setFilters(view.filters ?? []);
        setSort(view.sort ?? null);
        if (view.columnVisibility !== undefined)
          setColumnVisibility(view.columnVisibility);
        setSearchDraft("");
        setSearchQuery("");
        pagination.resetPage();
      },
      toolbar: {
        search: {
          value: searchDraft,
          onValueChange: setSearchDraft,
          onSearch: (value) => {
            setSearchQuery(value);
            pagination.resetPage();
            views.markCustom();
          },
          onClear: () => {
            setSearchDraft("");
            setSearchQuery("");
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
                該当 <b>{data.total}</b> 件
              </span>
            </div>
          ),
        }}
      />
    );
  },
};

// ─────────────────────────────────────────────────────────────────
// 5 — PersistentVisibility. useTableState across reloads.
// ─────────────────────────────────────────────────────────────────

export const PersistentVisibility: Story = {
  name: "PersistentVisibility · useTableState",
  parameters: {
    docs: {
      description: {
        story:
          "Persists column visibility under a versioned localStorage key via `useTableState`. Refresh the page after toggling visibility — settings stick.",
      },
    },
  },
  render: function PersistentVisibility() {
    const pagination = useTablePagination({ defaultPageSize: 8 });
    const [columnVisibility, setColumnVisibility] =
      useTableState<TableColumnVisibility>({
        storageKey: "composites.DataTable.persistent.columnVisibility",
        defaultValue: DEFAULT_VISIBILITY,
        version: 1,
      });
    const [data, setData] = useState<FetchEmployeesResponse>(EMPTY_RESPONSE);

    useEffect(() => {
      fetchEmployees({
        page: pagination.page,
        pageSize: pagination.pageSize,
      }).then(setData);
    }, [pagination.page, pagination.pageSize]);

    const table = useDataTable({
      data: data.rows,
      columns: COLUMNS,
      rowKey: "id",
      pagination,
      total: data.total,
      columnVisibility,
      defaultColumnVisibility: DEFAULT_VISIBILITY,
      onColumnVisibilityChange: setColumnVisibility,
      toolbar: { columns: {} },
    });

    return <DataTable table={table} containerClassName="tbl-shell" />;
  },
};

// ─────────────────────────────────────────────────────────────────
// 6 — InteractionRegression. Smoke test for views + columns + select.
// ─────────────────────────────────────────────────────────────────

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const InteractionRegression: Story = {
  ...PackagedFeatures,
  name: "Default · interaction regression",
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await expect(await canvas.findByText("田中 美咲")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: /承認待ち/ }));
    await expect(await canvas.findByText("Nguyễn Lan")).toBeVisible();
    // `fetchEmployees` has an 80ms artificial delay — wait for the
    // pending-only response to land before asserting Tanaka is gone.
    await waitFor(() =>
      expect(canvas.queryByText("田中 美咲")).toBeNull(),
    );

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
    const viewName = body.getByLabelText(
      /ビュー名|View name|Tên view|Pangalan ng view/,
    );
    await userEvent.clear(viewName);
    await userEvent.type(viewName, savedViewLabel);
    await userEvent.click(
      body.getByRole("button", {
        name: /保存|Save|Continue|Lưu|Tiếp tục|I-save|Magpatuloy/,
      }),
    );
    await expect(await canvas.findByText(savedViewLabel)).toBeVisible();
    const deleteButton = await canvas.findByRole("button", {
      name: new RegExp(
        `(削除|Delete|Xóa|Tanggalin).*${escapeRegExp(savedViewLabel)}`,
      ),
    });
    await userEvent.click(deleteButton);
    await expect(canvas.queryByText(savedViewLabel)).toBeNull();

    // Wait for the re-fetch triggered by view-delete → fallback view
    // to repopulate the table with the unfiltered first page.
    const rowCheckbox = await canvas.findByLabelText(
      /Select row emp-001|row emp-001/,
    );
    await userEvent.click(rowCheckbox);
    await expect(
      canvas.getByText(/件選択中|selected|Đã chọn|ang napili/),
    ).toBeVisible();
    await expect(
      canvas.getByRole("button", {
        name: /選択解除|Clear selection|Bỏ chọn|Alisin/,
      }),
    ).toBeVisible();
  },
};

// ─────────────────────────────────────────────────────────────────
// 7 — Pagination variants (numbered / load-more / cursor).
// ─────────────────────────────────────────────────────────────────

export const Pagination_Numbered: Story = {
  name: "Pagination · numbered",
  render: function PaginationNumbered() {
    const pagination = useTablePagination({ defaultPageSize: 5 });
    const [data, setData] = useState<FetchEmployeesResponse>(EMPTY_RESPONSE);

    useEffect(() => {
      fetchEmployees({
        page: pagination.page,
        pageSize: pagination.pageSize,
      }).then(setData);
    }, [pagination.page, pagination.pageSize]);

    const table = useDataTable({
      data: data.rows,
      columns: COLUMNS,
      rowKey: "id",
      pagination,
      total: data.total,
      pageSizeOptions: [5, 10, 20, 50],
      showSizeChanger: true,
      defaultColumnVisibility: DEFAULT_VISIBILITY,
    });

    return <DataTable table={table} containerClassName="tbl-shell" />;
  },
};

export const Pagination_LoadMore: Story = {
  name: "Pagination · load-more (feed)",
  render: function PaginationLoadMore() {
    const PAGE_SIZE = 4;
    const [page, setPage] = useState(1);
    const [accumulated, setAccumulated] = useState<EmployeeRow[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      setLoading(true);
      fetchEmployees({ page, pageSize: PAGE_SIZE }).then((response) => {
        setAccumulated((prev) =>
          page === 1 ? response.rows : [...prev, ...response.rows],
        );
        setTotal(response.total);
        setLoading(false);
      });
    }, [page]);

    const table = useDataTable({
      data: accumulated,
      columns: COLUMNS,
      rowKey: "id",
      defaultColumnVisibility: DEFAULT_VISIBILITY,
    });

    return (
      <DataTable
        table={{
          ...table,
          tableProps: { ...table.tableProps },
          chromeProps: {
            ...table.chromeProps,
            pagination: {
              type: "load-more",
              hasMore: accumulated.length < total,
              currentCount: accumulated.length,
              total,
              loadingMore: loading,
              onLoadMore: () => setPage((p) => p + 1),
            },
          },
        }}
        containerClassName="tbl-shell"
      />
    );
  },
};

export const Pagination_Cursor: Story = {
  name: "Pagination · cursor (period jumper)",
  render: function PaginationCursor() {
    const [period, setPeriod] = useState("2025-05");
    const pagination = useTablePagination({ defaultPageSize: 5 });
    const [data, setData] = useState<FetchEmployeesResponse>(EMPTY_RESPONSE);

    useEffect(() => {
      fetchEmployees({
        page: pagination.page,
        pageSize: pagination.pageSize,
      }).then(setData);
    }, [pagination.page, pagination.pageSize, period]);

    const table = useDataTable({
      data: data.rows,
      columns: COLUMNS,
      rowKey: "id",
      defaultColumnVisibility: DEFAULT_VISIBILITY,
    });

    return (
      <DataTable
        table={{
          ...table,
          chromeProps: {
            ...table.chromeProps,
            pagination: {
              type: "cursor",
              value: period,
              onChange: setPeriod,
              label: `${period.replace("-", " / ")} の勤怠`,
              inputType: "month",
              onPrev: () => {
                const [y, m] = period.split("-").map(Number);
                const next = m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, "0")}`;
                setPeriod(next);
              },
              onNext: () => {
                const [y, m] = period.split("-").map(Number);
                const next = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`;
                setPeriod(next);
              },
              onJumpToLatest: () => setPeriod("2025-05"),
            },
          },
        }}
        containerClassName="tbl-shell"
      />
    );
  },
};
