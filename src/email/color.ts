/**
 * Email colour contract — semantic web roles resolved to LITERAL hex.
 *
 * HTML email has no cascade worth trusting: Gmail strips <style>, Outlook ignores custom
 * properties, and every colour must appear inline as `#rrggbb` on the element that paints it. The
 * web tokens, meanwhile, are HSL channel triplets (`--primary: 204 100% 39%`) so they can be
 * alpha-composed. This module bridges the two — the triplets are GENERATED from
 * src/tokens/foundation.css (scripts/gen-email-tokens.mjs) and converted here, at module load, by
 * the same `hslToHex` a consumer can call on its own brand roles. There is no hex literal in this
 * directory, so an email palette that drifts from the web palette is structurally impossible.
 */
import { EMAIL_COLOR_SOURCE, EMAIL_COLOR_SOURCE_DARK } from "./tokens.generated";

/**
 * The email palette slots. Each maps 1:1 to a semantic role in `src/tokens/foundation.css`
 * (`EMAIL_COLOR_SOURCE[token].cssVar` names it), so a re-themed role re-tints the email.
 */
export type EmailColorToken = keyof typeof EMAIL_COLOR_SOURCE;

/** A `#rrggbb` string — the only colour form every email client renders identically. */
export type EmailHex = `#${string}`;

const TRIPLET = /^\s*(-?\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%\s*$/;

const channel = (n: number): string =>
  Math.round(Math.min(255, Math.max(0, n * 255)))
    .toString(16)
    .padStart(2, "0");

/**
 * Convert a CSS HSL channel triplet (`"204 100% 39%"` — the shape every `@godxjp/ui` colour role
 * uses) into the `#rrggbb` literal an email client needs. Rounds each channel the way a browser
 * does, so the hex is exactly what `hsl(var(--role))` paints on the web.
 *
 * Consumers with a custom brand role can call this directly:
 * `hslToHex(getComputedStyle(el).getPropertyValue("--primary"))`.
 *
 * @throws if the input is not a bare `H S% L%` triplet (a hex or `hsl(...)` wrapper is rejected
 * rather than silently mis-parsed).
 */
export function hslToHex(triplet: string): EmailHex {
  const parsed = TRIPLET.exec(triplet);
  if (!parsed) {
    throw new TypeError(
      `hslToHex expects a bare HSL channel triplet like "204 100% 39%", received "${triplet}".`,
    );
  }
  const hue = (((Number(parsed[1]) % 360) + 360) % 360) / 60;
  const saturation = Number(parsed[2]) / 100;
  const lightness = Number(parsed[3]) / 100;

  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const second = chroma * (1 - Math.abs((hue % 2) - 1));
  const base = lightness - chroma / 2;

  const [r, g, b] =
    hue < 1
      ? [chroma, second, 0]
      : hue < 2
        ? [second, chroma, 0]
        : hue < 3
          ? [0, chroma, second]
          : hue < 4
            ? [0, second, chroma]
            : hue < 5
              ? [second, 0, chroma]
              : [chroma, 0, second];

  return `#${channel(r + base)}${channel(g + base)}${channel(b + base)}`;
}

function resolve(
  source: Record<string, { readonly cssVar: string; readonly hsl: string }>,
): Readonly<Record<EmailColorToken, EmailHex>> {
  const out = {} as Record<EmailColorToken, EmailHex>;
  for (const [token, entry] of Object.entries(source)) {
    out[token as EmailColorToken] = hslToHex(entry.hsl);
  }
  return Object.freeze(out);
}

/**
 * The canonical (light-scheme) transactional-email palette, as literal hex.
 *
 * | slot                          | web role                          | used for                          |
 * | ----------------------------- | --------------------------------- | --------------------------------- |
 * | `background`                  | `--background`                    | the page wrapper behind the card  |
 * | `foreground`                  | `--foreground`                    | body copy                         |
 * | `surface` / `surfaceForeground`| `--card` / `--card-foreground`   | the 480px card                    |
 * | `muted` / `mutedForeground`   | `--muted` / `--muted-foreground`  | quiet bands, legal copy           |
 * | `border`                      | `--border`                        | card edge, footer hairline        |
 * | `primary` / `primaryForeground`| `--primary` / `--primary-foreground` | the one CTA                  |
 * | `focus`                       | `--ring`                          | focus affordance in webmail panes |
 * | `brand` / `brandForeground`   | `--success` / `--success-foreground` | the GoDX capsule + its glyph   |
 * | `urgency` / `urgencyForeground`| `--attention` / `--attention-foreground` | action-required accent / solid large label |
 */
export const EMAIL_COLORS: Readonly<Record<EmailColorToken, EmailHex>> = resolve(
  EMAIL_COLOR_SOURCE as unknown as Record<string, { cssVar: string; hsl: string }>,
);

/**
 * The dark-scheme palette, derived from the same roles under `.dark` /
 * `:root[data-theme="dark"]`. Use it inside `@media (prefers-color-scheme: dark)` for the clients
 * that honour it — never as the only palette, since most clients do not.
 */
export const EMAIL_COLORS_DARK: Readonly<Record<EmailColorToken, EmailHex>> = resolve(
  EMAIL_COLOR_SOURCE_DARK as unknown as Record<string, { cssVar: string; hsl: string }>,
);
