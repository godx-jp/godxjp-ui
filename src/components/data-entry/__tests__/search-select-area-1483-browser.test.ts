import { TextEncoder as NodeTextEncoder } from "node:util";
import { chromium, type Browser } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { compileRealCss } from "./compile-real-css";
const ROOT = process.cwd();
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { Select } from "./src/components/data-entry";
import { Flex, EditorialToolbar } from "./src/components/layout";
const locale = new URLSearchParams(location.search).get("locale") || "en";
const tokyo = {en:"Tokyo",ja:"東京都",vi:"Tokyo"}[locale];
const options=[{value:"all",label:"All areas"},{value:"delivery",label:"Delivery"},...Array.from({length:47},(_,i)=>({value:String(i+1).padStart(2,"0"),label:i===12?tokyo:"Area "+(i+1)}))];
function App(){ const [area,setArea]=React.useState("all"); const [calls,setCalls]=React.useState([]);
return <AppProvider defaultLocale={locale} persist={false}><EditorialToolbar start={<Flex><Select width="auto" showSearch clearable clearLabel="Clear area" aria-label="Area" value={area} onValueChange={v=>{setArea(v);setCalls(c=>[...c,v]);}} options={options} /></Flex>} /><output id="value">{area}</output><output id="calls">{JSON.stringify(calls)}</output></AppProvider>;}
createRoot(document.getElementById("root")).render(<App/>);
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
  const tokens = [...new Set(js.match(/[\w:./[\]()%#!-]+/g) ?? [])].join(" ");
  css = await compileRealCss(`<div class="${tokens.replaceAll('"', "")}"></div>`);
  browser = await chromium.launch({ headless: true, ignoreDefaultArgs: ["--hide-scrollbars"] });
}, 180_000);

afterAll(async () => {
  await browser?.close();
});

describe("consumer area picker #1483", { timeout: 30000 }, () => {
  for (const width of [320, 390, 1280])
    for (const locale of ["en", "ja", "vi"])
      it(`${width} ${locale} typing pointer keyboard clear reopen`, async () => {
        const page = await browser.newPage({ viewport: { width, height: 800 } });
        page.setDefaultTimeout(10000);
        const errors: string[] = [];
        page.on("pageerror", (e) => errors.push(e.message));
        page.on("console", (m) => {
          if (["error", "warning"].includes(m.type())) errors.push(m.text());
        });
        await page.route("http://fixture.test/**", (route) =>
          route.fulfill({
            contentType: "text/html",
            body: `<!doctype html><style>${css}</style><div id="root"></div><script>${js}</script>`,
          }),
        );
        await page.goto(`http://fixture.test/?locale=${locale}`);

        await page.getByRole("combobox").click();
        const input = page.locator(".ui-search-select-panel input");
        const label = locale === "ja" ? "東京都" : "Tokyo";
        await input.pressSequentially(label, { delay: 50 });
        expect(await input.inputValue()).toBe(label);
        expect(await input.evaluate((el) => el === document.activeElement)).toBe(true);
        await page.getByRole("option", { name: label, exact: true }).click();
        expect(await page.locator("#calls").textContent()).toBe('["13"]');
        expect(await page.locator("#value").textContent()).toBe("13");
        expect(await page.locator(".ui-search-select-panel").count()).toBe(0);
        await page.getByRole("combobox").click();
        await input.fill(label);
        await input.press("ArrowDown");
        await input.press("Enter");
        expect(await page.locator("#calls").textContent()).toBe('["13","13"]');
        expect(await page.locator(".ui-search-select-panel").count()).toBe(0);
        await page.getByRole("button", { name: "Clear area", exact: true }).click();
        expect(await page.locator("#value").textContent()).toBe("");
        expect(await page.locator("#calls").textContent()).toBe('["13","13",""]');
        await page.getByRole("combobox").click();
        expect(await input.inputValue()).toBe("");
        await input.press("Escape");
        expect(await page.locator(".ui-search-select-panel").count()).toBe(0);
        expect(errors).toEqual([]);
        await page.close();
      });
});
