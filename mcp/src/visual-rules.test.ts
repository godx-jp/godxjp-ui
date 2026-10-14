import { describe, expect, it } from "vitest";

import { VISUAL_RULES, visualRulesByCategory, findVisualRule } from "./data/visual-rules";
import { dispatchTool, TOOL_DEFINITIONS } from "./tools/registry";

describe("visual-rules catalog", () => {
  it("every check has id/severity/category/standard/fix", () => {
    for (const r of VISUAL_RULES) {
      expect(r.id).toMatch(/^[a-z][a-z0-9-]+$/);
      expect(["error", "warn"]).toContain(r.severity);
      expect(r.standard.length).toBeGreaterThan(0);
      expect(r.fix.length).toBeGreaterThan(10);
    }
  });

  it("covers the runtime-only checks that static analysis can't", () => {
    for (const id of [
      "axe-violations",
      "target-size-min",
      "oversaturated-accent",
      "emoji-rendered",
      "alert-controls-misplaced",
    ]) {
      expect(findVisualRule(id), id).toBeTruthy();
    }
  });

  it("filters by category", () => {
    expect(visualRulesByCategory("color").every((r) => r.category === "color")).toBe(true);
  });

  it("documents the responsive probes and keeps C03 a human checklist rule", () => {
    for (const id of [
      "c01-content-reachable",
      "c02-search-usable",
      "c04-compact-account-name",
      "c05-compact-editor-inset",
      "c06-compact-actions",
      "c10-rail-toggle-attached",
      "c11-search-keyline",
      "c12-tracked-uppercase-label",
    ])
      expect(findVisualRule(id)?.kind, id).toBe("probe");
    for (const id of [
      "c03-single-brand",
      "c07-width-control",
      "c08-sidebar-field-edges",
      "c09-progress-role",
    ])
      expect(findVisualRule(id)?.kind, id).toBe("checklist");
  });
});

describe("list_visual_checks tool", () => {
  it("is registered and dispatches with the run command + browser note", async () => {
    expect(TOOL_DEFINITIONS.some((t) => t.name === "list_visual_checks")).toBe(true);
    const out = await dispatchTool("list_visual_checks", {});
    expect(out).toMatch(/visual-audit\.mjs/);
    expect(out).toMatch(/playwright/i);
    expect(out).toMatch(/before a visual review/i);
  });

  it("filters by category", async () => {
    const color = await dispatchTool("list_visual_checks", { category: "color" });
    expect(color).toMatch(/oversaturated-accent/);
    expect(color).not.toMatch(/target-size-min/);
  });
});
