import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

/**
 * `ui-audit --changed` HELD ITS BASE AS A CONSTANT, AND MOST REPOS THAT RUN IT DO NOT DEFAULT TO
 * main (gh#948).
 *
 * The base was `origin/main`. In a repo whose default branch is `dev`, `origin/main` usually
 * still exists — stale, or forked long ago — so `merge-base` resolves happily to an ancient
 * commit and "what this branch changed" quietly becomes "everything since then". Measured in
 * godx-corebooks: a fresh branch off `origin/dev` with ZERO edits audited ~200 files and reported
 * 1114 errors.
 *
 * That is the worst shape a scope bug takes — not a crash, a PLAUSIBLE NUMBER. So these tests are
 * behavioural: they build a repo with that exact geometry (default `dev`, a stale `main`, a
 * violation living on `dev` that the branch never touched) and run the real script in it. A
 * source-text assertion could not tell the two numbers apart, and the number is the whole defect.
 */

const SCRIPT = resolve("scripts/ui-audit.mjs");

let root: string | null = null;

afterEach(() => {
  if (root) rmSync(root, { recursive: true, force: true });
  root = null;
});

const git = (cwd: string, ...a: string[]) => execFileSync("git", a, { cwd, encoding: "utf8" });

/** Every repo a fixture commits in needs its own identity; signing must be off for the same reason. */
function identify(cwd: string) {
  git(cwd, "config", "user.email", "t@example.test");
  git(cwd, "config", "user.name", "fixture");
  git(cwd, "config", "commit.gpgsign", "false");
}

/** `p-4` is a consumer-rule error; a bare `<div>` is clean. One bit, and it is the audit's own. */
const DIRTY = 'export default function L() {\n  return <div className="p-4">l</div>;\n}\n';
const CLEAN = (n: string) => `export default function ${n}() {\n  return <div>${n}</div>;\n}\n`;

/**
 * upstream:  M0 ──(main, stale)
 *              └─ D1 ──(dev, the real default) …carries the violation
 * clone:                └─ N1 (feature) …adds one CLEAN file and nothing else
 *
 * Comparing against `dev` sees N1's file alone. Comparing against the stale `main` also drags in
 * D1's, so a branch that changed nothing wrong reports an error.
 */
function fixture(): { clone: string } {
  root = mkdtempSync(join(tmpdir(), "ui-audit-base-"));
  const up = join(root, "up");
  mkdirSync(join(up, "src"), { recursive: true });
  git(up, "init", "-q", "-b", "main", ".");
  identify(up);
  writeFileSync(join(up, "src", "app.tsx"), CLEAN("A"));
  git(up, "add", "-A");
  git(up, "commit", "-qm", "M0");
  git(up, "checkout", "-qb", "dev");
  writeFileSync(join(up, "src", "legacy.tsx"), DIRTY);
  git(up, "add", "-A");
  git(up, "commit", "-qm", "D1");
  // What makes `dev` the DEFAULT rather than merely present: a clone reads this into origin/HEAD.
  git(up, "symbolic-ref", "HEAD", "refs/heads/dev");

  const clone = join(root, "clone");
  git(root, "clone", "-q", up, clone);
  // A clone inherits no identity, and a CI runner has no global one — this test passed locally and
  // failed on the runner with `Command failed: git commit -qm N1`. A fixture that leans on ambient
  // git config is testing the machine.
  identify(clone);
  git(clone, "checkout", "-qb", "feature");
  writeFileSync(join(clone, "src", "new.tsx"), CLEAN("N"));
  git(clone, "add", "-A");
  git(clone, "commit", "-qm", "N1");
  return { clone };
}

/** Colour codes would otherwise sit between every word these tests read. */
const ESC = String.fromCharCode(27);
const strip = (s: string) => (s ?? "").split(new RegExp(`${ESC}\\[[0-9;]*m`)).join("");

function audit(cwd: string, ...extra: string[]) {
  const r = spawnSync(process.execPath, [SCRIPT, "--changed", ...extra], {
    cwd,
    encoding: "utf8",
  });
  return { status: r.status, out: strip(r.stdout) + strip(r.stderr) };
}

describe("ui-audit --changed resolves its base from the repo (gh#948)", () => {
  it("compares against the remote's OWN default branch, not a hard-coded name", () => {
    const { clone } = fixture();
    const { status, out } = audit(clone);

    expect(out).toContain("src/new.tsx");
    // The negative case, and the one the bug failed: a file this branch never touched.
    expect(out).not.toContain("src/legacy.tsx");
    expect(out).toContain("0 error(s)");
    expect(status).toBe(0);
  });

  it("says which base it used, so a wrong one cannot hide behind a plausible number", () => {
    const { clone } = fixture();
    expect(audit(clone).out).toContain("so với: origin/HEAD");
  });

  it("lets an explicit --base win — and that is the old behaviour, still reachable", () => {
    const { clone } = fixture();
    const { out } = audit(clone, "--base=origin/main");

    // Proves the fixture HAS the defect to catch: from the stale base the untouched file is
    // audited and the clean branch reports an error. This is what every run used to do.
    expect(out).toContain("src/legacy.tsx");
    expect(out).toContain("1 error(s)");
    expect(out).toContain("so với: origin/main");
  });

  it("fails CLOSED when no candidate resolves — never a clean run (gh#542)", () => {
    const { clone } = fixture();
    git(clone, "remote", "remove", "origin");
    const { status, out } = audit(clone);

    expect(out).toContain("could not resolve a base");
    expect(out).toContain("origin/HEAD, origin/main");
    expect(out).not.toContain("No UI-standardization violations found");
    expect(status).not.toBe(0);
  });
});
