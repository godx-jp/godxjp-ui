import { globSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * A GENERATOR WITH A `--check` MODE NOBODY RUNS IS NOT A GATE. IT IS A COMMENT.
 *
 * `scripts/gen-component-tokens.mjs` has had `--check` since the MCP token catalog was first
 * generated, and every file it writes carries the line `Run \`pnpm check:mcp-token-sync\`` in its
 * header. That script did not exist in package.json. Nothing ran the mode, no workflow could, and
 * `mcp/src/data/component-tokens.generated.ts` was found stale on `main` — missing
 * `--progress-ring-*`, `--tabs-overflow-*`, `--tabs-list-line-space-gap` and
 * `--mobile-shell-max-inline-size`, still listing the removed `--segmented-item-height`. The
 * mechanism to catch that had been sitting in the repo the whole time, unreachable.
 *
 * `scripts/gen-email-tokens.mjs` was in exactly the same state (`check:email-token-sync`, named in
 * its own output, absent from package.json), which is what makes this a CLASS rather than an
 * oversight — so the guard is on the class.
 *
 * `check:gate-coverage` cannot see this: it audits `check:*` scripts that EXIST against the
 * workflows that run them, and a gate nobody ever declared is invisible to it. This test closes
 * the other side — declare the script, and gate-coverage then forces it to be reachable.
 */

const ROOT = process.cwd();
const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
const scripts: Record<string, string> = pkg.scripts ?? {};

function generatorsWithCheckMode(): string[] {
  return (
    globSync("scripts/gen-*.mjs", { cwd: ROOT })
      // Three spellings are in use — `process.argv.includes("--check")`, a `const check = …` binding,
      // and `args.includes("--check")` — so the detector looks for the FLAG being read, not for one
      // idiom. A generator that supports the mode and hides it from this glob is a generator this
      // guard is blind to, and the count assertion below is what notices when that happens.
      .filter((file) => /includes\(\s*"--check"\s*\)/.test(readFileSync(join(ROOT, file), "utf8")))
      .sort()
  );
}

describe("every generator's --check mode is a declared, runnable gate", () => {
  it("finds the generators it is meant to guard", () => {
    // Zero generators would make every assertion below vacuous — the failure mode of a guard
    // built on a glob.
    expect(generatorsWithCheckMode().length).toBeGreaterThanOrEqual(5);
  });

  it.each(generatorsWithCheckMode())("%s has a check: script that runs it with --check", (file) => {
    const runners = Object.entries(scripts).filter(
      ([name, body]) =>
        name.startsWith("check:") && body.includes(file) && body.includes("--check"),
    );
    expect(
      runners.map(([name]) => name),
      `${file} supports --check but no \`check:*\` script runs it, so nothing can ever run it. ` +
        `Add one to package.json; check:gate-coverage then makes a workflow run it.`,
    ).not.toEqual([]);
  });

  // The header this repo's generators print tells the reader which command to run. If that command
  // is not a real script, the instruction is wrong at the moment a reader needs it most.
  it.each(generatorsWithCheckMode())("%s names a script that exists in its own output", (file) => {
    const source = readFileSync(join(ROOT, file), "utf8");
    const named = [...source.matchAll(/pnpm (check:[\w:-]+)/g)].map((m) => m[1]);
    for (const name of new Set(named)) {
      expect(scripts[name], `${file} tells the reader to run \`pnpm ${name}\``).toBeDefined();
    }
  });

  // WHETHER each mode currently PASSES is deliberately not asserted here. Every one of them is a
  // declared `check:` script that a workflow runs (the assertions above plus check:gate-coverage
  // guarantee exactly that), and re-running the slow ones — the API manifest parses every source
  // file — inside the unit suite would buy a second copy of a gate CI already owns.
});
