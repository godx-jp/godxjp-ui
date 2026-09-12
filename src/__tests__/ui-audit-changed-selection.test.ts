import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

/*
 * `--changed` audits what a branch touched. It used to lie twice about `.jsx` (gh#542):
 *
 *   • `changedFiles()` selected `/\.(tsx|jsx)$/` while `walk()` admitted only `.tsx`/`.ts`, so a
 *     changed `.jsx` was picked, COUNTED IN THE SUMMARY as scanned, and then dropped without ever
 *     being opened;
 *   • and when it was the only change, the run printed "no .tsx/.jsx changed on this branch" and
 *     exited 0 — naming the very extension that had just changed.
 *
 * A third, quieter path: a git command that FAILED returned the same empty output as one that
 * found nothing, so a clone with no `origin/main` produced a clean green run.
 *
 * These run the real CLI in a real repository. Asserting on the helper would have missed the exit
 * code and the summary line, which are the parts a consumer actually reads.
 */

const script = join(process.cwd(), "scripts/ui-audit.mjs");
const VIOLATION =
  'export default function P(){return <div className="flex gap-4 p-4"><span>x</span></div>}\n';

/*
 * A SECOND fixture, and the hole it exists to close is one the first cannot see.
 *
 * `VIOLATION` trips the layout/spacing rules, which read `className` strings and never need the
 * JSX-only branch. So reverting `isJsx` to `.tsx`-only leaves every assertion below green: the
 * `.jsx` file is still SELECTED and still SCANNED, it just quietly skips the rules that only run
 * for JSX. That is not hypothetical — the sibling defect in #562 behaved exactly this way, where a
 * mutation inside a branch no fixture reached stayed green.
 *
 * These two violations live behind `isJsx`: a tone passed as `variant`, and a native control.
 */
const JSX_ONLY_VIOLATION =
  'export default function Probe(){return <><Badge variant="success" /><input /></>}\n';

const roots: string[] = [];

function repo({ withOrigin = true } = {}) {
  const root = mkdtempSync(join(tmpdir(), "godxui-changed-"));
  roots.push(root);
  const git = (...a: string[]) => spawnSync("git", a, { cwd: root, encoding: "utf8" });
  git("init", "-q");
  git("config", "user.email", "t@example.test");
  git("config", "user.name", "t");
  writeFileSync(join(root, "package.json"), JSON.stringify({ name: "consumer" }));
  git("add", "-A");
  git("commit", "-qm", "base");
  if (withOrigin) git("update-ref", "refs/remotes/origin/main", "HEAD");
  mkdirSync(join(root, "src"), { recursive: true });
  return root;
}

function audit(root: string) {
  const r = spawnSync(process.execPath, [script, "--changed"], { cwd: root, encoding: "utf8" });
  return { status: r.status, stdout: r.stdout ?? "", stderr: r.stderr ?? "" };
}

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe("ui-audit --changed selects exactly what it scans (gh#542)", () => {
  it("a .jsx file is the only change: it is opened, not waved through", () => {
    const root = repo();
    writeFileSync(join(root, "src/Page.jsx"), VIOLATION);

    const { status, stdout } = audit(root);

    expect(stdout).not.toContain("no .tsx/.jsx changed");
    expect(stdout).toContain("src/Page.jsx");
    expect(status).toBe(1);
  });

  it(".jsx and .tsx with identical markup produce identical findings", () => {
    const root = repo();
    writeFileSync(join(root, "src/Page.jsx"), VIOLATION);
    writeFileSync(join(root, "src/Page.tsx"), VIOLATION);

    const { stdout } = audit(root);

    // Two rules fire per file. Four, not two, is the whole of this bug: the summary line named
    // both files while only one had been read.
    expect(stdout).toMatch(/4 error\(s\)/);
    expect(stdout).toMatch(/across .*src\/Page\.jsx.*src\/Page\.tsx/);
  });

  it("the summary names files that were SCANNED, never files merely selected", () => {
    const root = repo();
    writeFileSync(join(root, "src/Page.jsx"), "export const x = 1;\n");
    writeFileSync(join(root, "README.md"), "not ui\n");

    const { stdout, status } = audit(root);

    expect(stdout).toContain("src/Page.jsx");
    expect(stdout).not.toContain("README.md");
    expect(status).toBe(0);
  });

  it("a .jsx reaches the JSX-ONLY rules, not merely the className ones", () => {
    // Same source, both extensions, one run: the two files must report the SAME rule ids. If
    // `isJsx` stops admitting `.jsx`, the `.tsx` control still reports and the `.jsx` goes quiet,
    // so the two lists diverge — which is the assertion, rather than a bare "it was scanned".
    const root = repo();
    writeFileSync(join(root, "src/Probe.jsx"), JSX_ONLY_VIOLATION);
    writeFileSync(join(root, "src/Probe.tsx"), JSX_ONLY_VIOLATION);

    const r = spawnSync(process.execPath, [script, "--changed", "--format", "json"], {
      cwd: root,
      encoding: "utf8",
    });
    const { findings } = JSON.parse(r.stdout) as { findings: { file: string; rule: string }[] };
    const rulesFor = (name: string) =>
      findings
        .filter((f) => f.file.endsWith(name))
        .map((f) => f.rule)
        .sort();

    expect(
      rulesFor("Probe.tsx").length,
      "the .tsx control found nothing to compare",
    ).toBeGreaterThan(0);
    expect(rulesFor("Probe.jsx")).toEqual(rulesFor("Probe.tsx"));
  });

  it("a clean .jsx still exits 0 — the fix must not turn every .jsx into a failure", () => {
    const root = repo();
    writeFileSync(join(root, "src/Ok.jsx"), "export const x = 1;\n");
    expect(audit(root).status).toBe(0);
  });

  it("a finding that is NOT about a changed file still reports, and still fails", () => {
    // `staleOwnedRules()` runs before the scan loop. The zero-file branch used to exit 0 whatever
    // was already in `findings`, so a consumer whose package-owned rules were four majors out of
    // date got "✓ no .tsx/.jsx changed" on any commit that happened to touch no component — which
    // is most backend commits. Reproduced at rules 19.6.0 against an installed 23.3.0.
    const root = repo();
    mkdirSync(join(root, ".ai/rules"), { recursive: true });
    writeFileSync(join(root, ".ai/rules/godxjp-ui.md"), "<!-- godxjp-ui:version 19.6.0 -->\nold\n");
    mkdirSync(join(root, "node_modules/@godxjp/ui"), { recursive: true });
    writeFileSync(
      join(root, "node_modules/@godxjp/ui/package.json"),
      JSON.stringify({ name: "@godxjp/ui", version: "23.3.0" }),
    );
    // Change something that is not a UI file — the exact shape that used to be waved through.
    writeFileSync(join(root, "README.md"), "backend only\n");

    const { status, stdout } = audit(root);

    expect(stdout).toContain("owned-rules-stale");
    expect(stdout).not.toContain("no .tsx/.jsx changed");
    expect(status).toBe(1);
  });

  it("and --format json emits a valid document on that path, never an empty string", () => {
    // The worse half: the old branch exited BEFORE writing anything, so a CI step parsing stdout
    // received "" together with a zero exit and could not distinguish it from a pass.
    const root = repo();
    mkdirSync(join(root, ".ai/rules"), { recursive: true });
    writeFileSync(join(root, ".ai/rules/godxjp-ui.md"), "<!-- godxjp-ui:version 19.6.0 -->\nold\n");
    mkdirSync(join(root, "node_modules/@godxjp/ui"), { recursive: true });
    writeFileSync(
      join(root, "node_modules/@godxjp/ui/package.json"),
      JSON.stringify({ name: "@godxjp/ui", version: "23.3.0" }),
    );
    writeFileSync(join(root, "README.md"), "backend only\n");

    const r = spawnSync(process.execPath, [script, "--changed", "--format", "json"], {
      cwd: root,
      encoding: "utf8",
    });

    expect(r.stdout.trim(), "empty stdout is indistinguishable from a pass").not.toBe("");
    const parsed = JSON.parse(r.stdout) as { summary: { errors: number }; findings: unknown[] };
    expect(parsed.summary.errors).toBe(1);
    expect(r.status).toBe(1);
  });

  it("a genuinely quiet branch still exits 0 and still emits valid JSON", () => {
    // The control. The fix must not turn every backend-only commit into a failure.
    const root = repo();
    writeFileSync(join(root, "README.md"), "backend only\n");

    const { status, stdout } = audit(root);
    expect(stdout).toContain("no .tsx/.jsx changed");
    expect(status).toBe(0);

    const r = spawnSync(process.execPath, [script, "--changed", "--format", "json"], {
      cwd: root,
      encoding: "utf8",
    });
    expect(JSON.parse(r.stdout)).toEqual({ summary: { errors: 0, warnings: 0 }, findings: [] });
  });

  it("no origin/main: refuses, rather than reporting a clean branch it could not compute", () => {
    const root = repo({ withOrigin: false });
    writeFileSync(join(root, "src/Page.jsx"), VIOLATION);

    const { status, stderr } = audit(root);

    expect(status).toBe(2);
    expect(stderr).toContain("merge-base");
  });
});
