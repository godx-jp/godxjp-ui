import { useState } from "react";
import {
  AppShell,
  Flex,
  PageContainer,
  ResponsiveGrid,
  Sidebar,
  SplitPane,
  Topbar,
} from "@godxjp/ui/layout";
import type { SidebarSectionProp } from "@godxjp/ui/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  StatCard,
  Badge,
} from "@godxjp/ui/data-display";
import { Button } from "@godxjp/ui/general";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@godxjp/ui/navigation";
import {
  LayoutDashboard,
  FileText,
  Receipt,
  Users,
  BookOpen,
  Building2,
  ShieldCheck,
  Bell,
  Plus,
} from "lucide-react";

/**
 * AppShell — canonical admin frame.
 * Real composition: AppShell + Sidebar + Topbar + PageContainer body.
 * Japanese accounting shell (CoreBooks) with entity switcher, collapse toggle,
 * notifications badge, and a dashboard page body.
 * Composed only from real @godxjp/ui components.
 */

const SECTIONS: SidebarSectionProp[] = [
  {
    label: "会計",
    items: [
      { id: "dashboard", label: "ダッシュボード", icon: LayoutDashboard },
      {
        id: "ledger",
        label: "元帳",
        icon: BookOpen,
        children: [
          { id: "journal", label: "仕訳", icon: FileText },
          { id: "recurring", label: "定期仕訳", icon: Receipt },
        ],
      },
      { id: "invoices", label: "請求書", icon: Receipt },
    ],
  },
  {
    label: "管理",
    items: [
      { id: "partners", label: "取引先", icon: Building2 },
      { id: "users", label: "ユーザー", icon: Users },
      { id: "roles", label: "権限", icon: ShieldCheck, disabled: true },
    ],
  },
];

const ENTITIES = [
  { id: "acme", name: "株式会社アクメ" },
  { id: "globex", name: "グローバル商事株式会社" },
  { id: "initech", label: "イニテック有限会社" },
] as const;

export default function Demo() {
  const [activeId, setActiveId] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [activeEntity, setActiveEntity] = useState(ENTITIES[0].name);
  const [unread, setUnread] = useState(true);

  const sidebar = (
    <Sidebar
      activeId={activeId}
      collapsed={collapsed}
      onSelect={setActiveId}
      sections={SECTIONS}
      product={{ name: "CoreBooks", role: activeEntity, color: "hsl(220 70% 50%)" }}
      footer={
        <Flex direction="col" gap="xs">
          <div className="text-foreground text-sm font-medium">山田 太郎</div>
          <div className="text-muted-foreground text-xs">システム管理者</div>
        </Flex>
      }
    />
  );

  const topbar = (
    <Topbar
      product={{ name: "CoreBooks", color: "hsl(220 70% 50%)" }}
      productMenu={
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>エンティティ切替</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {ENTITIES.map((e) => (
            <DropdownMenuItem key={e.id} onSelect={() => setActiveEntity(e.name)}>
              {e.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      }
      collapsed={collapsed}
      onToggleCollapsed={() => setCollapsed((c) => !c)}
      onSearchOpen={() => undefined}
      unread={unread}
      onNotificationsOpen={() => setUnread(false)}
    />
  );

  return (
    <AppShell sidebar={sidebar} topbar={topbar} sidebarCollapsed={collapsed}>
      <PageContainer
        title="売上ダッシュボード"
        subtitle={`${activeEntity} — 2026年5月`}
        breadcrumb={[{ label: "ホーム", to: "/" }, { label: "ダッシュボード" }]}
        extra={
          <Flex gap="sm">
            <Button size="sm" variant="outline" onClick={() => setUnread(true)}>
              <Bell />
              通知をリセット
            </Button>
            <Button size="sm">
              <Plus />
              仕訳作成
            </Button>
          </Flex>
        }
      >
        <Flex direction="col" gap="lg">
          <ResponsiveGrid columns={{ sm: 2, md: 4 }}>
            <StatCard label="月次売上" value="¥8,200,000" delta="+12%" hint="先月比" />
            <StatCard label="請求件数" value="312" delta="+4%" />
            <StatCard label="売掛金残高" value="¥1,284,500" hint="未回収 18件" />
            <StatCard label="回収率" value="96.8%" delta="+1.2%" />
          </ResponsiveGrid>

          <SplitPane
            asideWidth="sm"
            aside={
              <Flex direction="col" gap="md">
                <Card>
                  <CardHeader>
                    <CardTitle>最近の仕訳</CardTitle>
                    <CardDescription>承認待ちの仕訳</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Flex direction="col" gap="sm">
                      {["JE-0041", "JE-0040", "JE-0039"].map((id) => (
                        <Flex key={id} justify="between" align="center">
                          <span className="text-muted-foreground font-mono text-xs">{id}</span>
                          <Badge tone="warning">保留中</Badge>
                        </Flex>
                      ))}
                    </Flex>
                  </CardContent>
                </Card>
              </Flex>
            }
          >
            <Card>
              <CardHeader>
                <CardTitle>売上推移</CardTitle>
                <CardDescription>過去6ヶ月の月次売上</CardDescription>
              </CardHeader>
              <CardContent>
                <Flex direction="col" gap="sm">
                  {[
                    { month: "12月", amount: "¥7,100,000" },
                    { month: "1月", amount: "¥6,800,000" },
                    { month: "2月", amount: "¥7,400,000" },
                    { month: "3月", amount: "¥8,000,000" },
                    { month: "4月", amount: "¥7,900,000" },
                    { month: "5月", amount: "¥8,200,000" },
                  ].map((row) => (
                    <Flex key={row.month} justify="between" className="text-sm">
                      <span className="text-muted-foreground">{row.month}</span>
                      <span className="font-medium">{row.amount}</span>
                    </Flex>
                  ))}
                </Flex>
              </CardContent>
            </Card>
          </SplitPane>
        </Flex>
      </PageContainer>
    </AppShell>
  );
}
