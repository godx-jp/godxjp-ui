import { execFileSync } from "node:child_process";
import { closeSync, mkdtempSync, openSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * GUARD: the library's own UI must never regress into UI-standardization violations.
 *
 * `scripts/ui-audit.mjs` is the static auditor that ships with @godxjp/ui (the same one
 * consumers run via `pnpm audit:examples`). It prints findings and ends with a summary
 * line `godxjp-ui audit: N error(s), M warning(s) across <dirs>.`, exiting non-zero only
 * when N > 0. These tests pin the audit result for our own surfaces so a future edit that
 * reintroduces a raw <input>, an arbitrary color, an em-dash in copy, etc. fails CI here.
 */

// src/__tests__/ → repo root is two levels up. Run the auditor from the root so its
// CWD-relative scan dirs (docs, src/components) resolve exactly like the pnpm scripts do.
const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const AUDIT_SCRIPT = join(REPO_ROOT, "scripts/ui-audit.mjs");
const ORPHANS_SCRIPT = join(REPO_ROOT, "scripts/check-mcp-orphans.mjs");

/** Strip any ANSI color codes (NO_COLOR should suppress them, but be defensive). */
function stripAnsi(s: string): string {
  // eslint-disable-next-line no-control-regex
  return s.replace(/\x1b\[[0-9;]*m/g, "");
}

/**
 * Run `node <script> <args...>` from the repo root and return its exit code + full stdout.
 *
 * stdout is redirected to a temp FILE (not an in-memory pipe). The auditor calls
 * `process.exit()` while writing a large report; with a pipe, Node can drop the not-yet-
 * drained tail — INCLUDING the summary line — so a pipe capture is unreliable for big
 * outputs. A file fd is written synchronously and never truncated on exit. NO_COLOR keeps
 * the output deterministic.
 */
function runNode(scriptPath: string, scriptArgs: string[]): { code: number; stdout: string } {
  const dir = mkdtempSync(join(tmpdir(), "godxjp-audit-"));
  const outPath = join(dir, "out.txt");
  const fd = openSync(outPath, "w");
  let code = 0;
  try {
    execFileSync("node", [scriptPath, ...scriptArgs], {
      cwd: REPO_ROOT,
      stdio: ["ignore", fd, fd],
      timeout: 60_000,
      env: { ...process.env, NO_COLOR: "1", FORCE_COLOR: "0" },
    });
  } catch (err) {
    code = (err as { status?: number }).status ?? 1;
  } finally {
    closeSync(fd);
  }
  return { code, stdout: stripAnsi(readFileSync(outPath, "utf8")) };
}

/** Run ui-audit on `dirs` and parse its summary line. */
function runAudit(dirs: string[]): { errors: number; warnings: number; stdout: string } {
  const { stdout } = runNode(AUDIT_SCRIPT, dirs);
  const summary = stdout.match(/godxjp-ui audit:\s*(\d+)\s*error\(s\),\s*(\d+)\s*warning\(s\)/);
  if (!summary) {
    throw new Error(`Could not parse ui-audit summary line. Full output:\n${stdout}`);
  }
  return { errors: Number(summary[1]), warnings: Number(summary[2]), stdout };
}

describe("UI-standardization guard", () => {
  it("docs/ example pages have ZERO violations (0 errors, 0 warnings)", () => {
    const { errors, warnings, stdout } = runAudit(["docs"]);
    // The findings are already in `stdout`; include them so a regression prints what broke.
    expect(
      { errors, warnings },
      `ui-audit found violations in docs/. Run \`pnpm audit:examples\`.\n\n${stdout}`,
    ).toEqual({ errors: 0, warnings: 0 });
  });

  it("src/components/ does not regress past the current baseline", () => {
    // src/components is NOT clean yet (legacy findings, e.g. em-dashes in test/example
    // strings). Baseline captured 2026-06-27: 43 error(s) + 217 warning(s) = 260 findings.
    // We pin the TOTAL so the test passes today but catches any NEW violation. Lower these
    // numbers as the source is cleaned up; never raise them. (ui-audit now skips __tests__/
    // *.test files, so this tracks only the SHIPPED src/components surface, not test fixtures.)
    const BASELINE_ERRORS = 7;
    const BASELINE_WARNINGS = 14;
    const BASELINE_TOTAL = BASELINE_ERRORS + BASELINE_WARNINGS; // 21

    const { errors, warnings, stdout } = runAudit(["src/components"]);
    const total = errors + warnings;
    expect(
      total,
      `src/components UI-audit findings rose above the baseline of ${BASELINE_TOTAL} ` +
        `(now ${total}: ${errors} error(s), ${warnings} warning(s)). A new violation was ` +
        `introduced — fix it; do not raise the baseline.\n\n${stdout}`,
    ).toBeLessThanOrEqual(BASELINE_TOTAL);
  });

  it("every public component is catalogued in the MCP (no orphans)", () => {
    // check-mcp-orphans exits 0 only when every public primary component has an MCP entry.
    const { code, stdout } = runNode(ORPHANS_SCRIPT, []);
    expect(
      code,
      `check-mcp-orphans failed — a public component is missing from the MCP catalog.\n\n${stdout}`,
    ).toBe(0);
  });
});
