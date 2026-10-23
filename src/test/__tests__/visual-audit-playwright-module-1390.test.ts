import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

/**
 * gh#1390 — an app that already has `playwright-core` + Chrome (e.g. in the npx cache) must be able
 * to run visual-audit without installing the `playwright` peer. Resolution order: explicit
 * `--playwright-module` → `playwright` → `playwright-core`; `--executable-path` reaches
 * `chromium.launch`. No browser: the fixture is a stub module in a temp dir.
 *
 * The engine runs in a plain `node` child, as a consumer runs it (vite's transform would otherwise
 * sit between the script and the CJS module it imports). VISUAL_AUDIT_SCRIPT points every case at
 * another engine build — the red-on-old proof.
 */
const ROOT = path.resolve(__dirname, "../../..");
const SCRIPT = process.env.VISUAL_AUDIT_SCRIPT ?? path.join(ROOT, "scripts/visual-audit.mjs");

type Outcome = {
  ok: boolean;
  stub?: string;
  source?: string;
  launched?: unknown;
  message?: string;
  hint?: string;
  bootstrap?: boolean;
};

/** Run `loadDeps(opts)` in a node child; launch the stub with `launch` options when given. */
function loadDeps(opts: { playwrightModule?: string; bases?: string[] }, launch?: object): Outcome {
  const code = `
    const m = await import(${JSON.stringify(pathToFileURL(SCRIPT).href)});
    try {
      const { chromium, source } = await m.loadDeps(${JSON.stringify(opts)});
      const launched = ${launch ? `(await chromium.launch(${JSON.stringify(launch)})).launched` : "undefined"};
      console.log(JSON.stringify({ ok: true, stub: chromium.stub, source, launched }));
    } catch (e) {
      console.log(JSON.stringify({ ok: false, message: e.message, hint: e.hint, bootstrap: e.bootstrap }));
    }`;
  const r = spawnSync(process.execPath, ["--input-type=module", "-e", code], {
    encoding: "utf8",
    timeout: 30_000,
    env: ENV,
  });
  if (r.status !== 0) throw new Error(r.stderr);
  return JSON.parse(r.stdout.trim().split("\n").pop()!);
}

/** Run `launchOptions(opts)` in a node child. */
function launchOptions(opts: object): unknown {
  const code = `
    const m = await import(${JSON.stringify(pathToFileURL(SCRIPT).href)});
    console.log(JSON.stringify(m.launchOptions(${JSON.stringify(opts)})));`;
  const r = spawnSync(process.execPath, ["--input-type=module", "-e", code], {
    encoding: "utf8",
    env: ENV,
  });
  if (r.status !== 0) throw new Error(r.stderr);
  return JSON.parse(r.stdout.trim().split("\n").pop()!);
}

// `pnpm` exports NODE_PATH=<repo>/node_modules/.pnpm/node_modules, where the repo's own playwright
// lives; the child must see only the fixture dirs.
const ENV = { ...process.env, NODE_PATH: "" };

let tmp: string;
let coreDir: string;
let emptyBase: string;

/** A package dir whose CJS entry exports a stub chromium that echoes its launch options. */
function fakePackage(dir: string, name: string, stub: string) {
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, "package.json"), JSON.stringify({ name, main: "index.js" }));
  writeFileSync(
    path.join(dir, "index.js"),
    `exports.chromium = { stub: ${JSON.stringify(stub)}, launch: async (o) => ({ launched: o }) };\n`,
  );
}

beforeAll(() => {
  tmp = realpathSync(mkdtempSync(path.join(tmpdir(), "va-1390-")));
  // An app with only playwright-core installed (no `playwright`).
  const app = path.join(tmp, "app");
  coreDir = path.join(app, "node_modules", "playwright-core");
  fakePackage(coreDir, "playwright-core", "app-core");
  writeFileSync(path.join(app, "package.json"), JSON.stringify({ name: "app" }));
  // A place where neither package resolves.
  emptyBase = path.join(tmp, "empty", "package.json");
  mkdirSync(path.dirname(emptyBase), { recursive: true });
  writeFileSync(emptyBase, "{}");
  // A module somewhere else (the npx-cache case), named only by an explicit path.
  fakePackage(path.join(tmp, "npx-cache", "playwright-core"), "playwright-core", "explicit");
});

afterAll(() => rmSync(tmp, { recursive: true, force: true }));

describe("visual-audit playwright resolution (gh#1390)", () => {
  const appBase = () => path.join(tmp, "app", "package.json");
  const npxDir = () => path.join(tmp, "npx-cache", "playwright-core");

  it("an explicit --playwright-module directory is loaded and its chromium used", () => {
    const r = loadDeps({ playwrightModule: npxDir() });
    expect(r).toMatchObject({ ok: true, stub: "explicit", source: npxDir() });
  });

  it("an explicit entry file works too", () => {
    expect(loadDeps({ playwrightModule: path.join(npxDir(), "index.js") }).stub).toBe("explicit");
  });

  it("the explicit path wins over a resolvable package", () => {
    expect(loadDeps({ playwrightModule: npxDir(), bases: [appBase()] }).stub).toBe("explicit");
  });

  it("falls back to playwright-core when the playwright peer is absent", () => {
    const r = loadDeps({ bases: [emptyBase, appBase()] });
    expect(r).toMatchObject({ ok: true, stub: "app-core", source: path.join(coreDir, "index.js") });
  });

  it("prefers the playwright peer over playwright-core", () => {
    const both = path.join(tmp, "both");
    fakePackage(path.join(both, "node_modules", "playwright"), "playwright", "peer");
    fakePackage(path.join(both, "node_modules", "playwright-core"), "playwright-core", "core");
    writeFileSync(path.join(both, "package.json"), "{}");
    expect(loadDeps({ bases: [path.join(both, "package.json")] }).stub).toBe("peer");
  });

  it("nothing found: a bootstrap error that lists every attempt", () => {
    const r = loadDeps({ bases: [emptyBase] });
    expect(r.ok).toBe(false);
    expect(r.bootstrap).toBe(true);
    const where = path.dirname(emptyBase);
    expect(r.message).toContain(`playwright (from ${where})`);
    expect(r.message).toContain(`playwright-core (from ${where})`);
    expect(r.hint).toContain("--playwright-module");
    expect(r.hint).toContain("--executable-path");
  });

  it("a bad explicit path errors and never falls through to another engine", () => {
    const missing = path.join(tmp, "nope", "playwright-core");
    const r = loadDeps({ playwrightModule: missing, bases: [appBase()] });
    expect(r).toMatchObject({ ok: false, bootstrap: true });
    expect(r.message).toContain(missing);
  });

  it("a module that does not export chromium is rejected", () => {
    const bad = path.join(tmp, "bad");
    mkdirSync(bad, { recursive: true });
    writeFileSync(path.join(bad, "index.js"), "exports.firefox = {};\n");
    const r = loadDeps({ playwrightModule: bad });
    expect(r.ok).toBe(false);
    expect(r.message).toMatch(/does not export chromium/);
  });

  it("--executable-path wins over PLAYWRIGHT_CHROMIUM_EXECUTABLE, which is the fallback", () => {
    const env = { PLAYWRIGHT_CHROMIUM_EXECUTABLE: "/env/chrome" };
    expect(launchOptions({ executablePath: "/flag/chrome", env })).toEqual({
      executablePath: "/flag/chrome",
    });
    expect(launchOptions({ env })).toEqual({ executablePath: "/env/chrome" });
    expect(launchOptions({ env: {} })).toEqual({});
    // The options reach the stub's launch unchanged.
    const r = loadDeps({ playwrightModule: coreDir }, { executablePath: "/flag/chrome" });
    expect(r.launched).toEqual({ executablePath: "/flag/chrome" });
  });

  it("CLI: a missing --playwright-module is an infrastructure error, not read as the baseUrl", () => {
    const missing = path.join(tmp, "nope", "playwright-core");
    const r = spawnSync(
      process.execPath,
      [SCRIPT, "--format", "json", "--playwright-module", missing, "http://127.0.0.1:9/"],
      { encoding: "utf8", timeout: 60_000 },
    );
    const result = JSON.parse(r.stdout);
    expect(result.status).toBe("error");
    expect(result.errors[0].message).toContain("--playwright-module");
    expect(result.errors[0].message).toContain(missing);
  });

  it("CLI: a missing --executable-path is an infrastructure error", () => {
    const missing = path.join(tmp, "nope", "chrome");
    const r = spawnSync(
      process.execPath,
      [SCRIPT, "--format", "json", "--executable-path", missing, "http://127.0.0.1:9/"],
      { encoding: "utf8", timeout: 60_000 },
    );
    const result = JSON.parse(r.stdout);
    expect(result.status).toBe("error");
    expect(result.errors[0].message).toContain("--executable-path");
  });
});
