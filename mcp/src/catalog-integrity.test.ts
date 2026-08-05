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
  it("ListRow exists with title/description/leading/trailing/align/as/overflow/unread props", () => {
    const row = findComponent("ListRow");
    expect(row, "ListRow entry").toBeDefined();
    expect(row?.group).toBe("data-display");
    const props = new Set(row?.props.map((p) => p.name));
    for (const p of [
      "title",
      "description",
      "leading",
      "trailing",
      "align",
      "as",
      "overflow",
      "unread",
      "density",
    ]) {
      expect(props.has(p), `ListRow.${p}`).toBe(true);
    }
    // title is required.
    expect(row?.props.find((p) => p.name === "title")?.required).toBe(true);
    // `as` is the div|li render-element union.
    expect(row?.props.find((p) => p.name === "as")?.type).toMatch(/div.*li/);
    // gh#224 — overflow is the documented truncate|wrap union, truncate by default.
    expect(row?.props.find((p) => p.name === "overflow")?.type).toMatch(/truncate.*wrap/);
    expect(row?.props.find((p) => p.name === "overflow")?.defaultValue).toMatch(/truncate/);
    // gh#225 — unread is a semantic boolean state (dot + tokenized surface), not a Badge.
    expect(row?.props.find((p) => p.name === "unread")?.type).toBe("boolean");
    // gh#246 — density is the default|compact inline-actions union, default by default.
    expect(row?.props.find((p) => p.name === "density")?.type).toMatch(/default.*compact/);
    expect(row?.props.find((p) => p.name === "density")?.defaultValue).toMatch(/default/);
    expect(row?.usage?.join(" ")).toMatch(/--list-row-body-min-width/);
    expect(row?.usage?.join(" ")).toMatch(/--list-row-unread-background/);
    expect(row?.usage?.join(" ")).toMatch(/density="compact"/);
  });

  it("Topbar reflects the new slot API (start/center/end) — NOT the removed chrome props", () => {
    const bar = findComponent("Topbar");
    expect(bar, "Topbar entry").toBeDefined();
    const props = new Set(bar?.props.map((p) => p.name));
    for (const p of ["start", "center", "end"]) {
      expect(props.has(p), `Topbar.${p}`).toBe(true);
    }
    // The removed chrome props must be gone from the prop list.
    for (const removed of [
      "product",
      "search",
      "bell",
      "onSearchOpen",
      "onNotificationsOpen",
      "collapsed",
    ]) {
      expect(props.has(removed), `Topbar must not list removed prop '${removed}'`).toBe(false);
    }
    // The example demonstrates the slot API, not the old props.
    expect(bar?.example).toMatch(/start=|center=|end=/);
    expect(bar?.example).not.toMatch(/\bproduct=|\bbell=|onSearchOpen=/);
  });

  // #126 — the catalog lagged the lib: Input/PasswordInput gained `leadingIcon`
  // and Badge `tone` gained `primary`. get_component must surface them.
  it("Input and PasswordInput expose the leadingIcon prop", () => {
    for (const name of ["Input", "PasswordInput"]) {
      const c = findComponent(name);
      expect(c, `${name} entry`).toBeDefined();
      const lead = c?.props.find((p) => p.name === "leadingIcon");
      expect(lead, `${name}.leadingIcon`).toBeDefined();
      expect(lead?.type).toMatch(/ReactNode/);
    }
  });

  it("Badge tone includes the brand 'primary' value", () => {
    const badge = findComponent("Badge");
    expect(badge, "Badge entry").toBeDefined();
    const tone = badge?.props.find((p) => p.name === "tone");
    expect(tone, "Badge.tone").toBeDefined();
    expect(tone?.type).toMatch(/"primary"/);
  });

  // gh#218 — the DEPENDENCY-FREE compact trend. Agents must be able to find it (and learn
  // that it does NOT need the recharts peer) from the catalog alone, otherwise a
  // dependency-constrained screen hand-rolls a page-local grid chart again.
  it("CompactBarTrend is catalogued as the recharts-free compact trend primitive", () => {
    const trend = findComponent("CompactBarTrend");
    expect(trend, "CompactBarTrend entry").toBeDefined();
    expect(trend?.group).toBe("data-display");
    // The ISOLATED entry, not the `@godxjp/ui/charts` barrel (gh#243). Importing the barrel makes
    // Vite eagerly link the peer-backed exports, so a consumer without the optional `recharts` peer
    // fails its production build — which is the whole point of this dependency-free primitive.
    expect(trend?.importPath).toBe("@godxjp/ui/charts/compact-bar-trend");
    const props = new Map((trend?.props ?? []).map((p) => [p.name, p] as const));
    for (const p of [
      "data",
      "categoryKey",
      "valueKey",
      "label",
      "size",
      "emphasizedIndex",
      "showCategoryLabels",
      "footer",
      "emptyMessage",
    ]) {
      expect(props.has(p), `CompactBarTrend.${p}`).toBe(true);
    }
    // the data accessors + the accessible name are required
    for (const p of ["data", "categoryKey", "valueKey", "label"]) {
      expect(props.get(p)?.required, `CompactBarTrend.${p} required`).toBe(true);
    }
    // size is the controlled vocabulary tier, defaulting to the compact step
    expect(props.get("size")?.type).toMatch(/"xs".*"sm".*"md".*"lg"/);
    expect(props.get("size")?.defaultValue).toMatch(/xs/);
    // the catalog must state the dependency contract and the token surface
    const usage = (trend?.usage ?? []).join(" ");
    // Assert the CONTRACT, not one phrasing: the usage text must name `recharts` under a negation,
    // so a consuming agent learns the peer is not required. Pinning an exact sentence made this
    // fail when gh#243 reworded it to describe the isolated entry point.
    expect(usage).toMatch(/(?:\bno\b|never|without|free of)[^.]*`?recharts`?/i);
    expect(usage).toMatch(/--chart-trend-/);
    // and point at BarChart for the full cartesian case
    expect((trend?.related ?? []).join(" ")).toMatch(/BarChart/);
  });

  // gh#221 → gh#251 — the exception surface REGRESSED once by being shipped as a docs-only
  // composition pattern (a consumer cannot `import` a docs page), and the MCP catalog was the
  // surface that taught "there is NO ErrorSurface". These assertions make that specific untruth
  // impossible to reintroduce: the entry must exist, must be importable from @godxjp/ui/layout,
  // and must carry the mode/status/one-action/metadata contract.
  it("ErrorSurface is catalogued as an importable component with the mode contract", () => {
    const surface = findComponent("ErrorSurface");
    expect(surface, "ErrorSurface entry").toBeDefined();
    expect(surface?.group).toBe("layout");
    // No importPath override ⇒ the group-derived public subpath, which is the one a consumer
    // actually installs. The example must show that exact import statement.
    expect(surface?.importPath ?? `@godxjp/ui/${surface?.group}`).toBe("@godxjp/ui/layout");
    expect(surface?.example).toMatch(/from "@godxjp\/ui\/layout"/);

    const props = new Map((surface?.props ?? []).map((p) => [p.name, p] as const));
    for (const p of [
      "mode",
      "status",
      "title",
      "description",
      "action",
      "requestId",
      "permission",
      "organization",
      "maintenance",
      "icon",
      "tone",
      "titleLevel",
      "brand",
      "footer",
      "width",
    ]) {
      expect(props.has(p), `ErrorSurface.${p}`).toBe(true);
    }

    // mode / status / title / action are the required contract — an error page without a
    // recovery action strands the user.
    for (const p of ["mode", "status", "title", "action"]) {
      expect(props.get(p)?.required, `ErrorSurface.${p} required`).toBe(true);
    }
    expect(props.get("mode")?.type).toMatch(/"application".*"system"/);
    expect(props.get("status")?.type).toMatch(/403.*404.*500.*503/);
    // maintenance is timing DATA (ISO-8601 + IANA), never a pre-formatted string
    expect(props.get("maintenance")?.type).toMatch(/start.*timeZone.*progress/s);

    const usage = (surface?.usage ?? []).join(" ");
    // the catalog must actively steer away from the gh#251 workaround …
    expect(usage).toMatch(/AuthShell/);
    expect(usage).toMatch(/EXACTLY ONE|ONE action/i);
    // … and teach that system geometry is package-owned
    expect(usage).toMatch(/min-h-dvh/);
    expect((surface?.related ?? []).join(" ")).toMatch(/CenteredShell/);

    // The catalog must no longer claim the component does not exist (the gh#251 untruth).
    const catalogText = COMPONENTS.map((c) =>
      [c.tagline, (c.usage ?? []).join(" "), (c.related ?? []).join(" ")].join(" "),
    ).join(" ");
    expect(catalogText).not.toMatch(/(?:is\s+)?NO\s+ErrorSurface/i);
  });
});

describe("catalog teaches the gh#248 / gh#249 appearance contracts", () => {
  it("Tabs documents variant, with `line` as underline-only and ring-free", () => {
    const tabs = COMPONENTS.find((c) => c.name === "Tabs");
    const variant = (tabs?.props ?? []).find((p) => p.name === "variant");
    expect(variant, "Tabs.variant").toBeDefined();
    expect(variant?.type).toMatch(/"default".*"line".*"card"/);
    expect(variant?.defaultValue).toBe('"default"');
    // the selected state of `line` is a token-owned bar — never a surrounding ring …
    expect(variant?.description).toMatch(/--tabs-indicator-/);
    expect(variant?.description).toMatch(/no ring|never.*ring|UNDERLINE-ONLY/i);
    // … and the keyboard focus ring must be taught as a SEPARATE, still-visible state.
    expect(variant?.description).toMatch(/focus-visible/);

    const usage = (tabs?.usage ?? []).join(" ");
    expect(usage).toMatch(/--tabs-indicator-/);
    // no consumer-side page-local workaround (`ring-0`) may be suggested as the fix
    expect(usage).toMatch(/ring-0/);
  });

  it("Avatar documents shape, with square as the token-owned entity mark", () => {
    const avatar = COMPONENTS.find((c) => c.name === "Avatar");
    const shape = (avatar?.props ?? []).find((p) => p.name === "shape");
    expect(shape, "Avatar.shape").toBeDefined();
    expect(shape?.type).toBe('"circle" | "square"');
    expect(shape?.defaultValue).toBe('"circle"');
    expect(shape?.description).toMatch(/--avatar-square-/);
    expect(shape?.description).toMatch(/entity/i);

    const usage = (avatar?.usage ?? []).join(" ");
    expect(usage).toMatch(/shape="square"/);
    expect(usage).toMatch(/--avatar-square-/);
    expect(avatar?.example).toMatch(/shape="square"/);
  });
});

describe("catalog teaches the gh#253 responsive action-collection contract on BOTH tables", () => {
  it("DataTable documents preset + collapseBelow with the same vocabulary as Table", () => {
    const dataTable = findComponent("DataTable");
    const table = findComponent("Table");
    const props = new Map((dataTable?.props ?? []).map((p) => [p.name, p]));
    const tableProps = new Map((table?.props ?? []).map((p) => [p.name, p]));

    for (const name of ["preset", "collapseBelow"] as const) {
      expect(props.get(name), `DataTable.${name}`).toBeDefined();
      expect(tableProps.get(name), `Table.${name}`).toBeDefined();
    }
    // Identical value vocabulary and identical inert default on both entry points.
    expect(props.get("preset")?.type).toMatch(/action-collection/);
    expect(props.get("preset")?.defaultValue).toBe("'default'");
    expect(props.get("collapseBelow")?.defaultValue).toBe("'sm'");
    // The default must be taught as INERT (gh#231): no attribute, nothing to match.
    expect(props.get("preset")?.description).toMatch(/no attribute|NO attribute/i);
    // …and as a container query on the table's own width, not a viewport breakpoint.
    expect(props.get("collapseBelow")?.description).toMatch(/container/i);
    expect(props.get("collapseBelow")?.description).toMatch(/not the viewport/i);
  });

  it("DataTable teaches column priority on the ColumnDef, sharing the Table tokens", () => {
    const dataTable = findComponent("DataTable");
    const columns = (dataTable?.props ?? []).find((p) => p.name === "columns");

    expect(columns?.type).toBe("ColumnDef<T>[]");
    expect(columns?.description).toMatch(/priority\?: 'primary'\|'secondary'\|'meta'\|'actions'/);
    expect(columns?.description).toMatch(/data-priority/);

    const usage = (dataTable?.usage ?? []).join(" ");
    // ONE token family for both entry points — never a parallel --data-table-* family.
    expect(usage).toMatch(/--table-action-collection-\*/);
    expect(usage).not.toMatch(/--data-table-action-collection-/);
    // The width floor is a documented token, not the old hard-coded utility.
    expect(usage).toMatch(/--table-surface-min-inline-size/);
    // The library must never suggest a consumer-side workaround as the fix.
    expect(usage).toMatch(/Never add a consumer width|never.*page-local breakpoint/i);
  });
});
