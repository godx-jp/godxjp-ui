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

  it("a clean .jsx still exits 0 — the fix must not turn every .jsx into a failure", () => {
    const root = repo();
    writeFileSync(join(root, "src/Ok.jsx"), "export const x = 1;\n");
    expect(audit(root).status).toBe(0);
  });

  it("no origin/main: refuses, rather than reporting a clean branch it could not compute", () => {
    const root = repo({ withOrigin: false });
    writeFileSync(join(root, "src/Page.jsx"), VIOLATION);

    const { status, stderr } = audit(root);

    expect(status).toBe(2);
    expect(stderr).toContain("merge-base");
  });
});
