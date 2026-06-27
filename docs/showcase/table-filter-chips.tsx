/**
 * Showcase · table-filter-chips — フィルターチップ (V6)
 *
 * An active-filter chip bar above a kintai DataTable. Each applied filter
 * renders as a removable Badge chip (× clears that one); a "すべて解除" button
 * clears them all. The chip set drives the DataTable's filtered rows live —
 * the table count, empty state, and pagination all react to the active chips.
 *
 * Composition map (intent → real @godxjp/ui primitive):
 *   page chrome ............ PageContainer (compact density, small heading)
 *   filter controls ........ SearchInput (free text) + Select (data-driven)
 *   active-filter chips ..... Badge (tone) + an inline Button(icon) per chip
 *   clear-all .............. Button(ghost)
 *   the list ............... DataTable (sortable, selectable, bulk, empty)
 *   status cell ............ Badge tone (fixed color signaling)
 *
 * DNA: compact density, tabular-nums on times, fixed tone mapping
 * (出勤 success若竹 / 遅刻 warning山吹 / 早退 attention→warning / 欠勤 danger茜 /
 * 申請中 info群青), quiet JP copy, no emoji.
 *
 * GAP: DataTable has no built-in filter-chip bar (it ships Toolbar / BulkActions
 * / DensityToggle / Pagination only). The chip bar is composed here from real
 * primitives (Badge + Button + SearchInput + Select) and the filtering is done
 * in the consumer, then passed to DataTable as the already-filtered `data`.
 */
import * as React from "react";
import { X, Filter } from "lucide-react";

import { Button, Text } from "@godxjp/ui/general";
import { Badge, DataTable, type ColumnDef } from "@godxjp/ui/data-display";
import { SearchInput, Select } from "@godxjp/ui/data-entry";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import type { SortStateProp } from "@godxjp/ui/props";

// ── Domain ──────────────────────────────────────────────────────────────────

type AttendanceStatus = "present" | "late" | "early" | "absent" | "requested";

interface Record_ {
  id: string;
  name: string;
  dept: "営業部" | "開発部" | "管理部" | "物流部";
  date: string;
  clockIn: string;
  clockOut: string;
  status: AttendanceStatus;
  overtime: number; // minutes
}

// status → {label, tone}. attention(遅刻/早退) uses warning山吹; 欠勤 uses danger茜.
const STATUS_META: Record<
  AttendanceStatus,
  { label: string; tone: "success" | "warning" | "destructive" | "info" }
> = {
  present: { label: "出勤", tone: "success" },
  late: { label: "遅刻", tone: "warning" },
  early: { label: "早退", tone: "warning" },
  absent: { label: "欠勤", tone: "destructive" },
  requested: { label: "申請中", tone: "info" },
};

const DEPTS = ["営業部", "開発部", "管理部", "物流部"] as const;

const ROWS: Record_[] = [
  {
    id: "K-1043",
    name: "田中 健太",
    dept: "営業部",
    date: "06/03",
    clockIn: "08:58",
    clockOut: "18:12",
    status: "present",
    overtime: 12,
  },
  {
    id: "K-1044",
    name: "佐藤 美咲",
    dept: "開発部",
    date: "06/03",
    clockIn: "09:24",
    clockOut: "18:40",
    status: "late",
    overtime: 40,
  },
  {
    id: "K-1045",
    name: "鈴木 大輔",
    dept: "物流部",
    date: "06/03",
    clockIn: "07:55",
    clockOut: "16:30",
    status: "early",
    overtime: 0,
  },
  {
    id: "K-1046",
    name: "高橋 由美",
    dept: "管理部",
    date: "06/03",
    clockIn: "—",
    clockOut: "—",
    status: "absent",
    overtime: 0,
  },
  {
    id: "K-1047",
    name: "伊藤 翔",
    dept: "営業部",
    date: "06/03",
    clockIn: "08:50",
    clockOut: "19:05",
    status: "present",
    overtime: 65,
  },
  {
    id: "K-1048",
    name: "渡辺 彩",
    dept: "開発部",
    date: "06/03",
    clockIn: "—",
    clockOut: "—",
    status: "requested",
    overtime: 0,
  },
  {
    id: "K-1049",
    name: "山本 拓也",
    dept: "物流部",
    date: "06/03",
    clockIn: "09:12",
    clockOut: "18:20",
    status: "late",
    overtime: 20,
  },
  {
    id: "K-1050",
    name: "中村 真央",
    dept: "管理部",
    date: "06/03",
    clockIn: "08:45",
    clockOut: "17:50",
    status: "present",
    overtime: 0,
  },
  {
    id: "K-1051",
    name: "小林 直樹",
    dept: "営業部",
    date: "06/03",
    clockIn: "08:59",
    clockOut: "20:10",
    status: "present",
    overtime: 130,
  },
  {
    id: "K-1052",
    name: "加藤 千夏",
    dept: "開発部",
    date: "06/03",
    clockIn: "—",
    clockOut: "—",
    status: "requested",
    overtime: 0,
  },
  {
    id: "K-1053",
    name: "吉田 蓮",
    dept: "物流部",
    date: "06/03",
    clockIn: "—",
    clockOut: "—",
    status: "absent",
    overtime: 0,
  },
  {
    id: "K-1054",
    name: "山田 さくら",
    dept: "管理部",
    date: "06/03",
    clockIn: "09:31",
    clockOut: "18:00",
    status: "late",
    overtime: 0,
  },
];

const STATUS_OPTIONS = (Object.keys(STATUS_META) as AttendanceStatus[]).map((k) => ({
  value: k,
  label: STATUS_META[k].label,
}));
const DEPT_OPTIONS = DEPTS.map((d) => ({ value: d, label: d }));
const OT_OPTIONS = [
  { value: "any", label: "残業: すべて" },
  { value: "ot", label: "残業あり" },
  { value: "long", label: "60分以上" },
];

const minutes = (m: number) => `${m}分`;

// ── Columns ─────────────────────────────────────────────────────────────────

const columns: ColumnDef<Record_>[] = [
  {
    key: "id",
    header: "ID",
    width: "w-24",
    render: (r) => (
      <Text size="xs" mono>
        {r.id}
      </Text>
    ),
  },
  { key: "name", header: "従業員", sortable: true },
  { key: "dept", header: "部署", hiddenOnMobile: true },
  {
    key: "clockIn",
    header: "出勤",
    align: "right",
    render: (r) => <Text tabular>{r.clockIn}</Text>,
  },
  {
    key: "clockOut",
    header: "退勤",
    align: "right",
    hiddenOnMobile: true,
    render: (r) => <Text tabular>{r.clockOut}</Text>,
  },
  {
    key: "overtime",
    header: "残業",
    align: "right",
    sortable: true,
    render: (r) => <Text tabular>{r.overtime > 0 ? minutes(r.overtime) : "—"}</Text>,
  },
  {
    key: "status",
    header: "状態",
    align: "center",
    render: (r) => (
      <Badge tone={STATUS_META[r.status].tone} variant="outline">
        {STATUS_META[r.status].label}
      </Badge>
    ),
  },
];

// ── Chip ────────────────────────────────────────────────────────────────────

function FilterChip({
  tone,
  label,
  onRemove,
}: {
  tone?: "success" | "warning" | "destructive" | "info" | "neutral";
  label: string;
  onRemove: () => void;
}) {
  return (
    <Badge tone={tone ?? "neutral"} variant="outline" className="gap-1 pe-1">
      {label}
      <Button
        variant="ghost"
        size="icon-sm"
        className="size-4 rounded-sm"
        aria-label={`${label} のフィルターを解除`}
        onClick={onRemove}
      >
        <X className="size-3" aria-hidden="true" />
      </Button>
    </Badge>
  );
}

export default function Demo() {
  const [query, setQuery] = React.useState("田");
  const [status, setStatus] = React.useState<AttendanceStatus | undefined>("late");
  const [dept, setDept] = React.useState<string | undefined>(undefined);
  const [ot, setOt] = React.useState<string>("any");

  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [sort, setSort] = React.useState<SortStateProp | undefined>(undefined);

  const hasFilters = query.trim() !== "" || !!status || !!dept || ot !== "any";

  const clearAll = () => {
    setQuery("");
    setStatus(undefined);
    setDept(undefined);
    setOt("any");
  };

  // Filter → sort. The active chips drive these filtered rows.
  const rows = React.useMemo(() => {
    let out = ROWS.filter((r) => {
      if (query.trim() && !`${r.name}${r.id}`.includes(query.trim())) return false;
      if (status && r.status !== status) return false;
      if (dept && r.dept !== dept) return false;
      if (ot === "ot" && r.overtime <= 0) return false;
      if (ot === "long" && r.overtime < 60) return false;
      return true;
    });
    if (sort) {
      const dir = sort.direction === "asc" ? 1 : -1;
      out = [...out].sort((a, b) => {
        const av = a[sort.key as keyof Record_];
        const bv = b[sort.key as keyof Record_];
        return (av < bv ? -1 : av > bv ? 1 : 0) * dir;
      });
    }
    return out;
  }, [query, status, dept, ot, sort]);

  return (
    <PageContainer
      title="勤怠一覧"
      subtitle="フィルターチップ · 適用中の条件をチップで表示、個別/一括で解除"
      density="compact"
    >
      <Flex direction="col" gap="md">
        {/* Filter controls */}
        <Flex direction="row" wrap align="center" gap="sm">
          <SearchInput
            value={query}
            onValueChange={setQuery}
            placeholder="従業員・IDで検索"
            aria-label="従業員・IDで検索"
            className="w-full sm:w-56"
          />
          <Select
            options={STATUS_OPTIONS}
            value={status}
            onValueChange={(v) => {
              setStatus((v as AttendanceStatus) || undefined);
            }}
            placeholder="状態"
          />
          <Select
            options={DEPT_OPTIONS}
            value={dept}
            onValueChange={(v) => {
              setDept(v || undefined);
            }}
            placeholder="部署"
          />
          <Select
            options={OT_OPTIONS}
            value={ot}
            onValueChange={(v) => {
              setOt(v || "any");
            }}
            placeholder="残業"
          />
        </Flex>

        {/* Active-filter chip bar — visible at rest because filters are seeded */}
        <Flex
          direction="row"
          wrap
          align="center"
          gap="xs"
          className="border-border bg-secondary/30 min-h-9 rounded-md border px-2.5 py-1.5"
        >
          <Flex direction="row" align="center" gap="xs" className="text-muted-foreground pe-1">
            <Filter className="size-3.5" aria-hidden="true" />
            <Text size="xs">適用中</Text>
          </Flex>

          {!hasFilters && (
            <Text size="xs" tone="muted">
              条件なし · 全 {ROWS.length} 件
            </Text>
          )}

          {query.trim() && (
            <FilterChip
              label={`検索: ${query.trim()}`}
              onRemove={() => {
                setQuery("");
              }}
            />
          )}
          {status && (
            <FilterChip
              tone={STATUS_META[status].tone}
              label={`状態: ${STATUS_META[status].label}`}
              onRemove={() => {
                setStatus(undefined);
              }}
            />
          )}
          {dept && (
            <FilterChip
              label={`部署: ${dept}`}
              onRemove={() => {
                setDept(undefined);
              }}
            />
          )}
          {ot !== "any" && (
            <FilterChip
              label={ot === "ot" ? "残業あり" : "残業 60分以上"}
              onRemove={() => {
                setOt("any");
              }}
            />
          )}

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="ms-auto h-6 px-2 text-xs"
              onClick={clearAll}
            >
              すべて解除
            </Button>
          )}
        </Flex>

        {/* The filtered table */}
        <DataTable
          data={rows}
          columns={columns}
          getRowId={(r) => r.id}
          selectable
          selected={selected}
          onSelectChange={setSelected}
          sort={sort}
          onSortChange={setSort}
          density="compact"
          empty={
            <Flex direction="col" align="center" gap="xs" className="py-8">
              <Text weight="medium">該当する勤怠記録がありません</Text>
              <Text size="xs" tone="muted">
                フィルター条件を解除すると全件を表示します
              </Text>
              <Button variant="outline" size="sm" className="mt-1" onClick={clearAll}>
                フィルターを解除
              </Button>
            </Flex>
          }
        >
          <DataTable.Toolbar>
            <Text size="xs" tone="muted" tabular>
              {rows.length} / {ROWS.length} 件
            </Text>
            <DataTable.BulkActions>
              <Button size="sm" variant="outline">
                CSV出力
              </Button>
              <Button size="sm">一括承認</Button>
            </DataTable.BulkActions>
            <DataTable.DensityToggle />
          </DataTable.Toolbar>
          <DataTable.Content />
        </DataTable>
      </Flex>
    </PageContainer>
  );
}
