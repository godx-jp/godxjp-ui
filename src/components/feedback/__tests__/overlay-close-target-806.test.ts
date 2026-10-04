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

/* THE SELECTOR MOVED FROM THE SLOT TO THE MARKER (gh#900), and the hit-area contract did not.
 * `data-slot="dialog-close"` is on every close TRIGGER, including the Cancel button a consumer
 * wraps in `<DialogClose asChild>` — so this rule was also putting a 24px pseudo-element on a
 * footer button that neither needed nor wanted one, and the sibling positioning rule was pinning
 * that button to the dialog's corner. Both now key on `.ui-dialog-close` / `.ui-sheet-close`, the
 * CORNER buttons. The floor this file exists to protect is unchanged. */
const rule = (() => {
  const at = anchorIndex(layout, /:is\(\.ui-dialog-close, \.ui-sheet-close\)::after/);
  expect(at, "the overlay close hit-area rule must exist").toBeGreaterThan(-1);
  const open = layout.indexOf("{", at);
  return layout.slice(open + 1, layout.indexOf("\n  }", open));
})();

describe("the overlay close button's TARGET reaches 24px (gh#806)", () => {
  it("covers BOTH overlay families — Dialog and Sheet share the markup", () => {
    expect(rule).toBeTruthy();
  });

  /* The target is the box grown by half of what it lacks on EACH side — `min(0px, …)` — so it
   * floors at the token and centres on the glyph in one declaration per axis (gh#1148). Logical
   * properties only: the `inset-inline-start: 50%` + `translate: -50%` this replaced shifted a
   * logical anchor physically and sat a box-width off the glyph under dir="rtl". Whitespace is
   * normalised so a formatter reflow cannot decide the result. */
  const flat = rule.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s+/g, " ");
  it.each(["inset-block", "inset-inline"])("floors %s at the target token, centred", (prop) => {
    expect(flat).toContain(`${prop}: min(0px, calc((100% - var(--dialog-close-size)) / 2))`);
  });

  it("is centred on the glyph with no physical shift", () => {
    expect(flat).not.toMatch(/translate|\bleft:|\bright:|\btop:|\bbottom:/);
  });

  /* `min(0px, …)` is never positive: a button already larger than the token keeps its own box as
   * its target instead of having it SHRUNK to 24px. */
  it("never shrinks a button that is already larger", () => {
    expect(flat.match(/min\(0px,/g)).toHaveLength(2);
  });

  /* Rule #47 forbids a consumer re-sizing package internals, so the floor has to be a token they
   * are allowed to raise — SC 2.5.8 is a minimum, and a touch-first service wants more. */
  it("is raisable by a documented token, defaulting to the WCAG floor", () => {
    expect(tokens).toMatch(/--dialog-close-size:\s*var\(\s*--touch-target-min\)/);
  });

  it("does not grow the GLYPH — the paint must stay on the affix icon size", () => {
    const at = anchorIndex(layout, ".ui-dialog-close-icon");
    const body = layout.slice(at, layout.indexOf("}", at));
    expect(body).toContain("var(--control-affix-icon-size)");
  });
});
