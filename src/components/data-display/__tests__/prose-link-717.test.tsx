import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import { Prose } from "../prose";
import { contrast, hsl, hslToRgb } from "../../../tokens/__tests__/wcag-contrast";

/**
 * PROSE'S LINK GETS A KNOB, AND ITS ANCHOR STAYS THE CONSUMER'S (gh#717).
 *
 * Prose styled `a` from the first commit and shipped thirteen tokens, none of them about links:
 * headings, lists, quote, code and image each had at least one knob, `a` had zero. Cardinal rule
 * #45 was therefore unheld at the most common element in a wiki body, and the case that measured it
 * is not cosmetic — a wiki link whose target does not exist yet has to READ differently from one
 * that resolves, or the wiki stops growing. The behaviour was already real (clicking such a link
 * opens the editor for that name) and the renderer already marked those anchors with a `data-*`
 * attribute; only the appearance had no legal route, because a consumer may not reach into package
 * internals with page CSS or utilities.
 *
 * Two contracts, and both halves are needed — a knob nobody may select is as useless as a selector
 * with nothing to set:
 *
 *   1. `--prose-link-color` / `--prose-link-decoration-line` exist, default to exactly what the
 *      rule painted before, and the colour follows a scoped role instead of freezing at `:root`.
 *   2. Prose writes `data-*` on its own root ONLY. Every `data-*` on a descendant `a` is the
 *      consumer's, survives the render, and can be selected — so `a[data-…]` is a supported target
 *      for their own stylesheet (docs/CUSTOMER-THEMING.md).
 *
 * The CSS half asserts against the SOURCE because jsdom loads no stylesheet; the browser half of
 * the same measurement is recorded in the issue (computed colour identical with the knob unset,
 * re-tinted under a scope that sets it).
 */

const ROOT = process.cwd();
const tier = readFileSync(join(ROOT, "src/tokens/components/data-display.css"), "utf8");
const layout = readFileSync(join(ROOT, "src/styles/data-display-layout.css"), "utf8");
const foundation = readFileSync(join(ROOT, "src/tokens/foundation.css"), "utf8");

/** The body of a flat `selector { … }` block (these blocks have no nested braces). */
function block(css: string, selector: string): string {
  const start = css.indexOf(selector);
  if (start === -1) throw new Error(`selector not found: ${selector}`);
  const open = css.indexOf("{", start);
  return css.slice(open + 1, css.indexOf("\n}", open));
}

/** The body of the `.ui-prose a` rule, which is nested inside `@layer components` and so indented. */
const linkRule = layout.match(/\.ui-prose a \{([^}]*)\}/)?.[1] ?? "";

describe("the Prose link knobs (gh#717)", () => {
  it("declares the ink as `initial`, never as the tenant-scoped role", () => {
    // A `:root { --prose-link-color: var(--primary) }` computes against the ROOT's primary and
    // inherits that frozen value down, so a `[data-tenant]` re-tint never reaches the link
    // (docs/TOKENS.md, the freeze rule; tenant-scope-freeze-687.test.ts holds it tier-wide).
    expect(tier).toMatch(/--prose-link-color:\s*initial;/);
    expect(tier).not.toMatch(/--prose-link-color:\s*var\(--primary\)/);
  });

  it("resolves the ink's default at the call site, so a scope re-tints it", () => {
    expect(linkRule).toContain("color: hsl(var(--prose-link-color, var(--primary)))");
  });

  it("keeps the resting underline a knob with the same default the rule used to hard-code", () => {
    expect(tier).toMatch(/--prose-link-decoration-line:\s*underline;/);
    expect(linkRule).toContain("text-decoration-line: var(--prose-link-decoration-line)");
  });

  it("paints nothing else — unset is the rule that shipped before, property for property", () => {
    // The rule was `color: hsl(var(--primary)); text-decoration: underline;`. A third declaration
    // here (an underline offset, a hover ink) would change what an un-themed consumer sees, which
    // this issue explicitly may not do.
    const declarations = linkRule
      .split(";")
      .map((d) => d.trim())
      .filter(Boolean);
    expect(declarations).toEqual([
      "color: hsl(var(--prose-link-color, var(--primary)))",
      "text-decoration-line: var(--prose-link-decoration-line)",
    ]);
  });

  it("styles no hover state, so there is no hover knob to ship", () => {
    expect(layout).not.toMatch(/\.ui-prose a:hover/);
  });
});

const AA_TEXT = 4.5;
const THEMES = [
  { theme: "light", selector: ":root {" },
  { theme: "dark", selector: '.dark,\n:root[data-theme="dark"] {' },
] as const;

/**
 * The default ink is `--primary` (the call-site fallback) and the docs page paints the
 * consumer-marked state with `--text-error`, the TEXT tier — never `--destructive`, the FILL tier,
 * which is tuned for a white label on top of it and measures 2.95:1 as ink on the dark card
 * (gh#610). Both are running text inside a document, so both owe 4.5:1 on every surface Prose
 * sits on.
 */
describe.each(THEMES)("Prose link ink contrast ($theme)", ({ selector }) => {
  const body = block(foundation, selector);
  const surfaces = [
    ["the page", "background"],
    ["a card", "card"],
  ] as const;

  it.each(surfaces)("the shipped default clears AA as text on %s", (_label, surface) => {
    expect(
      contrast(hslToRgb(hsl(body, "primary")), hslToRgb(hsl(body, surface))),
    ).toBeGreaterThanOrEqual(AA_TEXT);
  });

  it.each(surfaces)(
    "the documented marked-state ink clears AA as text on %s",
    (_label, surface) => {
      expect(
        contrast(hslToRgb(hsl(body, "text-error")), hslToRgb(hsl(body, surface))),
      ).toBeGreaterThanOrEqual(AA_TEXT);
    },
  );
});

describe("the anchor belongs to the consumer (gh#717)", () => {
  it("writes no data-* attribute on a link, so `a[data-…]` is theirs for good", () => {
    const { container } = render(
      <Prose>
        <p>
          See <a href="/a">one</a> and <a href="/b">two</a>.
        </p>
      </Prose>,
    );
    const anchors = [...container.querySelectorAll("a")];
    expect(anchors).toHaveLength(2);
    for (const anchor of anchors) {
      expect(anchor.getAttributeNames().filter((name) => name.startsWith("data-"))).toEqual([]);
    }
  });

  it("writes data-* on its own root only, and only for a non-default axis", () => {
    const { container } = render(
      <Prose size="sm">
        <p>
          <a href="/a">one</a>
        </p>
      </Prose>,
    );
    const marked = [...container.querySelectorAll("*")].filter((node) =>
      node.getAttributeNames().some((name) => name.startsWith("data-")),
    );
    expect(marked).toEqual([container.querySelector('[data-slot="prose"]')]);
  });

  it("keeps a consumer-set data-* on the link, and it stays selectable", () => {
    const { container } = render(
      <Prose>
        <p>
          <a href="/resolved">resolved</a>{" "}
          <a href="/new" data-unresolved="true">
            not written yet
          </a>
        </p>
      </Prose>,
    );
    const unresolved = container.querySelectorAll('.ui-prose a[data-unresolved="true"]');
    expect(unresolved).toHaveLength(1);
    expect(unresolved[0].textContent).toBe("not written yet");
    // …and the resolved one is NOT caught by that selector, which is the whole point of the hook.
    expect(container.querySelectorAll(".ui-prose a:not([data-unresolved])")).toHaveLength(1);
  });

  it("keeps the attribute through a sanitised HTML string too", () => {
    const { container } = render(
      <Prose
        dangerouslySetInnerHTML={{
          __html: '<p><a href="/new" data-unresolved="true">not written yet</a></p>',
        }}
      />,
    );
    expect(container.querySelector('a[data-unresolved="true"]')).not.toBeNull();
  });
});
