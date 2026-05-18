import React, { useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import "../src/tokens/tailwind.css";
import { initI18n } from "../src/i18n";
import {
  Table,
  type TableColumn,
  type TableColumnVisibility,
  type TableFilter,
  type TableSort,
  type TableSortState,
  type TableViewItem,
} from "../src/components/data-display/Table";
import { Button } from "../src/components/general/Button";
import { Badge } from "../src/components/data-display/Badge";

initI18n();

interface Row {
  id: string;
  date: string;
  name: string;
  kana?: string;
  role: string;
  shop: string;
  kind: "paid" | "late" | "trip" | "absence" | "normal";
  hours: string;
  status: "active" | "leave" | "pending";
}

const ROWS: Row[] = [
  { id: "emp-001", date: "05/14 (水)", name: "田中 美咲", kana: "たなか みさき", role: "店長", shop: "渋谷", kind: "paid", hours: "8.0h", status: "active" },
  { id: "emp-002", date: "05/14 (水)", name: "Nguyễn Lan", role: "スタッフ", shop: "表参道", kind: "late", hours: "0.2h", status: "pending" },
  { id: "emp-003", date: "05/14 (水)", name: "佐藤 健一", kana: "さとう けんいち", role: "副店長", shop: "自由が丘", kind: "trip", hours: "—", status: "leave" },
  { id: "emp-004", date: "05/13 (火)", name: "山田 太郎", role: "スタッフ", shop: "渋谷", kind: "absence", hours: "—", status: "leave" },
  { id: "emp-005", date: "05/13 (火)", name: "高橋 由美", kana: "たかはし ゆみ", role: "スタッフ", shop: "渋谷", kind: "normal", hours: "8.0h", status: "active" },
  { id: "emp-006", date: "05/13 (火)", name: "鈴木 健太", role: "店長", shop: "表参道", kind: "normal", hours: "8.5h", status: "active" },
  { id: "emp-007", date: "05/12 (月)", name: "中村 結衣", role: "スタッフ", shop: "渋谷", kind: "paid", hours: "8.0h", status: "active" },
  { id: "emp-008", date: "05/12 (月)", name: "小林 大樹", role: "スタッフ", shop: "自由が丘", kind: "late", hours: "0.5h", status: "pending" },
];

function AvatarCell({ row }: { row: Row }) {
  return (
    <span className="c-avatar">
      <span className="ava">{row.name.slice(0, 1)}</span>
      <span>
        <span className="name">{row.name}</span>
        {row.kana ? <span className="sub">{row.kana}</span> : null}
      </span>
    </span>
  );
}

function StatusBadge({ status }: { status: Row["status"] }) {
  if (status === "active") return <Badge variant="success" dot>稼働中</Badge>;
  if (status === "pending") return <Badge variant="warning" dot>申請中</Badge>;
  return <Badge variant="neutral" dot>休職</Badge>;
}

function KindBadge({ kind }: { kind: Row["kind"] }) {
  if (kind === "paid") return <Badge variant="primary" dot={false}>有給</Badge>;
  if (kind === "late") return <Badge variant="attention" dot={false}>遅刻</Badge>;
  if (kind === "trip") return <Badge variant="info" dot={false}>出張</Badge>;
  if (kind === "absence") return <Badge variant="error" dot={false}>欠勤</Badge>;
  return <Badge variant="neutral" dot={false}>通常</Badge>;
}

const COLUMNS: TableColumn<Row>[] = [
  { accessorKey: "date", header: "日付", size: 112, minSize: 112, maxSize: 112, meta: { sortable: true } },
  { accessorKey: "name", header: "従業員", minSize: 180, cell: ({ row }) => <AvatarCell row={row.original} />, meta: { filterable: true } },
  { accessorKey: "role", header: "役職", minSize: 120 },
  { accessorKey: "shop", header: "店舗", minSize: 96, cell: ({ row }) => <span className="c-mono">{row.original.shop}</span>, meta: { filterable: true } },
  { accessorKey: "kind", header: "区分", cell: ({ row }) => <KindBadge kind={row.original.kind} />, meta: { filterable: true } },
  { accessorKey: "hours", header: "時間", meta: { className: "num", sortable: true } },
  { accessorKey: "status", header: "状態", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
  {
    id: "actions",
    header: "操作",
    size: 56, minSize: 56, maxSize: 56,
    cell: () => (
      <span className="row-actions">
        <button className="iconbtn" aria-label="操作メニュー">⋯</button>
      </span>
    ),
    meta: { className: "actions", sticky: "right", hideable: false },
  },
];

const DEFAULT_SORT: TableSort = { key: "date", direction: "desc" };
const DEFAULT_VISIBILITY: TableColumnVisibility = { hours: false };

const VIEWS: TableViewItem[] = [
  { key: "all", label: "すべて", filters: [], sort: DEFAULT_SORT, columnVisibility: DEFAULT_VISIBILITY, count: ROWS.length },
  { key: "pending", label: "承認待ち", filters: [{ key: "status", operator: "eq", value: "pending" }], sort: DEFAULT_SORT, columnVisibility: DEFAULT_VISIBILITY, count: 2 },
  { key: "late", label: "遅刻 / 早退", filters: [{ key: "kind", operator: "eq", value: "late" }], sort: DEFAULT_SORT, columnVisibility: DEFAULT_VISIBILITY, count: 2 },
  { key: "confirmed", label: "今月確定", filters: [{ key: "status", operator: "eq", value: "active" }], sort: DEFAULT_SORT, columnVisibility: { ...DEFAULT_VISIBILITY, status: false }, count: 4 },
];

function App() {
  const [forced, setForced] = useState(0);
  const [activeView, setActiveView] = useState("all");
  const [filters, setFilters] = useState<TableFilter[]>([]);
  const [sort, setSort] = useState<TableSortState>(DEFAULT_SORT);
  const [selected, setSelected] = useState<string[]>(["emp-002"]);
  const [visibility, setVisibility] = useState<TableColumnVisibility>(DEFAULT_VISIBILITY);
  const [searchValue, setSearchValue] = useState("");

  const filtered = useMemo(() => {
    return ROWS.filter((row) => {
      if (filters.length === 0) return true;
      return filters.every((f) => {
        const v = (row as unknown as Record<string, unknown>)[f.key];
        return String(v) === String(f.value);
      });
    }).filter((row) => {
      if (searchValue.trim() === "") return true;
      return row.name.includes(searchValue) || row.shop.includes(searchValue);
    });
  }, [filters, searchValue]);

  return (
    <div style={{ padding: 24, fontFamily: "system-ui", maxWidth: 1600 }}>
      <h1 style={{ marginTop: 0, fontSize: 18 }}>Table probe — full-feature (no Storybook)</h1>
      <p style={{ fontSize: 12, color: "#666" }}>
        Forced parent renders: {forced}{" "}
        <button onClick={() => setForced((n) => n + 1)}>force re-render</button>
      </p>
      <div data-testid="table-host" style={{ marginTop: 16 }}>
        <Table
          containerClassName="tbl-shell"
          columns={COLUMNS}
          data={filtered}
          rowKey="id"
          tableKey="probe"
          defaultColumnVisibility={DEFAULT_VISIBILITY}
          columnVisibility={visibility}
          onColumnVisibilityChange={setVisibility}
          views={{
            items: VIEWS,
            activeKey: activeView,
            onActiveKeyChange: setActiveView,
            onViewApply: (v) => {
              setActiveView(v.key);
              setFilters(v.filters ?? []);
              setSort("sort" in v ? (v.sort ?? null) : DEFAULT_SORT);
              setVisibility(v.columnVisibility ?? DEFAULT_VISIBILITY);
            },
            saveable: true,
          }}
          toolbar={{
            search: {
              value: searchValue,
              onValueChange: setSearchValue,
              placeholder: "検索…",
            },
            filter: {},
            columns: {},
            primaryAction: { label: "＋ 新規申請" },
          }}
          filters={filters}
          onFiltersChange={setFilters}
          batchActions={{
            selectedRowKeys: selected,
            onSelectedRowKeysChange: setSelected,
            actions: (
              <>
                <Button size="small" variant="outline">一括承認</Button>
                <Button size="small" variant="outline">CSV 出力</Button>
                <Button size="small" variant="destructive">却下</Button>
              </>
            ),
          }}
          sort={sort}
          onSortChange={setSort}
          pagination={{
            type: "numbered",
            current: 1,
            pageSize: 25,
            total: 1284,
            pageSizeOptions: [25, 50, 100],
            onChange: () => {},
          }}
        />
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
