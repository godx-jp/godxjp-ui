import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * ALERT'S TWO-COLUMN ACTIONS LAYOUT ASKS THE ALERT, NOT THE VIEWPORT (gh#997).
 *
 * Measured in Chromium at a 1440px viewport, an Alert with a title, a description and three
 * `AlertActions` buttons cloned into a 360px container:
 *
 *   before  body display=grid  title 8px wide   (the description wrapped one glyph per line)
 *   after   body display=flex  title 294px, actions below it
 *   700px   body display=grid  unchanged — two columns, as before
 *
 * jsdom has no layout, so the pixels were measured there; this pins the arrangement that produced
 * them: the root is a named inline-size container, and every rule that switches the body to the
 * grid sits inside `@container alert`, never inside a viewport `@media`.
 */
const css = readFileSync(resolve("src/styles/alert-layout.css"), "utf8").replace(
  /\/\*[\s\S]*?\*\//g,
  "",
);

/** Every at-rule block header that encloses `needle`, innermost last. */
function enclosingAtRules(needle: string): string[] {
  const at = css.indexOf(needle);
  expect(at, `not found: ${needle}`).toBeGreaterThan(-1);
  const headers: string[] = [];
  let depth = 0;
  for (let i = at; i >= 0; i -= 1) {
    if (css[i] === "}") depth += 1;
    else if (css[i] === "{") {
      if (depth === 0) {
        const start =
          Math.max(css.lastIndexOf("}", i), css.lastIndexOf(";", i), css.lastIndexOf("{", i - 1)) +
          1;
        headers.unshift(css.slice(start, i).trim());
      } else depth -= 1;
    }
  }
  return headers;
}

describe("Alert actions layout is a container query (gh#997)", () => {
  it("the alert root is a named inline-size query container", () => {
    const root = /\[data-slot="alert"\]\s*\{([^}]*)\}/.exec(css)?.[1] ?? "";
    expect(root).toMatch(/container:\s*alert\s*\/\s*inline-size/);
    // Safe to contain only because the root's inline size never came from its content.
    expect(root).toMatch(/width:\s*100%/);
  });

  it.each([
    ['[data-slot="alert-body"]:has(> [data-slot="alert-actions"]) {'],
    ['[data-slot="alert-body"]:has(> [data-slot="alert-actions"]) > [data-slot="alert-actions"] {'],
  ])("%s sits inside @container alert, not a viewport @media", (needle) => {
    const around = enclosingAtRules(needle).filter((h) => h.startsWith("@"));
    expect(around.some((h) => /^@container\s+alert\s*\(min-width:\s*40rem\)/.test(h))).toBe(true);
    expect(around.some((h) => h.startsWith("@media"))).toBe(false);
  });

  it("no rule touching the actions layout is switched by viewport width anymore", () => {
    for (const m of css.matchAll(/@media\s*\(min-width[^{]*\{/g)) {
      const body = css.slice(m.index, css.indexOf("}", css.indexOf("{", m.index + m[0].length)));
      expect(body, `viewport rule still shapes the actions: ${m[0]}`).not.toMatch(
        /alert-(body|actions)/,
      );
    }
  });
});
