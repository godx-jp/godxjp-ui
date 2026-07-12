import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");

describe("data-display and general frame coverage", () => {
  it("keeps a public Logo frame with every size and both accessibility modes", () => {
    const source = read("docs/general/logo.tsx");
    for (const size of ["xs", "sm", "lg"]) {
      expect(source).toContain(`size="${size}"`);
    }
    expect(source).toContain("<Logo />");
    expect(source).toContain('label="Godx"');
  });

  it("covers compact and section empty states", () => {
    const source = read("docs/data-display/empty-state.tsx");
    expect(source).toContain('variant="section"');
    expect(source).toContain('variant="compact"');
  });

  it("covers destructive and over-capacity progress", () => {
    const source = read("docs/data-display/progress.tsx");
    expect(source).toContain('tone="destructive"');
    expect(source).toContain("over label=");
  });

  it("keeps zero and one-row numbered-pagination boundary frames", () => {
    const source = read("docs/data-display/data-table/index.tsx");
    expect(source).toContain("0 件 + numbered pagination");
    expect(source).toContain("1 件 / 1 ページ + numbered pagination");
  });

  it("covers chart orientation, visibility, colours, explicit height, and edge data", () => {
    const source = read("docs/data-display/charts.tsx");
    expect(source).toContain("horizontal");
    expect(source).toContain("showGrid={false}");
    expect(source).toContain("showLegend={false}");
    expect(source).toContain("colors={[");
    expect(source).toContain("height={240}");
    expect(source).toContain("actual: null");
    expect(source).toContain("actual: -120000");
  });
});
