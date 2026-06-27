import { useState } from "react";

import {
  Badge,
  Card,
  CardContent,
  DataTable,
  type ColumnDef,
  Avatar,
  AvatarFallback,
} from "@godxjp/ui/data-display";
import { Button } from "@godxjp/ui/general";
import {
  AppShell,
  Flex,
  PageContainer,
  Sidebar,
  type SidebarSection,
  Topbar,
} from "@godxjp/ui/layout";
import {
  BookOpen,
  Download,
  FileText,
  LayoutDashboard,
  Plus,
  ReceiptText,
  Users,
} from "lucide-react";

/**
 * List-page screen — the DataTable sits inside a Card (CardContent flush) within
 * a default, padded PageContainer, so the table aligns with the page header on the
 * same gutters instead of tearing to the viewport edges. The page title + "新規"
 * action are the header; bulk actions appear only when rows are selected. A
 * complete, real admin list mirroring the dxs-kintai PageContent → Card → Table shape.
 */
const sections: SidebarSection[] = [
  {
    label: "会計",
    items: [
      { id: "dashboard", label: "ダッシュボード", icon: LayoutDashboard },
      { id: "journal", label: "仕訳", icon: FileText },
      { id: "invoices", label: "請求書", icon: ReceiptText },
      { id: "partners", label: "取引先", icon: BookOpen },
    ],
  },
  { label: "管理", items: [{ id: "users", label: "ユーザー", icon: Users }] },
];

type Invoice = {
  id: string;
  partner: string;
  amount: number;
  status: "active" | "pending" | "draft" | "failed";
  date: string;
};

const invoices: Invoice[] = [
  {
    id: "INV-2024-0312",
    partner: "株式会社ベトヤ",
    amount: 482000,
    status: "active",
    date: "2024-04-12",
  },
  {
    id: "INV-2024-0311",
    partner: "ハノイ物流",
    amount: 128400,
    status: "pending",
    date: "2024-04-11",
  },
  { id: "INV-2024-0310", partner: "GMO決済", amount: 64800, status: "draft", date: "2024-04-10" },
  {
    id: "INV-2024-0309",
    partner: "東京ロジ",
    amount: 312000,
    status: "failed",
    date: "2024-04-09",
  },
  { id: "INV-2024-0308", partner: "大阪商事", amount: 96250, status: "active", date: "2024-04-08" },
];

const yen = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
  maximumFractionDigits: 0,
});

const columns: ColumnDef<Invoice>[] = [
  { key: "id", header: "請求書番号", width: "w-40" },
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
];

export default function Demo() {
  const [selected, setSelected] = useState<Set<string>>(new Set());

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
        subtitle="直近30日間の受注データ"
        breadcrumb={[{ label: "請求書" }]}
        extra={
          <Flex direction="row" wrap align="center" gap="sm">
            <Button variant="outline" size="sm">
              <Download />
              エクスポート
            </Button>
            <Button size="sm">
              <Plus />
              新規請求書
            </Button>
          </Flex>
        }
      >
        <Card>
          <CardContent flush>
            <DataTable
              data={invoices}
              columns={columns}
              getRowId={(row) => row.id}
              selectable
              selected={selected}
              onSelectChange={setSelected}
              onRowClick={() => {}}
            >
              <DataTable.Toolbar>
                <DataTable.BulkActions>
                  <Button size="sm" variant="outline">
                    入金消込
                  </Button>
                  <Button size="sm" variant="outline">
                    エクスポート
                  </Button>
                </DataTable.BulkActions>
                <DataTable.DensityToggle />
              </DataTable.Toolbar>
            </DataTable>
          </CardContent>
        </Card>
      </PageContainer>
    </AppShell>
  );
}
