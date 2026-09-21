/**
 * The four defects that motivated `check:frame-token-scope`, as fixtures.
 *
 * A gate that cannot reproduce the defects it was built for is not finished, and none of these
 * four can be re-created on the live stylesheet any more — three are repaired and the fourth would
 * mean re-breaking the type ramp. So each one is fed to the gate's STATIC half (`analyse`) as the
 * synthetic stylesheet it was, and the assertion is that the gate names it.
 *
 * The browser half is what turns `analyse`'s candidate into a verdict; these prove the candidate
 * is produced at all, which is the part a regression would silently remove. `analyse` is imported
 * from the gate itself rather than re-implemented, so a filter that stops catching one of these
 * turns this suite red.
 *
 *   1. gh#687 — `--ring` read through a `:root` intermediate. Every focus ring stayed on the old
 *      brand when a scope re-seeded `--primary`.
 *   2. gh#—   — `--control-surface-*` bound to `--background` / `--input` at `:root`. A `Select`
 *      inside a `.dark` subtree painted 1.05:1.
 *   3. gh#834 — the whole `--font-size-*` ramp frozen on `--font-size-display` / `--font-size-base`.
 *   4. gh#835 — `--space-inline-xl` declared only inside `.ui-scale-fixed`, so `Flex gap="xl"`
 *      painted `gap: normal`.
 */
import { describe, expect, it } from "vitest";

// @ts-expect-error — plain ESM script without a declaration file
import { analyse } from "../../../scripts/check-frame-token-scope.mjs";

/** The tier context every fixture needs: the seeds have to exist at `:root` to BE seeds. */
const ROOT_TIER = `
:root {
  --primary: 268 100% 34.5%;
  --background: 60 33% 99%;
  --card: 60 33% 99%;
  --input: 30 7% 93%;
  --ring: var(--primary);
  --focus-ring-color: initial;
  --font-size-base: 0.875rem;
  --font-size-ratio: 1.1227;
  --font-size-display: 3.375rem;
  --radius: 0.375rem;
  --scaling: 1;
  --space-6: calc(1.5rem * var(--scaling));
}
.dark, :root[data-theme="dark"] {
  --background: 48 9% 9%;
  --input: 48 8% 20%;
}
`;

/* The tier above is itself a (deliberately faithful) stylesheet — `--ring: var(--primary)` is the
 * one declared exception gh#687 left behind, and `--space-6` reads `--scaling`. Both helpers
 * subtract what the tier alone reports, so every assertion below is about the FIXTURE. */
const rawFreeze = (css: string, componentTier: string[] = []) =>
  analyse(ROOT_TIER + css, new Set(componentTier)).edges.map(
    (e: { token: string; seed: string }) => `${e.token} ← ${e.seed}`,
  );
const rawReach = (css: string) =>
  [...analyse(ROOT_TIER + css).candidates.values()].map(
    (c: { prop: string; token: string; selector: string }) =>
      `${c.prop} · ${c.token} · ${c.selector}`,
  );

const TIER_FREEZE = new Set(rawFreeze(""));
const TIER_REACH = new Set(rawReach(""));

const freeze = (css: string, componentTier: string[] = []) =>
  rawFreeze(css, componentTier).filter((e: string) => !TIER_FREEZE.has(e));
const reach = (css: string) => rawReach(css).filter((c: string) => !TIER_REACH.has(c));

describe("check:frame-token-scope reproduces the four defects it was built for", () => {
  it("1 · gh#687 — a focus outline bound to --ring on :root (every ring stayed on the old brand)", () => {
    const defect = `:root { --focus-outline-color: var(--focus-ring-color, var(--ring)); }`;
    expect(freeze(defect)).toContain("--focus-outline-color ← --ring");

    /* The repair docs/TOKENS.md prescribes, and the gate must fall silent on it. */
    const repaired = `
      :root { --focus-outline-color: initial; }
      .ui-x:focus-visible { outline-color: hsl(var(--focus-outline-color, var(--focus-ring-color, var(--ring)))); }
    `;
    expect(freeze(repaired)).not.toContain("--focus-outline-color ← --ring");
  });

  it("2 · a control surface bound to --background / --input on :root (Select at 1.05:1 in .dark)", () => {
    const defect = `
      :root {
        --control-surface-background: var(--background);
        --control-surface-border-color: var(--input);
        --control-filled-background: var(--background);
      }
    `;
    /* A COMPONENT-tier token still reports, because the seed is a colour: that is the clause the
     * `.dark` subtree defect turns on, and the one thing the tier filter may never swallow. */
    const tier = [
      "--control-surface-background",
      "--control-surface-border-color",
      "--control-filled-background",
    ];
    expect(freeze(defect, tier)).toEqual(
      expect.arrayContaining([
        "--control-surface-background ← --background",
        "--control-surface-border-color ← --input",
        "--control-filled-background ← --background",
      ]),
    );
  });

  it("3 · gh#834 — the type ramp deriving its steps at :root", () => {
    const defect = `
      :root {
        --font-size-5xl: var(--font-size-display);
        --font-size-4xl: calc(var(--font-size-display) / var(--font-size-display-ratio));
        --font-size-lg: calc(var(--font-size-base) * var(--font-size-ratio) * var(--font-size-ratio));
        --font-size-sm: var(--font-size-base);
      }
    `;
    expect(freeze(defect)).toEqual(
      expect.arrayContaining([
        "--font-size-5xl ← --font-size-display",
        "--font-size-4xl ← --font-size-display",
        "--font-size-lg ← --font-size-base",
        "--font-size-sm ← --font-size-base",
      ]),
    );

    /* The shape that shipped: `initial` at the tier, the formula at the call site. */
    const repaired = `
      :root { --font-size-5xl: initial; --font-size-sm: initial; }
      [data-slot="text"][data-size="5xl"] { font-size: var(--font-size-5xl, var(--font-size-display)); }
      [data-slot="text"][data-size="sm"] { font-size: var(--font-size-sm, var(--font-size-base)); }
    `;
    expect(freeze(repaired)).toEqual([]);
  });

  it("4 · gh#835 — a gap step declared only inside .ui-scale-fixed", () => {
    const defect = `
      .ui-scale-fixed { --space-inline-xl: var(--space-6); }
      .ui-flex[data-direction="row"].ui-flex-gap-xl { gap: var(--space-inline-xl); }
    `;
    expect(reach(defect)).toContain(
      'gap · --space-inline-xl · .ui-flex[data-direction="row"].ui-flex-gap-xl',
    );

    /* Declared at the tier its readers live in — the fix that shipped. */
    const repaired = `
      :root { --space-inline-xl: var(--space-6); }
      .ui-flex[data-direction="row"].ui-flex-gap-xl { gap: var(--space-inline-xl); }
    `;
    expect(reach(repaired)).toEqual([]);
  });

  it("REACH also catches the half-applied cure — an `initial` knob still read BARE", () => {
    /* The likeliest way to ship gh#834 again: declare the knob `initial` and forget one reader.
     * A bare read of an empty knob paints nothing at all, silently and totally. */
    const halfDone = `
      :root { --font-size-5xl: initial; }
      .ui-hero-title { font-size: var(--font-size-5xl); }
    `;
    expect(reach(halfDone)).toContain("font-size · --font-size-5xl · .ui-hero-title");
  });

  it("does NOT report the documented `initial` + call-site-fallback shape as a defect", () => {
    const correct = `
      :root { --card-background: initial; }
      .ui-card { background: hsl(var(--card-background, var(--card))); }
    `;
    expect(reach(correct)).toEqual([]);
    expect(freeze(correct)).toEqual([]);
  });

  it("does NOT report a tier that re-states itself wherever it re-states the seed", () => {
    /* `.ui-density-comfortable` flips `--scaling` AND re-derives the whole linear grid on the same
     * selector. Without this clause the gate reported the repair as the defect thirty times. */
    const density = `
      .ui-density-comfortable, :root[data-density="comfortable"] { --scaling: 1.08; }
      .ui-density-compact, .ui-density-default, .ui-density-comfortable { --space-6: calc(1.5rem * var(--scaling)); }
    `;
    expect(freeze(density)).not.toContain("--space-6 ← --scaling");
  });
});
