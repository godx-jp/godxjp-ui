import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  StatCard,
} from "@godxjp/ui/data-display";
import { Flex, PageContainer, ResponsiveGrid } from "@godxjp/ui/layout";

/**
 * ResponsiveGrid — equal-width multi-column tile grid with automatic responsive
 * collapse (CSS container queries, not viewport). Direct children are typically
 * StatCard (self-contained bordered card — never wrap in Card/CardContent) or
 * Card+CardContent for richer tile bodies. columns accepts a number OR breakpoint
 * object { sm?, md?, lg? }. Composed only from real @godxjp/ui components.
 */
export default function Demo() {
  return (
    <PageContainer
      title="ResponsiveGrid"
      subtitle="等幅タイルグリッド — KPI・カード比較・ダッシュボード行"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>columns=&#123;4&#125; — KPI 行（StatCard 直置き）</CardTitle>
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
            <CardTitle>columns=&#123;3&#125; — 法人比較（Card+CardContent）</CardTitle>
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
                    <span className="text-sm">売上: ¥8,200,000</span>
                    <span className="text-muted-foreground text-sm">取引先: 124社</span>
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
                    <span className="text-sm">売上: ¥3,100,000</span>
                    <span className="text-muted-foreground text-sm">取引先: 57社</span>
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
                    <span className="text-sm">売上: ¥1,060,000</span>
                    <span className="text-muted-foreground text-sm">取引先: 31社</span>
                  </Flex>
                </CardContent>
              </Card>
            </ResponsiveGrid>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              columns=&#123;&#123; sm: 1, md: 2 &#125;&#125; — ブレークポイントオブジェクト
            </CardTitle>
            <CardDescription>
              ブレークポイント指定オブジェクト: sm / md / lg キーで列数を個別制御。
              ナローパネルやサイドバー内などコンテナ幅が固定の場合に使う。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveGrid columns={{ sm: 1, md: 2 }}>
              <StatCard layout="inline" label="契約金額" value="¥4,800,000" />
              <StatCard layout="inline" label="消費税額" value="¥480,000" hint="税率 10%" />
              <StatCard layout="inline" label="支払済" value="¥2,400,000" delta="-50%" inverse />
              <StatCard layout="inline" label="残額" value="¥2,400,000" />
            </ResponsiveGrid>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
