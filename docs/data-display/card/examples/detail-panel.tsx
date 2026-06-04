import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Descriptions,
  StatCard,
} from "@godxjp/ui/data-display";
import { Button } from "@godxjp/ui/general";
import {
  AppShell,
  Flex,
  PageContainer,
  ResponsiveGrid,
  Sidebar,
  type SidebarSection,
  Topbar,
} from "@godxjp/ui/layout";
import { BookOpen, FileText, LayoutDashboard, ReceiptText, Users } from "lucide-react";

/**
 * Detail screen — Card as the structural surface: accent stripe + banded header +
 * Descriptions body + separated footer action bar, beside a StatCard summary row.
 * No hand-rolled panels; every surface is a real @godxjp/ui component.
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
      topbar={
        <Topbar
          product={{ name: "CoreBooks", color: "hsl(var(--primary))" }}
          onSearchOpen={() => {}}
        />
      }
    >
      <PageContainer
        title="請求書 INV-2024-0312"
        subtitle="株式会社ベトヤ · 2024-04-12"
        breadcrumb={[{ label: "請求書", to: "#" }, { label: "INV-2024-0312" }]}
        extra={<Badge variant="warning">承認待ち</Badge>}
      >
        <Flex direction="col" gap="lg">
          <ResponsiveGrid columns={{ sm: 1, md: 3 }}>
            <StatCard label="合計金額" value="¥482,000" />
            <StatCard label="消費税 (10%)" value="¥43,818" />
            <StatCard label="支払期日" value="2024-05-31" hint="あと19日" />
          </ResponsiveGrid>

          <Card accent="primary">
            <CardHeader banded>
              <CardTitle>明細</CardTitle>
              <CardDescription>4月分 受注</CardDescription>
            </CardHeader>
            <CardContent>
              <Descriptions>
                <Descriptions.Item label="取引先">株式会社ベトヤ</Descriptions.Item>
                <Descriptions.Item label="勘定科目">売掛金 / 売上高</Descriptions.Item>
                <Descriptions.Item label="小計">¥438,182</Descriptions.Item>
                <Descriptions.Item label="消費税 (10%)">¥43,818</Descriptions.Item>
                <Descriptions.Item label="合計">¥482,000</Descriptions.Item>
                <Descriptions.Item label="摘要">INV-2024-0312 / 4月分</Descriptions.Item>
              </Descriptions>
            </CardContent>
            <CardFooter separated>
              <Flex direction="row" wrap gap="sm" justify="end">
                <Button variant="outline">却下</Button>
                <Button>承認</Button>
              </Flex>
            </CardFooter>
          </Card>
        </Flex>
      </PageContainer>
    </AppShell>
  );
}
