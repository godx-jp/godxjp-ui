import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

/**
 * `check:release-plan` VALIDATED THREE SIMULATIONS AND NEVER THE TREE IT WAS RUN IN (gh#954).
 *
 * The gate already had a `godxUiCompatibility` assertion, but every path to it went through
 * `runRelease(dryRun)` in a COPY, and that path executes `ApplyTargetMetadata` — the step that
 * rewrites the coordinated fields itself. So the simulation is self-consistent whatever is on
 * disk, and the gate printed three ✓ lines on a bump branch whose `mcp/package.json` declared
 * `godxUiCompatibility: 30.5.x` against `version: 30.6.0`.
 *
 * That commit reached `main`, the MCP suite inside `CI · release contract` went red, and because
 * `VerifyCommitProvenance` requires that check green on the tagged SHA, one stale word blocked the
 * release until a second bump commit and a second full CI pass.
 *
 * It survives because `compatibilityFor` is only `<major>.<minor>.x`: a PATCH bump can never drift
 * it. Measured across 25 bump commits — 2 wrong, both MINOR bumps (30.5.0 and 30.6.0), both
 * reaching `main`. A derived value maintained by hand is right until the day nobody remembers.
 */

const GATE = resolve("scripts/check-release-command-plan.mjs");
const ROOT_PKG = JSON.parse(readFileSync(resolve("package.json"), "utf8")) as {
  version: string;
  godxUiMcp: string;
};
const MCP_PKG = JSON.parse(readFileSync(resolve("mcp/package.json"), "utf8")) as {
  version: string;
  godxUiCompatibility: string;
};

let dir: string | null = null;

afterEach(() => {
  if (dir) rmSync(dir, { recursive: true, force: true });
  dir = null;
});

/**
 * The gate reads `process.cwd()`, and `createManifestPlanWorkspace` copies exactly these two
 * manifests — so a scratch tree holding them is the whole input, and the repo's own files are
 * never mutated by a test that makes them wrong on purpose.
 */
function tree(overrides: { root?: Record<string, unknown>; mcp?: Record<string, unknown> } = {}) {
  dir = mkdtempSync(join(tmpdir(), "release-plan-tree-"));
  mkdirSync(join(dir, "mcp"));
  writeFileSync(
    join(dir, "package.json"),
    JSON.stringify({ ...ROOT_PKG, ...overrides.root }, null, 2),
  );
  writeFileSync(
    join(dir, "mcp", "package.json"),
    JSON.stringify({ ...MCP_PKG, ...overrides.mcp }, null, 2),
  );
  return dir;
}

function gate(cwd: string) {
  const r = spawnSync(process.execPath, [GATE], { cwd, encoding: "utf8" });
  return { status: r.status, out: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}

describe("check:release-plan asserts the tree it runs in (gh#954)", () => {
  it("passes on the repo's real manifests, and SAYS what it read", () => {
    // Without this the failures below could come from a broken fixture rather than the drift.
    const { status, out } = gate(tree());

    expect(status).toBe(0);
    expect(out).toContain(`✓ tree @${ROOT_PKG.version}`);
    expect(out).toContain(`compat ${MCP_PKG.godxUiCompatibility}`);
  });

  it("fails on the exact state that reached main: compat one minor behind", () => {
    const stale = `${Number(ROOT_PKG.version.split(".")[0])}.${
      Number(ROOT_PKG.version.split(".")[1]) - 1
    }.x`;
    const { status, out } = gate(tree({ mcp: { godxUiCompatibility: stale } }));

    expect(out).toContain("godxUiCompatibility");
    expect(out).toContain(stale);
    expect(status).not.toBe(0);
  });

  it("fails when the MCP package version drifts from the UI version", () => {
    const { status, out } = gate(tree({ mcp: { version: "1.0.0" } }));

    expect(out).toContain("mcp/package.json::version");
    expect(status).not.toBe(0);
  });

  it("fails when the UI's pinned godxUiMcp drifts", () => {
    const { status, out } = gate(tree({ root: { godxUiMcp: "1.0.0" } }));

    expect(out).toContain("package.json::godxUiMcp");
    expect(status).not.toBe(0);
  });

  it("a PATCH bump cannot drift compat — which is why this survived 23 correct bumps", () => {
    // The negative case, and the reason the defect is invisible most of the time: bump the patch
    // digit and the SAME compat string is still right, so the gate must stay green here.
    const [major, minor, patch] = ROOT_PKG.version.split(".").map(Number);
    const next = `${major}.${minor}.${patch + 1}`;
    const { status } = gate(
      tree({ root: { version: next, godxUiMcp: next }, mcp: { version: next } }),
    );

    expect(status).toBe(0);
  });
});
