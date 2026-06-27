import { useState } from "react";

import { Card, CardContent, Badge, DataTable, type ColumnDef } from "@godxjp/ui/data-display";
import { Button, Text } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import { Download, CheckCircle2 } from "lucide-react";

/**
 * DataTable — full TanStack feature set (the former DataGrid). One unified
 * DataTable now drives column sort, global search, column visibility ("set
 * view"), per-page + numbered pagination, row selection + bulk actions, and
 * density — all on the lean `data` + `columns` API. This demo runs CLIENT mode
 * (manual* flags default to false) so it sorts/filters/paginates in-browser on
 * the sample rows. Composed only from real @godxjp/ui components.
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

const currencyFormatter = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
  maximumFractionDigits: 0,
});
const yen = (n: number) => currencyFormatter.format(n);

const columns: ColumnDef<Invoice>[] = [
  { key: "id", header: "請求書番号", enableHiding: false },
  { key: "partner", header: "取引先", sortable: true },
  {
    key: "amount",
    header: "金額",
    align: "right",
    sortable: true,
    render: (row) => (
      <Text as="div" weight="medium" tabular className="text-end">
        {yen(row.amount)}
      </Text>
    ),
  },
  {
    key: "status",
    header: "状態",
    render: (row) => <Badge tone={STATUS_TONE[row.status]}>{STATUS_LABEL[row.status]}</Badge>,
  },
  {
    key: "date",
    header: "発行日",
    align: "right",
    render: (row) => (
      <Text as="div" tabular className="text-end">
        {row.date}
      </Text>
    ),
  },
];

export default function Demo() {
  const [lastClicked, setLastClicked] = useState<string>();

  return (
    <PageContainer
      title="DataTable · グリッド機能"
      subtitle="TanStack Table 駆動 · 並べ替え・検索・列の表示切替・ページング・選択（@godxjp/ui/data-display）"
    >
      <Card>
        <CardContent flush>
          <DataTable
            columns={columns}
            data={ROWS}
            getRowId={(r) => r.id}
            selectable
            onRowClick={(r) => setLastClicked(r.id)}
          >
            <DataTable.Toolbar>
              <DataTable.BulkActions>
                {(count) => (
                  <Flex direction="row" align="center" gap="sm">
                    <Text weight="medium" tabular>
                      {count} 件選択
                    </Text>
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
              </DataTable.BulkActions>
              <Flex direction="row" align="center" gap="sm" wrap className="ms-auto">
                <DataTable.Search />
                <DataTable.ViewOptions />
                <DataTable.DensityToggle />
              </Flex>
            </DataTable.Toolbar>

            <DataTable.Content />
            <DataTable.Pagination pageSizeOptions={[5, 10, 20]} />
          </DataTable>
        </CardContent>
      </Card>

      {lastClicked ? (
        <Text as="p" tone="muted" className="mt-3">
          行クリック: {lastClicked}
        </Text>
      ) : null}
    </PageContainer>
  );
}
