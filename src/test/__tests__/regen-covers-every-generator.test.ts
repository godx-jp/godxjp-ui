import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * `pnpm regen` MUST REACH EVERY GENERATOR, AND MUST NOT NEED A LIST (gh#801).
 *
 * THE REPEATED FAILURE. Adding a public surface means re-running the generators that record it.
 * Measured on two batches in one day: 28.2.0 went red across SEVEN stacked gates, the gh#796-799
 * batch across SIX — one root cause each. A stale artifact HIDES the gate that reads it, and
 * `verify:ci:static` aborts at the first failure, so each fix revealed the next, one CI round at
 * a time. The author of `regen-generated.mjs` believed there were three generators. There are
 * seven.
 *
 * So the list is COMPUTED from package.json rather than written down: every `check:*` that runs
 * `node scripts/<x>.mjs --check` is the checker half of a generator, and dropping `--check` is the
 * generating half. This file is the guard on that derivation — because a runner that silently
 * reaches six of seven is worse than no runner, and would look exactly the same.
 */
const pkg = JSON.parse(readFileSync("package.json", "utf8")) as {
  scripts: Record<string, string>;
};

/** Every generator, found the way a human would: a `--check` script names its own generator. */
function checkersWithGenerators(): string[] {
  return Object.entries(pkg.scripts)
    .filter(
      ([name, cmd]) =>
        name.startsWith("check:") && /node\s+scripts\/[\w.-]+\.mjs[^&]*--check/.test(cmd),
    )
    .map(([name]) => name);
}

describe("pnpm regen (gh#801)", () => {
  it("is registered, and ship:surface runs it BEFORE the gates", () => {
    expect(pkg.scripts.regen).toBe("node scripts/regen-generated.mjs");
    // The order is the whole point: regenerating after the gates is what produced the six-round
    // batch — the artifact was rewritten and then never re-checked.
    expect(pkg.scripts["ship:surface"]).toMatch(
      /^pnpm regen && pnpm verify:ci:static && pnpm check:frame-contracts$/,
    );
  });

  it("reaches every generator that has a --check counterpart", () => {
    const out = execFileSync("node", ["scripts/regen-generated.mjs"], { encoding: "utf8" });
    const reached = [...out.matchAll(/\((check:[\w-]+)\)/g)].map((m) => m[1]).sort();
    expect(reached, "a generator reachable by --check must be reachable by regen").toEqual(
      checkersWithGenerators().sort(),
    );
  });

  it("finds SEVEN today — the number is asserted so an eighth is noticed", () => {
    // Not because seven is correct forever, but because the failure mode is a derivation that
    // quietly matches FEWER things after someone renames a script. A count that changes makes
    // that visible; a runner that silently shrinks does not.
    expect(checkersWithGenerators()).toHaveLength(7);
  });

  it("refuses to pass silently if the derivation ever matches nothing", () => {
    // The dangerous failure is not a crash, it is a regen that reports success having run zero
    // generators — every artifact then stays stale and the gates blame the code.
    const source = readFileSync("scripts/regen-generated.mjs", "utf8");
    expect(source).toMatch(/generators\.size === 0/);
    expect(source).toMatch(/process\.exit\(1\)/);
  });
});
