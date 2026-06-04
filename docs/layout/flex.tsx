import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@godxjp/ui/data-display";
import { Button } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * Flex — canonical flex primitive (replaced Stack/Inline as named shortcuts).
 * Use direction="col" for vertical stacks (formerly Stack), direction="row" for
 * horizontal groups (formerly Inline). Keep spacing in gap prop — same token
 * scale as Stack/Inline. align + justify expose cross-axis and main-axis control.
 * wrap allows chip clusters and action rows to reflow. Composed only from real
 * @godxjp/ui components.
 */
export default function Demo() {
  return (
    <PageContainer
      title="Flex"
      subtitle="方向・整列・間隔・折り返し — Stack/Inline を置き換えた汎用フレックスプリミティブ"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>direction=&quot;col&quot; — 縦スタック</CardTitle>
            <CardDescription>
              既定値は col。gap トークンで間隔を均一に制御。className で raw gap-* を使わない。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="sm">
              <Card>
                <CardContent>
                  <span className="text-muted-foreground text-sm">行 1 — 仕訳入力</span>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <span className="text-muted-foreground text-sm">行 2 — 補助元帳</span>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <span className="text-muted-foreground text-sm">行 3 — 試算表</span>
                </CardContent>
              </Card>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              direction=&quot;row&quot; + justify=&quot;between&quot; — ツールバー
            </CardTitle>
            <CardDescription>
              カードヘッダー内でタイトルとアクションを左右に配置する典型パターン。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="row" gap="sm" align="center" justify="between">
              <span className="text-sm font-medium">請求書一覧</span>
              <Flex direction="row" gap="xs" align="center">
                <Button variant="outline" size="sm">
                  エクスポート
                </Button>
                <Button size="sm">新規作成</Button>
              </Flex>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              align=&quot;center&quot; + justify=&quot;center&quot; — センタリング
            </CardTitle>
            <CardDescription>
              空状態やローディングブロックを両軸で中央揃えにする用途。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex
              direction="col"
              align="center"
              justify="center"
              gap="sm"
              style={{ minHeight: "8rem" }}
            >
              <span className="text-muted-foreground text-sm">データがありません</span>
              <Button variant="outline" size="sm">
                インポート
              </Button>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>wrap — バッジ・チップクラスター</CardTitle>
            <CardDescription>
              direction=&quot;row&quot; + wrap=&#123;true&#125; でタグ・ステータスバッジが折り返す。
              gap トークンで均一スペーシング。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="row" wrap gap="xs" align="center">
              <Badge tone="success">承認済</Badge>
              <Badge tone="warning">保留中</Badge>
              <Badge tone="info">確認待ち</Badge>
              <Badge tone="destructive">却下</Badge>
              <Badge variant="secondary">下書き</Badge>
              <Badge variant="outline">アーカイブ</Badge>
              <Badge>既定</Badge>
              <Badge tone="neutral">中立</Badge>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>gap トークンスケール</CardTitle>
            <CardDescription>
              xs · sm · md（既定）· lg · xl — raw gap-* / space-* ユーティリティは使わない。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              {(["xs", "sm", "md", "lg", "xl"] as const).map((g) => (
                <Flex key={g} direction="row" gap={g} align="center">
                  <span className="text-muted-foreground w-6 text-xs">{g}</span>
                  <Badge variant="outline">勘定科目</Badge>
                  <Badge variant="outline">補助科目</Badge>
                  <Badge variant="outline">部門</Badge>
                </Flex>
              ))}
            </Flex>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
