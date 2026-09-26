import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * The layer manifest is what lets `prune-css` slice CSS without committing the sin the README
 * forbids (hand cherry-picking `*-layout.css`, gh#971). These tests pin the properties the
 * slice's correctness rests on; the generator's own `--check` is the drift alarm that fires
 * when a new component, layout file or internal dependency lands without the manifest moving.
 */
const ROOT = process.cwd();
const manifest = JSON.parse(readFileSync(join(ROOT, "src/styles/layers.json"), "utf8"));

describe("style layer manifest (gh#971)", () => {
  it("is current — regenerating produces the committed file", () => {
    const result = spawnSync(
      process.execPath,
      [join(ROOT, "scripts/gen-style-layers.mjs"), "--check"],
      { encoding: "utf8" },
    );
    expect(result.stderr).toBe("");
    expect(result.status).toBe(0);
  });

  it("mirrors index.css's component-layer imports exactly, in order — order is load-bearing", () => {
    const indexCss = readFileSync(join(ROOT, "src/styles/index.css"), "utf8");
    const imported = [...indexCss.matchAll(/@import\s+"\.\/([\w-]+\.css)"/g)]
      .map((m) => m[1])
      .filter((f) => f !== "base.css" && f !== "fonts.css");
    expect(manifest.order).toEqual(imported);
    // icon-layout.css is imported LAST deliberately (its (0,3,1) tie with the ListRow
    // leading-slot rule is broken by order); a manifest that reorders it re-breaks gh#712.
    expect(manifest.order.at(-1)).toBe("icon-layout.css");
  });

  it("covers every catalog component, so prune-css never meets an import it cannot map", () => {
    const catalog = JSON.parse(readFileSync(join(ROOT, "agent/components-index.json"), "utf8")) as {
      name: string;
    }[];
    for (const { name } of catalog) {
      if (!/^[A-Z]/.test(name)) continue; // hooks and helpers style nothing
      expect(manifest.components, `catalog component ${name} missing`).toHaveProperty(name);
    }
  });

  it("keeps unrelated layers apart: Button does not drag the data-display or shell fabric", () => {
    expect(manifest.components.Button.layers).toEqual(["control.css"]);
    // Carousel's rules live in data-display-layout.css and only there — the file whose
    // unused presence gh#971 measured (13 selector hits in a carousel-less app).
    expect(manifest.components.Carousel.layers).toContain("data-display-layout.css");
    expect(manifest.components.Carousel.layers).not.toContain("shell-layout.css");
  });

  it("resolves internal rendering through the import graph, not hand-listing", () => {
    // DataTable renders DropdownMenu (ViewOptions) and Pagination internally; a consumer
    // importing only DataTable must still receive their surfaces.
    expect(manifest.components.DataTable.layers).toContain("dialog-layout.css");
    expect(manifest.components.DataTable.layers).toContain("navigation-layout.css");
    // Toggle's box lives in control.css, its variants in toggle.css — the split OWNERS row.
    expect(manifest.components.Toggle.layers).toEqual(
      expect.arrayContaining(["control.css", "toggle.css"]),
    );
  });

  it("routes vendor stylesheets through package-owned layer(vendor) wrappers", () => {
    expect(manifest.components.Toaster.vendor).toEqual(["vendor-sonner.css"]);
    expect(manifest.components.DatePicker.vendor).toEqual(["vendor-day-picker.css"]);
    // Button must NOT carry either — core.css always ships both, and dropping them for the
    // apps that render neither a toast nor a calendar is part of the win.
    expect(manifest.components.Button.vendor).toBeUndefined();
    for (const file of ["vendor-sonner.css", "vendor-day-picker.css"]) {
      const css = readFileSync(join(ROOT, "src/styles", file), "utf8");
      expect(css).toMatch(/@import\s+"[^"]+"\s+layer\(vendor\);/);
    }
  });

  it("ships with version null — the build stamps the real one into dist (copy-styles.mjs)", () => {
    expect(manifest.version).toBeNull();
  });
});
