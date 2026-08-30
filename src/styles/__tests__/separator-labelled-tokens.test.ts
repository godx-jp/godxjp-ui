import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { ruleSelector, ruleSelectors } from "@/test/css-selector";

/**
 * Labelled Separator — the token contract and the selectors that carry it (gh#308).
 *
 * jsdom performs no layout and does not resolve `var()`, so a `getComputedStyle` assertion here
 * would be vacuous. What CAN be proved at this layer, and is exactly what the issue is about:
 *
 *   • every constant the labelled rule needs is a `--separator-*` knob, not a literal — the
 *     `height: 1px` that `shell-layout.css` used to bake into `.ui-auth-divider-rule` is gone
 *     (rule #44);
 *   • the colour knobs are declared `initial` at `:root` with the role default at the CALL SITE,
 *     so a scoped `[data-tenant]` / `.dark` override of `--border` / `--muted-foreground` actually
 *     reaches them (docs/TOKENS.md — the `:root` freeze rule);
 *   • the `:not([data-labelled])` guard really SELECTS a plain rule and really EXCLUDES a labelled
 *     one — a correct-looking selector that matches nothing is the documented trap this repo's
 *     css-selector helper exists for;
 *   • AuthDivider is a PRESET: it re-points the knobs instead of restating the properties, so
 *     #263's login geometry is unchanged while the coupling the issue reported is broken.
 */
const read = (rel: string) => readFileSync(resolve(process.cwd(), rel), "utf8");
const tokens = read("src/tokens/components/separator.css");
const layout = read("src/styles/layout.css");
const shell = read("src/styles/shell-layout.css");

const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");
const declarations = (css: string): Record<string, string> =>
  Object.fromEntries(
    [...stripComments(css).matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)].map(([, k, v]) => [
      k,
      v.replace(/\s+/g, " ").trim(),
    ]),
  );

/** The body of the first rule whose selector list contains `fragment`. */
function ruleBody(css: string, anchor: string): string {
  const clean = stripComments(css);
  const at = clean.indexOf(anchor);
  expect(at, `rule not found: ${anchor}`).toBeGreaterThan(-1);
  const open = clean.indexOf("{", at);
  return clean.slice(open + 1, clean.indexOf("}", open));
}

describe("separator token tier (gh#308)", () => {
  const declared = declarations(tokens);

  it("owns every constant the labelled rule needs", () => {
    for (const token of [
      "--separator-rule-size",
      "--separator-rule-color",
      "--separator-label-gap",
      "--separator-label-inset",
      "--separator-label-font-size",
      "--separator-label-line-height",
      "--separator-label-font-weight",
      "--separator-label-color",
    ]) {
      expect(declared, `missing knob ${token}`).toHaveProperty(token);
    }
  });

  it("declares every colour knob `initial` so a scoped role override reaches it", () => {
    const colourKnobs = Object.keys(declared).filter((name) => name.endsWith("-color"));
    expect(colourKnobs.length).toBeGreaterThan(0);
    for (const knob of colourKnobs) {
      expect(declared[knob], `${knob} must be a role-mirror knob`).toBe("initial");
    }
  });

  it("declares the density-scaled spacing knobs `initial` too (the :root freeze rule)", () => {
    expect(declared["--separator-label-gap"]).toBe("initial");
    expect(declared["--separator-label-inset"]).toBe("initial");
  });

  it("keeps the label type ramp on the modular scale, never a literal", () => {
    expect(declared["--separator-label-font-size"]).toBe("var(--font-size-xs)");
    expect(declared["--separator-label-line-height"]).toBe("var(--line-height-normal)");
    expect(declared["--separator-label-font-weight"]).toBe("var(--font-weight-medium)");
  });

  it("gives every non-default tone BOTH a rule and a label knob, so tone is never colour-only", () => {
    for (const tone of ["muted", "primary", "success", "warning", "destructive", "info"]) {
      expect(declared).toHaveProperty(`--separator-tone-${tone}-rule-color`);
      expect(declared).toHaveProperty(`--separator-tone-${tone}-label-color`);
    }
  });
});

describe("separator rules (gh#308)", () => {
  it("reads the role defaults at the CALL SITE, not through a frozen :root binding", () => {
    expect(ruleBody(layout, ".ui-separator-rule {")).toContain(
      "hsl(var(--separator-rule-color, var(--border)))",
    );
    expect(ruleBody(layout, ".ui-separator-label {")).toContain(
      "hsl(var(--separator-label-color, var(--muted-foreground)))",
    );
  });

  it("bakes no literal geometry into the rule or the label", () => {
    const bodies = [
      ruleBody(layout, ".ui-separator-rule {"),
      ruleBody(layout, ".ui-separator-label {"),
      ruleBody(layout, '.ui-separator:not([data-labelled])[data-orientation="horizontal"] {'),
      ruleBody(layout, '.ui-separator:not([data-labelled])[data-orientation="vertical"] {'),
    ].join("\n");
    expect(bodies).not.toMatch(/:\s*\d+(\.\d+)?(px|rem|em)\b/);
  });

  it("aligns the label by re-measuring a grid TRACK, so start/end flip under RTL", () => {
    for (const align of ["start", "end"]) {
      const body = ruleBody(layout, `.ui-separator[data-labelled][data-label-align="${align}"] {`);
      expect(body).toContain("grid-template-columns");
      expect(body).toContain("var(--separator-label-inset, var(--space-6))");
    }
    // No physical left/right anywhere in the labelled block.
    expect(ruleBody(layout, ".ui-separator[data-labelled] {")).not.toMatch(/\b(left|right)\s*:/);
  });

  it("clamps both rule halves so a long label can never overflow the container", () => {
    expect(ruleBody(layout, ".ui-separator[data-labelled] {")).toContain(
      "minmax(0, 1fr) auto minmax(0, 1fr)",
    );
  });

  it("guards the plain rule with :not([data-labelled]) — and the guard really selects", () => {
    const plain = ruleSelector(
      layout,
      '.ui-separator:not([data-labelled])[data-orientation="horizontal"] {',
      "data-orientation",
    );

    const bare = document.createElement("div");
    bare.className = "ui-separator";
    bare.setAttribute("data-orientation", "horizontal");
    // Never wrapped in try/catch: an invalid selector must THROW, not silently read as "no match".
    expect(bare.matches(plain)).toBe(true);

    const labelled = document.createElement("div");
    labelled.className = "ui-separator";
    labelled.setAttribute("data-orientation", "horizontal");
    labelled.setAttribute("data-labelled", "");
    expect(labelled.matches(plain)).toBe(false);

    const grid = ruleSelectors(layout, ".ui-separator[data-labelled] {")[0];
    expect(labelled.matches(grid)).toBe(true);
    expect(bare.matches(grid)).toBe(false);
  });

  it("every tone selector matches the tone it names", () => {
    for (const tone of ["muted", "primary", "success", "warning", "destructive", "info"]) {
      const selector = ruleSelector(layout, `.ui-separator[data-tone="${tone}"] {`, tone);
      const node = document.createElement("div");
      node.className = "ui-separator";
      node.setAttribute("data-tone", tone);
      expect(node.matches(selector), `tone selector missed: ${selector}`).toBe(true);
    }
  });
});

describe("AuthDivider preset (gh#308)", () => {
  const body = ruleBody(shell, ".ui-auth-divider {");

  it("only re-points Separator's knobs — it no longer re-implements the rule", () => {
    expect(body).toContain("--separator-label-gap: var(--auth-shell-divider-gap)");
    expect(body).toContain("--separator-rule-color: var(--auth-shell-divider-rule-color)");
    expect(body).toContain("--separator-label-color: var(--auth-shell-divider-label-color)");
    expect(body).toContain(
      "--separator-label-font-size: var(--auth-shell-divider-label-font-size)",
    );
    expect(body).not.toMatch(/display\s*:/);
    expect(body).not.toMatch(/grid-template-columns\s*:/);
  });

  it("drops the hard-coded 1px rule that #44 forbids", () => {
    expect(stripComments(shell)).not.toContain(".ui-auth-divider-rule");
    expect(body).not.toMatch(/\bheight\s*:\s*1px/);
  });

  it("pins the auth label back to the body weight the auth micro-scale has always used", () => {
    expect(body).toContain("--separator-label-font-weight: var(--font-weight-normal)");
  });
});
