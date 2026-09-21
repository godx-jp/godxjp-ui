import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  ensureMcpJson,
  mcpServerFor,
  readConsumerUiMetadata,
} from "../../scripts/_agent-setup.mjs";

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

  it("a package-written entry with an OLD pin is moved to the installed pin", () => {
    const root = consumerRepo({ version: "26.2.0" });
    const stale = {
      command: "npx",
      args: ["@godxjp/ui-mcp@25.4.0"],
      env: { GODX_UI_VERSION: "25.4.0" },
    };
    writeFileSync(
      join(root, ".mcp.json"),
      JSON.stringify({ mcpServers: { "godx-ui": stale, other: { command: "x" } } }, null, 2),
    );

    expect(ensureMcpJson(root)).toBe("refreshed");
    const after = JSON.parse(readFileSync(join(root, ".mcp.json"), "utf8"));
    expect(after.mcpServers["godx-ui"]).toEqual({
      command: "npx",
      args: ["@godxjp/ui-mcp@26.2.0"],
      env: { GODX_UI_VERSION: "26.2.0" },
    });
    expect(after.mcpServers.other).toEqual({ command: "x" });
    expect(ensureMcpJson(root)).toBe("present");
  });

  // gh#692: the catalog server registered under a different key, in a file indented at 4.
  const fourSpaces = (value: unknown) => JSON.stringify(value, null, 4) + "\n";

  it("an @godxjp/ui-mcp entry under another key is not duplicated, and the file is untouched", () => {
    const root = consumerRepo({ version: "26.2.0" });
    const original = fourSpaces({
      mcpServers: {
        omnify: { command: "npx", args: ["omnify", "mcp"] },
        "godxjp-ui": { command: "npx", args: ["-y", "@godxjp/ui-mcp@latest"] },
      },
    });
    writeFileSync(join(root, ".mcp.json"), original);

    expect(ensureMcpJson(root)).toMatch(
      /^present \(custom godx-ui MCP entry under key "godxjp-ui"/,
    );
    expect(readFileSync(join(root, ".mcp.json"), "utf8")).toBe(original);
  });

  it("a package-written entry under another key is refreshed IN PLACE, keeping the indentation", () => {
    const root = consumerRepo({ version: "26.2.0" });
    writeFileSync(
      join(root, ".mcp.json"),
      fourSpaces({
        mcpServers: {
          ui: {
            command: "npx",
            args: ["@godxjp/ui-mcp@25.4.0"],
            env: { GODX_UI_VERSION: "25.4.0" },
          },
        },
      }),
    );

    expect(ensureMcpJson(root)).toBe("refreshed");
    expect(readFileSync(join(root, ".mcp.json"), "utf8")).toBe(
      fourSpaces({
        mcpServers: {
          ui: {
            command: "npx",
            args: ["@godxjp/ui-mcp@26.2.0"],
            env: { GODX_UI_VERSION: "26.2.0" },
          },
        },
      }),
    );
  });

  it("adding the entry to an existing file keeps that file's indentation", () => {
    const root = consumerRepo({ version: "26.2.0" });
    writeFileSync(
      join(root, ".mcp.json"),
      fourSpaces({ mcpServers: { omnify: { command: "npx" } } }),
    );

    expect(ensureMcpJson(root)).toBe("added");
    const raw = readFileSync(join(root, ".mcp.json"), "utf8");
    expect(raw).toBe(fourSpaces(JSON.parse(raw)));
    expect(Object.keys(JSON.parse(raw).mcpServers)).toEqual(["omnify", "godx-ui"]);
  });
});
