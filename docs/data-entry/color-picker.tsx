import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { ColorPicker, FormField } from "@godxjp/ui/data-entry";
import { Text } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * ColorPicker — hex color swatch + optional editable hex input.
 * Always initialize state to a valid 3- or 6-digit hex string.
 * Use controlled mode (value + onValueChange); no uncontrolled path.
 * Composed only from real @godxjp/ui components.
 */
export default function Demo() {
  const [brandColor, setBrandColor] = useState("#2563eb");
  const [accentColor, setAccentColor] = useState("#16a34a");
  const [categoryColor, setCategoryColor] = useState("#dc2626");
  const [validatedColor, setValidatedColor] = useState("#9333ea");

  return (
    <PageContainer title="ColorPicker" subtitle="カラーピッカー · スウォッチ＋Hex入力">
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>ブランドカラー設定</CardTitle>
            <CardDescription>
              FormField と組み合わせてラベル・バリデーションを付与。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="brand-color" label="ブランドカラー">
              <ColorPicker id="brand-color" value={brandColor} onValueChange={setBrandColor} />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>アクセントカラー（Hex入力付き）</CardTitle>
            <CardDescription>
              showHexInput={"{true}"} — デフォルト。Hex 文字列を直接編集可能。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="accent-color" label="アクセントカラー" helper="請求書のテーマカラー">
              <ColorPicker
                id="accent-color"
                value={accentColor}
                onValueChange={setAccentColor}
                showHexInput
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>勘定科目カテゴリカラー（スウォッチのみ）</CardTitle>
            <CardDescription>
              showHexInput={"{false}"} — テーブルセルやサイドバーのコンパクト表示向け。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="category-color" label="カテゴリカラー">
              <Flex direction="row" gap="md" className="items-center">
                <ColorPicker
                  id="category-color"
                  value={categoryColor}
                  onValueChange={setCategoryColor}
                  showHexInput={false}
                />
                <Text tone="muted">選択中: {categoryColor}</Text>
              </Flex>
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hex バリデーションと確定動作</CardTitle>
            <CardDescription>
              Hex 入力は blur または Enter で確定。確定時に #RGB / #RRGGBB
              形式でなければ、直前の有効な値へ自動的に巻き戻る。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              id="validated-color"
              label="ラベルカラー"
              helper="例えば「zzz」と入力して Enter を押すと、入力は破棄され #9333EA に戻る。"
            >
              <ColorPicker
                id="validated-color"
                value={validatedColor}
                onValueChange={setValidatedColor}
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>無効状態</CardTitle>
            <CardDescription>
              disabled · スウォッチと Hex 入力の両方が無効化される。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="disabled-color" label="テーマカラー">
              <ColorPicker id="disabled-color" value="#6b7280" disabled />
            </FormField>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
