import { useState } from "react";

import { Card, CardContent, Badge } from "@godxjp/ui/data-display";
import { DataGrid, type ColumnDef } from "@godxjp/ui/data-grid";
import { Button } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import { Download, CheckCircle2 } from "lucide-react";

/**
 * DataGrid — TanStack Table adapter (`@godxjp/ui/data-grid`). Full data-grid feature set:
 * column sort, global search, column visibility ("set view"), per-page + numbered pagination,
 * row selection + bulk actions, density. Defaults to SERVER mode (manual sort/filter/paginate);
 * this demo runs CLIENT mode so it sorts/filters/paginates in-browser on the sample rows.
 * Composed only from real @godxjp/ui components.
 */
type Invoice = {
  id: string;
  partner: string;
  amount: number;
  status: "active" | "pending" | "failed" | "draft";
  date: string;
};

const STATUS_TONE = {
  active: "success",
  pending: "warning",
  failed: "destructive",
  draft: "secondary",
} as const;

const STATUS_LABEL = {
  active: "有効",
  pending: "保留",
  failed: "失敗",
  draft: "下書き",
} as const;

const ROWS: Invoice[] = [
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
  { id: "INV-0308", partner: "大阪商事", amount: 905000, status: "active", date: "2024-04-08" },
  { id: "INV-0307", partner: "名古屋運輸", amount: 47300, status: "active", date: "2024-04-07" },
  {
    id: "INV-0306",
    partner: "福岡トレード",
    amount: 218900,
    status: "pending",
    date: "2024-04-06",
  },
  { id: "INV-0305", partner: "札幌興業", amount: 73200, status: "draft", date: "2024-04-05" },
  { id: "INV-0304", partner: "横浜物産", amount: 564000, status: "active", date: "2024-04-04" },
  { id: "INV-0303", partner: "京都製作所", amount: 99800, status: "failed", date: "2024-04-03" },
  { id: "INV-0302", partner: "神戸海運", amount: 341500, status: "active", date: "2024-04-02" },
  { id: "INV-0301", partner: "仙台流通", amount: 28600, status: "pending", date: "2024-04-01" },
];

const yen = (n: number) => `¥${n.toLocaleString()}`;

const columns: ColumnDef<Invoice, unknown>[] = [
  { accessorKey: "id", header: "請求書番号", enableHiding: false },
  { accessorKey: "partner", header: "取引先", meta: { label: "取引先" } },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">金額</div>,
    meta: { label: "金額" },
    cell: ({ getValue }) => (
      <div className="text-right font-medium tabular-nums">{yen(getValue<number>())}</div>
    ),
  },
  {
    accessorKey: "status",
    header: "状態",
    enableSorting: false,
    meta: { label: "状態" },
    cell: ({ getValue }) => {
      const s = getValue<Invoice["status"]>();
      return <Badge tone={STATUS_TONE[s]}>{STATUS_LABEL[s]}</Badge>;
    },
  },
  {
    accessorKey: "date",
    header: () => <div className="text-right">発行日</div>,
    meta: { label: "発行日" },
    cell: ({ getValue }) => <div className="text-right tabular-nums">{getValue<string>()}</div>,
  },
];

export default function Demo() {
  const [lastClicked, setLastClicked] = useState<string>();

  return (
    <PageContainer
      title="DataGrid"
      subtitle="TanStack Table アダプタ — 並べ替え・検索・列の表示切替・ページング・選択（@godxjp/ui/data-grid）"
    >
      <Card>
        <CardContent>
          <DataGrid
            columns={columns}
            data={ROWS}
            getRowId={(r) => r.id}
            enableRowSelection
            manualSorting={false}
            manualFiltering={false}
            manualPagination={false}
            onRowClick={(r) => setLastClicked(r.id)}
          >
            <DataGrid.Toolbar>
              <DataGrid.BulkActions>
                {(count) => (
                  <Flex direction="row" align="center" gap="sm">
                    <span className="text-sm font-medium tabular-nums">{count} 件選択</span>
                    <Button variant="outline" size="sm">
                      <Download className="size-4" aria-hidden="true" />
                      エクスポート
                    </Button>
                    <Button size="sm">
                      <CheckCircle2 className="size-4" aria-hidden="true" />
                      入金消込
                    </Button>
                  </Flex>
                )}
              </DataGrid.BulkActions>
              <Flex direction="row" align="center" gap="sm" wrap className="ms-auto">
                <DataGrid.Search />
                <DataGrid.ViewOptions />
                <DataGrid.DensityToggle />
              </Flex>
            </DataGrid.Toolbar>

            <DataGrid.Content />
            <DataGrid.Pagination pageSizeOptions={[5, 10, 20]} />
          </DataGrid>

          {lastClicked ? (
            <p className="text-muted-foreground mt-3 text-sm">行クリック: {lastClicked}</p>
          ) : null}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
