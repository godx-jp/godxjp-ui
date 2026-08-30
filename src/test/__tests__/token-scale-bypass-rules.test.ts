import { describe, expect, it } from "vitest";

// The scale-bypass rules are pure decision logic (a token name + a value in, a verdict out), so
// they are unit-tested here against synthetic CSS; scripts/check-token-scale-bypass.mjs only walks
// src/tokens/** and ratchets the result against a baseline. Same split as frame-geometry-measure.
import {
  AXES,
  ENFORCED_AXES,
  axisOf,
  blankComments,
  exemptionFor,
  isScaleBypass,
  scanCss,
  // @ts-expect-error — plain .mjs script module, no types
} from "../../../scripts/token-scale-bypass-rules.mjs";

describe("axisOf — which axis is this token on", () => {
  it("reads the plain axis suffixes", () => {
    expect(axisOf("--sidebar-nav-item-font-size")).toBe("font-size");
    expect(axisOf("--card-radius")).toBe("radius");
    expect(axisOf("--descriptions-column-gap")).toBe("gap");
    expect(axisOf("--tabs-trigger-line-padding-x")).toBe("padding");
    expect(axisOf("--table-sort-icon-size")).toBe("icon-size");
  });

  it("reads this repo's logical `-space-` spelling of padding", () => {
    expect(axisOf("--card-space-inset")).toBe("padding");
    expect(axisOf("--badge-space-x")).toBe("padding");
    expect(axisOf("--button-space-block")).toBe("padding");
    expect(axisOf("--control-trigger-space-inline-end")).toBe("padding");
  });

  it("lets a more specific axis to the RIGHT win over `-space-`", () => {
    expect(axisOf("--alert-space-gap")).toBe("gap");
    expect(axisOf("--dialog-close-space-offset")).toBe("offset");
  });

  // The trap that would enforce the wrong axis: this token is the WIDTH of a font-size picker.
  // Reading left to right would call it a font-size and demand it use the type scale.
  it("takes the RIGHTMOST axis, so a compound name resolves to its real axis", () => {
    expect(axisOf("--app-setting-picker-font-size-width")).toBe("width");
  });

  // The mirror trap: `-font-size`, `-icon-size` and `-line-height` all END where the bare `-size` /
  // `-height` inside them ends. Shortest-wins would fold the most disciplined axis into the least.
  it("prefers the longer axis when two end at the same place", () => {
    expect(axisOf("--x-font-size")).toBe("font-size");
    expect(axisOf("--x-icon-size")).toBe("icon-size");
    expect(axisOf("--x-line-height")).toBe("line-height");
    expect(axisOf("--x-max-width")).toBe("width");
  });

  // gh#324 split the two coherent axes out of `width` and `height` BY NAME, which only works
  // because of the longest-on-a-tie rule above: `-border-width` and `-row-height` end exactly
  // where the bare `-width` / `-height` they contain ends.
  it("separates a painted line from a container measure", () => {
    expect(axisOf("--control-border-width")).toBe("stroke");
    expect(axisOf("--avatar-presence-ring-width")).toBe("stroke");
    expect(axisOf("--table-flush-divider-width")).toBe("stroke");
    expect(axisOf("--toggle-count-forced-outline-width")).toBe("stroke");
    // …and leaves the measures alone.
    expect(axisOf("--auth-shell-card-max-width")).toBe("width");
    expect(axisOf("--app-setting-picker-timezone-width")).toBe("width");
  });

  // The false positive that made gh#324 drop `-rail-width` from the stroke patterns: one word
  // meant both a 6px painted stripe and the 4rem icon sidebar COLUMN.
  it("does not call the AppShell rail a stroke", () => {
    expect(axisOf("--app-shell-rail-width")).toBe("width");
  });

  it("separates a band from a container height", () => {
    expect(axisOf("--control-height-default")).toBe("band-height");
    expect(axisOf("--table-row-height-compact")).toBe("band-height");
    expect(axisOf("--menu-item-height")).toBe("band-height");
    expect(axisOf("--org-switcher-trigger-height")).toBe("band-height");
    expect(axisOf("--app-shell-bar-height")).toBe("band-height");
    expect(axisOf("--input-file-button-height")).toBe("band-height");
    // …and leaves the container measures alone.
    expect(axisOf("--select-content-max-height")).toBe("height");
    expect(axisOf("--chart-trend-plot-height-xs")).toBe("height");
    expect(axisOf("--transfer-pane-min-height")).toBe("height");
  });

  it("returns null for tokens that carry no geometry", () => {
    expect(axisOf("--card-background")).toBeNull();
    expect(axisOf("--badge-font-weight")).toBeNull();
    expect(axisOf("--shadow-glow")).toBeNull();
  });
});

describe("isScaleBypass — is this value a raw number", () => {
  it("flags a bare literal on an axis with a scale", () => {
    expect(isScaleBypass("0.8125rem", "font-size")).toBe(true);
    expect(isScaleBypass("13px", "font-size")).toBe(true);
    expect(isScaleBypass("0.9375rem 0.3125rem", "padding")).toBe(true);
  });

  it("accepts a step, and an alias of a token that resolves to one", () => {
    expect(isScaleBypass("var(--font-size-sm)", "font-size")).toBe(false);
    expect(isScaleBypass("var(--space-4)", "padding")).toBe(false);
    expect(isScaleBypass("var(--card-space-inset)", "padding")).toBe(false);
  });

  // Tier 2a: an arbitrary value is legitimate as long as it DERIVES from the axis's own scale.
  it("accepts a value derived from the axis's scale", () => {
    expect(isScaleBypass("calc(var(--space-4) + 2px)", "padding")).toBe(false);
    expect(isScaleBypass("calc(var(--radius) - 1px)", "radius")).toBe(false);
    expect(isScaleBypass("calc(var(--icon-size-md) * var(--scaling))", "icon-size")).toBe(false);
  });

  // The shape --control-icon-size used to go around the system with (gh#325): it references a var,
  // but not the axis's scale, so the 1rem inside it is still a raw number.
  it("still flags a literal scaled by a var that is not the axis's scale", () => {
    expect(isScaleBypass("calc(1rem * var(--scaling))", "icon-size")).toBe(true);
  });

  it("ignores values that only LOOK raw", () => {
    expect(isScaleBypass("0", "padding")).toBe(false);
    expect(isScaleBypass("0px", "padding")).toBe(false);
    expect(isScaleBypass("0 0 0 0", "padding")).toBe(false);
    expect(isScaleBypass("1px", "padding")).toBe(false); // the device hairline
    expect(isScaleBypass("100%", "padding")).toBe(false);
    expect(isScaleBypass("auto", "padding")).toBe(false);
    expect(isScaleBypass("max-content", "padding")).toBe(false);
    expect(isScaleBypass("inherit", "font-size")).toBe(false);
  });

  it("does not treat a unitless ratio as a length", () => {
    expect(isScaleBypass("1.5", "line-height")).toBe(false);
  });

  it("says nothing about an axis it does not know", () => {
    expect(isScaleBypass("28rem", "elevation")).toBe(false);
  });
});

describe("blankComments — a comment is never a declaration", () => {
  it("keeps the line count so reported line numbers stay true", () => {
    const css = "a\n/* two\n   three */\nfour\n";
    expect(blankComments(css).split("\n")).toHaveLength(css.split("\n").length);
  });

  it("hides a token quoted in prose, and a trailing annotation", () => {
    const css = [
      ":root {",
      "  /* the scale is --font-size-lg: 15.7px — do not hard-code it */",
      "  --x-padding: var(--space-4); /* 16px */",
      "}",
    ].join("\n");
    expect(scanCss(css).violations).toEqual([]);
  });
});

describe("exemptionFor — the one sanctioned escape", () => {
  const line = "  --x-size: 0.375rem;";

  it("honours a marker with a real reason on the declaration line", () => {
    const lines = [`${line} /* scale-exempt: 6px status dot, below --space-1 by design */`];
    expect(exemptionFor(lines, 0)).toBe("6px status dot, below --space-1 by design");
  });

  it("honours a marker on the line immediately above", () => {
    const lines = ["  /* scale-exempt: matches the 15px design-ref plate */", line];
    expect(exemptionFor(lines, 1)).toBe("matches the 15px design-ref plate");
  });

  it("rejects a marker with no real reason, so it cannot be used as a rubber stamp", () => {
    expect(exemptionFor([`${line} /* scale-exempt: x */`], 0)).toBeNull();
    expect(exemptionFor([`${line} /* scale-exempt: */`], 0)).toBeNull();
  });

  it("does not reach back two lines", () => {
    const lines = ["  /* scale-exempt: a perfectly good reason */", "  --other: 1;", line];
    expect(exemptionFor(lines, 2)).toBeNull();
  });
});

describe("scanCss — the whole verdict for one stylesheet", () => {
  const css = [
    ":root {",
    "  --x-padding: var(--space-4);",
    "  --x-gap: 0.375rem;",
    "  --x-font-size: 0.8125rem;",
    "  --x-icon-size: var(--icon-size-md);",
    "  --x-width: 28rem;",
    "  --x-radius: 0.375rem; /* scale-exempt: the notch this sits in is 6px, off every step */",
    "}",
  ].join("\n");

  it("reports only bypasses on ENFORCED axes, with the line number", () => {
    const { violations } = scanCss(css);
    expect(violations.map((v: { token: string; line: number }) => [v.token, v.line])).toEqual([
      ["--x-gap", 3],
      ["--x-font-size", 4],
    ]);
  });

  // An axis with no scale must NOT fail: there is nothing to write instead. `--x-width: 28rem` is
  // the exact case gh#324 measured at 91% raw, and it is a scale's job, not a guard's.
  it("leaves an axis with no scale alone, but still counts it in the census", () => {
    const { violations, perAxis } = scanCss(css);
    expect(violations.some((v: { axis: string }) => v.axis === "width")).toBe(false);
    expect(perAxis.width).toEqual({ viaScale: 0, raw: 1 });
  });

  it("moves an exempted declaration out of violations and into exemptions", () => {
    const { violations, exemptions } = scanCss(css);
    expect(violations.some((v: { token: string }) => v.token === "--x-radius")).toBe(false);
    expect(exemptions).toHaveLength(1);
    expect(exemptions[0]).toMatchObject({ token: "--x-radius", axis: "radius" });
    expect(exemptions[0].reason).toContain("off every step");
  });
});

describe("the axis table itself", () => {
  it("enforces exactly the axes that name a scale, and no others", () => {
    for (const axis of AXES) {
      expect(Boolean(axis.scale), `${axis.id} scale/enforced disagree`).toBe(axis.enforced);
    }
  });

  it("enforces the axes gh#332 asked for", () => {
    expect(ENFORCED_AXES).toEqual(
      expect.arrayContaining(["font-size", "padding", "gap", "radius"]),
    );
  });

  it("enforces the three axes gh#324 unlocked", () => {
    // stroke and band-height got a scale; line-height was unlocked by RENAMING the one length
    // that sat on an axis of unitless ratios. Both routes end in the same place — a gate.
    expect(ENFORCED_AXES).toEqual(expect.arrayContaining(["stroke", "band-height", "line-height"]));
  });

  it("records a VERDICT, not a to-do, on the four axes that are not scales", () => {
    // gh#324's finding: the loudest axis is not one axis. Leaving these as "waiting on a scale"
    // invites someone to invent one and force a dialog's 32rem onto a grid with an auth card's
    // 23.75rem. The reason has to survive in the table, so assert it is written there.
    for (const id of ["width", "height", "size", "offset"]) {
      const axis = AXES.find((entry: { id: string }) => entry.id === id)!;
      expect(axis.enforced, `${id} must stay unenforced`).toBe(false);
      expect(axis.scale, `${id} must name no scale`).toBeNull();
    }
  });

  // The tier-2 route, which is what keeps the two new gates honest.
  it("accepts a value derived from a step on the new axes", () => {
    expect(isScaleBypass("var(--stroke-md)", "stroke")).toBe(false);
    expect(isScaleBypass("calc(var(--stroke-md) + 1px)", "stroke")).toBe(false);
    expect(isScaleBypass("2px", "stroke")).toBe(true);
    expect(isScaleBypass("var(--band-height-md)", "band-height")).toBe(false);
    // The control ladder IS on the band scale, so stepping off it is tier 2, not a bypass.
    expect(
      isScaleBypass("calc(var(--control-height) - calc(0.25rem * var(--scaling)))", "band-height"),
    ).toBe(false);
    expect(isScaleBypass("2rem", "band-height")).toBe(true);
    // A LENGTH on the ratio axis is always a bypass — there is no step it could be.
    expect(isScaleBypass("1rem", "line-height")).toBe(true);
    expect(isScaleBypass("1.5", "line-height")).toBe(false);
    expect(isScaleBypass("calc(1.25 / 0.875)", "line-height")).toBe(false);
  });
});
