import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Issue #535 — the font budget of each CSS entry, as a number a consumer can grep for.
 *
 * `@godxjp/ui/styles` bundles 737 woff2 subsets (~13 MB on a consumer build, 7× its JS). The way
 * out is `styles/core`, and what makes that way out TRUSTWORTHY is one command:
 *
 *     grep -c '@font-face' node_modules/@godxjp/ui/dist/styles/core.css   # 0
 *
 * A consumer who then wants the metric-matched swap-window fallbacks (issue #475) — six faces
 * whose `src` is `local()`-only, so they download nothing — takes the THIRD entry,
 * `styles/core-with-fallbacks`, rather than having them folded into `core`. Folding would have
 * turned that 0 into a 6 and broken a promise the consumer can measure, for zero bytes saved.
 *
 * These tests pin both numbers, on both sides of that decision.
 */

/** Vitest runs with the repo root as cwd (see vitest.config.ts `root`). */
const STYLES_DIR = resolve(process.cwd(), "src/styles");

const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");

/**
 * Inline every RELATIVE `@import` in source order, depth-first — what a bundler or the browser
 * actually linearises. Bare specifiers (`tailwindcss`, `@fontsource/*`, `sonner/*`) are
 * node_modules assets and stay as markers, which is exactly what the @fontsource assertions read.
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

const faceBodies = (css: string) => [...css.matchAll(/@font-face\s*\{([^}]*)\}/g)].map((m) => m[1]);

/** The LAST `--font-sans-base` in the flattened cascade — the declaration that actually wins. */
const winningFontStack = (css: string) =>
  [...css.matchAll(/--font-sans-base:\s*([^;}]+)/g)].at(-1)?.[1].replace(/\s+/g, " ").trim();

describe("the @font-face budget of each styles entry (issue #535)", () => {
  it("keeps core.css itself at ZERO @font-face — the number consumers grep", () => {
    // The RAW file, not the flattened graph: `grep -c '@font-face' …/dist/styles/core.css` is the
    // command the escape hatch is sold on, and it reads exactly one file with no CSS parsing.
    const core = stripComments(readFileSync(resolve(STYLES_DIR, "core.css"), "utf8"));
    expect(core.match(/@font-face/g) ?? []).toHaveLength(0);
  });

  // The promise is about the PACKED file, and `grep` cannot tell a rule from a comment: the source
  // header EXPLAINS the zero, which costs the literal string twice. `scripts/copy-styles.mjs`
  // strips comments on the way into `dist`, so the shipped file a consumer greps really is 0 —
  // measured here rather than assumed, because a build that stopped stripping would be invisible.
  it.skipIf(!existsSync(resolve(process.cwd(), "dist/styles/core.css")))(
    "ships a dist/styles/core.css whose RAW text contains @font-face zero times",
    () => {
      const built = readFileSync(resolve(process.cwd(), "dist/styles/core.css"), "utf8");
      expect(built.match(/@font-face/g) ?? []).toHaveLength(0);
    },
  );

  it("keeps the whole core cascade at ZERO @font-face and zero bundled subsets", () => {
    // Stronger than the grep: no layer core pulls in may smuggle a face back either.
    const core = flatten(resolve(STYLES_DIR, "core.css"));
    expect(faceBodies(core)).toHaveLength(0);
    expect(core).not.toContain("@fontsource/");
  });

  it("gives core-with-fallbacks the six local()-only faces and NOT ONE woff2 subset", () => {
    const entry = flatten(resolve(STYLES_DIR, "core-with-fallbacks.css"));
    const faces = faceBodies(entry);

    expect(faces).toHaveLength(6);
    for (const body of faces) {
      expect(body).toContain('"Noto Sans JP Fallback"');
      // `local()`-only is the entire reason this entry is free: no `url()` means no request.
      expect(body).toMatch(/src:\s*local\(/);
      expect(body).not.toMatch(/url\(/);
    }
    // The bundled subsets are what #535 is about — this entry must not reach them by any path.
    expect(entry).not.toContain("@fontsource/");
    expect(entry).not.toMatch(/url\([^)]*\.woff2?/);
  });

  it("adds faces to core and nothing else — same layers, same order, no token grab", () => {
    const core = flatten(resolve(STYLES_DIR, "core.css"));
    const entry = flatten(resolve(STYLES_DIR, "core-with-fallbacks.css"));

    // Everything core says, core-with-fallbacks says, unchanged: it is core + an @import.
    expect(entry.trim().startsWith(core.trim())).toBe(true);
    // It must NOT claim a brand face: `core` ships none, so naming one in --font-sans-base would
    // point the cascade at a family the entry does not deliver. The token that wins has to be the
    // same font-agnostic system stack `core` already resolves to — unlike `styles`, which
    // deliberately overwrites it with "Noto Sans JP".
    expect(winningFontStack(entry)).toBe(winningFontStack(core));
    expect(winningFontStack(entry)).not.toContain("Noto Sans JP");
  });

  it("carries the SAME faces the bundled entry does — one source, no drifting copy", () => {
    // Both entries `@import "./font-fallbacks.css"`. If someone ever re-inlines a copy into one of
    // them, the metric numbers start drifting and only `check:font-fallback-metrics` (a browser
    // gate) would notice — months later.
    const bundled = faceBodies(flatten(resolve(STYLES_DIR, "fonts.css")));
    const entry = faceBodies(flatten(resolve(STYLES_DIR, "core-with-fallbacks.css")));
    expect(entry).toEqual(bundled);
  });

  it("exports the entry under its own subpath, not only the wildcard", () => {
    const manifest = JSON.parse(readFileSync(resolve(process.cwd(), "package.json"), "utf8"));
    expect(manifest.exports["./styles/core-with-fallbacks"]).toBe(
      "./dist/styles/core-with-fallbacks.css",
    );
    expect(manifest.exports["./styles/core"]).toBe("./dist/styles/core.css");
  });
});
