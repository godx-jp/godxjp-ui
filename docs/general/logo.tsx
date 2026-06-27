import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Logo, Text } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * Logo — the product brand-mark primitive. Replaces the hand-rolled
 * `<span className="flex size-8 rounded-md bg-primary font-bold">g</span>` repeated across the auth
 * shell and every topbar (typography-on-span, literal size/radius — rules #42/#46). Brand fill
 * follows --primary; the corner is the --logo-radius knob; size comes from the `size` prop.
 */
export default function Demo() {
  return (
    <PageContainer
      title="Logo"
      subtitle="the product brand-mark · tokenized box, never a styled span"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>Sizes</CardTitle>
            <CardDescription>
              Box size comes from the `size` prop (24 / 28 / 32 / 40) — not a literal className.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="row" align="center" gap="md">
              <Logo size="xs" />
              <Logo size="sm" />
              <Logo size="md" />
              <Logo size="lg" />
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shape</CardTitle>
            <CardDescription>
              `shape` sets the corner: default reads the `--logo-radius` token (a service knob),
              pill is fully rounded, sharp is square.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="row" align="center" gap="md">
              <Logo shape="default" />
              <Logo shape="pill" />
              <Logo shape="sharp" />
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lettermark + wordmark, and custom glyph</CardTitle>
            <CardDescription>
              Beside a wordmark the mark is decorative; pass `label` when the Logo itself is the
              accessible name. `glyph` overrides the letter: pass a custom SVG for a real logo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Flex direction="row" align="center" gap="sm">
                <Logo />
                <Text weight="bold">GoDX</Text>
              </Flex>
              <Flex direction="row" align="center" gap="md">
                <Logo label="GoDX" size="lg" />
                <Logo glyph="税" label="GoDX 税務" size="lg" shape="pill" />
              </Flex>
            </Flex>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
