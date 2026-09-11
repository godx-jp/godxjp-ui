import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * ScrollArea scrolls NATIVELY (v23) — and CSS is where that is decided, so CSS is what this reads.
 *
 * jsdom parses no stylesheet, so a rendering test cannot see any of it: `getComputedStyle(el).overflowY`
 * reports `visible` for every orientation whether the rules exist or not. That is the silent-failure
 * class this file exists for — a rule aimed at a class nobody renders, or deleted by a refactor, would
 * leave every ScrollArea unable to scroll with no test going red anywhere.
 *
 * The behaviour these rules produce is measured in a real browser (see the PR's measurement notes);
 * these assertions only pin the contract the component's `data-*` attributes rely on.
 */
const css = readFileSync(join(process.cwd(), "src/styles/data-display-layout.css"), "utf8");
/** Comments blanked (newlines kept), so a migration note NAMING a dead class is never a match. */
const declarations = css.replace(/\/\*[\s\S]*?\*\//g, (block) => block.replace(/[^\n]/g, " "));

const ruleBody = (selector: string): string | undefined => {
  const index = css.indexOf(selector);
  if (index === -1) return undefined;
  const open = css.indexOf("{", index);
  const close = css.indexOf("}", open);
  return open === -1 || close === -1 ? undefined : css.slice(open + 1, close);
};

describe("ScrollArea — native scrolling", () => {
  it("styles the browser's scrollbar from tokens, never from literals", () => {
    const body = ruleBody(".ui-scroll-area {");
    expect(body, "the .ui-scroll-area rule is missing").toBeDefined();
    expect(body).toMatch(/scrollbar-width:\s*var\(--scroll-area-scrollbar-width\)/);
    expect(body).toMatch(/scrollbar-gutter:\s*var\(--scroll-area-scrollbar-space\)/);
    // Both halves of `scrollbar-color` must resolve, or the whole declaration is dropped — hence a
    // role default at the call site behind each `initial` knob.
    expect(body).toMatch(
      /scrollbar-color:\s*var\(--scroll-area-thumb-color,\s*hsl\(var\(--border\)\)\)\s*var\(--scroll-area-track-color,\s*transparent\)/,
    );
  });

  it.each([
    ["vertical", /overflow-x:\s*hidden/, /overflow-y:\s*auto/],
    ["horizontal", /overflow-x:\s*auto/, /overflow-y:\s*hidden/],
  ])("opens exactly the axes orientation=%s names", (orientation, inline, block) => {
    const body = ruleBody(`.ui-scroll-area[data-orientation="${orientation}"] {`);
    expect(body, `no rule for orientation ${orientation}`).toBeDefined();
    expect(body).toMatch(inline);
    expect(body).toMatch(block);
  });

  it('opens both axes for orientation="both"', () => {
    expect(ruleBody('.ui-scroll-area[data-orientation="both"] {')).toMatch(/overflow:\s*auto/);
  });

  it("lets the content grow past the viewport ONLY on an axis that scrolls sideways", () => {
    const body = ruleBody(
      '.ui-scroll-area:is([data-orientation="horizontal"], [data-orientation="both"])',
    );
    expect(body).toMatch(/inline-size:\s*max-content/);
    expect(body).toMatch(/min-inline-size:\s*100%/);
    // A VERTICAL area must keep a plain block wrapper: a max-content wrapper there would take the
    // longest line's width while `overflow-x` is hidden, and long prose would be cut off with no
    // way to reach the rest (measured under Radix at 390px: a 612px wrapper in a 322px viewport).
    const vertical = ruleBody('.ui-scroll-area[data-orientation="vertical"] {');
    expect(vertical).not.toMatch(/max-content/);
  });

  it("keeps no trace of the Radix rail it replaced", () => {
    // The hand-drawn bar, and the `display: block !important` patch that existed only to beat
    // Radix's inline `display: table` on a wrapper no prop could reach.
    expect(declarations).not.toMatch(/\.ui-scroll-area-(bar|thumb)/);
    expect(declarations).not.toMatch(
      /scroll-area-viewport"\]\[data-orientation="vertical"\]\s*>\s*\*/,
    );
  });
});
