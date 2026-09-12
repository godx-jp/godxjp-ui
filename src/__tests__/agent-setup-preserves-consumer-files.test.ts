import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
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

  it("keeps the file's PERMISSIONS — `rename` does not carry them", () => {
    // The temp-plus-rename that made writes atomic introduced this: the replacement file is born
    // under the process umask, so a `.mcp.json` the consumer had chmod'd 600 came back 644 after
    // the first sync. Silently, because the CONTENT was right. It happens on EVERY write, not only
    // under contention, which makes it the worse half of the two atomicity defects.
    const root = consumerRepo();
    const path = join(root, ".mcp.json");
    writeFileSync(path, JSON.stringify({ mcpServers: { other: { command: "x" } } }));
    chmodSync(path, 0o600);

    expect(ensureMcpJson(root)).toBe("added");

    expect(statSync(path).mode & 0o777).toBe(0o600);
  });

  it("uses a UNIQUE temp name, so two installs cannot overwrite each other's", () => {
    // A fixed `${path}.godxjp-ui-tmp` is a shared mutable file. Asserted on the source rather than
    // by racing two processes: a race that passes once proves nothing, and one that fails is a
    // flake. What must hold is that the name cannot collide by construction.
    const source = readFileSync(join(process.cwd(), "scripts/_agent-setup.mjs"), "utf8");
    const tmpName = /const tmp = `\$\{path\}([^`]*)`/.exec(source)?.[1] ?? "";

    expect(tmpName, "no temp name found in writeFileAtomic").not.toBe("");
    expect(tmpName, "the temp name is constant, so concurrent writes collide").toMatch(/\$\{/);
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
