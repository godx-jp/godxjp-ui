import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { PATTERNS } from "./data/patterns.js";
import { dispatchTool, resetInstalledUiCache, uiVersionMatchesCatalog } from "./tools/registry.js";
import pkg from "../package.json";

const sampleComponent = "Select";
const samplePattern = PATTERNS[0]?.name ?? "registration-form";

const tmpRoots: string[] = [];

/** A project dir as cwd — never the real node_modules (gh#729 test isolation). */
function project(installed?: { version: string; components?: unknown[]; patterns?: unknown[] }) {
  const root = mkdtempSync(join(tmpdir(), "godx-ui-mcp-1527-"));
  tmpRoots.push(root);
  if (installed) {
    const dir = join(root, "node_modules", "@godxjp", "ui");
    mkdirSync(join(dir, "agent"), { recursive: true });
    writeFileSync(
      join(dir, "package.json"),
      JSON.stringify({ name: "@godxjp/ui", version: installed.version }),
    );
    if (installed.components)
      writeFileSync(join(dir, "agent", "components.json"), JSON.stringify(installed.components));
    if (installed.patterns)
      writeFileSync(join(dir, "agent", "patterns.json"), JSON.stringify(installed.patterns));
  }
  vi.spyOn(process, "cwd").mockReturnValue(root);
  resetInstalledUiCache();
  return root;
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  resetInstalledUiCache();
  for (const root of tmpRoots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe("catalog gate via GODX_UI_VERSION from launcher (gh#543)", () => {
  it("fixture A — matching minor returns component snippet with no mismatch notice", async () => {
    project();
    const [maj, min] = pkg.version.split(".");
    vi.stubEnv("GODX_UI_VERSION", `${maj}.${min}.0`);
    expect(uiVersionMatchesCatalog(`${maj}.${min}.0`)).toBe(true);

    const out = await dispatchTool("get_component", { name: sampleComponent });
    expect(out).toContain("## Example");
    expect(out).toMatch(/```tsx/);
    expect(out).not.toMatch(/Catalog withheld/);
    expect(out).not.toMatch(/VERSION MISMATCH/);
  });

  it("fixture B — mismatched minor still serves the bundled catalog, with a warning (gh#1527)", async () => {
    project(); // no node_modules/@godxjp/ui on disk → only the launcher env knows the version
    vi.stubEnv("GODX_UI_VERSION", "20.1.0");
    expect(uiVersionMatchesCatalog("20.1.0")).toBe(false);

    const out = await dispatchTool("get_component", { name: sampleComponent });
    expect(out).not.toMatch(/Catalog withheld/);
    expect(out).toMatch(/VERSION MISMATCH — `get_component` answers anyway/);
    expect(out).toContain("@godxjp/ui 20.1.0");
    expect(out).toContain(`@godxjp/ui-mcp ${pkg.version}`);
    expect(out).toContain("npx @godxjp/ui sync-rules");
    expect(out).toMatch(/BUNDLED catalog/);
    expect(out).toContain("## Props");
    expect(out).toContain("## Example");
    expect(out).toMatch(/```tsx/);

    const patternOut = await dispatchTool("get_pattern", { name: samplePattern });
    expect(patternOut).toMatch(/VERSION MISMATCH — `get_pattern` answers anyway/);
    expect(patternOut).toContain("npx @godxjp/ui sync-rules");
    expect(patternOut).toMatch(/```tsx/);
  });
});

describe("a mismatch serves the INSTALLED package's own catalog when it is on disk (gh#1527)", () => {
  it("reads node_modules/@godxjp/ui/agent/components.json + patterns.json", async () => {
    // The kintai case: an MCP pinned to an older catalog, the app on a newer @godxjp/ui.
    const root = project({
      version: "20.1.0",
      components: [
        {
          name: sampleComponent,
          group: "data-entry",
          tagline: "Installed-build tagline.",
          props: [{ name: "installedOnlyProp", type: "boolean", description: "From 20.1.0." }],
          example: "<Select installedOnlyProp />",
          rules: [],
        },
      ],
      patterns: [
        {
          name: samplePattern,
          tagline: "Installed pattern.",
          tags: [],
          code: "// installed-pattern-code",
        },
      ],
    });

    const out = await dispatchTool("get_component", { name: sampleComponent });
    expect(out).toMatch(/VERSION MISMATCH — `get_component` answers anyway/);
    expect(out).toContain("@godxjp/ui 20.1.0");
    expect(out).toContain(`@godxjp/ui-mcp ${pkg.version}`);
    expect(out).toContain(join(root, "node_modules", "@godxjp", "ui", "agent", "components.json"));
    expect(out).toContain("installedOnlyProp");
    expect(out).toContain("<Select installedOnlyProp />");

    const patternOut = await dispatchTool("get_pattern", { name: samplePattern });
    expect(patternOut).toContain("// installed-pattern-code");
  });

  it("falls back to the bundled entry when the installed catalog lacks the name or its shape", async () => {
    project({
      version: "20.1.0",
      components: [{ name: sampleComponent, props: "not-an-array" }, { name: 42 }, null],
      patterns: [{ name: 7, aliases: 3 }],
    });
    const out = await dispatchTool("get_component", { name: sampleComponent });
    expect(out).toMatch(/has no usable entry for this name/);
    expect(out).toMatch(/BUNDLED catalog/);
    expect(out).toContain("## Props");
    const patternOut = await dispatchTool("get_pattern", { name: samplePattern });
    expect(patternOut).toMatch(/BUNDLED catalog/);
    expect(patternOut).toMatch(/```tsx/);
  });

  it("says so when the installed package ships no agent/ catalog", async () => {
    project({ version: "20.1.0" });
    const out = await dispatchTool("get_component", { name: sampleComponent });
    expect(out).toMatch(/No installed `agent\/` catalog was found on disk/);
    expect(out).toContain("## Props");
  });
});
