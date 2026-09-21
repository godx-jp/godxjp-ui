import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * THE RULE ENGINE HAS TO RUN SOMEWHERE CI CAN SEE IT.
 *
 * `scripts/ui-audit.mjs` is what enforces this package's cardinal rules on the code — no raw
 * `<input>`/`<button>`/`<select>`, semantic tokens only, no hardcoded palette. CLAUDE.md lists it
 * as a gate to run. It was in NO workflow and NOT in `verify:ci:static`, so nothing enforced it.
 *
 * Measured: a docs page with a raw `<input type="file">` passed PR CI and merged to main, and main
 * sat at `1 error(s)` until someone happened to run the audit by hand. A rule that only holds when
 * a human remembers is a convention, not a rule — and this repo's whole argument is that the
 * difference matters.
 *
 * `check:audit-sync` is NOT this: it keeps the agent-facing catalogs in step with the rule list,
 * and never runs a rule against a line of code. Having both in the chain is deliberate; they
 * answer different questions.
 */
const pkg = JSON.parse(readFileSync(join(process.cwd(), "package.json"), "utf8"));

describe("the ui-audit rule engine is enforced, not just documented", () => {
  it("runs inside verify:ci:static", () => {
    expect(
      pkg.scripts["verify:ci:static"],
      "add `&& pnpm run audit` — check:audit-sync only checks the catalog, not the code",
    ).toMatch(/&&\s*pnpm run audit(\s|$|&)/);
  });

  it("is still its own script, so it stays runnable on its own", () => {
    expect(pkg.scripts.audit).toBe("node scripts/ui-audit.mjs");
  });
});
