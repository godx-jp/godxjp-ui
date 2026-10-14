import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

// @ts-expect-error — plain .mjs script, no declaration file
import { AUDIT_HOOK_CMD, ensureClaudeHooks } from "../../scripts/_agent-setup.mjs";

/**
 * gh#1296 — the per-edit audit hook was `node node_modules/@godxjp/ui/scripts/audit-hook.mjs`, a
 * path that does not exist in a workspace package whose install is hoisted to the repo root, so the
 * hook silently did nothing there. The command now resolves through the package bin, and the old
 * default is rewritten in place on the next init-agent; a custom command is left alone.
 */
const roots: string[] = [];
afterEach(() => {
  for (const r of roots.splice(0)) rmSync(r, { recursive: true, force: true });
});

function repoWithSettings(settings: unknown) {
  const root = mkdtempSync(join(tmpdir(), "godxui-hook-"));
  roots.push(root);
  mkdirSync(join(root, ".claude"), { recursive: true });
  writeFileSync(join(root, ".claude", "settings.json"), JSON.stringify(settings, null, 2));
  return root;
}
const hookCommands = (root: string) =>
  (
    JSON.parse(readFileSync(join(root, ".claude", "settings.json"), "utf8")).hooks.PostToolUse as {
      hooks: { command: string }[];
    }[]
  ).flatMap((g) => g.hooks.map((h) => h.command));

describe("audit hook command survives a hoisted install (gh#1296)", () => {
  it("installs a bin-resolved command, not a node_modules path", () => {
    const root = repoWithSettings({});
    ensureClaudeHooks(root);
    expect(hookCommands(root)).toEqual([AUDIT_HOOK_CMD]);
    expect(AUDIT_HOOK_CMD).not.toContain("node_modules/");
  });

  it("rewrites the old default in place — one hook, not two", () => {
    const root = repoWithSettings({
      hooks: {
        PostToolUse: [
          {
            matcher: "Write|Edit|MultiEdit",
            hooks: [
              { type: "command", command: "node node_modules/@godxjp/ui/scripts/audit-hook.mjs" },
            ],
          },
        ],
      },
    });
    ensureClaudeHooks(root);
    const commands = hookCommands(root);
    expect(commands).toHaveLength(1);
    expect(commands[0]).not.toContain("node_modules/");
  });

  it("leaves a consumer's own audit-hook command alone", () => {
    const custom = "node ../../node_modules/@godxjp/ui/scripts/audit-hook.mjs --quiet";
    const root = repoWithSettings({
      hooks: { PostToolUse: [{ matcher: "Write", hooks: [{ type: "command", command: custom }] }] },
    });
    ensureClaudeHooks(root);
    expect(hookCommands(root)).toEqual([custom]);
  });
});
