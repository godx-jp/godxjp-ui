import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { ColorPicker, FormField } from "@godxjp/ui/data-entry";
import { Text } from "@godxjp/ui/general";
import { useTranslation } from "@godxjp/ui/i18n";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/** A fixed tag palette (gh#1055): tags pick from it, never from free hex. */
const TAG_PALETTE = ["#dc2626", "#ea580c", "#ca8a04", "#16a34a", "#0891b2", "#2563eb", "#9333ea"];

/**
 * ColorPicker — hex color swatch + optional editable hex input.
 * Always initialize state to a valid 3- or 6-digit hex string.
 * Use controlled mode (value + onValueChange); no uncontrolled path.
 * Composed only from real @godxjp/ui components.
 *
 * `presets` / `panelRender` port antd ColorPicker (gh#1055). Deviations from antd, on purpose:
 * - `colors` are hex strings only — the value is hex; antd also takes colour objects/gradients.
 * - There is no popover: the picker is inline, so `panelRender` replaces the inline body. The
 *   presets-only recipe is antd's own: `panelRender={(_, { components: { Presets } }) => <Presets />}`.
 * - Each swatch is a real radio (APG radio group, named by its hex, arrow keys select); antd's
 *   preset blocks are click-only divs.
 */
export default function Demo() {
  const [brandColor, setBrandColor] = useState("#2563eb");
  const [accentColor, setAccentColor] = useState("#16a34a");
  const [categoryColor, setCategoryColor] = useState("#dc2626");
  const [validatedColor, setValidatedColor] = useState("#9333ea");
  const [labelColor, setLabelColor] = useState("#16a34a");
  const [tagColor, setTagColor] = useState("#2563eb");
  const { t } = useTranslation();

  return (
    <PageContainer title="ColorPicker" subtitle="カラーピッカー · スウォッチ＋Hex入力">
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>ブランドカラー設定</CardTitle>
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
            <CardTitle level={2}>アクセントカラー（Hex入力付き）</CardTitle>
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
            <CardTitle level={2}>勘定科目カテゴリカラー（スウォッチのみ）</CardTitle>
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
            <CardTitle level={2}>{t("showcase.colorPicker.presetsTitle")}</CardTitle>
            <CardDescription>{t("showcase.colorPicker.presetsDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="label-color" label={t("showcase.colorPicker.paletteLabel")}>
              <ColorPicker
                id="label-color"
                value={labelColor}
                onValueChange={setLabelColor}
                presets={[
                  {
                    key: "recommended",
                    label: t("showcase.colorPicker.recommendedGroup"),
                    colors: TAG_PALETTE,
                  },
                  {
                    key: "recent",
                    label: t("showcase.colorPicker.recentGroup"),
                    colors: ["#2563eb", "#16a34a"],
                    defaultOpen: false,
                  },
                ]}
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>{t("showcase.colorPicker.presetsOnlyTitle")}</CardTitle>
            <CardDescription>{t("showcase.colorPicker.presetsOnlyDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              id="tag-color"
              label={t("showcase.colorPicker.tagColorLabel")}
              helper={t("showcase.colorPicker.tagColorHelper")}
            >
              <ColorPicker
                id="tag-color"
                name="tag_color"
                value={tagColor}
                onValueChange={setTagColor}
                presets={[
                  {
                    key: "tags",
                    label: t("showcase.colorPicker.recommendedGroup"),
                    colors: TAG_PALETTE,
                  },
                ]}
                panelRender={(_, { components: { Presets } }) => <Presets />}
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Hex バリデーションと確定動作</CardTitle>
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
            <CardTitle level={2}>無効状態</CardTitle>
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
