import { useState } from "react";
import { AppShell, Flex, PageContainer, Sidebar, Topbar, TopbarItem } from "@godxjp/ui/layout";
import type { SidebarSectionProp } from "@godxjp/ui/layout";
import {
  Avatar,
  AvatarFallback,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
  Bell,
  Building2,
  ChevronDown,
  FileText,
  LayoutDashboard,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  UserRound,
  Users,
} from "lucide-react";

/**
 * Topbar · a PURE SLOT bar. The shell only positions `start` / `center` / `end`; the CONSUMER
 * composes every control.
 */
const SECTIONS: SidebarSectionProp[] = [
  {
    label: "会計",
    items: [
      { id: "dashboard", label: "ダッシュボード", icon: LayoutDashboard },
      { id: "journal", label: "仕訳", icon: FileText },
    ],
  },
  { label: "管理", items: [{ id: "users", label: "ユーザー", icon: Users }] },
];

const ENTITIES = [
  { id: "acme", name: "株式会社アクメ" },
  { id: "globex", name: "グローバル商事株式会社" },
  { id: "initech", name: "イニテック有限会社" },
] as const;

const TOPBAR_COPY = {
  ja: {
    screenTitle: "組織セキュリティと認証ポリシーの管理",
    search: "ユーザー、組織、監査イベントを検索…",
  },
  en: {
    screenTitle: "Organization security and authentication policy administration",
    search: "Search users, organizations, and audit events…",
  },
  vi: {
    screenTitle: "Quản trị chính sách bảo mật và xác thực của tổ chức",
    search: "Tìm người dùng, tổ chức và sự kiện kiểm toán…",
  },
} as const;

type DemoLocale = keyof typeof TOPBAR_COPY;

export default function Demo() {
  const [activeId, setActiveId] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [activeEntity, setActiveEntity] = useState<(typeof ENTITIES)[number]>(ENTITIES[0]);
  const [unread, setUnread] = useState(true);
  const [searchOpenCount, setSearchOpenCount] = useState(0);
  const [locale, setLocale] = useState<DemoLocale>("ja");
  const topbarCopy = TOPBAR_COPY[locale];

  // start cluster · sidebar toggle + brand mark (Avatar) + an entity switcher the consumer owns.
  const start = (
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
      {/* Decorative mark — hidden below sm so the budget goes to the two real controls. */}
      <Avatar className="rounded-md">
        <AvatarFallback className="bg-primary text-primary-foreground font-bold">C</AvatarFallback>
      </Avatar>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {/* Button ships `shrink-0`, and only the LAST child of the start slot gets the built-in
              truncation contract — so a switcher sitting mid-slot has to be told it may shrink, or
              it keeps its full width and the slot clips it while it stays focusable. `flex-1
              min-w-11` below sm lets it take just the leftover room without ever dropping under
              the 44px touch floor — plain `min-w-0` let flex hand it 20px, which is under the 24px
              SC 2.5.8 minimum, trading one failure for another. `truncate` puts the ellipsis on
              the label rather than letting it spill. */}
          <Button variant="ghost" size="sm" className="min-w-11 flex-1 sm:min-w-0 sm:flex-none">
            <span className="truncate">{activeEntity.name}</span>
            <ChevronDown />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuLabel>エンティティ切替</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {ENTITIES.map((e) => (
            <DropdownMenuItem key={e.id} onSelect={() => setActiveEntity(e)}>
              <Building2 className="size-4" />
              {e.name}
              {activeEntity.id === e.id ? (
                <Badge variant="secondary" className="ms-auto text-xs">
                  現在
                </Badge>
              ) : null}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <Text data-demo-topbar-title="" title={topbarCopy.screenTitle} weight="medium">
        {topbarCopy.screenTitle}
      </Text>
    </>
  );

  // center · a search trigger (opens YOUR command palette). No baked search box.
  const center = (
    <Button
      variant="outline"
      size="sm"
      className="text-muted-foreground w-full max-w-sm justify-start"
      onClick={() => setSearchOpenCount((n) => n + 1)}
    >
      <Search />
      {topbarCopy.search}
    </Button>
  );

  // end · notifications + user menu, both consumer-composed.
  const end = (
    <>
      {}
      <Badge tone="warning" className="text-xs">
        ステージング
      </Badge>
      <TopbarItem
        aria-label="通知"
        badge={unread ? 12 : undefined}
        badgeTone="destructive"
        onClick={() => setUnread(false)}
      >
        <Bell />
      </TopbarItem>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label="アカウントメニュー">
            <Avatar className="size-7">
              <AvatarFallback>佐藤</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>佐藤 花子</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <UserRound className="size-4" />
            プロフィール
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="size-4" />
            アカウント設定
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <LogOut className="size-4" />
            ログアウト
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );

  const sidebar = (
    <Sidebar
      activeId={activeId}
      collapsed={collapsed}
      onSelect={setActiveId}
      sections={SECTIONS}
      product={{ name: "CoreBooks", role: activeEntity.name, color: "hsl(220 70% 50%)" }}
      onProductClick={() => undefined}
    />
  );

  return (
    <AppShell
      sidebar={sidebar}
      topbar={<Topbar start={start} center={center} end={end} />}
      sidebarCollapsed={collapsed}
    >
      <PageContainer
        title="Topbar デモ"
        subtitle="slot bar · start / center / end をすべて consumer が組み立てる（焼き込みなし）"
        breadcrumb={[{ label: "ホーム", to: "/" }, { label: "Topbar デモ" }]}
      >
        <Flex direction="col" gap="lg">
          <Card>
            <CardHeader>
              <CardTitle level={2}>現在の状態</CardTitle>
              <CardDescription>
                各コントロールは props ではなく slot
                に置いた実コンポーネント。操作すると更新されます。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Flex direction="col" gap="sm" className="text-sm">
                <Flex aria-label="Preview locale" gap="sm" wrap>
                  {(["ja", "en", "vi"] as const).map((language) => (
                    <Button
                      key={language}
                      size="sm"
                      variant="outline"
                      aria-pressed={locale === language}
                      onClick={() => setLocale(language)}
                    >
                      {language.toUpperCase()}
                    </Button>
                  ))}
                </Flex>
                <Flex align="center" gap="md">
                  <Building2 className="text-muted-foreground size-4" />
                  <Text tone="muted">アクティブエンティティ</Text>
                  <Badge variant="secondary">{activeEntity.name}</Badge>
                </Flex>
                <Flex align="center" gap="md">
                  <Bell className="text-muted-foreground size-4" />
                  <Text tone="muted">通知バッジ</Text>
                  <Badge tone={unread ? "destructive" : "neutral"} icon={null}>
                    {unread ? "未読あり" : "なし"}
                  </Badge>
                </Flex>
                <Flex align="center" gap="md">
                  <Search className="text-muted-foreground size-4" />
                  <Text tone="muted">検索を開いた回数</Text>
                  <Badge tone="info" icon={null}>
                    {searchOpenCount}
                  </Badge>
                </Flex>
              </Flex>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle level={2}>Topbar は3つの slot だけ</CardTitle>
              <CardDescription>
                start / center / end。中身（ブランド・ナビ・検索・言語切替・ユーザーメニュー）は
                すべて consumer が決める。アイコンのみ／ラベル付き／枠線あり等は各コンポーネントの
                props であって、シェルが強制するものではない。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Flex direction="col" gap="sm" className="text-sm">
                {[
                  {
                    prop: "start",
                    desc: "サイドバートグル + ブランドマーク（Avatar）+ エンティティ切替（DropdownMenu）",
                  },
                  { prop: "center", desc: "検索トリガー（Button）。コマンドパレットを開く" },
                  { prop: "end", desc: "通知ボタン + ユーザーメニュー（DropdownMenu）" },
                  { prop: "children", desc: "3 slot を使わず完全カスタムにする場合の逃げ道" },
                ].map(({ prop, desc }) => (
                  <Flex key={prop} align="start" gap="sm">
                    <Badge variant="secondary" className="shrink-0">
                      {prop}
                    </Badge>
                    <Text tone="muted">{desc}</Text>
                  </Flex>
                ))}
              </Flex>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle level={2}>状態リセット</CardTitle>
            </CardHeader>
            <CardContent>
              <Flex gap="sm" wrap>
                <Button size="sm" variant="outline" onClick={() => setUnread(true)}>
                  <Bell />
                  通知をリセット
                </Button>
                <Button size="sm" variant="outline" onClick={() => setCollapsed(false)}>
                  <PanelLeftOpen />
                  サイドバーを展開
                </Button>
                <Button size="sm" variant="outline" onClick={() => setActiveEntity(ENTITIES[0])}>
                  初期値に戻す
                </Button>
              </Flex>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle level={2}>320px stress · 長いローカライズ内容</CardTitle>
              <CardDescription>
                1100px 以下では package-owned contract が center slot を隠し、start の最後の
                ラベルを ellipsis で切り詰めて end utilities を保護する。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Card className="max-w-80 overflow-hidden">
                <CardContent>
                  <Topbar
                    start={<Text weight="medium">株式会社とても長い組織名称</Text>}
                    center={<Button variant="outline">すべての取引を検索</Button>}
                    end={<Button variant="ghost">山田 太郎 システム管理者</Button>}
                  />
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </Flex>
      </PageContainer>
    </AppShell>
  );
}
