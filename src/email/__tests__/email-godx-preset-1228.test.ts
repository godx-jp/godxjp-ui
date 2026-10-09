import { describe, expect, it } from "vitest";

import V31_MARK from "./__fixtures__/brand-mark-31.31.8.json";

import {
  EMAIL_BRAND_LABEL_GODX,
  EMAIL_COLORS,
  EMAIL_COLORS_DARK,
  EMAIL_COLORS_GODX,
  EMAIL_COLORS_GODX_DARK,
  EMAIL_BRAND_MARK,
  EMAIL_BRAND_MARK_GODX,
  EMAIL_TOKENS,
  EMAIL_TOKENS_GODX,
  EMAIL_TOKENS_GODX_JSON,
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

  it("prebuilds the GoDX mark, byte-identical to what 31.31.8 shipped as the default", () => {
    // Fixture: EMAIL_TOKENS.brandMark.{svg,dataUri,tableHtml} from the published @godxjp/ui@31.31.8.
    expect(EMAIL_TOKENS_GODX.brandMark).toBe(EMAIL_BRAND_MARK_GODX);
    expect(EMAIL_BRAND_MARK_GODX.svg).toBe(V31_MARK.svg);
    expect(EMAIL_BRAND_MARK_GODX.dataUri).toBe(V31_MARK.dataUri);
    expect(EMAIL_BRAND_MARK_GODX.tableHtml).toBe(V31_MARK.tableHtml);
    // Geometry is shared; the neutral default stays decorative.
    expect({ ...EMAIL_BRAND_MARK_GODX, svg: "", dataUri: "", tableHtml: "" }).toEqual({
      ...EMAIL_BRAND_MARK,
      svg: "",
      dataUri: "",
      tableHtml: "",
    });
    expect(EMAIL_TOKENS.brandMark.svg).toContain('aria-hidden="true"');
  });

  it("serialises the preset for template engines", () => {
    expect(JSON.parse(EMAIL_TOKENS_GODX_JSON)).toEqual(
      JSON.parse(JSON.stringify(EMAIL_TOKENS_GODX)),
    );
    expect(EMAIL_TOKENS_GODX_JSON).toContain('aria-label=\\"GoDX\\"');
  });
});
