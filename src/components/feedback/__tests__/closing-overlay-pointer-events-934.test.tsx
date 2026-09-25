import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * A CLOSING OVERLAY SURFACE MUST NOT TAKE A CLICK (gh#934).
 *
 * Reported from godx-task 30.4.1 (godx-jp/godx-task#172): the whole 「フローを追加」 form was lost
 * when a reviewer was picked in step 2. The mechanism, measured in Chromium: while
 * `Select mode="multiple"`'s listbox plays its exit animation it is `data-state="closed"` but
 * still `pointer-events: auto`, and it has already left react-aria's overlay stack — so it renders
 * OUTSIDE `[role=dialog]`. The surrounding Dialog reads a click on it as a click-OUTSIDE and
 * closes, taking the form with it.
 *
 *     80ms after Escape   state=closed · opacity 0.15 · still hit-testable ·
 *                         elementFromPoint → an option · after the click, no Dialog
 *     animation 50x slow  the same, at opacity 0.99
 *
 * That second line is why this is not a nicety: a backgrounded tab or a throttled machine
 * stretches the window arbitrarily, and the user sees a faded list they can still hit.
 *
 * jsdom neither animates nor hit-tests, so the contract is asserted against the stylesheet
 * source. What matters as much as the rule is its SCOPE, which the last two cases pin down.
 */
const CSS = readFileSync(resolve(__dirname, "../../../styles/dialog-layout.css"), "utf8");

const RULE = (() => {
  const at = CSS.indexOf('[data-slot="popover-content"][data-state="closed"]');
  expect(at, "the closing-overlay rule is missing").toBeGreaterThan(-1);
  return CSS.slice(at, CSS.indexOf("}", at) + 1);
})();

describe("closing overlay surfaces are transparent to the pointer (gh#934)", () => {
  it("drops pointer events while the surface is closing", () => {
    expect(RULE).toMatch(/pointer-events:\s*none/);
  });

  it("covers every portaled CONTENT surface that animates out, not just Popover", () => {
    for (const slot of [
      "popover-content",
      "dropdown-menu-content",
      "dropdown-menu-sub-content",
      "hover-card-content",
      "tooltip-content",
    ]) {
      expect(RULE).toContain(`[data-slot="${slot}"][data-state="closed"]`);
    }
  });

  it("NEVER touches the overlays — their whole job is to catch the outside click", () => {
    // A closing dialog/sheet overlay made transparent to the pointer would let the click fall
    // through to the page behind and activate something there: a worse bug than the one fixed.
    expect(RULE).not.toContain("dialog-overlay");
    expect(RULE).not.toContain("sheet-overlay");
  });

  it("stays UNLAYERED, because `animate-out` lands in @layer utilities", () => {
    // A rule that must hold WHILE the exit animation runs cannot sit where the animation outranks
    // it. Measure the brace depth at the rule's offset: 0 means no @layer block encloses it.
    const before = CSS.slice(0, CSS.indexOf('[data-slot="popover-content"][data-state="closed"]'));
    const depth = (before.match(/\{/g) ?? []).length - (before.match(/\}/g) ?? []).length;
    expect(depth).toBe(0);
  });
});
