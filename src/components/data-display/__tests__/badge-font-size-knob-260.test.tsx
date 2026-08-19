import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { renderWithUi } from "@/test/render";
import { Badge } from "../badge";

/**
 * gh#260 — the documented `--badge-font-size` knob was structurally inert: the cva base
 * hardcoded the `text-xs` utility, and a consumer's Tailwind build (whose `@source` scans this
 * library) emits `.text-xs` into `@layer utilities`, which beats the knob's
 * `font-size: var(--badge-font-size)` in `@layer components` regardless of specificity.
 *
 * The fix removes `text-xs` from the cva so badge-layout.css owns the type metrics. Because
 * `text-xs` also carried Tailwind's companion line-height (`--text-xs--line-height`, default
 * `calc(1 / 0.75)` — the theme remaps `--text-xs` but not the companion), badge-layout.css must
 * declare line-height too, from a token whose default reproduces that ratio, so the default
 * rendering stays pixel-identical while the knob finally works.
 */

const layout = readFileSync(join(process.cwd(), "src/styles/badge-layout.css"), "utf8");
const tokens = readFileSync(join(process.cwd(), "src/tokens/components/badge.css"), "utf8");

/** The `[data-slot="badge"]` rule body inside badge-layout.css. */
function badgeRuleBody(): string {
  const match = layout.match(/\[data-slot="badge"\]\s*\{([^}]*)\}/);
  expect(match, 'badge-layout.css must keep a [data-slot="badge"] rule').not.toBeNull();
  return match![1];
}

describe("Badge --badge-font-size knob (gh#260)", () => {
  it("renders no text-* font-size utility, so the components-layer rule is reachable", () => {
    const { container } = renderWithUi(
      <Badge variant="outline" shape="pill" tone="info">
        Compact
      </Badge>,
    );
    const badge = container.querySelector('[data-slot="badge"]') as HTMLElement;
    expect(badge).not.toBeNull();
    expect(badge.classList.contains("text-xs")).toBe(false);
    // No other font-size utility may sneak back in either (text-info etc. are colors, not sizes).
    const fontSizeUtilities = Array.from(badge.classList).filter((cls) =>
      /^text-(2xs|xs|sm|base|lg|xl|\dxl|\[.+\])$/.test(cls),
    );
    expect(fontSizeUtilities).toEqual([]);
  });

  it("badge-layout.css owns font-size AND line-height via the badge tokens", () => {
    const body = badgeRuleBody();
    expect(body).toContain("font-size: var(--badge-font-size)");
    // `text-xs` used to set the companion line-height; without this declaration the badge
    // would inherit the ambient body leading and grow taller than before.
    expect(body).toContain("line-height: var(--badge-line-height)");
  });

  it("token defaults reproduce the retired `text-xs` utility exactly", () => {
    // Same font-size step the utility resolved to (--text-xs: var(--font-size-xs) in @theme).
    expect(tokens).toMatch(/--badge-font-size:\s*var\(--font-size-xs\)/);
    // Tailwind's default companion --text-xs--line-height is calc(1 / 0.75); the theme never
    // remapped it, so this unitless ratio is what `text-xs` actually applied.
    expect(tokens).toMatch(/--badge-line-height:\s*calc\(1 \/ 0\.75\)/);
  });
});
