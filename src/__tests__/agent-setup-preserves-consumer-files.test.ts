import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

// prettier-ignore
// @ts-expect-error — plain ESM script without a declaration file
import { ensureClaudeHooks, ensureClaudeMd, ensureMcpJson, refreshBlock } from "../../scripts/_agent-setup.mjs";

/*
 * These helpers run from `postinstall`, unattended, inside somebody else's repository. They used to
 * destroy data in two ways (gh#541), and both were reproduced before this file existed:
 *
 *   • `readJson` returned `null` for "no file" AND for "file I cannot parse", so
 *     `readJson(path) ?? {}` read a consumer's malformed `.mcp.json` as an empty object and wrote
 *     over it. Their other MCP servers went with it. No throw, no warning, no backup.
 *   • `refreshBlock` set `tail = ""` when the closing marker was missing, so everything the
 *     consumer had written below our managed block was dropped.
 *
 * The assertions below are about what SURVIVES, not about what we write. A test that only checked
 * our own key was present passed throughout the whole defect.
 */

const roots: string[] = [];

function consumerRepo() {
  const root = mkdtempSync(join(tmpdir(), "godxui-preserve-"));
  roots.push(root);
  return root;
}

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe("a config we cannot parse is never written to (gh#541)", () => {
  it(".mcp.json with a trailing comma keeps the consumer's other servers", () => {
    const root = consumerRepo();
    const path = join(root, ".mcp.json");
    // Valid to a reader, one comma wrong — the shape people actually type.
    const original = '{"mcpServers":{"existing-server":{"command":"node"}},}';
    writeFileSync(path, original);

    const result = ensureMcpJson(root);

    expect(readFileSync(path, "utf8")).toBe(original);
    expect(result).toMatch(/^left untouched \(not valid JSON\)/);
    expect(existsSync(`${path}.godxjp-ui-suggested`)).toBe(true);
  });

  it(".mcp.json that parses to a non-object is refused too", () => {
    const root = consumerRepo();
    const path = join(root, ".mcp.json");
    writeFileSync(path, "[]");

    expect(ensureMcpJson(root)).toMatch(/^left untouched \(JSON, but not an object\)/);
    expect(readFileSync(path, "utf8")).toBe("[]");
  });

  it(".claude/settings.json holds the consumer's OWN hooks, so it gets the same guard", () => {
    const root = consumerRepo();
    mkdirSync(join(root, ".claude"), { recursive: true });
    const path = join(root, ".claude", "settings.json");
    const original = '{"hooks":{"PostToolUse":[{"matcher":"Write"}]},,}';
    writeFileSync(path, original);

    expect(ensureClaudeHooks(root)).toEqual([expect.stringMatching(/^left untouched/)]);
    expect(readFileSync(path, "utf8")).toBe(original);
  });

  it("the control still works: a VALID file keeps its servers and gains ours", () => {
    const root = consumerRepo();
    const path = join(root, ".mcp.json");
    writeFileSync(path, JSON.stringify({ mcpServers: { other: { command: "x" } } }));

    expect(ensureMcpJson(root)).toBe("added");

    const after = JSON.parse(readFileSync(path, "utf8"));
    expect(Object.keys(after.mcpServers).sort()).toEqual(["godx-ui", "other"]);
  });

  it("the control still works: no file at all is created", () => {
    const root = consumerRepo();
    expect(ensureMcpJson(root)).toBe("created");
    expect(JSON.parse(readFileSync(join(root, ".mcp.json"), "utf8")).mcpServers).toHaveProperty(
      "godx-ui",
    );
  });
});

describe("a managed block with broken markers is refused, not guessed at (gh#541)", () => {
  const START = "<!-- godxjp-ui:start";
  const END = "<!-- godxjp-ui:end -->";
  const NEXT = `${START} -->\nnew\n${END}`;

  it("missing closing marker: everything after the opening marker survives", () => {
    const current = `# Project\n${START} -->\nold\n## PRIVATE RULES\nkeep me\n`;
    expect(refreshBlock(current, NEXT, START, END)).toBeNull();
  });

  it("a duplicated opening marker is ambiguous, so it is refused", () => {
    const current = `${START} -->\na\n${END}\n${START} -->\nb\n${END}\n`;
    expect(refreshBlock(current, NEXT, START, END)).toBeNull();
  });

  it("ensureClaudeMd leaves the file byte-for-byte when refreshBlock refuses", () => {
    const root = consumerRepo();
    const path = join(root, "CLAUDE.md");
    const original = `# Project\n${START} -->\nstale block\n## PRIVATE RULES\nkeep me\n`;
    writeFileSync(path, original);

    expect(ensureClaudeMd(root)).toMatch(/^left untouched \(godxjp-ui markers are broken\)/);
    expect(readFileSync(path, "utf8")).toBe(original);
  });

  it("the control still works: well-formed markers refresh and keep the tail", () => {
    const current = `# P\n${START} -->\nold\n${END}\nkeep me\n`;
    const out = refreshBlock(current, NEXT, START, END);
    expect(out).toContain("new");
    expect(out).toContain("keep me");
    expect(out).not.toContain("old");
  });
});
