import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Regression guard for the font-bundle import order.
 *
 * `styles/fonts.css` and `tokens/foundation.css` BOTH declare `--font-sans-base`
 * on `:root`, unlayered, at identical specificity (0,1,0) — so the declaration
 * parsed LAST is the one that wins.
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

  it("resolves --font-sans-base to the bundled Noto Sans JP stack through the all-in-one entry", () => {
    const flattened = flatten(resolve(STYLES_DIR, "index.css"));
    const winner = winningDeclaration(flattened, "--font-sans-base");

    expect(winner).toBeDefined();
    expect(
      winner,
      "the LAST --font-sans-base declaration in the all-in-one cascade must be the bundled face, not the font-agnostic system stack",
    ).toMatch(/^"Noto Sans JP"/);
    expect(winner).toContain('"M PLUS 2"');
    // The font-agnostic foundation default must NOT be the last word.
    expect(winner).not.toMatch(/^-apple-system/);
  });

  it("resolves --font-sans-vi to the bundled stack too", () => {
    const flattened = flatten(resolve(STYLES_DIR, "index.css"));
    const winner = winningDeclaration(flattened, "--font-sans-vi");

    expect(winner).toMatch(/^"Noto Sans JP"/);
  });

  it("ships the @font-face bundle that the tokens actually name", () => {
    const fonts = stripComments(readFileSync(resolve(STYLES_DIR, "fonts.css"), "utf8"));

    // Docs (README / CUSTOMER-THEMING / mcp tokens) claim Noto Sans JP primary +
    // M PLUS 2 fallback (product override, direct instruction) — the @font-face
    // imports must match the claim.
    expect(fonts).toContain("@fontsource/m-plus-2/400.css");
    expect(fonts).toContain("@fontsource/noto-sans-jp/400.css");
    expect(fonts).not.toContain("@fontsource/montserrat");
  });

  // `skipIf`, not a bare `return`. The CI test shards run `pnpm test` with NO build step (ci.yml:
  // "No build step: the suite imports from `src`, not from `dist`"), so `dist/` is never there and
  // the old `if (!existsSync(distIndex)) return;` reported a PASS that had measured nothing —
  // measured: deleting dist/styles/index.css left this file at "6 passed". A skip says so out loud.
  it.skipIf(!existsSync(resolve(REPO_ROOT, "dist/styles/index.css")))(
    "keeps the published dist entry in the same order",
    () => {
      const index = stripComments(
        readFileSync(resolve(REPO_ROOT, "dist/styles/index.css"), "utf8"),
      );
      const base = index.indexOf('@import "./base.css"');
      const fonts = index.indexOf('@import "./fonts.css"');
      // Both anchors asserted present: `fonts > base` is also true when base is simply absent
      // (`n > -1`), which is the same nothing-measured pass in a second disguise.
      expect(base, "dist/styles/index.css must import ./base.css").toBeGreaterThan(-1);
      expect(fonts, "dist/styles/index.css must import ./fonts.css").toBeGreaterThan(-1);
      expect(fonts).toBeGreaterThan(base);
    },
  );
});

/**
 * Issue #475: every bundled face is `font-display: swap`, so a cold visit paints in whatever comes
 * after "Noto Sans JP" and reflows when the subsets land (CLS 0.093–0.141 on macOS, 0.4134 on a
 * Linux runner). "Noto Sans JP Fallback" is that next font, bent to Noto Sans JP's metrics. These
 * are the static halves of the contract; `check:font-fallback-metrics` measures the rendered half.
 */
describe("metric-matched fallback for the swap window (issue #475)", () => {
  const fonts = stripComments(readFileSync(resolve(STYLES_DIR, "fonts.css"), "utf8"));
  const faces = [...fonts.matchAll(/@font-face\s*\{([^}]*)\}/g)]
    .map((m) => m[1])
    .filter((body) => body.includes('"Noto Sans JP Fallback"'));
  const descriptor = (body: string, name: string) =>
    body
      .match(new RegExp(`${name}:\\s*([^;]+);`))?.[1]
      .replace(/\s+/g, " ")
      .trim();
  const percent = (body: string, name: string) => {
    const value = descriptor(body, name);
    return value === undefined ? undefined : Number.parseFloat(value);
  };
  /** Japanese faces are the ones whose range carries the CJK Unified Ideographs block. */
  const isJapanese = (body: string) => /U\+4E00-9FFF/.test(descriptor(body, "unicode-range") ?? "");

  it("names the fallback directly after the brand face in both bundled stacks", () => {
    // Anywhere later and a platform face (Hiragino, WenQuanYi Zen Hei) paints the swap window.
    for (const token of ["--font-sans-base", "--font-sans-vi"]) {
      expect(winningDeclaration(fonts, token), token).toMatch(
        /^"Noto Sans JP", "Noto Sans JP Fallback",/,
      );
    }
  });

  it("declares a Latin and a Japanese face for each bundled weight, from local fonts only", () => {
    const weights = (japanese: boolean) =>
      faces
        .filter((body) => isJapanese(body) === japanese)
        .map((body) => descriptor(body, "font-weight"))
        .sort();
    // Mirrors the @fontsource imports above, so a requested weight resolves the same way.
    expect(weights(false)).toEqual(["400", "500", "700"]);
    expect(weights(true)).toEqual(["400", "500", "700"]);
    for (const body of faces) {
      expect(descriptor(body, "src")).toMatch(/^local\(/);
      expect(body).not.toMatch(/url\(/);
    }
  });

  it("restates Noto Sans JP's vertical metrics on every face", () => {
    // Noto Sans JP: hhea = OS/2 win = 1160 / 288 / 0 per 1000 upm, USE_TYPO_METRICS off. The
    // browser scales the overrides by size-adjust as well, so the product is what must hold.
    for (const body of faces) {
      const scale = (percent(body, "size-adjust") ?? 100) / 100;
      expect((percent(body, "ascent-override") ?? Number.NaN) * scale).toBeCloseTo(116, 1);
      expect((percent(body, "descent-override") ?? Number.NaN) * scale).toBeCloseTo(28.8, 1);
      expect(percent(body, "line-gap-override")).toBe(0);
    }
  });

  it("scales the Latin faces and never the Japanese ones", () => {
    // Kana, kanji and full-width punctuation are 1em in Noto Sans JP and in every local gothic
    // face named here — any size-adjust on them would move every line of Japanese.
    for (const body of faces) {
      if (isJapanese(body)) expect(descriptor(body, "size-adjust")).toBeUndefined();
      else expect(percent(body, "size-adjust")).toBeGreaterThan(100);
    }
  });
});
