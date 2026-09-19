import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { anchorIndex } from "../../test/css-selector";

import { channelsOf, contrast, hsl, hslToRgb, over, relative, triplet } from "./wcag-contrast";

/**
 * THE OPEN NAV ROW IS A BRAND TINT NOW, AND A TINT HAS A CEILING.
 *
 * Until gh#651 the two levels of one nav column signalled the same meaning in two colour
 * languages: `.sb-nav-item[data-active="true"]` painted `hsl(var(--accent))` grey with an
 * `hsl(var(--foreground))` label, while `.sb-nav-item--sub[data-active="true"]` a hundred lines
 * below painted `hsl(var(--primary))`. The open CHILD read as branded and its open PARENT read as
 * grey. Both defaults are the brand now — a DEFAULT change, not a hardcode, so the first cases
 * here assert that every knob still overrides.
 *
 * WHY THIS FILE EXISTS RATHER THAN A NUMBER IN A COMMENT. The label rides ON the fill, and the
 * fill is that same label colour composited over the ground: raise the alpha and the two walk
 * towards each other, so the contrast that WCAG 2.2 SC 1.4.3 governs falls monotonically with the
 * one knob a service is most likely to reach for. There is nothing in "tint the row a bit more"
 * that warns you where 4.5:1 is. Measured at gh#651 (GoDX violet #7a00ff / #dcbcff, identity v2.3,
 * derived tier as of gh#648, label `--primary`), label against the composited fill:
 *
 *   alpha   light            dark on --card   dark on --background
 *   0.12    5.07:1           7.51:1           8.30:1     ← shipped
 *   0.16    4.69:1           6.78:1           7.49:1     ← the declared cap
 *   0.18    4.51:1           6.44:1           7.11:1     ← last passing step, light
 *   0.19    4.42:1                                       ← under SC 1.4.3
 *
 * So 16% is a cap WITH HEADROOM, not the cliff edge, and the last case below is what makes that
 * claim testable: it walks the alpha up and asserts the cliff is strictly above the cap. Publishing
 * 18% instead was rejected — it is the true floor only for the two surfaces we ship, and a service
 * that moves the nav onto `hsl(var(--muted))` has just 13% before the label fails.
 *
 * The reporter's own DOM readings on the consuming app were 5.05:1 light (#7a00ff on #eddffc) and
 * 8.30:1 dark (#dcbcff on #302c31); paper maths reproduces the second exactly and the first to the
 * last decimal, which is admissible here for the reason `status-fill-contrast` records — the row
 * paints one `color-mix` flat with its label directly on top and nothing composites in between.
 *
 * THE LABEL IS THE ACTIVE TIER NOW, NOT `--primary` (gh#678). Every number above was measured on
 * OUR seed, and so was every assertion this file used to make. A consuming app's axe sweep on its
 * own seeds found the label under SC 1.4.3: 4.25:1 for `204 100% 37%`, 4.00:1 for `173 80% 28%`,
 * 4.15:1 for a dark `262 83% 70%` — `--primary` on a tint of itself is only as legible as the seed
 * happens to be. The default label is now `--primary-active` derived from the live `--primary`: it
 * steps AWAY from the ground in both themes, and over a dense grid of seeds it never lands under
 * 4.5:1 for any seed that is legible as text on that ground to begin with. The ones that are not
 * are a NAMED exception below, asserted rather than skipped. The table above is the history; the
 * shipped numbers are in MEASURED.
 *
 * SURFACES are checked the thorough way, the way `input-boundary-contrast` argues for: a value
 * that passes on the sidebar and fails on a page-level `NavList` is not a line anyone can defend.
 * `.app-sidebar` paints `hsl(var(--card))`; a bare `.ui-nav-list` sits on `hsl(var(--background))`.
 */

const AA_TEXT = 4.5;

/** The alpha ceiling the tier commits to. Raising `--sidebar-item-active-background-alpha` past
 *  this turns the ceiling describes red — which is the whole point of the number. */
const CEILING = 0.16;

const foundation = readFileSync(join(process.cwd(), "src/tokens/foundation.css"), "utf8");
const derived = readFileSync(join(process.cwd(), "src/tokens/derived.css"), "utf8");
const shellTokens = readFileSync(join(process.cwd(), "src/tokens/components/shell.css"), "utf8");
const shellLayout = readFileSync(join(process.cwd(), "src/styles/shell-layout.css"), "utf8");

/**
 * What the BROWSER sees: comments gone, run of whitespace collapsed.
 *
 * Both halves earn their place. The comment strip is why "the old name is gone" can be asserted at
 * all — the explainer that records the rename names the retired token, and a raw `not.toContain`
 * reads that prose as a live declaration. The whitespace collapse is because Prettier wraps a long
 * `var(--knob, color-mix(…))` across six lines, so a fallback pinned by its source spelling breaks
 * on a reformat that changed nothing.
 */
const flat = (source: string) =>
  source
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/\s+/g, " ")
    .replace(/\( /g, "(")
    .replace(/ \)/g, ")");
const shellTokenCode = flat(shellTokens);
const shellLayoutCode = flat(shellLayout);

/** Extract a flat `selector { ... }` block body (token blocks have no nested braces). */
function block(source: string, selector: string): string {
  const start = anchorIndex(source, selector);
  if (start === -1) throw new Error(`selector not found: ${selector}`);
  const open = source.indexOf("{", start);
  return source.slice(open + 1, source.indexOf("\n}", open));
}

/** A rule body from shell-layout.css, as the browser sees it. */
function rule(selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = shellLayoutCode.match(new RegExp(`(?:^| )${escaped} \\{([^}]*)\\}`));
  if (!match) throw new Error(`rule not found: ${selector}`);
  return match[1];
}

/** The shipped tint strength, read from the tier as a fraction (`12%` → 0.12). */
function shippedAlpha(): number {
  const m = shellTokens.match(/--sidebar-item-active-background-alpha:\s*([\d.]+)%\s*;/);
  if (!m)
    throw new Error("--sidebar-item-active-background-alpha must be declared as a percentage");
  return Number(m[1]) / 100;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

type Rgb = [number, number, number];
type Hsl = [number, number, number];

const THEMES = [
  { theme: "light", selector: ":root {" },
  { theme: "dark", selector: '.dark, :root[data-theme="dark"] {' },
].map((t) => ({
  ...t,
  body: block(foundation, t.selector),
  /** The default label for a seed: `--primary-active`, derived as the call site derives it. */
  label: (seed: Hsl): Rgb =>
    hslToRgb(
      relative(
        seed,
        channelsOf("primary-active", block(derived, t.selector), block(derived, ":root {")),
      ),
    ),
}));

/** The grounds the shipped shell puts an active nav row on. */
const SURFACES = ["card", "background"] as const;

/** Label on the composited tint, for one seed on one ground. */
const onTint = (theme: (typeof THEMES)[number], seed: Hsl, ground: Rgb, alpha: number) =>
  contrast(theme.label(seed), over(hslToRgb(seed), ground, alpha));

/** Every ratio for the package seed, pinned — so a palette move lands HERE, not in an axe run. */
const MEASURED: Record<string, Record<string, { shipped: number; atCeiling: number }>> = {
  light: {
    card: { shipped: 8.26, atCeiling: 7.65 },
    background: { shipped: 8.26, atCeiling: 7.65 },
  },
  dark: {
    card: { shipped: 5.89, atCeiling: 5.32 },
    background: { shipped: 6.51, atCeiling: 5.88 },
  },
};

/* ────────────────────────────────────────────────────────────────────────────
 * 1. ONE NAME, ONE LOOK — and still a knob.
 * ──────────────────────────────────────────────────────────────────────────── */
describe("both nav levels signal `open` in one colour language", () => {
  const LABEL =
    "color: var(--sidebar-item-active-foreground, hsl(var(--primary-active, from hsl(var(--primary)) var(--primary-active-channels))))";

  it("level 1 and level 2 read the SAME label knob, with the SAME live default", () => {
    expect(rule('.sb-nav-item[data-active="true"]')).toContain(LABEL);
    expect(rule('.sb-nav-item--sub[data-active="true"]')).toContain(LABEL);
  });

  it("the second name for that one thing is gone, tier and call site", () => {
    // `--sidebar-item-active-color` was the level-2 spelling of `-foreground`, used exactly once.
    // Two names for one role is what sent a service hunting for the second one.
    expect(shellLayoutCode).not.toContain("--sidebar-item-active-color");
    expect(shellTokenCode).not.toContain("--sidebar-item-active-color");
  });

  it("the level-1 fill is a `--primary` tint, not the neutral `--accent` it used to be", () => {
    const active = rule('.sb-nav-item[data-active="true"]');
    expect(active).toContain(
      "background: var(--sidebar-item-active-background, color-mix(in srgb, " +
        "hsl(var(--primary)) var(--sidebar-item-active-background-alpha), transparent));",
    );
    // `--accent` is the HOVER fill and must stay that and only that, or the two states collapse.
    expect(active).not.toContain("--accent");
    expect(rule(".sb-nav-item:hover")).toContain("background: hsl(var(--accent));");
  });

  it("every default sits behind a knob, so a service can still have the grey back", () => {
    for (const knob of [
      "--sidebar-item-active-background",
      "--sidebar-item-active-foreground",
      "--sidebar-item-active-tint",
    ]) {
      // Role-mirror: `initial` at :root with the role resolved at the call site, so a scoped
      // `[data-tenant]` / `.dark` re-tint of --primary reaches it (docs/TOKENS.md).
      expect(shellTokenCode).toContain(`${knob}: initial;`);
      expect(shellLayoutCode).toContain(`var(${knob},`);
    }
  });

  it("neither level spells the weight as a literal — rule #45", () => {
    // `500` was hardcoded at level 2 while level 1 read the scale, so a service re-tuning
    // `--font-weight-medium` moved its parent rows and left its child rows behind.
    for (const selector of [
      '.sb-nav-item[data-active="true"]',
      '.sb-nav-item--sub[data-active="true"]',
    ]) {
      expect(rule(selector)).toContain("font-weight: var(--font-weight-medium);");
    }
  });
});

/* ────────────────────────────────────────────────────────────────────────────
 * 2. THE SHIPPED TINT, MEASURED ON OUR SEED.
 * ──────────────────────────────────────────────────────────────────────────── */
describe.each(THEMES)("the open row keeps its label at AA ($theme)", (theme) => {
  const seed = hsl(theme.body, "primary");
  const alpha = shippedAlpha();

  it.each(SURFACES)("on hsl(var(--%s))", (surface) => {
    const ratio = onTint(theme, seed, hslToRgb(hsl(theme.body, surface)), alpha);
    expect(ratio).toBeGreaterThanOrEqual(AA_TEXT);
    expect(round2(ratio), `label on the tint at alpha ${alpha}`).toBe(
      MEASURED[theme.theme][surface].shipped,
    );
  });
});

/* ────────────────────────────────────────────────────────────────────────────
 * 3. THE SAME ROW ON A CONSUMER'S SEED (gh#678).
 * ──────────────────────────────────────────────────────────────────────────── */

/** The seeds a consuming app measured under AA with the old `--primary` label, and the extremes. */
const SWEEP = [
  { theme: "light", seed: "204 100% 37%" },
  { theme: "light", seed: "173 80% 28%" },
  { theme: "dark", seed: "262 83% 70%" },
  { theme: "dark", seed: "204 90% 60%" },
  { theme: "light", seed: "230 60% 12%" },
  { theme: "dark", seed: "50 100% 92%" },
  { theme: "light", seed: "50 100% 92%" },
  { theme: "dark", seed: "230 60% 12%" },
] as const;

/**
 * NAMED EXCEPTION — A SEED THAT IS NOT LEGIBLE AS TEXT ON THE GROUND AT ALL. A pale yellow on the
 * light theme's near-white, a navy on the dark theme's near-black: the seed itself sits under 4.5:1
 * on the page, and one ramp step does not carry a colour across the whole lightness range. No
 * default is claimed for these; a service sets `--sidebar-item-active-foreground`. Asserted both
 * ways, so a seed cannot drift in or out of this set silently.
 */
const ILLEGIBLE_SEED = new Set(["light 50 100% 92%", "dark 230 60% 12%"]);

describe.each(SWEEP)("$theme $seed", ({ theme: themeName, seed: seedText }) => {
  const theme = THEMES.find((t) => t.theme === themeName)!;
  const seed = triplet(seedText);
  const key = `${themeName} ${seedText}`;

  it.each(SURFACES)("on hsl(var(--%s))", (surface) => {
    const ground = hslToRgb(hsl(theme.body, surface));
    const legible = contrast(hslToRgb(seed), ground) >= AA_TEXT;
    expect(legible, "a seed's membership in ILLEGIBLE_SEED is a measurement").toBe(
      !ILLEGIBLE_SEED.has(key),
    );
    if (legible) {
      expect(onTint(theme, seed, ground, shippedAlpha())).toBeGreaterThanOrEqual(AA_TEXT);
      // level 2 paints no tint — the label sits on the ground itself
      expect(contrast(theme.label(seed), ground)).toBeGreaterThanOrEqual(AA_TEXT);
    }
  });
});

/*
 * An explicit timeout, and why it hides nothing: this block sweeps a FINITE grid (72 hues × 6
 * saturations × 99 lightnesses, per surface) — pure arithmetic, so it cannot hang, only take time.
 * Measured ~1.2s locally and 8.3–12.8s on a loaded CI runner, against vitest's 8s default, which
 * failed the 26.1.0 release commit on runner load alone.
 */
describe("every legible seed on a dense grid keeps the label at AA", { timeout: 60_000 }, () => {
  /** 72 hues × 6 saturations × 99 lightnesses, per theme and surface. */
  const grid = function* (): Generator<Hsl> {
    for (let h = 0; h < 360; h += 5)
      for (const s of [0, 10, 25, 50, 75, 100]) for (let l = 1; l < 100; l += 1) yield [h, s, l];
  };

  it.each(THEMES)("$theme, at the shipped alpha", (theme) => {
    const failures: string[] = [];
    let checked = 0;
    for (const surface of SURFACES) {
      const ground = hslToRgb(hsl(theme.body, surface));
      for (const seed of grid()) {
        if (contrast(hslToRgb(seed), ground) < AA_TEXT) continue;
        checked += 1;
        const ratio = onTint(theme, seed, ground, shippedAlpha());
        if (ratio < AA_TEXT) failures.push(`${surface} ${seed.join(" ")} ${round2(ratio)}`);
      }
    }
    expect(checked).toBeGreaterThan(30000);
    expect(failures).toEqual([]);
  });

  it("NAMED EXCEPTION: the 16% ceiling is a guarantee for OUR seed only", () => {
    // At the cap a handful of legible dark-theme seeds dip under 4.5:1 on `--card` (measured: 4 of
    // ~21k, worst 4.27:1). The cap below is therefore asserted on the package seed; a service that
    // raises the tint on its own seed owns that measurement. If this ever reads zero, the cap has
    // become universal and this exception should be deleted rather than left to rot.
    const dark = THEMES[1];
    const ground = hslToRgb(hsl(dark.body, "card"));
    let under = 0;
    for (const seed of grid()) {
      if (contrast(hslToRgb(seed), ground) < AA_TEXT) continue;
      if (onTint(dark, seed, ground, CEILING) < AA_TEXT) under += 1;
    }
    expect(under).toBeGreaterThan(0);
  });
});

/* ────────────────────────────────────────────────────────────────────────────
 * 4. THE CEILING, AND THE HEADROOM UNDER IT — on our seed.
 * ──────────────────────────────────────────────────────────────────────────── */
describe("the tint strength has a ceiling and stays under it", () => {
  it("ships at or below the cap", () => {
    expect(shippedAlpha()).toBeLessThanOrEqual(CEILING);
  });

  it.each(THEMES)("the cap itself is still AA in every surface ($theme)", (theme) => {
    const seed = hsl(theme.body, "primary");
    for (const surface of SURFACES) {
      const ratio = onTint(theme, seed, hslToRgb(hsl(theme.body, surface)), CEILING);
      expect(ratio, `${surface} at the ${CEILING} cap`).toBeGreaterThanOrEqual(AA_TEXT);
      expect(round2(ratio)).toBe(MEASURED[theme.theme][surface].atCeiling);
    }
  });

  it("the cap is a cap WITH headroom — the real cliff is above it, not at it", () => {
    // Walks the alpha up per surface and finds the first step whose label drops under 4.5:1. If a
    // future palette (or a raised cap) brings that step down to the cap, this is where it lands —
    // a cap that sits ON the cliff is a cap that fails the moment anyone rounds up.
    let cliff = Number.POSITIVE_INFINITY;
    for (const theme of THEMES) {
      const seed = hsl(theme.body, "primary");
      for (const surface of SURFACES) {
        const ground = hslToRgb(hsl(theme.body, surface));
        for (let a = 0.01; a <= 1.0001; a += 0.01) {
          const step = round2(a);
          if (onTint(theme, seed, ground, step) < AA_TEXT) {
            cliff = Math.min(cliff, step);
            break;
          }
        }
      }
    }
    expect(cliff, `first alpha under AA on a shipped surface: ${cliff}`).toBeGreaterThan(CEILING);
  });
});
