import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * A peer the CORE entry cannot reach must be declared optional.
 *
 * gh#546 reported that 8 of 10 peers were mandatory, so an app that only wanted `<Button>` was
 * still made to install a router, a query client, a form library and zod — or swallow a peer
 * warning on every `npm install`.
 *
 * The report deliberately stopped short of claiming `import { Button }` pulls a router into the
 * bundle, because it had no measurement for that. The repo did: `check:core-isolation` walks the
 * built root entry's import graph and fails if it reaches any of a FORBIDDEN list. That gate is
 * green, which proves those packages are NOT in the core graph — so the defect was never the code,
 * it was the manifest, and it closes with a JSON block rather than a refactor.
 *
 * This test is the rule that keeps the two in step. Without it the pair drifts silently in either
 * direction, and both directions are bad: a package added to FORBIDDEN but left mandatory forces an
 * install nobody needs, and one removed from FORBIDDEN while still optional means a core import can
 * fail at build time in a consumer that followed the manifest exactly.
 */

const ROOT = process.cwd();
const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
  peerDependencies: Record<string, string>;
  peerDependenciesMeta: Record<string, { optional?: boolean }>;
};
const isolation = readFileSync(join(ROOT, "scripts/check-core-isolation.mjs"), "utf8");

/** The FORBIDDEN list from the gate itself — read, never re-typed, or this test proves nothing. */
function forbidden(): string[] {
  const at = isolation.indexOf("const FORBIDDEN = [");
  expect(at, "FORBIDDEN list not found in check-core-isolation.mjs").toBeGreaterThan(-1);
  const body = isolation.slice(at, isolation.indexOf("]", at));
  return [...body.matchAll(/"([^"]+)"/g)].map((m) => m[1]!);
}

const optional = (name: string) => pkg.peerDependenciesMeta[name]?.optional === true;

/**
 * Optional peers that `check:core-isolation` deliberately does NOT watch, each with its reason.
 * An exemption must be stated here, never by quietly leaving a package out of the guard.
 */
const EXEMPT = new Map([
  // Reached only through the `./charts` subpath, which is not the core entry. Its absent-peer
  // behaviour is proven directly by check:packed-public-contract, which builds a chart consumer
  // without recharts and asserts ONE diagnostic naming the package.
  ["recharts", "charts subpath; absence proven by check:packed-public-contract"],
  // A test-only peer. It is never imported by shipped runtime code at all.
  ["playwright", "test-only; not in any runtime path"],
]);

describe("optional peers and core isolation agree (gh#546)", () => {
  it("reads a non-empty FORBIDDEN list — an empty one would make this vacuous", () => {
    expect(forbidden().length).toBeGreaterThan(3);
  });

  it("every FORBIDDEN package that IS a peer is declared optional", () => {
    // `@hookform` appears in FORBIDDEN as a scope prefix; the peer is `@hookform/resolvers`.
    const mandatory = forbidden()
      .flatMap((name) =>
        Object.keys(pkg.peerDependencies).filter((p) => p === name || p.startsWith(`${name}/`)),
      )
      .filter((p) => !optional(p));

    expect(mandatory, "core cannot reach these, so nothing should force their install").toEqual([]);
  });

  it("and the converse: every OPTIONAL peer is one the guard actually watches", () => {
    // Without this direction the invariant is half an invariant, and I proved that on myself:
    // `zod` was declared optional while absent from FORBIDDEN, so the promise "core never reaches
    // it" rested on one hand-measurement and nothing enforced it afterwards. Removing `zod` from
    // the guard left the other assertions green.
    const watched = forbidden();
    const unguarded = Object.keys(pkg.peerDependenciesMeta)
      .filter((name) => optional(name))
      .filter((name) => !EXEMPT.has(name))
      .filter((name) => !watched.some((f) => name === f || name.startsWith(`${f}/`)));

    expect(
      unguarded,
      "declared optional, but nothing stops the core entry from importing it",
    ).toEqual([]);
  });

  it("react, react-dom and tailwindcss stay MANDATORY — they are not adapters", () => {
    // The point of the change is to separate the core's real requirements from an adapter's. If
    // this ever inverted, "optional" would stop meaning anything.
    for (const name of ["react", "react-dom", "tailwindcss"]) {
      expect(pkg.peerDependencies[name], `${name} is not a peer any more`).toBeDefined();
      expect(optional(name), `${name} must not be optional`).toBe(false);
    }
  });

  it("declares no optional entry for a package that is not a peer at all", () => {
    for (const name of Object.keys(pkg.peerDependenciesMeta)) {
      expect(pkg.peerDependencies[name], `${name} has meta but is not a peer`).toBeDefined();
    }
  });
});
