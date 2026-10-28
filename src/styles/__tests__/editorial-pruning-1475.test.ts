import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const read = (name: string) => readFileSync(join(__dirname, "..", name), "utf8");
const manifest = JSON.parse(read("layers.json"));

describe("editorial family pruning (#1475)", () => {
  it("keeps editorial selectors out of the shared page layout", () => {
    expect(/\.ui-(?:editorial|catalog|price-summary|card-showcase)/.test(read("layout.css"))).toBe(
      false,
    );
    expect(read("editorial-layout.css")).toContain(".ui-editorial-section");
  });

  it("uses one dependency map for both pruning modes, without dropping grid presets", () => {
    expect(manifest.components.PageContainer.layers).not.toContain("editorial-layout.css");
    expect(manifest.components.ResponsiveGrid.layers).not.toContain("editorial-layout.css");
    expect(manifest.components.EditorialSection.layers).toContain("editorial-layout.css");
    expect(read("layout.css")).toContain('.ui-responsive-grid[data-preset="catalog"]');
    for (const entry of ["index.css", "core.css"]) {
      expect(read(entry)).toContain('@import "./editorial-layout.css";');
      expect(read(entry)).toContain('@import "./editorial-account-layout.css";');
    }
  });
});
