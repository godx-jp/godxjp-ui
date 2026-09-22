import { readFileSync } from "node:fs";
import { posix, resolve } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * gh#870 — `component-api-manifest.json` must not record where the checkout sits.
 *
 * `checker.typeToString` spells an external type as `import("<specifier>").Name`, and that
 * specifier is resolved relative to the declaring FILE. Generated from the repo root it read
 * `../../../node_modules/…`; generated from `.claude/worktrees/agent-<id>/` — where every writing
 * agent works, by standing rule — it read `../../../../../../node_modules/…`, because the
 * worktree has no `node_modules` of its own and resolution walks up to the real repo root. Same
 * source, same API, different directory, and `check:component-api-manifest` red for whoever
 * committed second.
 *
 * Measured: with the old generator, a root run and a worktree run differed by 4 lines. With the
 * fix the two files are byte-identical.
 *
 * The danger was never the four lines. It was that both available responses — commit a path that
 * is wrong for the next checkout, or hand-revert part of a generator's output — teach that some of
 * `regen`'s output is noise you discard. The next time that file legitimately changes, the same
 * reflex deletes it.
 */

type Manifest = {
  components: Record<string, { props: { name: string; type?: string; declaredIn?: string[] }[] }>;
};

const manifest = JSON.parse(
  readFileSync(resolve(process.cwd(), "component-api-manifest.json"), "utf8"),
) as Manifest;

type Ref = { component: string; prop: string; specifier: string; declaredIn: string[] };

/** Every `import("…")` specifier the manifest records, with the file it was resolved against. */
function moduleRefs(): Ref[] {
  const out: Ref[] = [];
  for (const [component, entry] of Object.entries(manifest.components)) {
    for (const prop of entry.props) {
      for (const match of (prop.type ?? "").matchAll(/import\("([^"]*)"\)/g)) {
        out.push({
          component,
          prop: prop.name,
          specifier: match[1],
          declaredIn: prop.declaredIn ?? [],
        });
      }
    }
  }
  return out;
}

describe("component-api-manifest records no path that depends on the checkout location (gh#870)", () => {
  it("finds the specifiers it means to assert about", () => {
    // A control. The manifest is JSON with escaped quotes inside `type`; if that shape ever
    // changes, the two assertions below would pass over an empty list and this file would be
    // guarding nothing at all.
    expect(moduleRefs().length).toBeGreaterThan(0);
  });

  it("names every external package from its `node_modules/` boundary, never through a traversal or .pnpm", () => {
    const external = moduleRefs().filter((ref) => ref.specifier.includes("node_modules"));
    expect(external.length).toBeGreaterThan(0);
    for (const ref of external) {
      const where = `${ref.component}.${ref.prop}`;
      // `../../../node_modules/…` counts the levels between the declaring file and wherever the
      // dependency tree happens to live — the one fact about the environment, not the API.
      expect(ref.specifier.startsWith("node_modules/"), where).toBe(true);
      // `.pnpm/<name>@<version>/` additionally pins a RESOLVED VERSION, so the manifest churns on
      // every bump of a dependency whose public types did not change.
      expect(ref.specifier.includes(".pnpm/"), where).toBe(false);
    }
  });

  it("keeps every internal specifier inside the repo once resolved against its declaring file", () => {
    const internal = moduleRefs().filter((ref) => !ref.specifier.includes("node_modules"));
    for (const ref of internal) {
      for (const from of ref.declaredIn) {
        const resolved = posix.normalize(posix.join(posix.dirname(from), ref.specifier));
        // A specifier that climbs out of the repo is one whose target is only reachable from THIS
        // checkout — the same defect as the external case, wearing a relative path.
        expect(resolved.startsWith("../"), `${ref.component}.${ref.prop} → ${resolved}`).toBe(
          false,
        );
      }
    }
  });
});
