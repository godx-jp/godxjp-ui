import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

/**
 * gh#586 — the manifest published an inherited prop when its NAME appeared anywhere in the module
 * text, comments included:
 *
 *     const isHandledByImplementation = new RegExp(`\\b${prop.name}\\b`).test(implementationSource);
 *
 * Reproduced on `main` before the fix: adding one comment line to `typography.tsx` saying the
 * component does NOT take `defaultValue` grew `Text` from 33 published props to 34, the extra one
 * being `defaultValue`. The comment denied the prop; the generator published it.
 *
 * That matters because `component-api-manifest.json` is the ground truth eight scripts read, and
 * it is what `get_component` tells an agent. A prop that does not exist, told to an agent, is
 * written into a consumer and arrives as `undefined` at runtime.
 *
 * THIS TEST IS THE REPRODUCTION, not a proxy for it. It mutates a real source file, regenerates,
 * asserts the surface did not move, and restores the file. The earlier fix attempt was reverted
 * partly because its own test could not see the case it was written for — see the file's history.
 */

const root = process.cwd();
const target = join(root, "src/components/general/typography.tsx");
const manifest = join(root, "component-api-manifest.json");

let originalSource: string | null = null;
let originalManifest: string | null = null;

function generate(): Record<string, { props: { name: string }[] }> {
  execFileSync(process.execPath, [join(root, "scripts/gen-component-api-manifest.mjs")], {
    cwd: root,
    stdio: "ignore",
  });
  return JSON.parse(readFileSync(manifest, "utf8")).components;
}

const propNames = (components: Record<string, { props: { name: string }[] }>, name: string) =>
  components[name]!.props.map((prop) => prop.name).sort();

afterEach(() => {
  if (originalSource !== null) writeFileSync(target, originalSource);
  if (originalManifest !== null) writeFileSync(manifest, originalManifest);
  originalSource = null;
  originalManifest = null;
});

describe("a comment cannot create a public prop (gh#586)", () => {
  /*
   * EXPLICIT TIMEOUT, and it is not padding. Each `generate()` spawns the real generator, which
   * runs the TypeScript compiler over the whole project: 3s on a laptop, and it blew through
   * vitest's 8000ms default on the shared CI pool — this very file failed shard 4/4 on the 23.4.1
   * release commit, with a timeout rather than an assertion, and the tag could not be pushed.
   *
   * Running the generator for real is the point: the bug was a REGEX over source text, so a test
   * that stubbed the generator would prove nothing. The cost is accepted and bounded here instead
   * of being hidden by making the test weaker.
   */
  const SPAWNS_THE_GENERATOR = 120_000;

  it(
    "adding a comment that NAMES an inherited prop does not publish it",
    () => {
      originalSource = readFileSync(target, "utf8");
      originalManifest = readFileSync(manifest, "utf8");

      const before = propNames(generate(), "Text");
      expect(
        before,
        "Text should publish a real surface, or this test proves nothing",
      ).not.toHaveLength(0);
      expect(before).not.toContain("defaultValue");

      // The exact mutation from the issue: a comment that DENIES the prop.
      writeFileSync(target, `// this component does NOT accept defaultValue\n${originalSource}`);
      const after = propNames(generate(), "Text");

      expect(after).toEqual(before);
    },
    SPAWNS_THE_GENERATOR,
  );

  it(
    "a prop genuinely forwarded through {...rest} IS published",
    () => {
      // The other half, and the reason the first attempt at this fix was reverted. `PasswordInput`
      // destructures what it needs and writes `<Input {...props} />`, so `value` reaches a real
      // `<input>`. An AST detector that counts only destructured names drops it, and
      // `audit:component-cases` then reports "evidence references a stale or nonexistent public
      // prop" about a prop that is neither.
      // REGENERATED, not read from the committed file. Reading the committed manifest passes even
      // when the detector has stopped finding the prop — measured: deleting the forwarding rule left
      // this test green until it generated its own answer.
      originalManifest = readFileSync(manifest, "utf8");
      expect(propNames(generate(), "PasswordInput")).toContain("value");
    },
    SPAWNS_THE_GENERATOR,
  );
});
