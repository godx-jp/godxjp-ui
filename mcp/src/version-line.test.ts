import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TOOL_DEFINITIONS, dispatchTool, resetInstalledUiCache } from "./tools/registry.js";

/*
 * gh#722 — a stale server registered outside the project answered as confidently as the current
 * one, and nothing in its output said which version spoke. Every catalog answer now opens with
 * the version that produced it, and warns when the installed @godxjp/ui is on another major.
 */
const pkgJson = JSON.parse(
  readFileSync(fileURLToPath(new URL("../package.json", import.meta.url)), "utf8"),
) as { version: string; godxUiCompatibility: string };
const VERSION_LINE = `@godxjp/ui-mcp ${pkgJson.version} (catalog for @godxjp/ui ${pkgJson.godxUiCompatibility})`;
const [MAJOR] = pkgJson.version.split(".");

/*
 * gh#729 added an "installed @godxjp/ui …" suffix, resolved from the package on disk. These cases
 * are about the launch env, so they run in an empty temp cwd: no real node_modules is ever read.
 */
let emptyCwd: string;

beforeEach(() => {
  emptyCwd = mkdtempSync(join(tmpdir(), "godx-ui-mcp-722-"));
  vi.spyOn(process, "cwd").mockReturnValue(emptyCwd);
  resetInstalledUiCache();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  resetInstalledUiCache();
  rmSync(emptyCwd, { recursive: true, force: true });
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
      expect(lines[0]).toBe(
        `${VERSION_LINE} — installed @godxjp/ui 21.0.0 ` +
          `(from GODX_UI_VERSION at launch — node_modules/@godxjp/ui not resolved)`,
      );
      expect(lines[1]).toMatch(/^⚠️ MAJOR MISMATCH: /);
      expect(lines[1]).toContain(`@godxjp/ui-mcp ${pkgJson.version}`);
      expect(lines[1]).toContain("@godxjp/ui 21.0.0 installed");
      expect(lines[1]).toContain("may describe components that do not exist");
      expect(lines[1]).toContain("@godxjp/ui-mcp@21.0.0");
    }
  });

  // A HIGHER minor is no longer silent — it is the gh#729 staleness case, covered in
  // installed-version-on-disk.test.ts. The major line is still only about the major.
  it("stays silent on the same major, on an earlier minor", async () => {
    vi.stubEnv("GODX_UI_VERSION", `${MAJOR}.0.0`);
    const out = await dispatchTool("search_components", { query: "date" });
    expect(out.split("\n")[0]).toContain(VERSION_LINE);
    expect(out).not.toMatch(/MAJOR MISMATCH/);
  });

  it("stays silent when the installed version is unknown or not x.y.z", async () => {
    vi.stubEnv("GODX_UI_VERSION", "workspace:*");
    expect(await dispatchTool("search_components", { query: "date" })).not.toMatch(
      /MAJOR MISMATCH/,
    );
  });
});
