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
              className="min-h-32"
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
            <CardTitle>align — 交差軸の整列（全 5 値）</CardTitle>
            <CardDescription>
              direction=&quot;row&quot; の交差軸（縦方向）の揃え方。高さの異なる子要素で
              start・center・end・baseline・stretch の違いを比較。baseline はテキストの
              ベースライン、stretch は子要素を行の高さまで引き伸ばす。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              {(["start", "center", "end", "stretch", "baseline"] as const).map(
                (a) => (
                  <Flex
                    key={a}
                    direction="row"
                    gap="sm"
                    align={a}
                    className="bg-muted min-h-20 rounded-md p-2"
                  >
                    <span className="text-muted-foreground w-16 text-xs">{a}</span>
                    <Badge variant="outline">短</Badge>
                    <span className="text-sm">標準テキスト</span>
                    <span className="text-2xl font-semibold">大</span>
                  </Flex>
                ),
              )}
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>justify — 主軸の配置（全 6 値）</CardTitle>
            <CardDescription>
              direction=&quot;row&quot; の主軸（横方向）の配置。固定幅トラックで余白の
              分配を比較。between は端寄せ、around は各要素の周囲、evenly は要素間と端を
              すべて均等にする。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              {(
                ["start", "center", "end", "between", "around", "evenly"] as const
              ).map((j) => (
                <Flex key={j} direction="row" gap="sm" align="center">
                  <span className="text-muted-foreground w-16 text-xs">{j}</span>
                  <Flex
                    direction="row"
                    gap="xs"
                    align="center"
                    justify={j}
                    className="bg-muted flex-1 rounded-md p-2"
                  >
                    <Badge variant="outline">借方</Badge>
                    <Badge variant="outline">貸方</Badge>
                    <Badge variant="outline">残高</Badge>
                  </Flex>
                </Flex>
              ))}
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>wrap — 折り返しの有無を比較</CardTitle>
            <CardDescription>
              wrap=&#123;true&#125;（既定の false に対して）。狭いトラックで折り返しの有無を
              並べて比較。false では子要素が一行に圧縮され、true では次行へ流れる。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="row" gap="md" align="start" wrap>
              <Flex direction="col" gap="xs" className="w-44">
                <span className="text-muted-foreground text-xs">wrap=&#123;false&#125;（既定）</span>
                <Flex
                  direction="row"
                  gap="xs"
                  wrap={false}
                  className="bg-muted rounded-md p-2"
                >
                  <Badge variant="outline">勘定科目</Badge>
                  <Badge variant="outline">補助科目</Badge>
                  <Badge variant="outline">部門</Badge>
                </Flex>
              </Flex>
              <Flex direction="col" gap="xs" className="w-44">
                <span className="text-muted-foreground text-xs">wrap=&#123;true&#125;</span>
                <Flex
                  direction="row"
                  gap="xs"
                  wrap
                  className="bg-muted rounded-md p-2"
                >
                  <Badge variant="outline">勘定科目</Badge>
                  <Badge variant="outline">補助科目</Badge>
                  <Badge variant="outline">部門</Badge>
                </Flex>
              </Flex>
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
