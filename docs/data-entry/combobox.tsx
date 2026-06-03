import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Combobox, FormField } from "@godxjp/ui/data-entry";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * Combobox — single-select with type-to-search. Built on Popover + Command.
 * Pass options as { value, label }[]. onValueChange fires on selection.
 * Never a raw <select>. Composed only from real @godxjp/ui components.
 */
export default function Demo() {
  const [account, setAccount] = useState("");
  const [department, setDepartment] = useState("");
  const [taxCode, setTaxCode] = useState("");

  return (
    <PageContainer title="Combobox" subtitle="検索付き単一選択 — Popover + Command で構成">
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>勘定科目ルックアップ</CardTitle>
            <CardDescription>
              静的な選択肢リストで検索可能な単一選択コンボボックス。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="account" label="勘定科目">
              <Combobox
                options={[
                  { value: "1010", label: "現金" },
                  { value: "1020", label: "普通預金" },
                  { value: "1030", label: "売掛金" },
                  { value: "2010", label: "買掛金" },
                  { value: "3010", label: "売上高" },
                  { value: "4010", label: "仕入高" },
                  { value: "5010", label: "給料手当" },
                  { value: "5020", label: "旅費交通費" },
                  { value: "5030", label: "通信費" },
                  { value: "5040", label: "消耗品費" },
                ]}
                value={account}
                onValueChange={setAccount}
                placeholder="科目を選択..."
                searchPlaceholder="科目名で検索..."
                emptyText="該当する科目がありません"
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>部門選択</CardTitle>
            <CardDescription>
              組織部門のルックアップ — 選択値: {department || "未選択"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="department" label="部門">
              <Combobox
                options={[
                  { value: "dept-sales", label: "営業部" },
                  { value: "dept-admin", label: "管理部" },
                  { value: "dept-dev", label: "開発部" },
                  { value: "dept-hr", label: "人事部" },
                  { value: "dept-finance", label: "経理部" },
                ]}
                value={department}
                onValueChange={setDepartment}
                placeholder="部門を選択..."
                searchPlaceholder="部門名で検索..."
                emptyText="該当する部門がありません"
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>税区分コード</CardTitle>
            <CardDescription>消費税区分の選択 — 選択値: {taxCode || "未選択"}</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="tax-code" label="税区分">
              <Combobox
                options={[
                  { value: "TAX10", label: "課税 10%" },
                  { value: "TAX8", label: "軽減税率 8%" },
                  { value: "TAX0", label: "非課税" },
                  { value: "EXEMPT", label: "免税" },
                  { value: "OUT_OF_SCOPE", label: "対象外" },
                ]}
                value={taxCode}
                onValueChange={setTaxCode}
                placeholder="税区分を選択..."
                emptyText="該当する税区分がありません"
              />
            </FormField>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
