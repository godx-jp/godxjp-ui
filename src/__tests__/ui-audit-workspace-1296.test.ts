import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { readConsumerUiMetadata } from "../../scripts/_agent-setup.mjs";

/*
 * gh#1296 — a workspace package. npm and pnpm hoist `@godxjp/ui` to the repo root, so
 * `<package>/node_modules/@godxjp/ui` does not exist. The audit read only that path and reported
 * `owned-rules-unknown` ("the installed package version could not be read") on a correct install.
 * Node itself resolves a package by walking up the node_modules chain; so must we.
 */
const script = join(process.cwd(), "scripts/ui-audit.mjs");
const roots: string[] = [];

afterEach(() => {
  while (roots.length > 0) rmSync(roots.pop()!, { recursive: true, force: true });
});

/** A workspace root with @godxjp/ui hoisted, and a member package with the owned rule file. */
function workspace(version = "32.6.0") {
  const root = mkdtempSync(join(tmpdir(), "godxui-ws-"));
  roots.push(root);
  writeFileSync(
    join(root, "package.json"),
    JSON.stringify({ name: "ws", private: true, workspaces: ["packages/*"] }),
  );
  mkdirSync(join(root, "node_modules", "@godxjp", "ui"), { recursive: true });
  writeFileSync(
    join(root, "node_modules", "@godxjp", "ui", "package.json"),
    JSON.stringify({ name: "@godxjp/ui", version }),
  );
  const member = join(root, "packages", "web");
  mkdirSync(join(member, ".ai", "rules"), { recursive: true });
  mkdirSync(join(member, "src"), { recursive: true });
  writeFileSync(join(member, "package.json"), JSON.stringify({ name: "web" }));
  writeFileSync(join(member, "src", "page.tsx"), "export const x = 1;\n");
  return { root, member };
}

function audit(cwd: string, args: string[] = ["src", "--format", "json"]) {
  return spawnSync(process.execPath, [script, ...args], { cwd, encoding: "utf8" });
}

describe("ui-audit in a workspace package (gh#1296)", () => {
  it("reads the installed version from a hoisted node_modules — no owned-rules-unknown", () => {
    const { member } = workspace("32.6.0");
    writeFileSync(
      join(member, ".ai", "rules", "godxjp-ui.md"),
      "<!-- godxjp-ui:version 32.6.0 -->\n# rules\n",
    );
    const out = audit(member).stdout;
    expect(out).not.toContain('"owned-rules-unknown"');
    expect(out).not.toContain('"owned-rules-stale"');
  });

  it("still reports a stale rule file against the hoisted version", () => {
    const { member } = workspace("32.6.0");
    writeFileSync(
      join(member, ".ai", "rules", "godxjp-ui.md"),
      "<!-- godxjp-ui:version 31.0.0 -->\n# rules\n",
    );
    expect(audit(member).stdout).toContain('"owned-rules-stale"');
  });

  it("sync-rules pins the MCP to the hoisted package's version", () => {
    const { member } = workspace("32.6.0");
    expect(readConsumerUiMetadata(member)).toEqual({ version: "32.6.0", godxUiMcp: "32.6.0" });
  });
});

describe("ui-audit --help (gh#1296)", () => {
  it.each(["--help", "-h"])(
    "%s prints usage, documents --consumer and --rules, scans nothing",
    (flag) => {
      const { member } = workspace();
      const r = audit(member, [flag]);
      expect(r.status).toBe(0);
      expect(r.stdout).toMatch(/^usage: /m);
      for (const option of [
        "--changed",
        "--base=",
        "--format json",
        "--quiet",
        "--rules",
        "--consumer",
      ])
        expect(r.stdout).toContain(option);
      expect(r.stdout).not.toContain("godxjp-ui audit:");
    },
  );
});
