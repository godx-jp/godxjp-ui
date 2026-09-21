import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { anchorIndex } from "../../../test/css-selector";

/**
 * THE OVERLAY ✕ IS 16px AND ITS TARGET IS 24px (gh#806 · WCAG 2.2 SC 2.5.8 AA).
 *
 * Measured on the real Dialog and Sheet frames, not a fixture — a hand-written `<button>` carries
 * UA padding the components strip, which is how a first attempt measured 32x25.5 and proved
 * nothing:
 *
 *   before   paint 16.0x16.0, all four ±11px probes MISS
 *   after    paint 16.0x16.0, hit area 24x24, all four probes HIT
 *
 * The paint deliberately does not move: the ✕ sits at a fixed offset from the panel corner, and
 * enlarging the glyph shifts the optical weight of every overlay in the system. So the target is a
 * centred pseudo-element, the same answer `.ui-data-table-sort-button::after` already ships.
 *
 * This asserts the STRUCTURE, because jsdom lays nothing out and a component test cannot see a
 * pseudo-element at all. The browser numbers live in the commit and the issue.
 */
const layout = readFileSync(join(process.cwd(), "src/styles/dialog-layout.css"), "utf8");
const tokens = readFileSync(join(process.cwd(), "src/tokens/components/feedback.css"), "utf8");

const rule = (() => {
  const at = anchorIndex(
    layout,
    /:is\(\[data-slot="dialog-close"\], \[data-slot="sheet-close"\]\)::after/,
  );
  expect(at, "the overlay close hit-area rule must exist").toBeGreaterThan(-1);
  const open = layout.indexOf("{", at);
  return layout.slice(open + 1, layout.indexOf("\n  }", open));
})();

describe("the overlay close button's TARGET reaches 24px (gh#806)", () => {
  it("covers BOTH overlay families — Dialog and Sheet share the markup", () => {
    expect(rule).toBeTruthy();
  });

  it.each(["min-inline-size", "min-block-size"])("floors %s at the target token", (prop) => {
    expect(rule).toMatch(new RegExp(`${prop}:\\s*var\\(--dialog-close-size\\)`));
  });

  it("is centred on the glyph, not anchored to a corner", () => {
    expect(rule).toContain("inset-block-start: 50%");
    expect(rule).toContain("inset-inline-start: 50%");
    expect(rule).toContain("translate: -50% -50%");
  });

  /* `inline-size: 100%` keeps a WIDER button's target its own width; `min-*` only ever raises a
   * small one. Without it a future padded close button would have its target SHRUNK to 24px. */
  it("never shrinks a button that is already larger", () => {
    expect(rule).toContain("inline-size: 100%");
    expect(rule).toContain("block-size: 100%");
  });

  /* Rule #47 forbids a consumer re-sizing package internals, so the floor has to be a token they
   * are allowed to raise — SC 2.5.8 is a minimum, and a touch-first service wants more. */
  it("is raisable by a documented token, defaulting to the WCAG floor", () => {
    expect(tokens).toMatch(/--dialog-close-size:\s*var\(--touch-target-min\)/);
  });

  it("does not grow the GLYPH — the paint must stay on the affix icon size", () => {
    const at = anchorIndex(layout, ".ui-dialog-close-icon");
    const body = layout.slice(at, layout.indexOf("}", at));
    expect(body).toContain("var(--control-affix-icon-size)");
  });
});
