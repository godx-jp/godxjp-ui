import { expect } from "vitest";

/**
 * Pull a rule's SELECTOR list out of a shipped stylesheet, anchored by a
 * distinctive fragment of that selector.
 *
 * Reading the CSS as a string proves a rule says the right thing; it cannot
 * prove the rule SELECTS anything. That is the headerAlign lesson (505f0e6):
 * `> :not(:first-child)` was correct-looking, in the file, and matched
 * nothing — a string header renders as a text node, `:first-child` counts
 * only elements, so the negation excluded the one node it was written for.
 *
 * So structural-selector tests extract the selector FROM the CSS (never
 * retype it — a retyped copy stays green when the file changes) and run it
 * with `.matches()` against really rendered DOM.
 */
export function ruleSelectors(css: string, anchor: string | RegExp): string[] {
  const idx = typeof anchor === "string" ? css.indexOf(anchor) : (anchor.exec(css)?.index ?? -1);
  expect(idx, `rule not found for anchor: ${anchor}`).toBeGreaterThan(-1);
  const open = css.indexOf("{", idx);
  expect(open, `no "{" after anchor: ${anchor}`).toBeGreaterThan(-1);
  // The selector starts after whichever boundary is nearest above the anchor:
  // the previous rule's "}", an @media/@layer "{", or the end of a comment.
  const start = Math.max(
    css.lastIndexOf("}", idx) + 1,
    css.lastIndexOf("{", idx - 1) + 1,
    css.lastIndexOf("*/", idx) + 2,
  );
  const raw = css.slice(start, open).replace(/\/\*[\s\S]*?\*\//g, "");
  // Split on TOP-LEVEL commas only — `:has(a, b)` / `:not(a, b)` keep theirs.
  const parts: string[] = [];
  let depth = 0;
  let piece = "";
  for (const ch of raw) {
    if (ch === "(") depth += 1;
    if (ch === ")") depth -= 1;
    if (ch === "," && depth === 0) {
      parts.push(piece);
      piece = "";
    } else {
      piece += ch;
    }
  }
  parts.push(piece);
  return parts.map((s) => s.trim().replace(/\s+/g, " ")).filter(Boolean);
}

/** The one selector in the rule that contains `fragment` — for multi-selector rules. */
export function ruleSelector(css: string, anchor: string | RegExp, fragment?: string): string {
  const selectors = ruleSelectors(css, anchor);
  if (fragment === undefined) {
    expect(selectors, `expected a single-selector rule at ${anchor}`).toHaveLength(1);
    return selectors[0];
  }
  const hit = selectors.find((s) => s.includes(fragment));
  expect(hit, `no selector containing "${fragment}" in [${selectors.join(" | ")}]`).toBeDefined();
  return hit!;
}
