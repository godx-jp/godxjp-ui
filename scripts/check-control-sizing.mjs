#!/usr/bin/env node
/**
 * check-control-sizing — primitives must size interactive controls from the
 * official `--control-height` tier, never bake in an ad-hoc size of their own.
 *
 * WHY: a control's box height is a SYSTEM decision (one knob, density-aware via
 * `--control-height` → xs/sm/lg). When a primitive re-derives a height by hand
 * — `calc(var(--control-height) - 0.25rem)` or a literal `2rem` — it (a) drifts
 * out of sync with siblings on the same row, and (b) stops responding to density.
 * That is exactly how the Pagination size-changer ended up 4–8px taller than the
 * page buttons. Size customization is the APP's job (a `size` prop / className),
 * not the primitive's.
 *
 * RULES
 *   error  ad-hoc offset: `calc(var(--control-height…) ± <len>)` outside the tier
 *          definition files — use the named tier `var(--control-height-{xs,sm,lg})`.
 *   warn   literal `height/min-height/width: <rem|px>` on an interactive-control
 *          selector — should resolve from a `--control-height*` token, or the
 *          sizing belongs in the app layer.
 *
 * Token-definition files are allowed to use offsets (that is where tiers are born).
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const cssFiles = [];
function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full);
    else if (entry.endsWith(".css")) cssFiles.push(full);
  }
}
walk(join(root, "src", "styles"));
walk(join(root, "src", "tokens"));

// Files allowed to derive tiers from --control-height with ± offsets.
const TIER_DEF_FILES = new Set([
  "src/tokens/components/control.css", // defines --control-height-{sm,lg,xs}
  "src/styles/density.css", // re-tunes the tier steps per density
]);

// Ad-hoc offset on the control-height tier (+/- a length). `* N` multipliers
// (e.g. multiline textarea) are intentionally NOT matched.
const OFFSET = /calc\(\s*var\(--control-height(?:-[a-z]+)?\)\s*[-+]\s*[0-9.]+(?:rem|px|em)/;

// Selector names that denote an interactive control whose box height should
// track the --control-height tier. Excludes decorations / icons / chrome.
const CONTROL_SEL =
  /\.(?:[a-z-]*-)?(?:control|input|trigger|field|select|combobox|picker|slot|chip|search|otp|tag-input)\b/;
const NOT_CONTROL =
  /(?:icon|dot|line|avatar|thumb|track|star|cover|label|description|indicator|caption|caret|toggle|remove|group|content)/;
// Only a CONTROL BOX HEIGHT is a tier concern (widths/min-widths are content
// sizing). Ignore sub-control heights < 1.5rem (carets, separators, glyphs).
const LITERAL_BOX = /\b(?:min-)?height:\s*(?:1\.[5-9]|[2-9])(?:\.[0-9]+)?rem\b/;

const errors = [];
const warns = [];

for (const file of cssFiles) {
  const rel = file.slice(root.length + 1);
  const css = readFileSync(file, "utf8");

  // ── error: ad-hoc tier offset outside tier-definition files ──
  if (!TIER_DEF_FILES.has(rel)) {
    css.split("\n").forEach((line, i) => {
      if (OFFSET.test(line)) {
        errors.push(
          `${rel}:${i + 1}: ad-hoc control-height offset — use a named tier ` +
            `var(--control-height-{xs,sm,lg}) instead of calc(var(--control-height) ± …)\n` +
            `    ${line.trim()}`,
        );
      }
    });
  }

  // ── warn: literal box size on an interactive-control selector ──
  // Match innermost `selector { …decls… }` blocks (skips @layer wrappers).
  for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = m[1].trim();
    const body = m[2];
    if (!CONTROL_SEL.test(selector) || NOT_CONTROL.test(selector)) continue;
    if (LITERAL_BOX.test(body)) {
      const decl = body.match(LITERAL_BOX)[0];
      const lineNo = css.slice(0, m.index + m[0].indexOf(decl)).split("\n").length;
      warns.push(
        `${rel}:${lineNo}: control selector \`${selector.split(/[\s,{]/)[0]}\` hardcodes a box ` +
          `size (${decl.trim()}) — size from a --control-height tier, or let the app set it.`,
      );
    }
  }
}

for (const w of warns) console.warn(`  ⚠ ${w}`);
if (errors.length) {
  console.error("✗ control-sizing guard failed");
  for (const e of errors) console.error(`  ${e}`);
  process.exit(1);
}
console.log(
  `✓ control-sizing guard passed${warns.length ? ` (${warns.length} warning(s))` : ""}`,
);
