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
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@godxjp/ui/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  Bell,
  Search,
  PanelLeft,
  Building2,
  Folder,
} from "lucide-react";

/**
 * Topbar — app-shell top bar.
 * Focus: product chip, project chip, productMenu entity switcher, onSearchOpen,
 * onToggleCollapsed, unread notifications badge, rightSlot, user slot.
 * Composed only from real @godxjp/ui components inside an AppShell frame.
 */

const SECTIONS: SidebarSectionProp[] = [
  {
    label: "会計",
    items: [
      { id: "dashboard", label: "ダッシュボード", icon: LayoutDashboard },
      { id: "journal", label: "仕訳", icon: FileText },
    ],
  },
  {
    label: "管理",
    items: [{ id: "users", label: "ユーザー", icon: Users }],
  },
];

const ENTITIES = [
  { id: "acme", name: "株式会社アクメ" },
  { id: "globex", name: "グローバル商事株式会社" },
  { id: "initech", name: "イニテック有限会社" },
] as const;

const PROJECTS = [
  { id: "fy2026", name: "FY2026 決算" },
  { id: "audit", name: "外部監査対応" },
  { id: "recon", name: "月次照合" },
] as const;

export default function Demo() {
  const [activeId, setActiveId] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [activeEntity, setActiveEntity] = useState(ENTITIES[0]);
  const [activeProject, setActiveProject] = useState<(typeof PROJECTS)[number] | null>(PROJECTS[0]);
  const [unread, setUnread] = useState(true);
  const [searchOpenCount, setSearchOpenCount] = useState(0);

  const topbar = (
    <Topbar
      product={{ name: "CoreBooks", color: "hsl(220 70% 50%)" }}
      productMenu={
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuLabel>エンティティ切替</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {ENTITIES.map((e) => (
            <DropdownMenuItem key={e.id} onSelect={() => setActiveEntity(e)}>
              <Building2 className="mr-2 size-4" />
              {e.name}
              {activeEntity.id === e.id && (
                <Badge variant="secondary" className="ml-auto text-xs">
                  現在
                </Badge>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      }
      project={activeProject}
      projectMenu={
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>プロジェクト切替</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {PROJECTS.map((p) => (
            <DropdownMenuItem key={p.id} onSelect={() => setActiveProject(p)}>
              <Folder className="mr-2 size-4" />
              {p.name}
              {activeProject?.id === p.id && (
                <Badge variant="secondary" className="ml-auto text-xs">
                  選択中
                </Badge>
              )}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setActiveProject(null)}>
            プロジェクト選択解除
          </DropdownMenuItem>
        </DropdownMenuContent>
      }
      collapsed={collapsed}
      onToggleCollapsed={() => setCollapsed((c) => !c)}
      onSearchOpen={() => setSearchOpenCount((n) => n + 1)}
      unread={unread}
      onNotificationsOpen={() => setUnread(false)}
      rightSlot={
        <Badge variant="warning" className="text-xs">
          ステージング
        </Badge>
      }
    />
  );

  const sidebar = (
    <Sidebar
      activeId={activeId}
      collapsed={collapsed}
      onSelect={setActiveId}
      sections={SECTIONS}
      product={{ name: "CoreBooks", role: activeEntity.name, color: "hsl(220 70% 50%)" }}
    />
  );

  return (
    <AppShell sidebar={sidebar} topbar={topbar} sidebarCollapsed={collapsed}>
      <PageContainer
        title="Topbar デモ"
        subtitle="product/project chips · switcher menu · search · notifications · collapse"
        breadcrumb={[{ label: "ホーム", to: "/" }, { label: "Topbar デモ" }]}
      >
        <Flex direction="col" gap="lg">
          {/* Live state display */}
          <Card>
            <CardHeader>
              <CardTitle>現在の Topbar 状態</CardTitle>
              <CardDescription>
                Topbar の各コントロールを操作するとこの表示が更新されます。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Flex direction="col" gap="sm" className="text-sm">
                <Flex align="center" gap="md">
                  <Building2 className="text-muted-foreground size-4" />
                  <span className="text-muted-foreground">アクティブエンティティ</span>
                  <Badge variant="secondary">{activeEntity.name}</Badge>
                </Flex>
                <Flex align="center" gap="md">
                  <Folder className="text-muted-foreground size-4" />
                  <span className="text-muted-foreground">アクティブプロジェクト</span>
                  <Badge variant={activeProject ? "secondary" : "outline"}>
                    {activeProject ? activeProject.name : "未選択（チップ非表示）"}
                  </Badge>
                </Flex>
                <Flex align="center" gap="md">
                  <PanelLeft className="text-muted-foreground size-4" />
                  <span className="text-muted-foreground">サイドバー</span>
                  <Badge variant={collapsed ? "warning" : "success"}>
                    {collapsed ? "折りたたみ" : "展開中"}
                  </Badge>
                </Flex>
                <Flex align="center" gap="md">
                  <Bell className="text-muted-foreground size-4" />
                  <span className="text-muted-foreground">通知バッジ</span>
                  <Badge variant={unread ? "destructive" : "outline"}>
                    {unread ? "未読あり" : "なし"}
                  </Badge>
                </Flex>
                <Flex align="center" gap="md">
                  <Search className="text-muted-foreground size-4" />
                  <span className="text-muted-foreground">検索を開いた回数</span>
                  <Badge variant="info">{searchOpenCount}</Badge>
                </Flex>
              </Flex>
            </CardContent>
          </Card>

          {/* Feature notes */}
          <Card>
            <CardHeader>
              <CardTitle>Topbar の主要 props</CardTitle>
            </CardHeader>
            <CardContent>
              <Flex direction="col" gap="sm" className="text-sm">
                {[
                  {
                    prop: "product + productMenu",
                    desc: "product chip をエンティティ切替ドロップダウンに変換",
                  },
                  {
                    prop: "project + projectMenu",
                    desc: "project chip をプロジェクト切替メニューに変換（両方 null で非表示）",
                  },
                  {
                    prop: "onToggleCollapsed + collapsed",
                    desc: "サイドバー折りたたみトグル（Sidebar.collapsed と同期必須）",
                  },
                  {
                    prop: "onSearchOpen",
                    desc: "検索バーボタン（⌘K）クリック時のコールバック",
                  },
                  {
                    prop: "unread + onNotificationsOpen",
                    desc: "通知ベルと未読ドット（unread=true で赤ドット表示）",
                  },
                  {
                    prop: "rightSlot",
                    desc: "検索バーと通知ベルの間に任意コンテンツを挿入",
                  },
                ].map(({ prop, desc }) => (
                  <Flex key={prop} align="start" gap="sm">
                    <code className="bg-muted shrink-0 rounded px-1.5 py-0.5 font-mono text-xs">
                      {prop}
                    </code>
                    <span className="text-muted-foreground">{desc}</span>
                  </Flex>
                ))}
              </Flex>
            </CardContent>
          </Card>

          {/* Reset controls */}
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
                  <PanelLeft />
                  サイドバーを展開
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setActiveEntity(ENTITIES[0]);
                    setActiveProject(PROJECTS[0]);
                  }}
                >
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
