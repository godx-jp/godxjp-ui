import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { FormField, TreeSelect } from "@godxjp/ui/data-entry";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * TreeSelect — 階層ツリーピッカー（Popover + 展開/折り畳み）。
 * 単一選択: onChange は string | undefined。
 * 複数/チェック可能: onChange は string[]。
 * SHOW_* 定数は TreeSelect.SHOW_CHILD / SHOW_PARENT / SHOW_ALL を使用。
 * Never a raw <select>. Composed only from real @godxjp/ui components.
 */

const ACCOUNT_TREE = [
  {
    value: "assets",
    label: "資産",
    children: [
      {
        value: "current-assets",
        label: "流動資産",
        children: [
          { value: "cash", label: "現金" },
          { value: "bank", label: "普通預金" },
          { value: "ar", label: "売掛金" },
          { value: "prepaid", label: "前払費用" },
        ],
      },
      {
        value: "fixed-assets",
        label: "固定資産",
        children: [
          { value: "machinery", label: "機械装置" },
          { value: "vehicles", label: "車両運搬具" },
          { value: "furniture", label: "器具備品" },
        ],
      },
    ],
  },
  {
    value: "liabilities",
    label: "負債",
    children: [
      {
        value: "current-liabilities",
        label: "流動負債",
        children: [
          { value: "ap", label: "買掛金" },
          { value: "accrued", label: "未払費用" },
          { value: "tax-payable", label: "未払消費税" },
        ],
      },
      {
        value: "long-term",
        label: "固定負債",
        children: [{ value: "long-loan", label: "長期借入金" }],
      },
    ],
  },
  {
    value: "equity",
    label: "純資産",
    children: [
      { value: "capital", label: "資本金" },
      { value: "retained", label: "繰越利益剰余金" },
    ],
  },
  {
    value: "revenue",
    label: "収益",
    children: [
      { value: "sales", label: "売上高" },
      { value: "other-income", label: "営業外収益" },
    ],
  },
  {
    value: "expenses",
    label: "費用",
    children: [
      { value: "cogs", label: "売上原価" },
      { value: "salary-exp", label: "給料手当" },
      { value: "rent-exp", label: "地代家賃" },
      { value: "travel-exp", label: "旅費交通費" },
    ],
  },
];

const DEPT_TREE = [
  {
    value: "hq",
    label: "本社",
    children: [
      {
        value: "finance-div",
        label: "財務本部",
        children: [
          { value: "accounting", label: "経理部" },
          { value: "treasury", label: "財務部" },
        ],
      },
      {
        value: "sales-div",
        label: "営業本部",
        children: [
          { value: "sales-east", label: "東日本営業部" },
          { value: "sales-west", label: "西日本営業部" },
        ],
      },
    ],
  },
  {
    value: "branch",
    label: "支社",
    children: [
      { value: "osaka-branch", label: "大阪支社" },
      { value: "nagoya-branch", label: "名古屋支社" },
    ],
  },
];

export default function Demo() {
  const [glAccount, setGlAccount] = useState<string | undefined>();
  const [deptFilter, setDeptFilter] = useState<string[]>([]);

  return (
    <PageContainer
      title="TreeSelect"
      subtitle="階層ツリーピッカー · 単一は string、複数は string[] を返す"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>勘定科目選択（単一・検索付き）</CardTitle>
            <CardDescription>
              科目ツリーから1科目を選択。showSearch + treeDefaultExpandAll で素早くアクセス。
              選択値: {glAccount ?? "未選択"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="gl-account" label="勘定科目">
              <TreeSelect
                id="gl-account"
                treeData={ACCOUNT_TREE}
                value={glAccount}
                onValueChange={(v) => setGlAccount(v as string | undefined)}
                showSearch
                treeDefaultExpandAll
                placeholder="科目を選択..."
                allowClear
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>部門フィルター（複数選択 + チェックボックス）</CardTitle>
            <CardDescription>
              treeCheckable で親選択が子に連鎖。SHOW_PARENT で表示を集約。 選択数:{" "}
              {deptFilter.length} 件
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="dept-filter" label="部門">
              <TreeSelect
                id="dept-filter"
                treeData={DEPT_TREE}
                value={deptFilter}
                onValueChange={(v) => setDeptFilter(v as string[])}
                treeCheckable
                showCheckedStrategy={TreeSelect.SHOW_PARENT}
                showSearch
                placeholder="部門を選択..."
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>費用科目（チェック非連鎖・SHOW_ALL）</CardTitle>
            <CardDescription>
              treeCheckStrictly=true で親子独立選択。SHOW_ALL で全チェックノードを表示。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="expense-accounts" label="費用科目">
              <TreeSelect
                id="expense-accounts"
                treeData={ACCOUNT_TREE}
                treeCheckable
                treeCheckStrictly
                showCheckedStrategy={TreeSelect.SHOW_ALL}
                placeholder="費用科目を複数選択..."
                showSearch
              />
            </FormField>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
