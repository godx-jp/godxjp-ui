import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

function readSrc(relative: string): string {
  return readFileSync(join(root, relative), "utf8");
}

function readStyle(name: string): string {
  return readSrc(`styles/${name}`);
}

describe("theme CSS tokens (base.css + layout owners)", () => {
  const base = readSrc("tokens/base.css");
  const tokenCss = [
    base,
    readSrc("tokens/foundation.css"),
    readSrc("tokens/semantic/layout.css"),
    readSrc("tokens/components/control.css"),
    readSrc("tokens/components/card.css"),
    readSrc("tokens/components/table.css"),
    readSrc("tokens/components/feedback.css"),
    readSrc("tokens/components/badge.css"),
  ].join("\n");
  const index = readSrc("styles/index.css");
  // styles/base.css is the foundation: Tailwind entry, @theme inline color/type
  // mapping, @layer base, and the density import. index.css composes it + the
  // per-layer component owners.
  const stylesBase = readSrc("styles/base.css");
  const density = readStyle("density.css");
  const control = readStyle("control.css");

  it("defines semantic color tokens in :root", () => {
    for (const token of [
      "--primary:",
      "--accent:",
      "--ring:",
      "--success:",
      "--warning:",
      "--info:",
      "--attention:",
      "--destructive:",
    ]) {
      expect(tokenCss, `missing ${token} in token graph`).toContain(token);
    }
  });

  it("defines density primitives in :root", () => {
    for (const token of [
      "--control-height-compact",
      "--control-height-default",
      "--control-height-comfortable",
      "--table-row-height-compact",
      "--table-row-height-default",
      "--table-row-height-comfortable",
      "--table-cell-padding-y",
    ]) {
      expect(tokenCss, `missing ${token}`).toContain(token);
    }
  });

  it("uses base.css as the token manifest", () => {
    for (const file of [
      "foundation.css",
      "semantic/layout.css",
      "components/control.css",
      "components/card.css",
      "components/table.css",
      "components/feedback.css",
      "components/badge.css",
    ]) {
      expect(base).toContain(`@import "./${file}"`);
    }
  });

  it("maps semantic colors in @theme for Tailwind", () => {
    for (const token of [
      "--color-primary:",
      "--color-accent:",
      "--color-ring:",
      "--color-success:",
      "--color-warning:",
      "--color-info:",
      "--color-attention:",
      "--color-chart-1:",
      "--color-chart-6:",
    ]) {
      expect(stylesBase, `missing ${token} in base.css @theme`).toContain(token);
    }
  });

  it("defines ui-control utilities in control.css", () => {
    expect(control).toContain(".ui-control {");
    expect(control).toContain("height: var(--control-height)");
    expect(control).toContain(".ui-control-multiline {");
    // Typography defaults to base — small-by-design is an explicit token now.
    expect(control).toContain("font-size: var(--font-size-base)");
  });

  it("density presets set the global --scaling factor, via class + data-density axis", () => {
    // Density is now a named preset of --scaling (Radix model): each level sets only
    // --scaling, keyed by BOTH the PageContainer class and the :root[data-density] axis.
    expect(density).toContain(".ui-density-compact,");
    expect(density).toContain(':root[data-density="compact"] {');
    expect(density).toContain(':root[data-density="comfortable"] {');
    expect(density).toMatch(/ui-density-compact[\s\S]*--scaling:\s*0?\.9/);
    expect(density).toMatch(/ui-density-comfortable[\s\S]*--scaling:\s*1\.0?8/);
  });

  it("the spacing scale and --radius derive through --scaling", () => {
    const foundation = readSrc("tokens/foundation.css");
    expect(foundation).toContain("--scaling: 1;");
    expect(foundation).toMatch(/--space-1:\s*calc\(0\.25rem \* var\(--scaling\)\)/);
    expect(foundation).toMatch(/--radius:\s*calc\(0\.375rem \* var\(--scaling\)\)/);
  });

  it("ui-scale-fixed pins a subtree to baseline (chrome exempt from density)", () => {
    const foundation = readSrc("tokens/foundation.css");
    const start = foundation.indexOf(".ui-scale-fixed {");
    const block = foundation.slice(start, foundation.indexOf("}", start) + 1);
    expect(start).toBeGreaterThan(-1);
    expect(block).toContain("--scaling: 1;");
    // Re-declares the raw grid + active size tokens so nothing inherits the baked
    // :root scaling — a plain --scaling:1 would not be enough (tokens already
    // substituted at :root). Drift guard for the topbar / search-palette exemption.
    for (const token of [
      "--space-1:",
      "--space-4:",
      "--space-12:",
      "--radius:",
      "--control-height:",
      "--table-row-height:",
      "--checkbox-size:",
      "--space-stack-md:",
      "--space-section:",
      "--space-inline-sm:",
    ]) {
      expect(block, `ui-scale-fixed must re-declare ${token}`).toContain(token);
    }
  });

  it("wires Tailwind text-* to typography tokens", () => {
    expect(stylesBase).toContain("--text-sm: var(--font-size-sm)");
    expect(stylesBase).toContain("--text-xs: var(--font-size-xs)");
  });

  it("imports split layout CSS owners", () => {
    // Foundation (base.css) owns the density import; index.css composes base +
    // the per-layer component owners.
    expect(stylesBase).toContain(`@import "./density.css"`);
    expect(index).toContain(`@import "./base.css"`);
    for (const file of ["layout.css", "card-layout.css", "table-layout.css"]) {
      expect(index).toContain(`@import "./${file}"`);
    }
  });
});
