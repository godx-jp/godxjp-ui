import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * A RADIO'S DOT IS THE ANSWER, SO IT MUST ONLY APPEAR WHEN THERE IS ONE (gh#615).
 *
 * `Radio` renders `<Circle className="ui-radio-icon">` UNCONDITIONALLY — unlike `Checkbox`, which
 * renders its glyph only for `checked || indeterminate`. The state did reach the DOM, as
 * `data-state="checked" | "unchecked"` on the very same `<label>` that carries `.ui-radio`. No rule
 * read it. Measured on `/isolate/data-entry-radio-group` before the fix: 4 of 4 UNCHECKED radios
 * painted a 7.2px dot at rgb(0, 113, 189), pixel-identical to the 3 checked ones. After: 0 of 6
 * unchecked paint a dot, 4 of 4 checked do, and after a click the paint follows the state exactly.
 *
 * WHY IT READ AS "NOT CLICKABLE". The user clicked, the VALUE changed, and the screen did not. At
 * the machine those are different; to the person in front of it they are the same event, so they
 * clicked again and concluded the control was broken. Worse, a group where EVERY option looks
 * chosen cannot be read at all — the one that shipped it gated whether a form demanded a 理由
 * field on a record that goes to audit.
 *
 * WHY NO REVIEW CAUGHT IT. A screenshot of a single selected radio is perfectly correct. The defect
 * exists only BETWEEN two states, which is what `check:choice-hit-target` assertion 7 now measures
 * in a browser (and what this file cannot: jsdom applies no author cascade).
 */
describe("Radio — the two states must not paint the same", () => {
  const css = readFileSync(resolve(process.cwd(), "src/styles/control.css"), "utf8");

  it("hides the dot when the radio is unchecked", () => {
    const rule = /\.ui-radio\[data-state="unchecked"\]\s+\.ui-radio-icon\s*\{([^}]*)\}/.exec(css);
    expect(rule, "no rule reads the radio's own data-state").not.toBeNull();
    expect(rule![1]).toMatch(/visibility:\s*hidden/);
  });

  it("uses `visibility`, NOT `opacity` — opacity re-broke the click", () => {
    const rule = /\.ui-radio\[data-state="unchecked"\]\s+\.ui-radio-icon\s*\{([^}]*)\}/.exec(css);
    // An element with opacity < 1 forms a stacking context, which lifted the icon above the
    // absolutely-positioned real <input>. `check:choice-hit-target` went from 0 failures to 12,
    // every one `inner point → the label, not the input`, plus `locator.check: Timeout` — the
    // gh#476 shape, reintroduced by a rule meant to fix the paint. `visibility: hidden` keeps the
    // box, leaves hit-testing alone, and forms no stacking context.
    expect(rule![1]).not.toMatch(/opacity:/);
    // `display: none` would collapse the 7.2px box and move the paint.
    expect(rule![1]).not.toMatch(/display:\s*none/);
  });

  it("keeps the dot painted when checked — the rule must not hide both", () => {
    expect(css).not.toMatch(/\.ui-radio\[data-state="checked"\]\s+\.ui-radio-icon\s*\{[^}]*visibility:\s*hidden/);
    // The base rule still fills the glyph; only the unchecked case is hidden.
    expect(css).toMatch(/\.ui-radio-icon\s*\{[^}]*fill:\s*currentColor/);
  });
});

/**
 * The sibling controls each answer their own state, and they must keep doing so — this is the
 * family the defect belongs to, and gh#615 was the one member missing its rule.
 */
describe("the choice family each reads its own state", () => {
  const control = readFileSync(resolve(process.cwd(), "src/styles/control.css"), "utf8");

  it.each([
    ['.ui-checkbox[data-state="checked"]', control],
    ['.ui-switch[data-state="checked"]', control],
    ['.ui-switch[data-state="unchecked"]', control],
    ['.ui-radio-button[data-state="checked"]', control],
    ['.ui-radio[data-state="unchecked"]', control],
  ])("%s exists", (selector, css) => {
    expect(css).toContain(selector);
  });
});
