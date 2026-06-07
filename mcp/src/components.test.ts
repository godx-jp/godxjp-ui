import { describe, it, expect } from "vitest";

import { dispatchTool } from "./tools/registry.js";
import { COMPONENTS, componentsByGroup, type ComponentGroup } from "./data/components.js";
import { findRule } from "./data/rules.js";

/**
 * Data-driven: every catalogued component must round-trip through the tools
 * and every rule it cites must exist. No hardcoded component list — the suite
 * grows automatically with the catalog.
 */

describe("component catalog integrity", () => {
  it("has a non-trivial, uniquely-named catalog", () => {
    expect(COMPONENTS.length).toBeGreaterThanOrEqual(30);
    const names = COMPONENTS.map((c) => c.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it.each(COMPONENTS.map((c) => [c.name] as const))(
    "get_component(%s) returns a full, well-formed guide",
    async (name) => {
      const out = await dispatchTool("get_component", { name });
      expect(out).toContain(name);
      expect(out).toContain("## Props");
      expect(out).toContain("**Import:**");
      expect(out).not.toMatch(/not found/i);
    },
  );

  it("every component is case-insensitively resolvable", async () => {
    for (const c of COMPONENTS) {
      const lower = await dispatchTool("get_component", { name: c.name.toLowerCase() });
      expect(lower).toContain(c.name);
    }
  });

  it("every rule cited by a component resolves to a real cardinal rule", () => {
    for (const c of COMPONENTS) {
      for (const n of c.rules) {
        expect(findRule(n), `${c.name} cites missing rule #${n}`).toBeDefined();
      }
    }
  });

  it("deprecated components are flagged so callers are steered away", async () => {
    const deprecated = COMPONENTS.filter((c) => c.deprecated);
    for (const c of deprecated) {
      const out = await dispatchTool("get_component", { name: c.name });
      expect(out).toMatch(/DEPRECATED/i);
    }
  });

  it("get_component reports (not throws) for an unknown name", async () => {
    expect(await dispatchTool("get_component", { name: "__nope__" })).toMatch(/not found/i);
  });
});

describe("list_primitives", () => {
  it("lists every component when unfiltered", async () => {
    const out = await dispatchTool("list_primitives", {});
    expect(out).toContain("@godxjp/ui");
    // every name appears
    for (const c of COMPONENTS.slice(0, 10)) expect(out).toContain(c.name);
  });

  const GROUPS: ComponentGroup[] = [
    "general",
    "layout",
    "data-display",
    "data-entry",
    "feedback",
    "navigation",
    "composites",
    "shell",
    "providers",
  ];

  it.each(GROUPS)("filters to group %s", async (group) => {
    const out = await dispatchTool("list_primitives", { group });
    const inGroup = componentsByGroup(group);
    if (inGroup.length === 0) {
      expect(out).toMatch(/No components/);
    } else {
      expect(out).toContain(inGroup[0].name);
    }
  });
});

describe("search_components", () => {
  it("ranks an exact-name match first", async () => {
    const target = COMPONENTS.find((c) => c.name === "DataTable") ?? COMPONENTS[0];
    const out = await dispatchTool("search_components", { query: target.name });
    expect(out).toContain(target.name);
  });

  it("empty query falls back to the full list", async () => {
    const out = await dispatchTool("search_components", { query: "" });
    expect(out).toContain("@godxjp/ui");
  });

  it("a no-match query says so", async () => {
    const out = await dispatchTool("search_components", { query: "zzzqqq___nope" });
    expect(out).toMatch(/No matches/i);
  });
});

describe("suggest_primitive", () => {
  const CASES: Array<[string, RegExp]> = [
    ["I need a registration form with validation", /Form \+ FormField/],
    ["render a table of rows and columns", /DataTable/],
    ["confirm a destructive delete", /confirm-destructive|AlertDialog/],
    ["a side panel drawer for filters", /Sheet/],
    ["show a toast notification", /Toaster|toast/],
    ["a loading spinner while saving", /Spinner/],
    ["an alert banner", /Alert/],
    ["a dropdown select", /Select/],
    ["a filter bar above a table", /filter-bar/],
  ];

  it.each(CASES)("%s → suggestion", async (useCase, expected) => {
    const out = await dispatchTool("suggest_primitive", { use_case: useCase });
    expect(out).toMatch(expected);
  });

  it("no match returns guidance", async () => {
    const out = await dispatchTool("suggest_primitive", { use_case: "zzz nonsense" });
    expect(out).toMatch(/No direct match/i);
  });

  it("empty use case asks for a description", async () => {
    expect(await dispatchTool("suggest_primitive", { use_case: "" })).toMatch(/Describe/i);
  });
});
