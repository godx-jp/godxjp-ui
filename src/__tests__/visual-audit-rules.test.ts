import { describe, expect, it } from "vitest";

// prettier-ignore
// @ts-expect-error — plain ESM script without a declaration file
import { VISUAL_RULES, controlHeightMismatches, missingCssLayers, starvedRowTexts, tightCardPairs } from "../../scripts/visual-audit-rules.mjs";

describe("visual-audit geometry rules (pure)", () => {
  it("catalogs the four geometry rules", () => {
    const ids = VISUAL_RULES.map((r: { id: string }) => r.id);
    for (const id of [
      "css-layers-missing",
      "control-height-mismatch",
      "sibling-card-gap",
      "row-content-starved",
    ])
      expect(ids).toContain(id);
  });

  it("missingCssLayers names every layer whose probe did not resolve", () => {
    expect(
      missingCssLayers([
        { layer: "control", ok: true },
        { layer: "navigation-layout", ok: false },
        { layer: "card-layout", ok: false },
      ]),
    ).toEqual(["navigation-layout", "card-layout"]);
    expect(missingCssLayers([])).toEqual([]);
  });

  it("controlHeightMismatches flags a row with more than one control height", () => {
    const rows = [
      { name: "extra", heights: [32, 32, 38, 32] },
      { name: "footer", heights: [32, 32] },
    ];
    expect(controlHeightMismatches(rows).map((r: { name: string }) => r.name)).toEqual(["extra"]);
  });

  it("tightCardPairs flags adjacent cards closer than one space step", () => {
    expect(tightCardPairs([{ gap: 0 }, { gap: 24 }, { gap: 7 }])).toEqual([{ gap: 0 }, { gap: 7 }]);
    expect(tightCardPairs([{ gap: 8 }])).toEqual([]);
  });

  it("starvedRowTexts flags a long text squeezed to a few pixels, not a short label", () => {
    const texts = [
      { text: "Mozilla/5.0 …", visible: 19, needed: 640 },
      { text: "UA", visible: 19, needed: 19 },
      { text: "Send to", visible: 42, needed: 42 },
    ];
    expect(starvedRowTexts(texts).map((t: { text: string }) => t.text)).toEqual(["Mozilla/5.0 …"]);
  });
});
