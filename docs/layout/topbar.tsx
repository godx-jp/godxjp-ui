import { useState } from "react";
import { AppShell, Flex, PageContainer, Sidebar, Topbar } from "@godxjp/ui/layout";
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
import { Button, Logo, Text } from "@godxjp/ui/general";
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
 * Topbar — a PURE SLOT bar. The shell only positions `start` / `center` / `end`; the CONSUMER
 * composes every control. This demo builds the chrome the OLD baked Topbar used to force —
 * sidebar toggle, brand Logo, an entity switcher, a search trigger, a notifications button, a
 * user menu — entirely from real primitives, so you can see there is no hidden template (and no
 * dead dropdown: a control exists ONLY because it's placed here).
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

export default function Demo() {
  const [activeId, setActiveId] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [activeEntity, setActiveEntity] = useState(ENTITIES[0]);
  const [unread, setUnread] = useState(true);
  const [searchOpenCount, setSearchOpenCount] = useState(0);

  // start cluster — sidebar toggle + brand Logo + an entity switcher the consumer owns.
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
      <Logo label="CoreBooks" glyph="C" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            {activeEntity.name}
            <ChevronDown />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuLabel>エンティティ切替</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {ENTITIES.map((e) => (
            <DropdownMenuItem key={e.id} onSelect={() => setActiveEntity(e)}>
              <Building2 className="mr-2 size-4" />
              {e.name}
              {activeEntity.id === e.id ? (
                <Badge variant="secondary" className="ml-auto text-xs">
                  現在
                </Badge>
              ) : null}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );

  // center — a search trigger (opens YOUR command palette). No baked search box.
  const center = (
    <Button
      variant="outline"
      size="sm"
      className="text-muted-foreground w-full max-w-sm justify-start"
      onClick={() => setSearchOpenCount((n) => n + 1)}
    >
      <Search />
      検索…
    </Button>
  );

  // end — notifications + user menu, both consumer-composed.
  const end = (
    <>
      <Badge tone="warning" className="text-xs">
        ステージング
      </Badge>
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
            <UserRound className="mr-2 size-4" />
            プロフィール
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 size-4" />
            アカウント設定
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <LogOut className="mr-2 size-4" />
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
        subtitle="slot bar — start / center / end をすべて consumer が組み立てる（焼き込みなし）"
        breadcrumb={[{ label: "ホーム", to: "/" }, { label: "Topbar デモ" }]}
      >
        <Flex direction="col" gap="lg">
          <Card>
            <CardHeader>
              <CardTitle>現在の状態</CardTitle>
              <CardDescription>
                各コントロールは props ではなく slot
                に置いた実コンポーネント。操作すると更新されます。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Flex direction="col" gap="sm" className="text-sm">
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
              <CardTitle>Topbar は3つの slot だけ</CardTitle>
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
                    desc: "サイドバートグル + Logo + エンティティ切替（DropdownMenu）",
                  },
                  { prop: "center", desc: "検索トリガー（Button）。コマンドパレットを開く" },
                  { prop: "end", desc: "通知ボタン + ユーザーメニュー（DropdownMenu）" },
                  { prop: "children", desc: "3 slot を使わず完全カスタムにする場合の逃げ道" },
                ].map(({ prop, desc }) => (
                  <Flex key={prop} align="start" gap="sm">
                    <code className="bg-muted shrink-0 rounded px-1.5 py-0.5 font-mono text-xs">
                      {prop}
                    </code>
                    <Text tone="muted">{desc}</Text>
                  </Flex>
                ))}
              </Flex>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>状態リセット</CardTitle>
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
        </Flex>
      </PageContainer>
    </AppShell>
  );
}
