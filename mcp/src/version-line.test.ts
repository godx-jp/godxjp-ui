import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { afterEach, describe, expect, it, vi } from "vitest";

import { TOOL_DEFINITIONS, dispatchTool } from "./tools/registry.js";

/*
 * gh#722 — a stale server registered outside the project answered as confidently as the current
 * one, and nothing in its output said which version spoke. Every catalog answer now opens with
 * the version that produced it, and warns when the installed @godxjp/ui is on another major.
 */
const pkgJson = JSON.parse(
  readFileSync(fileURLToPath(new URL("../package.json", import.meta.url)), "utf8"),
) as { version: string; godxUiCompatibility: string };
const VERSION_LINE = `@godxjp/ui-mcp ${pkgJson.version} (catalog for @godxjp/ui ${pkgJson.godxUiCompatibility})`;
const [MAJOR, MINOR] = pkgJson.version.split(".");

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("every catalog answer states the version that produced it (gh#722)", () => {
  it.each([
    ["get_component", { name: "Select" }],
    ["get_component", { name: "DateRangePicker" }],
    ["search_components", { query: "date" }],
  ])("%s %j opens with the package.json version line", async (tool, args) => {
    vi.stubEnv("GODX_UI_VERSION", "");
    const out = await dispatchTool(tool, args);
    expect(out.split("\n")[0]).toBe(VERSION_LINE);
    expect(out).not.toMatch(/MAJOR MISMATCH/);
  });

  it("every declared tool carries it — one wrapper, not per-tool edits", async () => {
    vi.stubEnv("GODX_UI_VERSION", "");
    for (const t of TOOL_DEFINITIONS) {
      const out = await dispatchTool(t.name, {});
      expect(out.split("\n")[0], t.name).toBe(VERSION_LINE);
    }
  });

  it("an unknown tool is not a catalog answer and is not stamped", async () => {
    expect(await dispatchTool("does_not_exist", {})).toMatch(/^Unknown tool:/);
  });
});

describe("major-mismatch warning from GODX_UI_VERSION (gh#722)", () => {
  it("warns on the second line when the installed major differs", async () => {
    vi.stubEnv("GODX_UI_VERSION", "21.0.0");
    for (const [tool, args] of [
      ["get_component", { name: "Select" }],
      ["search_components", { query: "date" }],
    ] as const) {
      const lines = (await dispatchTool(tool, args)).split("\n");
      expect(lines[0]).toBe(VERSION_LINE);
      expect(lines[1]).toMatch(/^⚠️ MAJOR MISMATCH: /);
      expect(lines[1]).toContain(`@godxjp/ui-mcp ${pkgJson.version}`);
      expect(lines[1]).toContain("@godxjp/ui 21.0.0 installed");
      expect(lines[1]).toContain("may describe components that do not exist");
      expect(lines[1]).toContain("@godxjp/ui-mcp@21.0.0");
    }
  });

  it("stays silent on the same major, even on another minor", async () => {
    vi.stubEnv("GODX_UI_VERSION", `${MAJOR}.${Number(MINOR) + 1}.0`);
    const out = await dispatchTool("search_components", { query: "date" });
    expect(out.split("\n")[0]).toBe(VERSION_LINE);
    expect(out).not.toMatch(/MAJOR MISMATCH/);
  });

  it("stays silent when the installed version is unknown or not x.y.z", async () => {
    vi.stubEnv("GODX_UI_VERSION", "workspace:*");
    expect(await dispatchTool("search_components", { query: "date" })).not.toMatch(
      /MAJOR MISMATCH/,
    );
  });
});
