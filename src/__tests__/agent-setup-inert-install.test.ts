import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

/*
 * #1215 — an install must not touch the consumer's repository. `postinstall` used to write
 * .mcp.json, a CLAUDE.md block, .claude/godxjp-ui-workflow.md and .ai/rules/godxjp-ui.md. Now only
 * the explicit `sync-rules` writes, and `sync-rules --dry-run` lists what it would write.
 *
 * Measured on a scratch project (own git identity, never the machine's): a directory listing plus
 * a content hash of every file before and after.
 */
const POSTINSTALL = join(process.cwd(), "scripts/postinstall.mjs");
const CLI = join(process.cwd(), "scripts/cli.mjs");
const dirs: string[] = [];

function consumerRepo() {
  const root = realpathSync(mkdtempSync(join(tmpdir(), "godxui-inert-")));
  dirs.push(root);
  const git = (...args: string[]) =>
    spawnSync("git", args, {
      cwd: root,
      encoding: "utf8",
      env: {
        ...process.env,
        GIT_AUTHOR_NAME: "t",
        GIT_AUTHOR_EMAIL: "t@example.com",
        GIT_COMMITTER_NAME: "t",
        GIT_COMMITTER_EMAIL: "t@example.com",
      },
    });
  git("init", "-q");
  git("config", "user.name", "t");
  git("config", "user.email", "t@example.com");
  writeFileSync(join(root, "package.json"), JSON.stringify({ name: "consumer-app" }));
  mkdirSync(join(root, "src"), { recursive: true });
  const uiDir = join(root, "node_modules", "@godxjp", "ui");
  mkdirSync(uiDir, { recursive: true });
  writeFileSync(
    join(uiDir, "package.json"),
    JSON.stringify({ name: "@godxjp/ui", version: "32.0.0", godxUiMcp: "32.0.0" }),
  );
  git("add", "-A");
  git("commit", "-q", "-m", "init", "--no-verify");
  return root;
}

/** relative path -> sha256, every file outside node_modules and .git. */
function snapshot(root: string) {
  const out: Record<string, string> = {};
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      if (name === "node_modules" || name === ".git") continue;
      const path = join(dir, name);
      if (statSync(path).isDirectory()) {
        out[`${relative(root, path)}/`] = "dir";
        walk(path);
      } else {
        out[relative(root, path)] = createHash("sha256").update(readFileSync(path)).digest("hex");
      }
    }
  };
  walk(root);
  return out;
}

function run(script: string, args: string[], root: string) {
  const env: NodeJS.ProcessEnv = { ...process.env, INIT_CWD: root };
  delete env.CI;
  delete env.GODXJP_UI_SKIP_SETUP;
  const r = spawnSync(process.execPath, [script, ...args], { cwd: root, env, encoding: "utf8" });
  return { status: r.status, stdout: r.stdout, stderr: r.stderr };
}

afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

describe("inert install (#1215)", () => {
  it("postinstall creates or modifies 0 files and points at sync-rules", () => {
    const root = consumerRepo();
    const before = snapshot(root);

    const r = run(POSTINSTALL, [], root);

    expect(r.status).toBe(0);
    expect(snapshot(root)).toEqual(before);
    expect(r.stdout).toContain("sync-rules");
  });

  it("sync-rules --dry-run lists the files and changes 0 of them; sync-rules then writes them", () => {
    const root = consumerRepo();
    const before = snapshot(root);

    const dry = run(CLI, ["sync-rules", "--dry-run"], root);
    expect(dry.status).toBe(0);
    expect(snapshot(root)).toEqual(before);
    for (const file of [".mcp.json", "CLAUDE.md", ".claude/godxjp-ui-workflow.md"]) {
      expect(dry.stdout).toContain(join(root, file));
    }
    expect(dry.stdout).toContain(join(root, ".ai/rules/godxjp-ui.md"));

    const real = run(CLI, ["sync-rules"], root);
    expect(real.status).toBe(0);
    const after = snapshot(root);
    for (const file of [
      ".mcp.json",
      "CLAUDE.md",
      ".claude/godxjp-ui-workflow.md",
      ".ai/rules/godxjp-ui.md",
    ]) {
      expect(after[file], file).toMatch(/^[0-9a-f]{64}$/);
    }

    // Once synced, a dry run has nothing left to list.
    const again = run(CLI, ["sync-rules", "--dry-run"], root);
    expect(again.stdout).toContain("nothing to change");
    expect(snapshot(root)).toEqual(after);
  });
});
