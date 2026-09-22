/**
 * THE TEXT OF A CSS BLOCK COMMENT, WITH ITS GUTTER REMOVED (gh#871).
 *
 * Both token parsers turned a comment into a description by collapsing whitespace — and nothing
 * removed the per-line `*` that a multi-line comment is written with, so every continuation line's
 * marker survived as a WORD. 938 of the 1974 descriptions in `agent/tokens.json` carried one, 4916
 * occurrences in all, always mid-sentence at the point where two clauses join:
 *
 *   > … warm hue-60 neutral spine, GoDX violet `*` primary (identity v2.3) …
 *
 * A `*` dropped into a clause is indistinguishable from emphasis markup, a footnote marker or a
 * glob, and this is the field an agent reads to decide whether a token is a knob it may set.
 *
 * IT LIVES IN ONE MODULE BECAUSE THE DEFECT WAS THAT IT LIVED IN TWO. `component-token-rules.mjs`
 * and `theme-token-rules.mjs` each collapse a comment in two places (the file header and the
 * per-token body); a fix applied to some of those four is the "two of three is how a defect hides"
 * failure of gh#841 and gh#845, and it would leave the surviving half looking deliberate.
 *
 * WHAT IT DOES NOT EAT, measured against every comment in `src/tokens/`:
 *
 *   · `**bold**` and `*italic*` on a continuation line — `[ \t]?` consumes exactly ONE space after
 *     the gutter star, so `   * **1.09:1**` (segmented.css) and ` * *responsive*` (sheet.css) keep
 *     both of their markers;
 *   · a first line with no gutter — ` Color system (HSL components) …` has no leading `*` to match;
 *   · a single-line comment, for the same reason;
 *   · indented code in the prose — ` *     :root { … }` loses the gutter and keeps the indent.
 *
 * The one first line that DOES start with a star is the `/**` opener of flex.css, where the star
 * belongs to the delimiter and stripping it is the correct reading.
 *
 * @param {string} comment the body of a block comment — capture group 1 of the parsers' regex
 * @returns {string} one line of prose, gutter removed and whitespace collapsed
 */
export function commentText(comment) {
  return comment
    .replace(/^[ \t]*\*[ \t]?/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}
