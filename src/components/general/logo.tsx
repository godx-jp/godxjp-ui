import * as React from "react";

import { cn } from "../../lib/utils";

export type LogoSize = "xs" | "sm" | "md" | "lg";
export type LogoTone = "primary" | "success";
export type LogoMark = "glyph" | "godx";

export interface LogoProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  /**
   * The brand glyph — a short mark (a letter/initials, default `"g"`) or a custom node such as an
   * inline `<svg>`. Keep it to 1–2 glyphs; the box is square and centres its content.
   */
  glyph?: React.ReactNode;
  /**
   * Semantic mark artwork. `"godx"` renders the canonical GoDX identity mark as an inline vector;
   * `"glyph"` preserves the configurable boxed-glyph treatment.
   */
  mark?: LogoMark;
  /** Box size tier (tokenised). Default `"md"` (1.75rem). */
  size?: LogoSize;
  /**
   * Semantic fill role. `"success"` provides the canonical green identity mark without changing
   * the application's primary action colour. Default `"primary"` preserves existing behaviour.
   */
  tone?: LogoTone;
  /**
   * Readable product name rendered BESIDE the mark as one lockup. Pass the localized product name
   * (a string, or a node when the name needs its own markup). When set, `Logo` renders
   * `mark + wordmark` in a single inline-flex lockup: the mark becomes decorative and the wordmark
   * carries the accessible name, so the pair is announced once. The wordmark reads
   * `--logo-wordmark-*` tokens — its colour defaults to the identity role for the GoDX/`success`
   * lockup and NEVER to `--primary`, so a re-themed action colour cannot recolour the brand.
   * Omit for the bare mark (today's behaviour, unchanged).
   *
   * NOTE: the library ships no wordmark ARTWORK — the wordmark is set in the design-system
   * typeface (`--logo-wordmark-font-family`, default `--font-family-display`). Pass an inline
   * `<svg>` here when a real logotype asset exists.
   */
  wordmark?: React.ReactNode;
  /**
   * Accessible name for the mark. When set, the logo is exposed to assistive tech as an image with
   * this name; when omitted the mark is decorative (`aria-hidden`) — the correct default when a
   * readable wordmark sits beside it. With `wordmark` set, `label` overrides the lockup's
   * accessible name (the wordmark text is otherwise the name).
   */
  label?: string;
}

function MarkArtwork({ mark, glyph }: { mark: LogoMark; glyph: React.ReactNode }) {
  if (mark !== "godx") return <>{glyph}</>;
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
 * mark + wordmark LOCKUP. Use it INSTEAD of hand-rolling a bare span with a fixed square size, a
 * literal radius, and `bg-primary` + type utilities in shell headers, auth screens, and topbars —
 * that repeats literal size/radius and puts type utilities on a bare span (rules #45/#46). Size,
 * radius, per-tier font-size, the wordmark's face/weight/tracking/colour and the mark↔wordmark gap
 * are all tokens.
 *
 * COLOUR: the boxed glyph fill reads the primary role, so a re-themed `--primary` re-tints it.
 * `mark="godx"` / `tone="success"` instead read the IDENTITY tokens (`--logo-godx-color`,
 * `--logo-success-*`, `--logo-wordmark-color`), which never reference `--primary` — the canonical
 * brand-green GoDX lockup therefore survives any action-colour re-theme with zero consumer CSS.
 *
 * A11Y: with a `wordmark`, the mark is decorative and the wordmark text carries the accessible
 * name (announced once). Without one, set `label` when the mark stands alone.
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
