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
    id: "size",
    /** WAITING ON a scale (gh#325 "S1"). 80% raw. */
    enforced: false,
    scale: null,
    scaleRef: /(?!)/,
  },
  {
    id: "width",
    /** WAITING ON a scale. 93% raw — the worst axis in the system, and the clearest evidence for
     *  the correlation gh#324 measured. */
    enforced: false,
    scale: null,
    scaleRef: /(?!)/,
  },
  {
    id: "height",
    /** WAITING ON a scale. 76% raw. */
    enforced: false,
    scale: null,
    scaleRef: /(?!)/,
  },
  {
    id: "offset",
    /** WAITING ON a decision: an offset is spacing, so `--space-*` may already be its scale, but
     *  focus-ring offsets (2px) sit below every step. Do not enforce until that is settled. */
    enforced: false,
    scale: null,
    scaleRef: /var\(\s*--space(?:[-)])/,
  },
  {
    id: "line-height",
    /** NOT ENFORCEABLE as written. `--line-height-{tight,normal,body}` are UNITLESS ratios, so a
     *  length on this axis is not a bypass — it is a mis-named height (`--table-skeleton-line-height:
     *  1rem` is a skeleton bar). Renaming those is a separate job. */
    enforced: false,
    scale: null,
    scaleRef: /(?!)/,
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
  ["height", /-height(?=-|$)/g],
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
