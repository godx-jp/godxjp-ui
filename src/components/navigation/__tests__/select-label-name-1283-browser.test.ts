import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

/**
 * gh#1283 in Chromium — jsdom does not resolve `<label for>` on a `button[role=combobox]`, so the
 * accessible NAME is read from Chromium's own AX tree. A Select whose trigger has a visible
 * `<label htmlFor>` must be named by that label even when it has a placeholder: the placeholder
 * fallback (`aria-label`) used to outrank it, and a FilterBar filter labelled 「ステータス」 was
 * announced as 「すべて」 (WCAG 2.5.3). Without any label the placeholder still names it.
 */
const ROOT = process.cwd();
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { FilterBar } from "./src/components/navigation/toolbar";
import { Select } from "./src/components/data-entry/select";
const OPTIONS = [{ value: "open", label: "Open" }, { value: "closed", label: "Closed" }];
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="en" persist={false}>
    <FilterBar filters={[
      { value: "status", label: "ステータス", options: OPTIONS, placeholder: "すべて" },
      { value: "role", label: "Role", options: OPTIONS },
    ]} />
    <label htmlFor="own">Region</label>
    <Select id="own" options={OPTIONS} placeholder="Any region" />
    <Select id="bare" options={OPTIONS} placeholder="Department" />
  </AppProvider>,
);
`;

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
  browser = await chromium.launch({ headless: true });
}, 180_000);

afterAll(async () => {
  await browser?.close();
});

async function comboboxNames(): Promise<string[]> {
  const page = await browser.newPage();
  await page.setContent(
    `<!doctype html><html lang="en"><body><div id="root"></div><script>${js}</script></body></html>`,
  );
  await page.locator('[role="combobox"]').nth(3).waitFor();
  const cdp = await page.context().newCDPSession(page);
  const { nodes } = await cdp.send("Accessibility.getFullAXTree");
  const names = nodes
    .filter((n) => !n.ignored && n.role?.value === "combobox")
    .map((n) => String(n.name?.value ?? ""));
  await page.close();
  return names;
}

describe(
  "Select is named by its visible <label for>, not its placeholder (gh#1283)",
  { timeout: 60_000 },
  () => {
    it("FilterBar filters, a labelled Select, and an unlabelled one", async () => {
      const names = await comboboxNames();
      expect(names).toHaveLength(4);
      // The AX tree walks the FilterBar's toolbar after the page-level controls; order is not the point.
      expect([...names].sort()).toEqual(["ステータス", "Role", "Region", "Department"].sort());
    });
  },
);
