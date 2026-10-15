import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

// @ts-expect-error — plain .mjs script, no declaration file
import { findUiMcpConfig } from "../../scripts/_agent-setup.mjs";
// @ts-expect-error — plain .mjs script, no declaration file
import { consulted, startedIn } from "../../scripts/agent-guard.mjs";

/**
 * gh#1324 — a Claude Code session that starts OUTSIDE a consumer repo never loads its `.mcp.json`,
 * CLAUDE.md or `.claude/settings.json` hooks: in godx-qc 0 of 25 UI-writing subagents had the
 * godx-ui MCP and no audit fired. `init-agent --user` installs a user-level guard that always
 * loads; `mcp-call` is the stdio route to the catalog for a session without the MCP.
 *
 * Every spawn gets a temp HOME and NO inherited CLAUDE_CONFIG_DIR / CLAUDE_PROJECT_DIR, so nothing
 * here can reach the real ~/.claude.
 */
const PKG = resolve(".");
const CLI = join(PKG, "scripts", "cli.mjs");
const temps: string[] = [];
afterEach(() => {
  for (const t of temps.splice(0)) rmSync(t, { recursive: true, force: true });
});
const temp = (prefix: string) => {
  const dir = realpathSync(mkdtempSync(join(tmpdir(), prefix)));
  temps.push(dir);
  return dir;
};
function cleanEnv(home: string, extra: Record<string, string> = {}) {
  const env: Record<string, string | undefined> = { ...process.env, HOME: home, ...extra };
  if (!("CLAUDE_CONFIG_DIR" in extra)) delete env.CLAUDE_CONFIG_DIR;
  if (!("CLAUDE_PROJECT_DIR" in extra)) delete env.CLAUDE_PROJECT_DIR;
  delete env.INIT_CWD;
  return env as NodeJS.ProcessEnv;
}
const installUser = (home: string, extra: Record<string, string> = {}) =>
  spawnSync(process.execPath, [CLI, "init-agent", "--user"], {
    cwd: home,
    env: cleanEnv(home, extra),
    encoding: "utf8",
  });

describe("init-agent --user — the install (gh#1324)", () => {
  it("writes the shim and both hooks under HOME/.claude, never anywhere else", () => {
    const home = temp("guard-home-");
    const r = installUser(home);
    expect(r.status).toBe(0);
    const shim = join(home, ".claude", "hooks", "godxjp-ui-guard.mjs");
    expect(readFileSync(shim, "utf8")).toBe(
      readFileSync(join(PKG, "scripts", "user-guard.mjs"), "utf8"),
    );
    const settings = JSON.parse(readFileSync(join(home, ".claude", "settings.json"), "utf8"));
    expect(settings.hooks.PreToolUse).toEqual([
      {
        matcher: "Write|Edit|MultiEdit",
        hooks: [{ type: "command", command: `node "${shim}" pre` }],
      },
    ]);
    expect(settings.hooks.PostToolUse[0].hooks[0].command).toBe(`node "${shim}" post`);
  });

  it("honours CLAUDE_CONFIG_DIR instead of HOME/.claude", () => {
    const home = temp("guard-home-");
    const config = temp("guard-config-");
    expect(installUser(home, { CLAUDE_CONFIG_DIR: config }).status).toBe(0);
    expect(existsSync(join(config, "hooks", "godxjp-ui-guard.mjs"))).toBe(true);
    expect(existsSync(join(config, "settings.json"))).toBe(true);
    expect(existsSync(join(home, ".claude"))).toBe(false);
  });

  it("merges: keeps every existing key and hook, appends after them, and is byte-stable on rerun", () => {
    const home = temp("guard-home-");
    const path = join(home, ".claude", "settings.json");
    mkdirSync(dirname(path), { recursive: true });
    const mine = { matcher: "Bash", hooks: [{ type: "command", command: "node ~/mine.mjs" }] };
    writeFileSync(
      path,
      JSON.stringify(
        { model: "opus", permissions: { allow: ["Bash(ls)"] }, hooks: { PreToolUse: [mine] } },
        null,
        4,
      ),
    );
    expect(installUser(home).status).toBe(0);
    const once = readFileSync(path, "utf8");
    const json = JSON.parse(once);
    expect(json.model).toBe("opus");
    expect(json.permissions).toEqual({ allow: ["Bash(ls)"] });
    expect(json.hooks.PreToolUse[0]).toEqual(mine);
    expect(json.hooks.PreToolUse).toHaveLength(2);
    expect(once).toMatch(/\n {4}"model"/); // the file's own indentation is kept

    const again = installUser(home);
    expect(again.stdout).toMatch(/already present/);
    expect(readFileSync(path, "utf8")).toBe(once);
  });

  it("refuses a settings.json it cannot parse, leaving it untouched beside a sidecar", () => {
    const home = temp("guard-home-");
    const path = join(home, ".claude", "settings.json");
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, "{ not json");
    expect(installUser(home).status).toBe(0);
    expect(readFileSync(path, "utf8")).toBe("{ not json");
    expect(existsSync(`${path}.godxjp-ui-suggested`)).toBe(true);
  });

  it("refuses `hooks` that is not an object", () => {
    const home = temp("guard-home-");
    const path = join(home, ".claude", "settings.json");
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, JSON.stringify({ hooks: [] }));
    installUser(home);
    expect(JSON.parse(readFileSync(path, "utf8"))).toEqual({ hooks: [] });
  });
});

// ── the guard, end to end: installed shim → repo's agent-guard.mjs → audit-hook.mjs ──────────

/** A real assistant transcript line (sanitised) — the shape the parser reads. */
const toolUse = (name: string, input: Record<string, unknown>) =>
  JSON.stringify({
    parentUuid: "x",
    isSidechain: false,
    message: {
      type: "message",
      role: "assistant",
      content: [{ type: "tool_use", id: "x", name, input, caller: { type: "direct" } }],
    },
    type: "assistant",
  });
const toolResult = (text: string) =>
  JSON.stringify({
    type: "user",
    message: { role: "user", content: [{ type: "tool_result", tool_use_id: "x", content: text }] },
  });

function setup(mcpKey = "godx-ui") {
  const home = temp("guard-home-");
  expect(installUser(home).status).toBe(0);
  const repo = temp("guard-repo-");
  writeFileSync(join(repo, "package.json"), JSON.stringify({ name: "consumer-app" }));
  writeFileSync(
    join(repo, ".mcp.json"),
    JSON.stringify({
      mcpServers: { [mcpKey]: { command: "npx", args: ["@godxjp/ui-mcp@32.13.1"] } },
    }),
  );
  mkdirSync(join(repo, "node_modules", "@godxjp"), { recursive: true });
  symlinkSync(PKG, join(repo, "node_modules", "@godxjp", "ui"), "dir");
  mkdirSync(join(repo, "src", "pages"), { recursive: true });
  const page = join(repo, "src", "pages", "staff.tsx");
  writeFileSync(page, `export const Page = () => <button onClick={go}>Go</button>;\n`);
  return { home, repo, page, shim: join(home, ".claude", "hooks", "godxjp-ui-guard.mjs") };
}

function hook(
  ctx: { home: string; shim: string },
  event: "pre" | "post",
  payload: unknown,
  extra: Record<string, string> = {},
) {
  return spawnSync(process.execPath, [ctx.shim, event], {
    input: typeof payload === "string" ? payload : JSON.stringify(payload),
    env: cleanEnv(ctx.home, extra),
    encoding: "utf8",
  });
}

function transcript(dir: string, lines: string[], name = "session.jsonl") {
  const path = join(dir, name);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, lines.join("\n") + "\n");
  return path;
}

describe("the guard — PreToolUse block/allow (gh#1324)", () => {
  it("BLOCKS a .tsx write when the transcript never consulted the catalog, naming both routes", () => {
    const ctx = setup();
    const t = transcript(ctx.home, [toolUse("Read", { file_path: "/x" })]);
    const r = hook(ctx, "pre", {
      tool_name: "Write",
      tool_input: { file_path: ctx.page },
      transcript_path: t,
    });
    expect(r.status).toBe(2);
    expect(r.stderr).toContain("was NOT written");
    expect(r.stderr).toContain("mcp__godx-ui__search_components");
    expect(r.stderr).toContain(
      `cd ${ctx.repo} && npx --no-install @godxjp/ui mcp-call search_components`,
    );
    expect(r.stderr).toContain("did not start in"); // no CLAUDE_PROJECT_DIR, slug ≠ repo
  });

  it("ALLOWS after an MCP call under the repo's own key — a custom key too", () => {
    const ctx = setup("ui-catalog");
    const t = transcript(ctx.home, [toolUse("mcp__ui-catalog__search_components", { query: "x" })]);
    const r = hook(ctx, "pre", { tool_input: { file_path: ctx.page }, transcript_path: t });
    expect(r.status).toBe(0);
    expect(r.stderr).toBe("");
  });

  it("does not accept another server's tools, nor godx-ui when the repo calls it something else", () => {
    const ctx = setup("ui-catalog");
    const t = transcript(ctx.home, [
      toolUse("mcp__claude-in-chrome__navigate", {}),
      toolUse("mcp__godx-ui__search_components", { query: "x" }),
    ]);
    expect(
      hook(ctx, "pre", { tool_input: { file_path: ctx.page }, transcript_path: t }).status,
    ).toBe(2);
  });

  it("ALLOWS after the stdio fallback ran in Bash", () => {
    const ctx = setup();
    const t = transcript(ctx.home, [
      toolUse("Bash", {
        command: `cd ${ctx.repo} && npx --no-install @godxjp/ui mcp-call search_components '{"query":"staff list"}'`,
      }),
    ]);
    expect(
      hook(ctx, "pre", { tool_input: { file_path: ctx.page }, transcript_path: t }).status,
    ).toBe(0);
  });

  it("does not count the fallback command quoted in a tool RESULT (the block message itself)", () => {
    const ctx = setup();
    const t = transcript(ctx.home, [
      toolResult("npx --no-install @godxjp/ui mcp-call search_components '{}'"),
    ]);
    expect(
      hook(ctx, "pre", { tool_input: { file_path: ctx.page }, transcript_path: t }).status,
    ).toBe(2);
  });

  it("judges a subagent by ITS transcript: the parent's lookup does not license its write", () => {
    const ctx = setup();
    const parent = transcript(ctx.home, [toolUse("mcp__godx-ui__get_component", { name: "Card" })]);
    const child = transcript(ctx.home, [toolUse("Read", {})], "session/subagents/agent-a.jsonl");
    const r = hook(ctx, "pre", {
      tool_input: { file_path: ctx.page },
      transcript_path: parent,
      agent_transcript_path: child,
    });
    expect(r.status).toBe(2);
  });

  it("leaves the @godxjp/ui repo itself alone — primitives are built from raw elements", () => {
    const ctx = setup();
    writeFileSync(join(ctx.repo, "package.json"), JSON.stringify({ name: "@godxjp/ui" }));
    const t = transcript(ctx.home, []);
    const r = hook(ctx, "pre", { tool_input: { file_path: ctx.page }, transcript_path: t });
    expect(r.status).toBe(0);
    expect(r.stderr).toBe("");
  });

  it("leaves non-UI files, test files and repos without the catalog alone", () => {
    const ctx = setup();
    const t = transcript(ctx.home, []);
    const ts = join(ctx.repo, "src", "lib.ts");
    expect(hook(ctx, "pre", { tool_input: { file_path: ts }, transcript_path: t }).status).toBe(0);
    const spec = join(ctx.repo, "src", "pages", "staff.test.tsx");
    expect(hook(ctx, "pre", { tool_input: { file_path: spec }, transcript_path: t }).status).toBe(
      0,
    );
    writeFileSync(
      join(ctx.repo, ".mcp.json"),
      JSON.stringify({ mcpServers: { other: { command: "x" } } }),
    );
    expect(
      hook(ctx, "pre", { tool_input: { file_path: ctx.page }, transcript_path: t }).status,
    ).toBe(0);
  });
});

describe("the guard — fails OPEN on its own errors (gh#1324)", () => {
  it("exits 0 with nothing on stderr for every broken input", () => {
    const ctx = setup();
    const t = transcript(ctx.home, []);
    const cases: [string, unknown][] = [
      ["malformed stdin", "{ not json"],
      ["empty stdin", ""],
      [
        "missing transcript",
        { tool_input: { file_path: ctx.page }, transcript_path: "/nope.jsonl" },
      ],
      [
        "transcript is a directory",
        { tool_input: { file_path: ctx.page }, transcript_path: ctx.home },
      ],
      ["no transcript at all", { tool_input: { file_path: ctx.page } }],
    ];
    for (const [label, payload] of cases) {
      const r = hook(ctx, "pre", payload);
      expect(r.status, label).toBe(0);
      expect(r.stderr, label).toBe("");
    }
    writeFileSync(join(ctx.repo, ".mcp.json"), "{ broken");
    const broken = hook(ctx, "pre", { tool_input: { file_path: ctx.page }, transcript_path: t });
    expect(broken.status, "invalid .mcp.json").toBe(0);
    expect(broken.stderr).toBe("");
  });

  it("exits 0 when the repo has no installed @godxjp/ui (or one older than the guard)", () => {
    const ctx = setup();
    rmSync(join(ctx.repo, "node_modules"), { recursive: true, force: true });
    const t = transcript(ctx.home, []);
    const r = hook(ctx, "pre", { tool_input: { file_path: ctx.page }, transcript_path: t });
    expect(r.status).toBe(0);
    expect(r.stderr).toBe("");
  });
});

describe("the guard — PostToolUse runs the repo's audit only when its hooks did not load", () => {
  it("runs the audit (exit 2 + findings) for a session started elsewhere", () => {
    const ctx = setup();
    const r = hook(
      ctx,
      "post",
      { tool_name: "Write", tool_input: { file_path: ctx.page } },
      { CLAUDE_PROJECT_DIR: ctx.home },
    );
    expect(r.status).toBe(2);
    expect(r.stderr).toContain("godxjp-ui audit flagged");
    expect(r.stderr).toContain("no-raw-button");
  });

  it("does nothing when the session started in the repo — its own hook already audited", () => {
    const ctx = setup();
    const r = hook(
      ctx,
      "post",
      { tool_input: { file_path: ctx.page } },
      { CLAUDE_PROJECT_DIR: ctx.repo },
    );
    expect(r.status).toBe(0);
    expect(r.stderr).toBe("");
  });
});

describe("startedIn / consulted — the two judgements", () => {
  const repo = "/w/app";
  it("reads CLAUDE_PROJECT_DIR, and treats <top>/.claude/worktrees/<x> as started at <top>", () => {
    expect(startedIn(repo, {}, { CLAUDE_PROJECT_DIR: "/w/app" })).toBe(true);
    expect(startedIn(repo, {}, { CLAUDE_PROJECT_DIR: "/w" })).toBe(false);
    expect(startedIn("/w/app/.claude/worktrees/a1", {}, { CLAUDE_PROJECT_DIR: "/w/app" })).toBe(
      true,
    );
  });

  it("falls back to the transcript's project slug, for a subagent too", () => {
    const main = { transcript_path: "/h/.claude/projects/-w-app/s1.jsonl" };
    const sub = { transcript_path: "/h/.claude/projects/-w-app/s1/subagents/agent-a.jsonl" };
    const other = { transcript_path: "/h/.claude/projects/-w/s1.jsonl" };
    expect(startedIn(repo, main, {})).toBe(true);
    expect(startedIn(repo, sub, {})).toBe(true);
    expect(startedIn(repo, other, {})).toBe(false);
  });

  it("skips torn lines and lines that only mention tool_use in prose", () => {
    const text = [
      `{"type":"assistant","message":{"content":[{"type":"tool_use","name":"mcp__godx-ui__`,
      JSON.stringify({
        type: "user",
        message: { content: "please call tool_use mcp__godx-ui__x" },
      }),
    ].join("\n");
    expect(consulted(text, ["godx-ui"])).toBe(false);
  });
});

// ── mcp-call: the stdio fallback launches the repo's own .mcp.json entry ─────────────────────

describe("mcp-call — launches the repo's catalog entry with `call` appended (gh#1324)", () => {
  function repoWith(server: string, env: Record<string, string> = {}) {
    const repo = temp("mcp-call-");
    const fake = join(repo, "fake-server.mjs");
    writeFileSync(fake, server);
    writeFileSync(
      join(repo, ".mcp.json"),
      JSON.stringify({
        mcpServers: {
          "godx-ui": { command: process.execPath, args: [fake, "--from-entry"], env },
          // `runsUiMcp` keys on the package name; the fake stands in for it.
        },
      }).replace('"--from-entry"', '"--from-entry","@godxjp/ui-mcp@0.0.0"'),
    );
    mkdirSync(join(repo, "src"), { recursive: true });
    return repo;
  }
  const run = (cwd: string, args: string[]) =>
    spawnSync(process.execPath, [CLI, "mcp-call", ...args], {
      cwd,
      env: cleanEnv(cwd),
      encoding: "utf8",
    });

  it("passes the entry's args, `call <tool> <json>`, its env, and runs from the .mcp.json dir", () => {
    const repo = repoWith(
      `process.stdout.write(JSON.stringify({ argv: process.argv.slice(2), x: process.env.GODX_X, cwd: process.cwd() }));`,
      { GODX_X: "1" },
    );
    const r = run(join(repo, "src"), ["search_components", '{"query":"tabs"}']);
    expect(r.status).toBe(0);
    const got = JSON.parse(r.stdout);
    expect(got.argv).toEqual([
      "--from-entry",
      "@godxjp/ui-mcp@0.0.0",
      "call",
      "search_components",
      '{"query":"tabs"}',
    ]);
    expect(got.x).toBe("1");
    expect(realpathSync(got.cwd)).toBe(repo);
  });

  it("says the server predates `call` instead of hanging when it prints nothing", () => {
    const repo = repoWith(
      `process.stdin.resume(); process.stdin.on("end", () => process.exit(0));`,
    );
    const r = run(repo, ["list_patterns"]);
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("predates `call`");
  });

  it("finds no catalog entry where there is none (it then launches the pinned default)", () => {
    const empty = temp("mcp-call-none-");
    expect(findUiMcpConfig(empty)).toBeNull();
  });
});
