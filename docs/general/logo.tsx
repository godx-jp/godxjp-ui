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
            <CardDescription>xs / sm / md（既定）/ lg のトークンサイズ。</CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="row" align="center" wrap gap="md">
              <Logo size="xs" />
              <Logo size="sm" />
              <Logo />
              <Logo size="lg" />
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
