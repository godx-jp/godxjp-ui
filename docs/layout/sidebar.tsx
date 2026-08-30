import { useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import {
  AppShell,
  createSidebarLink,
  Flex,
  PageContainer,
  Sidebar,
  SidebarHeader,
  SidebarItem,
  SidebarSection,
  Topbar,
} from "@godxjp/ui/layout";
import type { SidebarItemData, SidebarRenderItemProp, SidebarSectionProp } from "@godxjp/ui/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Avatar,
  AvatarFallback,
} from "@godxjp/ui/data-display";
import { Button, Text } from "@godxjp/ui/general";
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
 * brand header, linkComponent (router links) + SidebarItem asChild, the
 * deprecated renderItem escape hatch, children composition, footer, active
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
      { id: "invoices", label: "請求書", icon: Receipt, badge: 3 },
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

/**
 * badgeTone · what a count MEANS, not what colour it is. `neutral`（既定）は「未読」、
 * `destructive` は「自分宛て」（メンション・DM）。`badge` には数値や文字列だけを渡します ·
 * ここに <Badge> を入れると .sb-badge の中にもう一枚ピルが入り、二重の丸が出ます。
 */
const MENTION_SECTIONS: SidebarSectionProp[] = [
  {
    label: "チャンネル",
    items: [
      { id: "general", label: "general", icon: Boxes, badge: 12 },
      { id: "accounting", label: "経理", icon: Receipt, badge: 3, badgeTone: "destructive" },
      { id: "design", label: "design", icon: Star, badge: "9+", badgeTone: "neutral" },
      { id: "random", label: "random", icon: LayoutDashboard },
    ],
  },
];

/**
 * gh#228 · nav row and nav icon read SEPARATE colour tokens. A service normally sets these once in
 * its theme.css (`:root` or a scoped `[data-tenant] .app-sidebar`); here they are scoped to one
 * demo frame so the default rail can sit next to the themed one. Icons only — geometry (16px icon,
 * 32px row, 10px gap) is untouched.
 */
const CANONICAL_NAV_TOKENS = {
  "--sidebar-nav-icon-foreground": "hsl(var(--foreground))",
  "--sidebar-nav-icon-active-foreground": "hsl(var(--primary))",
} as CSSProperties;

/**
 * gh#213 · THE router-link contract. `createSidebarLink` adapts any router `Link` — React Router /
 * TanStack use `to`, Inertia and Next.js use `href` (the default, and
 * `inertiaSidebarLink(Link)` from `@godxjp/ui/inertia` is the same thing pre-bound). The consumer
 * writes NO row markup: the Sidebar composes the icon slot, the label, the badge, the active state
 * and the collapsed rail, and hands them to the link as `children`.
 */
const RouterLink = createSidebarLink(Link, "to");

/** Router-driven rows — each carries an `href`, which is what the link adapter navigates to. */
const ROUTED_SECTIONS: SidebarSectionProp[] = [
  {
    label: "ナビゲーション",
    items: [
      { id: "overview", label: "概要", icon: LayoutDashboard, href: "/overview" },
      {
        id: "reports",
        label: "レポート",
        icon: FileText,
        href: "/reports",
        badge: 5,
      },
      {
        id: "ledger",
        label: "元帳",
        icon: BookOpen,
        children: [{ id: "journal-2", label: "仕訳入力", icon: Receipt, href: "/journal" }],
      },
      { id: "members", label: "メンバー", icon: Users, href: "/members", disabled: true },
    ],
  },
];

/**
 * renderItem · DEPRECATED (gh#213) — kept working for existing consumers. It leaves the row CONTENT
 * to the caller, which is how a `<Link>{item.label}</Link>` silently dropped every icon in
 * production. `rowProps` now carries the library-composed `children`, so spreading it (or rendering
 * `rowProps.children`) restores the canonical row; the star is a decorative, non-interactive affix.
 * Prefer `linkComponent` (above) or `SidebarItem asChild` for new code.
 */
function renderFavouriteRow(
  item: SidebarItemData,
  rowProps: SidebarRenderItemProp,
  onSelect: (id: string) => void,
) {
  return (
    <a
      href={`#${item.id}`}
      onClick={(event) => {
        event.preventDefault();
        onSelect(item.id);
      }}
    >
      {/* The icon + label come from the LIBRARY, not from hand-written .sb-icon / .sb-label spans. */}
      {rowProps.children}
      {FAVOURITE_IDS.has(item.id) ? (
        <Star className="text-attention size-4 shrink-0 fill-current" aria-label="お気に入り" />
      ) : null}
    </a>
  );
}

const COMPOSED_ITEMS: SidebarItemData[] = [
  { id: "starred-1", label: "月次決算", icon: Star, href: "/close" },
  { id: "starred-2", label: "売掛金一覧", icon: Receipt, href: "/receivables" },
  { id: "starred-3", label: "取引先マスタ", icon: Building2, href: "/partners" },
];

export default function Demo() {
  const [activeId, setActiveId] = useState("journal");
  const [collapsed, setCollapsed] = useState(false);
  const [brandActiveId, setBrandActiveId] = useState("projects");
  const [renderActiveId, setRenderActiveId] = useState("overview");
  const [routedActiveId, setRoutedActiveId] = useState("reports");
  const [composedActiveId, setComposedActiveId] = useState("starred-1");
  const [tokenActiveId, setTokenActiveId] = useState("overview");
  const [mentionActiveId, setMentionActiveId] = useState("general");

  const sidebar = (
    <Sidebar
      ariaLabel="会計アプリのメインナビゲーション"
      activeId={activeId}
      collapsed={collapsed}
      onSelect={setActiveId}
      sections={FULL_SECTIONS}
      aria-label="ドッキングサイドバーのナビゲーション"
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
          <Avatar className="rounded-md">
            <AvatarFallback className="bg-primary text-primary-foreground font-bold">
              C
            </AvatarFallback>
          </Avatar>
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
              <CardTitle level={2}>現在の状態</CardTitle>
              <CardDescription>
                左のレールに渡している sections prop の現在のアクティブ項目
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary">{activeId}</Badge>
            </CardContent>
          </Card>

          {/* brand prop · replaces the product chip with a fully custom header (SidebarHeader). */}
          <Card>
            <CardHeader>
              <CardTitle level={2}>brand プロップ</CardTitle>
              <CardDescription>
                product チップの代わりに SidebarHeader で完全に自作したヘッダーを差し込みます。
                brand と product は排他です。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-card flex h-80 w-64 flex-col overflow-hidden rounded-lg border">
                <Sidebar
                  ariaLabel="ブランド例のナビゲーション"
                  activeId={brandActiveId}
                  onSelect={setBrandActiveId}
                  sections={BRAND_SECTIONS}
                  aria-label="brand プロップ例のナビゲーション"
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

          {/* linkComponent prop · THE router-link contract (gh#213) — library composes the row. */}
          <Card>
            <CardHeader>
              <CardTitle level={2}>linkComponent プロップ（ルーターリンク）</CardTitle>
              <CardDescription>
                フレームワークのルーター Link を渡すだけ。行の中身（アイコン・ラベル・バッジ・
                アクティブ状態・折りたたみレール）は ライブラリ側が組み立てて children
                として渡すので、 利用側が行マークアップを再実装することはありません。React Router /
                TanStack は createSidebarLink(Link, &quot;to&quot;)、Inertia / Next.js は
                createSidebarLink(Link)（または @godxjp/ui/inertia の
                inertiaSidebarLink(Link)）を使います。 左は展開、右は折りたたみレールです。
                どちらも同じ Link のままアイコンが残ります。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Flex gap="md" wrap>
                <div className="bg-card flex h-72 w-64 flex-col overflow-hidden rounded-lg border">
                  <Sidebar
                    ariaLabel="ルーターリンク行のナビゲーション"
                    activeId={routedActiveId}
                    onSelect={setRoutedActiveId}
                    sections={ROUTED_SECTIONS}
                    linkComponent={RouterLink}
                    aria-label="linkComponent プロップ例のナビゲーション（展開）"
                  />
                </div>
                <div className="bg-card flex h-72 w-16 flex-col overflow-hidden rounded-lg border">
                  <Sidebar
                    ariaLabel="折りたたみレールのルーターリンク"
                    activeId={routedActiveId}
                    onSelect={setRoutedActiveId}
                    sections={ROUTED_SECTIONS}
                    linkComponent={RouterLink}
                    collapsed
                    aria-label="linkComponent プロップ例のナビゲーション（折りたたみ）"
                  />
                </div>
              </Flex>
            </CardContent>
          </Card>

          {/* renderItem prop · DEPRECATED escape hatch (gh#213) — kept for back-compat. */}
          <Card>
            <CardHeader>
              <CardTitle level={2}>renderItem プロップ（非推奨）</CardTitle>
              <CardDescription>
                行の中身まで利用側が書く旧エスケープハッチ。これが原因で
                <code>&lt;Link&gt;{"{item.label}"}&lt;/Link&gt;</code>
                がアイコンを全て落とす回帰が発生しました（gh#213）。 現在は rowProps.children
                にライブラリ製の行内容が入るので、それを描画すれば 正規の行が復元されます（ここでは
                その右にお気に入りスターを添えています）。 新規コードでは linkComponent か
                SidebarItem asChild を使ってください。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-card flex h-72 w-64 flex-col overflow-hidden rounded-lg border">
                <Sidebar
                  ariaLabel="カスタム行例のナビゲーション"
                  activeId={renderActiveId}
                  onSelect={setRenderActiveId}
                  sections={FAVOURITE_SECTIONS}
                  renderItem={(item, rowProps) =>
                    renderFavouriteRow(item, rowProps, setRenderActiveId)
                  }
                  aria-label="renderItem プロップ例のナビゲーション"
                />
              </div>
            </CardContent>
          </Card>

          {/* children prop · full nav override: compose SidebarSection / SidebarItem directly. */}
          <Card>
            <CardHeader>
              <CardTitle level={2}>children プロップ（ナビ全体の差し替え）</CardTitle>
              <CardDescription>
                sections を使わず SidebarSection / SidebarItem を直接組み立てて、
                ナビゲーション全体を 自前で構成します。右は同じ構成に SidebarItem の asChild
                を足したものです。子として ルーターの Link
                を「要素だけ」渡すと、アイコン・ラベル・バッジは ライブラリが差し込みます（gh#213。
                children は書きません）。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Flex gap="md" wrap>
                <div className="bg-card flex h-64 w-64 flex-col overflow-hidden rounded-lg border">
                  <Sidebar
                    ariaLabel="構成可能な例のナビゲーション"
                    activeId={composedActiveId}
                    onSelect={setComposedActiveId}
                  >
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
                <div className="bg-card flex h-64 w-64 flex-col overflow-hidden rounded-lg border">
                  <Sidebar
                    ariaLabel="asChild 例のナビゲーション"
                    activeId={composedActiveId}
                    onSelect={setComposedActiveId}
                    aria-label="SidebarItem asChild 例のナビゲーション"
                  >
                    <SidebarSection label="お気に入り（asChild）">
                      {COMPOSED_ITEMS.map((item) => (
                        <SidebarItem
                          key={item.id}
                          item={item}
                          active={composedActiveId === item.id}
                          onActivate={setComposedActiveId}
                          asChild
                        >
                          <Link to={item.href ?? "/"} />
                        </SidebarItem>
                      ))}
                    </SidebarSection>
                  </Sidebar>
                </div>
              </Flex>
            </CardContent>
          </Card>

          {/* badgeTone · 未読（中立）と「自分宛て」（強調）を一本の軸で分ける。 */}
          <Card>
            <CardHeader>
              <CardTitle level={2}>badgeTone プロップ（未読と自分宛ての区別）</CardTitle>
              <CardDescription>
                行のカウントが「未読」なのか「自分宛て（メンション・DM）」なのかを badgeTone
                で表します。既定の neutral は従来のピルとバイト単位で同一で、
                属性すら出しません。destructive のときだけ data-tone が付き、
                --sidebar-badge-destructive-background / -foreground を読みます。 badge
                には数値や文字列だけを渡してください · そこに &lt;Badge&gt; を入れると .sb-badge
                の中にもう一枚ピルが入って丸が二重になります（実測 37.11×19.14 の 中に
                25.11×19.14）。 色は 2 トークンだけが動き、ピルの高さも角丸も左右余白も
                共通なので、未読行とメンション行は同じ列に揃ったままです。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-card flex h-64 w-64 flex-col overflow-hidden rounded-lg border">
                <Sidebar
                  ariaLabel="チャンネル一覧のナビゲーション"
                  activeId={mentionActiveId}
                  onSelect={setMentionActiveId}
                  sections={MENTION_SECTIONS}
                  aria-label="badgeTone 例のナビゲーション"
                />
              </div>
            </CardContent>
          </Card>

          {/* Nav colour tokens · icon and label are themed SEPARATELY (gh#228). */}
          <Card>
            <CardHeader>
              <CardTitle level={2}>ナビの配色トークン（アイコンとラベルを別々に）</CardTitle>
              <CardDescription>
                行（ラベル）は --sidebar-nav-item-foreground、アイコンは
                --sidebar-nav-icon-foreground を読みます。 既定値は従来どおり（どちらも
                --muted-foreground）。 テーマ側でアイコンだけ濃くすれば、muted
                テキスト全体の色を変えずに キャンバス基準の 16px
                アイコンに揃えられます（ホバー/アクティブ/無効の各状態にも 対応トークンあり）。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Flex gap="md" wrap>
                <div className="bg-card flex h-64 w-64 flex-col overflow-hidden rounded-lg border">
                  <Sidebar
                    ariaLabel="既定の配色のナビゲーション"
                    activeId={tokenActiveId}
                    onSelect={setTokenActiveId}
                    sections={FAVOURITE_SECTIONS}
                    aria-label="既定の配色（アイコンは行の色を継承）"
                  />
                </div>
                <div
                  className="bg-card flex h-64 w-64 flex-col overflow-hidden rounded-lg border"
                  style={CANONICAL_NAV_TOKENS}
                >
                  <Sidebar
                    ariaLabel="アイコンを濃くしたナビゲーション"
                    activeId={tokenActiveId}
                    onSelect={setTokenActiveId}
                    sections={FAVOURITE_SECTIONS}
                    aria-label="トークン上書き（アイコンのみ --foreground）"
                  />
                </div>
              </Flex>
            </CardContent>
          </Card>

          {/* Feature notes */}
          <Card>
            <CardHeader>
              <CardTitle level={2}>主な機能</CardTitle>
            </CardHeader>
            <CardContent>
              <Flex direction="col" gap="sm" className="text-sm">
                {[
                  "product chip · name / role（エンティティ名）/ color",
                  "collapsed=true でアイコンのみのレール表示に切替",
                  "children[] を持つ item は自動で折りたたみグループになる",
                  "activeId が子孫にマッチすると親グループが自動展開",
                  "badge prop で件数バッジをアイテムに付与可能（中身は数値・文字列のみ）",
                  "badgeTone で未読（neutral）と自分宛て（destructive）を色だけで区別",
                  "disabled=true で項目を非活性化（クリック不可）",
                  "footer prop でスクロール外にユーザー情報を固定",
                  "linkComponent · ルーター Link は「要素だけ」渡す。行の中身はライブラリが組み立てる（gh#213）",
                  "linkComponent は葉・サブメニュー・折りたたみレール・フライアウトの全てに適用される",
                  "グループのトリガーは aria-expanded を持つ開閉ボタンのままなので linkComponent は適用されない",
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
