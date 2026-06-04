import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { FormField, Slider } from "@godxjp/ui/data-entry";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * Slider — Radix Slider wrapper. value/defaultValue MUST be number[] not a plain
 * number. Single-thumb: [50], dual-thumb range: [20, 80].
 * Use onValueCommit (not onValueChange) for expensive side-effects.
 * Composed only from real @godxjp/ui components.
 */
export default function Demo() {
  const [taxRate, setTaxRate] = useState<number[]>([10]);
  const [amountRange, setAmountRange] = useState<number[]>([50000, 300000]);
  const [allocation, setAllocation] = useState<number[]>([40]);

  return (
    <PageContainer
      title="Slider"
      subtitle="Numeric range slider — value/defaultValue must be number[] (single-thumb: [n], range: [min, max])"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>単一スライダー — 税率設定</CardTitle>
            <CardDescription>
              Single-thumb controlled slider. value={`[n]`} — plain number breaks rendering.
              onValueChange fires on every drag; onValueCommit fires on release.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <FormField
                id="tax-rate"
                label={`消費税率: ${taxRate[0]}%`}
                helper="0% / 8% (軽減税率) / 10% から選択"
              >
                <Slider
                  value={taxRate}
                  onValueChange={setTaxRate}
                  min={0}
                  max={10}
                  step={2}
                  name="tax_rate"
                  aria-label="消費税率"
                />
              </FormField>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>レンジスライダー — 請求金額フィルタ</CardTitle>
            <CardDescription>
              Dual-thumb range slider: value={`[min, max]`}. Use minStepsBetweenThumbs to prevent
              thumbs overlapping.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              id="amount-range"
              label={`請求金額: ¥${amountRange[0].toLocaleString()} 〜 ¥${amountRange[1].toLocaleString()}`}
            >
              <Slider
                value={amountRange}
                onValueChange={setAmountRange}
                onValueCommit={(v) => {
                  // expensive filter refetch only on commit (pointer/key release)
                  void v;
                }}
                min={0}
                max={1000000}
                step={10000}
                minStepsBetweenThumbs={1}
                aria-label="請求金額範囲"
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>予算配分スライダー</CardTitle>
            <CardDescription>
              step=5 for coarse granularity. Use name= to submit with a native form without JS
              wiring.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              id="allocation"
              label={`広告費配分: ${allocation[0]}%`}
              helper="残り ${100 - allocation[0]}% が運転資金へ充当されます"
            >
              <Slider
                value={allocation}
                onValueChange={setAllocation}
                min={0}
                max={100}
                step={5}
                name="ad_allocation"
                aria-label="広告費配分"
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Disabled (read-only indicator)</CardTitle>
            <CardDescription>
              Pass disabled with a controlled value to show a non-interactive bar. Use Progress for
              pure status display.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="locked-rate" label="確定済み税率 (変更不可)">
              <Slider value={[10]} disabled min={0} max={20} step={1} aria-label="確定済み税率" />
            </FormField>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
