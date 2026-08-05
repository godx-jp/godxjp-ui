import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * gh#250 / gh#214 — the IDENTITY role `--brand` must be a real, separate semantic role.
 *
 * #214 asked for a brand-green GoDX mark independent of `--primary`. That shipped, but the mark was
 * bound to `--success` — the 若竹 wakatake STATUS green — so the identity rendered #69bf8e where the
 * canonical GoDX mark is emerald #009766 (`oklch(0.595 0.137 162.94)`, documented as "kept distinct
 * from SmartHR primary"). ΔE76 ≈ 17.5: not a subtle drift, a wrong brand colour.
 *
 * This guard pins the split in BOTH directions, deterministically (jsdom cannot paint, and the
 * browser check:contrast has no godx-lockup route):
 *   · the identity mark/wordmark reads --brand and NEVER --success or --primary;
 *   · status surfaces (badge/alert/progress/timeline/text tone) still read --success, unchanged;
 *   · --brand really is the canonical emerald, and --success really is still 若竹.
 */

const read = (rel: string) => readFileSync(join(process.cwd(), rel), "utf8");

const foundation = read("src/tokens/foundation.css");
const logoTokens = read("src/tokens/components/logo.css");
const logoLayout = read("src/styles/logo-layout.css");

/** Extract a flat `selector { ... }` block body (token blocks have no nested braces). */
function block(selector: string): string {
  const start = foundation.indexOf(selector);
  if (start === -1) throw new Error(`selector not found: ${selector}`);
  const open = foundation.indexOf("{", start);
  const close = foundation.indexOf("\n}", open);
  return foundation.slice(open + 1, close);
}

/** Read an `--name: H S% L%;` token as [h, s, l]. */
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

const hex = (rgb: [number, number, number]) =>
  `#${rgb.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;

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

/** CIE Lab, D65 — enough for a ΔE76 "are these two greens the same colour?" assertion. */
function lab([r, g, b]: [number, number, number]): [number, number, number] {
  const lin = (v: number) => {
    v /= 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  const [R, G, B] = [lin(r), lin(g), lin(b)];
  const X = (R * 0.4124564 + G * 0.3575761 + B * 0.1804375) / 0.95047;
  const Y = R * 0.2126729 + G * 0.7151522 + B * 0.072175;
  const Z = (R * 0.0193339 + G * 0.119192 + B * 0.9503041) / 1.08883;
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))];
}

const deltaE76 = (a: [number, number, number], b: [number, number, number]) => {
  const [l1, a1, b1] = lab(a);
  const [l2, a2, b2] = lab(b);
  return Math.hypot(l1 - l2, a1 - a2, b1 - b2);
};

const THEMES = {
  light: block(":root {"),
  dark: block('.dark,\n:root[data-theme="dark"] {'),
} as const;

describe("--brand: the GoDX identity role (gh#250)", () => {
  it("declares --brand and --brand-foreground as real roles in BOTH themes", () => {
    for (const body of Object.values(THEMES)) {
      expect(() => hsl(body, "brand")).not.toThrow();
      expect(() => hsl(body, "brand-foreground")).not.toThrow();
    }
  });

  it("light --brand IS the canonical emerald oklch(0.595 0.137 162.94) = #009766", () => {
    expect(hex(hslToRgb(hsl(THEMES.light, "brand")))).toBe("#009766");
  });

  it("dark --brand keeps the canonical hue and chroma, lifted only in lightness", () => {
    const [lh, ls] = hsl(THEMES.light, "brand");
    const [dh, ds, dl] = hsl(THEMES.dark, "brand");
    expect(dh).toBe(lh);
    expect(ds).toBe(ls);
    expect(dl).toBeGreaterThan(hsl(THEMES.light, "brand")[2]);
  });

  it("--success stays 若竹 wakatake — the STATUS green is untouched by the identity fix", () => {
    expect(hsl(THEMES.light, "success")).toEqual([146, 40, 58]);
    expect(hsl(THEMES.dark, "success")).toEqual([146, 45, 55]);
  });

  it("--brand and --success are visibly DIFFERENT colours (the whole point of the split)", () => {
    for (const body of Object.values(THEMES)) {
      const d = deltaE76(hslToRgb(hsl(body, "brand")), hslToRgb(hsl(body, "success")));
      expect(d).toBeGreaterThan(10);
    }
  });

  it("--brand is not a copy of --primary either", () => {
    for (const body of Object.values(THEMES)) {
      expect(hsl(body, "brand")).not.toEqual(hsl(body, "primary"));
    }
  });

  it("the identity fill clears 3:1 against its own foreground and the page background", () => {
    for (const body of Object.values(THEMES)) {
      const fill = hslToRgb(hsl(body, "brand"));
      expect(contrast(fill, hslToRgb(hsl(body, "brand-foreground")))).toBeGreaterThanOrEqual(3);
      expect(contrast(fill, hslToRgb(hsl(body, "background")))).toBeGreaterThanOrEqual(3);
      expect(contrast(fill, hslToRgb(hsl(body, "card")))).toBeGreaterThanOrEqual(3);
    }
  });
});

describe("Logo identity call sites read --brand, never --success", () => {
  const identityDefaults = [
    "background: hsl(var(--logo-success-background, var(--brand)))",
    "color: hsl(var(--logo-success-foreground, var(--brand-foreground)))",
    "color: hsl(var(--logo-godx-color, var(--brand)))",
    "color: hsl(var(--logo-wordmark-color, var(--logo-godx-color, var(--brand))))",
  ];

  it("pins every identity role default at the CALL SITE, on --brand", () => {
    for (const decl of identityDefaults) expect(logoLayout).toContain(decl);
  });

  it("no logo rule falls back to --success or --primary for the identity", () => {
    expect(logoLayout).not.toMatch(/var\(--success\b/);
    expect(logoLayout).not.toMatch(/var\(--success-foreground\b/);
    const identityRules =
      logoLayout.match(/\[data-(?:mark="godx"|tone="success")\][\s\S]*?\}/g) ?? [];
    expect(identityRules.length).toBeGreaterThan(0);
    for (const rule of identityRules) expect(rule).not.toContain("--primary");
  });

  it("keeps every role-mirror knob `initial` at :root (no cascade freeze)", () => {
    for (const knob of [
      "--logo-success-background",
      "--logo-success-foreground",
      "--logo-godx-color",
      "--logo-wordmark-color",
    ]) {
      expect(logoTokens).toContain(`${knob}: initial;`);
    }
    // …and the token tier must never bind a knob to a role at :root.
    expect(logoTokens).not.toMatch(/--logo-[a-z-]+:\s*var\(--(?:brand|success|primary)\)/);
  });
});

describe("status surfaces still read --success", () => {
  const statusOwners = {
    "src/styles/alert-layout.css": /hsl\(var\(--success\)/,
    "src/styles/text-layout.css": /color: hsl\(var\(--success\)\)/,
    "src/styles/card-layout.css": /hsl\(var\(--success\)\)/,
    "src/styles/data-display-layout.css": /hsl\(var\(--success\)\)/,
    "src/styles/data-entry-layout.css": /hsl\(var\(--success\)\)/,
  } as const;

  for (const [file, pattern] of Object.entries(statusOwners)) {
    it(`${file} keeps the wakatake status green`, () => {
      expect(read(file)).toMatch(pattern);
      // A status owner must not have been dragged onto the identity role.
      expect(read(file)).not.toMatch(/var\(--brand\)/);
    });
  }
});
