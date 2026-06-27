import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Transfer } from "@godxjp/ui/data-entry";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * Transfer — デュアルリストシャトル。
 * targetKeys を自分で管理し onValueChange で更新する。
 * TransferItemProp は { key, title, description?, disabled? }。
 * Never hand-roll a two-panel picker. Composed only from real @godxjp/ui components.
 */

const ALL_ACCOUNTS = [
  { key: "1010", title: "現金", description: "流動資産" },
  { key: "1020", title: "普通預金", description: "流動資産" },
  { key: "1030", title: "売掛金", description: "流動資産" },
  { key: "1040", title: "前払費用", description: "流動資産" },
  { key: "2010", title: "機械装置", description: "固定資産" },
  { key: "2020", title: "車両運搬具", description: "固定資産" },
  { key: "3010", title: "買掛金", description: "流動負債" },
  { key: "3020", title: "未払費用", description: "流動負債" },
  { key: "4010", title: "売上高", description: "収益" },
  { key: "5010", title: "売上原価", description: "費用" },
  { key: "5020", title: "給料手当", description: "費用" },
  { key: "5030", title: "旅費交通費", description: "費用", disabled: true },
];

const REPORT_COLUMNS = [
  { key: "col-date", title: "日付", description: "仕訳日付" },
  { key: "col-no", title: "伝票番号", description: "仕訳番号" },
  { key: "col-debit-acct", title: "借方科目", description: "借方勘定科目コード" },
  { key: "col-debit-amt", title: "借方金額", description: "借方金額（円）" },
  { key: "col-credit-acct", title: "貸方科目", description: "貸方勘定科目コード" },
  { key: "col-credit-amt", title: "貸方金額", description: "貸方金額（円）" },
  { key: "col-tax", title: "税区分", description: "消費税区分コード" },
  { key: "col-dept", title: "部門", description: "計上部門" },
  { key: "col-memo", title: "摘要", description: "仕訳摘要" },
  { key: "col-partner", title: "取引先", description: "取引先名" },
];

export default function Demo() {
  const [mappedKeys, setMappedKeys] = useState<string[]>(["1010", "1030"]);
  const [reportKeys, setReportKeys] = useState<string[]>([
    "col-date",
    "col-no",
    "col-debit-acct",
    "col-credit-acct",
  ]);

  return (
    <PageContainer
      title="Transfer"
      subtitle="デュアルリストシャトル · targetKeys を管理し onValueChange で更新する"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>外部勘定科目マッピング（検索付き）</CardTitle>
            <CardDescription>
              外部から取り込んだ科目（左）を社内正規科目（右）にマッピングする。 マッピング済み:{" "}
              {mappedKeys.length} 件
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Transfer
              dataSource={ALL_ACCOUNTS}
              targetKeys={mappedKeys}
              onValueChange={(nextKeys) => setMappedKeys(nextKeys)}
              titles={["取込科目", "マッピング済"]}
              showSearch
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>レポート列選択（追加専用）</CardTitle>
            <CardDescription>
              oneWay=true でレポートに列を追加のみ可能（削除不可）。 選択列: {reportKeys.length} 列
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Transfer
              dataSource={REPORT_COLUMNS}
              targetKeys={reportKeys}
              onValueChange={(nextKeys) => setReportKeys(nextKeys)}
              titles={["利用可能な列", "レポート列"]}
              showSearch
              oneWay
            />
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
