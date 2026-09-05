/**
 * Email geometry + typography contract — the `--email-*` component tokens resolved to the two
 * forms an email template actually needs: a CSS string (`"480px"`, for `style="width:480px"`) and a
 * bare number (`480`, for the legacy HTML attribute form `<table width="480">` that Outlook's Word
 * renderer still prefers). Both come from src/tokens/components/email.css via
 * scripts/gen-email-tokens.mjs — nothing here is hand-typed.
 */
import { EMAIL_GEOMETRY_SOURCE } from "./tokens.generated";

/** Every `--email-*` token name declared in the component token tier. */
export type EmailTokenName = keyof typeof EMAIL_GEOMETRY_SOURCE;

const raw = (name: EmailTokenName): string => EMAIL_GEOMETRY_SOURCE[name];

/** Numeric px value of a token, for the HTML attribute form (`width="480"`). */
const num = (name: EmailTokenName): number => {
  const value = EMAIL_GEOMETRY_SOURCE[name];
  const parsed = Number.parseFloat(value);
  if (Number.isNaN(parsed)) {
    throw new TypeError(`Email token ${name} ("${value}") has no numeric value.`);
  }
  return parsed;
};

/** The 480px transactional shell — the card and the page gutter around it. */
export interface EmailShellTokens {
  /** Card width as a CSS length. */
  readonly width: string;
  /** Card width as a number, for `<table width="…">`. */
  readonly widthPx: number;
  /** Width of the column INSIDE the card padding (`width − 2 × padding`). */
  readonly contentWidth: string;
  readonly contentWidthPx: number;
  /** Card inset on desktop. */
  readonly padding: string;
  readonly paddingPx: number;
  /** Gutter between the client viewport and the card. */
  readonly pagePadding: string;
  readonly pagePaddingPx: number;
  /** Card edge hairline. */
  readonly borderWidth: string;
  readonly borderWidthPx: number;
  /** Card corner radius (ignored by Outlook's Word renderer — degrade to square, never to an image). */
  readonly radius: string;
  readonly radiusPx: number;
  /** Vertical rhythm between blocks. */
  readonly gap: string;
  readonly gapPx: number;
  /** Tight rhythm (heading ↔ lede). */
  readonly gapSm: string;
  readonly gapSmPx: number;
  /** Height the canonical invitation reference card measures at this geometry (480×407). */
  readonly referenceHeight: string;
  readonly referenceHeightPx: number;
}

export const EMAIL_SHELL: EmailShellTokens = Object.freeze({
  width: raw("--email-shell-width"),
  widthPx: num("--email-shell-width"),
  contentWidth: `${num("--email-shell-width") - 2 * num("--email-shell-padding")}px`,
  contentWidthPx: num("--email-shell-width") - 2 * num("--email-shell-padding"),
  padding: raw("--email-shell-padding"),
  paddingPx: num("--email-shell-padding"),
  pagePadding: raw("--email-shell-page-padding"),
  pagePaddingPx: num("--email-shell-page-padding"),
  borderWidth: raw("--email-shell-border-width"),
  borderWidthPx: num("--email-shell-border-width"),
  radius: raw("--email-card-radius"),
  radiusPx: num("--email-card-radius"),
  gap: raw("--email-stack-gap"),
  gapPx: num("--email-stack-gap"),
  gapSm: raw("--email-stack-gap-sm"),
  gapSmPx: num("--email-stack-gap-sm"),
  referenceHeight: raw("--email-card-reference-height"),
  referenceHeightPx: num("--email-card-reference-height"),
});

/** Type ramp. Sizes are literal px — no email client resolves the rem scale reliably. */
export interface EmailTypographyTokens {
  /**
   * The canonical DXS stack, Noto Sans JP first (product override, direct instruction). Web-font
   * `@font-face` is unavailable in most clients, so this NAMES the face and degrades: a client
   * with Noto Sans JP installed (or a webmail that already loaded it) renders the canonical face;
   * everything else falls to Hiragino (macOS/iOS) → Yu Gothic (Windows) → M PLUS 2 → Meiryo → the
   * system UI face → Arial → `sans-serif`.
   */
  readonly fontFamily: string;
  /** Mono stack for invoice ids, masked card numbers, ISO dates and amounts. */
  readonly monoFontFamily: string;
  readonly bodyFontSize: string;
  readonly bodyFontSizePx: number;
  readonly bodyLineHeight: number;
  readonly bodyFontWeight: number;
  readonly headingFontSize: string;
  readonly headingFontSizePx: number;
  readonly headingLineHeight: number;
  readonly headingFontWeight: number;
}

export const EMAIL_TYPOGRAPHY: EmailTypographyTokens = Object.freeze({
  fontFamily: raw("--email-font-family-sans"),
  monoFontFamily: raw("--email-font-family-mono"),
  bodyFontSize: raw("--email-body-font-size"),
  bodyFontSizePx: num("--email-body-font-size"),
  bodyLineHeight: num("--email-body-line-height"),
  bodyFontWeight: num("--email-body-font-weight"),
  headingFontSize: raw("--email-heading-font-size"),
  headingFontSizePx: num("--email-heading-font-size"),
  headingLineHeight: num("--email-heading-line-height"),
  headingFontWeight: num("--email-heading-font-weight"),
});

/** The single primary call-to-action. */
export interface EmailCtaTokens {
  readonly height: string;
  readonly heightPx: number;
  /** Equal to the height so the label centres without flexbox (Outlook has none). */
  readonly lineHeight: string;
  readonly lineHeightPx: number;
  readonly paddingX: string;
  readonly paddingXPx: number;
  readonly radius: string;
  readonly radiusPx: number;
  readonly fontSize: string;
  readonly fontSizePx: number;
  readonly fontWeight: number;
}

export const EMAIL_CTA: EmailCtaTokens = Object.freeze({
  height: raw("--email-cta-height"),
  heightPx: num("--email-cta-height"),
  lineHeight: raw("--email-cta-line-height"),
  lineHeightPx: num("--email-cta-line-height"),
  paddingX: raw("--email-cta-padding-x"),
  paddingXPx: num("--email-cta-padding-x"),
  radius: raw("--email-cta-radius"),
  radiusPx: num("--email-cta-radius"),
  fontSize: raw("--email-cta-font-size"),
  fontSizePx: num("--email-cta-font-size"),
  fontWeight: num("--email-cta-font-weight"),
});

/** The legal band under the body — quiet type, a hairline, and the inter-link spacing. */
export interface EmailFooterTokens {
  readonly fontSize: string;
  readonly fontSizePx: number;
  readonly lineHeight: number;
  /** Horizontal separation between adjacent footer links. */
  readonly linkGap: string;
  readonly linkGapPx: number;
  readonly paddingTop: string;
  readonly paddingTopPx: number;
  readonly borderWidth: string;
  readonly borderWidthPx: number;
}

export const EMAIL_FOOTER: EmailFooterTokens = Object.freeze({
  fontSize: raw("--email-footer-font-size"),
  fontSizePx: num("--email-footer-font-size"),
  lineHeight: num("--email-footer-line-height"),
  linkGap: raw("--email-footer-link-gap"),
  linkGapPx: num("--email-footer-link-gap"),
  paddingTop: raw("--email-footer-padding-top"),
  paddingTopPx: num("--email-footer-padding-top"),
  borderWidth: raw("--email-footer-border-width"),
  borderWidthPx: num("--email-footer-border-width"),
});

/** Focus affordance for the webmail preview panes that DO honour `:focus` (WCAG 2.4.7/2.4.11). */
export interface EmailFocusTokens {
  readonly borderWidth: string;
  readonly borderWidthPx: number;
}

export const EMAIL_FOCUS: EmailFocusTokens = Object.freeze({
  borderWidth: raw("--email-focus-border-width"),
  borderWidthPx: num("--email-focus-border-width"),
});

/** Narrow-viewport reflow — apply under `@media (max-width: …)` and via `width="100%"` fallbacks. */
export interface EmailMobileTokens {
  /** The reflow breakpoint (card width + both gutters). */
  readonly maxWidth: string;
  readonly maxWidthPx: number;
  /** The card goes fluid below the breakpoint. */
  readonly width: string;
  readonly padding: string;
  readonly paddingPx: number;
  readonly pagePadding: string;
  readonly pagePaddingPx: number;
  readonly headingFontSize: string;
  readonly headingFontSizePx: number;
  /** The CTA goes full-bleed so the tap target spans the card. */
  readonly ctaWidth: string;
}

export const EMAIL_MOBILE: EmailMobileTokens = Object.freeze({
  maxWidth: raw("--email-mobile-max-width"),
  maxWidthPx: num("--email-mobile-max-width"),
  width: raw("--email-mobile-width"),
  padding: raw("--email-mobile-padding"),
  paddingPx: num("--email-mobile-padding"),
  pagePadding: raw("--email-mobile-page-padding"),
  pagePaddingPx: num("--email-mobile-page-padding"),
  headingFontSize: raw("--email-mobile-heading-font-size"),
  headingFontSizePx: num("--email-mobile-heading-font-size"),
  ctaWidth: raw("--email-mobile-cta-width"),
});
