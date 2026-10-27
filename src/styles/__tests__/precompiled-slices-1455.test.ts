import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

/**
 * gh#1455 — `prune-css --precompiled` slices the PRECOMPILED sheet along the layer manifest, so an
 * app without Tailwind can ship less than the whole `styles.css`. The slices are what
 * `scripts/build-precompiled-css.mjs` writes to `styles/precompiled/`. The proof that a slice set
 * styles exactly like the whole sheet is a measurement in Chromium: the same real components,
 * styled (a) by `styles.css` and (b) by the slices prune-css would import for them, concatenated
 * in its order. Every probed computed style must match.
 */
const ROOT = process.cwd();
const manifest = JSON.parse(readFileSync(join(ROOT, "src/styles/layers.json"), "utf8")) as {
  base: string;
  order: string[];
  vendor: string[];
  components: Record<string, { layers: string[]; vendor?: string[] }>;
};

const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { Input, Select } from "./src/components/data-entry";
import { Button } from "./src/components/general";
import { Badge, Card, CardContent } from "./src/components/data-display";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./src/components/feedback";
function App() {
  return (
    <AppProvider>
      <div data-probe="button"><Button>Save</Button></div>
      <div data-probe="input"><Input aria-label="Name" placeholder="Name" /></div>
      <div data-probe="select"><Select aria-label="Plan" placeholder="Plan" options={[{ value: "a", label: "A" }]} /></div>
      <div data-probe="card"><Card><CardContent>Body</CardContent></Card></div>
      <div data-probe="badge"><Badge>New</Badge></div>
      <Dialog open>
        <DialogContent>
          <DialogHeader><DialogTitle>Title</DialogTitle><DialogDescription>Text</DialogDescription></DialogHeader>
        </DialogContent>
      </Dialog>
    </AppProvider>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
`;
const USED = ["AppProvider", "Input", "Select", "Button", "Badge", "Card", "Dialog"];

const PROPS = [
  "height",
  "width",
  "padding-top",
  "padding-inline-start",
  "border-top-width",
  "border-top-color",
  "background-color",
  "border-top-left-radius",
  "font-size",
  "font-weight",
  "line-height",
  "color",
  "box-shadow",
] as const;

const PROBES: Record<string, string> = {
  button: '[data-probe="button"] > *',
  input: '[data-probe="input"] input',
  select: '[role="combobox"]',
  card: '[data-probe="card"] > *',
  badge: '[data-probe="badge"] > *',
  dialog: '[role="dialog"]',
};

let js = "";
let whole = "";
let slicesDir = "";
let scratch = "";
let browser: Browser;

const slice = (file: string) => readFileSync(join(slicesDir, file), "utf8");
/** What a `prune-css --precompiled` file resolves to for `files`, in its import order. */
const pruned = (layers: Set<string>, vendors: Set<string>) =>
  [
    "@layer properties, theme, base, vendor, components, utilities;",
    ...manifest.vendor.filter((v) => vendors.has(v)).map(slice),
    slice(manifest.base),
    ...manifest.order.filter((f) => layers.has(f)).map(slice),
  ].join("\n");

const html = (css: string) =>
  `<!doctype html><html lang="en"><head><style>${css}</style></head><body><div id="root"></div><script>${js}</script></body></html>`;

async function measure(css: string) {
  const page = await browser.newPage({ viewport: { width: 1000, height: 800 } });
  await page.setContent(html(css));
  await page.locator('[role="dialog"]').waitFor();
  const out = await page.evaluate(
    ({ probes, props }) => {
      const result: Record<string, Record<string, string>> = {};
      for (const [name, selector] of Object.entries(probes)) {
        const el = document.querySelector(selector);
        const cs = el ? getComputedStyle(el) : null;
        result[name] = Object.fromEntries(
          props.map((p) => [p, cs ? cs.getPropertyValue(p) : "MISSING"]),
        );
      }
      return result;
    },
    { probes: PROBES, props: [...PROPS] },
  );
  await page.close();
  return out;
}

beforeAll(async () => {
  scratch = mkdtempSync(join(tmpdir(), "precompiled-1455-"));
  slicesDir = join(scratch, "precompiled");
  execFileSync(
    "node",
    [
      "scripts/build-precompiled-css.mjs",
      "--entry",
      "src/styles/index.css",
      "--out",
      join(scratch, "styles.css"),
      "--slices",
      slicesDir,
    ],
    { cwd: ROOT, stdio: "pipe" },
  );
  whole = readFileSync(join(scratch, "styles.css"), "utf8");

  const realm = { encoder: globalThis.TextEncoder, bytes: globalThis.Uint8Array };
  globalThis.TextEncoder = NodeTextEncoder as unknown as typeof TextEncoder;
  globalThis.Uint8Array = Object.getPrototypeOf(Buffer.prototype).constructor;
  try {
    const { build } = await import("esbuild");
    const built = await build({
      stdin: { contents: ENTRY, loader: "tsx", resolveDir: ROOT, sourcefile: "entry.tsx" },
      bundle: true,
      write: false,
      format: "iife",
      jsx: "automatic",
      define: { "process.env.NODE_ENV": '"production"' },
      logLevel: "silent",
      absWorkingDir: ROOT,
    });
    js = built.outputFiles![0]!.text;
  } finally {
    globalThis.TextEncoder = realm.encoder;
    globalThis.Uint8Array = realm.bytes;
  }
  browser = await chromium.launch({ headless: true });
}, 180_000);

afterAll(async () => {
  await browser?.close();
  if (scratch) rmSync(scratch, { recursive: true, force: true });
});

describe("precompiled slices (Chromium, gh#1455)", { timeout: 60_000 }, () => {
  it("ships one plain-CSS slice per manifest file, nothing left to compile", () => {
    for (const file of [...manifest.vendor, manifest.base, ...manifest.order]) {
      expect(existsSync(join(slicesDir, file)), file).toBe(true);
      const css = slice(file);
      expect(css.length, file).toBeGreaterThan(0);
      expect(css, file).not.toMatch(/@import\s/);
      expect(css, file).not.toMatch(/@source\s/);
      expect(css, file).not.toMatch(/@theme\b|@apply\b|@tailwind\b|@reference\b/);
    }
  });

  it("all slices together carry every rule of styles.css (nothing lost in the cut)", () => {
    const all = pruned(new Set(manifest.order), new Set(manifest.vendor));
    // Selectors are a cheap, order-free fingerprint of the rule set.
    const selectors = (css: string) =>
      new Set(
        [...css.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/([^{};]+)\{/g)].map((m) => m[1]!.trim()),
      );
    const cut = selectors(all);
    const missing = [...selectors(whole)].filter((s) => !cut.has(s));
    expect(missing).toEqual([]);
  });

  it("the slices prune-css picks for these components style them exactly like styles.css", async () => {
    const layers = new Set<string>();
    const vendors = new Set<string>();
    for (const name of USED) {
      for (const l of manifest.components[name]!.layers) layers.add(l);
      for (const v of manifest.components[name]!.vendor ?? []) vendors.add(v);
    }
    // A real prune: the cut must leave layers out, or this proves nothing about slicing.
    expect(layers.size).toBeLessThan(manifest.order.length);
    const [cut, full] = [await measure(pruned(layers, vendors)), await measure(whole)];
    for (const name of Object.keys(PROBES)) {
      for (const prop of PROPS) {
        expect(cut[name]![prop], `${name} ${prop}`).not.toBe("MISSING");
        expect(cut[name]![prop], `${name} ${prop}`).toBe(full[name]![prop]);
      }
    }
    // Guards a vacuous pass (both sheets empty).
    expect(parseFloat(cut.button!["height"]!)).toBeGreaterThan(24);
  });
});
