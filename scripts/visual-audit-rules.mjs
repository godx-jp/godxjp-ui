/**
 * Visual-audit decision logic — PURE functions, zero browser/DOM dependency.
 *
 * `scripts/visual-audit.mjs` collects measurements from a REAL rendered page
 * (Playwright) and feeds them here; the browser glue stays thin and these rules
 * are fully unit-testable without a browser. The same functions are injected into
 * the page for in-browser heuristics.
 *
 * Each rule cites the international standard it enforces — see VISUAL_RULES.
 */

/** Catalog (agent-facing mirror lives in mcp/src/data/visual-rules.ts; kept in sync by a guard). */
export const VISUAL_RULES = [
  {
    id: "axe-violations",
    severity: "warn",
    category: "a11y",
    standard: "WCAG 2.2 A/AA · WAI-ARIA 1.2 (axe-core engine)",
    fix: "Fix each axe violation at its node — contrast (1.4.3), name/role/value (4.1.2), ARIA, landmarks. axe runs on the REAL DOM, catching what static analysis cannot.",
  },
  {
    id: "target-size-min",
    severity: "warn",
    category: "a11y",
    standard: "WCAG 2.2 SC 2.5.8 (24×24 AA) · 2.5.5 (44×44 AAA)",
    fix: "Interactive targets must be ≥24×24 CSS px. Size controls from the --control-height tier; don't shrink icon buttons below it.",
  },
  {
    id: "oversaturated-accent",
    severity: "warn",
    category: "color",
    standard: "@godxjp/ui dxs-kintai 渋み (OKLCH chroma ≤ 0.18)",
    fix: "Desaturate brand/primary surfaces — keep OKLCH chroma ≤ 0.18. Read --primary tokens; never paint a full-width bar in raw vivid blue.",
  },
  {
    id: "emoji-rendered",
    severity: "warn",
    category: "i18n",
    standard: "Unicode UTS #51 · WCAG 2.2 SC 1.1.1",
    fix: "Remove emoji from rendered product text; use quiet i18n copy + a Lucide icon + a Badge tone for status.",
  },
  {
    id: "alert-controls-misplaced",
    severity: "warn",
    category: "layout",
    standard: "@godxjp/ui Alert anatomy · WAI-ARIA 1.2 · WCAG 2.2 SC 4.1.2",
    fix: "Use <Alert>: ONE leading tone icon, <Alert.Actions> normal-width trailing-right, onDismiss × top-right, ONE horizontal row — never a vertical stack with a full-width action bar or a centered ✕.",
  },
];

/** sRGB channel (0–255) → linear-light component. */
function srgbToLinear(c) {
  const x = c / 255;
  return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
}

/**
 * OKLCH chroma of an sRGB color — the perceptual saturation the 渋み rule bounds.
 * sRGB → linear → OKLab (Björn Ottosson) → chroma = hypot(a, b).
 * @param {{r:number,g:number,b:number}} rgb 0–255 channels
 * @returns {number} OKLCH chroma (~0 grey … ~0.37 max sRGB)
 */
export function oklchChroma({ r, g, b }) {
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);
  const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;
  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);
  const oa = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const ob = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;
  return Math.hypot(oa, ob);
}

/** dxs-kintai restraint bound. A signal/brand surface above this chroma "screams". */
export const CHROMA_LIMIT = 0.18;

/** @returns {boolean} true when an accent surface exceeds the 渋み chroma limit. */
export function isOversaturated(rgb, limit = CHROMA_LIMIT) {
  return oklchChroma(rgb) > limit;
}

/** WCAG 2.2 SC 2.5.8 — a tappable target smaller than 24×24 CSS px. */
export function isUndersizedTarget({ width, height }, min = 24) {
  return width > 0 && height > 0 && (width < min || height < min);
}

/** Unicode UTS #51 — any emoji pictograph in rendered text (excludes · — × ✓). */
const EMOJI_RE = /\p{Extended_Pictographic}/u;
export function hasEmoji(text) {
  return typeof text === "string" && EMOJI_RE.test(text);
}

/**
 * Alert/banner anatomy — given measurements of a notification region, list the
 * structural mistakes (the "stacked notification banner" tell).
 *
 * @param {{iconCount:number, actionWidthRatio:number, direction:'row'|'column',
 *          hasDismiss:boolean, dismissCorner:'top-right'|'other'|null}} m
 * @returns {string[]} human-readable issues (empty = correct anatomy)
 */
export function alertControlIssues(m) {
  const issues = [];
  if (m.iconCount > 1) issues.push("multiple icons — Alert takes ONE leading tone icon");
  if (m.actionWidthRatio > 0.85)
    issues.push("action is a full-width bar — use a normal-width Button in <Alert.Actions>");
  if (m.direction === "column")
    issues.push("controls stacked vertically — Alert is ONE horizontal row");
  if (m.hasDismiss && m.dismissCorner !== "top-right")
    issues.push("dismiss ✕ not in the top-right corner — pass onDismiss to <Alert>");
  return issues;
}

export function findVisualRule(id) {
  return VISUAL_RULES.find((r) => r.id === id);
}
