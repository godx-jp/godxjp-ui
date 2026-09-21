import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * THE STATIC CATALOG HAS TO ANSWER A TASK, NOT ONLY A NAME.
 *
 * An index of 165 name+tagline entries answers "does a component called X exist". It cannot answer
 * "build a settings page", because a tagline states an API SHAPE and a task is stated as an INTENT.
 * Measured against the index before this lane existed:
 *
 *   "build a settings page"            → drowned in PageContainer / CenteredShell / Form
 *   "confirm a destructive delete"     → the word "delete" appears nowhere; picks Dialog
 *   "async searchable country picker"  → none of async / searchable / country appear at all,
 *                                        so the agent writes the Combobox we deleted
 *
 * Two pieces of data close that, and both already existed MCP-side: the patterns (intent → whole
 * working screen) and `absorbed` (the names that do NOT exist, on the component that replaced
 * them). These assertions are the queries themselves, so the lane cannot regress silently.
 */
const AGENT = join(process.cwd(), "agent");
const read = (f: string) => JSON.parse(readFileSync(join(AGENT, f), "utf8"));

const patternIndex = read("patterns-index.json") as Array<Record<string, unknown>>;
const componentIndex = read("components-index.json") as Array<Record<string, unknown>>;

const finds = (rows: Array<Record<string, unknown>>, query: string) =>
  rows.filter((r) => JSON.stringify(r).toLowerCase().includes(query.toLowerCase()));

describe("the static catalog answers the queries it used to miss", () => {
  it.each([
    ["settings", "settings-page-responsive"],
    ["destructive", "confirm-destructive"],
    ["pagination", "data-table-page"],
    ["signup", "signup-form"],
  ])("a task phrased as %j reaches the %s pattern", (query, pattern) => {
    expect(finds(patternIndex, query).map((p) => p.name)).toContain(pattern);
  });

  /* The names an agent INVENTS, each on the component that absorbed it. These are the exact
   * spellings other libraries use, which is why they get typed. */
  it.each([
    ["Combobox", "Select"],
    ["Autocomplete", "Select"],
    ["CountrySelect", "Select"],
    ["SearchSelect", "Select"],
    ["DataGrid", "DataTable"],
    ["LocalePicker", "AppSettingPicker"],
    ["TimezonePicker", "AppSettingPicker"],
  ])("searching the index for the invented %s reaches %s", (invented, real) => {
    const hits = componentIndex.filter((c) => ((c.absorbed as string[]) ?? []).includes(invented));
    expect(hits.map((c) => c.name)).toEqual([real]);
  });

  /* The index is the one file an agent reads WHOLE, so its size is a feature. `absorbed` earns its
   * place by being search bait; it must not turn the index into another blob. */
  it("keeps the component index small enough to read whole", () => {
    const bytes = readFileSync(join(AGENT, "components-index.json")).length;
    expect(bytes).toBeLessThan(60_000);
  });

  it("publishes the patterns and the anti-AI-tells the MCP already served", () => {
    expect(patternIndex.length).toBeGreaterThan(10);
    expect((read("anti-ai-tells.json") as unknown[]).length).toBeGreaterThan(10);
    /* Selective retrieval, the same shape as components: index, then one file. */
    for (const p of patternIndex) expect(() => read(`patterns/${p.name}.json`)).not.toThrow();
  });
});
