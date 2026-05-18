import type { Meta, StoryObj } from "@storybook/react";
import { useMemo, useState } from "react";
import { expect, within } from "storybook/test";
import { Badge } from "../../components/data-display/Badge";
import { Table, type TableColumn, type TableFilter, type TableSort } from "../../components/data-display/Table";
import { Checkbox } from "../../components/data-entry/Checkbox";
import { InputSearch } from "../../components/data-entry/InputSearch";
import { Select } from "../../components/data-entry/Select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "../../components/feedback/Sheet";
import { Button } from "../../components/general/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/navigation/DropdownMenu";
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

const DETAIL_FILTER_FIELDS = [
  { key: "name", label: "従業員", description: "従業員名・かなで検索" },
  { key: "shop", label: "店舗", description: "店舗を選択", options: SHOP_OPTIONS, control: "dropdown" },
  { key: "kind", label: "区分", description: "申請区分を選択", options: KIND_OPTIONS, control: "buttons" },
  {
    key: "status",
    label: "状態",
    description: "稼働状態を選択",
    control: "dropdown",
    options: [
      { value: "active", label: "稼働中" },
      { value: "pending", label: "申請中" },
      { value: "leave", label: "休職" },
    ],
  },
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

type ColumnSettingKey = typeof COLUMN_SETTINGS[number]["key"];

function StatusBadge({ status }: { status: EmployeeRow["status"] }) {
  if (status === "active") return <Badge variant="success" dot>稼働中</Badge>;
  if (status === "pending") return <Badge variant="warning" dot>申請中</Badge>;
  return <Badge variant="neutral" dot>休職</Badge>;
}

function KindBadge({ kind }: { kind: EmployeeRow["kind"] }) {
  if (kind === "paid") return <Badge variant="primary" dot={false}>有給</Badge>;
  if (kind === "late") return <Badge variant="attention" dot={false}>遅刻</Badge>;
  if (kind === "trip") return <Badge variant="info" dot={false}>出張</Badge>;
  if (kind === "absence") return <Badge variant="error" dot={false}>欠勤</Badge>;
  return <Badge variant="neutral" dot={false}>通常</Badge>;
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

function employeeColumns(
  selectedIds?: Set<string>,
  onToggle?: (id: string) => void,
  onToggleAll?: () => void,
  allSelected?: boolean,
): TableColumn<EmployeeRow>[] {
  return [
  {
    id: "check",
    size: 32,
    header: () => onToggleAll
      ? <input type="checkbox" className="rb" aria-label="Select all" checked={allSelected ?? false} onChange={onToggleAll} />
      : <input type="checkbox" className="rb" aria-label="Select all" readOnly />,
    cell: ({ row }) => onToggle
      ? <input type="checkbox" className="rb" aria-label={`${row.original.name} を選択`} checked={selectedIds?.has(row.original.id) ?? false} disabled={row.original.state === "disabled"} onChange={() => onToggle(row.original.id)} />
      : <input type="checkbox" className="rb" aria-label={`${row.original.name} を選択`} defaultChecked={row.original.state === "selected"} disabled={row.original.state === "disabled"} readOnly />,
    meta: { className: "check" },
  },
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="iconbtn" aria-label="操作メニュー">⋯</button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>詳細を表示</DropdownMenuItem>
            <DropdownMenuItem>編集</DropdownMenuItem>
            <DropdownMenuItem>複製</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">削除</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </span>
    ),
    meta: { className: "actions", sticky: "right" },
  },
  ];
}

const EMPLOYEE_COLUMNS = employeeColumns();

function storyColumnKey(column: TableColumn<EmployeeRow>): string | undefined {
  const candidate = column as { id?: string; accessorKey?: unknown };
  if (candidate.id !== undefined) return candidate.id;
  return typeof candidate.accessorKey === "string" ? candidate.accessorKey : undefined;
}

function rowState(row: { original: EmployeeRow }) {
  if (row.original.state === "new") return "is-new";
  if (row.original.state === "error") return "is-error";
  if (row.original.state === "disabled") return "disabled";
  if (row.original.state === "editing") return "is-editing";
  return undefined;
}

type ViewKey = "all" | "pending" | "late" | "confirmed" | "shibuya";

const VIEW_LABEL: Record<ViewKey, string> = {
  all: "すべて",
  pending: "承認待ち",
  late: "遅刻 / 早退",
  confirmed: "今月確定",
  shibuya: "マイビュー · 渋谷店のみ",
};

function viewsFor(view: ViewKey, rows: EmployeeRow[], setView: (view: ViewKey) => void) {
  const counts: Record<ViewKey, number> = {
    all: rows.length,
    pending: rows.filter((row) => row.status === "pending").length,
    late: rows.filter((row) => row.kind === "late").length,
    confirmed: rows.filter((row) => row.status === "active").length,
    shibuya: rows.filter((row) => row.shop === "渋谷").length,
  };
  return (
    <>
      {(["all", "pending", "late", "confirmed", "shibuya"] as ViewKey[]).map((key) => (
        <button key={key} className={key === view ? "tab on" : "tab"} onClick={() => setView(key)}>
          {key === "pending" && <span className="dot" style={{ background: "var(--warning)" }} />}
          {key === "late" && <span className="dot" style={{ background: "var(--attention)" }} />}
          {VIEW_LABEL[key]} <span className="count">{counts[key]}</span>
        </button>
      ))}
      <span className="spacer" />
      <button className="tab add">＋ ビューを保存</button>
    </>
  );
}

function toolbarFor(
  search: string,
  setSearch: (value: string) => void,
  openFilters: () => void,
  openColumns: () => void,
  filterCount = 0,
) {
  return (
    <>
      <InputSearch
        aria-label="検索"
        className="tbl-search-input"
        size="small"
        placeholder="従業員名 · 店舗 · 申請番号で検索…"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        onClear={() => setSearch("")}
        suffix={<span className="table-kbd">⌘ K</span>}
      />
      <Button className="tbl-filter-action" size="small" variant="outline" onClick={openFilters}>
        詳細フィルタ {filterCount > 0 && <Badge variant="primary" dot={false}>{filterCount}</Badge>}
      </Button>
      <span className="spacer" />
      <span className="tbl-extra-actions">
        <Button className="tbl-column-action" size="small" variant="outline" onClick={openColumns}>列設定</Button>
        <Button className="tbl-primary-action" size="small">＋ 新規申請</Button>
      </span>
    </>
  );
}

function paginationFor(page: number, pageSize: number, total: number, setPage: (page: number) => void, setPageSize: (size: number) => void) {
  const pageCount = Math.max(Math.ceil(total / pageSize), 1);
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  return (
    <>
      <div className="info">{start} – {end} 件 / 全 {total} 件</div>
      <div className="ps"><span>表示件数</span><select aria-label="表示件数" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }}><option>3</option><option>5</option><option>10</option></select></div>
      <div className="spacer" />
      <div className="pgn">
        <button className={page === 1 ? "disabled" : ""} disabled={page === 1} onClick={() => setPage(1)}>{"<<"}</button>
        <button className={page === 1 ? "disabled" : ""} disabled={page === 1} onClick={() => setPage(Math.max(page - 1, 1))}>{"<"}</button>
        {Array.from({ length: pageCount }, (_, index) => index + 1).map((item) => (
          <button key={item} className={item === page ? "on" : ""} onClick={() => setPage(item)}>{item}</button>
        ))}
        <button className={page === pageCount ? "disabled" : ""} disabled={page === pageCount} onClick={() => setPage(Math.min(page + 1, pageCount))}>{">"}</button>
      </div>
    </>
  );
}

export const Default: Story = {
  name: "Default · interactive list page",
  render: () => {
    const [view, setView] = useState<ViewKey>("all");
    const [filters, setFilters] = useState<TableFilter[]>([]);
    const [sort, setSort] = useState<TableSort | null>({ key: "date", direction: "desc" });
    const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
    const [columnDrawerOpen, setColumnDrawerOpen] = useState(false);
    const [filterFieldQuery, setFilterFieldQuery] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(3);
    const [selectedIds, setSelectedIds] = useState(() => new Set(["emp-002"]));
    const [visibleColumnKeys, setVisibleColumnKeys] = useState<Set<ColumnSettingKey>>(
      () => new Set(COLUMN_SETTINGS.map((column) => column.key)),
    );
    const search = String(filters.find((filter) => filter.key === "name")?.value ?? "");
    const shop = filters.find((filter) => filter.key === "shop")?.value;
    const kind = filters.find((filter) => filter.key === "kind")?.value;
    const status = filters.find((filter) => filter.key === "status")?.value;
    const filterableFields = useMemo(() => {
      const query = filterFieldQuery.trim().toLowerCase();
      if (query === "") return DETAIL_FILTER_FIELDS;
      return DETAIL_FILTER_FIELDS.filter((field) =>
        `${field.label} ${field.description}`.toLowerCase().includes(query),
      );
    }, [filterFieldQuery]);

    function setFilterValue(key: string, value: string, operator: TableFilter["operator"] = "eq") {
      setFilters((current) => {
        const next = current.filter((filter) => filter.key !== key);
        if (value.trim() === "") return next;
        return [...next, { key, operator, value }];
      });
      setPage(1);
    }

    function updateFilters(nextFilters: TableFilter[]) {
      setFilters(nextFilters);
      setPage(1);
    }

    function addFilter(key: string, value: string, operator: TableFilter["operator"] = "eq") {
      setFilterValue(key, value, operator);
      setFilterDrawerOpen(false);
    }

    const filtered = useMemo(() => {
      const query = search.trim().toLowerCase();
      return EMPLOYEES.filter((row) => {
        if (view === "pending" && row.status !== "pending") return false;
        if (view === "late" && row.kind !== "late") return false;
        if (view === "confirmed" && row.status !== "active") return false;
        if (view === "shibuya" && row.shop !== "渋谷") return false;
        if (shop !== undefined && row.shop !== shop) return false;
        if (kind !== undefined && row.kind !== kind) return false;
        if (status !== undefined && row.status !== status) return false;
        if (query && !`${row.name} ${row.shop} ${row.role}`.toLowerCase().includes(query)) return false;
        return true;
      });
    }, [kind, search, shop, status, view]);

    const sortedRows = useMemo(() => {
      if (sort === null) return filtered;
      return [...filtered].sort((a, b) => {
        const direction = sort.direction === "asc" ? 1 : -1;
        if (sort.key === "hours") {
          const left = a.hours === "—" ? Number.NEGATIVE_INFINITY : Number(a.hours.replace("h", ""));
          const right = b.hours === "—" ? Number.NEGATIVE_INFINITY : Number(b.hours.replace("h", ""));
          return (left - right) * direction;
        }
        const left = String(a[sort.key as keyof EmployeeRow] ?? "");
        const right = String(b[sort.key as keyof EmployeeRow] ?? "");
        return left.localeCompare(right) * direction;
      });
    }, [filtered, sort]);

    const pageCount = Math.max(Math.ceil(sortedRows.length / pageSize), 1);
    const safePage = Math.min(page, pageCount);
    const pageRows = sortedRows.slice((safePage - 1) * pageSize, safePage * pageSize);
    const visibleSelectable = pageRows.filter((row) => row.state !== "disabled");
    const allVisibleSelected = visibleSelectable.length > 0 && visibleSelectable.every((row) => selectedIds.has(row.id));

    function toggle(id: string) {
      setSelectedIds((current) => {
        const next = new Set(current);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    }

    function toggleAll() {
      setSelectedIds((current) => {
        const next = new Set(current);
        if (allVisibleSelected) visibleSelectable.forEach((row) => next.delete(row.id));
        else visibleSelectable.forEach((row) => next.add(row.id));
        return next;
      });
    }

    function reset() {
      setView("all");
      setFilters([]);
      setPage(1);
    }

    function setColumnVisible(key: ColumnSettingKey, visible: boolean | "indeterminate") {
      setVisibleColumnKeys((current) => {
        const next = new Set(current);
        if (visible === true) next.add(key);
        else next.delete(key);
        return next;
      });
    }

    function resetColumns() {
      setVisibleColumnKeys(new Set(COLUMN_SETTINGS.map((column) => column.key)));
    }

    const columns = employeeColumns(selectedIds, toggle, toggleAll, allVisibleSelected).filter((column) => {
      const key = storyColumnKey(column);
      if (key === undefined || !COLUMN_SETTINGS.some((setting) => setting.key === key)) return true;
      return visibleColumnKeys.has(key as ColumnSettingKey);
    });

    return (
      <>
        <Table
          containerClassName="tbl-shell"
          columns={columns}
          data={pageRows}
          getRowId={(row) => row.id}
          rowClassName={(row) => selectedIds.has(row.original.id) ? "selected" : rowState(row)}
          views={viewsFor(view, EMPLOYEES, (nextView) => { setView(nextView); setPage(1); })}
          toolbar={toolbarFor(
            search,
            (value) => setFilterValue("name", value, "contains"),
            () => setFilterDrawerOpen(true),
            () => setColumnDrawerOpen(true),
            filters.length,
          )}
          filters={filters}
          onFiltersChange={updateFilters}
          sort={sort}
          onSortChange={(nextSort) => { setSort(nextSort); setPage(1); }}
          onResetFilters={reset}
          footer={<div className="totals"><span>表示中 <b>{pageRows.length}</b> 件 / 全 <b>{sortedRows.length}</b> 件</span><span>選択 <b>{selectedIds.size}</b> 件</span><span>合計 <b>{pageRows.filter((row) => row.hours !== "—").reduce((sum, row) => sum + Number(row.hours.replace("h", "")), 0).toFixed(1)} h</b></span></div>}
          pagination={paginationFor(safePage, pageSize, sortedRows.length, setPage, setPageSize)}
        />
        <Sheet open={filterDrawerOpen} onOpenChange={setFilterDrawerOpen}>
          <SheetContent className="table-filter-sheet" side="right">
            <SheetHeader>
              <SheetTitle>詳細フィルタ</SheetTitle>
              <SheetDescription>フィルタ可能な項目を検索して条件に追加します。</SheetDescription>
            </SheetHeader>
            <InputSearch
              aria-label="フィルタ項目を検索"
              size="small"
              placeholder="項目名で検索…"
              value={filterFieldQuery}
              onChange={(event) => setFilterFieldQuery(event.target.value)}
              onClear={() => setFilterFieldQuery("")}
            />
            <div className="table-filter-field-list">
              {filterableFields.map((field) => (
                <section key={field.key} className="table-filter-field">
                  <div>
                    <h4>{field.label}</h4>
                    <p>{field.description}</p>
                  </div>
                  {"options" in field && field.options !== undefined ? (
                    field.control === "dropdown" ? (
                      <Select
                        value={String(filters.find((filter) => filter.key === field.key)?.value ?? "")}
                        onValueChange={(value) => addFilter(field.key, value)}
                        placeholder={`${field.label}を選択`}
                        options={field.options}
                        triggerClassName="table-filter-drawer-select"
                      />
                    ) : (
                      <div className="table-filter-options">
                        {field.options.map((option) => (
                          <Button
                            key={option.value}
                            size="small"
                            variant={filters.some((filter) => filter.key === field.key && filter.value === option.value) ? "primary" : "outline"}
                            onClick={() => addFilter(field.key, option.value)}
                          >
                            {option.label}
                          </Button>
                        ))}
                      </div>
                    )
                  ) : (
                    <Button
                      size="x-small"
                      variant="outline"
                      disabled={search.trim() === ""}
                      onClick={() => addFilter(field.key, search, "contains")}
                    >
                      現在の検索語で追加
                    </Button>
                  )}
                </section>
              ))}
            </div>
            <SheetFooter>
              <Button size="small" variant="ghost" onClick={reset}>条件をリセット</Button>
              <SheetClose asChild>
                <Button size="small">閉じる</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
        <Sheet open={columnDrawerOpen} onOpenChange={setColumnDrawerOpen}>
          <SheetContent className="table-filter-sheet" side="right">
            <SheetHeader>
              <SheetTitle>列設定</SheetTitle>
              <SheetDescription>表示する列を選択します。選択列と操作列は常に表示されます。</SheetDescription>
            </SheetHeader>
            <div className="table-filter-field-list">
              {COLUMN_SETTINGS.map((column) => (
                <section key={column.key} className="table-column-field">
                  <Checkbox
                    checked={visibleColumnKeys.has(column.key)}
                    onCheckedChange={(checked) => setColumnVisible(column.key, checked)}
                  >
                    {column.label}
                  </Checkbox>
                </section>
              ))}
            </div>
            <SheetFooter>
              <Button size="small" variant="ghost" onClick={resetColumns}>すべて表示</Button>
              <SheetClose asChild>
                <Button size="small">閉じる</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText("検索"), "Nguyễn");
    await expect(canvas.getByText("Nguyễn Lan")).toBeVisible();
    await expect(canvas.queryByText("田中 美咲")).toBeNull();
    await userEvent.clear(canvas.getByLabelText("検索"));
    await userEvent.selectOptions(canvas.getByLabelText("表示件数"), "5");
    await expect(canvas.getByText(/1 –/)).toBeVisible();
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
          <Button size="small" variant="ghost">アーカイブ</Button>
          <Button size="small" variant="destructive">削除</Button>
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
          <Button size="small" variant="ghost">全 1,284 件を選択</Button>
          <span className="spacer" />
          <Button size="small" variant="ghost">一括承認</Button>
          <Button size="small" variant="outline">CSV 出力</Button>
          <Button size="small" variant="destructive">却下</Button>
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
