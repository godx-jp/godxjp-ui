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

export default function Demo() {
  return (
    <PageContainer
      title="Typography"
      subtitle="Text + Heading — token-driven type, never an arbitrary px className"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>Heading levels</CardTitle>
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
            <CardTitle>Text sizes</CardTitle>
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
            <CardTitle>Tone + weight</CardTitle>
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
            <CardTitle>Numbers, codes, truncation</CardTitle>
            <CardDescription>
              tabular for figures, mono for ids, truncate for one line.
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
              <Text truncate className="max-w-[16rem]">
                とても長い説明テキストが一行に収まらない場合は省略記号で切り詰められます。
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
