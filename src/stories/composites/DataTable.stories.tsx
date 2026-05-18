import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useState } from "react";
import { expect, waitFor, within } from "storybook/test";
import { Badge } from "../../components/data-display/Badge";
import type {
  TableColumn,
  TableColumnVisibility,
  TableFilter,
  TableSortState,
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

/**
 * Composites/DataTable — packaged table built over the slim `<Table>`
 * primitive + the table hooks. Every story below is **self-contained**:
 * the row type, the column defs, and the mock `fetchEmployees`
 * function are all inline so the Storybook Code panel shows
 * **copy-paste-runnable** code. Swap the inline `fetchEmployees` for
 * your real HTTP client (REST / GraphQL / tRPC / whatever) and ship.
 */

const meta: Meta<typeof DataTable> = {
  title: "Composites/DataTable",
  component: DataTable,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      source: { type: "code" },
      description: {
        component: `
**DataTable** — packaged table composite. Pairs the slim
\`<Table>\` primitive with hook-based state slices
(\`useTablePagination\`, \`useTableSelection\`, \`useTableViews\`,
\`useTableState\`).

Every story is self-contained: row type + columns + mock API are
inline inside the \`render\` function. The Code panel content is
runnable — copy it into a fresh component file, replace
\`fetchEmployees\` with your real HTTP call, done.
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
  parameters: {
    docs: {
      source: {
        language: "tsx",
        code: `import { useEffect, useState } from "react"
import {
  DataTable,
  useDataTable,
  useTablePagination,
  type TableColumn,
} from "@godxjp/ui"

type Employee = {
  id: string
  name: string
  role: string
  shop: string
  hours: string
}

async function fetchEmployees(params: {
  page: number
  pageSize: number
}): Promise<{ rows: Employee[]; total: number }> {
  const all: Employee[] = [
    { id: "e1", name: "田中 美咲", role: "店長", shop: "渋谷", hours: "8.0h" },
    { id: "e2", name: "Nguyễn Lan", role: "スタッフ", shop: "表参道", hours: "7.5h" },
    { id: "e3", name: "佐藤 健一", role: "副店長", shop: "自由が丘", hours: "8.0h" },
    { id: "e4", name: "山田 太郎", role: "スタッフ", shop: "渋谷", hours: "—" },
    { id: "e5", name: "鈴木 さくら", role: "アルバイト", shop: "新宿", hours: "6.0h" },
    { id: "e6", name: "渡辺 颯太", role: "スタッフ", shop: "表参道", hours: "7.0h" },
    { id: "e7", name: "山本 結衣", role: "スタッフ", shop: "渋谷", hours: "8.0h" },
  ]
  await new Promise((resolve) => setTimeout(resolve, 80))
  const start = (params.page - 1) * params.pageSize
  return {
    rows: all.slice(start, start + params.pageSize),
    total: all.length,
  }
}

const columns: TableColumn<Employee>[] = [
  { accessorKey: "name", header: "従業員", minSize: 180 },
  { accessorKey: "role", header: "役職", minSize: 120 },
  { accessorKey: "shop", header: "店舗", minSize: 96 },
  {
    accessorKey: "hours",
    header: "時間",
    minSize: 80,
    meta: { className: "num" },
  },
]

export default function Example() {
  const pagination = useTablePagination({ defaultPageSize: 3 })
  const [data, setData] = useState<{ rows: Employee[]; total: number }>({
    rows: [],
    total: 0,
  })

  useEffect(() => {
    fetchEmployees({
      page: pagination.page,
      pageSize: pagination.pageSize,
    }).then(setData)
  }, [pagination.page, pagination.pageSize])

  const table = useDataTable({
    data: data.rows,
    columns,
    rowKey: "id",
    pagination,
    total: data.total,
  })

  return <DataTable table={table} containerClassName="tbl-shell" />
}`,
      },
    },
  },
  render: function Basic() {
    interface Employee {
      id: string;
      name: string;
      role: string;
      shop: string;
      hours: string;
    }

    // Replace with your real API client (REST / GraphQL / tRPC / …).
    async function fetchEmployees(params: {
      page: number;
      pageSize: number;
    }): Promise<{ rows: Employee[]; total: number }> {
      const all: Employee[] = [
        { id: "e1", name: "田中 美咲", role: "店長", shop: "渋谷", hours: "8.0h" },
        { id: "e2", name: "Nguyễn Lan", role: "スタッフ", shop: "表参道", hours: "7.5h" },
        { id: "e3", name: "佐藤 健一", role: "副店長", shop: "自由が丘", hours: "8.0h" },
        { id: "e4", name: "山田 太郎", role: "スタッフ", shop: "渋谷", hours: "—" },
        { id: "e5", name: "鈴木 さくら", role: "アルバイト", shop: "新宿", hours: "6.0h" },
        { id: "e6", name: "渡辺 颯太", role: "スタッフ", shop: "表参道", hours: "7.0h" },
        { id: "e7", name: "山本 結衣", role: "スタッフ", shop: "渋谷", hours: "8.0h" },
      ];
      await new Promise((r) => setTimeout(r, 80));
      const start = (params.page - 1) * params.pageSize;
      return {
        rows: all.slice(start, start + params.pageSize),
        total: all.length,
      };
    }

    const columns: TableColumn<Employee>[] = [
      { accessorKey: "name", header: "従業員", minSize: 180 },
      { accessorKey: "role", header: "役職", minSize: 120 },
      { accessorKey: "shop", header: "店舗", minSize: 96 },
      {
        accessorKey: "hours",
        header: "時間",
        minSize: 80,
        meta: { className: "num" },
      },
    ];

    const pagination = useTablePagination({ defaultPageSize: 3 });
    const [data, setData] = useState<{ rows: Employee[]; total: number }>({
      rows: [],
      total: 0,
    });

    useEffect(() => {
      fetchEmployees({
        page: pagination.page,
        pageSize: pagination.pageSize,
      }).then(setData);
    }, [pagination.page, pagination.pageSize]);

    const table = useDataTable({
      data: data.rows,
      columns,
      rowKey: "id",
      pagination,
      total: data.total,
    });

    return <DataTable table={table} containerClassName="tbl-shell" />;
  },
};

// ─────────────────────────────────────────────────────────────────
// 2 — BulkActions. Selection slice + batch band.
// ─────────────────────────────────────────────────────────────────

export const BulkActions: Story = {
  name: "BulkActions · useTableSelection slice",
  parameters: {
    docs: {
      source: {
        language: "tsx",
        code: `import { useEffect, useState } from "react"
import {
  Button,
  DataTable,
  useDataTable,
  useTablePagination,
  useTableSelection,
  type TableColumn,
} from "@godxjp/ui"

type Employee = {
  id: string
  name: string
  role: string
  shop: string
  disabled?: boolean
}

async function fetchEmployees(params: {
  page: number
  pageSize: number
}): Promise<{ rows: Employee[]; total: number }> {
  const all: Employee[] = [
    { id: "e1", name: "田中 美咲", role: "店長", shop: "渋谷" },
    { id: "e2", name: "Nguyễn Lan", role: "スタッフ", shop: "表参道" },
    { id: "e3", name: "佐藤 健一", role: "副店長", shop: "自由が丘" },
    { id: "e4", name: "山田 太郎", role: "スタッフ", shop: "渋谷", disabled: true },
    { id: "e5", name: "鈴木 さくら", role: "アルバイト", shop: "新宿" },
  ]
  await new Promise((resolve) => setTimeout(resolve, 80))
  const start = (params.page - 1) * params.pageSize
  return {
    rows: all.slice(start, start + params.pageSize),
    total: all.length,
  }
}

const columns: TableColumn<Employee>[] = [
  { accessorKey: "name", header: "従業員", minSize: 180 },
  { accessorKey: "role", header: "役職", minSize: 120 },
  { accessorKey: "shop", header: "店舗", minSize: 96 },
]

export default function Example() {
  const pagination = useTablePagination({ defaultPageSize: 5 })
  const selection = useTableSelection({ defaultSelected: ["e2"] })
  const [data, setData] = useState<{ rows: Employee[]; total: number }>({
    rows: [],
    total: 0,
  })

  useEffect(() => {
    fetchEmployees({
      page: pagination.page,
      pageSize: pagination.pageSize,
    }).then(setData)
  }, [pagination.page, pagination.pageSize])

  const table = useDataTable({
    data: data.rows,
    columns,
    rowKey: "id",
    pagination,
    total: data.total,
    selection,
    batchActions: {
      actions: (
        <>
          <Button size="small" variant="outline">一括承認</Button>
          <Button size="small" variant="outline">CSV 出力</Button>
          <Button size="small" variant="destructive" onClick={selection.clear}>
            却下
          </Button>
        </>
      ),
      getCheckboxDisabled: (row) => row.original.disabled === true,
    },
  })

  return <DataTable table={table} containerClassName="tbl-shell" />
}`,
      },
    },
  },
  render: function BulkActions() {
    interface Employee {
      id: string;
      name: string;
      role: string;
      shop: string;
      disabled?: boolean;
    }

    async function fetchEmployees(params: {
      page: number;
      pageSize: number;
    }): Promise<{ rows: Employee[]; total: number }> {
      const all: Employee[] = [
        { id: "e1", name: "田中 美咲", role: "店長", shop: "渋谷" },
        { id: "e2", name: "Nguyễn Lan", role: "スタッフ", shop: "表参道" },
        { id: "e3", name: "佐藤 健一", role: "副店長", shop: "自由が丘" },
        { id: "e4", name: "山田 太郎", role: "スタッフ", shop: "渋谷", disabled: true },
        { id: "e5", name: "鈴木 さくら", role: "アルバイト", shop: "新宿" },
      ];
      await new Promise((r) => setTimeout(r, 80));
      const start = (params.page - 1) * params.pageSize;
      return {
        rows: all.slice(start, start + params.pageSize),
        total: all.length,
      };
    }

    const columns: TableColumn<Employee>[] = [
      { accessorKey: "name", header: "従業員", minSize: 180 },
      { accessorKey: "role", header: "役職", minSize: 120 },
      { accessorKey: "shop", header: "店舗", minSize: 96 },
    ];

    const pagination = useTablePagination({ defaultPageSize: 5 });
    const selection = useTableSelection({ defaultSelected: ["e2"] });
    const [data, setData] = useState<{ rows: Employee[]; total: number }>({
      rows: [],
      total: 0,
    });

    useEffect(() => {
      fetchEmployees({
        page: pagination.page,
        pageSize: pagination.pageSize,
      }).then(setData);
    }, [pagination.page, pagination.pageSize]);

    const table = useDataTable({
      data: data.rows,
      columns,
      rowKey: "id",
      pagination,
      total: data.total,
      selection,
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
        getCheckboxDisabled: (row) => row.original.disabled === true,
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
  parameters: {
    docs: {
      source: {
        language: "tsx",
        code: `import { useEffect, useState } from "react"
import {
  DataTable,
  useDataTable,
  useTablePagination,
  type TableColumn,
} from "@godxjp/ui"

type Employee = {
  id: string
  name: string
  role: string
  shop: string
}

async function fetchEmployees(params: {
  page: number
  pageSize: number
}): Promise<{ rows: Employee[]; total: number }> {
  const all: Employee[] = [
    { id: "e1", name: "田中 美咲", role: "店長", shop: "渋谷" },
    { id: "e2", name: "Nguyễn Lan", role: "スタッフ", shop: "表参道" },
    { id: "e3", name: "佐藤 健一", role: "副店長", shop: "自由が丘" },
    { id: "e4", name: "山田 太郎", role: "スタッフ", shop: "渋谷" },
    { id: "e5", name: "鈴木 さくら", role: "アルバイト", shop: "新宿" },
  ]
  await new Promise((resolve) => setTimeout(resolve, 80))
  const start = (params.page - 1) * params.pageSize
  return {
    rows: all.slice(start, start + params.pageSize),
    total: all.length,
  }
}

const columns: TableColumn<Employee>[] = [
  { accessorKey: "name", header: "従業員", minSize: 180 },
  { accessorKey: "role", header: "役職", minSize: 120 },
  { accessorKey: "shop", header: "店舗", minSize: 96 },
]

export default function Example() {
  const pagination = useTablePagination({ defaultPageSize: 5 })
  const [data, setData] = useState<{ rows: Employee[]; total: number }>({
    rows: [],
    total: 0,
  })

  useEffect(() => {
    fetchEmployees({
      page: pagination.page,
      pageSize: pagination.pageSize,
    }).then(setData)
  }, [pagination.page, pagination.pageSize])

  const table = useDataTable({
    data: data.rows,
    columns,
    rowKey: "id",
    pagination,
    total: data.total,
    toolbar: {
      columns: {},
      primaryAction: { label: "＋ 新規申請" },
    },
  })

  return <DataTable table={table} containerClassName="tbl-shell" />
}`,
      },
    },
  },
  render: function WithToolbar() {
    interface Employee {
      id: string;
      name: string;
      role: string;
      shop: string;
    }

    async function fetchEmployees(params: {
      page: number;
      pageSize: number;
    }): Promise<{ rows: Employee[]; total: number }> {
      const all: Employee[] = [
        { id: "e1", name: "田中 美咲", role: "店長", shop: "渋谷" },
        { id: "e2", name: "Nguyễn Lan", role: "スタッフ", shop: "表参道" },
        { id: "e3", name: "佐藤 健一", role: "副店長", shop: "自由が丘" },
        { id: "e4", name: "山田 太郎", role: "スタッフ", shop: "渋谷" },
        { id: "e5", name: "鈴木 さくら", role: "アルバイト", shop: "新宿" },
      ];
      await new Promise((r) => setTimeout(r, 80));
      const start = (params.page - 1) * params.pageSize;
      return {
        rows: all.slice(start, start + params.pageSize),
        total: all.length,
      };
    }

    const columns: TableColumn<Employee>[] = [
      { accessorKey: "name", header: "従業員", minSize: 180 },
      { accessorKey: "role", header: "役職", minSize: 120 },
      { accessorKey: "shop", header: "店舗", minSize: 96 },
    ];

    const pagination = useTablePagination({ defaultPageSize: 5 });
    const [data, setData] = useState<{ rows: Employee[]; total: number }>({
      rows: [],
      total: 0,
    });

    useEffect(() => {
      fetchEmployees({
        page: pagination.page,
        pageSize: pagination.pageSize,
      }).then(setData);
    }, [pagination.page, pagination.pageSize]);

    const table = useDataTable({
      data: data.rows,
      columns,
      rowKey: "id",
      pagination,
      total: data.total,
      toolbar: {
        columns: {},
        primaryAction: { label: "＋ 新規申請" },
      },
    });

    return <DataTable table={table} containerClassName="tbl-shell" />;
  },
};

// ─────────────────────────────────────────────────────────────────
// 4 — Pagination · numbered (default).
// ─────────────────────────────────────────────────────────────────

export const Pagination_Numbered: Story = {
  name: "Pagination · numbered",
  parameters: {
    docs: {
      source: {
        language: "tsx",
        code: `import { useEffect, useState } from "react"
import {
  DataTable,
  useDataTable,
  useTablePagination,
  type TableColumn,
} from "@godxjp/ui"

type Employee = {
  id: string
  name: string
  role: string
  shop: string
}

async function fetchEmployees(params: {
  page: number
  pageSize: number
}): Promise<{ rows: Employee[]; total: number }> {
  const all: Employee[] = Array.from({ length: 87 }, (_, index) => ({
    id: "e" + (index + 1),
    name: "従業員 " + (index + 1),
    role: index % 3 === 0 ? "店長" : index % 3 === 1 ? "スタッフ" : "アルバイト",
    shop: ["渋谷", "表参道", "新宿", "自由が丘"][index % 4]!,
  }))
  await new Promise((resolve) => setTimeout(resolve, 80))
  const start = (params.page - 1) * params.pageSize
  return {
    rows: all.slice(start, start + params.pageSize),
    total: all.length,
  }
}

const columns: TableColumn<Employee>[] = [
  { accessorKey: "name", header: "従業員", minSize: 180 },
  { accessorKey: "role", header: "役職", minSize: 120 },
  { accessorKey: "shop", header: "店舗", minSize: 96 },
]

export default function Example() {
  const pagination = useTablePagination({ defaultPageSize: 10 })
  const [data, setData] = useState<{ rows: Employee[]; total: number }>({
    rows: [],
    total: 0,
  })

  useEffect(() => {
    fetchEmployees({
      page: pagination.page,
      pageSize: pagination.pageSize,
    }).then(setData)
  }, [pagination.page, pagination.pageSize])

  const table = useDataTable({
    data: data.rows,
    columns,
    rowKey: "id",
    pagination,
    total: data.total,
    pageSizeOptions: [5, 10, 20, 50],
    showSizeChanger: true,
  })

  return <DataTable table={table} containerClassName="tbl-shell" />
}`,
      },
    },
  },
  render: function PaginationNumbered() {
    interface Employee {
      id: string;
      name: string;
      role: string;
      shop: string;
    }

    async function fetchEmployees(params: {
      page: number;
      pageSize: number;
    }): Promise<{ rows: Employee[]; total: number }> {
      const all: Employee[] = Array.from({ length: 87 }, (_, i) => ({
        id: `e${i + 1}`,
        name: `従業員 ${i + 1}`,
        role: i % 3 === 0 ? "店長" : i % 3 === 1 ? "スタッフ" : "アルバイト",
        shop: ["渋谷", "表参道", "新宿", "自由が丘"][i % 4]!,
      }));
      await new Promise((r) => setTimeout(r, 80));
      const start = (params.page - 1) * params.pageSize;
      return {
        rows: all.slice(start, start + params.pageSize),
        total: all.length,
      };
    }

    const columns: TableColumn<Employee>[] = [
      { accessorKey: "name", header: "従業員", minSize: 180 },
      { accessorKey: "role", header: "役職", minSize: 120 },
      { accessorKey: "shop", header: "店舗", minSize: 96 },
    ];

    const pagination = useTablePagination({ defaultPageSize: 10 });
    const [data, setData] = useState<{ rows: Employee[]; total: number }>({
      rows: [],
      total: 0,
    });

    useEffect(() => {
      fetchEmployees({
        page: pagination.page,
        pageSize: pagination.pageSize,
      }).then(setData);
    }, [pagination.page, pagination.pageSize]);

    const table = useDataTable({
      data: data.rows,
      columns,
      rowKey: "id",
      pagination,
      total: data.total,
      pageSizeOptions: [5, 10, 20, 50],
      showSizeChanger: true,
    });

    return <DataTable table={table} containerClassName="tbl-shell" />;
  },
};

// ─────────────────────────────────────────────────────────────────
// 5 — Pagination · load-more (feed style).
// ─────────────────────────────────────────────────────────────────

export const Pagination_LoadMore: Story = {
  name: "Pagination · load-more (feed)",
  parameters: {
    docs: {
      source: {
        language: "tsx",
        code: `import { useEffect, useState } from "react"
import { DataTable, useDataTable, type TableColumn } from "@godxjp/ui"

type Notification = {
  id: string
  message: string
  time: string
}

const PAGE_SIZE = 4

async function fetchNotifications(params: {
  page: number
  pageSize: number
}): Promise<{ rows: Notification[]; total: number }> {
  const all: Notification[] = Array.from({ length: 16 }, (_, index) => ({
    id: "n" + (index + 1),
    message: "通知 #" + (index + 1) + " — 何かが起きました",
    time: index + 1 + " 分前",
  }))
  await new Promise((resolve) => setTimeout(resolve, 80))
  const start = (params.page - 1) * params.pageSize
  return {
    rows: all.slice(start, start + params.pageSize),
    total: all.length,
  }
}

const columns: TableColumn<Notification>[] = [
  { accessorKey: "message", header: "通知", minSize: 240 },
  { accessorKey: "time", header: "時刻", minSize: 96 },
]

export default function Example() {
  const [page, setPage] = useState(1)
  const [accumulated, setAccumulated] = useState<Notification[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetchNotifications({ page, pageSize: PAGE_SIZE }).then((response) => {
      setAccumulated((previous) =>
        page === 1 ? response.rows : [...previous, ...response.rows],
      )
      setTotal(response.total)
      setLoading(false)
    })
  }, [page])

  const table = useDataTable({
    data: accumulated,
    columns,
    rowKey: "id",
  })

  return (
    <DataTable
      table={{
        ...table,
        chromeProps: {
          ...table.chromeProps,
          pagination: {
            type: "load-more",
            hasMore: accumulated.length < total,
            currentCount: accumulated.length,
            total,
            loadingMore: loading,
            onLoadMore: () => setPage((current) => current + 1),
          },
        },
      }}
      containerClassName="tbl-shell"
    />
  )
}`,
      },
    },
  },
  render: function PaginationLoadMore() {
    interface Notification {
      id: string;
      message: string;
      time: string;
    }

    const PAGE_SIZE = 4;

    async function fetchNotifications(params: {
      page: number;
      pageSize: number;
    }): Promise<{ rows: Notification[]; total: number }> {
      const all: Notification[] = Array.from({ length: 16 }, (_, i) => ({
        id: `n${i + 1}`,
        message: `通知 #${i + 1} — 何かが起きました`,
        time: `${i + 1} 分前`,
      }));
      await new Promise((r) => setTimeout(r, 80));
      const start = (params.page - 1) * params.pageSize;
      return {
        rows: all.slice(start, start + params.pageSize),
        total: all.length,
      };
    }

    const columns: TableColumn<Notification>[] = [
      { accessorKey: "message", header: "通知", minSize: 240 },
      { accessorKey: "time", header: "時刻", minSize: 96 },
    ];

    const [page, setPage] = useState(1);
    const [accumulated, setAccumulated] = useState<Notification[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      setLoading(true);
      fetchNotifications({ page, pageSize: PAGE_SIZE }).then((response) => {
        setAccumulated((prev) =>
          page === 1 ? response.rows : [...prev, ...response.rows],
        );
        setTotal(response.total);
        setLoading(false);
      });
    }, [page]);

    const table = useDataTable({
      data: accumulated,
      columns,
      rowKey: "id",
    });

    return (
      <DataTable
        table={{
          ...table,
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

// ─────────────────────────────────────────────────────────────────
// 6 — Pagination · cursor (period jumper).
// ─────────────────────────────────────────────────────────────────

export const Pagination_Cursor: Story = {
  name: "Pagination · cursor (period jumper)",
  parameters: {
    docs: {
      source: {
        language: "tsx",
        code: `import { useEffect, useState } from "react"
import { DataTable, useDataTable, type TableColumn } from "@godxjp/ui"

type KintaiRow = {
  id: string
  name: string
  hours: string
}

async function fetchKintaiByMonth(month: string): Promise<KintaiRow[]> {
  await new Promise((resolve) => setTimeout(resolve, 80))
  return [
    { id: month + "-1", name: "田中 美咲", hours: "168h" },
    { id: month + "-2", name: "Nguyễn Lan", hours: "152h" },
    { id: month + "-3", name: "佐藤 健一", hours: "176h" },
  ]
}

const columns: TableColumn<KintaiRow>[] = [
  { accessorKey: "name", header: "従業員", minSize: 180 },
  {
    accessorKey: "hours",
    header: "勤務時間",
    minSize: 96,
    meta: { className: "num" },
  },
]

export default function Example() {
  const [period, setPeriod] = useState("2025-05")
  const [rows, setRows] = useState<KintaiRow[]>([])

  useEffect(() => {
    fetchKintaiByMonth(period).then(setRows)
  }, [period])

  function shiftMonth(delta: number) {
    const [year, month] = period.split("-").map(Number) as [number, number]
    const next = new Date(year, month - 1 + delta, 1)
    setPeriod(
      next.getFullYear() + "-" + String(next.getMonth() + 1).padStart(2, "0"),
    )
  }

  const table = useDataTable({ data: rows, columns, rowKey: "id" })

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
            label: period.replace("-", " / ") + " の勤怠",
            inputType: "month",
            onPrev: () => shiftMonth(-1),
            onNext: () => shiftMonth(1),
            onJumpToLatest: () => setPeriod("2025-05"),
          },
        },
      }}
      containerClassName="tbl-shell"
    />
  )
}`,
      },
    },
  },
  render: function PaginationCursor() {
    interface KintaiRow {
      id: string;
      name: string;
      hours: string;
    }

    async function fetchKintaiByMonth(month: string): Promise<KintaiRow[]> {
      await new Promise((r) => setTimeout(r, 80));
      return [
        { id: `${month}-1`, name: "田中 美咲", hours: "168h" },
        { id: `${month}-2`, name: "Nguyễn Lan", hours: "152h" },
        { id: `${month}-3`, name: "佐藤 健一", hours: "176h" },
      ];
    }

    const columns: TableColumn<KintaiRow>[] = [
      { accessorKey: "name", header: "従業員", minSize: 180 },
      {
        accessorKey: "hours",
        header: "勤務時間",
        minSize: 96,
        meta: { className: "num" },
      },
    ];

    const [period, setPeriod] = useState("2025-05");
    const [rows, setRows] = useState<KintaiRow[]>([]);

    useEffect(() => {
      fetchKintaiByMonth(period).then(setRows);
    }, [period]);

    function shiftMonth(delta: number) {
      const [y, m] = period.split("-").map(Number) as [number, number];
      const next = new Date(y, m - 1 + delta, 1);
      setPeriod(
        `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`,
      );
    }

    const table = useDataTable({ data: rows, columns, rowKey: "id" });

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
              onPrev: () => shiftMonth(-1),
              onNext: () => shiftMonth(1),
              onJumpToLatest: () => setPeriod("2025-05"),
            },
          },
        }}
        containerClassName="tbl-shell"
      />
    );
  },
};

// ─────────────────────────────────────────────────────────────────
// 7 — PersistentVisibility. useTableState across reloads.
// ─────────────────────────────────────────────────────────────────

export const PersistentVisibility: Story = {
  name: "PersistentVisibility · useTableState",
  parameters: {
    docs: {
      source: {
        language: "tsx",
        code: `import { useEffect, useState } from "react"
import {
  DataTable,
  useDataTable,
  useTablePagination,
  useTableState,
  type TableColumn,
  type TableColumnVisibility,
} from "@godxjp/ui"

type Employee = {
  id: string
  name: string
  role: string
  shop: string
  hours: string
}

async function fetchEmployees(params: {
  page: number
  pageSize: number
}): Promise<{ rows: Employee[]; total: number }> {
  const all: Employee[] = [
    { id: "e1", name: "田中 美咲", role: "店長", shop: "渋谷", hours: "8.0h" },
    { id: "e2", name: "Nguyễn Lan", role: "スタッフ", shop: "表参道", hours: "7.5h" },
    { id: "e3", name: "佐藤 健一", role: "副店長", shop: "自由が丘", hours: "8.0h" },
    { id: "e4", name: "山田 太郎", role: "スタッフ", shop: "渋谷", hours: "—" },
    { id: "e5", name: "鈴木 さくら", role: "アルバイト", shop: "新宿", hours: "6.0h" },
  ]
  await new Promise((resolve) => setTimeout(resolve, 80))
  const start = (params.page - 1) * params.pageSize
  return {
    rows: all.slice(start, start + params.pageSize),
    total: all.length,
  }
}

const columns: TableColumn<Employee>[] = [
  { accessorKey: "name", header: "従業員", minSize: 180 },
  { accessorKey: "role", header: "役職", minSize: 120 },
  { accessorKey: "shop", header: "店舗", minSize: 96 },
  {
    accessorKey: "hours",
    header: "時間",
    minSize: 80,
    meta: { className: "num" },
  },
]

export default function Example() {
  const pagination = useTablePagination({ defaultPageSize: 8 })
  const [columnVisibility, setColumnVisibility] =
    useTableState<TableColumnVisibility>({
      storageKey: "composites.DataTable.persistent.columnVisibility",
      defaultValue: { hours: false },
      version: 1,
    })
  const [data, setData] = useState<{ rows: Employee[]; total: number }>({
    rows: [],
    total: 0,
  })

  useEffect(() => {
    fetchEmployees({
      page: pagination.page,
      pageSize: pagination.pageSize,
    }).then(setData)
  }, [pagination.page, pagination.pageSize])

  const table = useDataTable({
    data: data.rows,
    columns,
    rowKey: "id",
    pagination,
    total: data.total,
    columnVisibility,
    onColumnVisibilityChange: setColumnVisibility,
    toolbar: { columns: {} },
  })

  return <DataTable table={table} containerClassName="tbl-shell" />
}`,
      },
      description: {
        story:
          "Persists column visibility under a versioned localStorage key via `useTableState`. Toggle visibility, reload, settings stick.",
      },
    },
  },
  render: function PersistentVisibility() {
    interface Employee {
      id: string;
      name: string;
      role: string;
      shop: string;
      hours: string;
    }

    async function fetchEmployees(params: {
      page: number;
      pageSize: number;
    }): Promise<{ rows: Employee[]; total: number }> {
      const all: Employee[] = [
        { id: "e1", name: "田中 美咲", role: "店長", shop: "渋谷", hours: "8.0h" },
        { id: "e2", name: "Nguyễn Lan", role: "スタッフ", shop: "表参道", hours: "7.5h" },
        { id: "e3", name: "佐藤 健一", role: "副店長", shop: "自由が丘", hours: "8.0h" },
        { id: "e4", name: "山田 太郎", role: "スタッフ", shop: "渋谷", hours: "—" },
        { id: "e5", name: "鈴木 さくら", role: "アルバイト", shop: "新宿", hours: "6.0h" },
      ];
      await new Promise((r) => setTimeout(r, 80));
      const start = (params.page - 1) * params.pageSize;
      return {
        rows: all.slice(start, start + params.pageSize),
        total: all.length,
      };
    }

    const columns: TableColumn<Employee>[] = [
      { accessorKey: "name", header: "従業員", minSize: 180 },
      { accessorKey: "role", header: "役職", minSize: 120 },
      { accessorKey: "shop", header: "店舗", minSize: 96 },
      {
        accessorKey: "hours",
        header: "時間",
        minSize: 80,
        meta: { className: "num" },
      },
    ];

    const pagination = useTablePagination({ defaultPageSize: 8 });
    const [columnVisibility, setColumnVisibility] =
      useTableState<TableColumnVisibility>({
        storageKey: "composites.DataTable.persistent.columnVisibility",
        defaultValue: { hours: false },
        version: 1,
      });
    const [data, setData] = useState<{ rows: Employee[]; total: number }>({
      rows: [],
      total: 0,
    });

    useEffect(() => {
      fetchEmployees({
        page: pagination.page,
        pageSize: pagination.pageSize,
      }).then(setData);
    }, [pagination.page, pagination.pageSize]);

    const table = useDataTable({
      data: data.rows,
      columns,
      rowKey: "id",
      pagination,
      total: data.total,
      columnVisibility,
      onColumnVisibilityChange: setColumnVisibility,
      toolbar: { columns: {} },
    });

    return <DataTable table={table} containerClassName="tbl-shell" />;
  },
};

// ─────────────────────────────────────────────────────────────────
// 8 — PackagedFeatures. Full integration: views + toolbar + batch
//     + search + filters + sort + pagination + persistence.
//
// Long story because every wired feature is demonstrated at once.
// For a quicker copy-paste starting point, see `Basic`,
// `BulkActions`, or `WithToolbar` above.
// ─────────────────────────────────────────────────────────────────

export const PackagedFeatures: Story = {
  name: "PackagedFeatures · views · toolbar · batch · search",
  tags: ["!autodocs"],
  parameters: {
    docs: {
      source: {
        language: "tsx",
        code: `import { useEffect, useState } from "react"
import {
  Badge,
  Button,
  DataTable,
  useDataTable,
  useTablePagination,
  useTableSelection,
  useTableState,
  useTableViews,
  type TableColumn,
  type TableColumnVisibility,
  type TableFilter,
  type TableSortState,
} from "@godxjp/ui"

type Employee = {
  id: string
  date: string
  name: string
  kana?: string
  role: string
  shop: string
  kind: "paid" | "late" | "trip" | "absence" | "normal"
  status: "active" | "leave" | "pending"
  hours: string
}

const DATASET: Employee[] = [
  { id: "e1", date: "05/14", name: "田中 美咲", role: "店長", shop: "渋谷", kind: "normal", status: "active", hours: "8.0h" },
  { id: "e2", date: "05/14", name: "Nguyễn Lan", role: "スタッフ", shop: "表参道", kind: "late", status: "pending", hours: "7.5h" },
  { id: "e3", date: "05/14", name: "佐藤 健一", role: "副店長", shop: "自由が丘", kind: "trip", status: "leave", hours: "8.0h" },
  { id: "e4", date: "05/13", name: "山田 太郎", role: "スタッフ", shop: "渋谷", kind: "absence", status: "leave", hours: "—" },
  { id: "e5", date: "05/12", name: "鈴木 さくら", role: "アルバイト", shop: "新宿", kind: "paid", status: "pending", hours: "6.0h" },
  { id: "e6", date: "05/11", name: "渡辺 颯太", role: "スタッフ", shop: "表参道", kind: "normal", status: "active", hours: "7.0h" },
  { id: "e7", date: "05/10", name: "山本 結衣", role: "スタッフ", shop: "渋谷", kind: "normal", status: "active", hours: "8.0h" },
  { id: "e8", date: "05/09", name: "中村 陽斗", role: "アルバイト", shop: "新宿", kind: "late", status: "pending", hours: "5.0h" },
]

async function fetchEmployees(params: {
  page: number
  pageSize: number
  filters?: TableFilter[]
  sort?: TableSortState
  q?: string
}): Promise<{ rows: Employee[]; total: number }> {
  let result = DATASET.slice()
  if (params.q !== undefined && params.q.trim() !== "") {
    const q = params.q.trim().toLowerCase()
    result = result.filter((row) =>
      (row.name + " " + (row.kana ?? "") + " " + row.shop + " " + row.role)
        .toLowerCase()
        .includes(q),
    )
  }
  for (const filter of params.filters ?? []) {
    const value = String(filter.value ?? "").trim()
    if (value === "") continue
    result = result.filter((row) => {
      if (filter.key === "shop") return row.shop === value
      if (filter.key === "kind") return row.kind === value
      if (filter.key === "status") return row.status === value
      return true
    })
  }
  const head = Array.isArray(params.sort)
    ? (params.sort[0] ?? null)
    : (params.sort ?? null)
  if (head !== null) {
    const direction = head.direction === "asc" ? 1 : -1
    result = [...result].sort((a, b) => {
      const left = String(a[head.key as keyof Employee] ?? "")
      const right = String(b[head.key as keyof Employee] ?? "")
      return left.localeCompare(right) * direction
    })
  }
  await new Promise((resolve) => setTimeout(resolve, 80))
  const start = (params.page - 1) * params.pageSize
  return {
    rows: result.slice(start, start + params.pageSize),
    total: result.length,
  }
}

function StatusBadge({ status }: { status: Employee["status"] }) {
  if (status === "active") return <Badge variant="success" dot>稼働中</Badge>
  if (status === "pending") return <Badge variant="warning" dot>申請中</Badge>
  return <Badge variant="neutral" dot>休職</Badge>
}

function KindBadge({ kind }: { kind: Employee["kind"] }) {
  const map = {
    paid: { variant: "primary" as const, label: "有給" },
    late: { variant: "attention" as const, label: "遅刻" },
    trip: { variant: "info" as const, label: "出張" },
    absence: { variant: "destructive" as const, label: "欠勤" },
    normal: { variant: "neutral" as const, label: "通常" },
  }
  const { variant, label } = map[kind]
  return <Badge variant={variant} dot={false}>{label}</Badge>
}

const columns: TableColumn<Employee>[] = [
  {
    accessorKey: "date",
    header: "日付",
    size: 88,
    minSize: 88,
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
    meta: {
      filterable: true,
      filterOptions: [
        { value: "渋谷", label: "渋谷" },
        { value: "表参道", label: "表参道" },
        { value: "新宿", label: "新宿" },
        { value: "自由が丘", label: "自由が丘" },
      ],
    },
  },
  {
    accessorKey: "kind",
    header: "区分",
    minSize: 88,
    cell: ({ row }) => <KindBadge kind={row.original.kind} />,
    meta: {
      filterable: true,
      filterOptions: [
        { value: "late", label: "遅刻" },
        { value: "paid", label: "有給" },
        { value: "trip", label: "出張" },
        { value: "absence", label: "欠勤" },
        { value: "normal", label: "通常" },
      ],
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
]

const BUILT_IN_VIEWS = [
  {
    key: "all",
    label: "すべて",
    filters: [],
    sort: { key: "date", direction: "desc" as const },
  },
  {
    key: "pending",
    label: "承認待ち",
    filters: [{ key: "status", operator: "eq" as const, value: "pending" }],
    sort: { key: "date", direction: "desc" as const },
  },
  {
    key: "late",
    label: "遅刻 / 早退",
    filters: [{ key: "kind", operator: "eq" as const, value: "late" }],
    sort: { key: "date", direction: "desc" as const },
  },
]

export default function Example() {
  const pagination = useTablePagination({ defaultPageSize: 5 })
  const selection = useTableSelection({ defaultSelected: ["e2"] })
  const views = useTableViews({
    items: BUILT_IN_VIEWS,
    storageKey: "composites.DataTable.packaged.views",
  })
  const [columnVisibility, setColumnVisibility] =
    useTableState<TableColumnVisibility>({
      storageKey: "composites.DataTable.packaged.columnVisibility",
      defaultValue: { hours: false },
      version: 1,
    })
  const [filters, setFilters] = useState<TableFilter[]>([])
  const [sort, setSort] = useState<TableSortState>({
    key: "date",
    direction: "desc",
  })
  const [searchDraft, setSearchDraft] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [data, setData] = useState<{ rows: Employee[]; total: number }>({
    rows: [],
    total: 0,
  })

  useEffect(() => {
    fetchEmployees({
      page: pagination.page,
      pageSize: pagination.pageSize,
      filters,
      sort,
      q: searchQuery,
    }).then(setData)
  }, [pagination.page, pagination.pageSize, filters, sort, searchQuery])

  const table = useDataTable({
    data: data.rows,
    columns,
    rowKey: "id",
    pagination,
    total: data.total,
    pageSizeOptions: [5, 10, 20],
    selection,
    views,
    columnVisibility,
    onColumnVisibilityChange: (next) => {
      setColumnVisibility(next)
      views.markCustom()
    },
    filters,
    onFiltersChange: (next) => {
      setFilters(next)
      pagination.resetPage()
      views.markCustom()
    },
    sort,
    onSortChange: (next) => {
      setSort(next)
      views.markCustom()
    },
    onResetFilters: () => {
      setFilters([])
      setSort({ key: "date", direction: "desc" })
      setSearchDraft("")
      setSearchQuery("")
      pagination.resetPage()
      views.setActiveKey("all")
    },
    onViewApply: (view) => {
      setFilters(view.filters ?? [])
      setSort(view.sort ?? null)
      setSearchDraft("")
      setSearchQuery("")
      pagination.resetPage()
    },
    toolbar: {
      search: {
        value: searchDraft,
        onValueChange: setSearchDraft,
        onSearch: (value) => {
          setSearchQuery(value)
          pagination.resetPage()
          views.markCustom()
        },
        onClear: () => {
          setSearchDraft("")
          setSearchQuery("")
          pagination.resetPage()
          views.markCustom()
        },
        placeholder: "名前 / かな / 役職 / 店舗 で検索",
      },
      columns: {},
    },
    batchActions: {
      actions: (
        <>
          <Button size="small" variant="outline">一括承認</Button>
          <Button size="small" variant="outline">CSV 出力</Button>
          <Button size="small" variant="destructive">却下</Button>
        </>
      ),
    },
  })

  return (
    <DataTable
      table={table}
      containerClassName="tbl-shell"
      slots={{
        primaryAction: { label: "＋ 新規申請" },
        footer: (
          <div className="totals">
            <span>選択 <b>{selection.count}</b> 件</span>
            <span>該当 <b>{data.total}</b> 件</span>
          </div>
        ),
      }}
    />
  )
}`,
      },
    },
  },
  render: function PackagedFeatures() {
    interface Employee {
      id: string;
      date: string;
      name: string;
      kana?: string;
      role: string;
      shop: string;
      kind: "paid" | "late" | "trip" | "absence" | "normal";
      status: "active" | "leave" | "pending";
      hours: string;
    }

    const DATASET: Employee[] = [
      { id: "e1", date: "05/14", name: "田中 美咲", role: "店長", shop: "渋谷", kind: "normal", status: "active", hours: "8.0h" },
      { id: "e2", date: "05/14", name: "Nguyễn Lan", role: "スタッフ", shop: "表参道", kind: "late", status: "pending", hours: "7.5h" },
      { id: "e3", date: "05/14", name: "佐藤 健一", role: "副店長", shop: "自由が丘", kind: "trip", status: "leave", hours: "8.0h" },
      { id: "e4", date: "05/13", name: "山田 太郎", role: "スタッフ", shop: "渋谷", kind: "absence", status: "leave", hours: "—" },
      { id: "e5", date: "05/12", name: "鈴木 さくら", role: "アルバイト", shop: "新宿", kind: "paid", status: "pending", hours: "6.0h" },
      { id: "e6", date: "05/11", name: "渡辺 颯太", role: "スタッフ", shop: "表参道", kind: "normal", status: "active", hours: "7.0h" },
      { id: "e7", date: "05/10", name: "山本 結衣", role: "スタッフ", shop: "渋谷", kind: "normal", status: "active", hours: "8.0h" },
      { id: "e8", date: "05/09", name: "中村 陽斗", role: "アルバイト", shop: "新宿", kind: "late", status: "pending", hours: "5.0h" },
    ];

    async function fetchEmployees(params: {
      page: number;
      pageSize: number;
      filters?: TableFilter[];
      sort?: TableSortState;
      q?: string;
    }): Promise<{ rows: Employee[]; total: number }> {
      let result = DATASET.slice();
      if (params.q !== undefined && params.q.trim() !== "") {
        const q = params.q.trim().toLowerCase();
        result = result.filter((row) =>
          `${row.name} ${row.kana ?? ""} ${row.shop} ${row.role}`
            .toLowerCase()
            .includes(q),
        );
      }
      for (const filter of params.filters ?? []) {
        const value = String(filter.value ?? "").trim();
        if (value === "") continue;
        result = result.filter((row) => {
          if (filter.key === "shop") return row.shop === value;
          if (filter.key === "kind") return row.kind === value;
          if (filter.key === "status") return row.status === value;
          return true;
        });
      }
      const head = Array.isArray(params.sort)
        ? (params.sort[0] ?? null)
        : (params.sort ?? null);
      if (head !== null) {
        const direction = head.direction === "asc" ? 1 : -1;
        result = [...result].sort((a, b) => {
          const left = String(a[head.key as keyof Employee] ?? "");
          const right = String(b[head.key as keyof Employee] ?? "");
          return left.localeCompare(right) * direction;
        });
      }
      await new Promise((r) => setTimeout(r, 80));
      const start = (params.page - 1) * params.pageSize;
      return {
        rows: result.slice(start, start + params.pageSize),
        total: result.length,
      };
    }

    function StatusBadge({ status }: { status: Employee["status"] }) {
      if (status === "active")
        return <Badge variant="success" dot>稼働中</Badge>;
      if (status === "pending")
        return <Badge variant="warning" dot>申請中</Badge>;
      return <Badge variant="neutral" dot>休職</Badge>;
    }

    function KindBadge({ kind }: { kind: Employee["kind"] }) {
      const map = {
        paid: { variant: "primary" as const, label: "有給" },
        late: { variant: "attention" as const, label: "遅刻" },
        trip: { variant: "info" as const, label: "出張" },
        absence: { variant: "destructive" as const, label: "欠勤" },
        normal: { variant: "neutral" as const, label: "通常" },
      };
      const { variant, label } = map[kind];
      return <Badge variant={variant} dot={false}>{label}</Badge>;
    }

    const columns: TableColumn<Employee>[] = [
      {
        accessorKey: "date",
        header: "日付",
        size: 88,
        minSize: 88,
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
        meta: {
          filterable: true,
          filterOptions: [
            { value: "渋谷", label: "渋谷" },
            { value: "表参道", label: "表参道" },
            { value: "新宿", label: "新宿" },
            { value: "自由が丘", label: "自由が丘" },
          ],
        },
      },
      {
        accessorKey: "kind",
        header: "区分",
        minSize: 88,
        cell: ({ row }) => <KindBadge kind={row.original.kind} />,
        meta: {
          filterable: true,
          filterOptions: [
            { value: "late", label: "遅刻" },
            { value: "paid", label: "有給" },
            { value: "trip", label: "出張" },
            { value: "absence", label: "欠勤" },
            { value: "normal", label: "通常" },
          ],
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
    ];

    const BUILT_IN_VIEWS = [
      {
        key: "all",
        label: "すべて",
        filters: [],
        sort: { key: "date", direction: "desc" as const },
      },
      {
        key: "pending",
        label: "承認待ち",
        filters: [
          { key: "status", operator: "eq" as const, value: "pending" },
        ],
        sort: { key: "date", direction: "desc" as const },
      },
      {
        key: "late",
        label: "遅刻 / 早退",
        filters: [{ key: "kind", operator: "eq" as const, value: "late" }],
        sort: { key: "date", direction: "desc" as const },
      },
    ];

    const pagination = useTablePagination({ defaultPageSize: 5 });
    const selection = useTableSelection({ defaultSelected: ["e2"] });
    const views = useTableViews({
      items: BUILT_IN_VIEWS,
      storageKey: "composites.DataTable.packaged.views",
    });
    const [columnVisibility, setColumnVisibility] =
      useTableState<TableColumnVisibility>({
        storageKey: "composites.DataTable.packaged.columnVisibility",
        defaultValue: { hours: false },
        version: 1,
      });
    const [filters, setFilters] = useState<TableFilter[]>([]);
    const [sort, setSort] = useState<TableSortState>({
      key: "date",
      direction: "desc",
    });
    const [searchDraft, setSearchDraft] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [data, setData] = useState<{ rows: Employee[]; total: number }>({
      rows: [],
      total: 0,
    });

    useEffect(() => {
      fetchEmployees({
        page: pagination.page,
        pageSize: pagination.pageSize,
        filters,
        sort,
        q: searchQuery,
      }).then(setData);
    }, [pagination.page, pagination.pageSize, filters, sort, searchQuery]);

    const table = useDataTable({
      data: data.rows,
      columns,
      rowKey: "id",
      pagination,
      total: data.total,
      pageSizeOptions: [5, 10, 20],
      selection,
      views,
      columnVisibility,
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
        setFilters([]);
        setSort({ key: "date", direction: "desc" });
        setSearchDraft("");
        setSearchQuery("");
        pagination.resetPage();
        views.setActiveKey("all");
      },
      onViewApply: (view) => {
        setFilters(view.filters ?? []);
        setSort(view.sort ?? null);
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
            <Button size="small" variant="outline">一括承認</Button>
            <Button size="small" variant="outline">CSV 出力</Button>
            <Button size="small" variant="destructive">却下</Button>
          </>
        ),
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
              <span>選択 <b>{selection.count}</b> 件</span>
              <span>該当 <b>{data.total}</b> 件</span>
            </div>
          ),
        }}
      />
    );
  },
};

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

    const rowCheckbox = await canvas.findByLabelText(
      /Select row e1|row e1/,
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
