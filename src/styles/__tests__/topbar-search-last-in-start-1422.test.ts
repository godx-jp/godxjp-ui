/**
 * gh#1422 — a TopbarSearch placed LAST in `Topbar start` (brand first, then the search: the normal
 * order in a plain Topbar, where there is no AppShell `logo` slot) was swept up by the start
 * cluster's TEXT-truncation rule. `div.ui-topbar-search` is not a button, so the rule stripped its
 * automatic minimum and clipped it: measured at 390px, the wrapper was 13px wide while its folded
 * 48px trigger painted over the first `end` cell, and the bar never reached its scroll state.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

// Whitespace-normalised: Prettier wraps a long selector across lines.
const shell = readFileSync(resolve(__dirname, "../shell-layout.css"), "utf8")
  .replace(/\s+/g, " ")
  .replace(/\( /g, "(")
  .replace(/ \)/g, ")");

describe("TopbarSearch as the last child of Topbar start (gh#1422)", () => {
  it("is excluded from the start cluster's text-truncation rule", () => {
    const selector = shell.match(/\.ui-topbar-start > :last-child:not\(([^{]*)\)\s*\{/)?.[1] ?? "";
    expect(selector).toContain(".ui-topbar-search");
    // The controls the rule already skipped stay skipped (gh#376).
    for (const control of ["button", "a", '[role="button"]', ".ui-button"]) {
      expect(selector).toContain(control);
    }
  });

  it("a start cluster that ENDS in a control is floored at its content, so it overflows instead of clipping", () => {
    const rule =
      shell.match(/\.ui-topbar-start:has\(> :last-child:is\(([^)]*)\)\)\s*\{([^}]*)\}/) ?? [];
    expect(rule[1]).toContain(".ui-topbar-search");
    expect(rule[1]).toContain("button");
    expect(rule[2]).toMatch(/min-inline-size:\s*min-content;/);
  });

  it("no other rule strips the search wrapper's minimum", () => {
    const rules = [...shell.matchAll(/([^{}]*\.ui-topbar-search[^{}]*)\{([^}]*)\}/g)];
    for (const [, selector, body] of rules) {
      if (
        /\.ui-topbar-search\s*,?\s*$/.test(selector.trim()) ||
        selector.trim().endsWith(".ui-topbar-search")
      ) {
        expect(body).not.toMatch(/min-(?:width|inline-size):\s*0/);
      }
    }
  });
});
