import { Badge, Card, CardContent, DataTable, type ColumnDef } from "@godxjp/ui/data-display";
import { Button, Logo } from "@godxjp/ui/general";
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
  Pencil,
  Plus,
  ReceiptText,
  Trash2,
  Users,
} from "lucide-react";

/**
 * List page — the toolbar is NOT hand-rolled: the page title + primary/secondary
 * actions live in PageContainer's `title` + `extra`, and per-row ghost icon
 * Buttons sit in a DataTable action column. The table is wrapped in a Card
 * (CardContent flush) inside a padded PageContainer so it stays on the same
 * gutters as the header.
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
  status: "active" | "pending" | "draft";
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
];

const yen = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
  maximumFractionDigits: 0,
});

const columns: ColumnDef<Invoice>[] = [
  { key: "id", header: "請求書番号" },
  { key: "partner", header: "取引先", sortable: true },
  {
    key: "amount",
    header: "金額",
    align: "right",
    render: (row) => <span className="tabular-nums">{yen.format(row.amount)}</span>,
  },
  { key: "status", header: "状態", render: (row) => <Badge status={row.status} /> },
  { key: "date", header: "発行日", align: "right" },
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
      topbar={<Topbar start={<Logo label="CoreBooks" glyph="C" />} />}
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
            <DataTable data={invoices} columns={columns} getRowId={(row) => row.id} />
          </CardContent>
        </Card>
      </PageContainer>
    </AppShell>
  );
}
