import { readFileSync } from "node:fs";
import { join } from "node:path";

import { chromium } from "playwright";
import { describe, expect, it } from "vitest";

/**
 * gh#888 — the φ radius tier (`--radius-xs…2xl`, `src/styles/base.css`'s `@theme inline` block)
 * was a `:root`-frozen derived scale, same shape as gh#687/#843/#848/#866/#880 one axis over:
 *
 * ```css
 * @theme inline {
 *   --radius-xl: calc(var(--radius) * var(--radius-ratio));   // Tailwind ALSO emits this as a
 * }                                                            // real `@layer theme` :root prop
 * ```
 *
 * `--radius-xl` substitutes against `:root`'s `--radius` ONCE, at that `@layer theme` declaration.
 * The 61 component-token mirrors (`--card-radius: var(--radius-xl)`, …) and ~86 direct call sites
 * read that frozen copy, so a scoped `[data-theme-style] { --radius: 0 }` cannot square a single
 * corner — measured on the issue: `:root { --radius: 0 }` squared 75/102 surfaces, the identical
 * scoped declaration moved 5/102.
 *
 * THE FIX is `docs/TOKENS.md` · "Role-mirror knobs MUST be `initial`" applied twice: the six φ
 * steps are restated `initial` in an UNLAYERED `:root` rule in `src/styles/base.css` (unlayered
 * cascade beats `@layer theme` regardless of source order, so this is the winning declaration for
 * every reader OTHER than Tailwind's own `.rounded-*` utilities, which inline the raw formula and
 * never read `--radius-xl` back), and every one of the 61 mirrors + 86 call sites now carries the
 * formula as its own `var(…, …)` fallback.
 *
 * THE BROWSER PROOF RUNS IN A REAL ENGINE, not jsdom: substitution happens at declaration time, so
 * a jsdom `getComputedStyle` read (or the `css-token-resolve` graph walk the sibling tests use)
 * cannot see whether a scoped override reached a frozen custom property — only a real cascade can.
 *
 * The `@theme inline` → `@layer theme` compile step is Tailwind's, not something `page.setContent`
 * can run on raw source, so the six calc() lines are extracted VERBATIM from `styles/base.css`
 * (the file this fix must not let drift) rather than hand-retyped, and wrapped in the same
 * `@layer theme` Tailwind itself emits (confirmed against the real dev build — see the issue).
 */

const REPO = process.cwd();
const read = (p: string) => readFileSync(join(REPO, p), "utf8");

const baseCss = read("src/styles/base.css");
const foundation = read("src/tokens/foundation.css");
const cardTokens = read("src/tokens/components/card.css");
const cardLayout = read("src/styles/card-layout.css");

/** The six `--radius-xs…2xl` calc() lines, verbatim, from the `@theme inline` block. */
function extractPhiSteps(): string {
  const start = baseCss.indexOf("@theme inline {");
  expect(start, "base.css must declare `@theme inline`").toBeGreaterThan(-1);
  const stepsStart = baseCss.indexOf("--radius-xs:", start);
  const stepsEnd = baseCss.indexOf("--radius-2xl:", stepsStart);
  const lineEnd = baseCss.indexOf(";", stepsEnd) + 1;
  const block = baseCss.slice(stepsStart, lineEnd);
  expect(block, "must capture all six φ steps").toMatch(/--radius-2xl:/);
  return block;
}

/** The unfreeze `:root { --radius-xs: initial; … }` block this fix adds, verbatim. */
function extractUnfreezeBlock(): string {
  const marker = "Unfreeze the φ radius tier (gh#888)";
  const at = baseCss.indexOf(marker);
  expect(at, "base.css must document the gh#888 unfreeze").toBeGreaterThan(-1);
  // The doc comment ITSELF quotes a `:root { --radius-xs: calc(…) }` example, so the real
  // declaration is the first `:root {` AFTER the comment closes, not the first substring match.
  const commentEnd = baseCss.indexOf("*/", at);
  const open = baseCss.indexOf(":root {", commentEnd);
  const close = baseCss.indexOf("}", open);
  return baseCss.slice(open, close + 1);
}

describe("radius φ tier follows a scoped theme (gh#888) — the token graph", () => {
  it("the six steps stay real calc() formulas inside `@theme inline`", () => {
    // Tailwind inlines THIS exact expression into `.rounded-xl`; turning it into `initial` here
    // would delete the utility along with the freeze (verified against the compiled dev build).
    const steps = extractPhiSteps();
    expect(steps).toMatch(/--radius-xl:\s*calc\(var\(--radius\)\s*\*\s*var\(--radius-ratio\)\)/);
  });

  it("an UNLAYERED `:root` restates all six as `initial`, after `@theme inline`", () => {
    const block = extractUnfreezeBlock();
    for (const step of ["xs", "sm", "md", "lg", "xl", "2xl"]) {
      expect(block).toMatch(new RegExp(`--radius-${step}:\\s*initial;`));
    }
    // Not inside any `@layer` — that is the entire mechanism (unlayered beats `@layer theme`).
    const before = baseCss.slice(0, baseCss.indexOf(block));
    const openLayers = (before.match(/@layer[^;{]*\{/g) ?? []).length;
    const closedLayers = (before.match(/\n\}/g) ?? []).length;
    expect(
      openLayers,
      "the unfreeze block must not sit inside an unclosed @layer",
    ).toBeLessThanOrEqual(closedLayers);
  });

  it("`--card-radius` (a φ-step mirror) is `initial`, with the xl formula at its call site", () => {
    expect(cardTokens).toMatch(/--card-radius:\s*initial;/);
    expect(cardLayout).toMatch(
      /border-radius:\s*var\(--card-radius,\s*calc\(var\(--radius\)\s*\*\s*var\(--radius-ratio\)\)\);/,
    );
  });
});

/** A stylesheet a real browser can render: Tailwind's compiled shape, hand-assembled from the
 * verbatim source fragments above, plus the real token/layout files for one mirror end to end. */
function browserStylesheet(): string {
  return [
    `@layer theme { :root, :host { ${extractPhiSteps()} } }`,
    foundation,
    extractUnfreezeBlock(),
    cardTokens,
    cardLayout,
  ]
    .join("\n")
    .replace(/@import[^;]+;/g, "")
    .replace(/@source[^;]+;/g, "");
}

const CARD = (id: string) => `<div class="ui-card" data-slot="card" id="${id}">card</div>`;

describe("radius φ tier follows a scoped theme (gh#888) — Chromium", () => {
  it("a SCOPED --radius override now squares the corner, same as a :root override", async () => {
    const css = browserStylesheet();
    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage({ viewport: { width: 800, height: 600 } });
      await page.setContent(
        `<!doctype html><html><head><style>${css}</style></head><body>
           ${CARD("default")}
           <div data-theme-style style="--radius: 0">${CARD("scoped")}</div>
         </body></html>`,
      );
      const rootZero = await browser.newPage({ viewport: { width: 800, height: 600 } });
      await rootZero.setContent(
        `<!doctype html><html style="--radius: 0"><head><style>${css}</style></head><body>${CARD(
          "rootzero",
        )}</body></html>`,
      );

      const radius = (p: typeof page, id: string) =>
        p.evaluate(
          (elId) => getComputedStyle(document.getElementById(elId)!).borderTopLeftRadius,
          id,
        );

      const defaultRadius = await radius(page, "default");
      const scopedRadius = await radius(page, "scoped");
      const rootRadius = await radius(rootZero, "rootzero");

      // The premise: :root really does square it, and the default really is non-zero
      // (0.375rem seed × φ = 6px × 1.618 = 9.708px).
      expect(defaultRadius).not.toBe("0px");
      expect(rootRadius).toBe("0px");

      // THE FIX: a scope BELOW :root now reaches the same frozen mirror a :root override reaches.
      // Before this fix, `scopedRadius` stayed at `defaultRadius` — the 5/102-vs-75/102 gap.
      expect(scopedRadius).toBe("0px");
      expect(scopedRadius).toBe(rootRadius);

      // …and the untouched card is byte-identical to today's default — no drift.
      expect(defaultRadius).toBe("9.708px");
    } finally {
      await browser.close();
    }
  });
});
