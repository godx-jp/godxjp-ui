/**
 * THE GoDX IDENTITY MARK — one copy, read by every surface that paints it.
 *
 * Brand identity v2.3. The coordinates are the kit's own normalised construction data
 * (`02_Construction/GoDX/GoDX-geometry-v2_2.json`, origin already at 0,0), not a redraw and not a
 * trace: a future artwork revision is a copy-paste of two `d` strings into this file.
 *
 * WHY IT IS SHARED. The web `<Logo mark="godx">` and the email brand mark are two renderers of ONE
 * mark, and email-tokens.test.ts asserts they are byte-identical. Before this file they were two
 * hand-kept copies — the web one was updated to the real artwork and the email one silently stayed
 * a placeholder capsule, which is exactly the drift that test exists to catch. With both importing
 * from here the assertion cannot fail for that reason again.
 *
 * MONOCHROME. The kit also ships a gradient cut (#7A00FF → #3700A6 → #0B0F3B). It is deliberately
 * not used: this mark is painted by a token (`--logo-godx-color` on the web, a colour argument in
 * email) so it re-tints per theme and knocks out on dark surfaces. A baked gradient can do neither,
 * and email clients are worse at gradients than they are at paths.
 */

/** The artwork's own coordinate space, before fitting. */
export const GODX_MARK_SOURCE = Object.freeze({ width: 241, height: 182 });

/** The square box every renderer draws into. */
export const GODX_MARK_VIEW_BOX = "0 0 32 32";

/**
 * Fits 241×182 into the square box, centred vertically.
 * scale = 32 / 241 = 0.132780; y = (32 − 182 × scale) / 2 = 3.917.
 */
export const GODX_MARK_TRANSFORM = "translate(0 3.917) scale(0.132780)";

/** The "G" body. */
export const GODX_MARK_BODY_PATH =
  "M93.0 0.0H158.0C161.0 0.0 162.0 1.0 164.0 3.0L197.0 41.0Q201.0 46.0 195.0 46.0H97.0C71.0 46.0 50.0 68.0 50.0 94.0C50.0 119.0 72.0 138.0 97.0 138.0H126.0Q132.0 138.0 128.0 143.0L95.0 180.0Q93.0 182.0 90.0 182.0C65.0 182.0 44.0 171.0 25.0 151.0C7.0 132.0 0.0 115.0 0.0 94.0C0.0 69.0 11.0 52.0 31.0 31.0C52.0 9.0 70.0 0.0 93.0 0.0Z";

/** The arrow that crosses it. */
export const GODX_MARK_ARROW_PATH =
  "M106.0 74.0H219.0Q222.0 74.0 224.0 77.0L239.0 94.0Q243.0 99.0 239.0 104.0L169.0 178.0Q165.0 182.0 160.0 182.0H114.0Q108.0 182.0 112.0 178.0L151.0 137.0Q154.0 134.0 151.0 131.0L104.0 81.0Q98.0 74.0 106.0 74.0Z";

/* ── The full LOCKUP: mark + logotype, as the kit composes them ───────────────────────────────
 *
 * `01_GoDX/assets/logos/GoDX-logo-flat.svg`. Not the mark and a typeset word placed side by side —
 * the letterforms are artwork ("GoDX" has a custom G, a custom D and an X built from three
 * facets), and `Logo`'s own docs say so: "the package ships NO wordmark ARTWORK … when design
 * supplies a real logotype, pass it as an inline <svg>; do not approximate letterforms in CSS."
 * Identity v2.3 supplies one, so the package now owns it rather than every consumer shipping a copy.
 *
 * TWO COLOUR GROUPS, and they are different ROLES, not a decorative split:
 *   · brand — the mark and the X          → --logo-godx-color (the --brand identity role)
 *   · ink   — the letters G, o, D          → --logo-godx-ink, which must flip with the theme
 *             (the kit's #0B0F3B indigo is invisible on a dark surface)
 *
 * Coordinates are the kit's, mapped to a 0,0 origin the same way the mark is: the source draws at
 * `translate(5 7)` inside a viewBox at `30 30`, so on-screen = path − (25, 23).
 */

/** The lockup's own box, before fitting. It is WIDE — 4.787:1 — so it cannot use the square mark scale. */
export const GODX_LOCKUP_SOURCE = Object.freeze({ width: 871.285714, height: 182.0 });

/** Maps the kit's drawing coordinates onto that box. */
export const GODX_LOCKUP_TRANSFORM = "translate(-25 -23)";

/** viewBox for the lockup. */
export const GODX_LOCKUP_VIEW_BOX = "0 0 871.2857 182";

/** Paths painted in the brand identity colour — the mark and the X. */
export const GODX_LOCKUP_BRAND_PATHS: readonly string[] = Object.freeze([
  "M118 23 H183 C186 23 187 24 189 26 L222 64 Q226 69 220 69 H122 C96 69 75 91 75 117 C75 142 97 161 122 161 H151 Q157 161 153 166 L120 203 Q118 205 115 205 C90 205 69 194 50 174 C32 155 25 138 25 117 C25 92 36 75 56 54 C77 32 95 23 118 23 Z",
  "M131 97 H244 Q247 97 249 100 L264 117 Q268 122 264 127 L194 201 Q190 205 185 205 H139 Q133 205 137 201 L176 160 Q179 157 176 154 L129 104 Q123 97 131 97 Z",
  "M715 44 H762 Q764 44 765 46 L801 86 L774 117 L713 47 Q711 44 715 44 Z",
  "M844 42 H895 Q897 42 895 44 L761 196 Q759 198 757 198 H711 Q708 198 710 196 L841 44 Q843 42 844 42 Z",
  "M831 121 L895 196 Q898 199 894 199 H847 Q844 199 842 197 L805 153 Q803 151 805 149 Z",
]);

/** Paths painted in the logotype ink — the letters G, o and D. */
export const GODX_LOCKUP_INK_PATHS: readonly string[] = Object.freeze([
  "M428 76 L399 98 C391 86 378 79 365 79 C342 79 325 98 325 121 C325 144 343 163 365 163 C382 163 395 153 402 137 H362 V107 H442 V121 C442 165 409 198 365 198 C322 198 287 164 287 121 C287 78 322 44 365 44 C390 44 413 57 428 76 Z",
  "M566 142.5 C566 173.704 539.585 199 507 199 C474.415 199 448 173.704 448 142.5 C448 111.296 474.415 86 507 86 C539.585 86 566 111.296 566 142.5 Z M533.5 142.5 C533.5 156.583 521.636 168 507 168 C492.364 168 480.5 156.583 480.5 142.5 C480.5 128.417 492.364 117 507 117 C521.636 117 533.5 128.417 533.5 142.5 Z",
  "M574 44 H650 C698 44 732 75 732 121 C732 162 698 198 650 198 H574 Z M616.5 78 H649 C673 78 690 96 690 121 C690 146 673 164 649 164 H616.5 Z",
]);
