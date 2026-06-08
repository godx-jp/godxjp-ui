import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { FormField, NumberInput } from "@godxjp/ui/data-entry";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import { Heading, Text } from "@godxjp/ui/general";

/**
 * NumberInput — WAI-ARIA spinbutton for localized numeric entry. Composes the real `Input`
 * primitive (role="spinbutton", inputMode="decimal") with stacked increment/decrement `Button`s.
 * Type freely, ArrowUp/ArrowDown (Shift = ×10) step, value commits clamped to min/max + rounded to
 * precision on blur/Enter. Steppers disable at the bounds. Composed only from real @godxjp/ui.
 */
export default function Demo() {
  const [quantity, setQuantity] = useState<number | null>(1);
  const [rating, setRating] = useState<number | null>(3);
  const [price, setPrice] = useState<number | null>(1980);
  const [discount, setDiscount] = useState<number | null>(10);

  return (
    <PageContainer title="NumberInput" subtitle="数値入力 — スピンボタン (Input + ステッパー)">
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>基本 (controlled)</CardTitle>
            <CardDescription>
              value + onValueChange で number | null を制御。空欄は null。ArrowUp/Down
              またはステッパーで step ずつ増減。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="ni-quantity" label="数量">
              <NumberInput
                id="ni-quantity"
                name="quantity"
                value={quantity}
                onValueChange={setQuantity}
                aria-label="数量"
              />
            </FormField>
            <Text size="sm" tone="muted">
              現在値: {quantity ?? "（空）"}
            </Text>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>min / max — 範囲クランプ</CardTitle>
            <CardDescription>
              min=1, max=5。境界でステッパーが無効化され、コミット時に範囲内へクランプされる。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="ni-rating" label="評価 (1–5)">
              <NumberInput
                id="ni-rating"
                name="rating"
                value={rating}
                onValueChange={setRating}
                min={1}
                max={5}
                aria-label="評価"
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>step — 刻み幅</CardTitle>
            <CardDescription>
              step=100 で 100 単位の増減。Shift + Arrow で ×10 (1000 刻み)。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="ni-step" label="目標金額 (100 刻み)">
              <NumberInput
                id="ni-step"
                name="target"
                defaultValue={5000}
                step={100}
                min={0}
                aria-label="目標金額"
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>precision — 小数桁</CardTitle>
            <CardDescription>
              precision=2, step=0.25。コミット時に小数 2 桁へ丸め、Intl.NumberFormat で整形。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="ni-precision" label="重量 (kg)">
              <NumberInput
                id="ni-precision"
                name="weight"
                defaultValue={2.5}
                step={0.25}
                precision={2}
                min={0}
                aria-label="重量"
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>prefix / suffix — ¥ と %</CardTitle>
            <CardDescription>
              通貨記号や単位を装飾的な affix として表示 (aria-hidden)。値は生の数値のまま。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="row" gap="md" wrap>
              <FormField id="ni-price" label="価格">
                <NumberInput
                  id="ni-price"
                  name="price"
                  value={price}
                  onValueChange={setPrice}
                  prefix="¥"
                  step={10}
                  min={0}
                  aria-label="価格"
                />
              </FormField>
              <FormField id="ni-discount" label="割引率">
                <NumberInput
                  id="ni-discount"
                  name="discount"
                  value={discount}
                  onValueChange={setDiscount}
                  suffix="%"
                  min={0}
                  max={100}
                  aria-label="割引率"
                />
              </FormField>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>uncontrolled (defaultValue)</CardTitle>
            <CardDescription>
              React 管理不要なネイティブフォーム。送信時に name 経由で値が渡される。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="ni-uncontrolled" label="在庫数 (非制御)">
              <NumberInput
                id="ni-uncontrolled"
                name="stock"
                defaultValue={42}
                min={0}
                placeholder="0"
                aria-label="在庫数"
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>disabled / readOnly</CardTitle>
            <CardDescription>
              disabled は操作不可、readOnly は値を表示・選択できるが編集・ステップ不可。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="row" gap="md" wrap>
              <FormField id="ni-disabled" label="確定数量 (disabled)">
                <NumberInput
                  id="ni-disabled"
                  name="locked_qty"
                  value={3}
                  disabled
                  aria-label="確定数量"
                />
              </FormField>
              <FormField id="ni-readonly" label="参照値 (readOnly)">
                <NumberInput
                  id="ni-readonly"
                  name="ref_value"
                  value={128}
                  readOnly
                  aria-label="参照値"
                />
              </FormField>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>size — xs / sm / md / lg</CardTitle>
            <CardDescription>
              制御高さティア (--control-height) に連動。行内の他コントロールと整列。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <FormField id="ni-xs" label="xs">
                <NumberInput id="ni-xs" size="xs" defaultValue={1} aria-label="xs サイズ" />
              </FormField>
              <FormField id="ni-sm" label="sm">
                <NumberInput id="ni-sm" size="sm" defaultValue={2} aria-label="sm サイズ" />
              </FormField>
              <FormField id="ni-md" label="md (既定)">
                <NumberInput id="ni-md" size="md" defaultValue={3} aria-label="md サイズ" />
              </FormField>
              <FormField id="ni-lg" label="lg">
                <NumberInput id="ni-lg" size="lg" defaultValue={4} aria-label="lg サイズ" />
              </FormField>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Heading level={4}>キーボード操作</Heading>
          </CardHeader>
          <CardContent>
            <Text size="sm" tone="muted">
              ↑ / ↓ で step 増減・Shift + ↑ / ↓ で ×10・Enter で確定 (クランプ + 丸め)・Tab
              でフォーカス移動。ステッパーは tabIndex=-1 でキーボードのタブ順を汚さない。
            </Text>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
