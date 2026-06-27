import { useState } from "react";
import {
  AppShell,
  Flex,
  PageContainer,
  Sidebar,
  SidebarHeader,
  SidebarItem,
  SidebarSection,
  Topbar,
} from "@godxjp/ui/layout";
import type { SidebarItemData, SidebarSectionProp } from "@godxjp/ui/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
} from "@godxjp/ui/data-display";
import { Button, Logo, Text } from "@godxjp/ui/general";
import {
  LayoutDashboard,
  FileText,
  Receipt,
  Users,
  BookOpen,
  Building2,
  ShieldCheck,
  CreditCard,
  Plus,
  Boxes,
  Star,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
} from "lucide-react";

/**
 * Sidebar · data-driven vertical nav rail.
 * Focus: every public prop · sections, groups with children[], product chip,
 * brand header, renderItem escape hatch, children composition, footer, active
 * item, collapsed icon-only mode.
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

const BRAND_SECTIONS: SidebarSectionProp[] = [
  {
    label: "アプリ",
    items: [
      { id: "home", label: "ホーム", icon: LayoutDashboard },
      { id: "projects", label: "プロジェクト", icon: Boxes },
      { id: "settings", label: "設定", icon: Settings },
    ],
  },
];

const FAVOURITE_SECTIONS: SidebarSectionProp[] = [
  {
    label: "ナビゲーション",
    items: [
      { id: "overview", label: "概要", icon: LayoutDashboard },
      { id: "reports", label: "レポート", icon: FileText },
      { id: "members", label: "メンバー", icon: Users },
    ],
  },
];

const FAVOURITE_IDS = new Set(["overview", "members"]);

/** renderItem · replaces a row's content with a custom layout (icon + label + star affix). */
function renderFavouriteRow(item: SidebarItemData) {
  const Icon = item.icon;
  return (
    <>
      <span className="sb-icon">
        <Icon aria-hidden="true" />
      </span>
      <span className="sb-label">{item.label}</span>
      {FAVOURITE_IDS.has(item.id) ? (
        <Star className="text-attention size-4 shrink-0 fill-current" aria-label="お気に入り" />
      ) : null}
    </>
  );
}

const COMPOSED_ITEMS: SidebarItemData[] = [
  { id: "starred-1", label: "月次決算", icon: Star },
  { id: "starred-2", label: "売掛金一覧", icon: Receipt },
  { id: "starred-3", label: "取引先マスタ", icon: Building2 },
];

export default function Demo() {
  const [activeId, setActiveId] = useState("journal");
  const [collapsed, setCollapsed] = useState(false);
  const [brandActiveId, setBrandActiveId] = useState("projects");
  const [renderActiveId, setRenderActiveId] = useState("overview");
  const [composedActiveId, setComposedActiveId] = useState("starred-1");

  const sidebar = (
    <Sidebar
      activeId={activeId}
      collapsed={collapsed}
      onSelect={setActiveId}
      sections={FULL_SECTIONS}
      product={{
        name: "CoreBooks",
        role: "株式会社アクメ",
        color: "hsl(var(--primary))",
      }}
      onProductClick={() => undefined}
      footer={
        <Flex direction="col" gap="xs">
          <Text as="div" weight="medium">
            山田 太郎
          </Text>
          <Flex align="center" gap="xs">
            <span className="bg-success size-1.5 rounded-full" />
            <Text size="xs" tone="muted">
              オンライン
            </Text>
          </Flex>
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
          <Logo label="CoreBooks" glyph="C" />
        </>
      }
      center={
        <Button
          variant="outline"
          size="sm"
          className="text-muted-foreground w-full max-w-sm justify-start"
        >
          <Search />
          検索…
        </Button>
      }
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
          <Card>
            <CardHeader>
              <CardTitle>現在の状態</CardTitle>
              <CardDescription>
                左のレールに渡している sections prop の現在のアクティブ項目:{" "}
                <Badge variant="secondary">{activeId}</Badge>
              </CardDescription>
            </CardHeader>
          </Card>

          {/* brand prop · replaces the product chip with a fully custom header (SidebarHeader). */}
          <Card>
            <CardHeader>
              <CardTitle>brand プロップ</CardTitle>
              <CardDescription>
                product チップの代わりに SidebarHeader で完全に自作したヘッダーを差し込みます。
                brand と product は排他です。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-card flex h-80 w-64 flex-col overflow-hidden rounded-lg border">
                <Sidebar
                  activeId={brandActiveId}
                  onSelect={setBrandActiveId}
                  sections={BRAND_SECTIONS}
                  brand={
                    <SidebarHeader>
                      <span className="bg-primary text-primary-foreground grid size-7 shrink-0 place-items-center rounded-md">
                        <Boxes className="size-4" aria-hidden="true" />
                      </span>
                      <span className="flex min-w-0 flex-col">
                        <Text weight="bold" truncate>
                          Acme Suite
                        </Text>
                        <Text size="xs" tone="muted" truncate>
                          v7.0 Enterprise
                        </Text>
                      </span>
                    </SidebarHeader>
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* renderItem prop · per-item custom render escape hatch (here: a favourite-star affix). */}
          <Card>
            <CardHeader>
              <CardTitle>renderItem プロップ</CardTitle>
              <CardDescription>
                各行のレンダリングを差し替えるエスケープハッチ。 ここではラベルの右に
                お気に入りスターのアフィックスを描画しています。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-card flex h-72 w-64 flex-col overflow-hidden rounded-lg border">
                <Sidebar
                  activeId={renderActiveId}
                  onSelect={setRenderActiveId}
                  sections={FAVOURITE_SECTIONS}
                  renderItem={renderFavouriteRow}
                />
              </div>
            </CardContent>
          </Card>

          {/* children prop · full nav override: compose SidebarSection / SidebarItem directly. */}
          <Card>
            <CardHeader>
              <CardTitle>children プロップ（ナビ全体の差し替え）</CardTitle>
              <CardDescription>
                sections を使わず SidebarSection / SidebarItem を直接組み立てて、
                ナビゲーション全体を 自前で構成します。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-card flex h-64 w-64 flex-col overflow-hidden rounded-lg border">
                <Sidebar activeId={composedActiveId} onSelect={setComposedActiveId}>
                  <SidebarSection label="お気に入り">
                    {COMPOSED_ITEMS.map((item) => (
                      <SidebarItem
                        key={item.id}
                        item={item}
                        active={composedActiveId === item.id}
                        onActivate={setComposedActiveId}
                      />
                    ))}
                  </SidebarSection>
                </Sidebar>
              </div>
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
                  "product chip · name / role（エンティティ名）/ color",
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
