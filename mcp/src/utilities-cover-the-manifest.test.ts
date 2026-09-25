import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { UTILITIES, findUtility } from "./data/utilities.js";
import { dispatchTool } from "./tools/registry.js";

/**
 * EVERY NON-COMPONENT PUBLIC EXPORT MUST GET A REAL ANSWER (gh#951).
 *
 * The manifest is the machine-checked truth: `scripts/gen-component-api-manifest.mjs` walks the root
 * barrel and every group barrel with the TypeScript checker, so nothing can be added to the public
 * surface without appearing there. This test makes that list the gate on the catalog, which is why
 * it is written as a `.each` over the MANIFEST rather than over `UTILITIES` — iterating the catalog
 * would only ever prove the catalog agrees with itself, and the defect being guarded is a name the
 * catalog has never heard of.
 *
 * The cost of not having this, measured in godx-jp/godxjp-ui#947: `godx-task` and `godx-chat` each
 * hand-wrote a byte-identical 12-line `lib/utils.ts` wrapping clsx, because `get_component name="cn"`
 * answered `Component "cn" not found` while `cn` shipped from the root of the package.
 *
 * Sibling gate: `every-public-name-answers.test.ts` does the same for `manifest.components`.
 */

const manifest = JSON.parse(
  readFileSync(join(process.cwd(), "..", "component-api-manifest.json"), "utf8"),
) as {
  components: Record<string, unknown>;
  utilities: Record<string, { kind: string; subpaths: string[]; signature: string }>;
};

const MANIFEST_UTILITIES = Object.entries(manifest.utilities ?? {}).sort(([a], [b]) =>
  a.localeCompare(b),
);
const NAMES = MANIFEST_UTILITIES.map(([name]) => name);

/**
 * Exports the MCP answers for through `COMPONENTS` instead of `UTILITIES`, by name so that a new
 * export can never join them by accident.
 *
 * `formatDate` had a full `COMPONENTS` entry before this catalog existed, and it is a better entry
 * than a fresh one — it documents the `options.kind` auto-detection that decides what a caller sees.
 * One function, one source of truth.
 */
const ANSWERED_BY_COMPONENTS = new Set(["formatDate"]);
const CATALOGUED = NAMES.filter((name) => !ANSWERED_BY_COMPONENTS.has(name));

describe("the utilities catalog covers the manifest (gh#951)", () => {
  it("the manifest section is actually loaded — absent, every assertion below is vacuous", () => {
    // It is a NEW section, so "the file parsed" is not enough: an old manifest has no `utilities`
    // key at all, and `Object.entries(undefined ?? {})` is a silent empty pass.
    expect(manifest.utilities, "component-api-manifest.json has no `utilities` section").toBeDefined();
    expect(NAMES.length).toBeGreaterThan(20);
  });

  it.each(CATALOGUED)("%s has a catalog entry", (name) => {
    expect(findUtility(name), `${name} is exported but not in mcp/src/data/utilities.ts`).toBeDefined();
  });

  it.each(MANIFEST_UTILITIES.filter(([name]) => !ANSWERED_BY_COMPONENTS.has(name)))(
    "%s: kind and subpaths match the manifest",
    (name, entry) => {
      const catalogued = findUtility(name);
      expect(catalogued?.kind).toBe(entry.kind);
      // A subpath the catalog invents is an import line that throws for whoever copies it.
      expect([...(catalogued?.subpaths ?? [])].sort()).toEqual([...entry.subpaths].sort());
    },
  );

  it("the COMPONENTS exception really is answered there, and is not just excused", () => {
    // An allow-list that excuses without checking is how an exception becomes a hole.
    for (const name of ANSWERED_BY_COMPONENTS) {
      expect(findUtility(name), `${name} is excused AND catalogued — pick one`).toBeUndefined();
      expect(manifest.utilities[name], `${name} is excused but not exported`).toBeDefined();
    }
  });

  it("carries no name the package does not export", () => {
    // The other direction: an entry for something removed sends an agent to a dead import.
    const stale = UTILITIES.filter((u) => !manifest.utilities[u.name]).map((u) => u.name);
    expect(stale).toEqual([]);
  });

  it("no utility shadows a component name — one name, one kind of answer", () => {
    const clashes = UTILITIES.filter((u) => manifest.components[u.name]).map((u) => u.name);
    expect(clashes).toEqual([]);
  });

  it.each(NAMES)('get_component name="%s" answers instead of "not found"', async (name) => {
    /*
     * Through `get_component` deliberately. That is the tool an agent reaches for whatever the
     * name's shape, and being right about the taxonomy while answering "not found" is what sent two
     * products off to re-implement `cn`. The behaviour, not a proxy for it.
     */
    const answer = String(await dispatchTool("get_component", { name }));
    /*
     * The SENTINEL, not the phrase. Asserting `not.toContain("not found")` went red on
     * `classifyQueryError`, whose own tagline lists the error kinds it sorts — "offline,
     * unauthorised, not found, validation, server". A guard that reads text takes documentation
     * prose as input, so it has to match what the failure actually emits.
     */
    expect(answer).not.toContain(`Component "${name}" not found`);
    if (ANSWERED_BY_COMPONENTS.has(name)) {
      expect(answer).toContain(`# ${name}`);
      return;
    }
    expect(answer).toContain(`# ${name}`);
    expect(answer).toContain("## Signature");
  });

  it("list_utilities reaches every one of them, with an importable path", async () => {
    const answer = String(await dispatchTool("list_utilities", {}));
    for (const [name, entry] of MANIFEST_UTILITIES) {
      if (ANSWERED_BY_COMPONENTS.has(name)) continue;
      expect(answer).toContain(`\`${name}\``);
      const canonical = entry.subpaths.slice().sort()[0];
      expect(answer).toContain(`@godxjp/ui${canonical === "." ? "" : canonical.slice(1)}`);
    }
  });

  it("list_utilities filters by kind, and the filter is not a no-op", async () => {
    const hooks = String(await dispatchTool("list_utilities", { kind: "hook" }));
    expect(hooks).toContain("`useDebouncedValue`");
    // The negative half: a filter that returns everything would pass the line above.
    expect(hooks).not.toContain("`cn`");
  });

  it("search_components finds a utility by the TASK a consumer would type", async () => {
    // #947's actual failure: the query is a task, not a taxonomy. These words reached nothing.
    for (const [query, expected] of [
      ["class names", "cn"],
      ["debounce", "useDebouncedValue"],
      ["currency", "formatCurrency"],
    ] as const) {
      const answer = String(await dispatchTool("search_components", { query }));
      expect(answer, `search "${query}" should surface ${expected}`).toContain(`**${expected}**`);
    }
  });

  it("a hook's answer states the rule that makes it usable at all", async () => {
    const answer = String(await dispatchTool("get_component", { name: "useDebouncedValue" }));
    expect(answer).toContain("Rules of hooks");
  });

  it("a third-party re-export says so, and says not to import it directly", async () => {
    const answer = String(await dispatchTool("get_component", { name: "toast" }));
    expect(answer).toContain("sonner");
    expect(answer).toContain("never from that package directly");
  });
});
