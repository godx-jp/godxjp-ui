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

/**
 * ResizablePanel — react-resizable-panels compound primitive exported as
 * ResizablePanelGroup / ResizablePanel / ResizableHandle. Always compose:
 * ResizablePanelGroup wraps panels+handles; ResizableHandle sits between panels;
 * ResizablePanel holds content. Use id for persistence and minSize/maxSize to
 * prevent panels from collapsing to zero. Composed only from real @godxjp/ui
 * components.
 */
export default function Demo() {
  return (
    <PageContainer
      title="ResizablePanel"
      subtitle="ResizablePanelGroup + ResizablePanel + ResizableHandle — サイズ変更可能な分割レイアウト"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>水平分割 — リスト + 詳細</CardTitle>
            <CardDescription>
              direction=&quot;horizontal&quot;（既定）。ResizableHandle をパネル間に配置。 minSize
              でゼロ崩壊を防ぐ。id はパネルサイズの永続化に使う。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              style={{
                height: "16rem",
                border: "1px solid var(--color-border)",
                borderRadius: "0.5rem",
                overflow: "hidden",
              }}
            >
              <ResizablePanelGroup direction="horizontal">
                <ResizablePanel id="list-panel" defaultSize={35} minSize={20} maxSize={60}>
                  <Flex
                    direction="col"
                    gap="sm"
                    style={{ padding: "1rem", height: "100%", overflowY: "auto" }}
                  >
                    <span className="text-muted-foreground text-xs font-medium">請求書リスト</span>
                    {[
                      { id: "INV-2024-001", label: "株式会社アルファ", status: "success" as const },
                      { id: "INV-2024-002", label: "合同会社ベータ", status: "warning" as const },
                      { id: "INV-2024-003", label: "有限会社ガンマ", status: "info" as const },
                    ].map((item) => (
                      <Flex key={item.id} direction="row" gap="xs" align="center" justify="between">
                        <Flex direction="col" gap="xs">
                          <span className="text-sm font-medium">{item.id}</span>
                          <span className="text-muted-foreground text-xs">{item.label}</span>
                        </Flex>
                        <Badge variant={item.status} />
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
                      <span className="text-muted-foreground text-sm">
                        金額: ¥1,320,000（税込）
                      </span>
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

        <Card>
          <CardHeader>
            <CardTitle>垂直分割 — エディタ + プレビュー</CardTitle>
            <CardDescription>
              direction=&quot;vertical&quot; で上下分割。コードエディタ + 出力プレビューや フォーム
              + 確認画面などの用途。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              style={{
                height: "18rem",
                border: "1px solid var(--color-border)",
                borderRadius: "0.5rem",
                overflow: "hidden",
              }}
            >
              <ResizablePanelGroup direction="vertical">
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
                <ResizableHandle />
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

        <Card>
          <CardHeader>
            <CardTitle>3ペイン — サイドバー + メイン + インスペクタ</CardTitle>
            <CardDescription>
              ResizableHandle を複数配置することで3ペイン以上に分割できる。 IDE
              スタイルのコードエディタやダッシュボードビルダーに適している。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              style={{
                height: "14rem",
                border: "1px solid var(--color-border)",
                borderRadius: "0.5rem",
                overflow: "hidden",
              }}
            >
              <ResizablePanelGroup direction="horizontal">
                <ResizablePanel id="sidebar-3pane" defaultSize={20} minSize={15} maxSize={30}>
                  <Flex direction="col" gap="xs" style={{ padding: "0.75rem", height: "100%" }}>
                    <span className="text-muted-foreground text-xs font-medium">
                      ナビゲーション
                    </span>
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
                    <span className="text-muted-foreground text-xs font-medium">
                      メインコンテンツ
                    </span>
                    <span className="text-muted-foreground text-sm">勘定科目ツリーや仕訳一覧</span>
                  </Flex>
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel id="inspector-3pane" defaultSize={25} minSize={15} maxSize={40}>
                  <Flex direction="col" gap="xs" style={{ padding: "0.75rem", height: "100%" }}>
                    <span className="text-muted-foreground text-xs font-medium">インスペクタ</span>
                    <span className="text-muted-foreground text-sm">
                      選択項目の詳細・メタデータ
                    </span>
                  </Flex>
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
