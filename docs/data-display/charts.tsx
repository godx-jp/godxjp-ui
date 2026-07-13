import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Flex, PageContainer, ResponsiveGrid } from "@godxjp/ui/layout";
import { AreaChart, BarChart, LineChart, PieChart } from "@godxjp/ui/charts";

/**
 * Charts — tree-shaken `@godxjp/ui/charts` entry (needs the `recharts` optional
 * peer). Every chart owns the `--chart-1..6` palette, locale-aware Intl number
 * formatting on its ticks/tooltips, a visible caption + a screen-reader text
 * alternative, and a built-in empty state. Composed only from real primitives.
 */

const revenue = [
  { month: "1月", plan: 1200000, actual: 980000 },
  { month: "2月", plan: 1500000, actual: 1610000 },
  { month: "3月", plan: 1800000, actual: 1750000 },
  { month: "4月", plan: 1600000, actual: 1720000 },
  { month: "5月", plan: 2000000, actual: 1980000 },
  { month: "6月", plan: 2200000, actual: 2410000 },
];

const traffic = [
  { day: "月", organic: 320, paid: 140, referral: 80 },
  { day: "火", organic: 410, paid: 180, referral: 90 },
  { day: "水", organic: 380, paid: 160, referral: 110 },
  { day: "木", organic: 520, paid: 220, referral: 130 },
  { day: "金", organic: 610, paid: 260, referral: 150 },
];

const expenses = [
  { category: "給与", amount: 4200000 },
  { category: "家賃", amount: 1800000 },
  { category: "光熱費", amount: 600000 },
  { category: "システム", amount: 950000 },
  { category: "その他", amount: 430000 },
];

const sparseRevenue = [
  { month: "1月", actual: 980000 },
  { month: "2月", actual: null },
  { month: "非常に長いカテゴリ名", actual: -120000 },
];

const jpy = { style: "currency", currency: "JPY" } as const;

export default function Demo() {
  return (
    <PageContainer
      title="Charts"
      subtitle="recharts をラップしたツリーシェイク可能なグラフ群 · トークン配色・ロケール数値・代替テキストを内蔵"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>LineChart · 月次トレンド</CardTitle>
            <CardDescription>
              複数系列の推移。numberFormat で通貨をロケールに合わせて表示します。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LineChart
              label="月次売上（計画 vs 実績）"
              data={revenue}
              categoryKey="month"
              series={[
                { dataKey: "plan", label: "計画" },
                { dataKey: "actual", label: "実績" },
              ]}
              numberFormat={jpy}
              curved
            />
          </CardContent>
        </Card>

        <ResponsiveGrid columns={2}>
          <Card>
            <CardHeader>
              <CardTitle level={2}>BarChart · 地域/期間比較</CardTitle>
              <CardDescription>compact 表記。stacked で構成比に切替可能。</CardDescription>
            </CardHeader>
            <CardContent>
              <BarChart
                label="曜日別トラフィック"
                data={traffic}
                categoryKey="day"
                series={[
                  { dataKey: "organic", label: "オーガニック" },
                  { dataKey: "paid", label: "広告" },
                  { dataKey: "referral", label: "参照" },
                ]}
                numberFormat={{ notation: "compact" }}
                stacked
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle level={2}>AreaChart · 累積構成</CardTitle>
              <CardDescription>stacked で合計の積み上がりを表現。</CardDescription>
            </CardHeader>
            <CardContent>
              <AreaChart
                label="チャネル別トラフィック（積み上げ）"
                data={traffic}
                categoryKey="day"
                series={[
                  { dataKey: "organic", label: "オーガニック" },
                  { dataKey: "paid", label: "広告" },
                  { dataKey: "referral", label: "参照" },
                ]}
                stacked
              />
            </CardContent>
          </Card>
        </ResponsiveGrid>

        <ResponsiveGrid columns={2}>
          <Card>
            <CardHeader>
              <CardTitle level={2}>PieChart · 構成比</CardTitle>
              <CardDescription>少数スライス向け。donut にも切替可能。</CardDescription>
            </CardHeader>
            <CardContent>
              <PieChart
                label="経費内訳"
                data={expenses}
                dataKey="amount"
                nameKey="category"
                numberFormat={jpy}
                donut
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle level={2}>空状態</CardTitle>
              <CardDescription>data が空のとき EmptyState を表示します。</CardDescription>
            </CardHeader>
            <CardContent>
              <BarChart
                label="売上（データなし）"
                data={[]}
                categoryKey="month"
                series={[{ dataKey: "actual", label: "実績" }]}
                size="sm"
              />
            </CardContent>
          </Card>
        </ResponsiveGrid>

        <ResponsiveGrid columns={2}>
          <Card>
            <CardHeader>
              <CardTitle level={2}>BarChart · 横方向・非積み上げ</CardTitle>
              <CardDescription>長いカテゴリと負数を含む edge-data frame。</CardDescription>
            </CardHeader>
            <CardContent>
              <BarChart
                label="例外値を含む売上"
                description="null、負数、長いカテゴリ名の描画と代替テキストを確認します。"
                data={sparseRevenue}
                categoryKey="month"
                series={[{ dataKey: "actual", label: "実績", color: "var(--chart-3)" }]}
                numberFormat={jpy}
                horizontal
                showGrid={false}
                showLegend={false}
                size="xs"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle level={2}>PieChart · full pie・custom colours</CardTitle>
              <CardDescription>donut=false と colors の明示指定。</CardDescription>
            </CardHeader>
            <CardContent>
              <PieChart
                id="expenses-full-pie"
                label="経費内訳（円グラフ）"
                description="カスタム配色を使用した full pie。"
                data={expenses.slice(0, 3)}
                dataKey="amount"
                nameKey="category"
                colors={["var(--chart-2)", "var(--chart-4)", "var(--chart-6)"]}
                numberFormat={jpy}
                height={240}
                showLegend={false}
              />
            </CardContent>
          </Card>
        </ResponsiveGrid>
      </Flex>
    </PageContainer>
  );
}
