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
import { Button } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import { ChevronsUpDown } from "lucide-react";

/**
 * Collapsible — a single open/close region (no item set; use Accordion for a set
 * of sections). Compose Collapsible + CollapsibleTrigger + CollapsibleContent.
 * Composed only from real @godxjp/ui components.
 */
export default function Demo() {
  return (
    <PageContainer title="Collapsible" subtitle="A single toggleable region">
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>補助科目</CardTitle>
            <CardDescription>Toggle a detail region open/closed.</CardDescription>
          </CardHeader>
          <CardContent>
            <Collapsible defaultOpen>
              <Flex direction="row" align="center" justify="between" gap="md">
                <span className="text-sm font-medium">普通預金 — 補助科目 (3)</span>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="icon-sm" aria-label="開閉">
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
      </Flex>
    </PageContainer>
  );
}
