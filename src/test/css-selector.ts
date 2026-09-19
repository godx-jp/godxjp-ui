import { expect } from "vitest";

/**
 * Reading the CSS as a string proves a rule says the right thing; it cannot prove the rule SELECTS
 * anything. That is the headerAlign lesson (505f0e6): `> :not(:first-child)` was correct-looking,
 * in the file, and matched nothing — a string header renders as a text node, `:first-child` counts
 * only elements, so the negation excluded the one node it was written for.
 */
/**
 * Where `anchor` starts in `css`, or `-1`.
 *
 * gh#767 / gh#769 — a STRING anchor must not pin the FORMATTING. Prettier re-wraps a selector the
 * moment it crosses the print width, so the same rule reads as one line or four depending only on
 * how long it is; a plain `indexOf` of a hand-wrapped literal then asserts the layout rather than
 * the rule, and fails with a message blaming the CSS. Match any run of whitespace where the caller
 * wrote one, so a selector can be written on ONE line here whatever the stylesheet does. A RegExp
 * anchor is the caller's own business and passes through untouched.
 */
export function anchorIndex(css: string, anchor: string | RegExp): number {
  const pattern =
    typeof anchor === "string"
      ? new RegExp(anchor.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+"))
      : anchor;
  return pattern.exec(css)?.index ?? -1;
}

export function ruleSelectors(css: string, anchor: string | RegExp): string[] {
  const idx = anchorIndex(css, anchor);
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
