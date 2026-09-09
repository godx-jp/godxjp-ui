import { useState } from "react";
import { AppShell, Flex, PageContainer, Sidebar, Topbar, TopbarItem } from "@godxjp/ui/layout";
import type { SidebarSectionProp } from "@godxjp/ui/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Button, Text } from "@godxjp/ui/general";
import {
  Building2,
  Hash,
  LayoutDashboard,
  MessagesSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Users,
} from "lucide-react";

/**
 * AppShell · column arrangements.
 *
 * THE SHELL HAS TWO INDEPENDENT GEOMETRY AXES, and this page exists so they can be seen next to
 * each other rather than rediscovered:
 *
 *   - `topbarSpan` — how far the BAR reaches. "content" starts it beside the sidebar (the rail
 *     runs the full window height); "full" runs it edge to edge with the navigation beneath it.
 *   - `navRail`    — how many navigation COLUMNS there are. Passing the slot adds a second,
 *     narrower track before the sidebar: the workspace/organization switcher shape.
 *
 * They are axes, not a preset list. All four combinations are real product shapes, so there is no
 * invalid pairing and nothing to reconcile — which is why the rail is a SLOT and not a fourth
 * value bolted onto `topbarSpan`.
 *
 * Composed only from real @godxjp/ui components.
 */

const WORKSPACE_RAIL: SidebarSectionProp[] = [
  {
    items: [
      { id: "home", label: "ホーム", icon: LayoutDashboard },
      { id: "chat", label: "チャット", icon: MessagesSquare },
      { id: "people", label: "メンバー", icon: Users },
      { id: "admin", label: "管理", icon: Settings },
    ],
  },
];

const CHANNELS: SidebarSectionProp[] = [
  {
    label: "チャンネル",
    items: [
      { id: "general", label: "general", icon: Hash },
      { id: "design", label: "design", icon: Hash },
      { id: "incident", label: "incident-2026", icon: Hash },
    ],
  },
  {
    label: "ダイレクトメッセージ",
    items: [
      { id: "dm-sato", label: "佐藤 花子", icon: Users },
      { id: "dm-tanaka", label: "田中 一郎", icon: Users },
    ],
  },
];

export default function Demo() {
  const [withRail, setWithRail] = useState(true);
  const [fullSpan, setFullSpan] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // The rail is ordinary navigation, so it is an ordinary <Sidebar> in icon-only mode — the shell
  // owns the TRACK, never the content that goes in it.
  const rail = (
    <Sidebar aria-label="ワークスペース" activeId="chat" collapsed sections={WORKSPACE_RAIL} />
  );

  return (
    <AppShell
      topbarSpan={fullSpan ? "full" : "content"}
      navRail={withRail ? rail : undefined}
      navRailLabel="ワークスペース"
      sidebarCollapsed={collapsed}
      logo={
        <Flex align="center" gap="sm">
          <Building2 aria-hidden="true" />
          <Text weight="medium">CoreChat</Text>
        </Flex>
      }
      sidebar={
        <Sidebar
          aria-label="チャンネル"
          activeId="general"
          collapsed={collapsed}
          sections={CHANNELS}
        />
      }
      topbar={
        <Topbar
          start={
            // A bar cell is a TopbarItem, not a Button: a Button in a bar is a --control-height
            // pill floating in a taller strip, with its own hover fill and its own focus ring.
            <TopbarItem
              aria-label={collapsed ? "サイドバーを開く" : "サイドバーを閉じる"}
              aria-expanded={!collapsed}
              onClick={() => setCollapsed((c) => !c)}
            >
              {collapsed ? (
                <PanelLeftOpen aria-hidden="true" />
              ) : (
                <PanelLeftClose aria-hidden="true" />
              )}
            </TopbarItem>
          }
        />
      }
    >
      <PageContainer
        title="列の構成"
        subtitle={`${withRail ? "3 列" : "2 列"} · topbarSpan="${fullSpan ? "full" : "content"}"${
          collapsed ? " · 折りたたみ" : ""
        }`}
        extra={
          <Flex gap="sm">
            <Button
              size="sm"
              variant={withRail ? "default" : "outline"}
              aria-pressed={withRail}
              onClick={() => setWithRail((v) => !v)}
            >
              navRail
            </Button>
            <Button
              size="sm"
              variant={fullSpan ? "default" : "outline"}
              aria-pressed={fullSpan}
              onClick={() => setFullSpan((v) => !v)}
            >
              topbarSpan=full
            </Button>
            <Button
              size="sm"
              variant={collapsed ? "default" : "outline"}
              aria-pressed={collapsed}
              onClick={() => setCollapsed((v) => !v)}
            >
              折りたたみ
            </Button>
          </Flex>
        }
      >
        <Flex direction="col" gap="lg">
          <Card>
            <CardHeader>
              <CardTitle level={2}>2 本の軸は独立している</CardTitle>
              <CardDescription>
                上の 3 つのボタンは互いに干渉しない。<code>navRail</code> は「ナビゲーションの列が
                何本か」を、<code>topbarSpan</code> は「バーがどこまで伸びるか」を答える別々の軸で、
                4 通りの組み合わせはすべて実在するプロダクトの形なので、禁止すべき組み合わせは
                存在しない。だから rail は <code>topbarSpan</code> に足した 4 つ目の値ではなく
                スロットとして実装されている ― プリセット名を 4 つ覚える API にはしない。
              </CardDescription>
              <CardDescription>
                列幅はすべてトークン。<code>--app-shell-nav-rail-width</code>（4rem）が rail、
                <code>--app-shell-sidebar-width</code>（16rem）がサイドバー、
                <code>--app-shell-sidebar-collapsed-width</code>（4rem）が折りたたみ時の
                サイドバー。3 つ目は 19.x では <code>--app-shell-rail-width</code> という名前で、
                20.0.0 で追加された本物の rail と正面衝突した ― 同じ 4rem、同じ「rail」の綴り、
                意味は別物。エイリアスを残さず改名したのは、どちらの読み方でも
                もっともらしい幅に解決してしまい、静かに壊れるため。
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle level={2}>折りたたみは 1 本の列だけを畳む</CardTitle>
              <CardDescription>
                「折りたたみ」を押すと、サイドバーの列だけが 16rem → 4rem になり、rail
                は幅を保つ。Slack の挙動であり、折りたたみ中も rail
                の行き先に手が届き続ける唯一の形。 rail まで一緒に畳むと、意味の分からない
                アイコンの帯が 2 本並ぶだけになる。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Flex direction="col" gap="sm">
                <Flex justify="between">
                  <Text tone="muted">rail</Text>
                  <Text mono>{withRail ? "4rem（固定）" : "—"}</Text>
                </Flex>
                <Flex justify="between">
                  <Text tone="muted">sidebar</Text>
                  <Text mono>{collapsed ? "4rem" : "16rem"}</Text>
                </Flex>
                <Flex justify="between">
                  <Text tone="muted">コンテンツ左端</Text>
                  <Text mono>
                    {withRail ? (collapsed ? "128px" : "320px") : collapsed ? "64px" : "256px"}
                  </Text>
                </Flex>
              </Flex>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle level={2}>900px 以下では両方の列が消える</CardTitle>
              <CardDescription>
                Frame の Dimensions を 900px 以下にすると、rail とサイドバーの両方が隠れ、
                AppShell 所有のドロワーが navigation を引き受ける。 rail
                を渡している場合、ドロワーの既定値は「rail のあとにサイドバー」になる ―
                両方の列が隠れる幅で <code>sidebar</code> だけを既定にすると、rail
                が運んでいるアプリ階層の行き先が 端末によって存在したりしなかったりする。
                いくつかの画面幅にしか無いコントロールは、コントロールではなく罠。
              </CardDescription>
              <CardDescription>
                グリッドのテンプレートから領域名が消えるだけでは要素は消えない ―
                実測では、狭幅テンプレートを当てて <code>.app-sidebar</code> だけを隠した状態で
                rail が暗黙の列に自動配置され、33×168px の断片としてページ本文の上に残った。
                だから狭幅ブロックは rail を明示的に隠す。
              </CardDescription>
            </CardHeader>
          </Card>
        </Flex>
      </PageContainer>
    </AppShell>
  );
}
