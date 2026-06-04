import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Cascader, FormField } from "@godxjp/ui/data-entry";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import type { TreeOptionProp } from "@godxjp/ui/props";

/**
 * Cascader — 階層パスピッカー（カラム式）。
 * value は常に string[] (単一) または string[][] (複数)。
 * 絶対に flat な string を渡さない。
 * Composed only from real @godxjp/ui components.
 */

const EXPENSE_CATEGORIES = [
  {
    value: "operating",
    label: "営業費用",
    children: [
      {
        value: "selling",
        label: "販売費",
        children: [
          { value: "advertising", label: "広告宣伝費" },
          { value: "travel", label: "旅費交通費" },
          { value: "entertainment", label: "交際費" },
        ],
      },
      {
        value: "admin",
        label: "一般管理費",
        children: [
          { value: "salary", label: "給料手当" },
          { value: "rent", label: "地代家賃" },
          { value: "utilities", label: "水道光熱費" },
          { value: "supplies", label: "消耗品費" },
        ],
      },
    ],
  },
  {
    value: "non-operating",
    label: "営業外費用",
    children: [
      { value: "interest", label: "支払利息" },
      { value: "fx-loss", label: "為替差損" },
    ],
  },
];

const REGIONS = [
  {
    value: "kanto",
    label: "関東",
    children: [
      {
        value: "tokyo",
        label: "東京都",
        children: [
          { value: "shinjuku", label: "新宿区" },
          { value: "shibuya", label: "渋谷区" },
          { value: "chiyoda", label: "千代田区" },
        ],
      },
      {
        value: "kanagawa",
        label: "神奈川県",
        children: [
          { value: "yokohama", label: "横浜市" },
          { value: "kawasaki", label: "川崎市" },
        ],
      },
    ],
  },
  {
    value: "kansai",
    label: "関西",
    children: [
      {
        value: "osaka",
        label: "大阪府",
        children: [
          { value: "osaka-city", label: "大阪市" },
          { value: "sakai", label: "堺市" },
        ],
      },
      {
        value: "kyoto",
        label: "京都府",
        children: [{ value: "kyoto-city", label: "京都市" }],
      },
    ],
  },
];

/**
 * 配送区分ツリー — ノード単位のフラグを実演:
 * - disabled: そのノード（および子）を選択不可（休止中の区分）
 * - isLeaf: 子を持たない葉として扱い、カスケード矢印を出さない
 * - disableCheckbox: TreeOption 共通フラグ（チェックボックスのみ無効化の意図を表す）
 */
const SHIPPING_TYPES: TreeOptionProp[] = [
  {
    value: "domestic",
    label: "国内配送",
    children: [
      { value: "standard", label: "通常便" },
      { value: "express", label: "速達便", disableCheckbox: true },
      { value: "cool", label: "クール便（休止中）", disabled: true },
    ],
  },
  {
    value: "international",
    label: "国際配送（準備中）",
    disabled: true,
    children: [{ value: "ems", label: "EMS" }],
  },
  // isLeaf: 子なしの確定ノード（カスケードしない）
  { value: "pickup", label: "店頭受取", isLeaf: true },
];

/**
 * fieldNames で実 API 形状（id / name / items）を value/label/children へ写像。
 * 実データは value/label/children 以外のキーを使うことが多い。
 */
const ORG_UNITS = [
  {
    id: "sales",
    name: "営業本部",
    items: [
      { id: "sales-east", name: "東日本営業部" },
      { id: "sales-west", name: "西日本営業部" },
    ],
  },
  {
    id: "dev",
    name: "開発本部",
    items: [
      { id: "dev-frontend", name: "フロントエンド部" },
      { id: "dev-backend", name: "バックエンド部" },
    ],
  },
];

export default function Demo() {
  const [categoryPath, setCategoryPath] = useState<string[]>([]);
  const [regionPath, setRegionPath] = useState<string[]>([]);
  const [multiPaths, setMultiPaths] = useState<string[][]>([]);
  const [shippingPaths, setShippingPaths] = useState<string[][]>([]);
  const [orgPath, setOrgPath] = useState<string[]>([]);
  const [hoverPath, setHoverPath] = useState<string[]>([]);

  return (
    <PageContainer
      title="Cascader"
      subtitle="階層パスピッカー — value は string[] (単一) / string[][] (複数)"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>経費カテゴリ選択（単一・検索付き）</CardTitle>
            <CardDescription>
              費用科目の階層パスを選択。showSearch でリーフまで全文検索できる。 選択パス:{" "}
              {categoryPath.length > 0 ? categoryPath.join(" › ") : "未選択"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="category-path" label="経費カテゴリ">
              <Cascader
                id="category-path"
                options={EXPENSE_CATEGORIES}
                value={categoryPath}
                onValueChange={(v) => setCategoryPath(v as string[])}
                showSearch
                placeholder="カテゴリを選択..."
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>地域選択（単一・changeOnSelect）</CardTitle>
            <CardDescription>
              changeOnSelect=true で中間ノードも確定値として選択可能。 選択パス:{" "}
              {regionPath.length > 0 ? regionPath.join(" › ") : "未選択"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="region-path" label="地域">
              <Cascader
                id="region-path"
                options={REGIONS}
                value={regionPath}
                onValueChange={(v) => setRegionPath(v as string[])}
                changeOnSelect
                placeholder="地域を選択..."
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>複数経費カテゴリ（multiple）</CardTitle>
            <CardDescription>
              multiple=true で string[][] を管理。チェックボックスで複数パスを選択。 選択数:{" "}
              {multiPaths.length} パス
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="multi-category" label="経費カテゴリ（複数）">
              <Cascader
                id="multi-category"
                options={EXPENSE_CATEGORIES}
                multiple
                value={multiPaths}
                onValueChange={(v) => setMultiPaths(v as string[][])}
                showSearch
                placeholder="カテゴリを選択..."
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>地域選択（expandTrigger=&quot;hover&quot;）</CardTitle>
            <CardDescription>
              expandTrigger=&quot;hover&quot; で列のホバーだけで次の階層が展開（既定は &quot;click&quot;）。
              リーフはクリックで確定。 選択パス: {hoverPath.length > 0 ? hoverPath.join(" › ") : "未選択"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="hover-region" label="地域（ホバー展開）">
              <Cascader
                id="hover-region"
                options={REGIONS}
                value={hoverPath}
                onValueChange={(v) => setHoverPath(v as string[])}
                expandTrigger="hover"
                placeholder="地域を選択..."
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>配送区分（ノード単位フラグ・複数）</CardTitle>
            <CardDescription>
              ノードの disabled で「クール便」「国際配送」を選択不可（薄表示）に、isLeaf で「店頭受取」を
              子なし確定ノードに。 選択数: {shippingPaths.length} パス
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="shipping-type" label="配送区分">
              <Cascader
                id="shipping-type"
                options={SHIPPING_TYPES}
                multiple
                value={shippingPaths}
                onValueChange={(v) => setShippingPaths(v as string[][])}
                placeholder="配送区分を選択..."
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>組織選択（fieldNames でキー写像）</CardTitle>
            <CardDescription>
              実 API 形状（id / name / items）を fieldNames=&#123;&#123; value: &quot;id&quot;, label:
              &quot;name&quot;, children: &quot;items&quot; &#125;&#125; で写像。 選択パス:{" "}
              {orgPath.length > 0 ? orgPath.join(" › ") : "未選択"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="org-unit" label="所属組織">
              <Cascader
                id="org-unit"
                options={ORG_UNITS as unknown as TreeOptionProp[]}
                fieldNames={{ value: "id", label: "name", children: "items" }}
                value={orgPath}
                onValueChange={(v) => setOrgPath(v as string[])}
                placeholder="組織を選択..."
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>非制御モード（defaultValue・allowClear=&#123;false&#125;）</CardTitle>
            <CardDescription>
              defaultValue で初期パスを与え、状態を内部管理（非制御）。allowClear=&#123;false&#125; で
              クリア（×）ボタンを無効化し、必須項目として常に値を保持。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="default-category" label="既定カテゴリ（非制御）">
              <Cascader
                id="default-category"
                options={EXPENSE_CATEGORIES}
                defaultValue={["operating", "selling", "advertising"]}
                allowClear={false}
                placeholder="カテゴリを選択..."
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>無効状態（disabled・選択済み）</CardTitle>
            <CardDescription>
              disabled で操作不可。value を与えて「選択済みのまま無効化」も表現（編集権限なしの読み取り表示）。
              無効時はクリア（×）も非表示。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <FormField id="disabled-empty" label="無効（未選択）">
                <Cascader
                  id="disabled-empty"
                  options={EXPENSE_CATEGORIES}
                  disabled
                  placeholder="カテゴリを選択..."
                />
              </FormField>
              <FormField id="disabled-selected" label="無効（選択済み）">
                <Cascader
                  id="disabled-selected"
                  options={EXPENSE_CATEGORIES}
                  disabled
                  defaultValue={["operating", "admin", "salary"]}
                  placeholder="カテゴリを選択..."
                />
              </FormField>
            </Flex>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
