import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { APP_BRANDS, isAppBrand, type AppBrand } from "../../app/theme-axes";

/**
 * THE CANONICAL DXS THEME (gh#214).
 *
 * The consumer blocker was that there is no canonical theme/preset "shared by every surface": the
 * brand axis only re-tinted `--primary`, and `src/theme/` held nothing but copy-me templates. These
 * tests pin the public contract from BOTH entry points and, crucially, assert the two can never
 * drift apart:
 *
 *   · runtime      — `<AppProvider brand="dxs">` → `<html data-brand="dxs">` → tokens/axes.css
 *   · stylesheet   — `@godxjp/ui/theme/dxs.canonical.css` → the same declarations at `:root`
 *
 * They also pin that the preset invents NOTHING: the palette is byte-identical to the shipped
 * `brand` (GodX Navy) ramp, and every auth value is a `var(--auth-shell-canonical-*)` reference to
 * the measures already declared in tokens/components/shell.css.
 */
const axes = readFileSync(resolve(process.cwd(), "src/tokens/axes.css"), "utf8");
const canonicalTheme = readFileSync(resolve(process.cwd(), "src/theme/dxs.canonical.css"), "utf8");
const shellTokens = readFileSync(resolve(process.cwd(), "src/tokens/components/shell.css"), "utf8");
const pkg = JSON.parse(readFileSync(resolve(process.cwd(), "package.json"), "utf8"));

/** Every `--token: value;` declaration inside the first block matching `selector`. */
function declarations(css: string, selector: string): Record<string, string> {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const block = css.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`))?.[1] ?? "";
  const out: Record<string, string> = {};
  for (const m of block.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)) out[m[1]] = m[2].trim();
  return out;
}

/** The `:root…` block nested inside the first `@media (max-width: 30rem)` of `css`. */
function mobileDeclarations(css: string): Record<string, string> {
  const media = css.match(/@media \(max-width: 30rem\) \{([\s\S]*?)\n\}/)?.[1] ?? "";
  const out: Record<string, string> = {};
  for (const m of media.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)) out[m[1]] = m[2].trim();
  return out;
}

const runtimePreset = declarations(axes, ':root[data-brand="dxs"]');
const stylesheetPreset = declarations(canonicalTheme, ":root");

describe("dxs brand axis — the canonical DXS preset", () => {
  it("is a public AppBrand value wired through the existing provider axis", () => {
    expect(APP_BRANDS).toContain("dxs");
    expect(isAppBrand("dxs")).toBe(true);
    // Backward compatible: every pre-existing brand still validates, and it stays opt-in
    // (no `:root[data-brand="dxs"]`-less default rule is added for any brand).
    const legacy: AppBrand[] = ["brand", "crm", "logistics", "partner", "slate"];
    for (const brand of legacy) expect(isAppBrand(brand)).toBe(true);
    expect(isAppBrand("nope")).toBe(false);
  });

  it("reuses the shipped GodX Navy ramp — it invents no brand colour", () => {
    const shipped = declarations(axes, ':root[data-brand="brand"]');
    for (const token of [
      "--primary",
      "--primary-foreground",
      "--ring",
      "--accent",
      "--accent-foreground",
    ]) {
      expect(runtimePreset[token]).toBe(shipped[token]);
    }
  });

  it("binds the canonical auth surface by REFERENCE to the shell's canonical tokens", () => {
    expect(runtimePreset["--auth-shell-control-height"]).toBe(
      "var(--auth-shell-canonical-control-height)",
    );
    expect(runtimePreset["--auth-shell-heading-size"]).toBe(
      "var(--auth-shell-canonical-heading-size)",
    );
    expect(runtimePreset["--auth-shell-card-max-width"]).toBe(
      "var(--auth-shell-canonical-card-max-width)",
    );
    expect(runtimePreset["--auth-shell-main-padding"]).toBe(
      "var(--auth-shell-canonical-main-padding)",
    );
    // …and those referenced tokens really are the canonical 36px / 22.5rem / 16px measures.
    expect(shellTokens).toContain("--auth-shell-canonical-control-height: 2.25rem;");
    expect(shellTokens).toContain("--auth-shell-canonical-card-max-width: 22.5rem;");
    expect(shellTokens).toContain("--auth-shell-canonical-main-padding: 1rem;");
  });

  it("drops to the canonical 15px page inset below 30rem", () => {
    expect(mobileDeclarations(axes)["--auth-shell-main-padding"]).toBe(
      "var(--auth-shell-canonical-main-padding-mobile)",
    );
    expect(shellTokens).toContain("--auth-shell-canonical-main-padding-mobile: 0.9375rem;");
  });
});

describe("theme/dxs.canonical.css — the stylesheet entry point", () => {
  it("is importable as @godxjp/ui/theme/*", () => {
    expect(pkg.exports["./theme/*"]).toBe("./dist/theme/*");
  });

  it("layers on top of the package styles instead of forking them", () => {
    expect(canonicalTheme).toContain('@import "@godxjp/ui/styles";');
    // Token overrides only — a theme file never ships component CSS (rule #46).
    expect(canonicalTheme).not.toMatch(/\.ui-[a-z-]+\s*\{/);
  });

  it("declares EXACTLY the same contract as the data-brand='dxs' axis (no drift)", () => {
    expect(stylesheetPreset).toEqual(runtimePreset);
    expect(mobileDeclarations(canonicalTheme)).toEqual(mobileDeclarations(axes));
  });

  it("never binds the identity mark to --primary", () => {
    expect(canonicalTheme).not.toMatch(/--logo-[a-z-]+:\s*var\(--primary\)/);
    expect(runtimePreset["--logo-godx-color"]).toBeUndefined();
  });
});
