import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Text } from "@godxjp/ui/general";
import { Skeleton } from "@godxjp/ui/feedback";
import { AspectRatio, Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * AspectRatio · Radix AspectRatio wrapper. Stabilises media/preview frames so
 * they do not reflow during load. ratio = width / height (number). Children fill
 * the constrained box · use object-fit: cover on images, width/height 100% on
 * iframes and SVG charts. Do not use for unconstrained text content. Composed
 * only from real @godxjp/ui components.
 */
export default function Demo() {
  return (
    <PageContainer
      title="AspectRatio"
      subtitle="安定メディアフレーム · ロード中のレイアウトシフトを防ぐ"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>ratio=&#123;16 / 9&#125; · 動画埋め込み（既定）</CardTitle>
            <CardDescription>
              動画・地図・ダッシュボードグラフの埋め込みに最適。既定値は 16/9。 子要素は
              width/height 100% で親を満たす。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AspectRatio ratio={16 / 9}>
              <div className="bg-muted flex h-full w-full items-center justify-center rounded-md">
                <Text tone="muted">16:9 動画プレビュー（サンプル）</Text>
              </div>
            </AspectRatio>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ratio=&#123;4 / 3&#125; · 画像プレビュースロット</CardTitle>
            <CardDescription>
              商品画像・領収書スキャン・添付ファイルサムネイルのプレビュー枠。 img には object-fit:
              cover を付与してアスペクト比を維持。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-w-xs">
              <AspectRatio ratio={4 / 3}>
                <div className="bg-muted border-border flex h-full w-full items-center justify-center rounded-md border">
                  <Text tone="muted">領収書スキャン 4:3</Text>
                </div>
              </AspectRatio>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ratio=&#123;1 / 1&#125; · 正方形サムネイル</CardTitle>
            <CardDescription>
              プロフィール画像・会社ロゴ・アイコン枠など正方形が必要な場合。 ratio=&#123;1&#125;
              または ratio=&#123;1 / 1&#125; どちらでも可。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="row" gap="md" align="start" wrap>
              {["株式会社 A", "合同会社 B", "有限会社 C"].map((name) => (
                <div key={name} className="w-28">
                  <AspectRatio ratio={1}>
                    <div className="bg-muted border-border flex h-full w-full items-center justify-center rounded-md border">
                      <Text size="xs" tone="muted" className="px-1 text-center">
                        {name}
                      </Text>
                    </div>
                  </AspectRatio>
                </div>
              ))}
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              ratio=&#123;21 / 9&#125; · ワイドバナー / チャートプレースホルダー
            </CardTitle>
            <CardDescription>
              ダッシュボードの月次推移グラフや広告バナー用の超ワイド枠。 Skeleton
              と組み合わせてローディング中のプレースホルダーにも使う。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AspectRatio ratio={21 / 9}>
              <div className="bg-muted border-border flex h-full w-full items-center justify-center rounded-md border">
                <Text tone="muted">月次売上推移グラフ（21:9）</Text>
              </div>
            </AspectRatio>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Skeleton 併用 · ロード中のプレースホルダー</CardTitle>
            <CardDescription>
              フレームの幅・高さを ratio で固定し、ロード完了後に画像へ差し替えても
              レイアウトシフトが起きない。読み込み中は Skeleton を子要素に置く。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-w-xs">
              <AspectRatio ratio={16 / 9}>
                <Skeleton className="h-full w-full rounded-md" />
              </AspectRatio>
            </div>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
