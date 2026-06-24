import { describe, expect, it } from "vitest";

import { AUDIT_RULES, auditRulesByCategory, findAuditRule } from "./data/audit-rules";
import { dispatchTool, TOOL_DEFINITIONS } from "./tools/registry";

describe("audit-rules catalog", () => {
  it("every rule has an id, severity, category and fix", () => {
    for (const r of AUDIT_RULES) {
      expect(r.id).toMatch(/^[a-z][a-z0-9-]+$/);
      expect(["error", "warn"]).toContain(r.severity);
      expect(r.category.length).toBeGreaterThan(0);
      expect(r.fix.length).toBeGreaterThan(10);
    }
  });

  it("documents the international-standard a11y/i18n/rtl rules with a standard", () => {
    for (const id of [
      "icon-button-needs-name",
      "img-needs-alt",
      "no-positive-tabindex",
      "no-emoji-in-ui",
      "hardcoded-currency",
      "raw-intl-date",
      "no-physical-direction",
    ]) {
      const rule = findAuditRule(id);
      expect(rule, id).toBeDefined();
      expect(rule?.standard, id).toBeTruthy();
    }
  });

  it("ids are unique", () => {
    const ids = AUDIT_RULES.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("filters by category", () => {
    expect(auditRulesByCategory("a11y").every((r) => r.category === "a11y")).toBe(true);
    expect(auditRulesByCategory().length).toBe(AUDIT_RULES.length);
  });
});

describe("list_audit_rules tool", () => {
  it("is registered and dispatches", async () => {
    expect(TOOL_DEFINITIONS.some((t) => t.name === "list_audit_rules")).toBe(true);
    const out = await dispatchTool("list_audit_rules", {});
    expect(out).toMatch(/ui-audit\.mjs/);
    expect(out).toMatch(/WCAG 2\.2/);
    expect(out).toMatch(/before any visual review/i);
  });

  it("filters by category", async () => {
    const i18n = await dispatchTool("list_audit_rules", { category: "i18n" });
    expect(i18n).toMatch(/ISO 4217|Intl/);
    expect(i18n).not.toMatch(/icon-button-needs-name/);
  });
});
