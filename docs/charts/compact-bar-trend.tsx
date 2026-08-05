import type * as React from "react";
import { Building2, UserPlus } from "lucide-react";
import { CompactBarTrend } from "@godxjp/ui/charts/compact-bar-trend";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  StatCard,
} from "@godxjp/ui/data-display";
import { Text } from "@godxjp/ui/general";
import { Flex, PageContainer, ResponsiveGrid } from "@godxjp/ui/layout";

/**
 * CompactBarTrend — the DEPENDENCY-FREE compact bar trend (gh#218).
 *
 * `BarChart` needs the `recharts` optional peer; a platform whose policy forbids screen
 * implementers from adding dependencies cannot use it, and used to fall back to a page-local
 * grid with inline heights. `CompactBarTrend` closes that gap: the marks are token-sized CSS
 * blocks, so the canonical SCR-201 admin dashboard gets a real framework chart with zero
 * consumer CSS, zero inline height math and zero hardcoded colour.
 *
 * Everything below is composed from real @godxjp/ui primitives only.
 */

/** Seven days of new organizations — the canonical SCR-201 dataset. */
const newOrganizations = [
  { date: "7/24", count: 4 },
  { date: "7/25", count: 7 },
  { date: "7/26", count: 2 },
  { date: "7/27", count: 9 },
  { date: "7/28", count: 5 },
  { date: "7/29", count: 12 },
  { date: "7/30", count: 8 },
];

/** N is not fixed at seven — a fortnight reads at the same density. */
const fortnight = [
  { date: "7/17", users: 120 },
  { date: "7/18", users: 168 },
  { date: "7/19", users: 96 },
  { date: "7/20", users: 74 },
  { date: "7/21", users: 210 },
  { date: "7/22", users: 188 },
  { date: "7/23", users: 152 },
  { date: "7/24", users: 240 },
  { date: "7/25", users: 196 },
  { date: "7/26", users: 88 },
  { date: "7/27", users: 132 },
  { date: "7/28", users: 174 },
  { date: "7/29", users: 262 },
  { date: "7/30", users: 208 },
];

/** Three points, zeros and a negative — the edge-data frame. */
const edgeData = [
  { period: "第1四半期", revenue: 0 },
  { period: "非常に長い期間ラベルの例", revenue: 4200000 },
  { period: "第3四半期", revenue: -180000 },
];

const jpy = { style: "currency", currency: "JPY", notation: "compact" } as const;

export default function Demo() {
  return (
    <PageContainer
      title="CompactBarTrend"
      subtitle="recharts 不要の軽量トレンド棒グラフ · 高さ・間隔・配色はすべて --chart-trend-* トークン"
    >
      <Flex direction="col" gap="lg">
        {/* ── 1. The canonical SCR-201 dashboard summary row ─────────────────────── */}
        <ResponsiveGrid columns={3}>
          <Card>
            <CardHeader>
              <CardTitle level={2}>新規組織（7日間）</CardTitle>
              <CardDescription>日別に作成された組織数。当日を強調表示。</CardDescription>
            </CardHeader>
            <CardContent>
              <Flex direction="col" gap="md">
                <StatCard label="今週の合計" value="47" delta="+18%" icon={Building2} />
                <CompactBarTrend
                  label="新規組織（7日間）"
                  description="日別に作成された組織数"
                  data={newOrganizations}
                  categoryKey="date"
                  valueKey="count"
                  emphasizedIndex={5}
                  size="xs"
                />
              </Flex>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle level={2}>アクティビティフッター</CardTitle>
              <CardDescription>
                footer スロットはプロットの外側（role=img の外）に描画されるため、リンクも操作可能。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Flex direction="col" gap="md">
                <StatCard label="新規ユーザー" value="1,284" delta="+6%" icon={UserPlus} />
                <CompactBarTrend
                  label="新規ユーザー（7日間）"
                  data={newOrganizations}
                  categoryKey="date"
                  valueKey="count"
                  emphasizedIndex={-1}
                  footer={
                    <Text size="xs" tone="muted">
                      最終更新 2026-07-30 09:00 JST
                    </Text>
                  }
                />
              </Flex>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle level={2}>空状態</CardTitle>
              <CardDescription>data が空のとき EmptyState を描画します。</CardDescription>
            </CardHeader>
            <CardContent>
              <Flex direction="col" gap="md">
                <CompactBarTrend
                  label="新規組織（データなし）"
                  data={[]}
                  categoryKey="date"
                  valueKey="count"
                  emptyMessage="この期間のデータはありません"
                />
                <CompactBarTrend
                  label="既定の空メッセージ"
                  data={[]}
                  categoryKey="date"
                  valueKey="count"
                />
              </Flex>
            </CardContent>
          </Card>
        </ResponsiveGrid>

        {/* ── 2. size — the xs|sm|md|lg plot-height tiers ────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>size · 高さティア</CardTitle>
            <CardDescription>
              xs（ダッシュボード要約カードの既定）· sm · md · lg。高さは --chart-trend-plot-height-*
              が所有し、px を書くことはありません。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveGrid columns={4}>
              {(["xs", "sm", "md", "lg"] as const).map((size) => (
                <CompactBarTrend
                  key={size}
                  label={`size="${size}"`}
                  data={newOrganizations}
                  categoryKey="date"
                  valueKey="count"
                  emphasizedIndex={-1}
                  size={size}
                />
              ))}
            </ResponsiveGrid>
          </CardContent>
        </Card>

        {/* ── 3. emphasizedIndex + showCategoryLabels + numberFormat ─────────────── */}
        <ResponsiveGrid columns={2}>
          <Card>
            <CardHeader>
              <CardTitle level={2}>emphasizedIndex</CardTitle>
              <CardDescription>
                未指定＝強調なし · 正の index · 負の index（-1 は最新）。強調は色だけに頼らず、
                代替テキストの該当行にも注記されます（WCAG 1.4.1）。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Flex direction="col" gap="md">
                <CompactBarTrend
                  label="強調なし"
                  data={newOrganizations}
                  categoryKey="date"
                  valueKey="count"
                  size="sm"
                />
                <CompactBarTrend
                  label="emphasizedIndex={0}（最初の日）"
                  data={newOrganizations}
                  categoryKey="date"
                  valueKey="count"
                  emphasizedIndex={0}
                  size="sm"
                />
                <CompactBarTrend
                  label="emphasizedIndex={-1}（最新の日）"
                  data={newOrganizations}
                  categoryKey="date"
                  valueKey="count"
                  emphasizedIndex={-1}
                  size="sm"
                />
              </Flex>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle level={2}>showCategoryLabels · numberFormat</CardTitle>
              <CardDescription>
                ラベルを消してもデータは代替テキストに残ります。値の書式は Intl.NumberFormat
                （ロケール自動）。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Flex direction="col" gap="md">
                <CompactBarTrend
                  label="14日間のアクティブユーザー（目盛りなし）"
                  description="7 点固定ではありません。N 件の category/value に対応します。"
                  data={fortnight}
                  categoryKey="date"
                  valueKey="users"
                  emphasizedIndex={-1}
                  showCategoryLabels={false}
                  size="sm"
                  numberFormat={{ notation: "compact" }}
                />
                <CompactBarTrend
                  label="四半期売上（通貨・端数データ）"
                  description="0・負数・長いカテゴリ名を含む edge-data フレーム。"
                  data={edgeData}
                  categoryKey="period"
                  valueKey="revenue"
                  emphasizedIndex={1}
                  size="sm"
                  numberFormat={jpy}
                />
              </Flex>
            </CardContent>
          </Card>
        </ResponsiveGrid>

        {/* ── 4. Responsive — 1440 / 1024 / 390 container widths ─────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>レスポンシブ · 1440 / 1024 / 390</CardTitle>
            <CardDescription>
              棒は flex 1 1 0 で幅を分け合うため、同じマークアップがどのコンテナ幅にも収まります。
              長い目盛りラベルはカードを広げずに省略されます。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="lg">
              {[1440, 1024, 390].map((width) => (
                <Flex key={width} direction="col" gap="sm" style={{ maxInlineSize: `${width}px` }}>
                  <Text size="xs" tone="muted">{`コンテナ幅 ${width}px`}</Text>
                  <CompactBarTrend
                    label="新規組織（7日間）"
                    description="日別に作成された組織数"
                    data={newOrganizations}
                    categoryKey="date"
                    valueKey="count"
                    emphasizedIndex={5}
                    footer={
                      <Text size="xs" tone="muted">
                        直近のアクティビティを見る
                      </Text>
                    }
                  />
                </Flex>
              ))}
            </Flex>
          </CardContent>
        </Card>

        {/* ── 5. Token theming (cardinal rules #44/#45) ──────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>トークンでのテーマ適用</CardTitle>
            <CardDescription>
              サービス側の theme.css が --chart-trend-*
              を一度上書きするだけで密度も配色も変わります。 ページ固有の CSS
              は不要です。ベースラインは既定で「静か」（#44）、opt-in で表示します。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveGrid columns={2}>
              <CompactBarTrend
                label="既定"
                data={newOrganizations}
                categoryKey="date"
                valueKey="count"
                emphasizedIndex={-1}
                size="sm"
              />
              <Flex
                direction="col"
                style={
                  {
                    "--chart-trend-bar-gap": "var(--space-1)",
                    "--chart-trend-bar-radius": "var(--radius-pill)",
                    "--chart-trend-bar-max-width": "var(--space-3)",
                    "--chart-trend-bar-background": "hsl(var(--chart-2) / 0.35)",
                    "--chart-trend-bar-emphasis-background": "hsl(var(--chart-2))",
                    "--chart-trend-baseline-border": "1px solid hsl(var(--border))",
                  } as React.CSSProperties
                }
              >
                <CompactBarTrend
                  label="テーマ適用（間隔・角丸・配色・ベースライン）"
                  data={newOrganizations}
                  categoryKey="date"
                  valueKey="count"
                  emphasizedIndex={-1}
                  size="sm"
                />
              </Flex>
            </ResponsiveGrid>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
