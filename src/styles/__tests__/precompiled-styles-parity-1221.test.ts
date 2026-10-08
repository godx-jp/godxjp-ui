import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "../../components/data-entry/__tests__/compile-real-css";

/**
 * v32 #1221 — `@godxjp/ui/styles.css` is the library compiled ONCE, here, so a consumer with no
 * Tailwind installed gets the same pixels. The proof is a parity measurement in Chromium: the
 * same real components, styled (a) by the precompiled sheet alone — no Tailwind compile anywhere
 * in that page's path — and (b) by `compileRealCss` (the Tailwind v4 compiler over `core.css`).
 * Every probed computed style must match.
 */
const ROOT = process.cwd();
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
let tailwindCss = "";
let precompiled = "";
let scratch = "";
let browser: Browser;

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
  scratch = mkdtempSync(join(tmpdir(), "precompiled-1221-"));
  const out = join(scratch, "styles.css");
  execFileSync(
    "node",
    ["scripts/build-precompiled-css.mjs", "--entry", "src/styles/index.css", "--out", out],
    { cwd: ROOT, stdio: "pipe" },
  );
  precompiled = readFileSync(out, "utf8");

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
  // Every non-space run is a candidate (a class like `rounded-s-[var(--a,var(--b))]` has a comma).
  const tokens = [...new Set(js.match(/[^\s"'`;{}]+/g) ?? [])].join(" ");
  tailwindCss = await compileRealCss(`<div class="${tokens.replaceAll('"', "")}"></div>`);
  browser = await chromium.launch({ headless: true });
}, 180_000);

afterAll(async () => {
  await browser?.close();
  if (scratch) rmSync(scratch, { recursive: true, force: true });
});

describe("precompiled styles.css parity (Chromium, v32 #1221)", { timeout: 60_000 }, () => {
  it("is plain CSS: no @import, no @source, no Tailwind directives left to compile", () => {
    expect(precompiled).not.toMatch(/@import\s/);
    expect(precompiled).not.toMatch(/@source\s/);
    expect(precompiled).not.toMatch(/@theme\b|@apply\b|@tailwind\b/);
    expect(precompiled).not.toContain("@font-face");
  });

  it("styles each real component exactly as the Tailwind-compiled build does", async () => {
    const [pre, tw] = [await measure(precompiled), await measure(tailwindCss)];
    for (const name of Object.keys(PROBES)) {
      for (const prop of PROPS) {
        expect(pre[name]![prop], `${name} ${prop}`).not.toBe("MISSING");
        expect(pre[name]![prop], `${name} ${prop}`).toBe(tw[name]![prop]);
      }
    }
  });

  it("actually styles (guards a vacuous pass: both sheets empty)", async () => {
    const pre = await measure(precompiled);
    expect(parseFloat(pre.button!["height"]!)).toBeGreaterThan(24);
    expect(parseFloat(pre.input!["height"]!)).toBeGreaterThan(24);
    expect(pre.badge!["border-top-left-radius"]).not.toBe("0px");
  });
});
