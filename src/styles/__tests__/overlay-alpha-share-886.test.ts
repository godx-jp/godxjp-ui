import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * gh#886 — `--dialog-overlay-alpha: 62%` produced a scrim alpha of 0.31, not 0.62.
 *
 * WHAT THE AUDIT FOUND, AND WHY THE ANSWER IS A CONVENTION RATHER THAN A RENAME. Of 42 `--*-alpha`
 * knobs in this library, 24 drive a plain `opacity` and 11 sit after the slash in
 * `hsl(<triple> / <alpha>)` — a channel triple is opaque, so in both shapes the knob IS the
 * resulting alpha. Only 7 use the `color-mix(in srgb, <base> <alpha>, transparent)` SHARE form, and
 * FOUR of those compose with a base that already carries an alpha of its own:
 *
 *   --dialog-overlay-alpha        60% of rgb(0 0 0 / 0.5)        → 0.30
 *   --sheet-overlay-alpha         40% of rgb(0 0 0 / 0.5)        → 0.20
 *   --app-shell-mobile-nav-alpha  40% of rgb(0 0 0 / 0.5)        → 0.20
 *   --table-row-striped-alpha     n% of hsl(var(--muted) / 0.8)  → n × 0.8
 *
 * Four is a convention, not a one-off — which decides the three ways out the issue lists:
 *
 *   MAKE THE BASE OPAQUE — no. `--overlay-background` is one finished colour, with its calibrated
 *   depth, shared by Dialog, AlertDialog, Sheet, Drawer and the AppShell mobile nav precisely so a
 *   service retints every scrim with one line (src/tokens/semantic/layout.css). Opacifying it moves
 *   three shipped defaults at once and destroys the property the role exists for. It also does not
 *   generalise: the stripe's base is translucent ON PURPOSE, so a row tone can show through it.
 *
 *   RENAME — no, and not merely on deprecation cost: the name would still be wrong. These knobs ARE
 *   shares. `--table-row-striped-alpha: 0%` is the zebra OFF switch and `100%` means "the stripe as
 *   authored"; a name promising the resulting alpha cannot be honoured by a `color-mix` share
 *   without also owning the base.
 *
 *   DOCUMENT AT THE DECLARATION — yes, and this test is what keeps it from being the weak option.
 *   Two of the four already documented it this way and were never misread; the two that did not are
 *   exactly the two the reporter was misled by. The arithmetic is now stated at every one of them,
 *   and pinned here, so changing a default or the base alpha fails a test instead of going stale.
 */
const ROOT = process.cwd();
const CSS_DIRS = ["src/styles", "src/tokens", "src/tokens/semantic", "src/tokens/components"];

const files = CSS_DIRS.flatMap((dir) =>
  readdirSync(resolve(ROOT, dir))
    .filter((f) => f.endsWith(".css"))
    .map((f) => join(dir, f)),
);
const css = new Map(files.map((f) => [f, readFileSync(resolve(ROOT, f), "utf8")]));

/** Tier files first: a knob's authoritative declaration and its note live in `src/tokens`, never in
 * a per-instance override inside `src/styles` (`[data-striped=""]` sets the zebra switch to 100%). */
const tierFirst = [...css].sort(
  (a, b) => Number(b[0].startsWith("src/tokens")) - Number(a[0].startsWith("src/tokens")),
);

/** First declaration of a custom property anywhere in the tier files. */
function declarationOf(name: string): { file: string; value: string } | null {
  for (const [file, text] of tierFirst) {
    const m = text.match(new RegExp(`^\\s*${name}:\\s*([^;]+);`, "m"));
    if (m) return { file, value: m[1].trim() };
  }
  return null;
}

/** The alpha a colour literal carries, or null when it is opaque / a bare channel triple. */
function alphaOf(value: string): number | null {
  const m = value.match(/\/\s*(0?\.\d+|\d+(?:\.\d+)?%)/);
  if (!m) return null;
  return m[1].endsWith("%") ? Number.parseFloat(m[1]) / 100 : Number.parseFloat(m[1]);
}

/** Every `color-mix(in srgb, <base> var(--x-alpha), …)` share-form call site in the shipped CSS. */
const shareSites = [...css].flatMap(([file, text]) =>
  file.startsWith("src/styles")
    ? [
        ...text.matchAll(
          // `[^;{}]` keeps the base inside ONE declaration: a lazy `[\s\S]` ran from a share form
          // with a literal percentage 220 lines forward to the next `-alpha` knob and mis-classified
          // it. Commas and newlines are allowed, because a base may be `var(--x, hsl(… / .8))`.
          /color-mix\(\s*in srgb,\s*([^;{}]+?)\s+var\((--[a-z0-9-]*-alpha)\)\s*,/g,
        ),
      ].map((m) => ({ file, base: m[1].trim(), knob: m[2] }))
    : [],
);

/** Resolve the base expression to the colour it actually composites, alpha included. */
function baseValue(base: string): string {
  const withFallback = base.match(/^var\(\s*(--[a-z0-9-]+),\s*([\s\S]+)\)$/);
  if (withFallback) return withFallback[2].trim();
  const plain = base.match(/^var\(\s*(--[a-z0-9-]+)\)$/);
  if (plain) return declarationOf(plain[1])?.value ?? "(undeclared)";
  return base;
}

/** The comment block a knob's declaration carries, which is where the convention has to be stated. */
function declarationNote(knob: string): string {
  for (const [, text] of tierFirst) {
    const at = text.search(new RegExp(`^\\s*${knob}:\\s*[^;]+;`, "m"));
    if (at === -1) continue;
    const line = text.slice(at, text.indexOf("\n", at + 1) + 1);
    return text.slice(Math.max(0, at - 900), at) + line;
  }
  return "";
}

/** The four the audit found. A FIFTH appearing is the signal that the convention needs restating. */
const SHARE_OF_SHARE: Record<string, { baseAlpha: number; product?: number }> = {
  "--dialog-overlay-alpha": { baseAlpha: 0.5, product: 0.3 },
  "--sheet-overlay-alpha": { baseAlpha: 0.5, product: 0.2 },
  "--app-shell-mobile-nav-alpha": { baseAlpha: 0.5, product: 0.2 },
  // The zebra switch ships at 0%, so its interesting number is the base alpha, not the product.
  "--table-row-striped-alpha": { baseAlpha: 0.8 },
};

describe("gh#886 · `-alpha` knobs in the color-mix SHARE form", () => {
  it("finds the share-form call sites at all", () => {
    expect(shareSites.length).toBeGreaterThanOrEqual(5);
  });

  it("classifies exactly the four known share-of-a-share knobs — a fifth needs a decision", () => {
    // Completeness is the whole value of this test. A new knob composed over a translucent base is
    // a new instance of the defect the reporter hit, and it must not land silently.
    const found = new Set(
      shareSites.filter((s) => alphaOf(baseValue(s.base)) !== null).map((s) => s.knob),
    );
    expect([...found].sort()).toEqual(Object.keys(SHARE_OF_SHARE).sort());
  });

  for (const [knob, expected] of Object.entries(SHARE_OF_SHARE)) {
    describe(knob, () => {
      const site = shareSites.find((s) => s.knob === knob)!;

      it("still composites over a base carrying the alpha this test was written against", () => {
        expect(site).toBeDefined();
        expect(alphaOf(baseValue(site.base))).toBe(expected.baseAlpha);
      });

      it("states at its own declaration that it is a SHARE, not the resulting alpha", () => {
        const note = declarationNote(knob);
        expect(note).toMatch(/SHARE/);
        expect(note).toMatch(/gh#886/);
      });

      it("spells the arithmetic out next to the default, so the surprise cannot recur", () => {
        const note = declarationNote(knob);
        const declared = declarationOf(knob)!.value;
        const percent = Number.parseFloat(declared);
        const product = expected.product;
        if (product !== undefined) {
          // The default has to still BE the number the note claims — this is the line that fails
          // when someone retunes a scrim and leaves the comment behind.
          expect(percent / 100).toBeCloseTo(product / expected.baseAlpha, 5);
          expect(note).toContain(product.toFixed(2));
        } else {
          expect(note).toContain(String(expected.baseAlpha));
        }
      });
    });
  }

  it("leaves the opaque-base share knobs alone — they mean exactly what they say", () => {
    const opaque = shareSites.filter((s) => alphaOf(baseValue(s.base)) === null).map((s) => s.knob);
    expect(opaque.length).toBeGreaterThan(0);
    for (const knob of opaque) expect(SHARE_OF_SHARE[knob]).toBeUndefined();
  });
});
