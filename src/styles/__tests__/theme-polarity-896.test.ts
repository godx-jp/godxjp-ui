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

/**
 * Comments blanked, so a selector MENTIONED in prose is never mistaken for the rule.
 *
 * Worth the helper: searching the raw text for `.dark [data-theme-style="glass"]` found it at
 * offset 4807 of 59535 — inside the docblock that explains the dark branch — which split the file
 * at the wrong place and made two assertions here vacuous while still reporting green. The blanking
 * preserves length, so every offset below still indexes the original text.
 */
const decommented = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, (m) => " ".repeat(m.length));

/** Offset of the dark branch's RULE, at the start of a line, or -1. */
const darkRuleAt = (css: string, id: string) =>
  decommented(css).search(new RegExp(`^\\.dark \\[data-theme-style="${id}"\\]`, "m"));

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

  it.each(themes)("$file's dark branch moves the page canvas", ({ file, css }) => {
    /* `--background` is the one token that cannot be left to inherit: it IS the polarity. A branch
     * that sets only accents leaves the canvas at the other polarity's value — the half-flipped
     * state §3 of the glassmorphism standard calls a POLARITY bug, and exactly what shipped here
     * once already.
     *
     * "RE-DECLARES" WAS THE WRONG TEST, and this theme is what proved it: glass flips its canvas
     * through `--background: 230 var(--glass-canvas-sl)`, so `--background` appears only in the
     * light half and the dark branch moves the knob instead. Both are correct; what is not correct
     * is a canvas that cannot move at all. So: re-declared, or EVERY `var()` it reads is set in
     * the dark branch. "Every", not "any" — a token reading two knobs of which one flips is still
     * half pinned. */
    const id = scopeOf(css);
    const at = darkRuleAt(css, id!);
    expect(at, "no dark RULE found (a mention in a comment does not count)").toBeGreaterThan(-1);
    const bare = decommented(css);
    const dark = bare.slice(at);
    const declaredInDark = (name: string) => new RegExp(`^\\s*${name}:`, "m").test(dark);

    if (declaredInDark("--background")) return;
    const lightValue = bare.slice(0, at).match(/^\s*--background:([^;]*);/m)?.[1];
    expect(lightValue, `${file}: no --background in either half`).toBeDefined();
    const knobs = [...lightValue!.matchAll(/var\((--[a-z0-9-]+)/g)].map((m) => m[1]);
    expect(
      knobs.length,
      `${file}: --background is a literal and the dark branch never restates it`,
    ).toBeGreaterThan(0);
    for (const k of knobs) {
      expect(
        declaredInDark(k),
        `${file}: --background reads ${k}, which the dark branch does not set — the canvas is pinned`,
      ).toBe(true);
    }
  });

  it.each(themes)("$file's BACKDROP flips too, not just its canvas token", ({ file, css }) => {
    /* THE BUG THIS EXISTS FOR, and my first attempt at it did not catch. `--background` was
     * flipped while `--gradient-glow` — which `.app-main` paints ON TOP of the canvas — kept a
     * floor of `hsl(230 55% 11%)`. The token that names the canvas said "light" and the pixels
     * stayed dark, so ink correctly darkened for a light theme landed on a dark ground. The canvas
     * assertion above passed the whole time; only a screenshot found it.
     *
     * THE FIRST VERSION ASKED "does the dark branch set ANY knob this gradient reads", and that
     * passes while the one stop that matters stays pinned — re-pinning the floor and re-running it
     * still went green, because the three lobes flip and the floor does not. A test that reports
     * "checked" without checking is worse than no test, so this parses the LIGHTNESS SLOT of every
     * colour in every gradient the theme declares and requires it to be a `var()`. A literal there
     * is a stop that cannot move between polarities, which is exactly the defect. */
    const lightnessSlots = (value: string) => {
      const out: { raw: string; lightness: string }[] = [];
      // Every `hsl(…)` inside the value, brace-matched so nested `var()`/`calc()` survive.
      for (let i = value.indexOf("hsl("); i !== -1; i = value.indexOf("hsl(", i + 1)) {
        let depth = 0;
        let end = i + 3;
        for (; end < value.length; end++) {
          if (value[end] === "(") depth++;
          else if (value[end] === ")" && --depth === 0) break;
        }
        const args = value.slice(i + 4, end);
        // Split on top-level whitespace only, so `hsl(var(--x))` and `calc(h - 63)` stay whole.
        const parts: string[] = [];
        let buf = "";
        let d = 0;
        for (const ch of args.split("/")[0]) {
          if (ch === "(") d++;
          if (ch === ")") d--;
          if (/\s/.test(ch) && d === 0) {
            if (buf) parts.push(buf);
            buf = "";
          } else buf += ch;
        }
        if (buf) parts.push(buf);
        // `hsl(from <color> h s l)` — drop the two leading tokens of the relative form.
        const comps = parts[0] === "from" ? parts.slice(2) : parts;
        if (comps.length >= 3) out.push({ raw: value.slice(i, end + 1), lightness: comps[2] });
      }
      return out;
    };

    const id = scopeOf(css);
    const darkAt = darkRuleAt(css, id!);
    expect(darkAt, "no dark RULE found").toBeGreaterThan(-1);
    const light = decommented(css).slice(0, darkAt);
    for (const [, name, value] of light.matchAll(/^\s*(--[a-z-]*gradient[a-z-]*):([^;]*);/gm)) {
      for (const stop of lightnessSlots(value)) {
        expect(
          stop.lightness.startsWith("var("),
          `${file}: ${name} has a LITERAL lightness ${stop.lightness} in ${stop.raw.slice(0, 70)} — ` +
            `a stop that cannot move between polarities. Give it a knob the dark branch sets.`,
        ).toBe(true);
      }
    }
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
