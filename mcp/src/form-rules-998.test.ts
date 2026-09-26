import { describe, expect, it } from "vitest";

import { AUDIT_RULES } from "./data/audit-rules.js";
import { FORM_RULES, dispatchTool } from "./tools/registry.js";

/**
 * FORM RULES REACH THE AGENT WHERE IT IS ALREADY LOOKING (gh#998).
 *
 * A consumer agent reads `get_component` / `search_components` before it writes a form. The block
 * is printed with every data-entry component and every search that returns one — and only there,
 * so it does not become noise an agent learns to skip.
 */
describe("FORM RULES in the MCP answers (gh#998)", () => {
  it.each(["FormField", "Form", "Input", "Select"])("get_component %s carries it", async (name) => {
    expect(await dispatchTool("get_component", { name })).toContain("**FORM RULES**");
  });

  it("a non-form component does not — Button", async () => {
    expect(await dispatchTool("get_component", { name: "Button" })).not.toContain("FORM RULES");
  });

  it("search_components returning a data-entry hit carries it once", async () => {
    const out = await dispatchTool("search_components", { query: "select" });
    expect(out.split("**FORM RULES**")).toHaveLength(2);
  });

  it("a search with no data-entry hit does not", async () => {
    expect(await dispatchTool("search_components", { query: "breadcrumb" })).not.toContain(
      "FORM RULES",
    );
  });

  it("every ui-audit rule the block names exists in the audit catalog", () => {
    const named = [...FORM_RULES.matchAll(/`([a-z]+(?:-[a-z]+)+)`/g)].map((m) => m[1]);
    const ids = new Set(AUDIT_RULES.map((r) => r.id));
    const ruleNames = named.filter((n) => /needs|too-big|hint/.test(n));
    expect(ruleNames).toEqual(["formfield-needs-form", "dialog-form-too-big", "select-width-hint"]);
    for (const n of ruleNames) expect(ids.has(n), n).toBe(true);
  });
});
