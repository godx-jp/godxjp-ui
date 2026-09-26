import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * prune-css runs in a CONSUMER repo against the manifest the package ships (gh#971), so each
 * test fabricates that world: a fake installed @godxjp/ui carrying the REAL script and the
 * REAL manifest (stamped, as copy-styles.mjs stamps it at build), plus consumer sources.
 */
const ROOT = process.cwd();
const script = readFileSync(join(ROOT, "scripts/prune-css.mjs"), "utf8");
const realManifest = JSON.parse(readFileSync(join(ROOT, "src/styles/layers.json"), "utf8"));

const VERSION = "30.0.0-test";

function prune(
  sources: Record<string, string>,
  {
    args = ["src"],
    manifestVersion = VERSION,
    out = "godx-ui.css",
  }: { args?: string[]; manifestVersion?: string | null; out?: string } = {},
) {
  const cwd = mkdtempSync(join(tmpdir(), "godx-prune-"));
  try {
    const pkgDir = join(cwd, "node_modules/@godxjp/ui");
    mkdirSync(join(pkgDir, "scripts"), { recursive: true });
    mkdirSync(join(pkgDir, "dist/styles"), { recursive: true });
    writeFileSync(join(pkgDir, "scripts/prune-css.mjs"), script);
    writeFileSync(
      join(pkgDir, "package.json"),
      JSON.stringify({ name: "@godxjp/ui", version: VERSION }),
    );
    writeFileSync(
      join(pkgDir, "dist/styles/layers.json"),
      JSON.stringify({ ...realManifest, version: manifestVersion }),
    );
    for (const [path, content] of Object.entries(sources)) {
      mkdirSync(join(cwd, path, ".."), { recursive: true });
      writeFileSync(join(cwd, path), content);
    }
    const result = spawnSync(process.execPath, [join(pkgDir, "scripts/prune-css.mjs"), ...args], {
      cwd,
      encoding: "utf8",
    });
    const outPath = join(cwd, out);
    return {
      status: result.status,
      stderr: result.stderr,
      css: existsSync(outPath) ? readFileSync(outPath, "utf8") : null,
    };
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
}

const layerImports = (css: string) =>
  [...css.matchAll(/@import "@godxjp\/ui\/styles\/([\w-]+)";/g)].map((m) => `${m[1]}.css`);

const APP = `
import { Button } from "@godxjp/ui";
import { Card, CardContent, StatCard, Badge } from "@godxjp/ui/data-display";
import type { CardProps } from "@godxjp/ui/data-display";
export const x = [Button, Card, CardContent, StatCard, Badge];
`;

describe("prune-css CLI (gh#971)", () => {
  it("emits the used components' layers plus their closure, and NOT an unrelated one", () => {
    const { status, css } = prune({ "src/app.tsx": APP });
    expect(status).toBe(0);
    const layers = layerImports(css!);
    // Direct homes…
    expect(layers).toContain("control.css");
    expect(layers).toContain("card-layout.css");
    expect(layers).toContain("badge-layout.css");
    // …and the closure: Card renders Tabs (CardTabItem) and a DropdownMenu, so their
    // surfaces must come along even though the app never imports them.
    expect(layers).toContain("navigation-layout.css");
    expect(layers).toContain("dialog-layout.css");
    // The unrelated fabric stays out — carousel/tree/chat live here (gh#971's dead weight).
    expect(layers).not.toContain("data-display-layout.css");
    expect(layers).not.toContain("shell-layout.css");
    expect(layers).not.toContain("chart-layout.css");
    // No vendor sheet: nothing here renders a toast or a calendar.
    expect(css).not.toContain("vendor-sonner");
    expect(css).not.toContain("vendor-day-picker");
  });

  it("preserves index.css's ordering exactly — layer order is load-bearing", () => {
    const { css } = prune({ "src/app.tsx": APP });
    const body = css!.split("styles/base").at(-1)!;
    const emitted = layerImports(body);
    expect(emitted).toEqual(realManifest.order.filter((f: string) => emitted.includes(f)));
    // And the bare @layer statement comes before the first @import, the only position where
    // it may establish the order (theme, base, vendor, components, utilities).
    expect(css!.indexOf("@layer theme, base, vendor, components, utilities;")).toBeLessThan(
      css!.indexOf("@import"),
    );
  });

  it("mirrors styles/core on fonts: none by default, bundled faces only behind --fonts", () => {
    const bare = prune({ "src/app.tsx": APP });
    expect(bare.css).not.toContain("styles/fonts");
    const fonts = prune({ "src/app.tsx": APP }, { args: ["src", "--fonts"] });
    // fonts.css must follow base.css, or the foundation's own :root font declaration wins
    // and the faces are dead weight (issue #210).
    expect(fonts.css!.indexOf("styles/base")).toBeLessThan(fonts.css!.indexOf("styles/fonts"));
  });

  it("includes a vendor wrapper only when a used component's closure needs it", () => {
    const { css } = prune({
      "src/app.tsx": `import { Toaster } from "@godxjp/ui/feedback";\nexport const t = Toaster;`,
    });
    expect(css).toContain('@import "@godxjp/ui/styles/vendor-sonner";');
    expect(css).not.toContain("vendor-day-picker");
    // Vendor sheets precede base, as in index.css.
    expect(css!.indexOf("vendor-sonner")).toBeLessThan(css!.indexOf("styles/base"));
  });

  it("maps compound sub-part imports to their root component", () => {
    const { css } = prune({
      "src/app.tsx": `import { SheetContent, SheetTrigger } from "@godxjp/ui/feedback";`,
    });
    expect(layerImports(css!)).toContain("dialog-layout.css");
  });

  it("refuses a manifest whose version differs from the installed package", () => {
    const { status, stderr, css } = prune({ "src/app.tsx": APP }, { manifestVersion: "29.0.0" });
    expect(status).toBe(2);
    expect(css).toBeNull();
    expect(stderr).toContain("29.0.0");
    expect(stderr).toContain(VERSION);
  });

  it("refuses an empty scan and type-only imports rather than emitting a component-less file", () => {
    const nothing = prune({ "src/app.tsx": "export const n = 1;" });
    expect(nothing.status).toBe(2);
    expect(nothing.css).toBeNull();
    // `import type` renders nothing, so it must not count as usage.
    const typeOnly = prune({
      "src/app.tsx": `import type { CardProps } from "@godxjp/ui/data-display";`,
    });
    expect(typeOnly.status).toBe(2);
  });

  it("falls back to ALL component layers on a namespace import, loudly", () => {
    const { status, stderr, css } = prune({
      "src/app.tsx": `import * as UI from "@godxjp/ui";\nexport const u = UI;`,
    });
    expect(status).toBe(0);
    expect(stderr).toContain("namespace");
    expect(layerImports(css!.split("styles/base").at(-1)!)).toEqual(realManifest.order);
  });

  it("stamps provenance: generated header, package version, do-not-edit, re-run instruction", () => {
    const { css } = prune({ "src/app.tsx": APP });
    expect(css).toContain("GENERATED by @godxjp/ui prune-css — DO NOT EDIT");
    expect(css).toContain(`@godxjp/ui version: ${VERSION}`);
    expect(css).toContain("Re-run when the components your app uses change");
  });
});
