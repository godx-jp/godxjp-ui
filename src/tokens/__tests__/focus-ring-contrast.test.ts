import { globSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { contrast, hsl, hslToRgb, NON_TEXT, over } from "./wcag-contrast";

/**
 * THE FOCUS MARK HAS TWO APPEARANCES, AND THIS FILE HOLDS BOTH TO A DIFFERENT BAR.
 *
 * The shipped DEFAULT is the two-form focus convention this library adopted, and the values it
 * needs live in `src/tokens/derived.css`:
 *
 *   FIELD   the boundary recolours to the primary at the unchanged hairline width, plus
 *           `boxShadow: 0 0 0 ${--control-outline-width} ${--control-outline}`.
 *   OUTLINE `outline: ${--focus-outline-weight} solid ${--primary-border}; outline-offset: 1`.
 *
 * That default is AA on a field and, measured rather than assumed, is NOT AA on the outline form:
 * `--primary-border` for this seed is #6dc0e3, which reaches 2.00:1 against the page. The stricter
 * indicator is reached by raising ONE knob — `--focus-ring-weight` — with the mark taking the focus
 * hue rather than `--primary-border`; the second half of this file is the gate on that.
 *
 * THE TRAP THIS FILE STILL EXISTS TO CLOSE. A halo that soft is decoration. Measured against this
 * palette, a primary tint composited over the page reaches only 1.18:1 at alpha 0.11 and still
 * only 2.84:1 at alpha 0.7 — it can NEVER satisfy WCAG 2.2 SC 1.4.11's 3:1, at any value of the
 * knob. So the moment someone reads "the focus mark is a soft glow" and deletes the opaque half of
 * the AAA appearance, every control loses its indicator while still looking focused to a sighted
 * reviewer on a bright monitor.
 *
 * Surfaces are checked the thorough way, for the same reason input-boundary-contrast.test.ts
 * gives: a value that passes on a card and fails inside a filter bar is not a line anyone can
 * defend.
 */

const css = readFileSync(join(process.cwd(), "src/tokens/foundation.css"), "utf8");
const generated = readFileSync(join(process.cwd(), "src/tokens/derived.css"), "utf8");
const axes = readFileSync(join(process.cwd(), "src/tokens/axes.css"), "utf8");
const controlTokens = readFileSync(
  join(process.cwd(), "src/tokens/components/control.css"),
  "utf8",
);
const shellTokens = readFileSync(join(process.cwd(), "src/tokens/components/shell.css"), "utf8");
const focusRing = readFileSync(join(process.cwd(), "src/styles/focus-ring.css"), "utf8");

/** Extract a flat `selector { ... }` block body (token blocks have no nested braces). */
function block(source: string, selector: string): string {
  const start = source.indexOf(selector);
  if (start === -1) throw new Error(`selector not found: ${selector}`);
  const open = source.indexOf("{", start);
  const close = source.indexOf("\n}", open);
  return source.slice(open + 1, close);
}

/** Read a bare numeric token (`--name: 0.11;`) out of a block body. */
function num(body: string, name: string): number {
  const m = body.match(new RegExp(`--${name}:\\s*([\\d.]+)\\s*;`));
  if (!m) throw new Error(`token --${name} not found`);
  return Number(m[1]);
}

const hexOf = (rgb: [number, number, number]) =>
  `#${rgb.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;

const hexToRgbTuple = (value: string): [number, number, number] => {
  let s = value.replace("#", "");
  if (s.length === 3) s = [...s].map((c) => c + c).join("");
  return [0, 2, 4].map((i) => Number.parseInt(s.slice(i, i + 2), 16)) as [number, number, number];
};

/** The alphas table-layout.css lays over a row. */
const STRIPE_ALPHA = 0.4;
const HOVER_ALPHA = 0.5;

const THEMES = [
  { theme: "light", selector: ":root {", dark: false },
  { theme: "dark", selector: '.dark,\n:root[data-theme="dark"] {', dark: true },
] as const;

/**
 * THE DERIVED VALUES, PINNED — the other half of the lock on `src/tokens/derived.css`.
 *
 * These used to be recomputed from a colour algorithm at test time. That generator is gone, so
 * the twenty derived values are now AUTHORED, and the thing that keeps them honest is this file:
 * every assertion below compares what `derived.css` declares against the literal recorded here,
 * and then MEASURES the result against a WCAG threshold. Editing one side alone turns this red.
 *
 * `controlOutline` / `colorErrorOutline` are the halo colour and alpha as one rgba string,
 * because the CSS splits them across two tokens and the pair must stay consistent.
 */
const DERIVED = {
  light: {
    /** `--ring` resolves here through `var(--primary)`; the light seed is unchanged by derivation. */
    ring: "#0071bd",
    controlOutline: "rgba(0,182,228,0.11)",
    colorErrorOutline: "rgba(166,22,11,0.09)",
    primaryBorder: "#6dc0e3",
  },
  dark: {
    ring: "#3dabf5",
    controlOutline: "rgba(61,175,254,0.29)",
    colorErrorOutline: "rgba(253,20,53,0.06)",
    primaryBorder: "#204158",
  },
} as const;

/**
 * The dark primary that a mechanical derivation from the light seed WOULD have produced, kept so
 * the divergence stays a measurement instead of a preference. See the first test below.
 */
const DARK_PRIMARY_REJECTED = "#3794d3";

/** The geometry the focus system declares, and which the named stroke scale must agree with. */
const GEOMETRY = { lineWidth: 1, controlOutlineWidth: 2, lineWidthFocus: 3 } as const;

/** `--ring` is generated as `var(--primary)`, so the focus hue IS the seed. */
function ringOf(theme: "light" | "dark"): [number, number, number] {
  expect(generated, "--ring must be a reference to the seed, not a copied triple").toContain(
    "--ring: var(--primary);",
  );
  return hslToRgb(hsl(block(css, THEMES.find((t) => t.theme === theme)!.selector), "primary"));
}

/* ────────────────────────────────────────────────────────────────────────────
 * 1. THE DERIVED TIER IS WHAT IT SAYS IT IS.
 * ──────────────────────────────────────────────────────────────────────────── */
describe.each(THEMES)("the shipped default matches the derived tier ($theme)", ({ theme }) => {
  const token = DERIVED[theme];
  const body = block(
    generated,
    theme === "light" ? ":root {" : '.dark,\n:root[data-theme="dark"] {',
  );

  it("the field boundary on focus is the primary itself", () => {
    // LIGHT the seed is unchanged by derivation, so `--ring: var(--primary)` IS the focus colour.
    //
    // DARK is the one structural divergence, and it is recorded rather than smoothed over. A
    // mechanical dark derivation MOVES the seed: it gives #3794d3 for this seed — 5.36:1 on this
    // spine, where the committed seed itself measures 7.07:1. Deriving from the LIGHT seed
    // instead gives #0363a4 at 2.81:1, which primary-text-contrast.test.ts rejects outright. So
    // the dark theme keeps the lifted ramp foundation.css commits to, and the assertion below is
    // the reason: the shipped seed must be the LOUDER of the two, or the derived answer would
    // simply be better and should be taken instead.
    if (theme === "light") {
      expect(hexOf(ringOf(theme))).toBe(token.ring);
    } else {
      const seed = hexOf(ringOf(theme));
      expect(seed).toBe(token.ring);
      expect(seed).not.toBe(DARK_PRIMARY_REJECTED);
      const background = hslToRgb(hsl(block(css, THEMES[1].selector), "background"));
      expect(
        contrast(hslToRgb(hsl(block(css, THEMES[1].selector), "primary")), background),
        "the seed must be the LOUDER of the two, or the derived answer would simply be better",
      ).toBeGreaterThan(contrast(hexToRgbTuple(DARK_PRIMARY_REJECTED), background));
    }
    // And the rule feeds the utility that paints that border, rather than declaring a colour it
    // would lose to. `@theme inline` compiles `border-input` to `border-color: hsl(var(--input))`.
    expect(focusRing).toMatch(/--input:\s*var\(--focus-ring-color, var\(--ring\)\)/);
  });

  it("the field halo is `--control-outline`, colour AND alpha", () => {
    const outline = hexOf(hslToRgb(hsl(body, "control-outline")));
    const alpha = num(body, "control-outline-alpha");
    expect(
      `rgba(${hslToRgb(hsl(body, "control-outline")).map(Math.round).join(",")},${alpha})`,
    ).toBe(token.controlOutline);
    expect(outline).not.toBe(hexOf(ringOf(theme))); // the halo hue is NOT the primary itself
  });

  it("the invalid field halo is its own hue, not a diluted `--destructive`", () => {
    const alpha = num(body, "control-outline-error-alpha");
    expect(
      `rgba(${hslToRgb(hsl(body, "control-outline-error")).map(Math.round).join(",")},${alpha})`,
    ).toBe(token.colorErrorOutline);
    expect(focusRing).toContain("--focus-ring-glow-color: var(--control-outline-error)");
  });

  it("`--primary-border` is declared even though the mark no longer paints it", () => {
    // The hue the OUTLINE form of the focus mark would take. It stays in the tier because the
    // reason this library does not use it is a MEASUREMENT (see the SC 1.4.11 block below)
    // rather than a preference — and the measurement needs the value to exist.
    expect(hexOf(hslToRgb(hsl(body, "primary-border")))).toBe(token.primaryBorder);
  });

  it("the focus geometry is the geometry the stroke scale already carries", () => {
    const root = block(css, ":root {");
    expect(GEOMETRY.lineWidth).toBe(1);
    expect(GEOMETRY.controlOutlineWidth).toBe(2);
    expect(GEOMETRY.lineWidthFocus).toBe(3);
    expect(root).toMatch(/--control-outline-width:\s*calc\(var\(--stroke-md\) \* /); // 2px
    expect(css).toMatch(/--stroke-md:\s*2px;/);
    expect(css).toMatch(/--stroke-lg:\s*3px;/); // the heavy outline weight, one token away
    expect(css).toMatch(/--stroke-hairline:\s*1px;/); // the shipped ON weight
  });

  it("focus never changes a border WIDTH, so no control can move when it is focused", () => {
    // The field form recolours the boundary and leaves `--control-border-width` alone; the outline
    // form paints outside the box model. This is the STRUCTURAL reason there is no layout shift,
    // asserted so a future "thicken the border on focus" cannot land without deleting it.
    expect(focusRing).not.toMatch(/border(?:-[a-z]+)?-width\s*:/);
    expect(controlTokens).toMatch(/--control-border-width:\s*var\(--stroke-hairline\)/);
  });
});

/* ────────────────────────────────────────────────────────────────────────────
 * 2. WHAT THAT DEFAULT COSTS, STATED AS A MEASUREMENT.
 * ──────────────────────────────────────────────────────────────────────────── */
describe.each(THEMES)("the cost of the default appearance ($theme)", ({ theme, selector }) => {
  const body = block(css, selector);
  const background = hslToRgb(hsl(body, "background"));
  const generatedBody = block(
    generated,
    theme === "light" ? ":root {" : '.dark,\n:root[data-theme="dark"] {',
  );

  it("the FIELD boundary clears SC 1.4.11 (AA) — the default is compliant here", () => {
    expect(contrast(ringOf(theme), background)).toBeGreaterThanOrEqual(NON_TEXT);
  });

  it("the OUTLINE hue does NOT clear 3:1 — recorded, because it is the price of the default", () => {
    // Not an aspiration and not a bug report: `colorPrimaryBorder` is a light tint by
    // construction. If that hue is ever retuned, this test fails and the axis stops being needed.
    const primaryBorder = hslToRgb(hsl(generatedBody, "primary-border"));
    expect(contrast(primaryBorder, background)).toBeLessThan(NON_TEXT);
  });

  it("both positions of the switch exist, and the hue is the focus hue", () => {
    // "on" is kept although the default IS on (gh#544), so every consumer that already set it
    // keeps working; "off" is the new escape hatch. Losing either is a silent break for somebody.
    expect(axes).toContain(':root[data-focus-outline="on"]');
    expect(axes).toContain(':root[data-focus-outline="off"]');
    expect(css).toMatch(/--focus-outline-color:\s*var\(--focus-ring-color, var\(--ring\)\)/);
  });
});

/* ────────────────────────────────────────────────────────────────────────────
 * 3. THE SWITCH — both positions, because a consumer runs one or the other.
 *
 * The library ships `--focus-outline: 1` (gh#544). It used to ship 0, and the reversal was driven
 * by a count rather than a preference: of the four real consumers, three set `data-focus-outline`
 * NOWHERE and so shipped with no keyboard-focus indicator at all — not a choice, since the switch
 * was discoverable only by reading foundation.css. The ON state is also no longer the 3px outline
 * the original complaint was about; it is the hairline field indicator.
 *
 * The OFF position is what a product that wants the mark gone runs, so it is gated exactly as hard
 * as the default: flipping the attribute must not leave a zero-spread shadow flattening controls.
 * ──────────────────────────────────────────────────────────────────────────── */
describe("the switch is ON by default, and the OFF position still zeroes everything", () => {
  const root = block(css, ":root {");
  const off = block(axes, ':root[data-focus-outline="off"] {');

  it("is a single multiplier flag, at 1", () => {
    // The flag is the one seam: every focus length in CSS multiplies by it, so setting it to 0
    //   focus width = weight * --focus-outline
    // zeroes every painted length at once, and no component rebind can bring one back. The
    // multiplication is what this asserts; the DEFAULT VALUE is the separate claim above it.
    expect(root).toMatch(/--focus-outline:\s*1;/);
    expect(root).toMatch(
      /--focus-ring-width:\s*calc\(var\(--focus-ring-weight\) \* var\(--focus-outline\)\)/,
    );
    expect(root).toMatch(
      /--control-outline-width:\s*calc\(var\(--stroke-md\) \* var\(--focus-outline\)\)/,
    );
  });

  it("the OFF position zeroes the flag", () => {
    expect(off).toMatch(/--focus-outline:\s*0;/);
  });

  it("the halo is `none` when off, not a zero-spread shadow", () => {
    // A literal `0 0 0 0 transparent` would still REPLACE the control's resting `--control-shadow`,
    // so a switched-off focus would quietly flatten every input on the page. This is why the halo
    // is set per POSITION and does not ride the multiplier: it is not a length.
    expect(off).toMatch(/--focus-field-shadow:\s*none;/);
  });

  it("the default halo actually paints — the flip is not cosmetic", () => {
    // Turning the multiplier to 1 while leaving the halo at `none` would give a default that
    // passes every structural assertion above and still paints half the indicator.
    expect(root).toMatch(/--focus-field-shadow:\s*0 0 0 var\(--focus-ring-glow-width\)/);
  });

  it("EVERY painted path multiplies by the switch — no rule paints a raw length", () => {
    // The mark itself.
    expect(focusRing).toMatch(/outline:\s*var\(--focus-ring-width\) solid/);
    expect(focusRing).toContain("box-shadow: var(--focus-field-shadow);");
    // The region ring, which has its own opt-in token and would otherwise bypass the switch.
    const shell = readFileSync(join(process.cwd(), "src/styles/shell-layout.css"), "utf8");
    const regionRings = [...shell.matchAll(/--region-focus-ring-width[^;]*/g)];
    expect(regionRings.length).toBeGreaterThan(0);
    for (const ring of regionRings) {
      if (ring[0].includes(":")) continue; // the token's own declaration, not a use
      expect(ring[0], "a region ring must multiply by --focus-outline").toContain(
        "* var(--focus-outline)",
      );
    }
  });

  it("no per-component rebind can reach the WIDTH and bypass the switch", () => {
    // Rebinds set `--focus-ring-weight`; the width is `weight × switch`. A rebind that assigned
    // `--focus-ring-width` directly would paint with the switch off — the exact hole this asserts
    // is closed. `.ui-command-input` is allowed to zero its own weight.
    // EVERY stylesheet, not just focus-ring.css. The claim in this title is repo-wide, but the
    // scan read one file — measured: `.ui-probe-rebind { --focus-ring-width: 3px; }` added to
    // navigation-layout.css left all 66 tests green. The token's own declaration in
    // tokens/foundation.css is the one legal writer.
    const sheets = globSync("src/{styles,tokens}/**/*.css").filter(
      (f) => !f.endsWith("src/tokens/foundation.css"),
    );
    expect(sheets.length, "no stylesheets found to scan").toBeGreaterThan(0);
    const offenders: string[] = [];
    for (const file of sheets) {
      const css = readFileSync(join(process.cwd(), file), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
      for (const m of css.matchAll(/([^{}]+)\{([^{}]*--focus-ring-width\s*:[^{}]*)\}/g)) {
        offenders.push(`${file}: ${m[1].trim().replace(/\s+/g, " ")}`);
      }
    }
    expect(offenders, "rebind --focus-ring-weight, never --focus-ring-width").toEqual([]);
  });

  /**
   * THE SAME INVARIANT, IN WHAT WE TELL CONSUMERS. The rule above keeps a stylesheet from rebinding
   * `--focus-ring-width`; it cannot see a DOC that prescribes it. Both did: CUSTOMER-THEMING called
   * it the thickness knob with a 2px default and said "`width: 0` turns every ring OFF", TOKENS.md
   * called it a member of the stroke scale, and the MCP token catalog — what an agent reads —
   * repeated the 2px claim. Measured in Chromium: with the switch OFF, `--focus-ring-width: 2px`
   * paints a 2px ring on a focused Button, i.e. the documented knob routes around the very switch
   * this file exists to protect, and an agent following the catalog writes that bypass.
   *
   * A doc may still SHOW the derived definition; it may not assign anything else to it.
   */
  it("no doc or catalog prescribes --focus-ring-width — the derived token", () => {
    const DERIVED = "calc(var(--focus-ring-weight) * var(--focus-outline))";
    const offenders: string[] = [];
    for (const file of [
      "docs/CUSTOMER-THEMING.md",
      "docs/TOKENS.md",
      "docs/DESIGN-AUTHORITY.md",
      "mcp/src/data/tokens.ts",
    ]) {
      const text = readFileSync(join(process.cwd(), file), "utf8");
      for (const [line] of text.matchAll(/--focus-ring-width:[^\n;]*/g)) {
        if (!line.includes(DERIVED)) offenders.push(`${file}: ${line.trim()}`);
      }
    }
    expect(offenders, "document --focus-ring-weight; --focus-ring-width is derived").toEqual([]);
  });

  it("the field BOUNDARY recolour is gated on the same attribute", () => {
    // The one part of the mark that is a colour rather than a length, so no multiplier can zero
    // it. It must therefore be scoped, or a switched-off field would still turn blue on focus.
    const at = focusRing.indexOf("--input: var(--focus-ring-color");
    expect(at, "the boundary rule must exist").toBeGreaterThan(-1);
    const selector = focusRing.slice(
      focusRing.lastIndexOf("*/", at) + 2,
      focusRing.lastIndexOf("{", at),
    );
    // Split on TOP-LEVEL commas only — the selector contains `:is(a, b, c)` groups.
    const parts: string[] = [];
    let depth = 0;
    let buffer = "";
    for (const ch of selector) {
      if (ch === "(") depth += 1;
      if (ch === ")") depth -= 1;
      if (ch === "," && depth === 0) {
        parts.push(buffer);
        buffer = "";
      } else {
        buffer += ch;
      }
    }
    parts.push(buffer);
    for (const part of parts.filter((p) => p.trim())) {
      expect(part.trim(), `every boundary selector must be gated: ${part.trim()}`).toContain(
        '[data-focus-outline="on"]',
      );
    }
  });

  it("the `:focus-visible` machinery is still there — only the paint is gone", () => {
    // The switch must be reversible with no code change, which means the selectors survive.
    expect(focusRing.match(/:focus-visible/g)!.length).toBeGreaterThan(3);
    for (const control of [".ui-button", ".ui-input", ".sb-nav-item", ".ui-checkbox"]) {
      expect(focusRing).toContain(control);
    }
  });

  it("carries no indicator on a container, a content region or the page body", () => {
    // The list is CONTROLS ONLY. `.ui-legal-document-section` is the one that was removed: a slab
    // of prose that is `tabIndex={-1}` so a contents link can jump to it, i.e. never in the tab
    // order. The scrollable regions (`.app-main`, `.ui-code-block`, `.ui-timeline-grid`) keep both
    // their focusability and their mark, because a reachable region with no mark is worse.
    const start = focusRing.indexOf(":is(\n    .ui-focus-ring,");
    const markSelector = focusRing.slice(start, focusRing.indexOf("{", start));
    expect(markSelector, "the mark rule must exist").not.toBe("");
    for (const container of [".ui-legal-document-section", "body", "html", ".app-main"]) {
      expect(markSelector, `${container} must not carry a focus indicator`).not.toContain(
        container,
      );
    }
  });
});

describe("the ON position is the LIGHT one, and it still carries the criterion", () => {
  const root = block(css, ":root {");
  const on = block(axes, ':root[data-focus-outline="on"] {');

  it("one attribute turns everything back on", () => {
    expect(on).toMatch(/--focus-outline:\s*1;/);
    expect(on).toContain("--focus-field-shadow: 0 0 0 var(--focus-ring-glow-width)");
    expect(focusRing).toContain('[data-focus-outline="on"]');
  });

  it("the weight is the hairline stroke, not the heavy one", () => {
    // The complaint was weight, not existence: 3px of opaque brand around an already-shaded
    // selected nav row is two heavy treatments on one element. The FIELD form of this indicator
    // is one hairline, and WCAG's AA bar for an indicator is CONTRAST, not thickness.
    expect(root).toMatch(/--focus-outline-weight:\s*var\(--stroke-hairline\)/);
    expect(css).toMatch(/--stroke-hairline:\s*1px;/);
    // The heavier outline weight stays one token away.
    expect(css).toMatch(/--stroke-lg:\s*3px;/);
  });

  it("the field and the button carry the SAME weight, so the two cannot drift apart", () => {
    // `--control-focus-ring-width` cannot literally read the global token (it would freeze at
    // :root), so both read the same stroke step and this asserts the equality.
    const global = root.match(/--focus-outline-weight:\s*([^;\n]+);/)?.[1]?.trim();
    const field = controlTokens.match(/--control-focus-ring-width:\s*([^;\n]+);/)?.[1]?.trim();
    expect(field).toBe(global);
  });

  it("a nav row's mark is INSET into its own shape, not wrapped around it", () => {
    // The lighter read the sidebar asked for: the mark sits within the row rather than
    // surrounding an already-shaded selected surface. The offset tracks the width, so it is
    // switched off with everything else.
    const rule = focusRing.match(/a\.ui-list-row,[\s\S]{0,80}?\.sb-nav-item \{[^}]*\}/)?.[0] ?? "";
    expect(rule, "the inset rule must cover both row families").not.toBe("");
    expect(rule).toContain("calc(-1 * var(--focus-ring-width))");
  });

  it("the hue is the focus hue, because `--primary-border` cannot clear 3:1", () => {
    expect(root).toMatch(/--focus-outline-color:\s*var\(--focus-ring-color, var\(--ring\)\)/);
  });
});

describe.each(THEMES)("the ON mark clears SC 1.4.11 ($theme)", ({ theme, selector }) => {
  const body = block(css, selector);
  const ring = ringOf(theme);
  const background = hslToRgb(hsl(body, "background"));
  const card = hslToRgb(hsl(body, "card"));
  const popover = hslToRgb(hsl(body, "popover"));
  const muted = hslToRgb(hsl(body, "muted"));
  const secondary = hslToRgb(hsl(body, "secondary"));
  const accent = hslToRgb(hsl(body, "accent"));
  const generatedBody = block(
    generated,
    theme === "light" ? ":root {" : '.dark,\n:root[data-theme="dark"] {',
  );

  const SURFACES: ReadonlyArray<readonly [string, () => [number, number, number]]> = [
    ["the page background", () => background],
    ["a card", () => card],
    ["a popover / dialog", () => popover],
    ["a muted panel", () => muted],
    ["a secondary panel", () => secondary],
    ["an accent panel", () => accent],
    ["a striped table row", () => over(muted, background, STRIPE_ALPHA)],
    ["a hovered table row", () => over(muted, background, HOVER_ALPHA)],
  ];

  it.each(SURFACES)("clears 3:1 on %s", (_label, surface) => {
    expect(contrast(ring, surface())).toBeGreaterThanOrEqual(NON_TEXT);
  });

  it("is at least as visible as the resting boundary it replaces", () => {
    // A focused field swaps `--input` for `--ring` on its edge. If the focus hue were the
    // QUIETER of the two, focusing a field would make its boundary harder to see — the exact
    // inverse of an indicator. This is a floor, not an equality: --ring may be louder.
    const input = hslToRgb(hsl(body, "input"));
    expect(contrast(ring, background)).toBeGreaterThanOrEqual(contrast(input, background));
  });

  it("the outline hue would NOT have cleared it — recorded, not assumed", () => {
    const primaryBorder = hslToRgb(hsl(generatedBody, "primary-border"));
    expect(contrast(primaryBorder, background)).toBeLessThan(NON_TEXT);
  });

  it("every per-component ALPHA rebind keeps the mark opaque", () => {
    // A mark at 0.35 alpha is still a mark by AREA, but it composites to 1.64:1 and fails the
    // CONTRAST clause. Colour is the whole criterion here, so this is the half that matters.
    const offenders: string[] = [];
    for (const match of focusRing.matchAll(/--focus-ring-opacity:\s*var\((--[a-z-]+)\)/g)) {
      const knob = match[1];
      const declared = (controlTokens + shellTokens)
        .match(new RegExp(`${knob}:\\s*([^;]+);`))?.[1]
        ?.trim();
      expect(declared, `${knob} must be declared in a token tier`).toBeDefined();
      if (Number.parseFloat(declared!) !== 1) offenders.push(`${knob} = ${declared}`);
    }
    expect(offenders, "a softened mark is not an SC 1.4.11 indicator").toEqual([]);
  });

  it("the widest mark still fits the clip headroom it is given", () => {
    // Chrome that clips its overflow reserves `--focus-ring-clip-margin`. The widest paint is the
    // ON mark plus the field halo. If a future mark outgrows the margin it is shaved at the edge,
    // which is how gh#291 / gh#376 happened.
    const root = block(css, ":root {");
    const clip = Number.parseFloat(
      root.match(/--focus-ring-clip-margin:\s*([^;]+);/)?.[1]?.trim() ?? "",
    );
    const strokeScale: Record<string, number> = { hairline: 1, sm: 1.5, md: 2, lg: 3, xl: 4 };
    const step = (value: string) =>
      strokeScale[value.match(/var\(--stroke-([a-z0-9]+)\)/)?.[1] ?? ""] ??
      Number.parseFloat(value);
    const weights = [
      root.match(/--focus-outline-weight:\s*([^;\n]+);/)?.[1]?.trim() ?? "",
      ...[...focusRing.matchAll(/--focus-ring-weight:\s*([^;]+);/g)].map((m) => {
        const value = m[1].trim();
        const knob = value.match(/var\((--[a-z-]+)\)/)?.[1];
        return knob
          ? ((controlTokens + shellTokens).match(new RegExp(`${knob}:\\s*([^;]+);`))?.[1]?.trim() ??
              value)
          : value;
      }),
    ].map(step);
    const halo = 2; // --control-outline-width
    expect(Math.max(...weights) + halo, "widest focus paint").toBeLessThan(clip);
  });
});

/* ────────────────────────────────────────────────────────────────────────────
 * 4. THE HALO IS DECORATION IN BOTH APPEARANCES.
 * ──────────────────────────────────────────────────────────────────────────── */
describe.each(THEMES)("the halo is decoration, not the indicator ($theme)", ({ theme }) => {
  const generatedBody = block(
    generated,
    theme === "light" ? ":root {" : '.dark,\n:root[data-theme="dark"] {',
  );
  const alpha = num(generatedBody, "control-outline-alpha");
  const halo = hslToRgb(hsl(generatedBody, "control-outline"));
  const themeBackground = hslToRgb(
    hsl(block(css, THEMES.find((t) => t.theme === theme)!.selector), "background"),
  );

  it("declares a glow alpha in this theme, and it is the one the tier commits to", () => {
    expect(alpha).toBeGreaterThan(0);
    expect(alpha).toBeLessThan(1);
    expect(alpha).toBe(Number(/,([\d.]+)\)/.exec(DERIVED[theme].controlOutline)![1]));
  });

  it("sits well under the opaque stop, so it can never be mistaken for it", () => {
    // `--focus-ring-opacity` (the AAA opaque stop) is 1. A halo at, say, 0.8 would be a second
    // opaque mark wearing a halo's name.
    expect(alpha).toBeLessThanOrEqual(0.5);
  });

  it("raising the halo alpha is not an a11y fix — it stops being a halo first", () => {
    const at = (a: number) => contrast(over(halo, themeBackground, a), themeBackground);
    expect(at(alpha)).toBeLessThan(NON_TEXT);

    // And the alpha it WOULD take is no longer a halo: more than half-opaque, i.e. a second solid
    // mark wearing a halo's name, which is the thing the two-layer split exists to avoid.
    let minimum = Number.POSITIVE_INFINITY;
    for (let a = 0.01; a <= 1.0001; a += 0.01) {
      if (at(a) >= NON_TEXT) {
        minimum = Math.round(a * 100) / 100;
        break;
      }
    }
    expect(minimum, `alpha needed for 3:1 in this theme: ${minimum}`).toBeGreaterThan(0.5);
  });
});

/* ────────────────────────────────────────────────────────────────────────────
 * 5. ONE FOCUS LANGUAGE, APPLIED CONSISTENTLY.
 * ──────────────────────────────────────────────────────────────────────────── */
describe("one focus language, applied consistently", () => {
  it("the whole halo is ONE token, so the switch has exactly one seam to move", () => {
    // One consumer, one declaration: whichever position is active, exactly this token is read.
    expect(focusRing).toContain("box-shadow: var(--focus-field-shadow);");
    expect(block(axes, ':root[data-focus-outline="off"] {')).toMatch(
      /--focus-field-shadow:\s*none;/,
    );
    // Every stop of the PAINTING value reads a token — no literal colour, no literal length. Both
    // writers of it are checked, because since gh#544 the default is a painting one too and a
    // literal could now enter through `:root` rather than only through the attribute block.
    for (const source of [block(css, ":root {"), block(axes, ':root[data-focus-outline="on"] {')]) {
      const declaration = source.match(/--focus-field-shadow:([\s\S]+?);/)![1];
      expect(declaration).not.toMatch(/#[0-9a-f]{3,8}|rgba?\(|\b[1-9]\d*px\b/i);
    }
  });

  it("a focused field's BOUNDARY becomes the focus hue — the grey never survives", () => {
    expect(focusRing).toMatch(/--input:\s*var\(--focus-ring-color, var\(--ring\)\)/);
  });

  it("does NOT rebind the boundary on the Switch, which FILLS from --input", () => {
    // `.ui-switch` paints its unchecked TRACK with --input rather than an edge, so including it
    // in the field rule would turn a focused off-switch solid blue. It takes the outline form,
    // which is the conventional treatment for a Switch.
    const fieldRule = focusRing.match(/:is\(\s*\.ui-input,[^}]*--input:[^}]*\}/s)?.[0] ?? "";
    expect(fieldRule, "the field rule must exist").not.toBe("");
    expect(fieldRule).not.toContain(".ui-switch");
  });

  it("the Button takes the OUTLINE form in every variant", () => {
    const fieldRule = focusRing.match(/:is\(\s*\.ui-input,[^}]*--input:[^}]*\}/s)?.[0] ?? "";
    expect(fieldRule).not.toContain(".ui-button");
    const outlineRule = focusRing.match(/:is\([^)]*\.ui-button,[^}]*outline:[^}]*\}/s)?.[0] ?? "";
    expect(outlineRule, "the outline rule must carry .ui-button").not.toBe("");
  });

  it("the AAA field knob is a length with a unit, not a bare 0", () => {
    // Note for anyone who sets it: the value must carry a unit. It is summed with a length in
    // `calc(var(--focus-ring-width) + var(--focus-ring-glow-width))`, and calc() refuses to add a
    // unitless number to a length, so the whole box-shadow becomes invalid at computed-value time
    // and resolves to NONE. Measured in Chromium while this knob was briefly `0`: a focused Input
    // reported `box-shadow: none` and still looked plausible, because the recoloured border was
    // carrying the state on its own. A bare `0` does not thin the mark, it deletes it.
    expect(focusRing).toContain("var(--control-focus-ring-width)");
    const declaration = controlTokens.match(/--control-focus-ring-width:\s*([^;]+);/)?.[1]?.trim();
    expect(declaration, "--control-focus-ring-width must be declared").toBeDefined();
    expect(declaration, "must be a length with a unit — see the calc() note above").toMatch(
      /^(0|var\(--stroke-[a-z0-9]+\)|[\d.]+[a-z%]+)$/,
    );
  });

  it("keeps the mark for field variants that hide their own boundary", () => {
    // An icon-only / inline picker has no border at rest, so a field-scoped width must never
    // reach it — the mark is the only thing it has.
    expect(focusRing).toContain(".ui-app-setting-picker-icon");
    expect(focusRing).toContain(".ui-app-setting-picker-inline");
  });
});
