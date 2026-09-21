import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { anchorIndex } from "../../test/css-selector";
import { environment, resolveToken } from "../../tokens/__tests__/css-token-resolve";

/**
 * THE JOINED FIELD (gh#841) — a 24px glyph in a 32px addon, and two outlines where there is one
 * control.
 *
 * Measured in Chromium on the published /showcase/theme-customization, `Input addonBefore`:
 *
 *   addon box      49 x 32     border-radius  6px 0 0 6px
 *     its <svg>    24 x 24     ← Lucide's own width="24"; nothing sized it
 *   the <input>    398.3 x 32  border-radius  6px ALL FOUR CORNERS
 *
 * so the field's leading corners curved away from the addon's straight edge, and the mark inside
 * the addon was three quarters of the box it sat in.
 *
 * WHY THIS FILE READS THE SOURCE AND DOES ARITHMETIC INSTEAD OF PROBING A RENDER.
 * jsdom performs no layout and applies no author cascade: `getComputedStyle(field).borderRadius`
 * is `""` here, on the broken source and the fixed one alike, so a computed-style assertion is
 * vacuous — it would pass just as happily against the 24px glyph. The only honest regression in
 * this environment resolves the token graph from the CSS (`css-token-resolve`, the resolver
 * icon-size-scale.test.ts uses) and models the ONE cascade fact that produced the bug:
 *
 *   @layer utilities is ordered AFTER @layer components, so a `rounded-*` utility on the field
 *   beats every `border-*-radius` a components-layer rule can write for it.
 *
 * That is why the repair emits the radius per EDGE from a knob (`--input-radius-start` /
 * `-end`) and lets the components layer set the knob instead of the property: a custom property
 * has no utility competing with it. `cornerRadii()` below does exactly what the browser does with
 * that arrangement — take the utility, substitute the knob the scope declares — so reverting
 * EITHER half (the per-edge utilities in input.tsx, or the knob in control.css) fails the joined
 * cases with the field's leading corners back at 6px.
 */

const root = join(import.meta.dirname, "../..");
/** Comments blanked (newlines kept), so a selector quoted in prose is never read as a rule. */
const controlCss = readFileSync(join(root, "styles/control.css"), "utf8").replace(
  /\/\*[\s\S]*?\*\//g,
  (c) => c.replace(/[^\n]/g, " "),
);
const inputSource = readFileSync(join(root, "components/data-entry/input.tsx"), "utf8");

const env = environment({ selectors: [":root"] });

/** A resolved length as a number of CSS px at a 16px root. `0` and `0px` both read 0. */
function px(value: string): number {
  const n = Number.parseFloat(value);
  if (Number.isNaN(n)) return Number.NaN;
  return /rem\b/.test(value) ? n * 16 : n;
}

/** Resolve an arbitrary declaration value (not just a token name) through the token graph. */
function resolveValue(expression: string, scope: Map<string, string>): string {
  const probe = new Map(scope);
  probe.set("--probe", expression);
  return resolveToken("--probe", probe);
}

/** The declaration block of the first rule whose selector list contains `anchor`. */
function ruleBody(css: string, anchor: string): string {
  const at = anchorIndex(css, anchor);
  expect(at, `rule not found: ${anchor}`).toBeGreaterThan(-1);
  const open = css.indexOf("{", at);
  return css.slice(open + 1, css.indexOf("}", open));
}

function declaration(body: string, property: string): string | undefined {
  return body.match(new RegExp(`(?:^|[;{])\\s*${property}\\s*:\\s*([^;]+);`))?.[1].trim();
}

describe("Input addon glyph — a control glyph, not a source library's default (gh#841)", () => {
  /**
   * The addon and both inline affix slots. `.ui-input-leading` is the slot `prefix` renders into —
   * antd's live prop — so the same 24px default landed on the shape the deprecation note steers
   * callers TOWARDS, not only on the deprecated one.
   */
  const SLOTS = [".ui-input-addon > svg", ".ui-input-leading > svg", ".ui-input-trailing > svg"];

  it.each(SLOTS)("%s is sized from the icon tier, not left at the SVG's own 24", (selector) => {
    const body = ruleBody(controlCss, selector);
    for (const property of ["inline-size", "block-size"]) {
      const declared = declaration(body, property);
      expect(declared, `${selector} must declare ${property}`).toBeDefined();
      expect(px(resolveValue(declared!, env)), `${selector} ${property}`).toBe(16);
    }
  });

  it("puts the glyph at half the control box, where the screenshot showed three quarters", () => {
    // The ratio is the defect, not the absolute size: 24 in a 32px box is what "quá to" means.
    const box = px(resolveToken("--control-height", env));
    const glyph = px(resolveToken("--control-icon-size", env));
    expect(box).toBe(32);
    expect(glyph / box).toBe(0.5);
    expect(24 / box).toBe(0.75); // what was measured, kept so the comparison is in the file
  });
});

describe("Input addon seam — one outline, not two (gh#841)", () => {
  /** The four logical corners, in the order `border-radius` writes them. */
  const CORNERS = ["start-start", "start-end", "end-start", "end-end"] as const;
  type Corner = (typeof CORNERS)[number];

  /** Which corners a Tailwind radius utility sets. Logical spellings only — this repo is RTL-safe. */
  const EDGES: Record<string, readonly Corner[]> = {
    "": CORNERS,
    s: ["start-start", "end-start"],
    e: ["start-end", "end-end"],
    ss: ["start-start"],
    se: ["start-end"],
    es: ["end-start"],
    ee: ["end-end"],
  };

  /** The radius utilities the field's own base class emits, as corner → value expression. */
  function fieldRadiusUtilities(): Map<Corner, string> {
    const block = inputSource.match(/const inputBaseClass = \[([\s\S]*?)\n\];/)?.[1];
    expect(block, "inputBaseClass must be a literal array").toBeDefined();
    const classes = block!.replace(/\/\/[^\n]*/g, "");
    const out = new Map<Corner, string>();
    for (const m of classes.matchAll(/rounded(?:-(s|e|ss|se|es|ee))?-\[([^\]]+)\]/g)) {
      const corners = EDGES[m[1] ?? ""];
      expect(corners, `unmapped radius utility edge: ${m[0]}`).toBeDefined();
      for (const corner of corners) out.set(corner, m[2]);
    }
    expect(out.size, "the field must emit a radius for every corner").toBe(4);
    return out;
  }

  /**
   * What the browser paints on the field in a given scope: the UTILITY wins (it is in a later
   * layer than anything control.css can say), so each corner is the utility's expression resolved
   * against the knobs that scope declares.
   */
  function cornerRadii(knobs: Record<string, string>): Record<Corner, number> {
    const scope = new Map(env);
    for (const [token, value] of Object.entries(knobs)) scope.set(token, value);
    const utilities = fieldRadiusUtilities();
    return Object.fromEntries(
      CORNERS.map((corner) => [corner, px(resolveValue(utilities.get(corner)!, scope))]),
    ) as Record<Corner, number>;
  }

  /** The knobs the components layer sets on the field when the group carries `addon`. */
  function joinedKnobs(slot: "before" | "after"): Record<string, string> {
    const body = ruleBody(
      controlCss,
      `.ui-input-group:has(> [data-slot="input-addon-${slot}"]) .ui-input,`,
    );
    const knobs: Record<string, string> = {};
    for (const m of body.matchAll(/(--input-radius-(?:start|end))\s*:\s*([^;]+);/g)) {
      knobs[m[1]] = m[2].trim();
    }
    return knobs;
  }

  it("rounds all four corners when the field stands alone", () => {
    const radii = cornerRadii({});
    expect(radii).toEqual({
      "start-start": 6,
      "start-end": 6,
      "end-start": 6,
      "end-end": 6,
    });
    // …and that 6 is the control's own radius token, not a number typed into this test.
    expect(px(resolveToken("--control-radius", env))).toBe(6);
  });

  it("squares the leading corners against addonBefore — the seam the screenshot doubled", () => {
    expect(cornerRadii(joinedKnobs("before"))).toEqual({
      "start-start": 0,
      "start-end": 6,
      "end-start": 0,
      "end-end": 6,
    });
  });

  it("squares the trailing corners against addonAfter", () => {
    expect(cornerRadii(joinedKnobs("after"))).toEqual({
      "start-start": 6,
      "start-end": 0,
      "end-start": 6,
      "end-end": 0,
    });
  });

  it("the addon's own edge meets it square, so the pair paints one continuous outline", () => {
    // The addon carries no radius utility, so its rule IS what paints: rounded on the outer side,
    // and nothing declared on the seam side, which leaves the initial 0.
    const before = ruleBody(controlCss, '.ui-input-group > [data-slot="input-addon-before"]');
    expect(px(resolveValue(declaration(before, "border-start-start-radius")!, env))).toBe(6);
    expect(px(resolveValue(declaration(before, "border-end-start-radius")!, env))).toBe(6);
    expect(declaration(before, "border-start-end-radius")).toBeUndefined();
    expect(declaration(before, "border-end-end-radius")).toBeUndefined();
    // One border on the seam, not two — the addon drops its own.
    expect(declaration(before, "border-inline-end")).toBe("0");
  });

  it("keeps the knob reachable: the utility falls back to --control-radius, never to a literal", () => {
    // If the fallback were a number, a service retuning --control-radius would move three corners
    // of a joined field and leave the fourth behind. Rules #44/#45.
    for (const expression of new Set(fieldRadiusUtilities().values())) {
      expect(expression).toMatch(/var\(--input-radius-(?:start|end),\s*var\(--control-radius\)\)/);
    }
  });
});
