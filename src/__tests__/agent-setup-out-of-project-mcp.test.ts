import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

// @ts-expect-error — plain ESM script without a declaration file
import { findOutOfProjectUiMcp, outOfProjectUiMcpReport } from "../../scripts/_agent-setup.mjs";

/*
 * gh#722 — a stale @godxjp/ui-mcp registered in user-scoped Claude Code config answered beside the
 * project's pinned one. sync-rules must REPORT it, never touch it. Every test runs against a fake
 * HOME in a temp dir; the real home directory is never read.
 */
const POSTINSTALL = join(process.cwd(), "scripts/postinstall.mjs");
const dirs: string[] = [];

function tmp(prefix: string) {
  const dir = realpathSync(mkdtempSync(join(tmpdir(), prefix)));
  dirs.push(dir);
  return dir;
}

function consumerRepo() {
  const root = tmp("godxui-oop-app-");
  writeFileSync(join(root, "package.json"), JSON.stringify({ name: "consumer-app" }));
  const uiDir = join(root, "node_modules", "@godxjp", "ui");
  mkdirSync(uiDir, { recursive: true });
  writeFileSync(
    join(uiDir, "package.json"),
    JSON.stringify({ name: "@godxjp/ui", version: "27.5.0", godxUiMcp: "27.5.0" }),
  );
  return root;
}

function fakeHome(claudeJson?: string) {
  const home = tmp("godxui-oop-home-");
  if (claudeJson !== undefined) writeFileSync(join(home, ".claude.json"), claudeJson);
  return home;
}

function syncRules(root: string, home: string) {
  const env: NodeJS.ProcessEnv = { ...process.env, HOME: home, INIT_CWD: root };
  delete env.CI;
  delete env.GODXJP_UI_SKIP_SETUP;
  delete env.CLAUDE_CONFIG_DIR;
  const r = spawnSync(process.execPath, [POSTINSTALL], { cwd: root, env, encoding: "utf8" });
  return { status: r.status, stdout: r.stdout, stderr: r.stderr };
}

afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

describe("sync-rules reports an out-of-project @godxjp/ui-mcp it will not touch (gh#722)", () => {
  it("prints the key, the pin and 'left untouched', and leaves the file byte-identical", () => {
    const root = consumerRepo();
    const raw =
      JSON.stringify(
        {
          numStartups: 3,
          mcpServers: {
            "godxjp-ui": {
              type: "stdio",
              command: "npx",
              args: ["@godxjp/ui-mcp@21.0.0"],
              env: { SECRET_TOKEN: "do-not-print-me" },
            },
            playwright: { command: "npx", args: ["@playwright/mcp@latest"] },
          },
        },
        null,
        4,
      ) + "\n";
    const home = fakeHome(raw);

    const { status, stdout } = syncRules(root, home);

    expect(status).toBe(0);
    expect(stdout).toContain('"godxjp-ui" (user scope) runs @godxjp/ui-mcp@21.0.0');
    expect(stdout).toContain("outside the project, left untouched");
    expect(stdout).toContain("claude mcp remove godxjp-ui -s user");
    expect(stdout).toContain("claude mcp add godxjp-ui -s user -- npx @godxjp/ui-mcp@27.5.0");
    expect(stdout).not.toContain("do-not-print-me");
    expect(stdout).not.toContain("SECRET_TOKEN");
    expect(stdout).not.toContain("playwright");
    expect(readFileSync(join(home, ".claude.json"), "utf8")).toBe(raw);
    // The project entry is still ours to write, and it was.
    const project = JSON.parse(readFileSync(join(root, ".mcp.json"), "utf8"));
    expect(project.mcpServers["godx-ui"].args).toEqual(["@godxjp/ui-mcp@27.5.0"]);
  });

  it("finds a local-scope entry under projects[<this project>] and ignores other projects", () => {
    const root = consumerRepo();
    const home = fakeHome(
      JSON.stringify({
        projects: {
          [root]: { mcpServers: { ui: { command: "npx", args: ["-y", "@godxjp/ui-mcp"] } } },
          "/some/other/checkout": {
            mcpServers: { elsewhere: { command: "npx", args: ["@godxjp/ui-mcp@20.0.0"] } },
          },
        },
      }),
    );

    expect(findOutOfProjectUiMcp(root, home)).toEqual([
      { key: "ui", scope: "local", pin: "@godxjp/ui-mcp" },
    ]);
    const report = outOfProjectUiMcpReport(root, home);
    expect(report).toContain('"ui" (local scope) runs @godxjp/ui-mcp (unpinned');
    expect(report).toContain("claude mcp remove ui -s local");
    expect(report).not.toContain("elsewhere");
  });

  it("stays silent when no out-of-project registration exists", () => {
    const root = consumerRepo();
    const home = fakeHome(
      JSON.stringify({ mcpServers: { playwright: { command: "npx", args: ["@playwright/mcp"] } } }),
    );
    expect(outOfProjectUiMcpReport(root, home)).toBe("");
    expect(syncRules(root, home).stdout).not.toMatch(/outside this project/);

    const noFile = fakeHome();
    expect(outOfProjectUiMcpReport(root, noFile)).toBe("");
    expect(syncRules(root, noFile).stdout).not.toMatch(/outside this project/);
  });

  it.each([
    ["malformed JSON", "{ not json"],
    ["a JSON array", "[]"],
    ["mcpServers as a string", JSON.stringify({ mcpServers: "nope", projects: [] })],
  ])("survives %s: no report, file untouched, install succeeds", (_label, raw) => {
    const root = consumerRepo();
    const home = fakeHome(raw);
    expect(findOutOfProjectUiMcp(root, home)).toEqual([]);
    const { status, stdout, stderr } = syncRules(root, home);
    expect(status).toBe(0);
    expect(stdout).not.toMatch(/outside this project/);
    expect(stderr).toBe("");
    expect(readFileSync(join(home, ".claude.json"), "utf8")).toBe(raw);
  });

  it("is skipped in CI like the rest of postinstall", () => {
    const root = consumerRepo();
    const home = fakeHome(
      JSON.stringify({ mcpServers: { g: { command: "npx", args: ["@godxjp/ui-mcp@21.0.0"] } } }),
    );
    const r = spawnSync(process.execPath, [POSTINSTALL], {
      cwd: root,
      env: { ...process.env, HOME: home, INIT_CWD: root, CI: "1" },
      encoding: "utf8",
    });
    expect(r.status).toBe(0);
    expect(r.stdout).toBe("");
  });
});
