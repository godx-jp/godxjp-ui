import { useState } from "react";
import { AppShell, Flex, PageContainer, Sidebar, Topbar } from "@godxjp/ui/layout";
import type { SidebarSectionProp } from "@godxjp/ui/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
} from "@godxjp/ui/data-display";
import { Button } from "@godxjp/ui/general";
import {
  LayoutDashboard,
  FileText,
  Receipt,
  Users,
  BookOpen,
  Building2,
  ShieldCheck,
  CreditCard,
  ChevronRight,
  Plus,
} from "lucide-react";

/**
 * Sidebar — data-driven vertical nav rail.
 * Focus: sections, groups with children[], product chip, footer, active item,
 * collapsed icon-only mode.
 * Composed only from real @godxjp/ui components inside an AppShell frame.
 */

const FULL_SECTIONS: SidebarSectionProp[] = [
  {
    label: "会計",
    items: [
      { id: "dashboard", label: "ダッシュボード", icon: LayoutDashboard },
      {
        id: "ledger",
        label: "元帳",
        icon: BookOpen,
        children: [
          { id: "journal", label: "仕訳入力", icon: FileText },
          { id: "recurring", label: "定期仕訳", icon: Receipt },
          { id: "coa", label: "勘定科目", icon: CreditCard },
        ],
      },
      { id: "invoices", label: "請求書", icon: Receipt, badge: <Badge tone="info">3</Badge> },
      { id: "bills", label: "仕入請求書", icon: FileText },
    ],
  },
  {
    label: "マスタ",
    items: [
      { id: "partners", label: "取引先", icon: Building2 },
      { id: "items", label: "品目", icon: CreditCard },
    ],
  },
  {
    label: "管理",
    items: [
      { id: "users", label: "ユーザー", icon: Users },
      { id: "roles", label: "権限", icon: ShieldCheck, disabled: true },
    ],
  },
];

export default function Demo() {
  const [activeId, setActiveId] = useState("journal");
  const [collapsed, setCollapsed] = useState(false);

  const sidebar = (
    <Sidebar
      activeId={activeId}
      collapsed={collapsed}
      onSelect={setActiveId}
      sections={FULL_SECTIONS}
      product={{
        name: "CoreBooks",
        role: "株式会社アクメ",
        color: "hsl(220 70% 50%)",
      }}
      onProductClick={() => undefined}
      footer={
        <Flex direction="col" gap="xs">
          <div className="text-foreground text-sm font-medium">山田 太郎</div>
          <Flex align="center" gap="xs">
            <span className="bg-success size-1.5 rounded-full" />
            <span className="text-muted-foreground text-xs">オンライン</span>
          </Flex>
        </Flex>
      }
    />
  );

  const topbar = (
    <Topbar
      product={{ name: "CoreBooks", color: "hsl(220 70% 50%)" }}
      collapsed={collapsed}
      onToggleCollapsed={() => setCollapsed((c) => !c)}
      onSearchOpen={() => undefined}
    />
  );

  return (
    <AppShell sidebar={sidebar} topbar={topbar} sidebarCollapsed={collapsed}>
      <PageContainer
        title="Sidebar デモ"
        subtitle="sections / groups / product chip / footer / active item"
        breadcrumb={[{ label: "ホーム", to: "/" }, { label: "Sidebar デモ" }]}
        extra={
          <Button size="sm" variant="outline" onClick={() => setCollapsed((c) => !c)}>
            {collapsed ? "サイドバーを展開" : "サイドバーを折りたたむ"}
          </Button>
        }
      >
        <Flex direction="col" gap="lg">
          {/* Navigation map — illustrates what the sidebar is rendering */}
          <Card>
            <CardHeader>
              <CardTitle>現在のナビゲーション構造</CardTitle>
              <CardDescription>
                Sidebar の sections prop に渡しているデータ構造です。 アクティブ項目:{" "}
                <Badge variant="secondary">{activeId}</Badge>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Flex direction="col" gap="md">
                {FULL_SECTIONS.map((section) => (
                  <Flex key={section.label} direction="col" gap="xs">
                    <div className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                      {section.label}
                    </div>
                    {section.items.map((item) => (
                      <Flex key={item.id} direction="col" gap="xs">
                        <Flex
                          align="center"
                          gap="sm"
                          className={`cursor-pointer rounded px-2 py-1 text-sm ${
                            activeId === item.id
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-foreground"
                          }`}
                          onClick={() => setActiveId(item.id)}
                        >
                          <item.icon className="text-muted-foreground size-4 shrink-0" />
                          <span className="flex-1">{item.label}</span>
                          {item.badge}
                          {item.children && (
                            <ChevronRight className="text-muted-foreground size-3" />
                          )}
                          {item.disabled && (
                            <Badge variant="outline" className="text-xs">
                              無効
                            </Badge>
                          )}
                        </Flex>
                        {item.children && (
                          <Flex direction="col" gap="xs" className="pl-6">
                            {item.children.map((child) => (
                              <Flex
                                key={child.id}
                                align="center"
                                gap="sm"
                                className={`cursor-pointer rounded px-2 py-1 text-sm ${
                                  activeId === child.id
                                    ? "bg-primary/10 text-primary font-medium"
                                    : "text-muted-foreground"
                                }`}
                                onClick={() => setActiveId(child.id)}
                              >
                                <child.icon className="size-3.5 shrink-0" />
                                {child.label}
                              </Flex>
                            ))}
                          </Flex>
                        )}
                      </Flex>
                    ))}
                  </Flex>
                ))}
              </Flex>
            </CardContent>
          </Card>

          {/* Feature notes */}
          <Card>
            <CardHeader>
              <CardTitle>主な機能</CardTitle>
            </CardHeader>
            <CardContent>
              <Flex direction="col" gap="sm" className="text-sm">
                {[
                  "product chip — name / role（エンティティ名）/ color",
                  "collapsed=true でアイコンのみのレール表示に切替",
                  "children[] を持つ item は自動で折りたたみグループになる",
                  "activeId が子孫にマッチすると親グループが自動展開",
                  "badge prop で件数バッジをアイテムに付与可能",
                  "disabled=true で項目を非活性化（クリック不可）",
                  "footer prop でスクロール外にユーザー情報を固定",
                ].map((note) => (
                  <Flex key={note} align="center" gap="sm">
                    <Plus className="text-primary size-3 shrink-0" />
                    <span>{note}</span>
                  </Flex>
                ))}
              </Flex>
            </CardContent>
          </Card>
        </Flex>
      </PageContainer>
    </AppShell>
  );
}
