import { describe, it } from "vitest";

import { CenteredShell } from "../centered-shell";
import { Flex } from "../flex";
import { Button, Heading, Text } from "../../general";
import { Card, CardContent } from "../../data-display";
import { expectNoA11yViolations } from "@/test/a11y";

// The SCR-007 public landing composition (gh#252): a header with a wordmark, anchor navigation
// that drops below the tablet step, a chromeless hero, a flat section card and a legal footer that
// still carries every destination the compact header hides. Guards heading order (h1 → h2), the
// named navigation landmarks, real anchors and the contrast of the flat public surface.
describe("Public landing composition a11y (gh#252)", () => {
  it("has no axe violations for a public landing built on the preset", async () => {
    await expectNoA11yViolations(
      <CenteredShell
        preset="public-landing"
        topbar={
          <Flex align="center" gap="md">
            <Text weight="medium">GodX Platform</Text>
            <Flex
              hideBelow="md"
              align="center"
              gap="xs"
              role="navigation"
              aria-label="ページ内ナビゲーション"
            >
              <Button variant="ghost" size="sm" asChild>
                <a href="#capabilities">機能</a>
              </Button>
            </Flex>
            <Button size="sm" asChild>
              <a href="#start">無料で始める</a>
            </Button>
          </Flex>
        }
        footer={
          <Flex direction="col" gap="sm">
            <Flex wrap gap="xs" role="navigation" aria-label="フッターナビゲーション">
              <Button variant="link" size="sm" asChild>
                <a href="#capabilities">機能 · Capabilities · Tính năng</a>
              </Button>
            </Flex>
            <Text size="xs" tone="muted">
              2026 GodX Platform
            </Text>
          </Flex>
        }
      >
        <section aria-labelledby="hero-title">
          <Flex direction="col" gap="md" align="start">
            <Heading level={1} id="hero-title">
              すべてのサービスへ、ひとつの認証基盤
            </Heading>
            <Text tone="muted" as="p">
              One identity platform for every service · Một nền tảng định danh cho mọi dịch vụ.
            </Text>
            <Button asChild>
              <a href="#start">無料で始める</a>
            </Button>
          </Flex>
        </section>
        <section id="capabilities" aria-labelledby="capabilities-title">
          <Card>
            <CardContent>
              <Heading level={2} id="capabilities-title">
                機能 · Capabilities
              </Heading>
              <Text tone="muted" as="p">
                日本語・English・Tiếng Việt を同じ画面契約で提供します。
              </Text>
            </CardContent>
          </Card>
        </section>
      </CenteredShell>,
    );
  });
});
