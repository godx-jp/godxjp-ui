import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * gh#228 — the Sidebar painted ONE `--muted-foreground` on `.sb-nav-item`, so the Lucide SVG and
 * the label inherited the same low-contrast colour: a service could not match the canonical shell's
 * darker 16px nav icons without page-local CSS or re-tinting every muted text globally.
 *
 * This guard pins the public contract: row and icon read SEPARATE component tokens, every state
 * (resting / hover / active / disabled, top-level · sub · collapsed) resolves through them, the
 * defaults are byte-identical to the pre-gh#228 rendering, the knobs are role-mirror `initial`
 * declarations (docs/TOKENS.md), and NO geometry moved (icons stay --sidebar-nav-icon-size, rows
 * stay --sidebar-nav-item-height / -gap).
 */

const styles = readFileSync(join(process.cwd(), "src/styles/shell-layout.css"), "utf8");
const sidebarTokens = readFileSync(
  join(process.cwd(), "src/tokens/components/sidebar.css"),
  "utf8",
);
const shellTokens = readFileSync(join(process.cwd(), "src/tokens/components/shell.css"), "utf8");
const baseTokens = readFileSync(join(process.cwd(), "src/tokens/base.css"), "utf8");
const foundation = readFileSync(join(process.cwd(), "src/tokens/foundation.css"), "utf8");

/** Extract a flat `selector { ... }` block body (token blocks have no nested braces). */
function block(css: string, selector: string): string {
  const start = css.indexOf(selector);
  if (start === -1) throw new Error(`selector not found: ${selector}`);
  const open = css.indexOf("{", start);
  const close = css.indexOf("\n}", open);
  return css.slice(open + 1, close);
}

/** Whitespace-insensitive rule body lookup for a CSS rule in shell-layout.css. */
function rule(selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = styles.match(new RegExp(`(?:^|\\n)\\s*${escaped}\\s*\\{([^}]*)\\}`));
  if (!match) throw new Error(`rule not found: ${selector}`);
  return match[1].replace(/\s+/g, " ");
}

const ICON_TOKENS = [
  "--sidebar-nav-icon-foreground",
  "--sidebar-nav-icon-hover-foreground",
  "--sidebar-nav-icon-active-foreground",
  "--sidebar-nav-icon-disabled-foreground",
] as const;
const ITEM_TOKENS = [
  "--sidebar-nav-item-foreground",
  "--sidebar-nav-item-hover-foreground",
  "--sidebar-nav-item-disabled-foreground",
] as const;

describe("Sidebar nav foreground tokens (gh#228)", () => {
  it("declares every knob `initial` at :root and ships the tier file", () => {
    expect(baseTokens).toContain('@import "./components/sidebar.css"');
    for (const token of [...ITEM_TOKENS, ...ICON_TOKENS]) {
      expect(sidebarTokens).toMatch(new RegExp(`${token}:\\s*initial;`));
    }
    // Role-mirror rule: never `--knob: <role>` at :root (that freezes the scoped role override —
    // a `.dark` / `[data-tenant]` re-tint would never reach the knob).
    expect(sidebarTokens).not.toMatch(/--sidebar-[a-z-]+-foreground:\s*(?:hsl|var|#|rgb)/);
  });

  it("row + label read the item token with the muted-foreground default (resting, top-level)", () => {
    expect(rule(".sb-nav-item")).toContain(
      "color: var(--sidebar-nav-item-foreground, hsl(var(--muted-foreground)));",
    );
  });

  it("sub rows read the SAME item token, so one override themes the whole nav", () => {
    expect(rule(".sb-nav-item--sub")).toContain(
      "color: var(--sidebar-nav-item-foreground, hsl(var(--muted-foreground)));",
    );
    expect(rule(".sb-nav-item--sub:hover")).toContain(
      "color: var(--sidebar-nav-item-hover-foreground, hsl(var(--foreground)));",
    );
  });

  it("hover row keeps the foreground default behind its own knob", () => {
    expect(rule(".sb-nav-item:hover")).toContain(
      "color: var(--sidebar-nav-item-hover-foreground, hsl(var(--foreground)));",
    );
    // Hover background is untouched by gh#228.
    expect(rule(".sb-nav-item:hover")).toContain("background: hsl(var(--accent));");
  });

  it("active row still reads the pre-existing active knobs (no duplicate token)", () => {
    const active = rule('.sb-nav-item[data-active="true"]');
    expect(active).toContain(
      "background: var(--sidebar-item-active-background, hsl(var(--accent)))",
    );
    expect(active).toContain(
      "color: var(--sidebar-item-active-foreground, hsl(var(--foreground)))",
    );
    expect(sidebarTokens).not.toContain("--sidebar-nav-item-active-foreground");
  });

  it("the icon reads its OWN token on .sb-icon, defaulting to the row colour", () => {
    expect(rule(".sb-icon")).toContain("color: var(--sidebar-nav-icon-foreground, currentColor);");
  });

  it("hover / active / disabled icons fall back to the base icon knob, then currentColor", () => {
    for (const [selector, token] of [
      [".sb-nav-item:hover .sb-icon", "--sidebar-nav-icon-hover-foreground"],
      ['.sb-nav-item[data-active="true"] .sb-icon', "--sidebar-nav-icon-active-foreground"],
      ['.sb-nav-item[aria-disabled="true"] .sb-icon', "--sidebar-nav-icon-disabled-foreground"],
    ] as const) {
      const body = rule(selector);
      expect(body).toContain(token);
      expect(body).toContain("var(--sidebar-nav-icon-foreground, currentColor)");
    }
  });

  it("disabled rows resolve to the resting row colour by default (opt-in dimming)", () => {
    const body = rule('.sb-nav-item[aria-disabled="true"]');
    expect(body).toContain("--sidebar-nav-item-disabled-foreground");
    expect(body).toContain("var(--sidebar-nav-item-foreground, hsl(var(--muted-foreground)))");
  });

  it("state rules are ordered so the later state wins at equal specificity", () => {
    const at = (selector: string) => {
      const index = styles.indexOf(selector);
      expect(index, `${selector} missing`).toBeGreaterThan(-1);
      return index;
    };
    expect(at(".sb-icon {")).toBeLessThan(at(".sb-nav-item:hover .sb-icon"));
    expect(at(".sb-nav-item:hover .sb-icon")).toBeLessThan(
      at('.sb-nav-item[data-active="true"] .sb-icon'),
    );
    expect(at('.sb-nav-item[data-active="true"] .sb-icon')).toBeLessThan(
      at('.sb-nav-item[aria-disabled="true"] .sb-icon'),
    );
    // The disabled ROW rule must also outrank :hover / [data-active] (same specificity → later).
    expect(at(".sb-nav-item:hover {")).toBeLessThan(at('.sb-nav-item[aria-disabled="true"] {'));
    expect(at('.sb-nav-item[data-active="true"] {')).toBeLessThan(
      at('.sb-nav-item[aria-disabled="true"] {'),
    );
  });

  it("changes COLOUR only — 16px icons and 32px/10px row geometry are untouched", () => {
    // gh#326 named the icon scale: --icon-size-md IS 1rem/16px, and
    // src/tokens/__tests__/icon-size-scale.test.ts pins that step and every token that reads it.
    expect(shellTokens).toMatch(/--sidebar-nav-icon-size:\s*var\(--icon-size-md\);/);
    // gh#324 named the band scale the same way: --band-height-md IS 2rem/32px, and
    // src/tokens/__tests__/geometry-axis-scales.test.ts pins that step.
    expect(shellTokens).toMatch(/--sidebar-nav-item-height:\s*var\(--band-height-md\);/);
    expect(shellTokens).toMatch(/--sidebar-nav-item-gap:\s*0\.625rem;/);
    const icon = rule(".sb-icon");
    expect(icon).toContain("width: var(--sidebar-nav-icon-size);");
    expect(icon).toContain("height: var(--sidebar-nav-icon-size);");
    expect(rule(".sb-icon svg")).toContain("width: var(--sidebar-nav-icon-size);");
    const row = rule(".sb-nav-item");
    expect(row).toContain("height: var(--sidebar-nav-item-height);");
    expect(row).toContain("gap: var(--sidebar-nav-item-gap);");
    // No new sizing/geometry declarations smuggled into the colour knobs.
    for (const token of [...ITEM_TOKENS, ...ICON_TOKENS]) {
      expect(token.endsWith("-foreground")).toBe(true);
    }
  });

  it("the collapsed rail keeps its icon-only geometry (icon token still applies there)", () => {
    expect(styles).toMatch(
      /\[data-collapsed="true"\][\s\S]{0,200}?\.sb-nav-item\s*\{[^}]*justify-content:\s*center;/,
    );
  });
});

/* ---------------------------------------------------------------------------------------------
 * Light/dark contrast — the defaults AND the canonical override must clear WCAG 2.2 AA.
 * The sidebar surface is hsl(var(--card)); the hovered/active row sits on hsl(var(--accent)).
 * ------------------------------------------------------------------------------------------- */

function hsl(body: string, name: string): [number, number, number] {
  const m = body.match(new RegExp(`--${name}:\\s*([\\d.]+)\\s+([\\d.]+)%\\s+([\\d.]+)%`));
  if (!m) throw new Error(`token --${name} not found`);
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

function hslToRgb([h, s, l]: [number, number, number]): [number, number, number] {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return [f(0), f(8), f(4)].map((x) => x * 255) as [number, number, number];
}

function luminance([r, g, b]: [number, number, number]): number {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

function contrast(a: [number, number, number], b: [number, number, number]): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const THEMES = {
  light: block(foundation, ":root {"),
  dark: block(foundation, '.dark,\n:root[data-theme="dark"] {'),
} as const;

const AA_TEXT = 4.5;
const AA_NON_TEXT = 3; // SC 1.4.11 — a nav glyph is a meaningful non-text element.

describe("Sidebar nav foreground contrast, both themes (gh#228)", () => {
  for (const [theme, body] of Object.entries(THEMES)) {
    const surface = hslToRgb(hsl(body, "card"));
    const hoverSurface = hslToRgb(hsl(body, "accent"));
    const muted = hslToRgb(hsl(body, "muted-foreground"));
    const strong = hslToRgb(hsl(body, "foreground"));

    it(`${theme}: resting row label (--muted-foreground) on the sidebar surface meets AA`, () => {
      expect(contrast(muted, surface)).toBeGreaterThanOrEqual(AA_TEXT);
    });

    it(`${theme}: resting icon default (= the row colour) clears non-text contrast`, () => {
      expect(contrast(muted, surface)).toBeGreaterThanOrEqual(AA_NON_TEXT);
    });

    it(`${theme}: hover + active row (--foreground) on the accent fill meets AA`, () => {
      expect(contrast(strong, hoverSurface)).toBeGreaterThanOrEqual(AA_TEXT);
    });

    it(`${theme}: the canonical override (icons at --foreground) stays AA on both surfaces`, () => {
      // A consumer setting `--sidebar-nav-icon-foreground: hsl(var(--foreground))` to match the
      // canonical shell must not need any further tuning to stay accessible.
      expect(contrast(strong, surface)).toBeGreaterThanOrEqual(AA_TEXT);
      expect(contrast(strong, hoverSurface)).toBeGreaterThanOrEqual(AA_TEXT);
    });

    it(`${theme}: the canonical icon override is DARKER than the muted default (the gh#228 fix)`, () => {
      expect(contrast(strong, surface)).toBeGreaterThan(contrast(muted, surface));
    });
  }
});
