/**
 * Visual-audit decision logic — PURE functions, zero browser/DOM dependency.
 * `scripts/visual-audit.mjs` collects measurements from a REAL rendered page (Playwright) and
 * feeds them here; the browser glue stays thin and these rules are fully unit-testable without a
 * browser.
 */
import { SHIPPED_BRAND_ACCENTS } from "./brand-accent.generated.mjs";

/** Catalog (agent-facing mirror lives in mcp/src/data/visual-rules.ts; kept in sync by a guard). */
export const VISUAL_RULES = [
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
    standard: "@godxjp/ui reference-design 渋み (OKLCH chroma ≤ 0.18)",
    fix: "Desaturate brand/primary surfaces — keep OKLCH chroma ≤ 0.18. Read --primary tokens; never paint a full-width bar in raw vivid blue. The accent @godxjp/ui itself ships is exempt (gh#823) — this finding is always a colour someone chose.",
  },
  {
    id: "emoji-rendered",
    severity: "warn",
    category: "i18n",
    standard: "Unicode UTS #51 · WCAG 2.2 SC 1.1.1",
    fix: "Remove emoji from rendered product text; use quiet i18n copy + a Lucide icon + a Badge tone for status.",
  },
  {
    id: "css-layers-missing",
    severity: "error",
    category: "layout",
    standard: "@godxjp/ui styles contract (styles / styles/core are the only entries)",
    fix: "A component rendered without its layer: import `@godxjp/ui/styles` (or `styles/core` without fonts) instead of cherry-picking *-layout.css files. Naked menus and unsized Select rows are this.",
  },
  {
    id: "control-height-mismatch",
    severity: "error",
    category: "layout",
    standard: "@godxjp/ui control tier (--control-height) · Nielsen consistency heuristic",
    fix: "Every control in one row (Flex row, PageContainer extra, footer) must share --control-height. Replace the odd one with the real primitive (Avatar/Button/Badge) instead of a hand-rolled pill; never restyle a control's height.",
  },
  {
    id: "sibling-card-gap",
    severity: "error",
    category: "layout",
    standard: "@godxjp/ui spacing scale (docs/SPACING.md)",
    fix: 'Adjacent Cards must be separated by at least one space step — wrap them in <Flex direction="col" gap> / <ResponsiveGrid>, or put them directly in PageContainer, which spaces them.',
  },
  {
    id: "row-content-starved",
    severity: "warn",
    category: "layout",
    standard: "WCAG 2.2 SC 1.4.10 reflow (content must not be clipped to hide it)",
    fix: 'Text in a control row is truncated to a few characters because a sibling takes the whole width (a w-full SelectTrigger). Give the Select width="auto" or move it out of the row.',
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

/** reference-design restraint bound. A signal/brand surface above this chroma "screams". */
export const CHROMA_LIMIT = 0.18;

/**
 * Per-channel sRGB tolerance for "this IS the accent we ship" (gh#823).
 *
 * The audit reads a computed `rgb()` off a live page, so the match has to survive whatever rounding
 * the engine applied on the way there. Measured in Chromium (playwright 1.61), all four routes to
 * the token — `#7A00FF`, `hsl(268.7 100% 50%)`, the legacy comma form, and `hsl(var(--primary))` —
 * serialise to exactly `rgb(122, 0, 255)`: today's drift is 0. The tolerance is 1, kept as headroom
 * for an engine that rounds the other way, not because Chromium needs it.
 *
 * WHAT 1 ADMITS, and why it cannot hide a louder purple. The window is the ±1 box around
 * rgb(122, 0, 255): 12 colours, since g is already at 0 and b at 255 — so 11 that are not the
 * brand. The nearest of those is rgb(122, 1, 255) / #7A01FF at OKLab ΔE 0.0003; the furthest is
 * rgb(123, 1, 254) / #7B01FE at ΔE 0.0027, about 1/7 of a just-noticeable difference (~0.02).
 * None is distinguishable from the brand on a screen. The nearest colour OUTSIDE the window,
 * rgb(124, 0, 255) / #7C00FF, is still flagged. A tenant who picks a genuinely different loud
 * purple — #9D00FF (chroma 0.296), #B026FF (0.286) — is 30+ channel steps away and still told.
 */
export const BRAND_ACCENT_TOLERANCE = 1;

/**
 * True when an accent is the brand accent THIS PACKAGE SHIPS (gh#823) — read from
 * `brand-accent.generated.mjs`, which `scripts/gen-email-tokens.mjs` derives from foundation.css,
 * so the exemption moves if the brand ever does.
 *
 * Deliberately NOT "whatever `--primary` currently resolves to": a tenant who overrides `--primary`
 * with something louder chose that colour and must still be told. Only the value a consumer
 * receives from us, and cannot change without abandoning the brand, is exempt.
 */
export function isShippedBrandAccent({ r, g, b }) {
  return SHIPPED_BRAND_ACCENTS.some(
    (accent) =>
      Math.abs(r - accent.rgb.r) <= BRAND_ACCENT_TOLERANCE &&
      Math.abs(g - accent.rgb.g) <= BRAND_ACCENT_TOLERANCE &&
      Math.abs(b - accent.rgb.b) <= BRAND_ACCENT_TOLERANCE,
  );
}

/**
 * @returns {boolean} true when an accent surface exceeds the 渋み chroma limit.
 * The shipped brand accent is exempt — it is over the bound (chroma 0.293) but it is not a choice
 * any consumer made, so reporting it warns every page about a colour nobody can act on, and the
 * first reader to hit it silences the rule along with every real finding it would have caught.
 */
export function isOversaturated(rgb, limit = CHROMA_LIMIT) {
  if (isShippedBrandAccent(rgb)) return false;
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

/** Layers whose probe rule did not resolve. @param {{layer:string, ok:boolean}[]} probes */
export function missingCssLayers(probes) {
  return probes.filter((p) => !p.ok).map((p) => p.layer);
}

/** Rows whose controls disagree on height. @param {{name:string, heights:number[]}[]} rows */
export function controlHeightMismatches(rows) {
  return rows.filter((r) => new Set(r.heights).size > 1);
}

/** Adjacent card pairs closer than the minimum gap. @param {{gap:number}[]} pairs */
export function tightCardPairs(pairs, min = 8) {
  return pairs.filter((p) => p.gap < min);
}

/** Row texts squeezed below a readable width by a sibling. @param {{text:string, visible:number, needed:number}[]} texts */
export function starvedRowTexts(texts) {
  return texts.filter((t) => t.needed > 40 && t.visible < Math.min(t.needed, 60));
}

export function findVisualRule(id) {
  return VISUAL_RULES.find((r) => r.id === id);
}
