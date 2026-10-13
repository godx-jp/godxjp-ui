import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const read = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

const control = read("src/styles/control.css");
const table = read("src/styles/table-layout.css");
const foundation = read("src/tokens/foundation.css");

/** Every flat (non-nested) rule `selectors { body }` whose selector list contains `selector`. */
function rulesFor(css: string, selector: string): string[] {
  const out: string[] = [];
  const rule = /([^{}]*)\{([^{}]*)\}/g;
  let match: RegExpExecArray | null;
  while ((match = rule.exec(css)) !== null) {
    const selectors = match[1].split(",").map((part) => part.trim());
    if (selectors.includes(selector)) out.push(match[2]);
  }
  return out;
}

/** The bodies of every `@media (prefers-reduced-motion: reduce) { … }` block. */
function reducedMotionBlocks(css: string): string[] {
  const out: string[] = [];
  const head = /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{/g;
  while (head.exec(css) !== null) {
    let depth = 1;
    let i = head.lastIndex;
    while (depth > 0 && i < css.length) {
      if (css[i] === "{") depth++;
      else if (css[i] === "}") depth--;
      i++;
    }
    out.push(css.slice(head.lastIndex, i - 1));
  }
  return out;
}

const motionRule = (css: string, selector: string) =>
  rulesFor(css, selector).find(
    (body) => /transition/.test(body) && !/transition:\s*none/.test(body),
  );

/**
 * gh#1251 — a checkbox / radio fill used to SNAP on toggle while every neighbouring control
 * (Switch, Button) eased its colour, and the bulk bar popped in. The restrained fix: an explicit
 * property list at the fast motion token (never `all`, never a transform), switched off under
 * `prefers-reduced-motion` (WCAG 2.3.3) in the same in-layer shape card-layout.css uses.
 */
describe("state-change transitions (gh#1251)", () => {
  it("reads motion tokens that exist in the foundation tier", () => {
    expect(foundation).toMatch(/--duration-fast:\s*\d+ms;/);
    expect(foundation).toMatch(/--ease-standard:\s*cubic-bezier\(/);
  });

  it.each([".ui-checkbox", ".ui-radio"])(
    "%s transitions background, border and colour at --duration-fast / --ease-standard",
    (selector) => {
      const body = motionRule(control, selector);
      expect(body, `${selector} has no transition rule`).toBeDefined();
      expect(body).toMatch(/transition-property:\s*background-color,\s*border-color,\s*color;/);
      expect(body).toMatch(/transition-duration:\s*var\(--duration-fast\);/);
      expect(body).toMatch(/transition-timing-function:\s*var\(--ease-standard\);/);
      expect(body).not.toMatch(/transition(-property)?:[^;]*\b(all|transform)\b/);
    },
  );

  it(".ui-data-table-bulk fades on opacity only — no transform", () => {
    const body = motionRule(table, ".ui-data-table-bulk");
    expect(body, ".ui-data-table-bulk has no transition rule").toBeDefined();
    expect(body).toMatch(
      /transition:\s*opacity\s+var\(--duration-fast\)\s+var\(--ease-standard\);/,
    );
    expect(body).not.toMatch(/transform|translate|scale/);
  });

  it.each([
    [".ui-checkbox", control],
    [".ui-radio", control],
    [".ui-data-table-bulk", table],
  ])("%s stops animating under prefers-reduced-motion: reduce", (selector, css) => {
    const overridden = reducedMotionBlocks(css).some((block) =>
      rulesFor(block, selector).some((body) => /transition:\s*none;/.test(body)),
    );
    expect(overridden).toBe(true);
  });
});
