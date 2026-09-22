import { describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

/**
 * The gate runner is guarded by OBSERVATION, not by reading its source (gh#853).
 *
 * `verify:ci:static` was 46 commands joined with `&&`. `&&` short-circuits, so a failure at
 * command 3 meant 4…46 never executed and you learned one defect per CI round trip. The chain is
 * now the DECLARATION (`verify:ci:static:gates`) and the script name is a RUNNER over it.
 *
 * The neighbouring repo hit the same defect in a CI `run:` block and guards it by PARSING the
 * workflow YAML — it has no choice, because a `run:` block cannot be executed inside a unit test.
 * Ours can be executed, so this asserts what the runner DOES rather than what it looks like, which
 * is the stronger guard of the two. Its three properties, restated for a runner:
 *
 *   DISARMED    a failing entry does not stop the ones after it
 *   COLLECTS    every failure is remembered, not just the first
 *   PROPAGATES  the process exits non-zero
 *
 * The middle one is the reason this file exists. A runner that is disarmed and collects but does
 * NOT propagate is strictly worse than the `&&` chain it replaced: it runs everything, sees red,
 * and reports green. That arrangement has its own case below, because a predicate nobody has seen
 * return `false` is not a predicate.
 */
const RUNNER = resolve(process.cwd(), "scripts/run-gate-list.mjs");

/** Run the runner over a throwaway package.json, and hand back everything it said. */
function runChain(chain: string, scripts: Record<string, string> = {}) {
  const dir = mkdtempSync(join(tmpdir(), "gate-runner-"));
  writeFileSync(
    join(dir, "package.json"),
    JSON.stringify({ name: "probe", scripts: { chain, ...scripts } }),
  );
  try {
    const stdout = execFileSync("node", [RUNNER, "chain"], { cwd: dir, encoding: "utf8" });
    return { status: 0, out: stdout };
  } catch (error) {
    const e = error as { status: number; stdout?: string; stderr?: string };
    return { status: e.status, out: `${e.stdout ?? ""}${e.stderr ?? ""}` };
  }
}

describe("the static gate runner (gh#853)", () => {
  it("runs EVERY entry after a failure, and names all of them", () => {
    const { status, out } = runChain(
      "echo one && false && echo three && false && echo five && false && echo seven",
    );

    // DISARMED: the entries after the first red one must have executed.
    for (const marker of ["one", "three", "five", "seven"]) {
      expect(
        out,
        `entry printing "${marker}" did not run — the chain is still fail-fast`,
      ).toContain(marker);
    }
    // COLLECTS: all three failures, not the first.
    expect(out).toContain("3 of 7");
    // PROPAGATES.
    expect(status, "a failed gate must fail the process").not.toBe(0);
  });

  /*
   * THE CONTROL. Without it the assertions above can all pass against a runner that reports
   * failures and exits 0, which is the arrangement that is worse than the chain it replaced.
   */
  it("exits ZERO only when every entry passed", () => {
    const green = runChain("echo a && echo b && echo c");
    expect(green.status).toBe(0);
    expect(green.out).toContain("all green");

    const red = runChain("echo a && false && echo c");
    expect(red.status, "green exit with a red gate is worse than stopping at the first").not.toBe(
      0,
    );
  });

  /*
   * A PREREQUISITE still aborts, and only a prerequisite. `build` writes the `dist/` that later
   * gates inspect, so running them after it failed reports ITS failure N more times instead of
   * theirs — worse signal, not better. Anything else runs to the end.
   */
  it("aborts on a prerequisite, and says how many gates it suppressed", () => {
    const { status, out } = runChain("pnpm build && echo after-one && echo after-two", {
      build: "exit 1",
    });

    expect(out).toContain("ABORTED at a prerequisite");
    expect(out, "the count of suppressed gates is the reader's whole context").toContain("2 later");
    expect(out, "a prerequisite failure must NOT run the gates that read its output").not.toContain(
      "after-one",
    );
    expect(status).not.toBe(0);
  });

  it("refuses a script name that does not exist, rather than reporting zero gates green", () => {
    // The dangerous shape is not a crash: it is a runner that finds nothing and says "all green".
    const { status, out } = runChain("echo unused");
    const missing = (() => {
      const dir = mkdtempSync(join(tmpdir(), "gate-runner-"));
      writeFileSync(join(dir, "package.json"), JSON.stringify({ name: "probe", scripts: {} }));
      try {
        execFileSync("node", [RUNNER, "nope"], { cwd: dir, encoding: "utf8" });
        return 0;
      } catch (error) {
        return (error as { status: number }).status;
      }
    })();

    expect(status).toBe(0);
    expect(out).toContain("all green");
    expect(missing, "an unknown script must fail, not pass vacuously").not.toBe(0);
  });
});
