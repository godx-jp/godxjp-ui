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
 * sync script). The GoDX preset for email puts back what 31.31.8 shipped as the default — in the
 * preset's colour, which gh#1345 (33.5.0) moved from violet to emerald-teal.
 */
const V31_LIGHT = hslToHex("268.7 100% 50%"); // 31.31.8 EMAIL_COLOR_SOURCE primary/brand/focus
const GODX_LIGHT = hslToHex("168 100% 25%"); // gh#1345 — #008066
const GODX_DARK = hslToHex("168 60% 60%"); // gh#1345 — #5cd6be

describe("the GoDX preset for email (gh#1228, gh#1345)", () => {
  it("paints the GoDX emerald-teal on primary, brand and focus, light and dark", () => {
    expect(GODX_LIGHT).toBe("#008066");
    expect(GODX_DARK).toBe("#5cd6be");
    for (const role of ["primary", "brand", "focus"] as const) {
      expect(EMAIL_COLORS_GODX[role], role).toBe(GODX_LIGHT);
      expect(EMAIL_COLORS_GODX_DARK[role], role).toBe(GODX_DARK);
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
    expect(svg.toLowerCase()).toContain(GODX_LIGHT.toLowerCase());
  });

  it("prebuilds the GoDX mark — 31.31.8's bytes with only the colour moved (gh#1345)", () => {
    // Fixture: EMAIL_TOKENS.brandMark.{svg,dataUri,tableHtml} from the published @godxjp/ui@31.31.8.
    // Geometry, label, size and table layout are byte-identical; the violet fill is the one change.
    const recolour = (text: string) =>
      text
        .replaceAll(V31_LIGHT.toLowerCase(), GODX_LIGHT.toLowerCase())
        .replaceAll(`%23${V31_LIGHT.slice(1).toLowerCase()}`, `%23${GODX_LIGHT.slice(1)}`);
    expect(V31_MARK.svg.toLowerCase()).toContain(V31_LIGHT.toLowerCase());
    expect(EMAIL_TOKENS_GODX.brandMark).toBe(EMAIL_BRAND_MARK_GODX);
    expect(EMAIL_BRAND_MARK_GODX.svg).toBe(recolour(V31_MARK.svg));
    expect(EMAIL_BRAND_MARK_GODX.dataUri).toBe(recolour(V31_MARK.dataUri));
    expect(EMAIL_BRAND_MARK_GODX.tableHtml).toBe(recolour(V31_MARK.tableHtml));
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
