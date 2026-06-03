import { Card, CardContent, EmptyState } from "@godxjp/ui/data-display";
import { Button } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import { Inbox, Plus, SearchX } from "lucide-react";

/**
 * EmptyState — centred zero-state with icon, title, description, and an optional
 * CTA. Use for non-DataTable lists / zero-state pages (DataTable embeds its own).
 * Composed only from real @godxjp/ui components.
 */
export default function Demo() {
  return (
    <PageContainer title="EmptyState" subtitle="Centred zero-state — icon · title · description · optional CTA">
      <Flex direction="col" gap="lg">
        <Card>
          <CardContent>
            <EmptyState
              icon={Inbox}
              title="請求書がありません"
              description="最初の請求書を作成して開始しましょう。"
              action={
                <Button>
                  <Plus />
                  新規請求書
                </Button>
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <EmptyState
              icon={SearchX}
              title="該当する結果がありません"
              description="フィルター条件を変更して、もう一度お試しください。"
            />
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
