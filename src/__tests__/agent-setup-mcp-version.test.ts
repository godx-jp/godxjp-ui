import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

// @ts-expect-error — plain ESM script without a declaration file
import { ensureMcpJson, mcpServerFor, readConsumerUiMetadata } from "../../scripts/_agent-setup.mjs";

const roots: string[] = [];

function consumerRepo(ui: { version: string; godxUiMcp?: string }) {
  const root = mkdtempSync(join(tmpdir(), "godxui-mcp-ver-"));
  roots.push(root);
  const uiDir = join(root, "node_modules", "@godxjp", "ui");
  mkdirSync(uiDir, { recursive: true });
  writeFileSync(
    join(uiDir, "package.json"),
    JSON.stringify({
      name: "@godxjp/ui",
      version: ui.version,
      godxUiMcp: ui.godxUiMcp ?? ui.version,
    }),
  );
  return root;
}

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe("ensureMcpJson pins MCP and passes installed UI version (gh#543)", () => {
  it("version A (23.4.x) writes pinned @godxjp/ui-mcp and GODX_UI_VERSION env", () => {
    const root = consumerRepo({ version: "23.4.0", godxUiMcp: "23.4.1" });
    expect(readConsumerUiMetadata(root)).toEqual({ version: "23.4.0", godxUiMcp: "23.4.1" });
    expect(mcpServerFor(root)).toEqual({
      command: "npx",
      args: ["@godxjp/ui-mcp@23.4.1"],
      env: { GODX_UI_VERSION: "23.4.0" },
    });

    expect(ensureMcpJson(root)).toBe("created");
    const entry = JSON.parse(readFileSync(join(root, ".mcp.json"), "utf8")).mcpServers["godx-ui"];
    expect(entry).toEqual(mcpServerFor(root));
  });

  it("version B (20.1.x) still pins MCP from godxUiMcp — launcher does not resolve latest", () => {
    const root = consumerRepo({ version: "20.1.0", godxUiMcp: "20.1.3" });
    expect(ensureMcpJson(root)).toBe("created");
    const entry = JSON.parse(readFileSync(join(root, ".mcp.json"), "utf8")).mcpServers["godx-ui"];
    expect(entry.args).toEqual(["@godxjp/ui-mcp@20.1.3"]);
    expect(entry.env).toEqual({ GODX_UI_VERSION: "20.1.0" });
  });

  it("consumer custom godx-ui MCP entry is not overwritten", () => {
    const root = consumerRepo({ version: "23.4.0", godxUiMcp: "23.4.1" });
    const custom = {
      command: "node",
      args: ["/opt/my-fork/godx-ui-mcp.js"],
      env: { GODX_UI_VERSION: "23.4.0", EXTRA: "1" },
    };
    writeFileSync(
      join(root, ".mcp.json"),
      JSON.stringify({ mcpServers: { "godx-ui": custom, other: { command: "x" } } }, null, 2),
    );

    const result = ensureMcpJson(root);
    expect(result).toMatch(/^present \(custom godx-ui MCP entry/);
    const after = JSON.parse(readFileSync(join(root, ".mcp.json"), "utf8"));
    expect(after.mcpServers["godx-ui"]).toEqual(custom);
    expect(after.mcpServers.other).toEqual({ command: "x" });
  });
});
