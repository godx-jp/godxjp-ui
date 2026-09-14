import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * THE MASTER LOGO, AS THE BRAND GUIDELINES DEFINE IT (identity v2.3).
 *
 * Written after getting it wrong twice. The first cut shipped a placeholder capsule; the second
 * shipped the FLAT artwork re-tinted by tokens, which broke four rules at once
 * (`06_UI_Design_System/UI_UX_Guidelines.html`):
 *
 *   · "Logo master không bị nhuộm lại theo màu của một module."
 *   · "Logo dùng master SVG đúng biến thể sáng/tối."
 *   · "Dark asset: cung cấp biến thể phù hợp; không dùng filter đảo màu ảnh/logo."
 *   · "Không đổi hình G, wordmark, tỷ lệ vàng hoặc construction chỉ vì theme cần khác màu."
 *
 * Each rule gets an assertion, because each was violated by an implementation that looked
 * reasonable and rendered plausibly.
 */
const root = process.cwd();
const read = (rel: string) => readFileSync(join(root, rel), "utf8");
const artwork = read("src/brand/godx-artwork.generated.ts");
const layout = read("src/styles/logo-layout.css");
const component = read("src/components/general/logo.tsx");

describe("the master artwork ships as-is", () => {
  it("carries BOTH variants, each with the master's gradients", () => {
    for (const name of ["GODX_LOCKUP_LIGHT", "GODX_LOCKUP_DARK", "GODX_MARK_LIGHT", "GODX_MARK_DARK"]) {
      expect(artwork).toContain(`export const ${name}`);
    }
    // The master is a gradient artwork; a variant that lost them would be the flat cut smuggled in.
    const gradients = artwork.match(/Gradient/g) ?? [];
    expect(gradients.length).toBeGreaterThan(20);
  });

  it("namespaces the ids per VARIANT and per INSTANCE", () => {
    /*
     * Both kit files declare `iconBodyGradient`, `arrowClip` and friends, so two variants in one
     * document need a variant prefix — and two <Logo>s need an instance prefix on top, since SVG
     * ids are unique per document rather than per file.
     *
     * NOT because of a rendering bug: measured in Chromium, shared ids and unique ids give
     * byte-identical pixels, because each copy carries its own identical <defs>. It is document
     * validity — duplicate ids break getElementById, anchors and aria references. An earlier
     * version of this comment claimed a visible break; that was wrong.
     */
    expect(artwork).not.toMatch(/id=\\"iconBodyGradient\\"/);
    expect(artwork).toMatch(/id=\\"__GXID__-gx-lockup-l-iconBodyGradient\\"/);
    expect(artwork).toMatch(/id=\\"__GXID__-gx-lockup-d-iconBodyGradient\\"/);
    // The token must survive into every reference too, or half the ids would be instance-scoped
    // and the other half not.
    expect(artwork).toMatch(/url\(#__GXID__-gx-lockup-l-iconBodyGradient\)/);
  });

  it("is NOT re-tinted — no fill, no colour, no currentColor on the artwork", () => {
    for (const rule of layout.match(
      /\.ui-logo\[data-mark="godx(?:-lockup)?"\](?:\[data-size="[a-z]+"\])?\s*\{[^}]*\}/g,
    ) ?? []) {
      expect(rule).not.toMatch(/(^|[^-])color:/);
      expect(rule).not.toMatch(/(^|[^-])fill:/);
    }
    expect(component).not.toContain('fill="currentColor"');
  });

  it("switches by VARIANT, never by a filter", () => {
    // `filter: invert()` on a logo is explicitly forbidden — and it is the shortcut somebody
    // reaches for when only one artwork is available.
    expect(layout).not.toMatch(/filter:\s*invert/);
    expect(layout).toMatch(/\[data-scheme="dark"\]\s*\{\s*display:\s*none/);
    // All three theme states: explicit dark, explicit light, and the un-stamped OS default —
    // missing the last is how a logo comes out right only for people who touched the toggle.
    expect(layout).toContain("@media (prefers-color-scheme: dark)");
    expect(layout).toContain(':root:not([data-theme="light"])');
    expect(layout).toContain(':root[data-theme="dark"]');
  });

  it("keeps the construction untouched — geometry is the kit's", () => {
    // The lockup viewBox is the kit's own (`30 30 871.285714 182`), not a re-fitted box. Changing
    // it would mean the artwork was redrawn to suit a layout, which the guidelines forbid.
    expect(artwork).toContain('"30 30 871.285714 182.000000"');
    expect(artwork).toContain('"30 30 241.000000 182.000000"');
  });
});
