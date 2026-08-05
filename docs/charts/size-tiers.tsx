import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Text } from "@godxjp/ui/general";
import { Flex, PageContainer, ResponsiveGrid } from "@godxjp/ui/layout";
import { AreaChart, BarChart, LineChart, PieChart } from "@godxjp/ui/charts";

/**
 * Chart size tiers — the `size` prop of every recharts-backed chart
 * (`LineChart` / `BarChart` / `AreaChart` / `PieChart`).
 *
 * `size` is the CANVAS HEIGHT tier: xs は密度の高いサマリーカード、sm はカード内の補助グラフ、
 * md（既定）は本文の標準グラフ、lg は分析画面の主役グラフ向けです。高さはコンポーネントが所有し、
 * 画面側が px を書くことはありません（`height` を渡した場合のみ size より優先されます）。
 *
 * 系列の配色は --chart-1..6 パレット、目盛りと凡例の数値は Intl.NumberFormat（ロケール自動）、
 * 代替テキストは各グラフが内蔵しています。すべて real @godxjp/ui primitives のみで構成しています。
 */

const tiers = ["xs", "sm", "md", "lg"] as const;

/** LineChart — 2 系列（計画と実績）。系列が複数あるため凡例は既定のまま表示します。 */
const revenue = [
  { month: "1月", plan: 1200000, actual: 980000 },
  { month: "2月", plan: 1500000, actual: 1610000 },
  { month: "3月", plan: 1800000, actual: 1750000 },
  { month: "4月", plan: 1600000, actual: 1720000 },
  { month: "5月", plan: 2000000, actual: 1980000 },
  { month: "6月", plan: 2200000, actual: 2410000 },
];

/** BarChart — 単一系列。凡例は不要（見出しが系列名を兼ねます）。 */
const organizations = [
  { month: "1月", created: 24 },
  { month: "2月", created: 31 },
  { month: "3月", created: 18 },
  { month: "4月", created: 42 },
  { month: "5月", created: 37 },
  { month: "6月", created: 51 },
];

/** AreaChart — 単一系列の推移。 */
const sessions = [
  { week: "第1週", sessions: 12400 },
  { week: "第2週", sessions: 15800 },
  { week: "第3週", sessions: 14200 },
  { week: "第4週", sessions: 19600 },
  { week: "第5週", sessions: 18100 },
];

/** PieChart — 少数スライスの構成比。 */
const expenses = [
  { category: "給与", amount: 4200000 },
  { category: "家賃", amount: 1800000 },
  { category: "システム", amount: 950000 },
  { category: "光熱費", amount: 600000 },
];

const jpy = { style: "currency", currency: "JPY", notation: "compact" } as const;

export default function Demo() {
  return (
    <PageContainer
      title="Chart size tiers"
      subtitle="LineChart · BarChart · AreaChart · PieChart の size = xs / sm / md / lg"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>LineChart · size</CardTitle>
            <CardDescription>
              複数系列の推移。size はキャンバス高さのティアだけを変え、配色・凡例・数値書式・
              代替テキストはどのティアでも同じ契約のままです。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveGrid columns={2}>
              {tiers.map((size) => (
                <Flex key={size} direction="col" gap="xs">
                  <Text size="2xs" mono tone="muted">
                    {`size="${size}"`}
                  </Text>
                  <LineChart
                    label={`月次売上（計画 vs 実績）size="${size}"`}
                    data={revenue}
                    categoryKey="month"
                    series={[
                      { dataKey: "plan", label: "計画" },
                      { dataKey: "actual", label: "実績" },
                    ]}
                    numberFormat={jpy}
                    size={size}
                    curved
                  />
                </Flex>
              ))}
            </ResponsiveGrid>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>BarChart · size</CardTitle>
            <CardDescription>
              単一系列のため凡例は表示しません。xs はダッシュボードのサマリーカードに収まる密度、 lg
              は分析画面の主役グラフです。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveGrid columns={2}>
              {tiers.map((size) => (
                <Flex key={size} direction="col" gap="xs">
                  <Text size="2xs" mono tone="muted">
                    {`size="${size}"`}
                  </Text>
                  <BarChart
                    label={`新規組織数（月別）size="${size}"`}
                    data={organizations}
                    categoryKey="month"
                    series={[{ dataKey: "created", label: "新規組織" }]}
                    numberFormat={{ notation: "compact" }}
                    showLegend={false}
                    size={size}
                  />
                </Flex>
              ))}
            </ResponsiveGrid>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>AreaChart · size</CardTitle>
            <CardDescription>
              面グラフでも高さティアの扱いは同じです。低いティアでは縦軸の目盛りが自動的に
              間引かれるため、密度の高いカードでも軸ラベルが衝突しません。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveGrid columns={2}>
              {tiers.map((size) => (
                <Flex key={size} direction="col" gap="xs">
                  <Text size="2xs" mono tone="muted">
                    {`size="${size}"`}
                  </Text>
                  <AreaChart
                    label={`週次セッション数 size="${size}"`}
                    data={sessions}
                    categoryKey="week"
                    series={[{ dataKey: "sessions", label: "セッション" }]}
                    numberFormat={{ notation: "compact" }}
                    showLegend={false}
                    size={size}
                    curved
                  />
                </Flex>
              ))}
            </ResponsiveGrid>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>PieChart · size</CardTitle>
            <CardDescription>
              円グラフは凡例で識別するため、どのティアでも凡例を残します。低いティアでは
              凡例の分だけ描画領域が狭くなるので、スライスは 5 件以下に保つのが読みやすい設計です。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveGrid columns={2}>
              {tiers.map((size) => (
                <Flex key={size} direction="col" gap="xs">
                  <Text size="2xs" mono tone="muted">
                    {`size="${size}"`}
                  </Text>
                  <PieChart
                    label={`経費内訳 size="${size}"`}
                    data={expenses}
                    dataKey="amount"
                    nameKey="category"
                    numberFormat={jpy}
                    size={size}
                    donut
                  />
                </Flex>
              ))}
            </ResponsiveGrid>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
