import * as React from "react";

import { cn } from "../../lib/utils";

export type LogoSize = "xs" | "sm" | "md" | "lg";
export type LogoTone = "primary" | "success";
export type LogoMark = "glyph" | "godx";

export interface LogoProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  /**
   * The brand glyph — a short mark (a letter/initials, default `"g"`) or a custom node such as an
   * inline `<svg>`. Keep it to 1–2 glyphs; the box is square and centres its content.
   *
   * A STRING is classified by the ink band it occupies (`g` x-height→descender, `GX` cap→baseline,
   * `神` the full em box) and optically centred for that band — a line box is not a letterform, and
   * the classes' centres are 0.21em apart. Any other node is left alone. Retune a band, or pin one
   * mark, with the `--logo-glyph-*-optical-offset` tokens.
   *
   * A string is also FITTED to the box: two full-width forms want ~2em against a box sized for
   * roughly one, so `東京` at `xs` is SET SMALLER rather than wrapping. The mark is always one
   * line. Retune how much of the box a fitted glyph may take with `--logo-glyph-fit-max-width`.
   */
  glyph?: React.ReactNode;
  /**
   * Semantic mark artwork. `"godx"` renders the canonical GoDX identity mark as an inline vector;
   * `"glyph"` preserves the configurable boxed-glyph treatment.
   */
  mark?: LogoMark;
  /**
   * Box size tier (tokenised), applied to EVERY mark. The boxed glyph reads `--logo-size-*`
   * (default `md` = 1.75rem); `mark="godx"` reads its own `--logo-godx-size-*` scale (default `md`
   * = 2rem — the identity artwork is a capsule in a square viewBox and needs slightly more box to
   * read at the same optical weight).
   */
  size?: LogoSize;
  /**
   * Semantic fill role. `"success"` provides the canonical green identity mark without changing
   * the application's primary action colour.
   */
  tone?: LogoTone;
  /**
   * Readable product name rendered BESIDE the mark as one lockup. Pass the localized product name
   * (a string, or a node when the name needs its own markup).
   */
  wordmark?: React.ReactNode;
  /**
   * Accessible name for the mark. When set, the logo is exposed to assistive tech as an image with
   * this name; when omitted the mark is decorative (`aria-hidden`) — the correct default when a
   * readable wordmark sits beside it.
   */
  label?: string;
}

/**
 * The band the glyph's ink actually occupies, as the (top edge, bottom edge) of the UNION of every
 * character in the string — `"GX"` is cap→baseline, `"gX"` is cap→descender.
 */
export type LogoGlyphInk = "cap-baseline" | "cap-descender" | "x-baseline" | "x-descender";

/**
 * Lowercase Latin whose ink stops at the x-height. The descenders `g p q y` belong here because the
 * set describes the TOP edge and theirs is the x-height; `i` and `j` do not, because their dot
 * reaches ascender height. Everything else — capitals, digits, the ascenders `b d f h k l t`, and
 * every CJK / kana / full-width form — reaches cap height or above.
 */
const X_HEIGHT_TOP = /^[acegmnopqrsuvwxyz]+$/;
/**
 * Latin descenders. `J` and `Q` are deliberately absent: measured across all four bundled faces
 * their ink stops at the baseline (`J` -0.017em against `G`'s -0.009em).
 */
const LATIN_DESCENDER = /[gjpqy]/;

/**
 * Classify a glyph for optical centring. Pure, no layout read, no measurement — the component is
 * the only layer that can do this at all, because CSS cannot see which character is in the box.
 * Returns `undefined` for a non-string glyph (an inline `<svg>`, any other node) and for an empty
 * string: those are not classified and keep the neutral default rather than being guessed at.
 */
export function logoGlyphInk(glyph: React.ReactNode): LogoGlyphInk | undefined {
  if (typeof glyph !== "string") return undefined;
  const text = glyph.replace(/\s+/gu, "");
  if (!text) return undefined;
  const top = X_HEIGHT_TOP.test(text) ? "x" : "cap";
  const bottom = LATIN_DESCENDER.test(text) ? "descender" : "baseline";
  return `${top}-${bottom}`;
}

/**
 * How much INLINE space the glyph string wants, as counts of the four advance classes — the fact
 * `.ui-logo-glyph`'s fit cap is computed from (gh#377). `fullwidth` is the characters that occupy
 * a whole em; `wide` is the proportional forms that REACH that em (`M W m`); `space` is the runs
 * of collapsible white space the paint keeps; `narrow` is everything else.
 *
 * The contract is that the FITTED font-size times the PAINTED advance stays inside the box, at
 * every tier, on every bundled face. Over-stating an advance only sets the mark a little smaller
 * than it had to be; under-stating it puts the mark outside its own box, which is the defect
 * these classes exist to remove.
 */
export interface LogoGlyphAdvance {
  fullwidth: number;
  wide: number;
  narrow: number;
  space: number;
}

/**
 * Characters that occupy a FULL em of inline advance — measured at exactly 1.000em on Noto Sans JP,
 * M PLUS 2 and Hiragino Sans. Han, kana and Hangul cover the marks this library is actually handed;
 * the explicit ranges add CJK punctuation (U+3000–303F, e.g. 「」・) and the fullwidth forms, which
 * belong to no script. East Asian Width itself is not an ECMAScript regex property, so this is the
 * closest the language allows.
 */
const FULL_WIDTH_ADVANCE =
  /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}\u{3000}-\u{303F}\u{FF01}-\u{FF60}\u{FFE0}-\u{FFE6}]/u;

/**
 * Proportional forms that are as wide as a full-width one. Measured max over the four bundled
 * faces: `W` 1.058em, `m` 1.010em, `M` 0.987em — all three on Hiragino Sans, all three at or
 * above a kanji's 1.000em. They are the only characters the `narrow` constant cannot bound, and
 * a mark containing one used to spill (`WW` at `xs`: 23.50px of ink in a 20px box).
 *
 * The next widest proportional forms — `w` 0.863em, `O`/`Q` 0.838em, `U` 0.829em, `H` 0.826em,
 * `N` 0.821em, `X` 0.811em — stay NARROW on purpose. They sit above the 0.81em constant too, but
 * by at most 0.053em, and measured none of them reaches the box edge at its tier's font-size
 * (`ww` at `xs` paints 19.2px of a 20px box); promoting them would shrink marks that render
 * correctly today. `M W m` are different in kind, not in degree.
 */
const EM_WIDE_ADVANCE = /[MWm]/;

/**
 * The white space CSS itself collapses and trims (CSS Text 3 §4.1.1): space, tab, and the segment
 * breaks. U+3000 IDEOGRAPHIC SPACE is deliberately absent — CSS does not collapse it, it paints a
 * full em, and `FULL_WIDTH_ADVANCE` already claims it.
 */
const COLLAPSIBLE_SPACE = /[\t\n\f\r ]/;

/**
 * Count a glyph string's characters by advance class. Pure, no layout read, no measurement — the
 * component is the only layer that can do this, because CSS cannot see which characters are in the
 * box. Returns `undefined` for a non-string glyph and for an empty string, exactly like
 * `logoGlyphInk`: those are not classified and keep the neutral default rather than being guessed
 * at. Iterates code points, so a surrogate pair (CJK Extension B) counts once.
 *
 * WHITE SPACE IS COUNTED, NOT DROPPED. `.ui-logo-glyph` sets `white-space: nowrap`, which stops
 * the mark wrapping but still PAINTS an interior space — measured 0.198em (system) to 0.333em
 * (Hiragino Sans) — so a string whose space was dropped from the count was fitted to an advance
 * narrower than the one that reached the screen (`東 京` spilled 2.63px at `md`). CSS's own
 * processing is mirrored exactly: leading and trailing runs are trimmed away, and an interior run
 * of any length collapses to ONE space (both verified in Chromium against the shipped `nowrap`).
 */
export function logoGlyphAdvance(glyph: React.ReactNode): LogoGlyphAdvance | undefined {
  if (typeof glyph !== "string") return undefined;
  const text = glyph.replace(/^[\t\n\f\r ]+|[\t\n\f\r ]+$/g, "");
  if (!text) return undefined;
  const counts = { fullwidth: 0, wide: 0, narrow: 0, space: 0 };
  let inSpaceRun = false;
  for (const character of text) {
    // FULL_WIDTH_ADVANCE is tested first so U+3000 lands on its em rather than on the space class.
    if (FULL_WIDTH_ADVANCE.test(character)) {
      counts.fullwidth += 1;
    } else if (COLLAPSIBLE_SPACE.test(character)) {
      if (!inSpaceRun) counts.space += 1;
      inSpaceRun = true;
      continue;
    } else if (EM_WIDE_ADVANCE.test(character)) {
      counts.wide += 1;
    } else {
      counts.narrow += 1;
    }
    inSpaceRun = false;
  }
  return counts;
}

function MarkArtwork({ mark, glyph }: { mark: LogoMark; glyph: React.ReactNode }) {
  // The glyph gets its own element on purpose: `--logo-glyph-*-optical-offset` translates the INK,
  // which on `.ui-logo` (the grid container) would drag the fill and the rounded box with it.
  // `data-ink` is the half of the correction CSS cannot derive — see `.ui-logo-glyph` in
  // logo-layout.css for why one glyph-blind rule cannot centre every class, and the measurements.
  if (mark !== "godx") {
    const advance = logoGlyphAdvance(glyph);
    return (
      <span
        data-slot="logo-glyph"
        data-ink={logoGlyphInk(glyph)}
        className="ui-logo-glyph"
        // The other half CSS cannot derive: how much INLINE space the string wants. See
        // `.ui-logo-glyph` in logo-layout.css — these counts are what the fit cap is computed from.
        style={
          advance &&
          ({
            "--logo-glyph-fullwidth-count": advance.fullwidth,
            "--logo-glyph-wide-count": advance.wide,
            "--logo-glyph-narrow-count": advance.narrow,
            "--logo-glyph-space-count": advance.space,
          } as React.CSSProperties)
        }
      >
        {glyph}
      </span>
    );
  }
  return (
    <svg
      data-slot="logo-artwork"
      viewBox="0 0 32 32"
      width="32"
      height="32"
      focusable="false"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M8 7h16a7 7 0 0 1 7 7v4a7 7 0 0 1-7 7H8a7 7 0 0 1-7-7v-4a7 7 0 0 1 7-7Zm0 6a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1H8Z"
      />
    </svg>
  );
}

/**
 * Logo — the product brand-mark box: a glyph on the primary fill, or (with `wordmark`) the full
 * mark + wordmark LOCKUP. Size, radius, per-tier font-size, the wordmark's
 * face/weight/tracking/colour and the mark↔wordmark gap are all tokens.
 */
export const Logo = React.forwardRef<HTMLSpanElement, LogoProps>(
  (
    {
      glyph = "g",
      mark = "glyph",
      size = "md",
      tone = "primary",
      wordmark,
      label,
      className,
      ...props
    },
    ref,
  ) => {
    const hasWordmark = wordmark !== undefined && wordmark !== null && wordmark !== false;
    const identity = { "data-mark": mark, "data-size": size, "data-tone": tone } as const;

    // Lockup: the ROOT is the mark + wordmark row (ref/className/...props land on it, so the
    // consumer positions one element). The mark is always decorative here — the wordmark text is
    // the accessible name unless `label` overrides it (role="img" makes descendants presentational).
    if (hasWordmark) {
      return (
        <span
          ref={ref}
          data-slot="logo-lockup"
          {...identity}
          className={cn("ui-logo-lockup", className)}
          role={label ? "img" : undefined}
          aria-label={label}
          {...props}
        >
          <span data-slot="logo" {...identity} className="ui-logo" aria-hidden="true">
            <MarkArtwork mark={mark} glyph={glyph} />
          </span>
          {/* `data-logotype` marks this as brand-name artwork: WCAG 2.2 SC 1.4.3 exempts "text
           * that is part of a logo or brand name" from the contrast minimum, and check:contrast
           * reads exactly this attribute. The wordmark is typeset identity, not readable UI copy —
           * the canonical GoDX emerald (--brand, #009766) is the brand's colour, not a choice the
           * library may darken. */}
          <span data-slot="logo-wordmark" data-logotype className="ui-logo-wordmark">
            {wordmark}
          </span>
        </span>
      );
    }

    return (
      <span
        ref={ref}
        data-slot="logo"
        {...identity}
        className={cn("ui-logo", className)}
        role={label ? "img" : undefined}
        aria-label={label}
        aria-hidden={label ? undefined : true}
        {...props}
      >
        <MarkArtwork mark={mark} glyph={glyph} />
      </span>
    );
  },
);
Logo.displayName = "Logo";
