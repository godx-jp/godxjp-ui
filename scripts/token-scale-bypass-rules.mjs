/**
 * Decision logic for the token scale-bypass guard (`check-token-scale-bypass.mjs`, gh#332).
 *
 * It lives in its own module for the same reason `frame-geometry-measure.mjs` does: the rules
 * below are pure text-in / verdict-out, so they are unit-tested against synthetic CSS in
 * `src/test/__tests__/token-scale-bypass-rules.test.ts`. Importing the guard itself would run the
 * whole sweep and read the baseline. Everything here is side-effect free — no fs, no process.
 *
 * The narrative, the scope and the exemption contract live in the guard's header. This file only
 * answers three questions: which AXIS is a token on, is its VALUE a raw number, and did the author
 * write an explicit exemption.
 */

/**
 * The geometry axes, and whether a NAMED SCALE exists for each one today.
 *
 * `enforced: true` is the whole switch. An axis is enforced once — and only once — the system has
 * steps to write instead of a number; turning one on before that would demand people reach for
 * something that does not exist. To enforce a new axis, land its scale and flip the flag.
 *
 * `scaleRef` matches "this value derives from that axis's own scale", which keeps the tier-2 route
 * (`calc(var(--space-4) + 2px)`) legal — see the guard header, "TWO TIERS".
 */
export const AXES = [
  {
    id: "font-size",
    /** `--font-size-2xs … --font-size-5xl`, all derived from `--font-size-base` (foundation.css). */
    enforced: true,
    scale: "--font-size-*",
    scaleRef: /var\(\s*--font-size(?:[-)])/,
  },
  {
    id: "padding",
    /** `--space-0 … --space-12` plus the semantic `--space-{stack,inline,inset,chrome}-*` aliases. */
    enforced: true,
    scale: "--space-*",
    scaleRef: /var\(\s*--space(?:[-)])/,
  },
  {
    id: "gap",
    enforced: true,
    scale: "--space-*",
    scaleRef: /var\(\s*--space(?:[-)])/,
  },
  {
    id: "margin",
    enforced: true,
    scale: "--space-*",
    scaleRef: /var\(\s*--space(?:[-)])/,
  },
  {
    id: "radius",
    /** `--radius` + the φ-derived `--radius-{sm,md,lg,xl}` in styles/base.css, `--radius-pill|sharp`. */
    enforced: true,
    scale: "--radius / --radius-*",
    scaleRef: /var\(\s*--radius(?:[-)])/,
  },
  {
    id: "icon-size",
    /** `--icon-size-2xs … --icon-size-4xl` (foundation.css), landed by gh#326. This axis is the
     *  proof that the switch works: it was 87% raw with no scale, and the moment the nine steps
     *  landed all 31 component icon tokens read one — so turning it on cost ZERO baseline
     *  entries. If gh#326 is ever reverted, flip this back to false rather than baselining 27
     *  bypasses. */
    enforced: true,
    scale: "--icon-size-*",
    scaleRef: /var\(\s*--icon-size(?:[-)])/,
  },
  {
    id: "stroke",
    /** `--stroke-{hairline,sm,md,lg,xl,2xl}` (foundation.css), landed by gh#324 as the FIRST of
     *  the two coherent axes hiding inside `width`. A stroke is the thickness of a painted line:
     *  borders, focus rings, accent rails, selected-state markers, presence strokes. Six values
     *  across ~20 tokens, all in `px` on purpose (a device line must not grow with the root
     *  font-size). See the census verdict on `width`, below. */
    enforced: true,
    scale: "--stroke-*",
    scaleRef: /var\(\s*--stroke(?:[-)])/,
  },
  {
    id: "band-height",
    /** `--band-height-{xs…3xl}` (foundation.css), landed by gh#324 as the SECOND. A band is the
     *  vertical extent of a horizontal strip that content is centred in — a control, a table row,
     *  a menu item, a nav row, the app-shell top bar. Seven values, each declared by two to five
     *  tokens.
     *
     *  `--control-height-*` is accepted as scale-derived because it IS on this scale: the control
     *  ladder is anchored on `--band-height-md` and steps off it (`calc(var(--control-height) -
     *  var(--space-1))`), which is the sanctioned tier-2 route. That does NOT make it a substitute
     *  for a step — a token pointed at `--control-height-*` inherits density AND the coarse-pointer
     *  44px growth, which is a geometry change. See foundation.css. */
    enforced: true,
    scale: "--band-height-*",
    scaleRef: /var\(\s*--(?:band-height|control-height)(?:[-)])/,
  },
  {
    id: "line-height",
    /** ENFORCED since gh#324, and it is the odd one out: `--line-height-{tight,normal,body}` are
     *  UNITLESS ratios, so a LENGTH here is never a step of anything — it is a mis-named height.
     *  There was exactly one (`--table-skeleton-line-height: 1rem`, a skeleton bar), and while it
     *  stood the axis could not be gated. It is now `--table-skeleton-line-block-size` with the
     *  old name kept as a published alias, so this axis gates at zero baseline cost and the next
     *  mis-named height fails on arrival. */
    enforced: true,
    scale: "--line-height-* (unitless ratios — a LENGTH here is a mis-named height)",
    scaleRef: /var\(\s*--line-height(?:[-)])/,
  },
  {
    id: "size",
    /** NOT A SCALE — verdict recorded by gh#324 after the census, not a to-do.
     *
     *  64% raw, and the raw values are four unrelated things: small square boxes that are really
     *  icons under another name (`--calendar-chevron-size`, `--search-select-spinner-size`), media
     *  boxes chosen per surface (QR codes at 6/8/10/12.5rem, an upload tile at 6rem), font-relative
     *  `em` marks that must track their label, and a handful of `px` strokes wearing `-size`
     *  (those moved onto `--stroke-*`). Naming a scale across that set would mean inventing one —
     *  the values barely repeat, and the ones that do already have a home on `--icon-size-*`. */
    enforced: false,
    scale: null,
    scaleRef: /(?!)/,
  },
  {
    id: "width",
    /** NOT A SCALE — verdict recorded by gh#324. This is the axis the issue called the worst in
     *  the system at 91% raw, and the census says the number is real but the diagnosis was not:
     *  `-width` is THREE concerns.
     *    1. stroke — the thickness of a painted line. One vocabulary, six values, heavy repeats.
     *       Split out and gated above as `--stroke-*`.
     *    2. container measure — a dialog, a sheet, a reading column, a page max-width, an auth
     *       card. ~26 tokens over 15 distinct values, most appearing exactly ONCE, several pinned
     *       to an artboard coordinate (the auth cards at 22.5/23.75/25/27rem).
     *    3. field width — how wide a picker must be to hold its longest label
     *       (`--app-setting-picker-timezone-width: 14rem`). Content-driven, per control.
     *  2 and 3 are tier-2 by nature: the value appears in one place, so it earns a token, not a
     *  step. Putting them on a scale would force `23.75rem` onto a grid it was measured off. */
    enforced: false,
    scale: null,
    scaleRef: /(?!)/,
  },
  {
    id: "height",
    /** NOT A SCALE as a whole — verdict recorded by gh#324. Same split as `width`: the BAND half
     *  (a control, a row, a menu item, a bar) is one vocabulary and is gated above as
     *  `--band-height-*`. What is left here is the container half — a chart plot's height, a
     *  transfer pane's min-height, a popover's max-height, an upload preview — chosen per surface
     *  with almost no repeated value. Those stay literal, and the two are told apart by NAME
     *  (`-bar|row|item|trigger|control|button-height` is a band) rather than by guesswork. */
    enforced: false,
    scale: null,
    scaleRef: /(?!)/,
  },
  {
    id: "offset",
    /** NOT A SCALE — verdict recorded by gh#324, answering the question this entry used to ask.
     *
     *  `--space-*` already covers the half that is spacing (11 of 20 tokens read it: dismiss-button
     *  insets, scroll offsets, badge offsets). The other half is not spacing at all and never lands
     *  on the 4px grid: four focus-ring offsets at 2px (ring geometry, deliberately below
     *  `--space-1`), an `em` mark offset that tracks its text, a 48px scroll-anchor clearance that
     *  must NOT breathe with density, and two auth flow offsets pinned to an artboard y-coordinate.
     *  Enforcing would buy nine gated tokens for seven `scale-exempt:` markers — the guard would be
     *  documenting exceptions rather than catching mistakes. */
    enforced: false,
    scale: null,
    scaleRef: /var\(\s*--space(?:[-)])/,
  },
];

/**
 * How a token NAME resolves to an axis.
 *
 * The winner is the match that ENDS furthest right, ties broken by length. Both halves matter:
 *   • furthest right — `--app-setting-picker-font-size-width` is a WIDTH (the width of a font-size
 *     picker), not a font-size. Reading left to right would enforce the wrong axis on it.
 *   • longest on a tie — `-font-size`, `-icon-size` and `-line-height` all end where the bare
 *     `-size` / `-height` they contain ends. Shortest-wins would collapse the most disciplined
 *     axis in the system into the least.
 *
 * `-space-` is this repo's logical-property spelling of padding (`--card-space-inset`,
 * `--badge-space-x`, `--button-space-block`), so it maps to padding — unless a more specific
 * `-gap` / `-offset` sits to its right (`--alert-space-gap` is a gap).
 *
 * `stroke` and `band-height` (gh#324) are the two coherent axes that were hiding inside `width`
 * and `height`. They are told apart from their container-measure siblings BY NAME, and the
 * longest-on-a-tie rule is what makes that work: `-border-width` and `-row-height` both end where
 * the bare `-width` / `-height` they contain ends, so the specific one wins. A name that does not
 * say it is a line or a band stays on the unenforced axis, which is the conservative direction —
 * `--legal-document-toc-marker-width` is a 2px rule but reads as a measure, so it is not gated.
 * `-rail-width` was tried and dropped: `--card-accent-rail-width` is a 6px painted stripe but
 * `--app-shell-rail-width` is the 4rem icon sidebar COLUMN, and one word cannot mean both.
 */
const AXIS_PATTERNS = [
  ["gap", /-gap(?=-|$)/g],
  ["offset", /-offset(?=-|$)/g],
  ["margin", /-margin(?=-|$)/g],
  ["padding", /-(?:padding|space)(?=-|$)/g],
  ["radius", /-radius(?=-|$)/g],
  ["font-size", /-font-size(?=-|$)/g],
  ["line-height", /-line-height(?=-|$)/g],
  ["icon-size", /-icon-size(?=-|$)/g],
  ["size", /-size(?=-|$)/g],
  ["width", /-width(?=-|$)/g],
  ["stroke", /-(?:border|ring|stroke|outline|rule|divider)-width(?=-|$)/g],
  ["height", /-height(?=-|$)/g],
  ["band-height", /-(?:band|bar|row|item|trigger|control|button)-height(?=-|$)/g],
];

/** The axis a custom-property name sits on, or `null` when it carries no geometry at all. */
export function axisOf(tokenName) {
  let best = null;
  for (const [id, pattern] of AXIS_PATTERNS) {
    pattern.lastIndex = 0;
    for (let m = pattern.exec(tokenName); m; m = pattern.exec(tokenName)) {
      const end = m.index + m[0].length;
      if (!best || end > best.end || (end === best.end && m[0].length > best.length)) {
        best = { id, end, length: m[0].length };
      }
    }
  }
  return best?.id ?? null;
}

/** Look-ups by id, so the guard and the tests never re-derive the table. */
export const AXIS_BY_ID = new Map(AXES.map((a) => [a.id, a]));
export const ENFORCED_AXES = AXES.filter((a) => a.enforced).map((a) => a.id);

/**
 * Length literals. `%`, unitless numbers and viewport units are NOT here — see the guard header,
 * "WHAT DOES NOT COUNT".
 */
const LENGTH = /(?<![\w.])(\d+(?:\.\d+)?)(rem|px|em|ch|ex|pt|pc|cm|mm|in|q)\b/gi;

/**
 * Literals that are not a step of anything, so writing them is not a bypass.
 *
 *   • `0` in any unit — the zero of every scale (`--space-0` is literally `0`). There is nothing
 *     to name and nothing a service would retune.
 *   • exactly `1px` — the device hairline. `check-no-hardcoded-css-values.mjs` already carries
 *     this exemption for the same reason: a service retunes whether a rule EXISTS (cardinal rule
 *     #44), not whether it is 1px or 1.03px. It is also what makes `calc(var(--radius) - 1px)`
 *     — the correct way to inset a nested radius — read as scale-derived rather than raw.
 */
function isExemptLiteral(number, unit) {
  if (Number.parseFloat(number) === 0) return true;
  return unit.toLowerCase() === "px" && Number.parseFloat(number) === 1;
}

/**
 * Does this declaration value bypass its axis's scale?
 *
 * True when it bakes at least one non-exempt length literal AND does not derive from the axis's
 * own scale. `var(--space-4)` and `var(--card-space-inset)` carry no literal at all, so they are
 * never raw; `calc(var(--space-4) + 2px)` carries one but derives from the scale, which is the
 * sanctioned tier-2 route. `calc(1rem * var(--scaling))` derives from neither and IS raw — that
 * shape is exactly how `--control-icon-size` went around the system (gh#325).
 */
export function isScaleBypass(value, axisId) {
  const axis = AXIS_BY_ID.get(axisId);
  if (!axis) return false;
  LENGTH.lastIndex = 0;
  let hasRawLiteral = false;
  for (let m = LENGTH.exec(value); m; m = LENGTH.exec(value)) {
    if (!isExemptLiteral(m[1], m[2])) hasRawLiteral = true;
  }
  if (!hasRawLiteral) return false;
  return !axis.scaleRef.test(value);
}

/**
 * The one sanctioned escape: a CSS block comment reading `scale-exempt: <reason>` on the declaration line, or on the
 * line immediately above it. Never a silent skip — the guard prints every exemption it honoured.
 *
 * The reason must be real prose (12+ characters), so `scale-exempt: x` does not buy a pass.
 */
const EXEMPTION = /\/\*+\s*scale-exempt:\s*(.+?)\s*\*\//;
const MIN_REASON = 12;

/** The exemption reason attached to a declaration, or `null`. `lines` is 0-indexed source lines. */
export function exemptionFor(lines, index) {
  for (const candidate of [lines[index], index > 0 ? lines[index - 1] : ""]) {
    const match = EXEMPTION.exec(candidate ?? "");
    if (match && match[1].length >= MIN_REASON) return match[1];
  }
  return null;
}

/**
 * Blank out CSS block comments while preserving line count and column offsets.
 *
 * Two failure modes this exists for, both of which have shipped in this repo's guards before: a
 * header comment that DOCUMENTS a token (``--font-size-lg: 15.7px`` in prose) being counted as a
 * declaration, and a trailing `16px` annotation comment on a perfectly scale-derived value being
 * read as a raw literal. Newlines survive so reported line numbers stay true.
 *
 * The `scale-exempt` marker is read from the RAW lines, before this runs.
 */
export function blankComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, (block) => block.replace(/[^\n]/g, " "));
}

const DECLARATION = /^\s*(--[a-z0-9-]+)\s*:\s*([^;]*);/;

/**
 * Scan one stylesheet.
 *
 * Returns every declaration that bypasses an ENFORCED axis's scale, plus the exemptions honoured
 * and the counts that let the guard report progress per axis.
 */
export function scanCss(css) {
  const rawLines = css.split("\n");
  const lines = blankComments(css).split("\n");
  const violations = [];
  const exemptions = [];
  const perAxis = new Map();

  lines.forEach((line, index) => {
    const match = DECLARATION.exec(line);
    if (!match) return;
    const [, token, value] = match;
    const axisId = axisOf(token);
    if (!axisId) return;
    const axis = AXIS_BY_ID.get(axisId);
    if (!axis) return;

    const bypass = isScaleBypass(value.trim(), axisId);
    const stat = perAxis.get(axisId) ?? { viaScale: 0, raw: 0 };
    stat[bypass ? "raw" : "viaScale"] += 1;
    perAxis.set(axisId, stat);

    if (!axis.enforced || !bypass) return;
    const reason = exemptionFor(rawLines, index);
    const record = { token, axis: axisId, value: value.trim(), line: index + 1 };
    if (reason) exemptions.push({ ...record, reason });
    else violations.push(record);
  });

  return { violations, exemptions, perAxis: Object.fromEntries(perAxis) };
}
