import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Cascader, FormField } from "@godxjp/ui/data-entry";
import { Flex, PageContainer } from "@godxjp/ui/layout";

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

export default function Demo() {
  const [categoryPath, setCategoryPath] = useState<string[]>([]);
  const [regionPath, setRegionPath] = useState<string[]>([]);
  const [multiPaths, setMultiPaths] = useState<string[][]>([]);

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
      </Flex>
    </PageContainer>
  );
}
