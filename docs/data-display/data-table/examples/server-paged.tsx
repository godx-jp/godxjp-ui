import { useMemo, useState } from "react";

import {
  Avatar,
  AvatarFallback,
  Badge,
  Card,
  CardContent,
  DataTable,
  type ColumnDef,
} from "@godxjp/ui/data-display";
import { Button } from "@godxjp/ui/general";
import {
  AppShell,
  Flex,
  PageContainer,
  Sidebar,
  type SidebarSectionProp,
  Topbar,
} from "@godxjp/ui/layout";
import { Download, FileText, LayoutDashboard, Plus, ReceiptText } from "lucide-react";

/**
 * Server-paged list (gh#705) — antd's `Table pagination`: the server returns ONE page plus the
 * total, and the table renders its own footer from `pagination={{ total, current, pageSize,
 * showTotal, onChange }}` — the real Pagination, total beside the page numbers, bottom-end. The
 * table is compact, so the pager is `size="sm"` and sits on the same control step as the toolbar
 * buttons above it. `data` is only the current page; the footer offers ceil(total / pageSize).
 */
const sections: SidebarSectionProp[] = [
  {
    label: "会計",
    items: [
      { id: "dashboard", label: "ダッシュボード", icon: LayoutDashboard },
      { id: "journal", label: "仕訳", icon: FileText },
      { id: "invoices", label: "請求書", icon: ReceiptText },
    ],
  },
];

type Invoice = {
  id: string;
  partner: string;
  amount: number;
  status: "active" | "pending" | "draft" | "failed";
};

const partners = ["株式会社ベトヤ", "ハノイ物流", "GMO決済", "東京ロジ", "大阪商事"];
const statuses: Invoice["status"][] = ["active", "pending", "draft", "failed"];

// Stands in for the server: 137 rows exist, but only one page ever reaches the table.
const SERVER_TOTAL = 137;
function fetchPage(page: number, pageSize: number): Invoice[] {
  const first = (page - 1) * pageSize;
  const count = Math.max(0, Math.min(pageSize, SERVER_TOTAL - first));
  return Array.from({ length: count }, (_, i) => {
    const n = first + i + 1;
    return {
      id: `INV-2024-${String(n).padStart(4, "0")}`,
      partner: partners[n % partners.length],
      amount: 12000 + ((n * 7919) % 480000),
      status: statuses[n % statuses.length],
    };
  });
}

const yen = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
  maximumFractionDigits: 0,
});

const columns: ColumnDef<Invoice>[] = [
  { key: "id", header: "請求書番号", width: "w-40" },
  { key: "partner", header: "取引先" },
  {
    key: "amount",
    header: "金額",
    align: "right",
    render: (row) => <span className="tabular-nums">{yen.format(row.amount)}</span>,
  },
  { key: "status", header: "状態", render: (row) => <Badge status={row.status} /> },
];

export default function Demo() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const rows = useMemo(() => fetchPage(page, pageSize), [page, pageSize]);

  return (
    <AppShell
      sidebar={
        <Sidebar
          activeId="invoices"
          sections={sections}
          onSelect={() => {}}
          product={{ name: "CoreBooks", role: "管理コンソール", color: "hsl(var(--primary))" }}
        />
      }
      topbar={
        <Topbar
          start={
            <Avatar className="rounded-md">
              <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                C
              </AvatarFallback>
            </Avatar>
          }
        />
      }
    >
      <PageContainer
        title="請求書 一覧"
        subtitle="サーバー側でページングされた一覧"
        breadcrumb={[{ label: "請求書" }]}
        extra={
          <Button size="sm">
            <Plus />
            新規請求書
          </Button>
        }
      >
        <Card>
          <CardContent flush>
            <DataTable
              data={rows}
              columns={columns}
              getRowId={(row) => row.id}
              pagination={{
                total: SERVER_TOTAL,
                current: page,
                pageSize,
                pageSizeOptions: [10, 20, 50],
                showTotal: (total, [from, to]) => `${from}〜${to} 件 / 全 ${total} 件`,
                onChange: (nextPage, nextPageSize) => {
                  setPage(nextPage);
                  setPageSize(nextPageSize);
                },
              }}
            >
              <DataTable.Toolbar>
                <Flex direction="row" align="center" gap="sm">
                  <Button size="sm" variant="outline">
                    <Download />
                    エクスポート
                  </Button>
                </Flex>
                <DataTable.ViewOptions />
              </DataTable.Toolbar>
            </DataTable>
          </CardContent>
        </Card>
      </PageContainer>
    </AppShell>
  );
}
