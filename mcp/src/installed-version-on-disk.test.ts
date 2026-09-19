import { mkdirSync, mkdtempSync, rmSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import {
  catalogVersionLine,
  catalogVersionWarning,
  dispatchTool,
  resetInstalledUiCache,
  resolveInstalledUi,
} from "./tools/registry.js";
import pkg from "../package.json";

/*
 * gh#729 — `GODX_UI_VERSION` is written by the launcher when the server STARTS. Measured: a
 * project's .mcp.json pinned 27.8.0 and `claude mcp list` showed it connected, but the PROCESS
 * serving that session had been launched when the pin was 27.3.1. It answered from the 27.3.1
 * catalog and, carrying a 27.3.1 env, had no way to notice the package on disk had moved past it.
 * A consumer agent could not learn that a prop its fix needed exists.
 *
 * So the server reads the installed package ON DISK at answer time. Every case below runs against
 * a temp project with a stubbed cwd — never the real home and never the real node_modules.
 */

const VERSION_LINE = `@godxjp/ui-mcp ${pkg.version} (catalog for @godxjp/ui ${pkg.godxUiCompatibility})`;
const SERVER = pkg.version.split(".").map(Number) as [number, number, number];
const bump = (part: 0 | 1 | 2, by = 1) =>
  SERVER.map((n, i) => (i === part ? n + by : i > part ? 0 : n)).join(".");

const tmpRoots: string[] = [];

/** A project directory, optionally with `node_modules/@godxjp/ui/package.json` in it. */
function project(uiPackageJson?: string): string {
  const root = mkdtempSync(join(tmpdir(), "godx-ui-mcp-729-"));
  tmpRoots.push(root);
  if (uiPackageJson !== undefined) {
    const dir = join(root, "node_modules", "@godxjp", "ui");
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "package.json"), uiPackageJson);
  }
  vi.spyOn(process, "cwd").mockReturnValue(root);
  resetInstalledUiCache();
  return root;
}

const installedUiPath = (root: string) =>
  join(root, "node_modules", "@godxjp", "ui", "package.json");
const withVersion = (version: string) => JSON.stringify({ name: "@godxjp/ui", version });

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  resetInstalledUiCache();
  for (const root of tmpRoots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe("the installed version comes from the package on disk (gh#729)", () => {
  it("resolves it from a node_modules at or above cwd, and says so on the version line", async () => {
    project(withVersion(bump(1)));
    vi.stubEnv("GODX_UI_VERSION", "");

    expect(resolveInstalledUi()).toEqual({ version: bump(1), source: "node_modules" });
    const line = (await dispatchTool("search_components", { query: "date" })).split("\n")[0];
    expect(line).toBe(
      `${VERSION_LINE} — installed @godxjp/ui ${bump(1)} (read from node_modules at answer time)`,
    );
    expect(line).toMatch(/^@godxjp\/ui-mcp (\d+\.\d+\.\d+)/); // the gh#722 format still parses
  });

  it("finds it from a nested working directory, not only the project root", () => {
    const root = project(withVersion(bump(1)));
    const nested = join(root, "apps", "web", "src");
    mkdirSync(nested, { recursive: true });
    vi.spyOn(process, "cwd").mockReturnValue(nested);
    resetInstalledUiCache();

    expect(resolveInstalledUi()?.version).toBe(bump(1));
  });

  it("the package on disk beats a stale launch env — the measured case", () => {
    project(withVersion(bump(1)));
    vi.stubEnv("GODX_UI_VERSION", "27.3.1");

    expect(resolveInstalledUi()).toEqual({ version: bump(1), source: "node_modules" });
  });
});

describe("installed NEWER than this catalog — any semver component (gh#729)", () => {
  it.each([
    ["patch", bump(2)],
    ["minor", bump(1)],
    ["major", bump(0)],
  ])("warns when the installed %s is ahead", async (_part, installed) => {
    project(withVersion(installed));
    vi.stubEnv("GODX_UI_VERSION", "");

    const lines = (await dispatchTool("get_component", { name: "Select" })).split("\n");
    expect(lines[0]).toContain(`installed @godxjp/ui ${installed}`);
    expect(lines[1]).toMatch(/^⚠️ SERVER OLDER THAN INSTALLED PACKAGE: /);
    expect(lines[1]).toContain(`this server is @godxjp/ui-mcp ${pkg.version}`);
    expect(lines[1]).toContain(`the project has @godxjp/ui ${installed} installed`);
    expect(lines[1]).toContain("this catalog is BEHIND the package");
    expect(lines[1]).toContain("may be missing props and components that exist");
    expect(lines[1]).toContain("Do not conclude from this answer that a prop is unavailable");
    expect(lines[1]).toContain("Restart the session");
    expect(lines[1]).toContain("npx @godxjp/ui sync-rules");
    expect(lines[1]).not.toMatch(/MAJOR MISMATCH/); // one line, not two conflicting fixes
  });

  it("warns on the launch env too, when nothing is resolvable on disk", async () => {
    project();
    vi.stubEnv("GODX_UI_VERSION", bump(1));

    const lines = (await dispatchTool("search_components", { query: "date" })).split("\n");
    expect(lines[0]).toBe(
      `${VERSION_LINE} — installed @godxjp/ui ${bump(1)} ` +
        `(from GODX_UI_VERSION at launch — node_modules/@godxjp/ui not resolved)`,
    );
    expect(lines[1]).toMatch(/^⚠️ SERVER OLDER THAN INSTALLED PACKAGE: /);
  });
});

describe("installed OLDER than this catalog keeps the gh#722 line", () => {
  it("still reports a MAJOR gap the other way", async () => {
    project(withVersion("21.0.0"));

    const lines = (await dispatchTool("search_components", { query: "date" })).split("\n");
    expect(lines[0]).toContain(
      "installed @godxjp/ui 21.0.0 (read from node_modules at answer time)",
    );
    expect(lines[1]).toMatch(/^⚠️ MAJOR MISMATCH: /);
    expect(lines[1]).toContain("may describe components that do not exist");
    expect(lines[1]).toContain("@godxjp/ui-mcp@21.0.0");
    expect(lines[1]).not.toMatch(/SERVER OLDER/);
  });

  /*
   * Derived from this catalog's OWN major, never a literal. A hard-coded "27.0.0" silently became
   * a MAJOR-mismatch case the day the package went to 28.0.0, and the test then failed for the
   * version bump rather than for the behaviour it guards.
   */
  it("says nothing for an older patch/minor on the same major", async () => {
    const [major] = pkg.version.split(".");
    project(withVersion(`${major}.0.0`));
    expect(catalogVersionWarning()).toBeNull();
  });
});

describe("in step, or not knowable — no warning at all", () => {
  it("is silent when the installed version equals this catalog", async () => {
    project(withVersion(pkg.version));

    const lines = (await dispatchTool("search_components", { query: "date" })).split("\n");
    expect(lines[0]).toContain(`installed @godxjp/ui ${pkg.version}`);
    expect(lines[1]).toBe(""); // blank separator — no warning line between it and the body
    expect(lines.join("\n")).not.toMatch(/MAJOR MISMATCH|SERVER OLDER/);
  });

  it("falls back to the bare gh#722 line when neither disk nor env answers", async () => {
    project();
    vi.stubEnv("GODX_UI_VERSION", "");

    const lines = (await dispatchTool("search_components", { query: "date" })).split("\n");
    expect(lines[0]).toBe(VERSION_LINE);
    expect(lines[1]).toBe("");
  });

  it("is silent when the version on disk is not a plain x.y.z", () => {
    project(withVersion("workspace:*"));
    expect(catalogVersionWarning()).toBeNull();
    expect(catalogVersionLine()).toContain("installed @godxjp/ui workspace:*");
  });
});

describe("a broken package.json never breaks an answer", () => {
  it.each([
    ["malformed JSON", "{ not json"],
    ["no version field", JSON.stringify({ name: "@godxjp/ui" })],
    ["a non-string version", JSON.stringify({ name: "@godxjp/ui", version: 27 })],
    ["an empty version", JSON.stringify({ name: "@godxjp/ui", version: "  " })],
  ])("falls back silently on %s", async (_case, body) => {
    project(body);
    vi.stubEnv("GODX_UI_VERSION", "");

    expect(() => resolveInstalledUi()).not.toThrow();
    expect(resolveInstalledUi()).toBeNull();
    expect((await dispatchTool("search_components", { query: "date" })).split("\n")[0]).toBe(
      VERSION_LINE,
    );
  });

  it("still reports the launch env when the file on disk is unreadable", () => {
    project("{ not json");
    vi.stubEnv("GODX_UI_VERSION", "27.3.1");

    expect(resolveInstalledUi()).toEqual({ version: "27.3.1", source: "GODX_UI_VERSION" });
  });
});

describe("cheap: one mtime-checked read, not one read per answer", () => {
  it("serves the cached version until the file's mtime moves", () => {
    const root = project(withVersion("27.0.0"));
    const path = installedUiPath(root);
    const pinned = new Date(Date.now() - 60_000);
    utimesSync(path, pinned, pinned);
    expect(resolveInstalledUi()?.version).toBe("27.0.0");

    // Same mtime, different bytes: a cached answer proves the file was not re-read.
    writeFileSync(path, withVersion("99.0.0"));
    utimesSync(path, pinned, pinned);
    expect(resolveInstalledUi()?.version).toBe("27.0.0");

    // Move the mtime and the new version is picked up — no restart, no cache reset.
    const moved = new Date(pinned.getTime() + 2000);
    utimesSync(path, moved, moved);
    expect(resolveInstalledUi()?.version).toBe("99.0.0");
  });

  it("re-resolves when the package appears after a lookup found nothing", () => {
    const root = project();
    expect(resolveInstalledUi()).toBeNull();

    const dir = join(root, "node_modules", "@godxjp", "ui");
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "package.json"), withVersion("27.9.9"));
    expect(resolveInstalledUi()?.version).toBe("27.9.9");
  });
});

describe("the version line still states this package's own version", () => {
  it("matches mcp/package.json, not a hand-written constant", () => {
    project();
    vi.stubEnv("GODX_UI_VERSION", "");
    expect(catalogVersionLine()).toBe(VERSION_LINE);
    expect(pkg.godxUiCompatibility).toMatch(/^\d+\.\d+\.x$/);
  });
});
