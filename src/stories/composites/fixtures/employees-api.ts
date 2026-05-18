/**
 * Mock employees API — simulates a real backend (filter + sort +
 * paginate server-side). Stories consume `fetchEmployees(params)` via
 * `useEffect` so the Storybook code panel shows the canonical
 * "fetch on dependency change → setState" pattern; consumers swap
 * the import for their real HTTP client.
 *
 * Not picked up by Storybook's `*.stories.@(ts|tsx)` glob — lives
 * alongside the stories under `fixtures/` so the source panel can
 * reference it but the manifest doesn't index it as a story.
 */
import type {
  TableFilter,
  TableSortState,
  TableViewItem,
} from "../../../components/data-display/Table";
import employeeRows from "../../data-display/fixtures/table-employees.json";

export interface EmployeeRow {
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

const ALL_ROWS = employeeRows as EmployeeRow[];

export const SHOP_OPTIONS = [
  { value: "渋谷", label: "渋谷" },
  { value: "表参道", label: "表参道" },
  { value: "新宿", label: "新宿" },
  { value: "自由が丘", label: "自由が丘" },
];

export const KIND_OPTIONS = [
  { value: "late", label: "遅刻" },
  { value: "paid", label: "有給" },
  { value: "trip", label: "出張" },
  { value: "absence", label: "欠勤" },
  { value: "normal", label: "通常" },
];

export interface FetchEmployeesParams {
  page: number;
  pageSize: number;
  filters?: TableFilter[];
  sort?: TableSortState;
  /** Free-text search across name / kana / shop / role. */
  q?: string;
}

export interface FetchEmployeesResponse {
  rows: EmployeeRow[];
  total: number;
}

function matches(row: EmployeeRow, filters: TableFilter[], q?: string): boolean {
  if (q !== undefined && q.trim() !== "") {
    const haystack =
      `${row.name} ${row.kana ?? ""} ${row.shop} ${row.role}`.toLowerCase();
    if (!haystack.includes(q.trim().toLowerCase())) return false;
  }
  return filters.every((filter) => {
    const value = String(filter.value ?? "").trim();
    if (value === "") return true;
    if (filter.key === "shop") return row.shop === value;
    if (filter.key === "kind") return row.kind === value;
    if (filter.key === "status") return row.status === value;
    return true;
  });
}

function sortRows(
  rows: EmployeeRow[],
  sort: TableSortState | undefined,
): EmployeeRow[] {
  const head = Array.isArray(sort) ? (sort[0] ?? null) : (sort ?? null);
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

/**
 * Fake fetch — replace with your real API call. Returns a paginated
 * response with `total` so the pagination band can show "1 / N pages".
 *
 * @example
 *   const [data, setData] = useState({ rows: [], total: 0 });
 *   useEffect(() => {
 *     fetchEmployees({ page, pageSize }).then(setData);
 *   }, [page, pageSize]);
 */
export async function fetchEmployees(
  params: FetchEmployeesParams,
): Promise<FetchEmployeesResponse> {
  await new Promise((resolve) => setTimeout(resolve, 80));
  const filtered = ALL_ROWS.filter((row) =>
    matches(row, params.filters ?? [], params.q),
  );
  const sorted = sortRows(filtered, params.sort);
  const start = (params.page - 1) * params.pageSize;
  return {
    rows: sorted.slice(start, start + params.pageSize),
    total: sorted.length,
  };
}

/**
 * Preset saved views — `fetchEmployees` accepts the snapshot's
 * filters / sort directly, so loading a view is just a re-fetch.
 */
export const BUILT_IN_VIEWS: TableViewItem[] = [
  {
    key: "all",
    label: "すべて",
    filters: [],
    sort: { key: "date", direction: "desc" },
  },
  {
    key: "pending",
    label: "承認待ち",
    filters: [{ key: "status", operator: "eq", value: "pending" }],
    sort: { key: "date", direction: "desc" },
  },
  {
    key: "late",
    label: "遅刻 / 早退",
    filters: [{ key: "kind", operator: "eq", value: "late" }],
    sort: { key: "date", direction: "desc" },
  },
];
