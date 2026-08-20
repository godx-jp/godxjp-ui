import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  StatCard,
} from "@godxjp/ui/data-display";
import { Text } from "@godxjp/ui/general";
import { Flex, PageContainer, ResponsiveGrid, SplitPane } from "@godxjp/ui/layout";

/**
 * ResponsiveGrid · equal-width multi-column tile grid with automatic responsive
 * collapse (CSS container queries, not viewport). It OWNS its query container
 * (container-type: inline-size), so it responds to the width available to the grid
 * with no external container-type declaration (gh#165). Direct children are typically
 * StatCard (self-contained bordered card · never wrap in Card/CardContent) or
 * Card+CardContent for richer tile bodies. columns accepts a number OR breakpoint
 * object { sm?, md?, lg? } — or use the named `preset` prop (e.g. "pricing-plans") for a
 * recognised collection shape instead of hand-rolling the breakpoint map. Composed only from
 * real @godxjp/ui components.
 */
export default function Demo() {
  return (
    <PageContainer
      title="ResponsiveGrid"
      subtitle="等幅タイルグリッド · KPI・カード比較・ダッシュボード行"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>コンテナクエリで折り返し（自己所有のクエリコンテナ）</CardTitle>
            <CardDescription>
              同じ columns=&#123;4&#125; でも、コンテナ幅で列数が変わる。左の広い領域は 4
              列、右の狭いサイドバー（約 20rem）は 1 列に折り返す。ビューポート幅は同一なので、
              折り返しの基準がコンテナ幅であることが分かる。ResponsiveGrid は自身のクエリコンテナ
              （container-type: inline-size）を持つため、外側に @container を用意しなくても正しく
              折り返す（gh#165）。閾値はコンテナ幅 40 / 48 / 64rem。 列間の gap は
              var(--space-stack-md) に固定で、prop では変更できない。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SplitPane
              asideWidth="sm"
              aside={
                <Flex direction="col" gap="sm">
                  <Text tone="muted">狭いコンテナ（約 20rem）→ sm=1 列</Text>
                  {/* No wrapping `@container` needed — ResponsiveGrid OWNS its query container (gh#165). */}
                  <ResponsiveGrid columns={4}>
                    <StatCard label="今日の入金" value="¥420,000" />
                    <StatCard label="未処理" value="6 件" />
                  </ResponsiveGrid>
                </Flex>
              }
            >
              <Flex direction="col" gap="sm">
                <Text tone="muted">広いコンテナ → lg=4 列</Text>
                <ResponsiveGrid columns={4}>
                  <StatCard label="月次売上" value="¥12,400,000" delta="+8%" hint="先月比" />
                  <StatCard label="請求件数" value="486" delta="+12%" />
                  <StatCard label="売掛金残高" value="¥3,180,000" hint="未回収 23件" />
                  <StatCard label="回収率" value="97.2%" delta="+0.4%" />
                </ResponsiveGrid>
              </Flex>
            </SplitPane>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Container stress · 320 / 768px 相当（外側コンテナ不要）</CardTitle>
            <CardDescription>
              固定幅の親の中でも、同じ columns=&#123;4&#125; が親幅で列数を変える。親には
              container-type を付けていない。ResponsiveGrid が自身のスコープでクエリするため、
              外側にコンテナ宣言がなくても 1 列に潰れない（gh#165）。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              {["max-w-80", "max-w-3xl"].map((width) => (
                <div key={width} className={`${width} border p-2`}>
                  <ResponsiveGrid columns={4}>
                    {Array.from({ length: 4 }, (_, index) => (
                      <div key={index} className="bg-muted rounded p-3 text-center">
                        {index + 1}
                      </div>
                    ))}
                  </ResponsiveGrid>
                </div>
              ))}
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>columns=&#123;4&#125; · KPI 行（StatCard 直置き）</CardTitle>
            <CardDescription>
              StatCard は自身がボーダー付き Card なので Card/CardContent でラップしない。 columns
              数値指定時は sm=min(n,2) / md=min(n,3) / lg=n に自動変換。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveGrid columns={4}>
              <StatCard label="月次売上" value="¥12,400,000" delta="+8%" hint="先月比" />
              <StatCard label="請求件数" value="486" delta="+12%" />
              <StatCard label="売掛金残高" value="¥3,180,000" hint="未回収 23件" />
              <StatCard label="回収率" value="97.2%" delta="+0.4%" />
            </ResponsiveGrid>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>columns=&#123;3&#125; · 法人比較（Card+CardContent）</CardTitle>
            <CardDescription>
              StatCard 以外のリッチなタイルは Card+CardContent で構成。 columns=&#123;3&#125; → sm=2
              / md=3 / lg=3 に自動変換。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveGrid columns={3}>
              <Card>
                <CardHeader>
                  <CardTitle>東京本社</CardTitle>
                  <CardDescription>JP-001</CardDescription>
                </CardHeader>
                <CardContent>
                  <Flex direction="col" gap="xs">
                    <Text>売上: ¥8,200,000</Text>
                    <Text tone="muted">取引先: 124社</Text>
                  </Flex>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>大阪支社</CardTitle>
                  <CardDescription>JP-002</CardDescription>
                </CardHeader>
                <CardContent>
                  <Flex direction="col" gap="xs">
                    <Text>売上: ¥3,100,000</Text>
                    <Text tone="muted">取引先: 57社</Text>
                  </Flex>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>福岡拠点</CardTitle>
                  <CardDescription>JP-003</CardDescription>
                </CardHeader>
                <CardContent>
                  <Flex direction="col" gap="xs">
                    <Text>売上: ¥1,060,000</Text>
                    <Text tone="muted">取引先: 31社</Text>
                  </Flex>
                </CardContent>
              </Card>
            </ResponsiveGrid>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>
              columns=&#123;&#123; sm: 1, md: 2, lg: 4 &#125;&#125; ·
              ブレークポイントオブジェクト（3 段制御）
            </CardTitle>
            <CardDescription>
              ブレークポイント指定オブジェクト: sm / md / lg
              キーでコンテナ幅ごとの列数を個別に制御。
              未指定キーは下位にフォールバック（lg→md→sm、md→sm、sm 既定 1）。 数値指定（sm=min(n,2)
              / md=min(n,3) / lg=n の自動変換）では作れない 「sm=1 / md=2 /
              lg=4」のような任意の組み合わせを表現できる。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveGrid columns={{ sm: 1, md: 2, lg: 4 }}>
              <StatCard layout="inline" label="契約金額" value="¥4,800,000" />
              <StatCard layout="inline" label="消費税額" value="¥480,000" hint="税率 10%" />
              <StatCard layout="inline" label="支払済" value="¥2,400,000" delta="-50%" inverse />
              <StatCard layout="inline" label="残額" value="¥2,400,000" />
            </ResponsiveGrid>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>
              preset=&quot;pricing-plans&quot; · 課金プラン一覧（3/3/1）
            </CardTitle>
            <CardDescription>
              名前付きコレクション geometry: コンテナ幅が lg ステップ（64rem）に達するまでは 1
              列、そこから 3 列に切り替わる。ResponsiveGrid には lg
              より上のステップが無いため、1024px 相当でも 1440px 相当でも同じ 3 列になる —
              課金プランカタログの「3/3/1」契約 （dxs-platform/platform#333）。`columns` の代わりに
              `preset` を渡すだけで、呼び出し側がブレークポイント値を自作する必要がない。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveGrid preset="pricing-plans">
              <Card>
                <CardHeader>
                  <CardTitle>スタンダード</CardTitle>
                  <CardDescription>¥9,800 / 月</CardDescription>
                </CardHeader>
                <CardContent>
                  <Text tone="muted">小規模チーム向けの基本プラン。</Text>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>プロフェッショナル</CardTitle>
                  <CardDescription>¥29,800 / 月</CardDescription>
                </CardHeader>
                <CardContent>
                  <Text tone="muted">成長企業向けの推奨プラン。</Text>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>エンタープライズ</CardTitle>
                  <CardDescription>お問い合わせ</CardDescription>
                </CardHeader>
                <CardContent>
                  <Text tone="muted">大規模組織向けのカスタムプラン。</Text>
                </CardContent>
              </Card>
            </ResponsiveGrid>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
