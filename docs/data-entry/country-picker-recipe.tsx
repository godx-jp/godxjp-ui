import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { FormField, Select } from "@godxjp/ui/data-entry";
import { Text } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import type { SelectLoadParams, SelectLoadResult, SelectOption } from "@godxjp/ui/data-entry";

/**
 * Country picker — a RECIPE, not a component. There is no CountrySelect in @godxjp/ui:
 * a country picker is just a data-driven `Select`. The INTERNATIONAL-STANDARD way to build it:
 *   - values are ISO 3166-1 alpha-2 codes (you keep only the code array);
 *   - labels are derived at render time from CLDR via `Intl.DisplayNames(locale, {type:"region"})`,
 *     so they are correct AND localized — never hardcode country names per language;
 *   - do NOT use emoji regional-indicator flags (🇯🇵): they do not render on Windows / many Linux.
 *     If you want flags, ship an SVG set and draw it via `renderOption`.
 * showSearch filters a short bundled list; loadOptions scales to a long remote list (server search +
 * pagination), with selectedLabel covering a value whose option page hasn't loaded yet. name= submits
 * the ISO code with the form. Real @godxjp/ui only.
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

const COUNTRIES: SelectOption[] = COUNTRY_CODES.map((code) => ({
  value: code,
  label: regionNames.of(code) ?? code,
  group: REGION_GROUP[code],
}));

// A real picker over every country uses loadOptions: the server filters + paginates, the client
// never bundles the full list. We simulate latency so fetching/empty states are real, and filter
// the bundled set by localized name OR ISO code (server-side in production).
async function loadCountries({ query }: SelectLoadParams): Promise<SelectLoadResult> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  const needle = query.trim().toLowerCase();
  const options = needle
    ? COUNTRIES.filter(
        (c) => c.label.toLowerCase().includes(needle) || c.value.toLowerCase().includes(needle),
      )
    : COUNTRIES;
  return { options, hasMore: false };
}

// renderOption draws an ISO-code chip + CLDR name. NOT an emoji flag (broken on Windows/Linux); a
// real product ships an SVG flag set and renders it here. Tokens only — no hex, no inline style.
function renderCountry(option: SelectOption) {
  return (
    <span className="flex items-center gap-2">
      <Text size="xs" tone="muted" mono className="bg-muted rounded px-1.5 py-0.5">
        {option.value}
      </Text>
      <Text truncate>{option.label}</Text>
    </span>
  );
}

export default function Demo() {
  const [billing, setBilling] = useState("JP");
  const [partner, setPartner] = useState("");
  const [residence, setResidence] = useState("VN");

  return (
    <PageContainer
      title="Country picker (recipe)"
      subtitle="国選択は Select のレシピ — 専用コンポーネントは無い（値は ISO コード、名称は CLDR）"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>請求先の国（必須・日本デフォルト・クリア不可）</CardTitle>
            <CardDescription>
              value は ISO 3166-1 alpha-2 コード、ラベルは
              Intl.DisplayNames（CLDR）で生成する（国名を
              ハードコードしない・絵文字フラグも使わない）。 showSearch で絞り込み、name
              でフォーム送信。 必須項目なので clearable=false でクリア行を出さない。
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
                clearable={false}
                searchPlaceholder="国名 / ISO コードで検索..."
                emptyMessage="該当する国がありません"
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
              任意項目なので未選択（プレースホルダー表示）を初期値にしている。
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
                searchPlaceholder="国名 / ISO コードで検索..."
                emptyMessage="該当する国がありません"
                options={COUNTRIES}
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>居住国（loadOptions・遠隔リスト・SVG フラグ枠）</CardTitle>
            <CardDescription>
              全世界の長いリストは options を同梱せず loadOptions でサーバー検索＋ページングする。
              読み込み中は loadingMessage、0 件は emptyMessage を出す。selectedLabel は値の option
              が まだ読み込まれていないときの表示名。renderOption で ISO
              コードチップ＋国名を描画（絵文字 フラグは使わず、実運用では SVG フラグを差し込む）。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="residence-country" label="居住国">
              <Select
                id="residence-country"
                name="residenceCountry"
                value={residence}
                onValueChange={setResidence}
                showSearch
                loadOptions={loadCountries}
                renderOption={renderCountry}
                selectedLabel={regionNames.of(residence) ?? residence}
                placeholder="国を選択..."
                searchPlaceholder="国名 / ISO コードで検索..."
                loadingMessage="国を読み込み中..."
                emptyMessage="該当する国がありません"
              />
            </FormField>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
