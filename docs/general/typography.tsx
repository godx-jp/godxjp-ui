import { Button, Heading, Text } from "@godxjp/ui/general";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * Text + Heading — the typographic primitives. Use these INSTEAD of a hand-rolled
 * `<span className="text-[13px] font-medium text-muted-foreground">`. Size is a step of the
 * golden-ratio type scale (never an arbitrary px); tone/weight are semantic tokens.
 */
const sizes = ["2xs", "xs", "sm", "md", "lg", "xl", "2xl"] as const;
const tones = ["default", "muted", "primary", "success", "warning", "destructive", "info"] as const;
const levels = [1, 2, 3, 4] as const;

/** Heading tone — every branch paired with the section it actually belongs on. */
const headingTones = [
  { tone: "default", title: "請求サマリー" },
  { tone: "muted", title: "補足情報" },
  { tone: "primary", title: "今月の重点項目" },
  { tone: "success", title: "月次締め処理が完了しました" },
  { tone: "warning", title: "承認待ちの申請があります" },
  { tone: "destructive", title: "同期に失敗した明細" },
  { tone: "info", title: "システムメンテナンスのお知らせ" },
] as const;

export default function Demo() {
  return (
    <PageContainer
      title="Typography"
      subtitle="Text + Heading · token-driven type, never an arbitrary px className"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>Heading levels</CardTitle>
            <CardDescription>
              level sets BOTH the --heading-h* size token and the semantic &lt;h1..h4&gt; element.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="sm">
              {levels.map((level) => (
                <Heading key={level} level={level}>
                  H{level} · 請求書一覧
                </Heading>
              ))}
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Heading tone</CardTitle>
            <CardDescription>
              level は文書構造、tone は意味です。見出しの tone は Text
              と同じ意味論トークンを読むため、 節の状態を色で示しても文書階層は変わりません。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              {headingTones.map(({ tone, title }) => (
                <Flex key={tone} direction="col" gap="xs">
                  <Heading level={3} tone={tone}>
                    {title}
                  </Heading>
                  <Text size="2xs" mono tone="muted">
                    {`tone="${tone}"`}
                  </Text>
                </Flex>
              ))}
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Text sizes</CardTitle>
            <CardDescription>
              size is a type-scale step (2xs / xs / sm / md / lg / xl) — sm is the base. No px.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="xs">
              {sizes.map((size) => (
                <Text key={size} size={size}>
                  {size} — 関連する仕訳データを表示します
                </Text>
              ))}
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Tone + weight</CardTitle>
            <CardDescription>
              tone maps to semantic foreground tokens; weight is the 3-weight canon (400/500/700).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="sm">
              <Flex direction="row" gap="md" wrap align="center">
                {tones.map((tone) => (
                  <Text key={tone} tone={tone} weight="medium">
                    {tone}
                  </Text>
                ))}
              </Flex>
              <Flex direction="row" gap="md" wrap align="center">
                <Text weight="regular">Regular 400</Text>
                <Text weight="medium">Medium 500</Text>
                <Text weight="bold">Bold 700</Text>
              </Flex>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Numbers, codes, truncation</CardTitle>
            <CardDescription>
              tabular for figures, mono for ids, truncate for one line, clamp for N lines.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="sm">
              <Text tabular weight="medium">
                ¥1,240,000
              </Text>
              <Text size="xs" mono tone="muted">
                RC-204881 · JAN 4987241135219
              </Text>
              <Text truncate className="max-w-64">
                とても長い説明テキストが一行に収まらない場合は省略記号で切り詰められます。
              </Text>
              {/* clamp={2} — the card-description case (dxs-platform/platform#427): a long
               * Japanese description limited to 2 lines, full text kept in the DOM. */}
              <Text as="p" size="sm" tone="muted" clamp={2} className="max-w-64">
                クラウド会計・請求書発行・経費精算・勤怠管理までを一つの契約で提供する統合バックオフィスサービスです。組織の規模や業種に合わせてプランを選択でき、導入後もデータ移行と運用支援を継続的に受けられます。
              </Text>
              <Flex direction="row" gap="sm" align="center">
                <Text>明細を確認してください。</Text>
                <Button size="xs" variant="link">
                  詳細
                </Button>
              </Flex>
            </Flex>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
