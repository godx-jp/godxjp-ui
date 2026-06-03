import { useMemo, useState } from "react";

import { Badge, DataTable, type ColumnDef } from "@godxjp/ui/data-display";
import { Button } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import { Pencil, Trash2 } from "lucide-react";

/**
 * DataTable — the admin list primitive: sticky header, sorting, bulk selection,
 * density toggle, and a built-in empty state (never hand-roll a data.length===0
 * guard). Composed only from real @godxjp/ui components.
 */
type Invoice = {
  id: string;
  partner: string;
  amount: number;
  status: "active" | "pending" | "draft" | "failed";
  date: string;
};

const invoices: Invoice[] = [
  {
    id: "INV-0312",
    partner: "株式会社ベトヤ",
    amount: 482000,
    status: "active",
    date: "2024-04-12",
  },
  { id: "INV-0311", partner: "ハノイ物流", amount: 128400, status: "pending", date: "2024-04-11" },
  { id: "INV-0310", partner: "GMO決済", amount: 64800, status: "draft", date: "2024-04-10" },
  { id: "INV-0309", partner: "東京ロジ", amount: 312000, status: "failed", date: "2024-04-09" },
];

const yen = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
  maximumFractionDigits: 0,
});

const columns: ColumnDef<Invoice>[] = [
  { key: "id", header: "請求書番号", width: "w-32" },
  { key: "partner", header: "取引先", sortable: true },
  {
    key: "amount",
    header: "金額",
    align: "right",
    sortable: true,
    render: (row) => <span className="tabular-nums">{yen.format(row.amount)}</span>,
  },
  { key: "status", header: "状態", render: (row) => <Badge status={row.status} /> },
  { key: "date", header: "発行日", align: "right", hiddenOnMobile: true },
  {
    key: "_actions",
    header: "",
    align: "right",
    render: () => (
      <Flex direction="row" wrap align="center" gap="xs" justify="end">
        <Button variant="ghost" size="icon-sm" aria-label="編集">
          <Pencil />
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label="削除">
          <Trash2 />
        </Button>
      </Flex>
    ),
  },
];

export default function Demo() {
  const [selected, setSelected] = useState<Set<string>>(new Set(["INV-0311"]));
  const [sort, setSort] = useState<{ value: string; direction: "asc" | "desc" } | undefined>({
    value: "amount",
    direction: "desc",
  });

  const rows = useMemo(() => {
    if (!sort) return invoices;
    const dir = sort.direction === "asc" ? 1 : -1;
    return [...invoices].sort((a, b) => {
      const av = a[sort.value as keyof Invoice];
      const bv = b[sort.value as keyof Invoice];
      return (av < bv ? -1 : av > bv ? 1 : 0) * dir;
    });
  }, [sort]);

  return (
    <PageContainer
      title="DataTable"
      subtitle="sortable · selectable · bulk actions · row actions · built-in empty state"
    >
      <Flex direction="col" gap="lg">
        <DataTable
          data={rows}
          columns={columns}
          getRowId={(row) => row.id}
          selectable
          selected={selected}
          onSelectChange={setSelected}
          sort={sort}
          onSortChange={setSort}
        >
          <DataTable.Toolbar>
            <DataTable.BulkActions>
              <Button size="sm" variant="outline">
                エクスポート
              </Button>
              <Button size="sm">入金消込</Button>
            </DataTable.BulkActions>
            <DataTable.DensityToggle />
          </DataTable.Toolbar>
        </DataTable>

        <Flex direction="col" gap="sm">
          <div className="text-sm font-medium">
            Empty state (rendered automatically when data is empty)
          </div>
          <DataTable data={[]} columns={columns} getRowId={(row) => row.id} />
        </Flex>
      </Flex>
    </PageContainer>
  );
}
