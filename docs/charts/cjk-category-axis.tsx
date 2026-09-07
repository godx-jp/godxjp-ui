import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import { BarChart } from "@godxjp/ui/charts";

/**
 * 横棒グラフの分類軸と、カードの見出しとの重複 — gh#409 · 1 と 2。
 *
 * 監理団体の実習実施者（受入企業）名は「株式会社」を含む 8〜10 文字の全角で、幅は 100〜125px に
 * なります。分類軸の幅を固定にすると、名前の**先頭**、つまり識別に必要な部分から切り落とされます。
 * BarChart は実際に描画される字形で各目盛りを実測し、いちばん広い目盛りに合わせて軸を確保します。
 * 上限はトークン `--chart-category-axis-max-fraction` が持ち、これを超える名前だけが**末尾**で
 * 省略され、全文は目盛りの `<title>` と図の代替テキストに残ります。
 *
 * 下段のカードは `showCaption={false}`。`CardTitle` が見出しを担うので、キャプションは
 * `sr-only` として DOM に残り、`role="img"` の名前は失われません。
 */

/** 実習実施者ごとの受入人数。企業名は 8〜10 文字の全角で、固定幅の軸では先頭が消えていました。 */
const acceptances = [
  { company: "株式会社山田製作所", trainees: 42 },
  { company: "佐藤食品株式会社", trainees: 35 },
  { company: "株式会社中村建設", trainees: 28 },
  { company: "東海精密工業株式会社", trainees: 24 },
  { company: "みどり農産株式会社", trainees: 18 },
  { company: "大和金属加工株式会社", trainees: 12 },
];

export default function Demo() {
  return (
    <PageContainer
      title="CJK category axis"
      subtitle="横棒グラフの分類軸を実測で確保し、見出しの重複をなくす"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>横棒 BarChart · 分類軸は目盛りの実測で決まる</CardTitle>
            <CardDescription>
              いちばん広い目盛りに合わせて軸幅を確保します。キャプションは既定どおり表示。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart
              id="cjk-axis-chart"
              label="実習実施者別 受入人数"
              data={acceptances}
              categoryKey="company"
              series={[{ dataKey: "trainees", label: "受入人数" }]}
              showLegend={false}
              size="md"
              horizontal
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>実習実施者別 受入人数</CardTitle>
            <CardDescription>
              `showCaption={"{false}"}` — 見出しは CardTitle が担い、キャプションは sr-only
              として残るのでアクセシブルな名前は保たれます。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart
              id="cjk-axis-chart-no-caption"
              label="実習実施者別 受入人数"
              data={acceptances}
              categoryKey="company"
              series={[{ dataKey: "trainees", label: "受入人数" }]}
              showLegend={false}
              showCaption={false}
              size="md"
              horizontal
            />
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
