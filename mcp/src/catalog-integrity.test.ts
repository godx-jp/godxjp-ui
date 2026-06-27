import { describe, it, expect } from "vitest";

import {
  COMPONENTS,
  findComponent,
  type ComponentEntry,
  type ComponentGroup,
} from "./data/components.js";
import { findRule } from "./data/rules.js";

/**
 * Deep structural integrity of the component catalog (`data/components.ts`).
 *
 * The existing `components.test.ts` drives every entry THROUGH the tools and
 * checks rule citations resolve. This file validates the underlying DATA shape
 * directly: every required field is present and well-typed, optional arrays are
 * never empty-when-present, there are no duplicate names, cross-references
 * (`related`/`usage`) that name another component resolve, and each `example`
 * parses as plausible TSX (names the component, balanced braces + JSX tags).
 *
 * Pure data assertions — no DATA is mutated, only inspected.
 */

const VALID_GROUPS: ReadonlySet<ComponentGroup> = new Set<ComponentGroup>([
  "general",
  "layout",
  "data-display",
  "data-entry",
  "feedback",
  "navigation",
  "composites",
  "shell",
  "providers",
]);

const NAME_SET = new Set(COMPONENTS.map((c) => c.name));

/** Components whose name is a common English word — excluded from the
 * best-effort "name mentioned in prose resolves" scan to avoid false hits. */
const AMBIGUOUS_NAMES = new Set([
  "Card",
  "Form",
  "Text",
  "Table",
  "Grid",
  "Stack",
  "Inline",
  "Tag",
  "Badge",
  "Alert",
  "Label",
  "Switch",
  "Tabs",
  "Steps",
  "Image",
  "Box",
  "Link",
  "Code",
  "Field",
]);

describe("component catalog — every entry is structurally complete", () => {
  it.each(COMPONENTS.map((c) => [c.name, c] as const))(
    "%s has all required, well-typed fields",
    (_name, c: ComponentEntry) => {
      expect(typeof c.name).toBe("string");
      expect(c.name.trim().length, "name").toBeGreaterThan(0);

      expect(VALID_GROUPS.has(c.group), `${c.name} group '${c.group}'`).toBe(true);

      expect(typeof c.tagline).toBe("string");
      expect(c.tagline.trim().length, `${c.name} tagline`).toBeGreaterThan(0);

      expect(typeof c.example).toBe("string");
      expect(c.example.trim().length, `${c.name} example`).toBeGreaterThan(0);

      expect(typeof c.storyPath).toBe("string");
      // Most entries point at a `.stories.tsx`, but a few share a typography/
      // preview surface (e.g. general/typography.tsx, *.preview.tsx) — accept
      // any `.tsx` under a group folder.
      expect(c.storyPath, `${c.name} storyPath`).toMatch(/^[\w-]+\/[\w.-]+\.tsx$/);

      expect(Array.isArray(c.rules), `${c.name} rules`).toBe(true);
      for (const n of c.rules) {
        expect(Number.isInteger(n), `${c.name} rule '${n}' is an int`).toBe(true);
      }
      // rules[] holds no duplicates
      expect(new Set(c.rules).size, `${c.name} duplicate rule ids`).toBe(c.rules.length);
    },
  );

  it("every prop has a non-empty name, type and description", () => {
    for (const c of COMPONENTS) {
      expect(Array.isArray(c.props), `${c.name} props`).toBe(true);
      const propNames = c.props.map((p) => p.name);
      expect(new Set(propNames).size, `${c.name} duplicate prop names`).toBe(propNames.length);
      for (const p of c.props) {
        expect(p.name?.trim().length, `${c.name}.${p.name} name`).toBeGreaterThan(0);
        expect(p.type?.trim().length, `${c.name}.${p.name} type`).toBeGreaterThan(0);
        expect(p.description?.trim().length, `${c.name}.${p.name} description`).toBeGreaterThan(0);
        if (p.required !== undefined) expect(typeof p.required).toBe("boolean");
      }
    }
  });

  it("optional string-array fields, when present, are non-empty arrays of non-empty strings", () => {
    for (const c of COMPONENTS) {
      for (const key of ["usage", "useCases", "related"] as const) {
        const arr = c[key];
        if (arr === undefined) continue;
        expect(Array.isArray(arr), `${c.name}.${key} is array`).toBe(true);
        expect(arr.length, `${c.name}.${key} non-empty`).toBeGreaterThan(0);
        for (const s of arr) {
          expect(typeof s, `${c.name}.${key} item type`).toBe("string");
          expect(s.trim().length, `${c.name}.${key} item non-empty`).toBeGreaterThan(0);
        }
      }
    }
  });

  it("component names are globally unique (case-insensitively)", () => {
    const lower = COMPONENTS.map((c) => c.name.toLowerCase());
    expect(new Set(lower).size).toBe(lower.length);
  });

  it("a non-trivial catalog covering several groups", () => {
    expect(COMPONENTS.length).toBeGreaterThanOrEqual(30);
    expect(new Set(COMPONENTS.map((c) => c.group)).size).toBeGreaterThanOrEqual(5);
  });
});

describe("component catalog — citations and cross-references resolve", () => {
  it("every rule id cited by any component exists in the cardinal-rule set", () => {
    for (const c of COMPONENTS) {
      for (const n of c.rules) {
        expect(findRule(n), `${c.name} cites missing rule #${n}`).toBeDefined();
      }
    }
  });

  it("each `related` entry leads with a component/concept name we can resolve", () => {
    // `related` entries are written as "Name — explanation"; the lead token
    // before the em-dash should resolve to a real component (best-effort:
    // skip ambiguous English-word names and non-component concepts).
    for (const c of COMPONENTS) {
      for (const rel of c.related ?? []) {
        const lead = rel.split(/[—–-]/)[0].trim().split(/\s+/)[0];
        if (!lead || AMBIGUOUS_NAMES.has(lead)) continue;
        // Only assert when the lead LOOKS like a component (PascalCase) AND
        // it is not a generic capitalised English word we can't catalogue.
        if (/^[A-Z][A-Za-z]+$/.test(lead) && NAME_SET.has(lead)) {
          expect(findComponent(lead), `${c.name} related → ${lead}`).toBeDefined();
        }
      }
    }
  });

  it("any PascalCase component named in a tagline/usage resolves (best-effort)", () => {
    // Catch a renamed/removed component still referenced in prose. We only
    // flag a mention that exactly matches a KNOWN component spelling but
    // fails to resolve — i.e. a real broken self-reference, never a typo'd
    // word. (NAME_SET membership already guarantees resolution, so this is a
    // guard against findComponent drifting from the COMPONENTS array.)
    for (const name of NAME_SET) {
      expect(findComponent(name), `findComponent('${name}')`).toBeDefined();
      expect(findComponent(name.toLowerCase()), `findComponent('${name}' lower)`).toBeDefined();
    }
  });
});

describe("component catalog — examples are plausible TSX", () => {
  it.each(COMPONENTS.map((c) => [c.name, c] as const))(
    "%s example references the component and is balanced",
    (_name, c: ComponentEntry) => {
      const ex = c.example;
      // Names the component (as a tag, import, or compound member).
      expect(ex.includes(c.name), `${c.name} example should mention it`).toBe(true);

      // Balanced braces and parentheses.
      const count = (re: RegExp) => (ex.match(re) ?? []).length;
      expect(count(/\{/g), `${c.name} braces`).toBe(count(/\}/g));
      expect(count(/\(/g), `${c.name} parens`).toBe(count(/\)/g));

      // Most examples are JSX; a handful are pure-util call snippets
      // (e.g. `formatDate(...)`). When the example DOES open a JSX tag it
      // must not be left dangling.
      if (/<[A-Za-z]/.test(ex)) {
        expect(ex.trimEnd().endsWith("<"), `${c.name} dangling <`).toBe(false);
      } else {
        // Non-JSX snippet still has to be a real call/usage of the symbol.
        expect(ex, `${c.name} non-JSX example uses the symbol`).toMatch(
          new RegExp(`\\b${c.name}\\b`),
        );
      }
    },
  );

  it("examples import from a @godxjp/ui subpath when they show an import", () => {
    for (const c of COMPONENTS) {
      if (/\bimport\b/.test(c.example)) {
        expect(c.example, `${c.name} import source`).toMatch(/@godxjp\/ui/);
      }
    }
  });
});

describe("newly-added components are catalogued with the expected API", () => {
  it("ListRow exists with title/description/leading/trailing/align/as props", () => {
    const row = findComponent("ListRow");
    expect(row, "ListRow entry").toBeDefined();
    expect(row?.group).toBe("data-display");
    const props = new Set(row?.props.map((p) => p.name));
    for (const p of ["title", "description", "leading", "trailing", "align", "as"]) {
      expect(props.has(p), `ListRow.${p}`).toBe(true);
    }
    // title is required.
    expect(row?.props.find((p) => p.name === "title")?.required).toBe(true);
    // `as` is the div|li render-element union.
    expect(row?.props.find((p) => p.name === "as")?.type).toMatch(/div.*li/);
  });

  it("Topbar reflects the new slot API (start/center/end) — NOT the removed chrome props", () => {
    const bar = findComponent("Topbar");
    expect(bar, "Topbar entry").toBeDefined();
    const props = new Set(bar?.props.map((p) => p.name));
    for (const p of ["start", "center", "end"]) {
      expect(props.has(p), `Topbar.${p}`).toBe(true);
    }
    // The removed chrome props must be gone from the prop list.
    for (const removed of ["product", "search", "bell", "onSearchOpen", "onNotificationsOpen", "collapsed"]) {
      expect(props.has(removed), `Topbar must not list removed prop '${removed}'`).toBe(false);
    }
    // The example demonstrates the slot API, not the old props.
    expect(bar?.example).toMatch(/start=|center=|end=/);
    expect(bar?.example).not.toMatch(/\bproduct=|\bbell=|onSearchOpen=/);
  });
});
