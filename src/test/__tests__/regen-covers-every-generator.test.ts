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

  /*
   * EXPLICIT TIMEOUT, for the same reason gen-component-api-manifest-comment-ghost carries one and
   * with the same history: this test SPAWNS `regen`, which runs all eight generators for real, and
   * one of them (`gen-component-api-manifest`) puts the TypeScript compiler over the whole project.
   * Measured on a laptop: 3.6s for the chain, 3.0s of it that one generator. vitest's 8000ms
   * default leaves no room on a shared CI pool running four shards at once, and it failed exactly
   * that way on the 28.5.0 release commit — a timeout rather than an assertion, and the tag could
   * not be pushed. The same shape cost the 23.4.1 tag, which is why the sibling test says so too.
   *
   * Running `regen` for real is the point: the thing under test is that the generator list is
   * DERIVED from package.json, so a stubbed runner would prove nothing. The cost is accepted and
   * bounded here rather than hidden by weakening the test.
   */
  const SPAWNS_EVERY_GENERATOR = 120_000;

  it(
    "reaches every generator that has a --check counterpart",
    { timeout: SPAWNS_EVERY_GENERATOR },
    () => {
      const out = execFileSync("node", ["scripts/regen-generated.mjs"], { encoding: "utf8" });
      /* A SET, not a multiset — regen runs to a FIXED POINT since gh#847, so it prints its
       * generator list once PER PASS. A settled tree costs one pass and a tree with a stale
       * artifact costs two or three, which is the whole point of that change: one generator reads
       * what another writes, and the order is the order of keys in package.json.
       *
       * This assertion is about REACHABILITY — "a generator with a --check counterpart must be
       * reachable by regen" — and how many times each was reached is not part of that claim. It
       * read as one only because regen used to run exactly one pass; CI caught it on a fresh
       * checkout, where three passes made 8 labels into 23 and the test compared 23 against 8.
       * The COUNT is still pinned, by the `finds EIGHT today` case below. */
      const reached = [
        ...new Set([...out.matchAll(/\((check:[\w-]+)\)/g)].map((m) => m[1])),
      ].sort();
      expect(reached, "a generator reachable by --check must be reachable by regen").toEqual(
        checkersWithGenerators().sort(),
      );
    },
  );

  it("finds NINE today — the number is asserted so a tenth is noticed", () => {
    // Not because nine is correct forever, but because the failure mode is a derivation that
    // quietly matches FEWER things after someone renames a script. A count that changes makes
    // that visible; a runner that silently shrinks does not. The ninth is `check:style-layers`
    // (gen-style-layers, gh#971) — noticed by exactly this case on the merge that added it, while
    // the reachability case above stayed green: regen already ran it.
    expect(checkersWithGenerators()).toHaveLength(9);
    expect(checkersWithGenerators()).toContain("check:style-layers");
  });

  it("refuses to pass silently if the derivation ever matches nothing", () => {
    // The dangerous failure is not a crash, it is a regen that reports success having run zero
    // generators — every artifact then stays stale and the gates blame the code.
    const source = readFileSync("scripts/regen-generated.mjs", "utf8");
    expect(source).toMatch(/generators\.size === 0/);
    expect(source).toMatch(/process\.exit\(1\)/);
  });
});
