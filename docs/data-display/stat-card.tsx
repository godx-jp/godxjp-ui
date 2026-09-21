import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Progress,
  StatCard,
} from "@godxjp/ui/data-display";
import { Badge } from "@godxjp/ui/data-display";
import { CompactBarTrend } from "@godxjp/ui/charts/compact-bar-trend";
import { Text } from "@godxjp/ui/general";
import { Flex, PageContainer, ResponsiveGrid } from "@godxjp/ui/layout";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Database,
  Package,
  Percent,
  Ship,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

/**
 * StatCard — KPI tile.
 *
 * WHY THIS PAGE IS LONG. It was 99 lines and four tidy tiles, and the owner's verdict on the
 * published site was that nothing here lets you judge whether the component is any good. That is
 * the correct verdict: a KPI tile is trivial with `¥8,200,000` and a `+12%` delta. It is worth
 * something only when the number is a 14-digit total, the label is a three-clause Japanese noun
 * phrase, the delta means the opposite of what its sign says, or the value has not arrived yet.
 *
 * So every section below is a case a real dashboard hits, and several of them are the cases that
 * BREAK a naive tile. If a section looks ugly, that is the page doing its job — the component has
 * to earn it, not the sample data.
 *
 * StatCard IS already a bordered Card, so it renders DIRECTLY in ResponsiveGrid — never wrapped in
 * Card/CardContent, which double-borders it.
 */
const trend7 = [
  { d: "月", v: 42 },
  { d: "火", v: 51 },
  { d: "水", v: 38 },
  { d: "木", v: 64 },
  { d: "金", v: 72 },
  { d: "土", v: 21 },
  { d: "日", v: 9 },
];

/** A section heading. Headings are headings, not Cards — a Card here would nest borders. */
function Section({
  title,
  why,
  children,
}: {
  title: string;
  why: string;
  children: React.ReactNode;
}) {
  return (
    <Flex direction="col" gap="sm">
      <Text as="div" weight="medium">
        {title}
      </Text>
      <Text as="div" size="sm" tone="muted">
        {why}
      </Text>
      {children}
    </Flex>
  );
}

export default function Demo() {
  return (
    <PageContainer title="StatCard" subtitle="KPI tile — every shape a real dashboard asks for">
      <Flex direction="col" gap="lg">
        <Section
          title="1 · KPI row"
          why="The baseline: label, value, delta, hint. delta is sign-aware — + reads success, − reads destructive."
        >
          <ResponsiveGrid columns={{ sm: 2, md: 4 }}>
            <StatCard label="月次売上" value="¥8,200,000" delta="+12%" hint="先月比" />
            <StatCard label="請求件数" value="312" delta="+4%" />
            <StatCard label="売掛金残高" value="¥1,284,500" hint="未回収 18件" />
            <StatCard label="回収率" value="96.8%" delta="+1.2%" />
          </ResponsiveGrid>
        </Section>

        <Section
          title="2 · inline layout, and align=end for a numeric column"
          why="`inline` puts label and value on one line for a dense sidebar. `align=end` right-aligns the value so a stack of tiles reads as a column of numbers rather than ragged text."
        >
          <ResponsiveGrid columns={{ sm: 1, md: 2 }}>
            <StatCard layout="inline" label="本日の受注" value="47" delta="+6" />
            <StatCard layout="inline" align="end" label="本日の出荷" value="1,204" delta="−2%" />
            <StatCard layout="inline" align="end" label="返品" value="3" delta="+1" inverse />
            <StatCard layout="inline" align="end" label="在庫金額" value="¥42,880,000" />
          </ResponsiveGrid>
        </Section>

        <Section
          title="3 · inverse — when UP is bad"
          why="A cost, an error count or a return rate rising is not good news. `inverse` flips the delta's colour so the tile agrees with the business, not with the arithmetic. Compare the two pairs: identical numbers, opposite meaning."
        >
          <ResponsiveGrid columns={{ sm: 2, md: 4 }}>
            <StatCard label="新規顧客" value="128" delta="+18%" hint="増えて良い" />
            <StatCard label="解約数" value="128" delta="+18%" inverse hint="増えて悪い" />
            <StatCard label="平均対応時間" value="4分12秒" delta="−22%" inverse hint="減って良い" />
            <StatCard label="エラー率" value="0.42%" delta="+0.1pt" inverse />
          </ResponsiveGrid>
        </Section>

        <Section
          title="4 · accent + icon"
          why="`accent` tints the tile's mark, not its text — it groups tiles by domain (revenue / fulfilment / risk) without competing with the delta's own colour."
        >
          <ResponsiveGrid columns={{ sm: 2, md: 4 }}>
            <StatCard accent="primary" icon={Wallet} label="入金" value="¥3,120,000" delta="+8%" />
            <StatCard
              accent="success"
              icon={CheckCircle2}
              label="検品通過"
              value="1,182"
              delta="+3%"
            />
            <StatCard
              accent="warning"
              icon={Clock}
              label="期限間近"
              value="23"
              delta="+9"
              inverse
            />
            <StatCard accent="info" icon={Ship} label="輸送中" value="58" hint="うち通関待ち 7" />
          </ResponsiveGrid>
        </Section>

        <Section
          title="5 · with a sparkline — the tile plus its shape over time"
          why="A number says where you are; a trend says how you got here. CompactBarTrend goes in `hint`, which takes any node. `size=xs` keeps the tile the same height as a plain one, so a mixed row still lines up."
        >
          <ResponsiveGrid columns={{ sm: 1, md: 3 }}>
            <StatCard
              icon={TrendingUp}
              label="週次受注"
              value="297"
              delta="+11%"
              hint={
                <CompactBarTrend
                  data={trend7}
                  categoryKey="d"
                  valueKey="v"
                  label="7日間の受注推移"
                  size="xs"
                  emphasizedIndex={4}
                />
              }
            />
            <StatCard
              icon={Package}
              label="出荷数"
              value="1,204"
              delta="−2%"
              hint={
                <CompactBarTrend
                  data={trend7}
                  categoryKey="d"
                  valueKey="v"
                  label="7日間の出荷推移"
                  size="xs"
                />
              }
            />
            <StatCard
              icon={Users}
              label="稼働ユーザー"
              value="8,412"
              delta="+240"
              hint={
                <CompactBarTrend
                  data={trend7}
                  categoryKey="d"
                  valueKey="v"
                  label="7日間の稼働推移"
                  size="xs"
                  showCategoryLabels
                />
              }
            />
          </ResponsiveGrid>
        </Section>

        <Section
          title="6 · with a ring or a bar — a number that is a proportion"
          why="A count out of a total is not a delta, it is a completion. The ring carries the proportion inside the tile; the bar carries a three-way breakdown. Both go in `hint` for the same reason the sparkline does."
        >
          <ResponsiveGrid columns={{ sm: 1, md: 3 }}>
            <StatCard
              label="月次締め処理"
              value="26 / 42"
              hint={<Progress shape="ring" size="sm" value={62} label="26/42" />}
            />
            <StatCard
              label="検収完了"
              value="88%"
              delta="+6pt"
              hint={<Progress value={88} tone="success" label="検収完了 88%" />}
            />
            <StatCard
              label="請求ステータス"
              value="17 件"
              hint={
                <Progress
                  segments={[
                    { value: 2, tone: "destructive", label: "期限超過" },
                    { value: 3, tone: "warning", label: "期限間近" },
                    { value: 12, tone: "success", label: "対応済" },
                  ]}
                  aria-label="請求ステータス内訳"
                />
              }
            />
          </ResponsiveGrid>
        </Section>

        <Section
          title="7 · the kinds of number a dashboard actually shows"
          why="Currency, percentage, count, duration, ratio, bytes and a date each format differently and each has a different natural width. A tile that only ever holds ¥8,200,000 has not been tested."
        >
          <ResponsiveGrid columns={{ sm: 2, md: 4 }}>
            <StatCard icon={Wallet} label="通貨" value="¥8,214,930" delta="+12%" hint="JPY・税込" />
            <StatCard
              icon={Percent}
              label="百分率"
              value="96.8%"
              delta="+1.2pt"
              hint="pt と % は別物"
            />
            <StatCard icon={Package} label="件数" value="1,284" delta="+96" hint="単位は件" />
            <StatCard icon={Clock} label="所要時間" value="4分12秒" delta="−22%" inverse />
            <StatCard label="比率" value="3.4 : 1" hint="受注 : 返品" />
            <StatCard
              icon={Database}
              label="容量"
              value="812.4 GB"
              delta="+4.1 GB"
              inverse
              hint="上限 1 TB"
            />
            <StatCard label="最終同期" value="3分前" hint="2026-09-21 10:02" />
            <StatCard label="多通貨" value="$54,210" hint="USD・参考レート ¥147.2" />
          </ResponsiveGrid>
        </Section>

        <Section
          title="8 · the cases that break a naive tile"
          why="This row is deliberately hostile, and it is the only row on this page that can tell you whether StatCard is good. A long Japanese label must wrap without shoving the value out; a 14-digit total must not collide with its delta; zero is not the same as missing; a negative balance must still read as a number and not as an error."
        >
          <ResponsiveGrid columns={{ sm: 1, md: 3 }}>
            <StatCard
              label="グローバル人事情報基盤・従業員セルフサービス利用率（アジア太平洋地域）"
              value="72.4%"
              delta="+3.1pt"
              hint="ラベルが3行に折り返しても、値と delta は動かない"
            />
            <StatCard
              label="累計取扱高"
              value="¥128,400,932,517"
              delta="+0.8%"
              hint="14桁でも delta と衝突しない"
            />
            <StatCard label="未処理" value="0" hint="ゼロは「無い」であって「未取得」ではない" />
            <StatCard label="取得中" value="—" hint="値が来ていない。0 と区別が付くこと" />
            <StatCard
              label="差引残高"
              value="−¥412,880"
              delta="−12%"
              inverse
              hint="マイナスの値そのもの"
            />
            <StatCard
              icon={AlertTriangle}
              accent="warning"
              label="要確認"
              value="3"
              delta="+3"
              inverse
              hint={
                <Badge tone="warning" variant="outline">
                  承認待ち
                </Badge>
              }
            />
          </ResponsiveGrid>
        </Section>

        <Section
          title="9 · one row, mixed shapes"
          why="Dashboards do not use one variant at a time. A plain tile, a sparkline tile, a ring tile and an inline tile share a row here: if their heights or baselines disagree, it shows up here and nowhere else."
        >
          <ResponsiveGrid columns={{ sm: 2, md: 4 }}>
            <StatCard label="売上" value="¥8,200,000" delta="+12%" />
            <StatCard
              label="受注"
              value="297"
              hint={
                <CompactBarTrend
                  data={trend7}
                  categoryKey="d"
                  valueKey="v"
                  label="受注推移"
                  size="xs"
                />
              }
            />
            <StatCard
              label="締め"
              value="62%"
              hint={<Progress shape="ring" size="sm" value={62} label="62%" />}
            />
            <StatCard layout="inline" align="end" label="返品" value="3" delta="+1" inverse />
          </ResponsiveGrid>
        </Section>

        <Card>
          <CardHeader>
            <CardTitle level={2}>使い方の要点</CardTitle>
            <CardDescription>この3点を外すと、上のどれかが必ず崩れます。</CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="sm">
              <Text as="div" size="sm">
                StatCard は<strong>それ自体がカード</strong>です。ResponsiveGrid
                に直接置いてください。Card/CardContent で包むと枠が二重になります。
              </Text>
              <Text as="div" size="sm">
                delta は<strong>符号で色が決まります</strong>
                。増えて困る指標（解約・エラー・コスト）には必ず
                <code>inverse</code> を付けてください。付け忘れは「悪化を緑で祝う」表示になります。
              </Text>
              <Text as="div" size="sm">
                <code>hint</code> は ReactNode です。文字列だけでなく、上のように
                CompactBarTrend・Progress・Badge をそのまま入れられます。
              </Text>
            </Flex>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
