import * as React from "react";

import { useMediaQuery } from "./hooks";

/**
 * A CSS `@media` query cannot resolve a custom property, so a breakpoint that is meant to be
 * THEMEABLE has to be read off the document root in JS and handed to `matchMedia`. That is the
 * mechanism `Sheet` has used since its responsive mode shipped; it lives here because `Tabs` now
 * needs the same thing (gh#502) and a second copy of the length parser is a second place for the
 * two to drift.
 *
 * The alternative — a literal `@media` in CSS — is what `AppShell` still does, and the parity
 * audit already files that as the defect it is: the drawer line is themeable, the shell collapse
 * line is not, and nothing says which is right.
 */

/** CSS length → px. Supports the units a breakpoint knob is realistically written in. */
function cssLengthToPx(value: string, rootFontSize: number): number | undefined {
  const match = /^(-?\d*\.?\d+)(px|rem|em)?$/.exec(value.trim());
  if (match == null) return undefined;
  const amount = Number(match[1]);
  if (!Number.isFinite(amount)) return undefined;
  return match[2] === "rem" || match[2] === "em" ? amount * rootFontSize : amount;
}

/**
 * Build a `(max-width: …)` query from the custom property `token` declared on the document root,
 * falling back to `fallbackQuery` wherever the token cannot be read (SSR, a token-less test env,
 * a theme that wrote something unparseable).
 */
function readMaxWidthQuery(token: string, fallbackQuery: string): string {
  if (typeof document === "undefined" || typeof window.getComputedStyle !== "function") {
    return fallbackQuery;
  }
  const rootStyle = window.getComputedStyle(document.documentElement);
  const rootFontSize = cssLengthToPx(rootStyle.fontSize || "16px", 16) ?? 16;
  const px = cssLengthToPx(rootStyle.getPropertyValue(token), rootFontSize);
  return px == null ? fallbackQuery : `(max-width: ${String(px)}px)`;
}

/**
 * True while the viewport is at or below the width the theme token `token` names.
 *
 * The token is read once per mount rather than at module scope: the fallback is what SSR and the
 * first client render agree on, and the themed value arrives in the effect. Same-value updates
 * bail out inside React, so a theme that left the default alone re-renders nothing.
 */
export function useMaxWidthBreakpoint(token: string, fallbackQuery: string): boolean {
  const [query, setQuery] = React.useState(fallbackQuery);

  React.useEffect(() => {
    setQuery(readMaxWidthQuery(token, fallbackQuery));
  }, [token, fallbackQuery]);

  return useMediaQuery(query);
}
