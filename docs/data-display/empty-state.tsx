import { Card, CardContent, EmptyState } from "@godxjp/ui/data-display";
import { Button } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import { CheckCircle2, Inbox, Plus, SearchX } from "lucide-react";

/**
 * EmptyState — centred zero-state with icon, title, description, and an optional
 * CTA. Use for non-DataTable lists / zero-state pages (DataTable embeds its own).
 * Composed only from real @godxjp/ui components.
 */
export default function Demo() {
  return (
    <PageContainer
      title="EmptyState"
      subtitle="Centred zero-state · icon · title · description · optional CTA"
    >
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

        <Card>
          <CardContent>
            <EmptyState
              variant="section"
              icon={SearchX}
              title="このセクションに結果はありません"
              description="ページ全体ではない、主要セクション内の空状態です。"
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <EmptyState
              variant="compact"
              title="保留中の招待はありません"
              description="補助的な空状態はアイコンを省き、最小限の余白で表示します。"
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <EmptyState
              tone="success"
              icon={CheckCircle2}
              title="端末を承認しました"
              description="この端末からサインインできるようになりました。"
            />
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
