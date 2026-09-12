import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * NumberInput steppers on a fine pointer: paint stays 24×13 but ::after extends the hit area
 * outward on opposite edges so two 24×24 boxes do not overlap (gh#506).
 *
 * Browser measurements live in `scripts/check-number-input-step-target.mjs`.
 */
describe("number input step — fine pointer hit area", () => {
  const css = readFileSync(resolve(process.cwd(), "src/styles/control.css"), "utf8");

  it("anchors up and down pseudo-elements on opposite block edges", () => {
    expect(css).toMatch(/\.ui-number-input-step-up::after\s*\{[^}]*inset-block-end:\s*0/);
    expect(css).toMatch(/\.ui-number-input-step-down::after\s*\{[^}]*inset-block-start:\s*0/);
  });

  it("sizes each ::after at the touch floor without centring both on the 13px paint", () => {
    const shared = css.match(/\.ui-number-input-step::after\s*\{[^}]*\}/)?.[0] ?? "";
    expect(shared).toContain("block-size: var(--touch-target-min)");
    expect(shared).toContain("inline-size: var(--touch-target-min)");
    expect(shared).not.toContain("translate: -50% -50%");
  });

  it("does not grow the painted stepper box", () => {
    const paint = css.match(/\.ui-number-input-step\s*\{[^}]*pointer-events:\s*auto[^}]*\}/)?.[0] ?? "";
    expect(paint).toContain("block-size: calc(var(--control-height) / 2 - 0.1875rem)");
    expect(paint).not.toContain("min-block-size: var(--touch-target-min)");
  });
});
