import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(join(root, path), "utf8")) as T;
}

describe("shadcn release guardrails", () => {
  it("keeps components.json aligned to the package UI bridge", () => {
    const config = readJson<{
      aliases?: Record<string, string>;
      tailwind?: { css?: string; cssVariables?: boolean };
      iconLibrary?: string;
    }>("components.json");

    expect(config.aliases?.ui).toBe("@/components/ui");
    expect(config.aliases?.utils).toBe("@/lib/utils");
    expect(config.tailwind?.css).toBe("src/styles/index.css");
    expect(config.tailwind?.cssVariables).toBe(true);
    expect(config.iconLibrary).toBe("lucide");
  });

  it("exports shadcn-compatible entrypoints from package.json", () => {
    const pkg = readJson<{
      exports?: Record<string, string | { import?: string; types?: string }>;
      scripts?: Record<string, string>;
    }>("package.json");
    const exports = pkg.exports ?? {};

    // Post dist-build the `./ui` subpath resolves to the built bundle.
    const uiExport = exports["./ui"];
    const uiImport = typeof uiExport === "string" ? uiExport : uiExport?.import;
    expect(uiImport).toBe("./dist/components/ui/index.js");
    for (const key of [
      "button",
      "select",
      "checkbox",
      "radio",
      "switch",
      "slider",
      "dialog",
      "sheet",
      "popover",
      "dropdown-menu",
      "tabs",
      "command",
    ]) {
      expect(exports[`./ui/${key}`], `missing ./ui/${key}`).toBeDefined();
    }
    expect(pkg.scripts?.["verify:release"]).toContain("build");
    expect(pkg.scripts?.["verify:release"]).toContain("test");
  });

  it("keeps bridge files present for installed shadcn components", () => {
    for (const file of [
      "button",
      "select",
      "checkbox",
      "radio",
      "switch",
      "slider",
      "dialog",
      "sheet",
      "popover",
      "dropdown-menu",
      "tabs",
      "command",
      "index",
    ]) {
      expect(existsSync(join(root, `src/components/ui/${file}.tsx`)), `${file}.tsx`).toBe(true);
    }
  });
});
