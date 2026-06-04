import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { TOOL_DEFINITIONS, dispatchTool } from "./tools/registry.js";
import { RESOURCE_DEFINITIONS, readResource } from "./resources/registry.js";
import { COMPONENTS } from "./data/components.js";
import pkg from "../package.json";

describe("tool registry", () => {
  it("exposes a stable, well-formed, unique set of tools", () => {
    expect(TOOL_DEFINITIONS.length).toBeGreaterThanOrEqual(17);
    const names = TOOL_DEFINITIONS.map((t) => t.name);
    expect(new Set(names).size).toBe(names.length); // no dupes
    for (const t of TOOL_DEFINITIONS) {
      expect(t.name).toMatch(/^[a-z_]+$/);
      expect(typeof t.description).toBe("string");
      expect(t.description.length).toBeGreaterThan(10);
      expect(t.inputSchema?.type).toBe("object");
    }
  });

  it("every declared tool is dispatchable — no definition/dispatch drift", async () => {
    for (const t of TOOL_DEFINITIONS) {
      const out = await dispatchTool(t.name, {});
      expect(typeof out).toBe("string");
      expect(out).not.toMatch(/^Unknown tool:/);
    }
  });

  it("reports (not throws) an unknown tool", async () => {
    expect(await dispatchTool("does_not_exist", {})).toMatch(/^Unknown tool:/);
  });

  it("key tools return real content", async () => {
    const real = COMPONENTS[0].name;
    expect(await dispatchTool("list_primitives", {})).toContain("@godxjp/ui");
    expect(await dispatchTool("get_component", { name: real })).toContain(real);
    expect(await dispatchTool("get_component", { name: "__nope__" })).toMatch(/not found/i);
    expect(await dispatchTool("route_task", { task: "build a settings page" })).toContain("skill");
    expect(await dispatchTool("get_tokens", {})).toContain("tokens");
  });

  it("lint_jsx flags a raw <button>", async () => {
    expect(await dispatchTool("lint_jsx", { jsx: "<button>Go</button>" })).toMatch(/Button/);
  });
});

describe("resource registry", () => {
  it("declares well-formed resources", () => {
    expect(RESOURCE_DEFINITIONS.length).toBeGreaterThan(0);
    for (const r of RESOURCE_DEFINITIONS) {
      expect(typeof r.uri).toBe("string");
      expect(r.uri).toMatch(/^godx-ui:\/\//);
      expect(typeof r.name).toBe("string");
      expect(typeof r.mimeType).toBe("string");
    }
  });

  it("reads every declared resource + a templated one", async () => {
    for (const r of RESOURCE_DEFINITIONS) {
      const text = await readResource(r.uri);
      expect(typeof text).toBe("string");
      expect(text.length).toBeGreaterThan(0);
    }
    const oneComponent = await readResource(`godx-ui://components/${COMPONENTS[0].name}`);
    expect(oneComponent).toContain(COMPONENTS[0].name);
  });

  it("throws on an unknown resource uri", async () => {
    await expect(readResource("godx-ui://nope")).rejects.toThrow();
  });
});

describe("server version", () => {
  it("serverInfo version tracks package.json — never hardcoded", () => {
    const src = readFileSync(fileURLToPath(new URL("./index.ts", import.meta.url)), "utf8");
    expect(src).toMatch(/version:\s*pkg\.version/);
    expect(src).not.toMatch(/version:\s*["']\d+\.\d+\.\d+["']/); // no hardcoded semver
    expect(pkg.version).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
