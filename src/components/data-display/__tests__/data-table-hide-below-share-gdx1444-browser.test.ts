import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";

/**
 * GDX-1444 in Chromium, against the real stylesheet. An action-collection queue: a free-text name,
 * two `meta` columns hidden below `xl`, a `secondary` hidden below `sm`, and a `meta` status. At
 * 1024 the two `xl` columns are `display: none`, so the visible queue (name, secondary, one meta)
 * is inside the priority budget — but the over-budget selector still counted the hidden heads
 * (`meta ~ meta`), put the queue on the rem floors, and the name column got the floor's share
 * (125px in GDX's project team list) instead of the room the percent tier leaves it.
 *
 * A hidden column must take no share: the table lays out exactly like one that never had it.
 */
const ROOT = process.cwd();
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { DataTable } from "./src/components/data-display/data-table";
const params = new URLSearchParams(location.search);
const withHidden = params.get("hidden") === "1";
const data = [{ id: "1", name: "Release reviewer", runtime: "Claude Code", model: "opus", roles: "Developer", state: "On" }];
const columns = [
  { key: "name", header: "Agent" },
  ...(withHidden
    ? [
        { key: "runtime", header: "Runs on", priority: "meta", hideBelow: "xl" },
        { key: "model", header: "Model", priority: "meta", hideBelow: "xl" },
      ]
    : []),
  { key: "roles", header: "Role in the project", priority: "secondary", hideBelow: "sm" },
  { key: "state", header: "Status", priority: "meta" },
];
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="en" persist={false}>
    <div id="box" style={{ width: Number(params.get("box")) }}>
      <DataTable preset="action-collection" rowKey="id" data={data} columns={columns} pagination={false} />
    </div>
  </AppProvider>,
);
`;

let css = "";
let js = "";
let browser: Browser;

beforeAll(async () => {
  const realm = { encoder: globalThis.TextEncoder, bytes: globalThis.Uint8Array };
  globalThis.TextEncoder = NodeTextEncoder as unknown as typeof TextEncoder;
  globalThis.Uint8Array = Object.getPrototypeOf(Buffer.prototype).constructor;
  try {
    const { build } = await import("esbuild");
    const out = await build({
      stdin: { contents: ENTRY, loader: "tsx", resolveDir: ROOT, sourcefile: "entry.tsx" },
      bundle: true,
      write: false,
      format: "iife",
      jsx: "automatic",
      define: { "process.env.NODE_ENV": '"production"' },
      logLevel: "silent",
      absWorkingDir: ROOT,
    });
    js = out.outputFiles![0]!.text;
  } finally {
    globalThis.TextEncoder = realm.encoder;
    globalThis.Uint8Array = realm.bytes;
  }
  const tokens = [...new Set(js.match(/[\w:./[\]()%#!=-]+/g) ?? [])].join(" ");
  css = await compileRealCss(`<div class="${tokens.replaceAll('"', "")}"></div>`);
  browser = await chromium.launch({ headless: true });
}, 180_000);

afterAll(async () => {
  await browser?.close();
});

async function widths(viewport: number, box: number, hidden: boolean) {
  const page: Page = await browser.newPage({ viewport: { width: viewport, height: 800 } });
  try {
    await page.goto(`about:blank?hidden=${hidden ? 1 : 0}&box=${box}`);
    await page.setContent(
      `<!doctype html><html lang="en"><head><style>${css}html,body{margin:0}</style></head><body><div id="root"></div><script>${js}</script></body></html>`,
    );
    await page.locator("tbody td").first().waitFor();
    return await page.evaluate(() =>
      Object.fromEntries(
        [...document.querySelectorAll("thead th[data-column-key]")]
          .filter((th) => getComputedStyle(th).display !== "none")
          .map((th) => [
            th.getAttribute("data-column-key"),
            Math.round(th.getBoundingClientRect().width),
          ]),
      ),
    );
  } finally {
    await page.close();
  }
}

describe(
  "DataTable action-collection: a column hidden by hideBelow takes no share (GDX-1444)",
  { timeout: 60_000 },
  () => {
    // A 560px card: under the 40rem collapse step, so the compact tier applies.
    for (const viewport of [1024, 768, 700]) {
      it(`at ${viewport}, the queue lays out as if the hidden columns were never there`, async () => {
        const control = await widths(viewport, 560, false);
        const actual = await widths(viewport, 560, true);
        expect(Object.keys(actual)).toEqual(["name", "roles", "state"]);
        expect(actual).toEqual(control);
        // The free-text name keeps what the percent tier leaves it, not a rem floor's share.
        expect(actual.name).toBeGreaterThan(280);
      });
    }

    it("at 1280 the columns show again and still count: two metas put the queue on the floors", async () => {
      const shown = await widths(1280, 560, true);
      expect(Object.keys(shown)).toEqual(["name", "runtime", "model", "roles", "state"]);
      // Over budget (meta twice): every column on its rem floor (meta 5rem, secondary 5.5rem,
      // free text 5rem) and the fixed layout spreads the rest, so no column is a percent share.
      expect(shown.runtime).toBe(shown.model);
      expect(shown.runtime).toBe(shown.state);
      expect(shown.name).toBe(shown.state);
    });
  },
);
