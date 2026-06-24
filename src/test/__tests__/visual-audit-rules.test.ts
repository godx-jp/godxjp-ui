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
  // @ts-expect-error — plain .mjs script module, no types
} from "../../../scripts/visual-audit-rules.mjs";

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
