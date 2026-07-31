import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Regression guard for issue #210.
 *
 * `styles/fonts.css` and `tokens/foundation.css` BOTH declare `--font-sans-base`
 * on `:root`, unlayered, at identical specificity (0,1,0) — so the declaration
 * parsed LAST is the one that wins. The all-in-one `@godxjp/ui/styles` entry used
 * to import `fonts.css` BEFORE `base.css` (→ tokens → foundation), which made the
 * bundled faces permanently dead while still shipping ~800 KB of `@font-face`.
 *
 * These tests flatten the real `@import` graph in source order and assert the
 * winning declaration, so the ordering cannot silently regress.
 */

/** Vitest runs with the repo root as cwd (see vitest.config.ts `root`). */
const REPO_ROOT = process.cwd();
const STYLES_DIR = resolve(REPO_ROOT, "src/styles");

/** Strip CSS comments — every one of these files documents token names in prose. */
const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");

/**
 * Inline every RELATIVE `@import` in source order, depth-first, exactly the way a
 * bundler (or the browser) linearises the cascade. Bare specifiers
 * (`tailwindcss`, `@fontsource/*`, `sonner/*`) are node_modules assets and are
 * kept as markers only.
 */
const flatten = (entry: string, seen = new Set<string>()): string => {
  const absolute = resolve(entry);
  if (seen.has(absolute)) return "";
  seen.add(absolute);

  const source = stripComments(readFileSync(absolute, "utf8"));
  return source.replace(/@import\s+["']([^"']+)["']\s*;/g, (match, specifier: string) => {
    if (!specifier.startsWith(".")) return match;
    return flatten(resolve(dirname(absolute), specifier), seen);
  });
};

/** The last `:root`-level declaration of `token` — i.e. the one that actually wins. */
const winningDeclaration = (css: string, token: string): string | undefined => {
  const matches = [...css.matchAll(new RegExp(`${token}:\\s*([^;}]+)`, "g"))];
  return matches.at(-1)?.[1].replace(/\s+/g, " ").trim();
};

describe("bundled-font cascade order (issue #210)", () => {
  it("imports fonts.css AFTER base.css in the all-in-one entry", () => {
    const index = stripComments(readFileSync(resolve(STYLES_DIR, "index.css"), "utf8"));
    const base = index.indexOf('@import "./base.css"');
    const fonts = index.indexOf('@import "./fonts.css"');

    expect(base, "index.css must import ./base.css").toBeGreaterThan(-1);
    expect(fonts, "index.css must import ./fonts.css").toBeGreaterThan(-1);
    expect(
      fonts,
      "fonts.css must be imported AFTER base.css — the token layers re-declare --font-sans-base on :root at equal specificity, so an earlier fonts.css can never apply (issue #210)",
    ).toBeGreaterThan(base);
  });

  it("still has the conflicting pair unlayered — order is the ONLY precedence lever", () => {
    const fonts = stripComments(readFileSync(resolve(STYLES_DIR, "fonts.css"), "utf8"));
    const foundation = stripComments(
      readFileSync(resolve(STYLES_DIR, "../tokens/foundation.css"), "utf8"),
    );

    // Both must declare the token on :root, both unlayered. If either side ever
    // moves into a cascade layer this guard must be rewritten, not deleted.
    expect(fonts).toMatch(/:root\s*\{[^}]*--font-sans-base:/s);
    expect(foundation).toMatch(/:root\s*\{[^}]*--font-sans-base:/s);
    expect(fonts).not.toMatch(/@layer/);
    expect(foundation).not.toMatch(/@layer/);
  });

  it("resolves --font-sans-base to the bundled M PLUS 2 stack through the all-in-one entry", () => {
    const flattened = flatten(resolve(STYLES_DIR, "index.css"));
    const winner = winningDeclaration(flattened, "--font-sans-base");

    expect(winner).toBeDefined();
    expect(
      winner,
      "the LAST --font-sans-base declaration in the all-in-one cascade must be the bundled face, not the font-agnostic system stack",
    ).toMatch(/^"M PLUS 2"/);
    expect(winner).toContain('"Noto Sans JP"');
    // The font-agnostic foundation default must NOT be the last word.
    expect(winner).not.toMatch(/^-apple-system/);
  });

  it("resolves --font-sans-vi to the bundled stack too", () => {
    const flattened = flatten(resolve(STYLES_DIR, "index.css"));
    const winner = winningDeclaration(flattened, "--font-sans-vi");

    expect(winner).toMatch(/^"M PLUS 2"/);
  });

  it("ships the @font-face bundle that the tokens actually name", () => {
    const fonts = stripComments(readFileSync(resolve(STYLES_DIR, "fonts.css"), "utf8"));

    // Docs (README / CUSTOMER-THEMING / mcp tokens) claim M PLUS 2 primary +
    // Noto Sans JP CJK fallback — the @font-face imports must match the claim.
    expect(fonts).toContain("@fontsource/m-plus-2/400.css");
    expect(fonts).toContain("@fontsource/noto-sans-jp/400.css");
    expect(fonts).not.toContain("@fontsource/montserrat");
  });

  it("keeps the published dist entry in the same order", () => {
    const distIndex = resolve(REPO_ROOT, "dist/styles/index.css");
    if (!existsSync(distIndex)) return; // dist is only present after a build

    const index = stripComments(readFileSync(distIndex, "utf8"));
    expect(index.indexOf('@import "./fonts.css"')).toBeGreaterThan(
      index.indexOf('@import "./base.css"'),
    );
  });
});
