import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Logo, Text } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/** Logo — token-sized brand mark with decorative and explicitly named accessibility modes. */
export default function Demo() {
  return (
    <PageContainer title="Logo" subtitle="size · glyph · decorative and named brand marks">
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>Size tiers</CardTitle>
            <CardDescription>
              xs / sm / md（既定）/ lg のトークンサイズ。size はすべてのマークに効きます。箱付き
              glyph の辺と字送りは --logo-size-* と --logo-font-size-*、識別マーク
              （mark=&quot;godx&quot;）は専用の --logo-godx-size-* （1.5 / 1.75 / 2 / 2.5rem）が
              所有します。識別マークは正方形の viewBox
              に横長カプセルが入るため、同じ視覚重量になるよう箱付き glyph より 1
              段大きく取ります。サービステーマが --logo-godx-size
              を設定すると、全ティアで識別マークの箱を固定できます。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Flex direction="row" align="center" wrap gap="md">
                <Logo size="xs" />
                <Logo size="sm" />
                <Logo />
                <Logo size="lg" />
              </Flex>
              {/* The identity mark honours the SAME size prop — it is not a fixed-size mark. */}
              <Flex direction="row" align="center" wrap gap="md">
                <Logo mark="godx" size="xs" label="godx identity mark, xs" />
                <Logo mark="godx" size="sm" label="godx identity mark, sm" />
                <Logo mark="godx" label="godx identity mark, md" />
                <Logo mark="godx" size="lg" label="godx identity mark, lg" />
              </Flex>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Glyph and accessible name</CardTitle>
            <CardDescription>
              Wordmark と組み合わせる mark は decorative。単独 mark は label で名前を付けます。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Flex direction="row" align="center" gap="sm">
                <Logo glyph="GX" />
                <Text weight="bold">godx Admin</Text>
              </Flex>
              <Logo glyph="神" label="Godx" size="lg" />
              <Logo glyph="G" tone="success" label="Godx green identity mark" />
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>tone · アイデンティティロール</CardTitle>
            <CardDescription>
              tone は 2 値で、箱付き glyph の塗りを決めます。primary（既定）はアプリのアクション色
              --primary、success はブランドの識別ロール --brand です。--brand
              はステータス緑（--success）とも アクション色とも独立しているため、
              テーマを変えても正規のエメラルドが保たれます。 なお mark=&quot;godx&quot;
              の識別マークは tone に関わらず常に --brand で描かれます。size は効きます（上の Size
              tiers を参照）。箱付き glyph は実テキストなので WCAG 2.2 SC 1.4.3 の 4.5:1
              が適用されます（14px bold は large text ではありません）。文字色は
              --logo-identity-foreground（近黒）で、--brand-foreground
              ではありません。後者は識別マークの抜き色（--background に追従）で エメラルド上では
              3.67:1 しかなく、非テキスト（SC 1.4.11）の 3:1 しか満たしません。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="row" wrap gap="lg">
              <Flex direction="col" gap="sm">
                <Logo tone="primary" glyph="GX" size="lg" label="primary tone boxed glyph" />
                <Text size="2xs" mono tone="muted">
                  {`tone="primary" · --primary`}
                </Text>
              </Flex>
              <Flex direction="col" gap="sm">
                <Logo tone="success" glyph="GX" size="lg" label="brand tone boxed glyph" />
                <Text size="2xs" mono tone="muted">
                  {`tone="success" · --brand`}
                </Text>
              </Flex>
              <Flex direction="col" gap="sm">
                <Logo tone="primary" mark="godx" label="godx identity mark, primary tone" />
                <Text size="2xs" mono tone="muted">
                  {`mark="godx" tone="primary" · --brand`}
                </Text>
              </Flex>
              <Flex direction="col" gap="sm">
                <Logo tone="success" mark="godx" label="godx identity mark, brand tone" />
                <Text size="2xs" mono tone="muted">
                  {`mark="godx" tone="success" · --brand`}
                </Text>
              </Flex>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Wordmark lockup</CardTitle>
            <CardDescription>
              wordmark を渡すと mark + 製品名の lockup になります。GoDX の lockup は --primary
              ではなく identity role（brand green）で着色されるため、
              テーマ変更でブランド色が崩れません。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              {/* Canonical GoDX lockup — brand-green mark + wordmark, one element. */}
              <Logo mark="godx" tone="success" wordmark="GoDX" />
              <Logo mark="godx" tone="success" wordmark="GoDX ID" size="lg" />
              {/* Boxed-glyph lockup for a product brand that is not the GoDX identity. */}
              <Logo glyph="GX" wordmark="godx Admin" size="sm" />
              {/* label overrides the lockup name when the wordmark alone is ambiguous. */}
              <Logo mark="godx" wordmark="GoDX" label="GoDX ID ホーム" />
            </Flex>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
