import { Card, CardContent, CardHeader, CardTitle, EmptyState } from "@godxjp/ui/data-display";
import { Button } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import { CheckCircle2, Inbox, Plus, SearchX } from "lucide-react";

/**
 * EmptyState — centred zero-state with icon, title, description, and an optional
 * CTA. Use for non-DataTable lists / zero-state pages (DataTable embeds its own).
 *
 * Heading hierarchy: the title is a real heading (default `<h3>`). Pick
 * `titleLevel` for a VALID page outline (page `<h1>` → section `<h2>` → nested
 * `<h3>`), never for visual size — the size is fixed by tokens. Below, the page
 * title is `<h1>` (PageContainer) and each case owns a `<CardTitle level={2}>`
 * (`<h2>`), so the empty-state titles are `titleLevel={3}` — or `titleAs="p"`
 * when the message is not itself a heading. Composed only from real @godxjp/ui.
 */
export default function Demo() {
  return (
    <PageContainer
      title="EmptyState"
      subtitle="Contextual zero-state · page / section / compact · tone · valid heading order"
    >
      <Flex direction="col" gap="lg">
        {/* page — the empty condition IS the page's primary job (onboarding). */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>page：主要な空状態（オンボーディング）</CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={Inbox}
              title="請求書がありません"
              description="最初の請求書を作成して開始しましょう。"
              titleLevel={3}
              action={
                <Button>
                  <Plus />
                  新規請求書
                </Button>
              }
            />
          </CardContent>
        </Card>

        {/* page — post-search zero result with a clear recovery. */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>page：検索結果ゼロ</CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={SearchX}
              title="該当する結果がありません"
              description="フィルター条件を変更して、もう一度お試しください。"
              titleLevel={3}
            />
          </CardContent>
        </Card>

        {/* section — restrained spacing for a subsection inside a normal page. */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>section：セクション内の空状態</CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState
              variant="section"
              icon={SearchX}
              title="このセクションに結果はありません"
              description="ページ全体ではない、主要セクション内の空状態です。"
              titleLevel={3}
            />
          </CardContent>
        </Card>

        {/* compact — secondary content; no medallion, minimal padding, and the
            message is NOT a heading (titleAs="p") because the card already has one. */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>compact：補助的な空状態</CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState
              variant="compact"
              title="保留中の招待はありません"
              description="補助的な空状態はアイコンを省き、最小限の余白で表示します。"
              titleAs="p"
            />
          </CardContent>
        </Card>

        {/* tone — a semantic confirmation zero-state. */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>tone：承認済み（success）</CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState
              tone="success"
              icon={CheckCircle2}
              title="端末を承認しました"
              description="この端末からサインインできるようになりました。"
              titleLevel={3}
            />
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
