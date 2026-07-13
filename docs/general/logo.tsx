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
            </Flex>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
