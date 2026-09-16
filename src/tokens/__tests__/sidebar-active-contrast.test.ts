import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { contrast, hsl, hslToRgb, over } from "./wcag-contrast";

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
 * that warns you where 4.5:1 is. Measured on HEAD (GoDX violet #7a00ff / #dcbcff, identity v2.3,
 * derived tier as of gh#648), label against the composited fill:
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
 * SURFACES are checked the thorough way, the way `input-boundary-contrast` argues for: a value
 * that passes on the sidebar and fails on a page-level `NavList` is not a line anyone can defend.
 * `.app-sidebar` paints `hsl(var(--card))`; a bare `.ui-nav-list` sits on `hsl(var(--background))`.
 */

const AA_TEXT = 4.5;

/** The alpha ceiling the tier commits to. Raising `--sidebar-item-active-background-alpha` past
 *  this turns the last two describes red — which is the whole point of the number. */
const CEILING = 0.16;

const foundation = readFileSync(join(process.cwd(), "src/tokens/foundation.css"), "utf8");
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
  const start = source.indexOf(selector);
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

const THEMES = [
  { theme: "light", selector: ":root {" },
  { theme: "dark", selector: '.dark,\n:root[data-theme="dark"] {' },
] as const;

/** The grounds the shipped shell puts an active nav row on. */
const SURFACES = ["card", "background"] as const;

/** Every ratio above, pinned — so a palette move lands HERE and not in a consumer's axe run. */
const MEASURED: Record<string, Record<string, { shipped: number; atCeiling: number }>> = {
  light: {
    card: { shipped: 5.07, atCeiling: 4.69 },
    background: { shipped: 5.07, atCeiling: 4.69 },
  },
  dark: {
    card: { shipped: 7.51, atCeiling: 6.78 },
    background: { shipped: 8.3, atCeiling: 7.49 },
  },
};

/* ────────────────────────────────────────────────────────────────────────────
 * 1. ONE NAME, ONE LOOK — and still a knob.
 * ──────────────────────────────────────────────────────────────────────────── */
describe("both nav levels signal `open` in one colour language", () => {
  it("level 1 and level 2 read the SAME label knob", () => {
    expect(rule('.sb-nav-item[data-active="true"]')).toContain(
      "color: var(--sidebar-item-active-foreground, hsl(var(--primary)))",
    );
    expect(rule('.sb-nav-item--sub[data-active="true"]')).toContain(
      "color: var(--sidebar-item-active-foreground, hsl(var(--primary)))",
    );
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
 * 2. THE SHIPPED TINT, MEASURED.
 * ──────────────────────────────────────────────────────────────────────────── */
describe.each(THEMES)("the open row keeps its label at AA ($theme)", ({ theme, selector }) => {
  const body = block(foundation, selector);
  const label = hslToRgb(hsl(body, "primary"));
  const alpha = shippedAlpha();

  it.each(SURFACES)("on hsl(var(--%s))", (surface) => {
    const ground = hslToRgb(hsl(body, surface));
    const ratio = contrast(label, over(label, ground, alpha));

    expect(ratio).toBeGreaterThanOrEqual(AA_TEXT);
    expect(round2(ratio), `label on the tint at alpha ${alpha}`).toBe(
      MEASURED[theme][surface].shipped,
    );
  });
});

/* ────────────────────────────────────────────────────────────────────────────
 * 3. THE CEILING, AND THE HEADROOM UNDER IT.
 * ──────────────────────────────────────────────────────────────────────────── */
describe("the tint strength has a ceiling and stays under it", () => {
  it("ships at or below the cap", () => {
    expect(shippedAlpha()).toBeLessThanOrEqual(CEILING);
  });

  it.each(THEMES)("the cap itself is still AA in every surface ($theme)", ({ theme, selector }) => {
    const body = block(foundation, selector);
    const label = hslToRgb(hsl(body, "primary"));

    for (const surface of SURFACES) {
      const ground = hslToRgb(hsl(body, surface));
      const ratio = contrast(label, over(label, ground, CEILING));

      expect(ratio, `${surface} at the ${CEILING} cap`).toBeGreaterThanOrEqual(AA_TEXT);
      expect(round2(ratio)).toBe(MEASURED[theme][surface].atCeiling);
    }
  });

  it("the cap is a cap WITH headroom — the real cliff is above it, not at it", () => {
    // Walks the alpha up per surface and finds the first step whose label drops under 4.5:1. If a
    // future palette (or a raised cap) brings that step down to the cap, this is where it lands —
    // a cap that sits ON the cliff is a cap that fails the moment anyone rounds up.
    let cliff = Number.POSITIVE_INFINITY;
    for (const { selector } of THEMES) {
      const body = block(foundation, selector);
      const label = hslToRgb(hsl(body, "primary"));
      for (const surface of SURFACES) {
        const ground = hslToRgb(hsl(body, surface));
        for (let a = 0.01; a <= 1.0001; a += 0.01) {
          const step = round2(a);
          if (contrast(label, over(label, ground, step)) < AA_TEXT) {
            cliff = Math.min(cliff, step);
            break;
          }
        }
      }
    }
    // Measured today: 0.19 (light, both shipped surfaces).
    expect(cliff, `first alpha under AA on a shipped surface: ${cliff}`).toBeGreaterThan(CEILING);
  });
});
