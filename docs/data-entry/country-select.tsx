import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { CountrySelect, FormField } from "@godxjp/ui/data-entry";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * CountrySelect — 国旗付き国選択ピッカー（Select ベース）。
 * 非制御のみ: value/onChange は使用不可。defaultValue と name を渡す。
 * options は CountryOptionProp[] で name + value (ISO コード) が必須。
 * Never a raw <select>. Composed only from real @godxjp/ui components.
 */

const COUNTRIES = [
  { value: "JP", name: "Japan", nativeName: "日本" },
  { value: "US", name: "United States", nativeName: "アメリカ合衆国" },
  { value: "GB", name: "United Kingdom", nativeName: "イギリス" },
  { value: "DE", name: "Germany", nativeName: "ドイツ" },
  { value: "FR", name: "France", nativeName: "フランス" },
  { value: "CN", name: "China", nativeName: "中国" },
  { value: "KR", name: "South Korea", nativeName: "韓国" },
  { value: "VN", name: "Vietnam", nativeName: "ベトナム" },
  { value: "SG", name: "Singapore", nativeName: "シンガポール" },
  { value: "AU", name: "Australia", nativeName: "オーストラリア" },
];

export default function Demo() {
  return (
    <PageContainer
      title="CountrySelect"
      subtitle="国旗付き国ピッカー — 非制御のみ、defaultValue + name でフォーム送信"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>請求先の国（必須・日本デフォルト）</CardTitle>
            <CardDescription>
              defaultValue=“JP” で日本を初期選択。required=true でバリデーション必須。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="billing-country" label="請求先の国" required>
              <CountrySelect
                id="billing-country"
                name="billingCountry"
                options={COUNTRIES}
                defaultValue="JP"
                required
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>取引先の国（任意選択・クリア可）</CardTitle>
            <CardDescription>
              allowEmpty=true で「指定なし」を選択可能。省略時は全国を対象とする。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="partner-country" label="取引先の国">
              <CountrySelect
                id="partner-country"
                name="partnerCountry"
                options={COUNTRIES}
                allowEmpty
                emptyLabel="指定なし（全国）"
                placeholder="国を選択..."
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>税務上の居住国（エラー状態）</CardTitle>
            <CardDescription>
              invalid=true で aria-invalid をトリガーに設定し、エラーメッセージと連動する。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              id="tax-country"
              label="税務居住国"
              required
              error="税務居住国を選択してください"
            >
              <CountrySelect
                id="tax-country"
                name="taxCountry"
                options={COUNTRIES}
                allowEmpty
                placeholder="国を選択..."
                invalid
              />
            </FormField>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
