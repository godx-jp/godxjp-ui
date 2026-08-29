import { useState } from "react";
import {
  AppShell,
  Breadcrumb,
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
  Avatar,
  AvatarFallback,
} from "@godxjp/ui/data-display";
import { Button, Text } from "@godxjp/ui/general";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
} from "lucide-react";

/**
 * AppShell · canonical admin frame.
 * Real composition: AppShell + Sidebar + Topbar + PageContainer body.
 * Japanese accounting shell (CoreBooks) with entity switcher, collapse toggle,
 * notifications badge, and a dashboard page body.
 * Composed only from real @godxjp/ui components.
 * Includes an executable switch between the composed topbar and legacy topbarLeft/topbarRight/logo.
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
  { id: "initech", name: "イニテック有限会社" },
] as const;

export default function Demo() {
  const [activeId, setActiveId] = useState("dashboard");
  // Seeded collapsed at rest so the icon rail + collapsed reflow (data-collapsed)
  // is visible in a static screenshot; the topbar toggle expands the full sidebar.
  const [collapsed, setCollapsed] = useState(true);
  const [activeEntity, setActiveEntity] = useState<(typeof ENTITIES)[number]["name"]>(
    ENTITIES[0].name,
  );
  const [unread, setUnread] = useState(true);
  const [legacyTopbar, setLegacyTopbar] = useState(false);
  // Bar-less shell: topbar / topbarLeft / topbarRight / logo をすべて渡さない状態。
  // チャット・メール・IDE のようにページ側が最上段を所有する画面のための構成。
  const [barless, setBarless] = useState(false);

  const sidebar = (
    <Sidebar
      activeId={activeId}
      collapsed={collapsed}
      onSelect={setActiveId}
      sections={SECTIONS}
      product={{ name: "CoreBooks", role: activeEntity }}
      footer={
        <Flex direction="col" gap="xs">
          <Text as="div" weight="medium">
            山田 太郎
          </Text>
          <Text as="div" size="xs" tone="muted">
            システム管理者
          </Text>
        </Flex>
      }
    />
  );

  const topbar = (
    <Topbar
      start={
        <>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={collapsed ? "サイドバーを展開" : "サイドバーを折りたたむ"}
            aria-pressed={collapsed}
            onClick={() => setCollapsed((c) => !c)}
          >
            {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
          </Button>
          {/* Decorative brand mark — hidden below `sm` where the hamburger already anchors the
              start of a narrow mobile topbar, so functional controls (entity switcher, search)
              keep priority and the bar never overflows. */}
          <Avatar className="hidden rounded-md sm:inline-flex">
            <AvatarFallback className="bg-primary text-primary-foreground font-bold">
              C
            </AvatarFallback>
          </Avatar>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              {/* Entity switcher collapses to an icon-only control below `sm` so the topbar never
                  overflows a narrow (mobile) viewport; the long tenant name truncates from `sm` up.
                  `aria-label` keeps the accessible name at every width even when the label is hidden. */}
              <Button variant="ghost" size="sm" aria-label={activeEntity} className="min-w-0">
                <Building2 className="size-4 shrink-0 sm:hidden" aria-hidden="true" />
                <span className="hidden min-w-0 truncate sm:inline">{activeEntity}</span>
                <ChevronDown className="shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>エンティティ切替</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {ENTITIES.map((e) => (
                <DropdownMenuItem key={e.id} onSelect={() => setActiveEntity(e.name)}>
                  <Building2 className="me-2 size-4" />
                  {e.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      }
      center={
        // Search collapses to an icon-only trigger below `sm` (fits a narrow topbar) and expands to
        // the full-width search affordance from `sm` up. `aria-label` preserves the accessible name
        // when the visible label is hidden.
        <Button
          variant="outline"
          size="sm"
          aria-label="検索"
          className="text-muted-foreground w-auto justify-start sm:w-full sm:max-w-sm"
        >
          <Search />
          <span className="hidden sm:inline">検索…</span>
        </Button>
      }
      end={
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="通知"
          className="relative"
          onClick={() => setUnread(false)}
        >
          <Bell />
          {unread ? (
            <span className="bg-destructive absolute end-1.5 top-1.5 size-1.5 rounded-full" />
          ) : null}
        </Button>
      }
    />
  );

  return (
    <AppShell
      sidebar={sidebar}
      // barless では 4 スロットすべてが undefined ＝ <header class="app-topbar"> は描画されず、
      // .app-root に data-topbar="none" が付いてバーの行が 0 になる（900px 以下だけ、
      // ハンバーガーのためにヘッダーが戻る）。
      topbar={barless || legacyTopbar ? undefined : topbar}
      logo={
        !barless && legacyTopbar ? (
          <Avatar>
            <AvatarFallback>L</AvatarFallback>
          </Avatar>
        ) : undefined
      }
      topbarLeft={
        !barless && legacyTopbar ? (
          <Button size="sm" variant="ghost" onClick={() => setLegacyTopbar(false)}>
            Composed topbar を表示
          </Button>
        ) : undefined
      }
      topbarRight={!barless && legacyTopbar ? <Text>Legacy slots active</Text> : undefined}
      sidebarCollapsed={collapsed}
      // Shell-level breadcrumb slot (app-breadcrumb landmark) · distinct from
      // PageContainer's own breadcrumb; here the shell owns the trail.
      breadcrumb={
        <Breadcrumb items={[{ label: "ホーム", to: "/" }, { label: "ダッシュボード" }]} />
      }
      // Shell-level footer slot (app-footer landmark) · distinct from the
      // Sidebar footer (the user identity block) shown on the left rail.
      footer={
        <Flex justify="between" align="center">
          <Text size="xs" tone="muted">
            2026 CoreBooks 会計システム
          </Text>
          <Text size="xs" tone="muted">
            バージョン 7.2.0
          </Text>
        </Flex>
      }
    >
      <PageContainer
        title="売上ダッシュボード"
        subtitle={`${activeEntity} · 2026年5月`}
        extra={
          <Flex gap="sm">
            <Button size="sm" variant="outline" onClick={() => setUnread(true)}>
              <Bell />
              通知をリセット
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setBarless(false);
                setLegacyTopbar(true);
              }}
            >
              レガシースロットを表示
            </Button>
            <Button
              size="sm"
              variant={barless ? "default" : "outline"}
              aria-pressed={barless}
              onClick={() => setBarless((b) => !b)}
            >
              {barless ? "トップバーを戻す" : "トップバーなし（チャット型）"}
            </Button>
            <Button size="sm">
              <Plus />
              仕訳作成
            </Button>
          </Flex>
        }
      >
        <Flex direction="col" gap="lg">
          <Card>
            <CardHeader>
              <CardTitle level={2}>Responsive frame coverage</CardTitle>
              <CardDescription>
                Frame の Dimensions で 320 / 375 / 390 / 768 / 1024 / 1280 / 1440 / 1920px
                を切り替え、sidebar・topbar・page actions・grid・split pane
                の変換を同じ実用構成で確認する。900px 以下ではドックされたサイドバーが隠れ、
                AppShell 所有のモバイルドロワー（トップバー左のハンバーガー → フォーカストラップ付き
                Sheet · Esc で閉じてトリガーへフォーカス復帰）が navigation を提供する（gh#165）。
                このデモは mobileNav を渡していないため、同じ Sidebar がドロワーに再利用される。
              </CardDescription>
              <CardDescription>
                「トップバーなし（チャット型）」を押すと topbar / topbarLeft / topbarRight / logo の
                4 スロットをすべて外した状態になる。バーに置くものが無い画面 （チャット・メール・IDE
                ＝ ページ自身が最上段を所有する画面）で空のバーを残すと、 48px
                の固定行＋境界線の上にページヘッダーがもう一段重なるため、AppShell は
                <code> &lt;header&gt; </code>を描画せず <code>data-topbar=&quot;none&quot;</code>
                でその行を 0 にする。 900px
                以下でだけヘッダーはハンバーガー専用として戻る（ドックされたレールが 隠れる幅で
                navigation を失わせないため）。空の <code>{"topbar={<></>}"}</code>
                で代用しないこと ― それは 4 スロットが埋まった状態と同じで、バーの行は残る。
              </CardDescription>
            </CardHeader>
          </Card>
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
                    <CardTitle level={2}>最近の仕訳</CardTitle>
                    <CardDescription>承認待ちの仕訳</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Flex direction="col" gap="sm">
                      {["JE-0041", "JE-0040", "JE-0039"].map((id) => (
                        <Flex key={id} justify="between" align="center">
                          <Text size="xs" tone="muted" mono>
                            {id}
                          </Text>
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
                <CardTitle level={2}>売上推移</CardTitle>
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
                    <Flex key={row.month} justify="between">
                      <Text tone="muted">{row.month}</Text>
                      <Text weight="medium">{row.amount}</Text>
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
