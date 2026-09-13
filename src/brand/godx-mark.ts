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
