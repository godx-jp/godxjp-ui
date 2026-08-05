import { EMAIL_COLORS, EMAIL_COLORS_DARK, type EmailHex } from "./color";

/**
 * Semantic action-required styling for transactional email.
 *
 * `accent` is the non-text rail/border color painted on the normal email surface. The solid pair
 * is safe for icons and large or bold labels that satisfy the 3:1 contrast floor; it is not a
 * replacement for normal body copy, which remains `EMAIL_COLORS.foreground` on
 * `EMAIL_COLORS.surface`. This deliberately narrow contract prevents urgency from becoming an
 * undocumented second CTA or a component-local palette.
 */
export interface EmailUrgencyTokens {
  /** Non-text action-required rail or border on the standard email surface. */
  readonly accent: EmailHex;
  /** Solid action-required fill for an icon or large/bold label. */
  readonly solidBackground: EmailHex;
  /** Foreground paired only with `solidBackground` under the usage restriction above. */
  readonly solidForeground: EmailHex;
}

function resolveUrgency(colors: {
  readonly urgency: EmailHex;
  readonly urgencyForeground: EmailHex;
}): Readonly<EmailUrgencyTokens> {
  return Object.freeze({
    accent: colors.urgency,
    solidBackground: colors.urgency,
    solidForeground: colors.urgencyForeground,
  });
}

/** Light-scheme action-required email contract. */
export const EMAIL_URGENCY: Readonly<EmailUrgencyTokens> = resolveUrgency(EMAIL_COLORS);

/** Dark-scheme action-required email contract for clients that honor dark-mode overrides. */
export const EMAIL_URGENCY_DARK: Readonly<EmailUrgencyTokens> = resolveUrgency(EMAIL_COLORS_DARK);
