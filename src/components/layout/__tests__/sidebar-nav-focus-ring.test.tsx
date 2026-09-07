import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * A sidebar nav row is a control, so it owes a visible keyboard indicator (WCAG 2.4.7) — and it
 * has to be the design system's ring, not the user agent's.
 *
 * On a Slack-style shell that mismatch is the first thing a keyboard user sees.
 *
 * WHERE THE RING LIVES CHANGED, AND THAT IS THE POINT. It used to be hand-written in
 * shell-layout.css, and having its own copy of the formula is precisely how it drifted: that copy
 * dropped `--focus-ring-opacity` and never fed `--tw-ring-shadow`, so a service that softened the
 * ring got every control in the library except this one, silently. The row is now a member of the
 * single source (styles/focus-ring.css), and this file asserts membership rather than a second
 * formula — a passing "the row draws a ring" test that certifies a private copy is worse than no
 * test at all.
 *
 * Asserted against the stylesheets because jsdom does no layout and computes no UA focus ring,
 * so nothing in the rendering tests next door can fail when this regresses.
 */

const shell = readFileSync(join(process.cwd(), "src/styles/shell-layout.css"), "utf8");
const focusRing = readFileSync(join(process.cwd(), "src/styles/focus-ring.css"), "utf8");

/** The shadow-form selector list plus its declarations — the one rule that paints control rings. */
function shadowFormRule(): string {
  const match = focusRing.match(/:is\(\s*\.ui-focus-ring,[\s\S]*?\n {2}\}/);
  expect(match, "focus-ring.css must keep its shadow-form rule").not.toBeNull();
  return match![0];
}

function ruleBody(css: string, selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = css.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`));
  expect(match, `must keep a ${selector} rule`).not.toBeNull();
  return match![1].replace(/\/\*[\s\S]*?\*\//g, "");
}

describe("sidebar nav rows draw the design system's focus ring", () => {
  it("is a member of the single source, not a private copy", () => {
    const rule = shadowFormRule();
    expect(rule).toContain(".sb-nav-item");
    // The mark is an `outline` now rather than a `box-shadow`, so there is no browser outline left
    // to suppress — the rule REPLACES it instead of turning it off and painting beside it.
    expect(rule).toMatch(/outline:\s*var\(--focus-ring-width\)/);
  });

  it("draws the mark from the global focus tokens", () => {
    const rule = shadowFormRule();
    expect(rule).toMatch(/outline:\s*var\(--focus-ring-width\) solid/);
    expect(rule).toMatch(/var\(--focus-outline-color\)/);
    // The knob the private copy used to drop. A service that softens every mark must soften
    // this one too.
    expect(rule).toMatch(/var\(--focus-ring-opacity, 1\)/);
    // And the halo, which lives in its OWN rule scoped to the switch — see the note in
    // focus-ring.css: leaving it in this rule with an `none` off-value stripped a focused
    // button's resting elevation, measured in Chromium.
    expect(focusRing).toMatch(
      /\[data-focus-outline="on"\][\s\S]*?box-shadow:\s*var\(--focus-field-shadow\)/,
    );
  });

  it("insets the mark into the row's own shape rather than wrapping it", () => {
    // The row is already shaded when selected; a mark drawn AROUND it stacked two heavy
    // treatments on one element, which is the complaint that produced the lighter design. A
    // negative offset equal to the mark's width puts the line inside the row's rounded box, so it
    // follows the radius exactly as the old box-shadow form did.
    const rule = ruleBody(focusRing, "a.ui-list-row,\n  tr.ui-focus-ring,\n  .sb-nav-item");
    expect(rule).toContain("--focus-ring-offset: calc(-1 * var(--focus-ring-width))");
  });

  it("no longer carries a second ring formula in shell-layout.css", () => {
    // The regression this file now guards: re-adding a local `.sb-nav-item:focus-visible` ring
    // reintroduces exactly the drift that was removed. shell-layout.css is blanket-exempted from
    // focus-ring-single-source.test.ts (for the REGION ring), so that guard cannot see this.
    const local = shell.match(/\.sb-nav-item:focus-visible\s*\{([^}]*)\}/);
    expect(local?.[1] ?? "", ".sb-nav-item must not paint its own ring").not.toMatch(
      /box-shadow|outline:\s*\d/,
    );
  });

  it("is on by default, unlike the opt-in region ring", () => {
    // `.app-main` defaults to width 0 on purpose — a frame around the whole content area reads
    // as a glitch. A ring hugging one 32px row is the affordance, so it must not be gated.
    expect(shadowFormRule()).not.toMatch(/--region-focus-ring-width/);
    expect(ruleBody(shell, ".app-main:focus-visible")).toMatch(/--region-focus-ring-width/);
  });
});
