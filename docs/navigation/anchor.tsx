import { useRef, useState } from "react";

import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Descriptions,
  ScrollArea,
} from "@godxjp/ui/data-display";
import { Heading, Paragraph, Text } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import { Anchor, type AnchorItemProp } from "@godxjp/ui/navigation";

/**
 * Anchor — Ant Design `Anchor` (6.6.5). The in-page section navigation, and the only thing in the
 * library that COMPUTES which section is current.
 *
 * This page is built out of the cases that break a table of contents, not the one that flatters it:
 *
 * — a FORTY-entry rail beside a TWO-entry one, in the same screen, because the rail that works at
 *   two entries is not the rail that works at forty (it scrolls, and the ink rail has to keep up);
 * — a 71-character UNBREAKABLE label, which is a real section title (a config key, a German
 *   compound, a URL) and the shape that widens a rail until the page grows a scrollbar;
 * — CJK beside Latin in the same list, where the same nominal size is a taller line box;
 * — a section TALLER than its scrollport, which is where an IntersectionObserver band goes blank
 *   and this component keeps answering;
 * — the HORIZONTAL direction, which is what a narrow viewport collapses to;
 * — and a bounded `getContainer`, because a page is very often not the thing that scrolls.
 *
 * Composed only from real @godxjp/ui components.
 */

/** A real section title that cannot be broken anywhere. Exactly 71 characters. */
const UNBREAKABLE = "RegionalDeploymentConfigurationParameterNamespaceIdentifierOverrides123";

const PRIMER: AnchorItemProp[] = [
  { key: "p1", href: "#primer-what", title: "What it resolves" },
  { key: "p2", href: "#primer-why", title: "Why not sticky" },
];

const CHAPTERS = [
  { id: "ch-intro", latin: "Introduction", cjk: "はじめに" },
  { id: "ch-scope", latin: "Scope and audience", cjk: "対象範囲と読者" },
  { id: "ch-terms", latin: "Defined terms", cjk: "用語の定義" },
  { id: "ch-accounts", latin: "Accounts", cjk: "アカウント" },
  { id: "ch-identity", latin: "Identity verification", cjk: "本人確認" },
  { id: "ch-billing", latin: "Billing", cjk: "請求" },
  { id: "ch-invoices", latin: "Invoices and receipts", cjk: "請求書と領収書" },
  { id: "ch-taxes", latin: "Taxes", cjk: "税" },
  { id: "ch-refunds", latin: "Refunds", cjk: "返金" },
  { id: "ch-plans", latin: "Plans", cjk: "プラン" },
  { id: "ch-limits", latin: "Usage limits", cjk: "利用上限" },
  { id: "ch-fair-use", latin: "Fair use", cjk: "公正利用" },
  { id: "ch-data", latin: "Data ownership", cjk: "データの帰属" },
  { id: "ch-retention", latin: "Retention", cjk: "保持期間" },
  { id: "ch-deletion", latin: "Deletion", cjk: "削除" },
  { id: "ch-export", latin: "Export", cjk: "エクスポート" },
  { id: "ch-security", latin: "Security", cjk: "セキュリティ" },
  { id: "ch-incident", latin: "Incident response", cjk: "インシデント対応" },
  { id: "ch-subprocessors", latin: "Sub-processors", cjk: "再委託先" },
  { id: "ch-transfers", latin: "International transfers", cjk: "国際移転" },
  { id: "ch-availability", latin: "Availability", cjk: "可用性" },
  { id: "ch-maintenance", latin: "Maintenance windows", cjk: "メンテナンス" },
  { id: "ch-support", latin: "Support", cjk: "サポート" },
  { id: "ch-escalation", latin: "Escalation", cjk: "エスカレーション" },
  { id: "ch-credits", latin: "Service credits", cjk: "サービスクレジット" },
  { id: "ch-acceptable", latin: "Acceptable use", cjk: "禁止事項" },
  { id: "ch-content", latin: "Customer content", cjk: "顧客コンテンツ" },
  { id: "ch-ip", latin: "Intellectual property", cjk: "知的財産" },
  { id: "ch-feedback", latin: "Feedback", cjk: "フィードバック" },
  { id: "ch-publicity", latin: "Publicity", cjk: "公表" },
  { id: "ch-warranty", latin: "Warranties", cjk: "保証" },
  { id: "ch-liability", latin: "Limitation of liability", cjk: "責任の制限" },
  { id: "ch-indemnity", latin: "Indemnity", cjk: "補償" },
  { id: "ch-term", latin: "Term", cjk: "契約期間" },
  { id: "ch-suspension", latin: "Suspension", cjk: "利用停止" },
  { id: "ch-termination", latin: "Termination", cjk: "解約" },
  { id: "ch-survival", latin: "Survival", cjk: "存続条項" },
  { id: "ch-law", latin: "Governing law", cjk: "準拠法" },
  { id: "ch-disputes", latin: "Disputes", cjk: "紛争解決" },
  { id: "ch-namespace", latin: UNBREAKABLE, cjk: "名前空間の上書き" },
  { id: "ch-changes", latin: "Changes to these terms", cjk: "本規約の変更" },
  { id: "ch-contact", latin: "Contact", cjk: "お問い合わせ" },
];

const CHAPTER_ITEMS: AnchorItemProp[] = CHAPTERS.map((chapter) => ({
  key: chapter.id,
  href: `#${chapter.id}`,
  // CJK beside Latin on ONE row: the same nominal size, a taller line box, and the rail has to
  // hold both without the ink rail losing its alignment.
  title: (
    <>
      {chapter.cjk} · {chapter.latin}
    </>
  ),
}));

const HORIZONTAL: AnchorItemProp[] = [
  { key: "h-overview", href: "#bar-overview", title: "概要 · Overview" },
  { key: "h-pricing", href: "#bar-pricing", title: "価格 · Pricing" },
  { key: "h-security", href: "#bar-security", title: "セキュリティ · Security" },
  { key: "h-faq", href: "#bar-faq", title: "よくある質問 · FAQ" },
];

function Chapter({ id, title, lines }: { id: string; title: string; lines: number }) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`}>
      <Heading level={3} id={`${id}-heading`}>
        {title}
      </Heading>
      {Array.from({ length: lines }, (_, line) => (
        <Paragraph key={line}>
          本条は{title}について定めます。The clause is deliberately long enough that a reader spends
          several scroll gestures inside it, which is the case an IntersectionObserver band cannot
          answer and a decision line can.
        </Paragraph>
      ))}
    </section>
  );
}

export default function Demo() {
  const primerRef = useRef<HTMLDivElement>(null);
  const chaptersRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [reading, setReading] = useState<string>("");

  return (
    <PageContainer
      title="Anchor"
      subtitle="antd Anchor · the decision line, the suppressed click, the landing hash, aria-current=location"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>1 · Two entries, and what the component reports</CardTitle>
            <CardDescription>
              The smallest rail there is, bounded by its own `getContainer` rather than the page.
              `onValueChange` hands back the href the SCROLL POSITION resolved, which is the value
              printed below it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex gap="lg" align="start">
              <Anchor
                affix={false}
                showInkInFixed
                label="Primer sections"
                items={PRIMER}
                getContainer={() => primerRef.current ?? window}
                onValueChange={setReading}
              />
              <ScrollArea viewportRef={primerRef} className="h-64 flex-1" label="Primer">
                <Flex direction="col" gap="md">
                  <Chapter id="primer-what" title="What it resolves" lines={4} />
                  <Chapter id="primer-why" title="Why not sticky" lines={4} />
                </Flex>
              </ScrollArea>
            </Flex>
            <Descriptions
              items={[
                { label: "onValueChange", children: <Text>{reading || "—"}</Text> },
                {
                  label: "aria-current",
                  children: <Badge variant="secondary">location</Badge>,
                },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2 · Forty-two entries, CJK beside Latin, and a 71-character label</CardTitle>
            <CardDescription>
              The rail that works at two entries is not the rail that works at forty-two: this one
              scrolls, the ink rail keeps up, and the `{UNBREAKABLE.length}`-character unbreakable
              title wraps instead of widening the column until the page grows a scrollbar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex gap="lg" align="start">
              <ScrollArea className="h-96 w-64 shrink-0" label="Contents">
                <Anchor
                  affix={false}
                  showInkInFixed
                  label="Agreement contents"
                  items={CHAPTER_ITEMS}
                  getContainer={() => chaptersRef.current ?? window}
                />
              </ScrollArea>
              <ScrollArea viewportRef={chaptersRef} className="h-96 flex-1" label="Agreement">
                <Flex direction="col" gap="md">
                  {CHAPTERS.map((chapter) => (
                    <Chapter
                      key={chapter.id}
                      id={chapter.id}
                      title={`${chapter.cjk} · ${chapter.latin}`}
                      // One chapter is far taller than the scrollport on purpose — the case a
                      // band-based scrollspy cannot answer and a decision line can.
                      lines={chapter.id === "ch-billing" ? 24 : 3}
                    />
                  ))}
                </Flex>
              </ScrollArea>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3 · direction=&quot;horizontal&quot; — the narrow case</CardTitle>
            <CardDescription>
              One row that scrolls inline rather than wrapping onto a second, because the ink rail
              has to stay beside the label it belongs to. Nesting is not available here, and Ant
              Design says the same.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Anchor
              affix={false}
              showInkInFixed
              direction="horizontal"
              label="Page sections"
              items={HORIZONTAL}
              getContainer={() => barRef.current ?? window}
            />
            <ScrollArea viewportRef={barRef} className="h-64" label="Sections">
              <Flex direction="col" gap="md">
                <Chapter id="bar-overview" title="概要 · Overview" lines={3} />
                <Chapter id="bar-pricing" title="価格 · Pricing" lines={3} />
                <Chapter id="bar-security" title="セキュリティ · Security" lines={3} />
                <Chapter id="bar-faq" title="よくある質問 · FAQ" lines={3} />
              </Flex>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4 · Against the page, pinned by Affix</CardTitle>
            <CardDescription>
              The default. `affix` is `true`, so the rail pins itself once it reaches the line;
              `targetOffsetBlockStart` is the room a clicked section leaves for whatever is pinned
              above it. Landing on one of these hashes selects the entry with no scroll event at
              all, and the click moves FOCUS to the section, not just the scroll position.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex gap="lg" align="start">
              <Anchor
                offsetBlockStart={16}
                targetOffsetBlockStart={24}
                label="On this page"
                items={[
                  { key: "page-a", href: "#page-alpha", title: "Alpha · 第一章" },
                  {
                    key: "page-b",
                    href: "#page-beta",
                    title: "Beta · 第二章",
                    children: [
                      { key: "page-b1", href: "#page-beta-one", title: "Beta, part one" },
                      { key: "page-b2", href: "#page-beta-two", title: "Beta, part two" },
                    ],
                  },
                  { key: "page-c", href: "#page-gamma", title: "Gamma · 第三章" },
                ]}
              />
              <Flex direction="col" gap="md" className="flex-1">
                <Chapter id="page-alpha" title="Alpha · 第一章" lines={6} />
                <Chapter id="page-beta" title="Beta · 第二章" lines={2} />
                <Chapter id="page-beta-one" title="Beta, part one" lines={6} />
                <Chapter id="page-beta-two" title="Beta, part two" lines={6} />
                <Chapter id="page-gamma" title="Gamma · 第三章" lines={8} />
              </Flex>
            </Flex>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
