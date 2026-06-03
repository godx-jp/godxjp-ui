import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { FormField, Select } from "@godxjp/ui/data-entry";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * Country picker — a RECIPE, not a component. There is no CountrySelect in @godxjp/ui:
 * a country picker is just a data-driven `Select` whose options carry a flag-prefixed label.
 * showSearch makes a long country list filterable; name= submits the ISO code with the form.
 * Build the options array from your own country data. Composed only from real @godxjp/ui.
 */

const COUNTRIES = [
  { value: "JP", label: "🇯🇵 日本", group: "アジア" },
  { value: "CN", label: "🇨🇳 中国", group: "アジア" },
  { value: "KR", label: "🇰🇷 韓国", group: "アジア" },
  { value: "VN", label: "🇻🇳 ベトナム", group: "アジア" },
  { value: "SG", label: "🇸🇬 シンガポール", group: "アジア" },
  { value: "US", label: "🇺🇸 アメリカ合衆国", group: "その他" },
  { value: "GB", label: "🇬🇧 イギリス", group: "ヨーロッパ" },
  { value: "DE", label: "🇩🇪 ドイツ", group: "ヨーロッパ" },
  { value: "FR", label: "🇫🇷 フランス", group: "ヨーロッパ" },
  { value: "AU", label: "🇦🇺 オーストラリア", group: "その他" },
];

export default function Demo() {
  const [billing, setBilling] = useState("JP");
  const [partner, setPartner] = useState("");

  return (
    <PageContainer
      title="Country picker (recipe)"
      subtitle="国旗付き国選択は Select のレシピ — 専用コンポーネントは無い"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>請求先の国（必須・日本デフォルト）</CardTitle>
            <CardDescription>
              options のラベルに国旗絵文字を前置し、value に ISO コードを持たせるだけ。 showSearch
              で絞り込み、name でフォーム送信する。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="billing-country" label="請求先の国" required>
              <Select
                id="billing-country"
                name="billingCountry"
                value={billing}
                onValueChange={setBilling}
                showSearch
                searchPlaceholder="国名で検索..."
                options={COUNTRIES}
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>取引先の国（任意・クリア可）</CardTitle>
            <CardDescription>
              clearable（デフォルト true）で「指定なし」に戻せる。placeholder で空状態を案内する。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="partner-country" label="取引先の国">
              <Select
                id="partner-country"
                name="partnerCountry"
                value={partner}
                onValueChange={setPartner}
                showSearch
                placeholder="国を選択..."
                searchPlaceholder="国名で検索..."
                options={COUNTRIES}
              />
            </FormField>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
