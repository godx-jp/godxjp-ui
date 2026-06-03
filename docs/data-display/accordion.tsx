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
      subtitle="Collapsible stacked sections — FAQ, grouped settings"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>単一開閉 (type=&quot;single&quot;)</CardTitle>
            <CardDescription>
              One section open at a time; collapsible allows closing it.
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
      </Flex>
    </PageContainer>
  );
}
