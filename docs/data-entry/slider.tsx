import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { FormField, Slider } from "@godxjp/ui/data-entry";
import { Flex, PageContainer, ResponsiveGrid } from "@godxjp/ui/layout";
import { Text } from "@godxjp/ui/general";

/**
 * Slider — react-aria-components underneath, the antd 6 API on top.
 * `value` is a plain number for one thumb and an array for a `range`; the Radix-era
 * `number[]` + `onValueChange` spelling still compiles and still works.
 * Use `onChange` for live UI and `onChangeComplete` for the expensive work.
 * Composed only from real @godxjp/ui components.
 */
const yen = (value: number) =>
  new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" }).format(value);

export default function Demo() {
  const [taxRate, setTaxRate] = useState(10);
  const [amountRange, setAmountRange] = useState<number[]>([50000, 300000]);
  const [committedRange, setCommittedRange] = useState<number[]>([50000, 300000]);
  const [plan, setPlan] = useState(30);
  const [allocation, setAllocation] = useState<number[]>([40]);
  const [bands, setBands] = useState<number[]>([25, 60]);
  const [volume, setVolume] = useState(60);

  return (
    <PageContainer
      title="Slider"
      subtitle="数値スライダー · 単一は number、range は [number, number] · onChange は逐次、onChangeComplete は確定時"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>単一スライダー · 税率設定</CardTitle>
            <CardDescription>
              antd と同じ書き味: value に数値を渡し、onChange が数値を返す。tooltip.formatter は
              吹き出しの表記であると同時に読み上げ (aria-valuetext) にもなる。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="tax-rate" label={`消費税率: ${taxRate}%`} helper="0% / 2% 刻みで選択">
              <Slider
                value={taxRate}
                onChange={setTaxRate}
                min={0}
                max={10}
                step={2}
                name="tax_rate"
                tooltip={{ formatter: (value) => `${value}%` }}
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>レンジスライダー · 請求金額フィルタ</CardTitle>
            <CardDescription>
              range を明示すると、値が未到着でも [min, max] の 2 つのつまみで描画される。
              再取得のような重い処理は onChangeComplete に置く。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <FormField
                id="amount-range"
                label={`請求金額: ${yen(amountRange[0])} 〜 ${yen(amountRange[1])}`}
              >
                <Slider
                  range
                  value={amountRange}
                  onChange={setAmountRange}
                  onChangeComplete={setCommittedRange}
                  min={0}
                  max={1000000}
                  step={10000}
                  minStepsBetweenThumbs={1}
                  tooltip={{ formatter: yen }}
                />
              </FormField>
              <Text tone="muted" size="sm">
                確定値 (onChangeComplete): {yen(committedRange[0])} 〜 {yen(committedRange[1])}
              </Text>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>目盛りだけを値にする · step={"{null}"}</CardTitle>
            <CardDescription>
              marks と step={"{null}"} を組み合わせると、つまみは目盛り・min・max にしか止まらない。
              dots は目盛りごとの点で、included の範囲内だけが濃くなる。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="plan" label={`料金プラン: ${plan}`} helper="無料 / 標準 / 上位 / 特別">
              <Slider
                value={plan}
                onChange={setPlan}
                step={null}
                dots
                marks={{
                  0: "無料",
                  30: "標準",
                  70: "上位",
                  100: { style: { fontWeight: 700 }, label: "特別" },
                }}
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>予算配分 · Radix 時代の書き方も有効</CardTitle>
            <CardDescription>
              number[] の value と onValueChange / onValueCommit はそのまま動く。name を付ければ
              JavaScript なしでフォーム送信できる (つまみが複数なら name[])。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              id="allocation"
              label={`広告費配分: ${allocation[0]}%`}
              helper={`残り ${100 - allocation[0]}% が運転資金へ充当されます`}
            >
              <Slider
                value={allocation}
                onValueChange={setAllocation}
                min={0}
                max={100}
                step={5}
                name="ad_allocation"
                marks={{ 0: "0%", 50: "50%", 100: "100%" }}
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>編集できるレンジ · range={"{{ editable: true }}"}</CardTitle>
            <CardDescription>
              レール上を押すとつまみが増え、Delete / Backspace で減る (minCount 〜 maxCount)。
              included=false は「ここまで」を塗らない目盛り専用のレール。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveGrid columns={{ base: 1, md: 2 }} gap="lg">
              <FormField id="bands" label={`区切り: ${bands.join(" / ")}`}>
                <Slider
                  range={{ editable: true, minCount: 1, maxCount: 4, draggableTrack: false }}
                  value={bands}
                  onChange={setBands}
                  step={5}
                />
              </FormField>
              <FormField id="scale" label="評価スケール (included={false})">
                <Slider
                  defaultValue={50}
                  included={false}
                  marks={{ 0: "低", 50: "中", 100: "高" }}
                />
              </FormField>
            </ResponsiveGrid>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>縦・逆向き・無効</CardTitle>
            <CardDescription>
              vertical は下が min、reverse は向きを入れ替える (矢印キーも一緒に反転)。 disabled
              は配列でつまみ単位にもできる。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveGrid columns={{ base: 1, md: 3 }} gap="lg">
              <FormField id="volume-vertical" label={`音量 (縦): ${volume}`}>
                <Slider
                  vertical
                  value={volume}
                  onChange={setVolume}
                  marks={{ 0: "0", 50: "50", 100: "100" }}
                  tooltip
                />
              </FormField>
              <FormField id="countdown" label="残り日数 (reverse)">
                <Slider
                  reverse
                  defaultValue={30}
                  max={60}
                  step={5}
                  marks={{ 0: "0日", 30: "30日", 60: "60日" }}
                />
              </FormField>
              <FormField id="locked-rate" label="確定済み税率 (変更不可)">
                <Slider value={10} disabled min={0} max={20} step={1} />
              </FormField>
            </ResponsiveGrid>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
