import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { FormField, Select } from "@godxjp/ui/data-entry";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * Country picker — a RECIPE, not a component. There is no CountrySelect in @godxjp/ui:
 * a country picker is just a data-driven `Select`. The INTERNATIONAL-STANDARD way to build it:
 *   - values are ISO 3166-1 alpha-2 codes (you keep only the code array);
 *   - labels are derived at render time from CLDR via `Intl.DisplayNames(locale, {type:"region"})`,
 *     so they are correct AND localized — never hardcode country names per language;
 *   - do NOT use emoji regional-indicator flags (🇯🇵): they do not render on Windows / many Linux.
 *     If you want flags, ship an SVG set.
 * showSearch filters a long list; name= submits the ISO code with the form. Real @godxjp/ui only.
 */

// You bundle the ISO 3166-1 alpha-2 codes you support (there is no Intl enumerator for "all regions").
const COUNTRY_CODES = ["JP", "CN", "KR", "VN", "SG", "US", "GB", "DE", "FR", "AU"] as const;

const REGION_GROUP: Record<string, string> = {
  JP: "アジア",
  CN: "アジア",
  KR: "アジア",
  VN: "アジア",
  SG: "アジア",
  GB: "ヨーロッパ",
  DE: "ヨーロッパ",
  FR: "ヨーロッパ",
  US: "その他",
  AU: "その他",
};

// Localized display names come from CLDR. In a real app pass the active locale (e.g. from
// useAppContext().locale); here we render Japanese names to match the surrounding demo.
const regionNames = new Intl.DisplayNames(["ja"], { type: "region" });

const COUNTRIES = COUNTRY_CODES.map((code) => ({
  value: code,
  label: regionNames.of(code) ?? code,
  group: REGION_GROUP[code],
}));

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
