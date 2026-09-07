import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Carbon is this library's authority for spacing, density and information architecture — see
 * docs/DESIGN-AUTHORITY.md. A decision that is not enforced has already drifted, so the alignment
 * is pinned here rather than left as prose.
 *
 * The rule is deliberately one-directional: a step that MATCHES Carbon may be added freely, a step
 * that does NOT must be listed as a known divergence with a reason. That way the scale can grow
 * toward Carbon without ceremony, and can only grow away from it on purpose.
 */

/** @carbon/layout spacing scale, in px. Source: packages/layout/scss/generated/_spacing.scss. */
const CARBON_SPACING_PX = [2, 4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96, 160];

/**
 * Steps this library ships that Carbon does not. Each one is a decision recorded in
 * docs/DESIGN-AUTHORITY.md — do not add to this list to make a new token pass. Either use a Carbon
 * step, or add the divergence to that document first and explain what it is for.
 */
const KNOWN_DIVERGENCES_PX: Record<number, string> = {
  20: "--space-5. Carbon steps 16 → 24 on purpose; carrying both 20 and 24 lets two authors space the same relationship differently. Retire or justify — docs/DESIGN-AUTHORITY.md, divergence 1.",
};

const foundation = readFileSync(join(__dirname, "..", "foundation.css"), "utf8");

/** `--space-<n>: <x>rem` — the raw scale only, not the semantic aliases built on top of it. */
function spacingScalePx(css: string): Map<string, number> {
  const found = new Map<string, number>();
  const rule = /--(space-\d+):\s*([\d.]+)rem/g;
  let match: RegExpExecArray | null;
  while ((match = rule.exec(css)) !== null) {
    found.set(match[1], Number.parseFloat(match[2]) * 16);
  }
  return found;
}

describe("spacing scale stays aligned with Carbon (docs/DESIGN-AUTHORITY.md)", () => {
  const scale = spacingScalePx(foundation);

  it("reads a scale from foundation.css at all", () => {
    expect(scale.size).toBeGreaterThan(5);
  });

  it("every step is either a Carbon step or a recorded divergence", () => {
    const unrecorded = [...scale.entries()].filter(
      ([, px]) => !CARBON_SPACING_PX.includes(px) && KNOWN_DIVERGENCES_PX[px] === undefined,
    );

    expect(
      unrecorded,
      `Off-scale spacing step(s). Use a Carbon step (${CARBON_SPACING_PX.join(", ")}px) or record the divergence in docs/DESIGN-AUTHORITY.md and in KNOWN_DIVERGENCES_PX.`,
    ).toEqual([]);
  });

  it("every step sits on the 4px grid, the divergences included", () => {
    const offGrid = [...scale.entries()].filter(([, px]) => px % 4 !== 0);

    expect(offGrid, "Spacing must stay on the 4px grid Carbon's scale is built from.").toEqual([]);
  });

  it("keeps the divergence list honest — a listed step that no longer exists is stale", () => {
    const shipped = new Set(scale.values());
    const stale = Object.keys(KNOWN_DIVERGENCES_PX)
      .map(Number)
      .filter((px) => !shipped.has(px));

    expect(
      stale,
      "These divergences are recorded but no longer in the scale — drop them from KNOWN_DIVERGENCES_PX and from docs/DESIGN-AUTHORITY.md.",
    ).toEqual([]);
  });

  it("body size agrees with Carbon body-compact-01 (14px)", () => {
    const base = /--font-size-base:\s*([\d.]+)rem/.exec(foundation);

    expect(base, "--font-size-base not found in foundation.css").not.toBeNull();
    expect(Number.parseFloat(base![1]) * 16).toBe(14);
  });
});

/**
 * The customers are Japanese businesses, so these are not stylistic preferences — see the
 * "Japanese market" section of docs/DESIGN-AUTHORITY.md. Each one was already correct and
 * undocumented, which is exactly how a future cleanup deletes it.
 */
describe("Japanese typography conventions (docs/DESIGN-AUTHORITY.md)", () => {
  it("body line-height stays in the Japanese 1.7-2.0 band, not the Latin 1.5", () => {
    const match = /--line-height-body:\s*([\d.]+)/.exec(foundation);

    expect(match, "--line-height-body not found").not.toBeNull();
    const value = Number.parseFloat(match![1]);

    expect(
      value,
      "Japanese fills the em box, so Latin's 1.5 reads cramped. Keep 1.7-2.0.",
    ).toBeGreaterThanOrEqual(1.7);
    expect(value).toBeLessThanOrEqual(2);
  });

  it("Japanese gets its own font slot, wired per [lang]", () => {
    const base = readFileSync(join(__dirname, "..", "..", "styles", "base.css"), "utf8");

    // `--font-sans-base` is deliberately a pure SYSTEM stack so the library renders with zero font
    // setup; Japanese arrives through the per-language slot instead. That indirection is the
    // contract worth pinning — without it a JP page falls back to a Latin face that has no kana.
    expect(
      /\[lang="ja"\]\s*\{[^}]*--font-family-sans:\s*var\(\s*--font-sans-ja/.test(base),
      'styles/base.css must wire [lang="ja"] to the --font-sans-ja slot.',
    ).toBe(true);
  });

  it("density compresses spacing only — it must never touch type size", () => {
    const density = readFileSync(join(__dirname, "..", "..", "styles", "density.css"), "utf8");
    const withoutComments = density.replace(/\/\*[\s\S]*?\*\//g, "");

    expect(
      /font-size/.test(withoutComments),
      "density.css sets a font-size. Japanese loses legibility far faster than Latin when shrunk — compress spacing, never the characters.",
    ).toBe(false);
  });
});
