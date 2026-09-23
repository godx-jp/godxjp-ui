import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(import.meta.dirname, "../../..");
const read = (path: string) => readFileSync(join(root, path), "utf8");
const catalog = JSON.parse(read("agent/tokens.json")) as { name: string; tier: string }[];

/**
 * gh#878: the golden-ratio radius scale lives in `@theme inline` (src/styles/base.css), not under
 * src/tokens/, so the catalog published `--radius` but not `--radius-xs`…`--radius-2xl` despite 96
 * reads across the library.
 */
describe("agent/tokens.json publishes the @theme inline radius scale (gh#878)", () => {
  const names = new Set(catalog.map((t) => t.name));

  it("includes all six derived radius steps as semantic tokens", () => {
    for (const name of [
      "--radius-xs",
      "--radius-sm",
      "--radius-md",
      "--radius-lg",
      "--radius-xl",
      "--radius-2xl",
    ]) {
      const entry = catalog.find((t) => t.name === name);
      expect(entry, `${name} is absent from agent/tokens.json`).toBeDefined();
      expect(entry!.tier).toBe("semantic");
    }
  });

  it("does not publish Tailwind colour mirrors under --color-*", () => {
    expect(names.has("--color-primary")).toBe(false);
  });
});
