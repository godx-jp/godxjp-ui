import { describe, expect, it } from "vitest";

import {
  EMAIL_BRAND_LABEL_GODX,
  EMAIL_COLORS,
  EMAIL_COLORS_DARK,
  EMAIL_COLORS_GODX,
  EMAIL_COLORS_GODX_DARK,
  EMAIL_TOKENS_GODX,
  emailBrandMarkSvg,
  hslToHex,
} from "../index";

/**
 * gh#1228 — since v32 the email palette follows the neutral foundation, so a GoDX email lost the
 * violet on primary / brand / focus and the mark lost its "GoDX" label (Platform patched its own
 * sync script). The GoDX preset for email puts back exactly what 31.31.8 shipped as the default.
 */
const V31_LIGHT = hslToHex("268.7 100% 50%"); // 31.31.8 EMAIL_COLOR_SOURCE primary/brand/focus
const V31_DARK = hslToHex("268.7 100% 86.9%");

describe("the GoDX preset for email (gh#1228)", () => {
  it("restores the 31.x violet on primary, brand and focus, light and dark", () => {
    for (const role of ["primary", "brand", "focus"] as const) {
      expect(EMAIL_COLORS_GODX[role], role).toBe(V31_LIGHT);
      expect(EMAIL_COLORS_GODX_DARK[role], role).toBe(V31_DARK);
    }
    expect(EMAIL_TOKENS_GODX.colors).toBe(EMAIL_COLORS_GODX);
  });

  it("leaves the neutral default alone and changes no role the preset does not own", () => {
    expect(EMAIL_COLORS.primary).toBe(hslToHex("240 6% 10%"));
    for (const [role, hex] of Object.entries(EMAIL_COLORS)) {
      if (["primary", "primaryForeground", "brand", "brandForeground", "focus"].includes(role))
        continue;
      expect(EMAIL_COLORS_GODX[role as keyof typeof EMAIL_COLORS], role).toBe(hex);
      expect(EMAIL_COLORS_GODX_DARK[role as keyof typeof EMAIL_COLORS], role).toBe(
        EMAIL_COLORS_DARK[role as keyof typeof EMAIL_COLORS],
      );
    }
  });

  it("names the GoDX mark when the preset label is passed", () => {
    const svg = emailBrandMarkSvg({
      label: EMAIL_BRAND_LABEL_GODX,
      color: EMAIL_COLORS_GODX.brand,
    });
    expect(svg).toContain('aria-label="GoDX"');
    expect(svg.toLowerCase()).toContain(V31_LIGHT.toLowerCase());
  });
});
