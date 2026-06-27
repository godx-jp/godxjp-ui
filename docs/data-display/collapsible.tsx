import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@godxjp/ui/data-display";
import { Button, Text } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import { ChevronsUpDown } from "lucide-react";
import { useState } from "react";

/**
 * Collapsible — a single open/close region (no item set; use Accordion for a set
 * of sections). Compose Collapsible + CollapsibleTrigger + CollapsibleContent.
 * Composed only from real @godxjp/ui components.
 */
export default function Demo() {
  // Controlled example: open state is owned by the page, not the component.
  const [open, setOpen] = useState(false);

  return (
    <PageContainer title="Collapsible" subtitle="A single toggleable region">
      <Flex direction="col" gap="lg">
        {/* Uncontrolled pair — defaultOpen vs default-closed, side by side */}
        <Flex direction="col" gap="md" className="md:flex-row">
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>補助科目（既定で開く）</CardTitle>
              <CardDescription>defaultOpen: 初期表示で展開された状態。</CardDescription>
            </CardHeader>
            <CardContent>
              <Collapsible defaultOpen>
                <Flex direction="row" align="center" justify="between" gap="md">
                  <Text weight="medium">普通預金 · 補助科目 (3)</Text>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="開閉"
                      className="transition-transform data-[state=open]:rotate-180"
                    >
                      <ChevronsUpDown />
                    </Button>
                  </CollapsibleTrigger>
                </Flex>
                <CollapsibleContent>
                  <Flex direction="col" gap="xs">
                    <div className="text-sm">GMOあおぞらネット銀行</div>
                    <div className="text-sm">三菱UFJ銀行 渋谷支店</div>
                    <div className="text-sm">みずほ銀行 当座</div>
                  </Flex>
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>

          <Card className="flex-1">
            <CardHeader>
              <CardTitle>補助科目（既定で閉じる）</CardTitle>
              <CardDescription>初期表示は折りたたみ。トリガーで展開します。</CardDescription>
            </CardHeader>
            <CardContent>
              <Collapsible>
                <Flex direction="row" align="center" justify="between" gap="md">
                  <Text weight="medium">当座預金 · 補助科目 (2)</Text>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="開閉"
                      className="transition-transform data-[state=open]:rotate-180"
                    >
                      <ChevronsUpDown />
                    </Button>
                  </CollapsibleTrigger>
                </Flex>
                <CollapsibleContent>
                  <Flex direction="col" gap="xs">
                    <div className="text-sm">三井住友銀行 丸の内支店</div>
                    <div className="text-sm">りそな銀行 本店</div>
                  </Flex>
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>
        </Flex>

        {/* Controlled — open state owned by the page (open + onOpenChange) */}
        <Card>
          <CardHeader>
            <CardTitle>制御コンポーネント</CardTitle>
            <CardDescription>open と onOpenChange でページ側が開閉を管理します。</CardDescription>
          </CardHeader>
          <CardContent>
            <Collapsible open={open} onOpenChange={setOpen}>
              <Flex direction="row" align="center" justify="between" gap="md">
                <Text weight="medium">
                  外貨預金 · 補助科目 (2) · {open ? "展開中" : "折りたたみ中"}
                </Text>
                <Flex direction="row" align="center" gap="xs">
                  <Button variant="outline" size="sm" onClick={() => setOpen((value) => !value)}>
                    {open ? "閉じる" : "開く"}
                  </Button>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="開閉"
                      className="transition-transform data-[state=open]:rotate-180"
                    >
                      <ChevronsUpDown />
                    </Button>
                  </CollapsibleTrigger>
                </Flex>
              </Flex>
              <CollapsibleContent>
                <Flex direction="col" gap="xs">
                  <div className="text-sm">USD 普通預金 · シティバンク</div>
                  <div className="text-sm">EUR 普通預金 · 三菱UFJ銀行</div>
                </Flex>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>

        {/* Disabled — locked, non-interactive */}
        <Card>
          <CardHeader>
            <CardTitle>無効状態</CardTitle>
            <CardDescription>disabled: トリガーが操作不可（ロック）になります。</CardDescription>
          </CardHeader>
          <CardContent>
            <Collapsible disabled defaultOpen>
              <Flex direction="row" align="center" justify="between" gap="md">
                <Text weight="medium">定期預金 · 補助科目 (1) · 締め処理中</Text>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="開閉"
                    className="transition-transform data-[state=open]:rotate-180"
                  >
                    <ChevronsUpDown />
                  </Button>
                </CollapsibleTrigger>
              </Flex>
              <CollapsibleContent>
                <Flex direction="col" gap="xs">
                  <div className="text-sm">三菱UFJ銀行 定期 (1年)</div>
                </Flex>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
