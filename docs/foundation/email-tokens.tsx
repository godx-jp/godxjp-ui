import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@godxjp/ui/data-display";
import {
  EMAIL_BRAND_MARK,
  EMAIL_COLORS,
  EMAIL_COLOR_SOURCE,
  EMAIL_CTA,
  EMAIL_FOCUS,
  EMAIL_FOOTER,
  EMAIL_MOBILE,
  EMAIL_SHELL,
  EMAIL_TYPOGRAPHY,
  EMAIL_URGENCY,
  type EmailColorToken,
} from "@godxjp/ui/email";
import { Text } from "@godxjp/ui/general";
import { Flex, PageContainer, ResponsiveGrid } from "@godxjp/ui/layout";

import { buildEmailSpecimenHtml } from "./_email-specimen";

/**
 * Email tokens · the `@godxjp/ui/email` contract (issue #227).
 *
 * A transactional email is rendered by Blade/Twig/MJML, by clients that strip `<style>`, ignore
 * CSS custom properties and block remote images — so neither the React components nor the CSS
 * token file are reachable. `@godxjp/ui/email` is the framework-neutral bridge: literal hex and px
 * DERIVED from the same `src/tokens/` files the web reads, plus the canonical brand mark as
 * self-contained markup. Nothing on this page types a colour or a size by hand; the two iframes
 * below render the real specimen document at the 480px desktop width and at a narrow mobile width.
 */
const specimen = buildEmailSpecimenHtml();

const colorRows = (Object.keys(EMAIL_COLORS) as EmailColorToken[]).map((token) => ({
  token,
  hex: EMAIL_COLORS[token],
  role: EMAIL_COLOR_SOURCE[token].cssVar,
}));

const geometryGroups = [
  {
    title: "Shell (480px)",
    rows: [
      ["width", EMAIL_SHELL.width],
      ["content column", EMAIL_SHELL.contentWidth],
      ["card padding", EMAIL_SHELL.padding],
      ["page gutter", EMAIL_SHELL.pagePadding],
      ["radius", EMAIL_SHELL.radius],
      ["border", EMAIL_SHELL.borderWidth],
      ["block gap", EMAIL_SHELL.gap],
      ["reference height", EMAIL_SHELL.referenceHeight],
    ],
  },
  {
    title: "Typography",
    rows: [
      ["body", `${EMAIL_TYPOGRAPHY.bodyFontSize}/${EMAIL_TYPOGRAPHY.bodyLineHeight}`],
      ["body weight", String(EMAIL_TYPOGRAPHY.bodyFontWeight)],
      ["heading", `${EMAIL_TYPOGRAPHY.headingFontSize}/${EMAIL_TYPOGRAPHY.headingLineHeight}`],
      ["heading weight", String(EMAIL_TYPOGRAPHY.headingFontWeight)],
      ["footer", `${EMAIL_FOOTER.fontSize}/${EMAIL_FOOTER.lineHeight}`],
      ["mobile heading", EMAIL_MOBILE.headingFontSize],
    ],
  },
  {
    title: "Brand lockup",
    rows: [
      ["mark box", `${EMAIL_BRAND_MARK.widthPx} × ${EMAIL_BRAND_MARK.heightPx}px`],
      ["viewBox", EMAIL_BRAND_MARK.viewBox],
      ["mark · wordmark gap", EMAIL_BRAND_MARK.gap],
      ["wordmark", EMAIL_BRAND_MARK.wordmarkFontSize],
      ["wordmark weight", String(EMAIL_BRAND_MARK.wordmarkFontWeight)],
      ["capsule", EMAIL_COLORS.brand],
    ],
  },
  {
    title: "Primary CTA",
    rows: [
      ["height", EMAIL_CTA.height],
      ["line-height", EMAIL_CTA.lineHeight],
      ["padding-x", EMAIL_CTA.paddingX],
      ["radius", EMAIL_CTA.radius],
      ["font-size", EMAIL_CTA.fontSize],
      ["font-weight", String(EMAIL_CTA.fontWeight)],
    ],
  },
  {
    title: "Legal footer",
    rows: [
      ["font-size", EMAIL_FOOTER.fontSize],
      ["line-height", String(EMAIL_FOOTER.lineHeight)],
      ["link gap", EMAIL_FOOTER.linkGap],
      ["padding-top", EMAIL_FOOTER.paddingTop],
      ["hairline", EMAIL_FOOTER.borderWidth],
      ["focus ring", EMAIL_FOCUS.borderWidth],
    ],
  },
  {
    title: "Mobile reflow",
    rows: [
      ["breakpoint", EMAIL_MOBILE.maxWidth],
      ["card width", EMAIL_MOBILE.width],
      ["card padding", EMAIL_MOBILE.padding],
      ["page gutter", EMAIL_MOBILE.pagePadding],
      ["heading", EMAIL_MOBILE.headingFontSize],
      ["CTA width", EMAIL_MOBILE.ctaWidth],
    ],
  },
] as const;

const fontStacks = [
  { label: "--email-font-family-sans", value: EMAIL_TYPOGRAPHY.fontFamily },
  { label: "--email-font-family-mono", value: EMAIL_TYPOGRAPHY.monoFontFamily },
];

export default function Demo() {
  return (
    <PageContainer
      title="Email tokens"
      subtitle="@godxjp/ui/email · literal hex + px derived from the web tokens, for templates that cannot run React or resolve var()"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>Rendered specimen · 480px desktop</CardTitle>
            <CardDescription>
              The real document, built only from the token export: table layout, inline styles, an
              embedded brand mark, a bulletproof CTA and the legal footer. The card is{" "}
              {EMAIL_SHELL.width} wide inside a {EMAIL_SHELL.pagePadding} gutter; the canonical
              invitation reference measures {EMAIL_SHELL.widthPx}×{EMAIL_SHELL.referenceHeightPx}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <iframe
              title="Transactional email specimen at 480px"
              srcDoc={specimen}
              className="border-border bg-background w-full rounded-md border"
              style={{ height: 560 }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Rendered specimen · narrow mobile</CardTitle>
            <CardDescription>
              The same document at 360px. Below the {EMAIL_MOBILE.maxWidth} breakpoint the card goes
              fluid, the inset drops to {EMAIL_MOBILE.padding}, the heading steps down to{" "}
              {EMAIL_MOBILE.headingFontSize} and the CTA goes full-bleed. Every reflow rule has an
              inline fallback, so a client that strips the style block still renders the desktop
              layout rather than a broken one.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <iframe
              title="Transactional email specimen at 360px"
              srcDoc={specimen}
              className="border-border bg-background rounded-md border"
              style={{ width: 360, height: 620 }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Brand mark</CardTitle>
            <CardDescription>
              The canonical GoDX mark is the emerald capsule plus the internal glyph. The artwork is
              byte-identical to the <code>&lt;Logo mark=&quot;godx&quot; /&gt;</code> path and to
              the SCR-302 reference raster; only the rendered box is email-specific (
              {EMAIL_BRAND_MARK.width}, against the 32px web box). A capsule alone is the incomplete
              mark. In a header the mark is DECORATIVE and pairs with the readable wordmark{" "}
              {EMAIL_BRAND_MARK.gap} away at {EMAIL_BRAND_MARK.wordmarkFontSize}/
              {EMAIL_BRAND_MARK.wordmarkFontWeight}, so the name is announced once. Three
              deliveries, none of which fetches an asset: inline SVG, the same SVG as a data: URL,
              and a table fallback for clients with no SVG support.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveGrid columns={{ sm: 1, md: 3 }}>
              {[
                { label: "Inline <svg>", markup: EMAIL_BRAND_MARK.svg },
                {
                  // Prose label, not markup: it names the email delivery form. The real delivery
                  // on the next line is a self-contained data: URI (email clients block remote
                  // images) and it does carry alt="GoDX".
                  // ui-audit-disable-next-line img-needs-alt
                  label: "data: URL in <img>",
                  markup: `<img src="${EMAIL_BRAND_MARK.dataUri}" width="${EMAIL_BRAND_MARK.widthPx}" height="${EMAIL_BRAND_MARK.heightPx}" alt="GoDX">`,
                },
                // Prose label, not markup: a raw <table> is the only brand-mark fallback that
                // renders in email clients without SVG support, so the label names it literally.
                // ui-audit-disable-next-line no-raw-table
                { label: "<table> fallback", markup: EMAIL_BRAND_MARK.tableHtml },
              ].map((item) => (
                <Flex key={item.label} direction="col" gap="sm">
                  <div
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{ __html: item.markup }}
                  />
                  <Text size="sm" tone="muted">
                    {item.label}
                  </Text>
                </Flex>
              ))}
            </ResponsiveGrid>
            <Flex direction="col" gap="xs" className="mt-4">
              <Text size="sm" tone="muted">
                viewBox {EMAIL_BRAND_MARK.viewBox} · {EMAIL_BRAND_MARK.width}×
                {EMAIL_BRAND_MARK.height} · capsule {EMAIL_COLORS.brand} · glyph{" "}
                {EMAIL_COLORS.brandForeground}
              </Text>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Palette</CardTitle>
            <CardDescription>
              Each slot is the semantic web role converted HSL→hex at module load. No literal is
              ever copied by hand. Re-theme the role and the email follows. The action-required rail
              uses {EMAIL_URGENCY.accent} from <code>--attention</code>; solid urgency labels use{" "}
              {EMAIL_URGENCY.solidForeground} on {EMAIL_URGENCY.solidBackground} only for icons or
              large/bold text. Body copy remains foreground on surface.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveGrid columns={{ sm: 2, md: 3, lg: 4 }}>
              {colorRows.map((row) => (
                <Flex key={row.token} direction="col" gap="xs">
                  <div
                    className="border-border h-12 rounded-md border"
                    style={{ backgroundColor: row.hex }}
                  />
                  <Text size="sm">{row.token}</Text>
                  <Flex gap="xs" align="center">
                    <Badge tone="neutral" variant="outline">
                      {row.role}
                    </Badge>
                    <Text size="sm" tone="muted">
                      {row.hex}
                    </Text>
                  </Flex>
                </Flex>
              ))}
            </ResponsiveGrid>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Geometry &amp; typography</CardTitle>
            <CardDescription>
              Literal px only. No rem, no calc(), no var(). The ramp is the canonical SCR-302 email
              ramp, deliberately looser and quieter than the web one: body{" "}
              {EMAIL_TYPOGRAPHY.bodyFontSize}/{EMAIL_TYPOGRAPHY.bodyLineHeight}, title{" "}
              {EMAIL_TYPOGRAPHY.headingFontSize} at weight {EMAIL_TYPOGRAPHY.headingFontWeight} (a
              transactional title is calm, not bold), legal band {EMAIL_FOOTER.fontSize}/
              {EMAIL_FOOTER.lineHeight}. Font stacks name the canonical Noto Sans JP face FIRST and
              then degrade. No email client honours <code>@font-face</code>, so a reader gets Noto
              Sans JP only where it is already available and otherwise lands on Hiragino (macOS/iOS),
              Yu Gothic (Windows), M PLUS 2, Meiryo, the system UI face, Arial, then{" "}
              <code>sans-serif</code>. Families are single-quoted so the value drops into a
              double-quoted <code>style</code> attribute unescaped.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="xs" className="mb-4">
              {fontStacks.map((stack) => (
                <Flex key={stack.label} direction="col" gap="xs">
                  <Badge tone="neutral" variant="outline">
                    {stack.label}
                  </Badge>
                  <Text size="sm" tone="muted">
                    {stack.value}
                  </Text>
                </Flex>
              ))}
            </Flex>
            <ResponsiveGrid columns={{ sm: 1, md: 2, lg: 4 }}>
              {geometryGroups.map((group) => (
                <Flex key={group.title} direction="col" gap="xs">
                  <Text weight="medium">{group.title}</Text>
                  {group.rows.map(([label, value]) => (
                    <Flex key={label} justify="between" gap="sm">
                      <Text size="sm" tone="muted">
                        {label}
                      </Text>
                      <Text size="sm">{value}</Text>
                    </Flex>
                  ))}
                </Flex>
              ))}
            </ResponsiveGrid>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
