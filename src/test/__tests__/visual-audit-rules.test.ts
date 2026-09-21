import { describe, expect, it } from "vitest";

// The visual-audit decision logic is pure (no browser) so it is unit-tested here;
// scripts/visual-audit.mjs only collects measurements from a real page and feeds them in.
import {
  VISUAL_RULES,
  oklchChroma,
  isOversaturated,
  isUndersizedTarget,
  hasEmoji,
  alertControlIssues,
  findVisualRule,
  CHROMA_LIMIT,
  isShippedBrandAccent,
  BRAND_ACCENT_TOLERANCE,
  // @ts-expect-error — plain .mjs script module, no types
} from "../../../scripts/visual-audit-rules.mjs";
// @ts-expect-error — generated .mjs (scripts/gen-email-tokens.mjs), no types
import { SHIPPED_BRAND_ACCENTS } from "../../../scripts/brand-accent.generated.mjs";

describe("oklchChroma / isOversaturated (渋み ≤ 0.18)", () => {
  it("greys have ~zero chroma", () => {
    expect(oklchChroma({ r: 128, g: 128, b: 128 })).toBeLessThan(0.01);
    expect(isOversaturated({ r: 128, g: 128, b: 128 })).toBe(false);
  });

  it("the SmartHR primary #0077c7 is allowed (restrained)", () => {
    // 0,119,199 — the design system's own primary should pass the bound.
    expect(isOversaturated({ r: 0, g: 119, b: 199 })).toBe(false);
  });

  it("a vivid raw blue (#1d4ed8 / loud Slack-style) is flagged", () => {
    expect(oklchChroma({ r: 29, g: 78, b: 216 })).toBeGreaterThan(CHROMA_LIMIT);
    expect(isOversaturated({ r: 29, g: 78, b: 216 })).toBe(true);
  });

  it("pure saturated red is flagged", () => {
    expect(isOversaturated({ r: 255, g: 0, b: 0 })).toBe(true);
  });
});

/**
 * gh#823 — the rule used to fire on this package's OWN `--primary` (#7A00FF, chroma 0.293), on
 * every page with a primary button, in every consumer, about a colour they receive from us and
 * cannot change. The carve-out is worth nothing unless it proves BOTH directions, so every test
 * here pairs "the brand goes quiet" with "a chosen accent still does not".
 */
describe("isShippedBrandAccent (gh#823 brand carve-out)", () => {
  const BRAND = { r: 122, g: 0, b: 255 }; // --primary: 268.7 100% 50% → #7A00FF

  it("the generated source really carries the shipped accent (the carve-out is not empty)", () => {
    // Without this the two directions below could both pass on an empty list — one because the
    // exemption never matched, the other because there was nothing to match.
    expect(SHIPPED_BRAND_ACCENTS.length).toBeGreaterThan(0);
    const primary = SHIPPED_BRAND_ACCENTS.find((a: { cssVars: string[] }) =>
      a.cssVars.includes("--primary"),
    );
    expect(primary).toBeTruthy();
    expect(primary.rgb).toEqual(BRAND);
    expect(primary.hsl).toBe("268.7 100% 50%");
  });

  it("the shipped brand accent is over the bound but produces NO finding", () => {
    // The exemption must be an exemption, not a quietly relaxed limit: the chroma is still 0.293.
    expect(oklchChroma(BRAND)).toBeCloseTo(0.293, 3);
    expect(oklchChroma(BRAND)).toBeGreaterThan(CHROMA_LIMIT);
    expect(isShippedBrandAccent(BRAND)).toBe(true);
    expect(isOversaturated(BRAND)).toBe(false);
  });

  it("a deliberately garish non-brand purple is STILL flagged", () => {
    // #9D00FF and #B026FF are what a tenant picks when they want "louder than the brand".
    for (const loud of [
      { r: 157, g: 0, b: 255 }, // #9D00FF, chroma 0.296
      { r: 176, g: 38, b: 255 }, // #B026FF, chroma 0.286
    ]) {
      expect(oklchChroma(loud)).toBeGreaterThan(CHROMA_LIMIT);
      expect(isShippedBrandAccent(loud)).toBe(false);
      expect(isOversaturated(loud)).toBe(true);
    }
  });

  it("tolerance ±1 absorbs an hsl() round trip but not a different colour", () => {
    expect(BRAND_ACCENT_TOLERANCE).toBe(1);
    // Inside: the furthest colour the window admits (ΔE 0.0027 — ~1/7 of a JND).
    expect(isOversaturated({ r: 123, g: 1, b: 254 })).toBe(false);
    // Outside by one step on a single channel — flagged again.
    expect(isOversaturated({ r: 124, g: 0, b: 255 })).toBe(true);
    expect(isOversaturated({ r: 120, g: 0, b: 255 })).toBe(true);
  });
});

describe("isUndersizedTarget (WCAG 2.5.8 — 24×24)", () => {
  it("flags a 20×20 icon button", () => {
    expect(isUndersizedTarget({ width: 20, height: 20 })).toBe(true);
  });
  it("passes a 24×24 (and larger) target", () => {
    expect(isUndersizedTarget({ width: 24, height: 24 })).toBe(false);
    expect(isUndersizedTarget({ width: 32, height: 40 })).toBe(false);
  });
  it("ignores zero-size (not laid out)", () => {
    expect(isUndersizedTarget({ width: 0, height: 0 })).toBe(false);
  });
});

describe("hasEmoji (Unicode UTS #51)", () => {
  it("flags emoji, ignores typographic punctuation", () => {
    expect(hasEmoji("All tests green 🎉")).toBe(true);
    expect(hasEmoji("done ✅")).toBe(true);
    expect(hasEmoji("田中 · 経理")).toBe(false); // middot
    expect(hasEmoji("plan — actual")).toBe(false); // em-dash
    expect(hasEmoji("¥1,200")).toBe(false);
  });
});

describe("alertControlIssues (Alert anatomy)", () => {
  it("the screenshot's banner: 2 icons, full-width action, column stack, bottom dismiss", () => {
    const issues = alertControlIssues({
      iconCount: 2,
      actionWidthRatio: 0.98,
      direction: "column",
      hasDismiss: true,
      dismissCorner: "other",
    });
    expect(issues.length).toBe(4);
  });

  it("a correct Alert reports no issues", () => {
    const issues = alertControlIssues({
      iconCount: 1,
      actionWidthRatio: 0.2,
      direction: "row",
      hasDismiss: true,
      dismissCorner: "top-right",
    });
    expect(issues).toEqual([]);
  });
});

describe("VISUAL_RULES catalog", () => {
  it("every rule has id/severity/category/standard/fix", () => {
    for (const r of VISUAL_RULES) {
      expect(r.id).toMatch(/^[a-z][a-z0-9-]+$/);
      expect(["warn", "error"]).toContain(r.severity);
      expect(r.standard.length).toBeGreaterThan(0);
      expect(r.fix.length).toBeGreaterThan(10);
    }
    expect(findVisualRule("oversaturated-accent")).toBeTruthy();
  });
});
