/**
 * Showcase · Public landing (gh#252) — the PUBLIC marketing/product landing page composed from
 * real @godxjp/ui primitives with **zero page-local CSS**.
 *
 * Gate 0 (docs/COMPOSITION-VS-COMPONENT.md): a landing header / hero / section grid / legal footer
 * FAILS the Framework-Component Test — it is layout + copy + tokens, it owns no behaviour, and it
 * is expressible today from Card / Button / Text / Heading / Flex / ResponsiveGrid. So there is NO
 * `PublicLandingShell` component. What the package DOES own is the geometry the consumer kept
 * re-implementing in `id.css`:
 *
 *   • `CenteredShell preset="public-landing"` — one content measure shared by the header bar, the
 *     centred column and the footer, the section rhythm, the flat (elevation-free) card chrome and
 *     the hero `h1` tier, all from `--centered-shell-landing-*` tokens;
 *   • `Flex hideBelow` / `hideFrom` — responsive region visibility (anchor nav below the tablet
 *     step, brand wordmark and the secondary header action at mobile) without a consumer @media.
 *
 * Nothing below sets a width, a max-width, a padding, a shadow or a breakpoint. Every destination
 * hidden from the compact header stays reachable in the footer nav, which is never hidden.
 * Copy is deliberately JA + EN + VI to stress long-label containment at 390px.
 */
import { ArrowRight, ShieldCheck, Workflow, Languages } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Button, Heading, Logo, Text } from "@godxjp/ui/general";
import { CenteredShell, Flex, ResponsiveGrid, Topbar } from "@godxjp/ui/layout";
import { AppSettingPicker } from "@godxjp/ui/navigation";

const DESTINATIONS = [
  { id: "capabilities", label: "機能 · Capabilities · Tính năng" },
  { id: "standards", label: "標準 · Standards · Tiêu chuẩn" },
  { id: "start", label: "導入 · Get started · Bắt đầu" },
];

const CAPABILITIES = [
  {
    id: "identity",
    icon: ShieldCheck,
    title: "統合 ID · Federated identity",
    body: "組織・サービス・端末をまたぐ一つの認証基盤。Một nền tảng xác thực duy nhất cho mọi dịch vụ.",
  },
  {
    id: "workflow",
    icon: Workflow,
    title: "承認ワークフロー · Approval workflow",
    body: "アクセス申請から承認・監査までを一本化。Quy trình phê duyệt và nhật ký kiểm toán liền mạch.",
  },
  {
    id: "i18n",
    icon: Languages,
    title: "多言語 · Multilingual",
    body: "日本語・English・Tiếng Việt を同じ画面契約で提供します。",
  },
];

export default function PublicLanding() {
  return (
    <CenteredShell
      preset="public-landing"
      topbar={
        <Topbar
          start={
            <Flex align="center" gap="md">
              <Flex align="center" gap="sm">
                <Logo glyph="G" />
                {/* Wordmark drops at mobile — the mark alone identifies the product there. */}
                <Flex hideBelow="sm" align="center" gap="sm">
                  <Text weight="medium">GodX Platform</Text>
                </Flex>
              </Flex>
              {/* Anchor navigation is hidden below the tablet step; the same destinations stay in
                  the footer nav, so nothing becomes unreachable. */}
              <Flex
                hideBelow="md"
                align="center"
                gap="xs"
                role="navigation"
                aria-label="ページ内ナビゲーション"
              >
                {DESTINATIONS.map((destination) => (
                  <Button key={destination.id} variant="ghost" size="sm" asChild>
                    <a href={`#${destination.id}`}>{destination.label}</a>
                  </Button>
                ))}
              </Flex>
            </Flex>
          }
          end={
            <Flex align="center" gap="sm">
              <AppSettingPicker kind="locale" />
              {/* Secondary action folds away at mobile; the primary CTA always stays. */}
              <Flex hideBelow="sm" align="center" gap="sm">
                <Button variant="ghost" size="sm" asChild>
                  <a href="#start">ログイン</a>
                </Button>
              </Flex>
              <Button size="sm" asChild>
                <a href="#start">無料で始める</a>
              </Button>
            </Flex>
          }
        />
      }
      footer={
        <Flex direction="col" gap="sm">
          <Flex align="center" gap="sm" wrap>
            <Logo glyph="G" />
            <Text weight="medium">GodX Platform</Text>
          </Flex>
          <Flex wrap gap="xs" align="center" role="navigation" aria-label="フッターナビゲーション">
            {DESTINATIONS.map((destination) => (
              <Button key={destination.id} variant="link" size="sm" asChild>
                <a href={`#${destination.id}`}>{destination.label}</a>
              </Button>
            ))}
            <Button variant="link" size="sm" asChild>
              <a href="#legal">プライバシー · Privacy · Quyền riêng tư</a>
            </Button>
          </Flex>
          <Text size="xs" tone="muted">
            2026 GodX Platform · 東京都千代田区
          </Text>
        </Flex>
      }
    >
      {/* Hero — a plain layout <section>, chromeless by construction (no Card), its h1 sized by
          the preset's `--centered-shell-landing-heading-size` tier. */}
      <section aria-labelledby="landing-hero-title">
        <Flex direction="col" gap="md" align="start">
          <Text size="xs" tone="muted" weight="medium">
            SCR-007 · PUBLIC LANDING
          </Text>
          <Heading level={1} id="landing-hero-title">
            すべてのサービスへ、ひとつの認証基盤
          </Heading>
          <Text tone="muted" as="p">
            One identity platform for every service · Một nền tảng định danh cho mọi dịch vụ —
            日本語・English・Tiếng Việt を同一の画面契約で提供します。
          </Text>
          <Flex gap="sm" wrap>
            <Button asChild>
              <a href="#start">
                無料で始める
                <ArrowRight aria-hidden />
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="#capabilities">機能を見る</a>
            </Button>
          </Flex>
        </Flex>
      </section>

      <section id="capabilities" aria-labelledby="landing-capabilities-title">
        <Flex direction="col" gap="md">
          <Heading level={2} id="landing-capabilities-title">
            機能 · Capabilities
          </Heading>
          <ResponsiveGrid columns={{ sm: 1, md: 2, lg: 3 }}>
            {CAPABILITIES.map((capability) => (
              <Card key={capability.id}>
                <CardHeader>
                  <capability.icon aria-hidden />
                  <CardTitle>{capability.title}</CardTitle>
                  <CardDescription>{capability.body}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </ResponsiveGrid>
        </Flex>
      </section>

      <section id="standards" aria-labelledby="landing-standards-title">
        <Card>
          <CardContent>
            <Flex direction="col" gap="sm">
              <Heading level={2} id="landing-standards-title">
                標準 · Standards
              </Heading>
              <Text tone="muted" as="p">
                WCAG 2.2 AA · WAI-ARIA APG · ISO 3166 / 4217 / 8601 · BCP-47 · IANA time zones. Mọi
                màn hình đều tuân thủ cùng một hợp đồng quốc tế hoá.
              </Text>
            </Flex>
          </CardContent>
        </Card>
      </section>

      <section id="start" aria-labelledby="landing-start-title">
        <Card>
          <CardContent>
            <Flex direction="col" gap="sm" align="start">
              <Heading level={2} id="landing-start-title">
                導入 · Get started
              </Heading>
              <Text tone="muted" as="p">
                組織アカウントを作成し、既存サービスを接続するだけで運用を開始できます。
              </Text>
              <Button asChild>
                <a href="#start">
                  無料で始める
                  <ArrowRight aria-hidden />
                </a>
              </Button>
            </Flex>
          </CardContent>
        </Card>
      </section>
    </CenteredShell>
  );
}
