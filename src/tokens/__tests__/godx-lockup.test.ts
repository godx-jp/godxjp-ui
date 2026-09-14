import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * The GoDX LOCKUP — mark + the real logotype (brand identity v2.3).
 *
 * Written after shipping it wrong once: `[data-mark="godx"]` is an EXACT-match selector, so
 * `godx-lockup` inherited the boxed-glyph treatment and rendered as a violet square with an
 * illegible "GoDX" crushed inside it. Every assertion here is one of the things that had to be
 * true for the lockup to read as the brand rather than as a squashed icon.
 */
const root = process.cwd();
const read = (rel: string) => readFileSync(join(root, rel), "utf8");
const artwork = read("src/brand/godx-mark.ts");
const layout = read("src/styles/logo-layout.css");
const tokens = read("src/tokens/components/logo.css");
const component = read("src/components/general/logo.tsx");

const constOf = (name: string) =>
  new RegExp(`export const ${name} =\\s*"([^"]+)"`).exec(artwork)?.[1] ?? "";
const groupOf = (name: string) => {
  const block = new RegExp(`${name}: readonly string\\[\\] = Object\\.freeze\\(\\[(.*?)\\]\\)`, "s").exec(
    artwork,
  )?.[1];
  return [...(block ?? "").matchAll(/"([^"]+)"/g)].map((m) => m[1]);
};

describe("the lockup is artwork, not a squashed mark", () => {
  it("carries both colour groups, and they are the kit's counts", () => {
    // 5 violet (mark body, mark arrow, and the X's three facets) + 3 ink (G, o, D). A regression
    // that dropped a group would still render something plausible, which is why this counts.
    expect(groupOf("GODX_LOCKUP_BRAND_PATHS")).toHaveLength(5);
    expect(groupOf("GODX_LOCKUP_INK_PATHS")).toHaveLength(3);
  });

  it("is WIDE, so it must not be sized as a square", () => {
    const [, w, h] =
      /GODX_LOCKUP_SOURCE = Object\.freeze\(\{ width: ([\d.]+), height: ([\d.]+)/.exec(artwork) ?? [];
    // The mark is square-ish (241x182 fitted into 32x32); the lockup is 871x182.
    const ratio = Number(constOf("GODX_LOCKUP_VIEW_BOX").split(" ")[2]) / 182;
    expect(ratio).toBeGreaterThan(4);
    expect(Number(w) / Number(h)).toBeGreaterThan(4);
  });

  it("gets its own layout block instead of falling through to the boxed glyph", () => {
    const block = /\.ui-logo\[data-mark="godx-lockup"\] \{([^}]+)\}/.exec(layout)?.[1] ?? "";
    expect(block).not.toBe("");
    // Height from the size tier, width from the intrinsic ratio — the opposite of the square branch.
    expect(block).toMatch(/height: var\(--logo-godx-size/);
    expect(block).toContain("width: auto");
    // No fill and no radius: artwork on the page, not a glyph on a box.
    expect(block).toContain("background: transparent");
    expect(block).toMatch(/border-radius: 0/);
  });

  it("paints the letters from a token that FLIPS with the theme", () => {
    // The kit's indigo is 18.00:1 on the light canvas and 1.03:1 on the dark one — one value
    // cannot serve both, so a single declaration here would mean an invisible logotype in dark.
    const light = /:root \{[\s\S]*?--logo-godx-ink-color: ([^;]+);/.exec(tokens)?.[1];
    const dark = /\.dark,[\s\S]*?--logo-godx-ink-color: ([^;]+);/.exec(tokens)?.[1];
    expect(light).toBeTruthy();
    expect(dark).toBeTruthy();
    expect(light).not.toBe(dark);
    // Light ink is dark, dark ink is light — compared as HSL lightness, so a retune still passes.
    const lightness = (v: string) => Number(v.trim().split(/\s+/)[2].replace("%", ""));
    expect(lightness(light!)).toBeLessThan(50);
    expect(lightness(dark!)).toBeGreaterThan(50);
  });

  it("keeps the two roles apart in the component", () => {
    // The brand half rides `currentColor` (so --logo-godx-color re-tints it); the letters do not.
    expect(component).toContain('fill="hsl(var(--logo-godx-ink-color))"');
    expect(component).toContain('fill="currentColor"');
  });
});
