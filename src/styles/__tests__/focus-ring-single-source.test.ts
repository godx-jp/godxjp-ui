import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * The focus ring has ONE definition (styles/focus-ring.css) and four tokens.
 *
 * It did not always. Before this rule the ring was hand-written in six layout
 * files and had drifted into four incompatible shapes — the token pair, the
 * token pair with an ad-hoc `/ 0.45`, and two that hardcoded `3px` with
 * `/ 0.35` and `/ 0.3`, bypassing `--focus-ring-width` entirely. Same state,
 * four thicknesses, and no single knob a service could retune. Components that
 * forgot the rule got the browser default instead (Chrome's `rgb(0,95,204)`,
 * which is how the pagination defect surfaced).
 *
 * These tests fail the moment someone writes a ring by hand again.
 */

const STYLES_DIR = join(__dirname, "..");
const FOCUS_RING_CSS = readFileSync(join(STYLES_DIR, "focus-ring.css"), "utf8");

/** Files allowed to mention a ring outside focus-ring.css, with the reason. */
const ALLOWED: Record<string, string> = {
  // The REGION ring is a different affordance with its own token pair and its
  // own default (OFF) — see tokens/foundation.css. It is inset, covers a scroll
  // region rather than a control, and must not follow the control ring.
  "shell-layout.css": "region ring (--region-focus-ring-*), documented opt-in",
};
// NOTE: a file is exempted ONLY when it paints a genuinely different affordance.
// `border-color` tints on :focus-visible are not exemptions — they never trip the
// check, because the check looks for box-shadow/outline. Blanket-exempting a file
// is what let a mutation slip through while this test was being written: with
// control.css on the list, re-adding a hand-written `.ui-button:focus-visible`
// ring there stayed green.

function cssFiles(): string[] {
  return readdirSync(STYLES_DIR).filter((f) => f.endsWith(".css") && f !== "focus-ring.css");
}

describe("focus ring — single source", () => {
  // A hand-written ring is exactly what drifted last time. Anything that paints
  // box-shadow/outline on :focus-visible outside focus-ring.css is a regression.
  it("no stylesheet paints a :focus-visible ring outside focus-ring.css", () => {
    const offenders: string[] = [];

    for (const file of cssFiles()) {
      const css = readFileSync(join(STYLES_DIR, file), "utf8");
      // Every `:focus-visible {…}` block in this file, with its declarations.
      for (const match of css.matchAll(/:focus-visible[^{]*\{([^}]*)\}/g)) {
        const body = match[1];
        const paintsRing = /box-shadow:\s*(?!none)/.test(body) || /outline:\s*(?!none)/.test(body);
        if (!paintsRing) continue;
        if (ALLOWED[file]) continue;
        offenders.push(`${file}: ${body.trim().slice(0, 80)}`);
      }
    }

    expect(offenders).toEqual([]);
  });

  // The four knobs ARE the API. If a value is inlined instead of read from a
  // token, a service can no longer retune every ring at once — the exact
  // failure that produced 3px/0.35 and 3px/0.3 rings.
  it("the ring reads all four tokens and hardcodes none of them", () => {
    expect(FOCUS_RING_CSS).toContain("var(--focus-ring-width)");
    expect(FOCUS_RING_CSS).toContain("var(--focus-ring-color, var(--ring))");
    expect(FOCUS_RING_CSS).toContain("var(--focus-ring-opacity, 1)");
    expect(FOCUS_RING_CSS).toContain("var(--focus-ring-offset, 0px)");

    // No literal px thickness inside a ring declaration (the `0px` fallback of
    // --focus-ring-offset is the one legitimate literal).
    const ringDeclarations = [...FOCUS_RING_CSS.matchAll(/(box-shadow|outline):\s*([^;]+);/g)]
      .map((m) => m[2])
      .filter((value) => value !== "none");
    for (const value of ringDeclarations) {
      expect(value, `hardcoded thickness in: ${value}`).not.toMatch(/\b[1-9]\d*px\b/);
    }
  });

  // Turning the ring off must stay possible AND stay a deliberate act: the
  // shipped default is on (WCAG 2.4.7), and width:0 is the documented switch.
  it("ships the ring ON by default and documents width:0 as the off switch", () => {
    const foundation = readFileSync(join(STYLES_DIR, "../tokens/foundation.css"), "utf8");
    expect(foundation).toMatch(/--focus-ring-width:\s*2px/);
    expect(foundation).toMatch(/--focus-ring-opacity:\s*1/);
    expect(FOCUS_RING_CSS).toContain("--focus-ring-width: 0");
  });

  // A control carrying a Tailwind shadow/ring utility (shadow-xs on Checkbox,
  // Radio, Switch, Input…) resolves box-shadow from the UTILITIES layer, which
  // outranks `components`. Measured before the fix: Checkbox focus-visible
  // painted `rgba(0,0,0,0) 0 0 0 0` — no ring at all. Feeding --tw-ring-shadow
  // is what makes the utility's composite paint our ring; drop it and those
  // controls silently lose their focus affordance again.
  it("feeds --tw-ring-shadow so controls with Tailwind shadow utilities still ring", () => {
    expect(FOCUS_RING_CSS).toMatch(/--tw-ring-shadow:\s*0 0 0 var\(--focus-ring-width\)/);
  });
});
