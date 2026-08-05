/**
 * `@godxjp/ui/email` — the email-safe design-token contract for transactional templates (issue #227).
 *
 * ## Why this exists
 *
 * A transactional email is rendered by Blade/Twig/MJML, not React, and by clients that strip
 * `<style>`, ignore CSS custom properties, refuse relative units and block remote images. So the
 * two things a template usually reaches for — the component library and the CSS token file — are
 * both unavailable, and templates end up hand-copying hex and hand-drawing the logo. That is
 * exactly the drift this module removes: it is a FRAMEWORK-NEUTRAL, zero-dependency, React-free
 * data export of literal `#rrggbb` / `px` values plus the canonical brand-mark markup.
 *
 * ## The no-drift guarantee
 *
 * Nothing here is hand-typed. `src/tokens/foundation.css` (colour roles) and
 * `src/tokens/components/email.css` (geometry/typography) are read by
 * `scripts/gen-email-tokens.mjs` into `tokens.generated.ts`, and the HSL→hex conversion runs at
 * module load. There is no hex literal anywhere in `src/email/`, so an email palette that diverges
 * from the web palette is not something a maintainer can accidentally write.
 * `src/email/__tests__/email-tokens.test.ts` re-derives every value straight from the CSS and
 * asserts equality, and `pnpm check:email-token-sync` fails CI if the generated file goes stale.
 *
 * ## Usage
 *
 * ```ts
 * import { EMAIL_COLORS, EMAIL_URGENCY, EMAIL_SHELL, EMAIL_CTA, EMAIL_BRAND_MARK, emailInlineStyle } from "@godxjp/ui/email";
 *
 * const card = emailInlineStyle({
 *   width: EMAIL_SHELL.width,
 *   padding: EMAIL_SHELL.padding,
 *   backgroundColor: EMAIL_COLORS.surface,
 *   border: `${EMAIL_SHELL.borderWidth} solid ${EMAIL_COLORS.border}`,
 *   borderTopColor: EMAIL_URGENCY.accent,
 *   borderRadius: EMAIL_SHELL.radius,
 * });
 * ```
 *
 * A non-JS template engine (Blade, Twig, Liquid) consumes the same values through
 * `EMAIL_TOKENS_JSON` — dump it once in the build step and read the JSON from PHP:
 *
 * ```sh
 * node --input-type=module -e \
 *   'import("@godxjp/ui/email").then(m => process.stdout.write(m.EMAIL_TOKENS_JSON))' \
 *   > resources/design/email-tokens.json
 * ```
 *
 * ## Scope
 *
 * Tokens, geometry and brand markup only. Copy, recipients, links, locale, triggers and queue
 * behaviour belong to the sending application — this module knows nothing about them.
 */
export {
  hslToHex,
  EMAIL_COLORS,
  EMAIL_COLORS_DARK,
  type EmailColorToken,
  type EmailHex,
} from "./color";

export {
  EMAIL_SHELL,
  EMAIL_TYPOGRAPHY,
  EMAIL_CTA,
  EMAIL_FOOTER,
  EMAIL_FOCUS,
  EMAIL_MOBILE,
  type EmailTokenName,
  type EmailShellTokens,
  type EmailTypographyTokens,
  type EmailCtaTokens,
  type EmailFooterTokens,
  type EmailFocusTokens,
  type EmailMobileTokens,
} from "./geometry";

export {
  EMAIL_BRAND_MARK,
  EMAIL_BRAND_MARK_VIEWBOX,
  EMAIL_BRAND_MARK_CAPSULE,
  EMAIL_BRAND_MARK_GLYPH,
  emailBrandMarkSvg,
  emailBrandMarkDataUri,
  emailBrandMarkTableHtml,
  roundedRectPath,
  type EmailBrandMark,
  type EmailBrandMarkOptions,
  type EmailBrandMarkRect,
} from "./brand-mark";

export { emailInlineStyle, type EmailStyleDeclarations } from "./inline-style";

export { EMAIL_URGENCY, EMAIL_URGENCY_DARK, type EmailUrgencyTokens } from "./urgency";

export {
  EMAIL_COLOR_SOURCE,
  EMAIL_COLOR_SOURCE_DARK,
  EMAIL_GEOMETRY_SOURCE,
  type EmailColorSource,
} from "./tokens.generated";

import { EMAIL_COLORS, EMAIL_COLORS_DARK } from "./color";
import {
  EMAIL_SHELL,
  EMAIL_TYPOGRAPHY,
  EMAIL_CTA,
  EMAIL_FOOTER,
  EMAIL_FOCUS,
  EMAIL_MOBILE,
} from "./geometry";
import { EMAIL_BRAND_MARK } from "./brand-mark";
import { EMAIL_URGENCY, EMAIL_URGENCY_DARK } from "./urgency";

/** The whole contract in one object — the shape `EMAIL_TOKENS_JSON` serialises. */
export interface EmailTokens {
  readonly colors: typeof EMAIL_COLORS;
  readonly colorsDark: typeof EMAIL_COLORS_DARK;
  readonly urgency: typeof EMAIL_URGENCY;
  readonly urgencyDark: typeof EMAIL_URGENCY_DARK;
  readonly shell: typeof EMAIL_SHELL;
  readonly typography: typeof EMAIL_TYPOGRAPHY;
  readonly cta: typeof EMAIL_CTA;
  readonly footer: typeof EMAIL_FOOTER;
  readonly focus: typeof EMAIL_FOCUS;
  readonly mobile: typeof EMAIL_MOBILE;
  readonly brandMark: typeof EMAIL_BRAND_MARK;
}

/** Every email token, grouped. Import a single group when you only need one. */
export const EMAIL_TOKENS: EmailTokens = Object.freeze({
  colors: EMAIL_COLORS,
  colorsDark: EMAIL_COLORS_DARK,
  urgency: EMAIL_URGENCY,
  urgencyDark: EMAIL_URGENCY_DARK,
  shell: EMAIL_SHELL,
  typography: EMAIL_TYPOGRAPHY,
  cta: EMAIL_CTA,
  footer: EMAIL_FOOTER,
  focus: EMAIL_FOCUS,
  mobile: EMAIL_MOBILE,
  brandMark: EMAIL_BRAND_MARK,
});

/**
 * `EMAIL_TOKENS` as pretty-printed JSON — the framework-neutral bridge for template engines that
 * cannot import ES modules (Blade, Twig, Liquid, Handlebars on another runtime). Write it to a
 * file in the build step and read it from the template layer.
 */
export const EMAIL_TOKENS_JSON: string = JSON.stringify(EMAIL_TOKENS, null, 2);
