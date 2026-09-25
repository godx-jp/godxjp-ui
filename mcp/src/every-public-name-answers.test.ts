import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { dispatchTool } from "./tools/registry.js";

/**
 * Every name a consumer can import must get a REAL answer from `get_component`.
 *
 * This is the assertion gh#553 asked for, and it is written the one way that would actually have
 * caught the defect: by calling the tool. Four separate guards were green while `Swatch` — added
 * one release earlier for gh#527 — answered "not found":
 *
 *   1. `pnpm typecheck` never saw it. The root `tsconfig.json` includes only `["src"]`, so
 *      `mcp/` was not typechecked by anything. TypeScript diagnoses the exact defect (TS1117,
 *      "An object literal cannot have multiple properties with the same name") the moment it is
 *      pointed at the file — there is now a `typecheck:mcp` script, and it runs in CI.
 *   2. `check:mcp-catalog-coverage` searches the catalog text with `String.includes`, so the word
 *      "Swatch" appearing in another entry's `related` prose satisfied it.
 *   3. `check:mcp-catalog-completeness` REIMPLEMENTS the sub-part fallback rather than calling it,
 *      so its model of "documented" and the server's disagreed, and only the server was right.
 *   4. The 317 assertions in `catalog-integrity.test.ts` inspect entries that EXIST. The defect
 *      was an entry that had stopped existing: a rebase merged the `Swatch` object into the
 *      `FeatureList` object that followed it, and the later `name:` won. One entry, not two — and
 *      nothing that counts or validates entries can see a thing that is no longer there.
 *
 * So this test asserts the OBSERVABLE BEHAVIOUR — what an agent gets back — rather than any proxy
 * for it. A proxy is what failed.
 */

const manifest = JSON.parse(
  readFileSync(join(process.cwd(), "..", "component-api-manifest.json"), "utf8"),
) as { components: Record<string, unknown> };

const PUBLIC_NAMES = Object.keys(manifest.components).sort();

describe("get_component answers for every public export (gh#553)", () => {
  it("the manifest is actually loaded — an empty list would make every assertion below vacuous", () => {
    expect(PUBLIC_NAMES.length).toBeGreaterThan(200);
  });

  it.each(PUBLIC_NAMES)('get_component name="%s" is not "not found"', async (name) => {
    const answer = await dispatchTool("get_component", { name });
    expect(answer).not.toContain("not found");
  });

  /*
   * The two house shapes that gh#957 un-folded, pinned BY NAME for the same reason `Swatch` is.
   *
   * `Skeleton` declared `subParts: ["SkeletonDetail", "SkeletonStat"]`, so both answered with the
   * fallback — 325 characters telling the agent to "call get_component name=\"Skeleton\" for its
   * props", which a propless fixed shape does not have. Their three siblings named in the same
   * source comment (`SkeletonRows`, `SkeletonTable`, `SkeletonArticle`) each had a full entry, so
   * four peers had two treatments. After: 3119 and 3147 characters, own entry.
   *
   * By NAME and not as a rule, deliberately. Two candidate rules were measured and rejected: "the
   * parent must mention its sub-part in prose" flags 35 of 135 legitimate sub-parts
   * (`DialogPortal`, `AlertDialogTitle`…), and "a zero-prop entry must have its own entry" flags 42,
   * because the manifest lists only props this repo OWNS. The distinction here is a judgement — a
   * standalone shape versus a part composed inside its parent — so it is recorded, not inferred.
   */
  it.each(["SkeletonDetail", "SkeletonStat"])(
    "%s resolves to its OWN entry — it is a sibling shape, not a part of Skeleton (gh#957)",
    async (name) => {
      const answer = await dispatchTool("get_component", { name });
      expect(answer).toContain(`# ${name}`);
      expect(answer).not.toContain("documented as part of");
    },
  );

  it("Swatch specifically resolves to its OWN entry, not to a sub-part fallback", async () => {
    // The fallback sentence ("ships, and it is documented as part of …") is a legitimate answer
    // for CardHeader. For Swatch it would mean the entry was lost again and something else
    // absorbed it, which is precisely how this shipped.
    const answer = await dispatchTool("get_component", { name: "Swatch" });
    expect(answer).toContain("# Swatch");
    expect(answer).not.toContain("documented as part of");
  });
});
