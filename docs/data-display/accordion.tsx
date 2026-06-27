import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@godxjp/ui/data-display";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * Accordion — collapsible stacked sections (FAQ, grouped settings). Compose
 * Accordion > AccordionItem > AccordionTrigger + AccordionContent; each item
 * needs a unique value. Composed only from real @godxjp/ui components.
 */
export default function Demo() {
  return (
    <PageContainer
      title="Accordion"
      subtitle="Collapsible stacked sections · FAQ, grouped settings"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>単一開閉 (type=&quot;single&quot;)</CardTitle>
            <CardDescription>
              常に1セクションのみ開きます。collapsible により開いている項目を再度閉じられます。defaultValue で税の項目を初期表示。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible defaultValue="tax">
              <AccordionItem value="tax">
                <AccordionTrigger>消費税の計算方法は？</AccordionTrigger>
                <AccordionContent>
                  税抜・税込は事業所設定に従い、端数処理（切り捨て/四捨五入）も同設定を適用します。
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="invoice">
                <AccordionTrigger>インボイス制度に対応していますか？</AccordionTrigger>
                <AccordionContent>
                  適格請求書発行事業者の登録番号を保持し、適格・非適格を仕訳時に判定します。
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="close">
                <AccordionTrigger>月次決算の締めはどう行いますか？</AccordionTrigger>
                <AccordionContent>
                  期間ロック後は当該期間への記帳を拒否します。締め処理は会計期間設定から行います。
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>複数開閉 (type=&quot;multiple&quot;)</CardTitle>
            <CardDescription>
              複数セクションを同時に開けます。設定をグループ分けして一覧したい場面に最適。defaultValue で「通知」と「権限」を初期表示。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" defaultValue={["notify", "perm"]}>
              <AccordionItem value="notify">
                <AccordionTrigger>通知設定</AccordionTrigger>
                <AccordionContent>
                  仕訳の承認依頼・月次締めのリマインドをメールおよびアプリ内通知で受け取ります。
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="perm">
                <AccordionTrigger>権限とロール</AccordionTrigger>
                <AccordionContent>
                  担当者・承認者・管理者の3ロールを割り当て、事業所単位で操作範囲を制限します。
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="export">
                <AccordionTrigger>データ書き出し</AccordionTrigger>
                <AccordionContent>
                  仕訳帳・総勘定元帳を CSV / PDF で出力します。会計期間を指定して一括ダウンロード可能。
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="api" disabled>
                <AccordionTrigger>API 連携（準備中）</AccordionTrigger>
                <AccordionContent>
                  外部システムとの API 連携は次回リリースで提供予定です。
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
