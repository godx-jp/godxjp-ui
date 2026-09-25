import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * THE MANIFEST READ "TAKES NO PROPS" AS "IS NOT A COMPONENT" (gh#957).
 *
 * Its model is "take the first parameter and enumerate its properties", so the admission rule was
 * `if (!parameter) continue`. A fixed shape has no parameter to take:
 *
 *     export function SkeletonDetail() { … }   // the house shape for a record
 *     export function SkeletonStat() { … }     // the house shape for a KPI tile
 *
 * Measured: 10 of the 12 `Skeleton*` components were in the manifest, and the two missing ones were
 * exactly the two that take no props.
 *
 * Why that mattered beyond a missing row: `mcp/src/every-public-name-answers.test.ts` takes its
 * keys FROM this manifest, so a name that never entered was never asked about — the same shape as
 * the gh#553 defect that gate exists to stop ("nothing that counts or validates entries can see a
 * thing that is no longer there").
 *
 * This asserts the COMMITTED manifest rather than re-running the generator, because
 * `check:component-api-manifest` already fails when the two disagree — so pinning the data pins the
 * generator transitively, for 1ms instead of the ~13s a fresh TypeScript program costs.
 */

const manifest = JSON.parse(readFileSync(resolve("component-api-manifest.json"), "utf8")) as {
  components: Record<string, { group: string; props: unknown[] }>;
};

describe("the manifest admits a component that takes no props (gh#957)", () => {
  it("is actually loaded — an empty map would make every assertion below vacuous", () => {
    expect(Object.keys(manifest.components).length).toBeGreaterThan(290);
  });

  it.each(["SkeletonDetail", "SkeletonStat"])("%s is present, with no props", (name) => {
    expect(manifest.components[name]).toEqual({ group: "feedback", props: [] });
  });

  it("the whole Skeleton family is present — 10 of 12 was the defect", () => {
    // Named rather than counted: a count passes again the moment someone adds a thirteenth.
    const family = [
      "Skeleton",
      "SkeletonArticle",
      "SkeletonAvatar",
      "SkeletonButton",
      "SkeletonDetail",
      "SkeletonForm",
      "SkeletonImage",
      "SkeletonInput",
      "SkeletonNode",
      "SkeletonRows",
      "SkeletonStat",
      "SkeletonTable",
    ];
    const missing = family.filter((name) => !manifest.components[name]);
    expect(missing).toEqual([]);
  });

  it("propless is not the same as no OWNED props — the rule must not key on an empty array", () => {
    /*
     * This is the negative case, and it is the reason this file does not also ship a gate saying
     * "every zero-prop entry must have its own catalog entry". Measured: 42 entries carry
     * `props: []`, because the manifest lists only props THIS repo owns — `CardDescription`,
     * `DialogFooter` and `TableBody` take props and still land empty. A gate keyed on the empty
     * array would flag ~40 legitimate sub-parts, so there is no cheap mechanical test for the
     * classification half of gh#957; it is pinned by name in the MCP suite instead.
     */
    const empty = Object.entries(manifest.components)
      .filter(([, entry]) => entry.props.length === 0)
      .map(([name]) => name);

    expect(empty.length).toBeGreaterThan(30);
    expect(empty).toContain("DialogFooter");
    expect(empty).toContain("TableBody");
  });
});
