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

function MarkArtwork({ mark, glyph }: { mark: LogoMark; glyph: React.ReactNode }) {
  // The glyph gets its own element on purpose: `--logo-glyph-*-optical-offset` translates the INK,
  // which on `.ui-logo` (the grid container) would drag the fill and the rounded box with it.
  // `data-ink` is the half of the correction CSS cannot derive — see `.ui-logo-glyph` in
  // logo-layout.css for why one glyph-blind rule cannot centre every class, and the measurements.
  if (mark !== "godx")
    return (
      <span data-slot="logo-glyph" data-ink={logoGlyphInk(glyph)} className="ui-logo-glyph">
        {glyph}
      </span>
    );
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
