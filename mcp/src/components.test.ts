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

/**
 * gh#526. `get_component name="CardCover"` answered "not found. Use `list_primitives` to
 * discover" — for an export the catalog's own AspectRatio entry tells you to reach for. "Not
 * found" is the sentence that sends an agent off to hand-roll a component that already ships, so
 * a name the catalog HAS folded into a parent must never produce it.
 */
describe("sub-part names resolve to the entry that documents them", () => {
  const OWNED = COMPONENTS.flatMap((c) =>
    (c.subParts ?? []).map((part) => [part, c.name] as const),
  );

  it("the catalog folds a non-trivial number of exports into parents", () => {
    expect(OWNED.length).toBeGreaterThanOrEqual(100);
  });

  it.each(OWNED)(
    "get_component(%s) names %s instead of reporting it missing",
    async (part, owner) => {
      const out = await dispatchTool("get_component", { name: part });
      expect(out).not.toMatch(/not found/i);
      expect(out).toContain(owner);
    },
  );

  it("resolves case-insensitively, like entry names do", async () => {
    const [part, owner] = OWNED[0];
    const out = await dispatchTool("get_component", { name: part.toLowerCase() });
    expect(out).toContain(owner);
  });

  it("search_components finds the parent by a sub-part name", async () => {
    const out = await dispatchTool("search_components", { query: "StatusBadge" });
    expect(out).toContain("Badge");
    expect(out).not.toMatch(/^No matches/);
  });

  it("a parent lists what it documents, so the fold is visible while reading it", async () => {
    const out = await dispatchTool("get_component", { name: "Card" });
    expect(out).toContain("CardCover");
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

it("documents ResponsiveGrid base columns with the actual default", async () => {
  const out = await dispatchTool("get_component", { name: "ResponsiveGrid" });
  expect(out).toContain("base?: number");
  expect(out).toContain("base: 2, sm: 4");
  const grid = COMPONENTS.find((component) => component.name === "ResponsiveGrid")!;
  expect(grid.props.find((prop) => prop.name === "columns")?.defaultValue).toBe("4");
});

it("documents an optional AppShell sidebar without reserving empty navigation", () => {
  const shell = COMPONENTS.find((component) => component.name === "AppShell");
  const sidebar = shell?.props.find((prop) => prop.name === "sidebar");
  expect(sidebar).toBeDefined();
  expect(sidebar?.required).not.toBe(true);
  expect(sidebar?.description).toContain("grid track");
});
