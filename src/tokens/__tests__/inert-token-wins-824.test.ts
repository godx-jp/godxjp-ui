import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { environment, resolveToken } from "./css-token-resolve";

/**
 * gh#824 — four catalogued tokens that a consumer could set and watch do nothing.
 *
 * WHY THESE ASSERTIONS AND NOT A COMPUTED-STYLE PROBE. Every one of these is a CASCADE fact, and
 * jsdom applies no author cascade and does no layout: `getComputedStyle` on any of the elements
 * below returns "" for the property in question, so a probe here would pass just as happily with
 * the defect back in. The verdicts were measured in Chromium against the built preview at 1280px
 * (set the token on `:root` to 37px, re-read the element) and the numbers are written into each
 * `it` below; what this file guards is that the SOURCE keeps the shape those measurements proved.
 *
 * Three fixes and one refusal:
 *   1 `--control-radius` on `.ui-button`      DELETED  — the declaration, not the knob
 *   2 `--control-label-font-size` on `.ui-label`  CHAINED  — free, 14px both sides
 *   3 `--conversations-item-radius`           CHAINED  — through `--button-radius`, +2.29px
 *   4 `--topbar-icon-size`                    INTENTIONAL — measurement refuted the report
 */

const ROOT = process.cwd();
const read = (rel: string) => readFileSync(join(ROOT, rel), "utf8");

/** The body of the first rule whose selector list is exactly `selector`. */
function ruleBody(css: string, selector: string): string {
  const at = css.indexOf(`\n  ${selector} {`);
  expect(at, `rule \`${selector}\` not found`).toBeGreaterThan(-1);
  const open = css.indexOf("{", at);
  return css.slice(open + 1, css.indexOf("}", open));
}

describe("gh#824 · --control-radius is not a Button knob", () => {
  it("`.ui-button` declares no border-radius at all", () => {
    /* Measured before the fix: `--control-radius: 37px` on :root moved 37 buttons on
     * /isolate/general-button-index from 3.70828px to 3.70828px. The declaration named
     * --control-radius (var(--radius), 6px) while every button painted --button-radius
     * (var(--radius-md), 3.70px) — inert AND untrue. */
    expect(ruleBody(read("src/styles/control.css"), ".ui-button")).not.toMatch(/border-radius/);
  });

  it("every Button shape still brings its own radius utility, so nothing lost a corner", () => {
    const button = read("src/components/general/button.tsx");
    for (const shape of ["--button-radius", "--radius-pill", "--radius-sharp"]) {
      expect(button).toContain(`rounded-[var(${shape})]`);
    }
  });

  it("the two are NOT interchangeable — which is why this was a delete and not a chain", () => {
    /* Chromium at 1280px: --control-radius 6px, --button-radius 3.70828px. The source resolver
     * cannot reach the second on its own — `--radius-md` is Tailwind's, declared in base.css's
     * `@theme inline` rather than in `src/tokens/`, so it reads as undeclared here. That IS the
     * finding: the two knobs come off two different ramps, one divided by the golden ratio, and
     * chaining them would have put 2.3px of corner on every button in the library. */
    const env = environment({ selectors: [":root"] });
    expect(resolveToken("--control-radius", env)).toBe("0.375rem"); // 6px
    expect(resolveToken("--radius-md", env)).toBe("(undeclared)");
    expect(readFileSync(join(ROOT, "src/styles/base.css"), "utf8")).toMatch(
      /--radius-md:\s*calc\(var\(--radius\) \/ var\(--radius-ratio\)\)/,
    );
  });

  it("--control-radius stays catalogued, because it is live on the controls it names", () => {
    /* Measured: 6px -> 37px on `.ui-input` (71 elements) and `.ui-control-trigger` (15). */
    expect(read("src/components/data-entry/input.tsx")).toContain(
      "rounded-[var(--control-radius)]",
    );
    expect(read("mcp/src/data/component-tokens.generated.ts")).toContain(
      '"name": "--control-radius"',
    );
  });
});

describe("gh#824 · --control-label-font-size reaches a FormField label", () => {
  it("--form-label-font-size reads the Label primitive's knob as its default", () => {
    /* Before: `--control-label-font-size: 37px` moved the 4 standalone Labels on
     * /isolate/data-entry-label and none of the 21 FormField ones, because FormField passes
     * `text-[length:var(--form-label-font-size)]` and a utility outranks `@layer components`. */
    expect(read("src/tokens/components/form.css")).toMatch(
      /--form-label-font-size:\s*var\(--control-label-font-size,\s*var\(--text-sm\)\)/,
    );
  });

  it("the chain is FREE — both sides were already the same step", () => {
    /* Measured in Chromium before AND after: the FormField label is 14px either way. The old
     * default went through Tailwind's `--text-sm`, which base.css declares as
     * `var(--font-size-sm)` — literally the token --control-label-font-size already read. */
    const env = environment({ selectors: [":root"] });
    expect(resolveToken("--control-label-font-size", env)).toBe("0.875rem"); // 14px
    expect(resolveToken("--form-label-font-size", env)).toBe("0.875rem"); // 14px, unmoved
    expect(readFileSync(join(ROOT, "src/styles/base.css"), "utf8")).toMatch(
      /--text-sm:\s*var\(--font-size-sm\)/,
    );
  });

  it("the narrow knob still overrides — a chain is a default, not a merge", () => {
    const env = environment({ selectors: [":root"] });
    env.set("--form-label-font-size", "0.75rem");
    expect(resolveToken("--form-label-font-size", env)).toBe("0.75rem");
  });
});

describe("gh#824 · --conversations-item-radius reaches the rail row", () => {
  const body = () => ruleBody(read("src/styles/navigation-layout.css"), ".ui-conversations-row");

  it("the row re-points the variable its Button utility reads", () => {
    /* The row IS `<Button variant="ghost">`, so `rounded-[var(--button-radius)]` beat any
     * border-radius declared here: measured, 37px on :root left all 13 rows at 3.70828px. */
    expect(body()).toMatch(/--button-radius:\s*var\(--conversations-item-radius\)/);
  });

  it("and declares no border-radius of its own, which could only lose again", () => {
    expect(body()).not.toMatch(/border-radius/);
  });

  it("the paint MOVES 3.71px -> 6px, and 6px is what the token always advertised", () => {
    const env = environment({ selectors: [":root"] });
    expect(resolveToken("--conversations-item-radius", env)).toBe("0.375rem"); // 6px
    // The sidebar row rhythm this rail's defaults were drawn from — 5px, 1px away, not 2.3px.
    expect(resolveToken("--sidebar-nav-item-radius", env)).toBe("calc(calc(0.375rem * 1) - 1px)");
  });
});

describe("gh#824 · --topbar-icon-size is NOT inert — the report is refused", () => {
  const baseline = () =>
    JSON.parse(read("preview/frame-token-wins.baseline.json")) as {
      entries: string[];
      intentional: Record<string, string>;
    };
  const KEYS = ["height", "width"].map(
    (p) =>
      `${p} · --topbar-icon-size · .ui-topbar-item > svg ← ` +
      ".size-\\[var\\(--app-shell-mobile-nav-icon-size\\)\\]",
  );

  it("both arrangements are banked as INTENTIONAL, with the reason", () => {
    const { intentional } = baseline();
    for (const k of KEYS) {
      expect(Object.keys(intentional)).toContain(k);
      expect(intentional[k]).toMatch(/gh#824/);
    }
  });

  it("and are gone from `entries`, which is debt and must stay payable", () => {
    const { entries } = baseline();
    for (const k of KEYS) expect(entries).not.toContain(k);
  });

  it("the bar's own knob still sizes the bar's own cells", () => {
    /* Measured: 37px on :root moved every other `.ui-topbar-item > svg` 16px -> 37px, plus all
     * four glyphs in the `.ui-topbar-item-icon` slot. 16px is exactly what it claims. */
    const shell = read("src/styles/shell-layout.css");
    expect(ruleBody(shell, ".ui-topbar-item > svg")).toMatch(/var\(--topbar-icon-size\)/);
    expect(shell).toMatch(/inline-size:\s*var\(--topbar-icon-size\)/);
  });

  it("the one element that overrides it says why, at the call site", () => {
    expect(read("src/components/layout/app-shell.tsx")).toMatch(/INTENTIONAL[\s\S]{0,400}gh#824/);
  });

  it("the 20px it paints is a second catalogued token, not a missing one", () => {
    const env = environment({ selectors: [":root"] });
    expect(resolveToken("--topbar-icon-size", env)).toBe("1rem"); // 16px
    expect(resolveToken("--app-shell-mobile-nav-icon-size", env)).toBe("1.25rem"); // 20px
  });
});
