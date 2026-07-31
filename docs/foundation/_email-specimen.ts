/**
 * A complete transactional-email document, built ONLY from `@godxjp/ui/email`.
 *
 * This is the reference implementation the `foundation/email-tokens` page renders in an iframe and
 * that a Blade / Twig / MJML author copies: table layout, literal inline styles, an embedded brand
 * mark, a bulletproof CTA and a legal footer — with every colour, size and radius read from the
 * token export instead of typed by hand. The copy is deliberate placeholder text; product wording,
 * recipients, links and locale belong to the sending application.
 */
import {
  EMAIL_BRAND_MARK,
  EMAIL_COLORS,
  EMAIL_COLORS_DARK,
  EMAIL_CTA,
  EMAIL_FOCUS,
  EMAIL_FOOTER,
  EMAIL_MOBILE,
  EMAIL_SHELL,
  EMAIL_TYPOGRAPHY,
  emailInlineStyle,
} from "@godxjp/ui/email";

const c = EMAIL_COLORS;

/** A vertical spacer row — the only rhythm device every client honours. */
const spacer = (height: number) =>
  `<div style="${emailInlineStyle({ height: `${height}px`, lineHeight: `${height}px`, fontSize: 0 })}">&#8203;</div>`;

/**
 * The `<style>` block: progressive enhancement ONLY. Every rule here has a literal inline
 * equivalent, so a client that strips `<style>` (Gmail on mobile web, most desktop clients) still
 * renders the desktop layout correctly — it simply does not reflow.
 */
const progressiveStyles = `
  @media (max-width: ${EMAIL_MOBILE.maxWidth}) {
    .email-page { padding: ${EMAIL_MOBILE.pagePadding} !important; }
    .email-card { width: ${EMAIL_MOBILE.width} !important; }
    .email-body { padding: ${EMAIL_MOBILE.padding} !important; }
    .email-heading { font-size: ${EMAIL_MOBILE.headingFontSize} !important; }
    .email-cta, .email-cta-link { width: ${EMAIL_MOBILE.ctaWidth} !important; }
  }
  @media (prefers-color-scheme: dark) {
    .email-page { background-color: ${EMAIL_COLORS_DARK.background} !important; }
    .email-card { background-color: ${EMAIL_COLORS_DARK.surface} !important;
                  border-color: ${EMAIL_COLORS_DARK.border} !important; }
    .email-body, .email-heading { color: ${EMAIL_COLORS_DARK.foreground} !important; }
    .email-footer, .email-footer a { color: ${EMAIL_COLORS_DARK.mutedForeground} !important; }
  }
  a:focus-visible {
    outline: ${EMAIL_FOCUS.borderWidth} solid ${c.focus};
    outline-offset: 2px;
  }
`;

export interface EmailSpecimenCopy {
  heading: string;
  lede: string;
  cta: string;
  legal: string;
  links: string[];
}

export const EMAIL_SPECIMEN_COPY: EmailSpecimenCopy = {
  heading: "Heading placeholder",
  lede: "One or two calm sentences of placeholder body copy, long enough to wrap and show the 1.7 line height inside the 416px content column.",
  cta: "Primary action",
  legal: "Placeholder legal line. This address is not monitored.",
  links: ["Help", "Privacy", "Unsubscribe"],
};

/** Build the full email document. */
export function buildEmailSpecimenHtml(copy: EmailSpecimenCopy = EMAIL_SPECIMEN_COPY): string {
  const footerLinks = copy.links
    .map(
      (label, index) =>
        (index === 0
          ? ""
          : `<span style="${emailInlineStyle({ display: "inline-block", width: EMAIL_FOOTER.linkGap })}">&#8203;</span>`) +
        `<a href="#" style="${emailInlineStyle({
          color: c.mutedForeground,
          textDecoration: "underline",
          // The next line closes a JS template-literal interpolation, it is not a hand-formatted
          // price, so the currency rule is a false positive here.
          // ui-audit-disable-next-line hardcoded-currency
        })}">${label}</a>`,
    )
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<title>Transactional email specimen</title>
<style>
${progressiveStyles}
</style>
</head>
<body style="${emailInlineStyle({ margin: 0, padding: 0, backgroundColor: c.background })}">
<!-- Page canvas. Email clients support neither flex nor grid, so every band of the document is a
     presentational table. ui-audit-disable-next-line no-raw-table -->
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="${emailInlineStyle(
    { borderCollapse: "collapse", backgroundColor: c.background },
  )}">
  <tr>
    <td class="email-page" align="center" style="${emailInlineStyle({
      padding: EMAIL_SHELL.pagePadding,
      backgroundColor: c.background,
    })}">
      <!-- Card shell. A fixed-width presentational table is the only container that centres
           reliably in Outlook. ui-audit-disable-next-line no-raw-table -->
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="${EMAIL_SHELL.widthPx}" class="email-card" style="${emailInlineStyle(
        {
          width: EMAIL_SHELL.width,
          maxWidth: "100%",
          borderCollapse: "separate",
          backgroundColor: c.surface,
          border: `${EMAIL_SHELL.borderWidth} solid ${c.border}`,
          borderRadius: EMAIL_SHELL.radius,
        },
      )}">
        <tr>
          <td class="email-body" style="${emailInlineStyle({
            padding: EMAIL_SHELL.padding,
            fontFamily: EMAIL_TYPOGRAPHY.fontFamily,
            fontSize: EMAIL_TYPOGRAPHY.bodyFontSize,
            lineHeight: EMAIL_TYPOGRAPHY.bodyLineHeight,
            fontWeight: EMAIL_TYPOGRAPHY.bodyFontWeight,
            color: c.foreground,
          })}">
            ${EMAIL_BRAND_MARK.svg}
            ${spacer(EMAIL_SHELL.gapPx)}
            <h1 class="email-heading" style="${emailInlineStyle({
              margin: 0,
              fontFamily: EMAIL_TYPOGRAPHY.fontFamily,
              fontSize: EMAIL_TYPOGRAPHY.headingFontSize,
              lineHeight: EMAIL_TYPOGRAPHY.headingLineHeight,
              fontWeight: EMAIL_TYPOGRAPHY.headingFontWeight,
              color: c.foreground,
              // The next line closes a JS template-literal interpolation, not a hand-formatted
              // price, so the currency rule is a false positive here.
              // ui-audit-disable-next-line hardcoded-currency
            })}">${copy.heading}</h1>
            ${spacer(EMAIL_SHELL.gapSmPx)}
            <p style="${emailInlineStyle({
              margin: 0,
              fontSize: EMAIL_TYPOGRAPHY.bodyFontSize,
              lineHeight: EMAIL_TYPOGRAPHY.bodyLineHeight,
              color: c.foreground,
              // The next line closes a JS template-literal interpolation, not a hand-formatted
              // price, so the currency rule is a false positive here.
              // ui-audit-disable-next-line hardcoded-currency
            })}">${copy.lede}</p>
            ${spacer(EMAIL_SHELL.gapPx)}
            <!-- Bulletproof CTA. The button is a padded table cell so Outlook paints the fill and
                 the radius. ui-audit-disable-next-line no-raw-table -->
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="${emailInlineStyle(
              { borderCollapse: "separate" },
            )}">
              <tr>
                <td class="email-cta" align="center" valign="middle" height="${EMAIL_CTA.heightPx}" style="${emailInlineStyle(
                  {
                    height: EMAIL_CTA.height,
                    borderRadius: EMAIL_CTA.radius,
                    backgroundColor: c.primary,
                  },
                )}">
                  <a class="email-cta-link" href="#" style="${emailInlineStyle({
                    display: "inline-block",
                    padding: `0 ${EMAIL_CTA.paddingX}`,
                    height: EMAIL_CTA.height,
                    lineHeight: EMAIL_CTA.lineHeight,
                    fontFamily: EMAIL_TYPOGRAPHY.fontFamily,
                    fontSize: EMAIL_CTA.fontSize,
                    fontWeight: EMAIL_CTA.fontWeight,
                    color: c.primaryForeground,
                    textDecoration: "none",
                    // The next line closes a JS template-literal interpolation, not a
                    // hand-formatted price, so the currency rule is a false positive here.
                    // ui-audit-disable-next-line hardcoded-currency
                  })}">${copy.cta}</a>
                </td>
              </tr>
            </table>
            ${spacer(EMAIL_SHELL.gapPx)}
            <!-- Legal footer rail. A full-width presentational table keeps the hairline and the
                 inset stable in clients that drop CSS borders. ui-audit-disable-next-line no-raw-table -->
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td class="email-footer" style="${emailInlineStyle({
                  borderTop: `${EMAIL_FOOTER.borderWidth} solid ${c.border}`,
                  paddingTop: EMAIL_FOOTER.paddingTop,
                  fontFamily: EMAIL_TYPOGRAPHY.fontFamily,
                  fontSize: EMAIL_FOOTER.fontSize,
                  lineHeight: EMAIL_FOOTER.lineHeight,
                  color: c.mutedForeground,
                })}">
                  <p style="${emailInlineStyle({
                    margin: 0,
                    // The next line closes a JS template-literal interpolation, not a
                    // hand-formatted price, so the currency rule is a false positive here.
                    // ui-audit-disable-next-line hardcoded-currency
                  })}">${copy.legal}</p>
                  ${spacer(EMAIL_SHELL.gapSmPx)}
                  <p style="${emailInlineStyle({
                    margin: 0,
                    // The next line closes a JS template-literal interpolation, not a
                    // hand-formatted price, so the currency rule is a false positive here.
                    // ui-audit-disable-next-line hardcoded-currency
                  })}">${footerLinks}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}
