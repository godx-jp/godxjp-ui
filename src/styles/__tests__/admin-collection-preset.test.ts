import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const layoutStyles = readFileSync(resolve(process.cwd(), "src/styles/layout.css"), "utf8");
const layoutTokens = readFileSync(resolve(process.cwd(), "src/tokens/semantic/layout.css"), "utf8");

describe("PageContainer admin collection preset (gh#242)", () => {
  const presetRule =
    layoutStyles.match(/\.ui-page-container\[data-preset="admin-collection"\]\s*\{[^}]*\}/)?.[0] ??
    "";

  it("owns the collection rhythm through service-themeable semantic tokens", () => {
    for (const token of [
      "--admin-collection-control-height",
      "--admin-collection-section-gap",
      "--admin-collection-toolbar-padding-y",
      "--admin-collection-table-row-height",
      "--admin-collection-table-cell-padding-y",
    ]) {
      expect(layoutTokens).toContain(`${token}:`);
      expect(presetRule).toContain(`var(${token})`);
    }
  });

  it("measures the collection search without a consumer width override", () => {
    expect(layoutTokens).toContain("--admin-collection-search-measure:");
    expect(layoutStyles).toMatch(
      /data-preset="admin-collection"\] \.ui-toolbar \.ui-search-input\s*\{[^}]*inline-size:\s*min\(100%, var\(--admin-collection-search-measure\)\)/s,
    );
  });

  it("contains no literal geometry in the component stylesheet", () => {
    const searchRule =
      layoutStyles.match(
        /\.ui-page-container\[data-preset="admin-collection"\] \.ui-toolbar \.ui-search-input\s*\{[^}]*\}/,
      )?.[0] ?? "";
    expect(presetRule).not.toMatch(/:\s*[\d.]+(px|rem|em)\b/);
    expect(searchRule).not.toMatch(/:\s*[\d.]+(px|rem|em)\b/);
  });
});
