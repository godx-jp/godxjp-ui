import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * Typography · design-token foundation. Real semantic <h1>-<h6> elements (no
 * faked sizes): the base heading layer renders the dxs-kintai scale and keeps
 * the document outline SEO/accessibility correct. Composed only from real
 * @godxjp/ui components.
 */
export default function Demo() {
  return (
    <PageContainer
      title="Typography"
      subtitle="Noto Sans JP (vi → Montserrat) · 14 / 1.7 body · headings 20/18/14/13 @ 500 · three weights only"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>Heading scale</CardTitle>
            <CardDescription>
              h1 20 / h2 18 / h3 14 / h4-h6 13px, weight 500 (h5/h6 collapse to 13px). SEO/a11y:
              exactly one &lt;h1&gt; per page (the page title above); h2-h6 below never skip a level.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="xs">
              <h2>&lt;h2&gt; 見出し · section heading · 18px / 500</h2>
              <h3>&lt;h3&gt; 見出し · subsection · 14px / 500</h3>
              <h4>&lt;h4&gt; 見出し · minor heading · 13px / 500</h4>
              <h5>&lt;h5&gt; 見出し · 13px / 500</h5>
              <h6>&lt;h6&gt; 見出し · 13px / 500</h6>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Body & weights</CardTitle>
            <CardDescription>
              Default body 14px / 1.7 (間 ma); dense tables 13px / 1.5. Three weights only · 400
              body, 500 heading/label, 700 emphasis. NO 300, NO 600.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="sm">
              <p className="text-sm">
                本文 14px / 1.7 · 漢字の密度に合わせて行間を広めに取り、読み疲れを抑えます。Body
                copy mixes 日本語 and Latin without breaking rhythm.
              </p>
              <Flex direction="col" gap="xs">
                <p className="text-sm font-normal">400 normal · 通常の本文 · regular body</p>
                <p className="text-sm font-medium">
                  500 medium · 見出し・ラベル · headings, labels
                </p>
                <p className="text-sm font-bold">700 bold · 強調のみ · emphasis only</p>
              </Flex>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tabular figures</CardTitle>
            <CardDescription>
              tabular-nums on every numeric column / large stat so digits align under 1.7 leading.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="xs">
              <span className="text-2xl tabular-nums">¥1,284,500 · tabular ✓</span>
              <span className="text-2xl normal-nums">¥1,284,500 · proportional ✗</span>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Size scale</CardTitle>
            <CardDescription>
              Six steps on the JP-dense base. text-sm (14px) is body;
              text-base+ are for stats / large numerals, not running copy.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="xs">
              <p className="text-xs">text-xs · 13px · 補足・密なテーブル</p>
              <p className="text-sm">text-sm · 14px · 本文 body</p>
              <p className="text-base">text-base · 15px · やや大きい本文</p>
              <p className="text-lg">text-lg · 19px · リード文 lead</p>
              <p className="text-xl">text-xl · 22px · 小見出し統計</p>
              <p className="text-2xl">text-2xl · 26px · 大きな統計値</p>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Font family</CardTitle>
            <CardDescription>
              font-sans · Noto Sans JP by default (Japanese + Latin); the Vietnamese locale
              (&lt;html lang=&quot;vi&quot;&gt;) swaps to Montserrat (incl. its Vietnamese subset).
              font-mono · the UI-monospace stack for code, IDs and aligned digits.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="sm">
              <p className="font-sans text-sm">
                春はあけぼの · Số hóa văn bản · The quick brown fox jumps over the lazy dog
                0123456789
              </p>
              <code className="font-mono text-sm">
                const id = &quot;EMP-2025-001&quot;; // 0123456789 IlO0
              </code>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Line height</CardTitle>
            <CardDescription>
              tight 1.25 · headings · normal 1.5 · dense tables · body 1.7 · running 日本語/Latin copy
              (the default applied to &lt;body&gt;).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="sm">
              <p className="text-sm leading-tight">
                tight 1.25 · 見出し向けの詰めた行間。Compact leading for headings and single-line
                labels where vertical rhythm should stay tight.
              </p>
              <p className="text-sm leading-normal">
                normal 1.5 · 密なテーブル向け。Slightly looser for dense tables and metadata where
                rows must stay scannable but not cramped.
              </p>
              <p className="text-sm leading-[var(--line-height-body)]">
                body 1.7 · 本文向け。Generous leading for running mixed 日本語 and Latin copy so the
                kanji density never reads as a wall of text.
              </p>
            </Flex>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
