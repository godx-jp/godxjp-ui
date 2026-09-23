import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * A SCOPED THEME SHADOWED THE POLARITY SWITCH, SILENTLY (gh#896).
 *
 * Reported as "glassphomism ko có darkmode và light mode à?!". Measured by toggling the library's
 * own switch and counting how many of five core tokens move:
 *
 *     base    5/5    the package default — works
 *     glass   0/5    nothing moves. Permanently dark.
 *     flat    0/5    nothing moves. Permanently light.
 *
 * THE CAUSE IS THE FREEZE RULE RUNNING BACKWARDS, and docs/TOKEN-RESOLUTION.md §3 documents only
 * the forward direction. Forward: a binding at `:root` freezes and a scope below cannot reach it.
 * Backwards, which is this: a scope below SHADOWS a branch at the root and the root cannot reach
 * in. A theme declares `--background` on `[data-theme-style="glass"]`, a div under `<html>`, while
 * the polarity switch is `.dark, :root[data-theme="dark"]` ON the root — and a declaration on a
 * descendant beats an inherited value from an ancestor whatever the specificity. So every value
 * the theme declared won, and dark mode changed nothing at all.
 *
 * Nothing warned anyone, and the lab had no polarity control, so it had never been looked at.
 *
 * THIS TEST IS GENERATED FROM THE DIRECTORY, not from a list. A hand-kept list of themes is what
 * went blind in gh#854 and the registry docblock says so; a new `docs/themes/<id>.css` must fail
 * here on the day it is added rather than the day someone remembers to check it.
 *
 * jsdom resolves no `var()` and applies no cascade across files, so this asserts the shipped
 * CONTRACT — that each theme HAS a dark branch, that it uses both selector forms the library's own
 * foundation block uses, and that the branch is reachable. The numbers above come from Chromium
 * and `scripts/measure-glass.mjs --mode=`.
 */
const THEME_DIR = resolve(process.cwd(), "docs/themes");
const themes = readdirSync(THEME_DIR)
  .filter((f) => f.endsWith(".css"))
  .map((f) => ({ file: f, css: readFileSync(resolve(THEME_DIR, f), "utf8") }));

/** The `[data-theme-style="<id>"]` a theme file scopes itself with. */
const scopeOf = (css: string) => css.match(/\[data-theme-style="([a-z-]+)"\]/)?.[1] ?? null;

describe("every scoped theme answers the polarity switch (gh#896)", () => {
  it("finds the theme files at all — a zero-length sweep is a passing sweep that proves nothing", () => {
    expect(themes.length).toBeGreaterThanOrEqual(2);
  });

  it.each(themes)("$file declares a dark branch", ({ css }) => {
    const id = scopeOf(css);
    expect(id, "no [data-theme-style] scope found").not.toBeNull();
    // Both forms, because `src/tokens/foundation.css` carries both and a theme that answers only
    // one answers only half the consumers.
    expect(css).toMatch(new RegExp(`\\.dark \\[data-theme-style="${id}"\\]`));
    expect(css).toMatch(new RegExp(`\\[data-theme="dark"\\] \\[data-theme-style="${id}"\\]`));
  });

  it.each(themes)("$file's dark branch re-declares the page canvas", ({ css }) => {
    // `--background` is the one token that cannot be left to inherit: it IS the polarity. A branch
    // that sets only accents leaves the canvas at the other polarity's value, which is the
    // half-flipped state §3 of the glassmorphism standard calls a POLARITY bug.
    const id = scopeOf(css);
    const at = css.search(new RegExp(`\\.dark \\[data-theme-style="${id}"\\]`));
    expect(at).toBeGreaterThan(-1);
    expect(css.slice(at)).toMatch(/--background:/);
  });

  it.each(themes)("$file declares custom properties and nothing else", ({ css }) => {
    // The constraint that makes the theme lab a MEASUREMENT rather than a demo: every visual
    // effect must come from an existing `src/styles/**` rule that already reads the token.
    const body = css.replace(/\/\*[\s\S]*?\*\//g, "");
    expect(body, "a theme may not write backdrop-filter directly").not.toMatch(
      /^\s*backdrop-filter\s*:/m,
    );
    expect(body, "a theme may not reach into a .ui-* internal class").not.toMatch(/\.ui-[a-z-]+/);
    expect(body, "a theme may not need !important").not.toMatch(/!important/);
  });
});

describe("the registry exposes polarity as an addressable axis (gh#896)", () => {
  const registry = readFileSync(resolve(THEME_DIR, "index.ts"), "utf8");

  it("carries a MODES axis, so a measurement can reach either half of a cell", () => {
    expect(registry).toMatch(/export const MODES/);
    expect(registry).toMatch(/id: "light"/);
    expect(registry).toMatch(/id: "dark"/);
  });

  it("makes `inkSurface` a PAIR — one hex is wrong in exactly one polarity", () => {
    // The ink walks away from the surface until it clears 4.5:1, so the hardest ground is the
    // DARKEST surface in a light theme and the LIGHTEST in a dark one. gh#887's single hex was a
    // dark-branch measurement; carrying it into the light slot would have been wrong there.
    expect(registry).toMatch(
      /inkSurface:\s*\{\s*light:\s*string \| null;\s*dark:\s*string \| null\s*\}/,
    );
    expect(registry).not.toMatch(/^\s*inkSurface:\s*"#/m);
  });
});
