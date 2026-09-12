import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * The GEOMETRY the three new antd Card flags buy, read straight out of the shipped stylesheet.
 *
 * jsdom performs no layout and does not resolve `var()`, so a `getComputedStyle` assertion on a
 * rendered Card would be vacuous here — the same reason `card-axis-independence.test.ts` resolves
 * the cascade by hand rather than asking the DOM. These assertions are therefore about the RULES:
 * which declarations exist, which properties they deliberately do NOT set, and — for the two
 * places where the answer depends on it — which rule is declared later at equal specificity.
 */
const cardStyles = readFileSync(resolve(process.cwd(), "src/styles/card-layout.css"), "utf8");
const cardTokens = readFileSync(resolve(process.cwd(), "src/tokens/components/card.css"), "utf8");

const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");
const clean = stripComments(cardStyles);

/** The declaration body of the first rule whose selector is exactly `selector`. */
function block(selector: string): string {
  const at = clean.indexOf(`${selector} {`);
  expect(at, `missing CSS rule: ${selector}`).toBeGreaterThan(-1);
  return clean.slice(at + selector.length, clean.indexOf("}", at));
}

/** One declaration out of that rule, or `undefined` when the rule does not set it. */
function declaration(selector: string, property: string): string | undefined {
  const match = block(selector).match(new RegExp(`(?:^|[;{])\\s*${property}\\s*:\\s*([^;]+);`));
  return match ? match[1].replace(/\s+/g, " ").trim() : undefined;
}

/** Character offset of a rule, for the "declared later at equal specificity" assertions. */
function position(selector: string): number {
  const at = clean.indexOf(`${selector} {`);
  expect(at, `missing CSS rule: ${selector}`).toBeGreaterThan(-1);
  return at;
}

describe('Card `variant="borderless"` — antd\'s borderless, which `outline` never was', () => {
  it("zeroes the edge, while `outline` keeps it and drops the fill instead", () => {
    // The pair that makes the two values non-interchangeable. `outline` touches `background`
    // only, so before this variant existed there was NO spelling for "no border" at all — the
    // parity audit's "superset" verdict was wrong on exactly this point.
    expect(declaration('[data-slot="card"][data-variant="borderless"]', "border-width")).toBe("0");
    expect(
      declaration('[data-slot="card"][data-variant="outline"]', "border-width"),
    ).toBeUndefined();
    expect(declaration('[data-slot="card"][data-variant="outline"]', "background")).toBe(
      "transparent",
    );
    expect(
      declaration('[data-slot="card"][data-variant="borderless"]', "background"),
    ).toBeUndefined();
  });

  it("still paints a semantic accent rail — the signal outranks the quieter frame", () => {
    // Both selectors are (0,2,0), so the LATER one wins `border-inline-start-width`. Move the
    // borderless rule below the accent rule and an accented borderless card silently loses its
    // status stripe — a failure that is invisible in the markup.
    expect(declaration('[data-slot="card"][data-accent]', "border-inline-start-width")).toBe(
      "var(--card-accent-rail-width)",
    );
    expect(position('[data-slot="card"][data-accent]')).toBeGreaterThan(
      position('[data-slot="card"][data-variant="borderless"]'),
    );
  });
});

describe("Card `hoverable` — antd's lift, composed rather than painted", () => {
  it("steps up the shadow TOKEN and paints no box-shadow of its own", () => {
    expect(declaration('[data-slot="card"][data-hoverable]:hover', "--card-shadow")).toBe(
      "var(--card-hover-shadow)",
    );
    // The load-bearing half. A `box-shadow` here would win at equal specificity over the
    // perimeter rule below and erase the attention ring for as long as the pointer sat on the
    // card — the exact class of silent CSS failure this repo keeps getting bitten by.
    expect(declaration('[data-slot="card"][data-hoverable]:hover', "box-shadow")).toBeUndefined();
  });

  it("reaches the perimeter ring's own shadow, because that rule re-lists the token", () => {
    const perimeter = declaration(
      '[data-slot="card"][data-accent][data-accent-placement="perimeter"]',
      "box-shadow",
    );
    expect(perimeter).toContain("var(--card-accent-color)");
    expect(perimeter).toContain("var(--card-shadow)");
    expect(perimeter).toContain("var(--card-glow)");
  });

  it("declares the lift on the shared elevation ramp", () => {
    expect(cardTokens).toMatch(/--card-hover-shadow:\s*var\(--shadow-md\);/);
  });

  it("animates from the motion tier and stops under prefers-reduced-motion", () => {
    expect(declaration('[data-slot="card"][data-hoverable]', "transition")).toBe(
      "box-shadow var(--duration-fast) var(--ease-standard)",
    );
    expect(declaration('[data-slot="card"][data-hoverable]', "cursor")).toBe("pointer");

    const reduce = clean.slice(clean.indexOf("@media (prefers-reduced-motion: reduce)"));
    expect(reduce).toContain('[data-slot="card"][data-hoverable]');
    expect(reduce).toMatch(/transition:\s*none;/);
  });
});

describe("CardFooter `actions` — antd's divided strip", () => {
  it("gives every cell an EQUAL share without counting the children", () => {
    // Upstream writes `width: ${100 / actions.length}%` as an inline style; `flex: 1 1 0` is the
    // stylesheet equivalent, so no geometry reaches the DOM (cardinal rule #44).
    expect(declaration('[data-slot="card-footer"][data-actions] > *', "flex")).toBe("1 1 0");
    expect(declaration('[data-slot="card-footer"][data-actions] > *', "justify-content")).toBe(
      "center",
    );
  });

  it("draws the divider on a LOGICAL edge, so the strip mirrors under RTL", () => {
    const rule = declaration(
      '[data-slot="card-footer"][data-actions] > * + *',
      "border-inline-start",
    );
    expect(rule).toBe("var(--stroke-hairline) solid hsl(var(--card-border, var(--border)))");
    // A physical `border-left` here would put every hairline on the wrong side of every cell in
    // an Arabic locale, which `check:rtl` exists to prevent.
    expect(block('[data-slot="card-footer"][data-actions] > * + *')).not.toMatch(/border-left/);
  });

  it("is self-sufficient — it owns the top rule and the full-bleed edges itself", () => {
    // This is what lets `<CardFooter actions>` be ONE prop for one antd behaviour instead of the
    // `separated flush actions` triple.
    expect(declaration('[data-slot="card-footer"][data-actions]', "border-top")).toBe(
      "var(--stroke-hairline) solid hsl(var(--card-border, var(--border)))",
    );
    expect(declaration('[data-slot="card-footer"][data-actions]', "padding-inline")).toBe("0");
    expect(declaration('[data-slot="card-footer"][data-actions]', "padding-block")).toBe("0");
    expect(declaration('[data-slot="card-footer"][data-actions]', "gap")).toBe("0");
  });

  it("is declared after the chrome flags it has to beat at equal specificity", () => {
    // `[data-slot="card-footer"]:not([data-separated])` and `[data-separated]` both set the
    // footer's block padding at (0,2,0). `actions` moves that padding onto the cells, so it only
    // wins by being later in the file.
    expect(position('[data-slot="card-footer"][data-actions]')).toBeGreaterThan(
      position('[data-slot="card-footer"][data-separated]'),
    );
    expect(declaration('[data-slot="card-footer"][data-actions] > *', "padding-block")).toBe(
      "var(--card-space-footer-y)",
    );
  });
});
