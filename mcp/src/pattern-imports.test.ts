import { describe, it, expect } from "vitest";

import { PATTERNS, findPattern } from "./data/patterns.js";
import { dispatchTool } from "./tools/registry.js";

/**
 * Catalog-level guard for the copy-paste patterns (issues #156 / #136 / #137 / #141).
 *
 * The authoritative "does every import resolve against the released package" check lives in
 * scripts/check-mcp-pattern-imports.mjs (it reads the real src barrels). These tests lock the
 * catalog-side invariants that must never regress and that a consumer agent depends on:
 *   - no pattern teaches the REMOVED Stack/Inline layout primitives;
 *   - no pattern names an undefined `settings-*` library CSS class;
 *   - the canonical async / table / settings / account patterns exist;
 *   - common alias slugs resolve (loading-states, filter-bar, settings-tabs …).
 */

const ALL_CODE = PATTERNS.map((p) => `${p.tagline}\n${p.code}`).join("\n\n");

describe("patterns never teach a removed component API", () => {
  it("no pattern imports Stack/Inline from @godxjp/ui", () => {
    for (const p of PATTERNS) {
      expect(
        /import\s+(?:type\s+)?\{[^}]*\b(?:Stack|Inline)\b[^}]*\}\s+from\s+["']@godxjp\/ui/.test(
          p.code,
        ),
        `pattern "${p.name}" imports the removed Stack/Inline primitive`,
      ).toBe(false);
    }
  });

  it('no pattern uses a <Stack>/<Inline> JSX tag (use <Flex direction="col">)', () => {
    for (const p of PATTERNS) {
      expect(/<\/?(?:Stack|Inline)(?=[\s/>])/.test(p.code), `pattern "${p.name}"`).toBe(false);
    }
  });

  it("no pattern references a StackProp/InlineProp/StackGapProp/InlineGapProp type", () => {
    expect(/\b(?:Stack|Inline)(?:Gap)?Prop\b/.test(ALL_CODE)).toBe(false);
  });
});

describe("patterns never name an undefined library CSS class", () => {
  it("no pattern uses a settings-* class (the library ships none)", () => {
    for (const p of PATTERNS) {
      const m = p.code.match(/\bsettings-(?:layout|local-nav|content|[a-z-]+)\b/);
      expect(m, `pattern "${p.name}" uses undefined class "${m?.[0]}"`).toBeNull();
    }
  });
});

describe("canonical consumer patterns exist", () => {
  it.each([
    "settings-page-responsive",
    "async-data-state",
    "data-table-page",
    "organization-memberships",
    "account-recovery-settings",
  ])("%s is catalogued", (name) => {
    expect(findPattern(name), name).toBeDefined();
  });
});

describe("common alias slugs resolve to the right pattern", () => {
  it.each([
    ["loading-states", "async-data-state"],
    ["filter-bar", "data-table-page"],
    ["settings-tabs", "settings-page-responsive"],
    ["organization-switcher", "organization-memberships"],
    ["backup-codes", "account-recovery-settings"],
  ])("%s → %s", (alias, canonical) => {
    expect(findPattern(alias)?.name).toBe(canonical);
  });

  it("get_pattern resolves an alias to the canonical pattern body", async () => {
    const out = await dispatchTool("get_pattern", { name: "filter-bar" });
    expect(out).toContain("data-table-page");
    expect(out).not.toMatch(/not found/i);
  });
});

describe("the async data-state pattern covers the full state taxonomy", () => {
  const code = findPattern("async-data-state")!.code;
  it.each([
    "prerequisite",
    "skeleton",
    "empty",
    "onAuthError",
    "classifyQueryError",
    "transient",
    "forbidden",
  ])("mentions %s", (token) => expect(code).toContain(token));
});
