import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * explain-token PRINTS THE PATCH SHAPE FOR AN `initial` KNOB (gh#988).
 *
 * A consumer migrating a rule read `--font-size-xs` as "gone" (that was gh#980), reached for
 * `--text-xs` instead — unpublished, Tailwind-inlined to 12px against the published 12.4699px — and
 * shipped a 0.47px shift. The fallback the package itself uses was on every read site; the tool now
 * says it out loud, so the copyable line is the first thing on the screen.
 */
const run = (token: string) =>
  execFileSync(process.execPath, [resolve("scripts/explain-token.mjs"), token], {
    encoding: "utf8",
  });

describe("explain-token read hint (gh#988)", () => {
  it("prints the package's own fallback for --font-size-xs, the formula and not half of it", () => {
    expect(run("--font-size-xs")).toContain(
      "read it as: var(--font-size-xs, calc(var(--font-size-base) / var(--font-size-ratio)))",
    );
  });

  it("prints a nested-var fallback whole — --radius-lg", () => {
    expect(run("--radius-lg")).toContain("read it as: var(--radius-lg, var(--radius))");
  });

  it("says an unpublished, unread name is not the contract — --text-xs", () => {
    const out = run("--text-xs");
    expect(out).toContain("published: NO");
    expect(out).toContain("not part of the contract");
    expect(out).not.toContain("read it as:");
  });
});
