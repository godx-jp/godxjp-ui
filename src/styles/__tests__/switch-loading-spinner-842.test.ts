import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { anchorIndex } from "../../test/css-selector";
import { environment, resolveToken } from "../../tokens/__tests__/css-token-resolve";

/**
 * SWITCH `loading` — the spinner sat in the thumb's corner (gh#842).
 *
 * Measured in Chromium on the published /showcase/theme-customization:
 *
 *   thumb     16 x 16     centre (993.70, 722.70)
 *   spinner   12.6 x 12.6 centre (991.60, 720.70)   offset  -2.10 / -2.00
 *
 * A 12.6px mark in a 16px thumb owes ~1.7px of inset on every side; it had -0.4px on the left,
 * i.e. it hung off the edge. The SIZE was never wrong — `--switch-spinner-size` was declared AND
 * `.ui-switch-spinner` already read it. The thumb was `display: block`, which puts its first
 * child at the content corner, so the whole offset is the inset the mark never got.
 *
 * WHY THE ASSERTIONS ARE ARITHMETIC OVER THE SOURCE. jsdom lays nothing out — no grid, no block
 * flow, no boxes — so `getBoundingClientRect()` here returns zeros for both the broken and the
 * fixed rule and a probe of the rendered switch cannot tell them apart. What CAN be checked is the
 * pair that decides the placement: the two sizes, resolved from the token graph, and the thumb's
 * layout mode, read from the stylesheet. `spinnerCentreOffset()` turns those into the number the
 * browser reported — 0 when the thumb centres its child, and -(thumb - spinner)/2 when it does
 * not, which is the -2.10 / -2.00 above.
 */

const root = join(import.meta.dirname, "../..");
/** Comments blanked (newlines kept), so a selector quoted in prose is never read as a rule. */
const controlCss = readFileSync(join(root, "styles/control.css"), "utf8").replace(
  /\/\*[\s\S]*?\*\//g,
  (c) => c.replace(/[^\n]/g, " "),
);

const env = environment({ selectors: [":root"] });

function px(value: string): number {
  const n = Number.parseFloat(value);
  return /rem\b/.test(value) ? n * 16 : n;
}

function ruleBody(css: string, anchor: string): string {
  const at = anchorIndex(css, anchor);
  expect(at, `rule not found: ${anchor}`).toBeGreaterThan(-1);
  const open = css.indexOf("{", at);
  return css.slice(open + 1, css.indexOf("}", open));
}

function declaration(body: string, property: string): string | undefined {
  return body.match(new RegExp(`(?:^|[;{])\\s*${property}\\s*:\\s*([^;]+);`))?.[1].trim();
}

const thumb = ruleBody(controlCss, ".ui-switch-thumb {");
const spinner = ruleBody(controlCss, ".ui-switch-spinner {");

const thumbSize = px(resolveToken("--switch-thumb-size", env));
const spinnerSize = px(resolveToken("--switch-spinner-size", env));

/**
 * The spinner's centre relative to the thumb's, on either axis, from the thumb's declared layout
 * mode. A one-cell grid with `place-items: center` centres the child whatever its size — 0. Block
 * flow (and `inline-flex` with default `justify-content`/`align-items`, and a grid WITHOUT the
 * centring) stacks the child at the content corner, leaving the whole inset on one side.
 */
function spinnerCentreOffset(): number {
  const display = declaration(thumb, "display");
  const place = declaration(thumb, "place-items");
  const centred = display === "grid" && place === "center";
  return centred ? 0 : -(thumbSize - spinnerSize) / 2;
}

describe("Switch loading — the spinner is centred, not placed (gh#842)", () => {
  it("the mark is smaller than the thumb, so SOMETHING has to centre it", () => {
    // Both from the tier, so this fails if either is ever retuned into the other.
    expect(thumbSize).toBe(16);
    expect(spinnerSize).toBe(12);
    expect(spinnerSize).toBeLessThan(thumbSize);
    expect((thumbSize - spinnerSize) / 2).toBe(2); // the inset owed on every side
  });

  it("the spinner's centre matches the thumb's on both axes", () => {
    // The acceptance number: sub-pixel on both axes. Chromium re-measured after the fix read
    // -0.05 / +0.05, against -2.10 / -2.00 before it.
    expect(Math.abs(spinnerCentreOffset())).toBeLessThan(0.5);
  });

  it("reproduces the reported -2.1px when the thumb does not centre — the model is not vacuous", () => {
    // A guard on the guard. If `spinnerCentreOffset()` ever returned 0 unconditionally the test
    // above would pass against the broken rule, which is exactly how a jsdom probe fails silently.
    const uncentred = -(thumbSize - spinnerSize) / 2;
    expect(uncentred).toBe(-2);
    expect(Math.abs(uncentred - -2.1)).toBeLessThan(0.2); // what the browser measured
  });

  it("the thumb is a one-cell centring box", () => {
    expect(declaration(thumb, "display")).toBe("grid");
    expect(declaration(thumb, "place-items")).toBe("center");
    // It must not also place the child by hand: two mechanisms is how one of them goes stale.
    expect(declaration(thumb, "padding")).toBeUndefined();
  });

  it("the spinner's size reads its token, not whatever the SVG shipped with", () => {
    for (const property of ["inline-size", "block-size"]) {
      expect(declaration(spinner, property)).toBe("var(--switch-spinner-size)");
    }
  });

  it("centring is inert on a switch that is not loading — the thumb is empty then", () => {
    // `place-items` on an empty grid box changes nothing, which is why this fix does not need a
    // `:has(.ui-switch-spinner)` scope. The geometry the un-loaded switch depends on is the thumb's
    // own size and its pill radius, and neither is touched by the display mode.
    expect(declaration(thumb, "width")).toBe("var(--switch-thumb-size)");
    expect(declaration(thumb, "height")).toBe("var(--switch-thumb-size)");
    expect(declaration(thumb, "border-radius")).toBe("var(--radius-pill)");
  });
});
