import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@godxjp/ui/data-display";
import { Button } from "@godxjp/ui/general";
import {
  Flex,
  PageContainer,
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@godxjp/ui/layout";
import { GripHorizontal, GripVertical, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import * as React from "react";
import type { Layout, PanelImperativeHandle } from "react-resizable-panels";

/**
 * ResizablePanel — react-resizable-panels v4 compound primitive exported as
 * ResizablePanelGroup / ResizablePanel / ResizableHandle. Always compose:
 * ResizablePanelGroup wraps panels+handles; ResizableHandle sits between panels;
 * ResizablePanel holds content. Group orientation is set with orientation
 * ("horizontal" | "vertical"). minSize/maxSize prevent zero-collapse; collapsible
 * + collapsedSize enable collapse-to-zero; defaultLayout + onLayoutChanged persist
 * sizes. Composed only from real @godxjp/ui components.
 */
export default function Demo() {
  return (
    <PageContainer
      title="ResizablePanel"
      subtitle="ResizablePanelGroup + ResizablePanel + ResizableHandle — サイズ変更可能な分割レイアウト"
    >
      <Flex direction="col" gap="lg">
        <HorizontalCard />
        <VerticalCard />
        <CollapsibleCard />
        <PersistenceCard />
        <DisabledCard />
        <ThreePaneCard />
      </Flex>
    </PageContainer>
  );
}

const frameStyle: React.CSSProperties = {
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-md)",
  overflow: "hidden",
};

/** orientation="horizontal" (default) — list + detail master/detail layout. */
function HorizontalCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>水平分割 — リスト + 詳細</CardTitle>
        <CardDescription>
          orientation=&quot;horizontal&quot;（既定）。ResizableHandle
          をパネル間に配置。minSize でゼロ崩壊を防ぐ。ハンドルをダブルクリックすると defaultSize
          に戻る。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ height: "16rem", ...frameStyle }}>
          <ResizablePanelGroup orientation="horizontal">
            <ResizablePanel id="list-panel" defaultSize={35} minSize={20} maxSize={60}>
              <Flex
                direction="col"
                gap="sm"
                style={{ padding: "1rem", height: "100%", overflowY: "auto" }}
              >
                <span className="text-muted-foreground text-xs font-medium">請求書リスト</span>
                {[
                  { id: "INV-2024-001", label: "株式会社アルファ", status: "succeeded" },
                  { id: "INV-2024-002", label: "合同会社ベータ", status: "pending" },
                  { id: "INV-2024-003", label: "有限会社ガンマ", status: "scheduled" },
                ].map((item) => (
                  <Flex key={item.id} direction="row" gap="xs" align="center" justify="between">
                    <Flex direction="col" gap="xs">
                      <span className="text-sm font-medium">{item.id}</span>
                      <span className="text-muted-foreground text-xs">{item.label}</span>
                    </Flex>
                    <Badge status={item.status} />
                  </Flex>
                ))}
              </Flex>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel id="detail-panel" defaultSize={65} minSize={40}>
              <Flex direction="col" gap="sm" style={{ padding: "1rem", height: "100%" }}>
                <span className="text-muted-foreground text-xs font-medium">詳細</span>
                <span className="text-sm font-semibold">INV-2024-001</span>
                <Flex direction="col" gap="xs">
                  <span className="text-sm">株式会社アルファ</span>
                  <span className="text-muted-foreground text-sm">金額: ¥1,320,000（税込）</span>
                  <span className="text-muted-foreground text-sm">支払期日: 2024-02-28</span>
                </Flex>
                <Flex direction="row" gap="xs" wrap>
                  <Button size="sm">承認</Button>
                  <Button size="sm" variant="outline">
                    却下
                  </Button>
                </Flex>
              </Flex>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </CardContent>
    </Card>
  );
}

/** orientation="vertical" — top/bottom split with a grip handle. */
function VerticalCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>垂直分割 — エディタ + プレビュー</CardTitle>
        <CardDescription>
          orientation=&quot;vertical&quot;
          で上下分割。コードエディタ + 出力プレビューやフォーム +
          確認画面などの用途。ResizableHandle に children
          を渡すとグリップアイコンで掴みやすくなる。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ height: "18rem", ...frameStyle }}>
          <ResizablePanelGroup orientation="vertical">
            <ResizablePanel id="editor-panel" defaultSize={50} minSize={25}>
              <Flex direction="col" gap="sm" style={{ padding: "1rem", height: "100%" }}>
                <span className="text-muted-foreground text-xs font-medium">仕訳エディタ</span>
                <Flex direction="col" gap="xs">
                  <Flex direction="row" gap="sm" align="center" justify="between">
                    <span className="text-sm">売掛金 / 売上高</span>
                    <Badge tone="info">借方 ¥880,000</Badge>
                  </Flex>
                  <Flex direction="row" gap="sm" align="center" justify="between">
                    <span className="text-sm">仮受消費税 / 売上高</span>
                    <Badge variant="outline">貸方 ¥880,000</Badge>
                  </Flex>
                </Flex>
              </Flex>
            </ResizablePanel>
            <ResizableHandle>
              <GripHorizontal aria-hidden="true" size={16} />
            </ResizableHandle>
            <ResizablePanel id="preview-panel" defaultSize={50} minSize={25}>
              <Flex direction="col" gap="sm" style={{ padding: "1rem", height: "100%" }}>
                <span className="text-muted-foreground text-xs font-medium">プレビュー</span>
                <span className="text-muted-foreground text-sm">
                  仕訳内容のプレビューがここに表示されます。貸借が一致していることを確認してください。
                </span>
                <Flex direction="row" gap="xs">
                  <Button size="sm">保存</Button>
                  <Button size="sm" variant="outline">
                    クリア
                  </Button>
                </Flex>
              </Flex>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * collapsible + collapsedSize — the sidebar collapses to zero and an imperative
 * panelRef toggle expands/collapses it. Seeded collapsed at rest so the
 * collapsed state is visible in a static screenshot.
 */
function CollapsibleCard() {
  const panelRef = React.useRef<PanelImperativeHandle | null>(null);
  const [collapsed, setCollapsed] = React.useState(true);

  const toggle = () => {
    const panel = panelRef.current;
    if (!panel) return;
    if (panel.isCollapsed()) {
      panel.expand();
      setCollapsed(false);
    } else {
      panel.collapse();
      setCollapsed(true);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>折りたたみ — collapsible サイドバー</CardTitle>
        <CardDescription>
          collapsible + collapsedSize=&#123;0&#125; でサイドバーをゼロまで折りたためる。panelRef
          の collapse()/expand() でトグル。minSize 未満までドラッグしても自動で折りたたまれる。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Flex direction="col" gap="sm">
          <Flex direction="row" gap="xs" align="center">
            <Button
              size="sm"
              variant="outline"
              onClick={toggle}
              aria-pressed={!collapsed}
              aria-label={collapsed ? "サイドバーを開く" : "サイドバーを閉じる"}
            >
              {collapsed ? (
                <PanelLeftOpen aria-hidden="true" size={16} />
              ) : (
                <PanelLeftClose aria-hidden="true" size={16} />
              )}
              {collapsed ? "サイドバーを開く" : "サイドバーを閉じる"}
            </Button>
            <span className="text-muted-foreground text-xs">
              {collapsed ? "折りたたみ中" : "展開中"}
            </span>
          </Flex>
          <div style={{ height: "14rem", ...frameStyle }}>
            <ResizablePanelGroup orientation="horizontal">
              <ResizablePanel
                panelRef={panelRef}
                id="collapsible-sidebar"
                collapsible
                collapsedSize={0}
                defaultSize={0}
                minSize={15}
                maxSize={30}
                onResize={(size) => setCollapsed(size.asPercentage === 0)}
              >
                <Flex direction="col" gap="xs" style={{ padding: "0.75rem", height: "100%" }}>
                  <span className="text-muted-foreground text-xs font-medium">ナビゲーション</span>
                  {["売上", "仕入", "経費", "固定資産"].map((item) => (
                    <span key={item} className="text-muted-foreground text-sm">
                      {item}
                    </span>
                  ))}
                </Flex>
              </ResizablePanel>
              <ResizableHandle>
                <GripVertical aria-hidden="true" size={16} />
              </ResizableHandle>
              <ResizablePanel id="collapsible-main" defaultSize={100} minSize={40}>
                <Flex direction="col" gap="xs" style={{ padding: "0.75rem", height: "100%" }}>
                  <span className="text-muted-foreground text-xs font-medium">
                    メインコンテンツ
                  </span>
                  <span className="text-muted-foreground text-sm">
                    サイドバーが折りたたまれると本文が全幅に広がる。
                  </span>
                </Flex>
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        </Flex>
      </CardContent>
    </Card>
  );
}

/**
 * defaultLayout + onLayoutChanged + a stable id — sizes persist across reloads.
 * In v4 a bare id does NOT persist; you must seed defaultLayout and capture
 * onLayoutChanged. Here the saved layout is held in state and echoed on screen.
 */
function PersistenceCard() {
  // Layout is a map of panel id -> flexGrow value (relative, not %).
  const [layout, setLayout] = React.useState<Layout>({
    "persisted-nav": 30,
    "persisted-content": 70,
  });

  const total = Object.values(layout).reduce((sum, n) => sum + n, 0) || 1;
  const ratio = [layout["persisted-nav"], layout["persisted-content"]]
    .map((n) => `${Math.round(((n ?? 0) / total) * 100)}%`)
    .join(" / ");

  return (
    <Card>
      <CardHeader>
        <CardTitle>永続化 — defaultLayout + onLayoutChanged</CardTitle>
        <CardDescription>
          v4 では id 単体ではサイズは保存されない。defaultLayout
          で初期サイズを与え、onLayoutChanged を localStorage 等に保存して復元する。現在の比率: {ratio}
          。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ height: "14rem", ...frameStyle }}>
          <ResizablePanelGroup
            id="persisted-group"
            orientation="horizontal"
            defaultLayout={layout}
            onLayoutChanged={setLayout}
          >
            <ResizablePanel id="persisted-nav" defaultSize={30} minSize={20} maxSize={50}>
              <Flex direction="col" gap="xs" style={{ padding: "0.75rem", height: "100%" }}>
                <span className="text-muted-foreground text-xs font-medium">勘定科目</span>
                <span className="text-muted-foreground text-sm">この比率は保存されます。</span>
              </Flex>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel id="persisted-content" defaultSize={70} minSize={30}>
              <Flex direction="col" gap="xs" style={{ padding: "0.75rem", height: "100%" }}>
                <span className="text-muted-foreground text-xs font-medium">仕訳一覧</span>
                <span className="text-muted-foreground text-sm">
                  ハンドルを動かすと上の比率表示が即時に更新される。
                </span>
              </Flex>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * disabled — read-only layout. Group disabled freezes all panels; an individual
 * Separator can be disabled, and disableDoubleClick suppresses double-click reset.
 */
function DisabledCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>無効化 — disabled / disableDoubleClick</CardTitle>
        <CardDescription>
          ResizablePanelGroup に disabled を渡すとレイアウトを固定（読み取り専用）にできる。Separator
          単位の disabled、ダブルクリックでのリセットを抑止する disableDoubleClick
          もある。下の例はハンドルがグレーアウトし操作できない。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ height: "12rem", ...frameStyle }}>
          <ResizablePanelGroup orientation="horizontal" disabled>
            <ResizablePanel id="disabled-left" defaultSize={40} minSize={20}>
              <Flex direction="col" gap="xs" style={{ padding: "0.75rem", height: "100%" }}>
                <span className="text-muted-foreground text-xs font-medium">確定済みレイアウト</span>
                <span className="text-muted-foreground text-sm">承認後は配置を変更できません。</span>
              </Flex>
            </ResizablePanel>
            <ResizableHandle disabled disableDoubleClick />
            <ResizablePanel id="disabled-right" defaultSize={60} minSize={20}>
              <Flex direction="col" gap="xs" style={{ padding: "0.75rem", height: "100%" }}>
                <span className="text-muted-foreground text-xs font-medium">プレビュー</span>
                <span className="text-muted-foreground text-sm">読み取り専用ビュー。</span>
              </Flex>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </CardContent>
    </Card>
  );
}

/** Three panes — multiple handles compose 3+ panes (IDE-style layout). */
function ThreePaneCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>3ペイン — サイドバー + メイン + インスペクタ</CardTitle>
        <CardDescription>
          ResizableHandle を複数配置することで3ペイン以上に分割できる。IDE
          スタイルのコードエディタやダッシュボードビルダーに適している。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ height: "14rem", ...frameStyle }}>
          <ResizablePanelGroup orientation="horizontal">
            <ResizablePanel id="sidebar-3pane" defaultSize={20} minSize={15} maxSize={30}>
              <Flex direction="col" gap="xs" style={{ padding: "0.75rem", height: "100%" }}>
                <span className="text-muted-foreground text-xs font-medium">ナビゲーション</span>
                {["売上", "仕入", "経費", "固定資産"].map((item) => (
                  <span key={item} className="text-muted-foreground text-sm">
                    {item}
                  </span>
                ))}
              </Flex>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel id="main-3pane" defaultSize={55} minSize={30}>
              <Flex direction="col" gap="xs" style={{ padding: "0.75rem", height: "100%" }}>
                <span className="text-muted-foreground text-xs font-medium">メインコンテンツ</span>
                <span className="text-muted-foreground text-sm">勘定科目ツリーや仕訳一覧</span>
              </Flex>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel id="inspector-3pane" defaultSize={25} minSize={15} maxSize={40}>
              <Flex direction="col" gap="xs" style={{ padding: "0.75rem", height: "100%" }}>
                <span className="text-muted-foreground text-xs font-medium">インスペクタ</span>
                <span className="text-muted-foreground text-sm">選択項目の詳細・メタデータ</span>
              </Flex>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </CardContent>
    </Card>
  );
}
