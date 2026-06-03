import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { ColorPicker, FormField } from "@godxjp/ui/data-entry";
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

  return (
    <PageContainer title="ColorPicker" subtitle="カラーピッカー — スウォッチ＋Hex入力">
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
            <Flex direction="row" gap="md" className="items-center">
              <ColorPicker
                value={categoryColor}
                onValueChange={setCategoryColor}
                showHexInput={false}
              />
              <span className="text-muted-foreground text-sm">選択中: {categoryColor}</span>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>無効状態</CardTitle>
            <CardDescription>
              disabled — スウォッチと Hex 入力の両方が無効化される。
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
