import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";

/**
 * gh#1264 in Chromium, against the real stylesheet — the filter-bar kit:
 *
 *   1. a BARE-key shortcut (`"/"`, `"f"`) is text inside an editable element, never a command —
 *      typing `a/b` into another field must keep the `/`; a modified one (`mod+k`) still fires;
 *   2. `Toolbar clearDisplay="icon"` is a control-height square with the same accessible name;
 *   3. `DropdownMenu shortcut` opens the menu, under the same guard;
 *   4. `Toolbar views` renders the view switcher above the strip.
 */
const ROOT = process.cwd();
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { SearchInput } from "./src/components/data-entry/search-input";
import { Input } from "./src/components/data-entry/input";
import { Toolbar } from "./src/components/navigation/toolbar";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "./src/components/navigation/dropdown-menu";
import { Button } from "./src/components/general/button";
const kind = new URLSearchParams(location.search).get("kind");
const view =
  kind === "search" ? (
    <>
      <SearchInput id="s" ariaLabel="Search issues" shortcut="/" />
      <SearchInput id="k" ariaLabel="Search all" shortcut="mod+k" />
      <Input id="other" aria-label="Other field" />
    </>
  ) : kind === "menu" ? (
    <>
      <DropdownMenu shortcut="f">
        <DropdownMenuTrigger asChild><Button>Filter</Button></DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Assignee</DropdownMenuItem>
          <DropdownMenuItem>Label</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Input id="other" aria-label="Other field" />
    </>
  ) : (
    <div style={{ width: 900 }}>
      <Toolbar
        views={<nav id="views" aria-label="Views">Open · Mine · All</nav>}
        search={{ ariaLabel: "Search issues" }}
        onClear={() => {}}
        clearDisplay={kind === "clear-icon" ? "icon" : "label"}
      />
    </div>
  );
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="en" persist={false}><div id="ready">{view}</div></AppProvider>,
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

async function open(kind: string): Promise<Page> {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`about:blank?kind=${kind}`);
  await page.setContent(
    `<!doctype html><html lang="en"><head><style>${css}</style></head><body><div id="root"></div><script>${js}</script></body></html>`,
  );
  await page.locator("#ready > *").first().waitFor();
  return page;
}

const activeId = (page: Page) => page.evaluate(() => document.activeElement?.id ?? "");

describe(
  "bare-key shortcuts are text inside an editable element (gh#1264)",
  { timeout: 60_000 },
  () => {
    it('typing "a/b" into another field keeps the "/" and leaves focus there', async () => {
      const page = await open("search");
      await page.locator("#other").click();
      await page.keyboard.type("a/b");
      expect(await page.locator("#other").inputValue()).toBe("a/b");
      expect(await activeId(page)).toBe("other");
      await page.close();
    });

    it('"/" outside any field still focuses the search box', async () => {
      const page = await open("search");
      await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
      await page.keyboard.press("/");
      expect(await activeId(page)).toBe("s");
      expect(await page.locator("#s").inputValue()).toBe("");
      await page.close();
    });

    it("a modified shortcut (mod+k) still fires from inside a field", async () => {
      const page = await open("search");
      await page.locator("#other").click();
      await page.keyboard.press("ControlOrMeta+k");
      expect(await activeId(page)).toBe("k");
      await page.close();
    });
  },
);

describe("DropdownMenu shortcut (gh#1264)", { timeout: 60_000 }, () => {
  it('"f" opens the menu from the page, but is a letter inside a field', async () => {
    const page = await open("menu");
    await page.locator("#other").click();
    await page.keyboard.type("off");
    expect(await page.locator("#other").inputValue()).toBe("off");
    expect(await page.locator('[role="menu"]').count()).toBe(0);
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    await page.keyboard.press("f");
    await page.locator('[role="menu"]').waitFor();
    expect(await page.locator('[role="menuitem"]').count()).toBe(2);
    await page.close();
  });
});

describe("Toolbar clearDisplay and views (gh#1264)", { timeout: 60_000 }, () => {
  const clear = (page: Page) =>
    page.locator(".ui-toolbar-clear").evaluate((el) => ({
      width: el.getBoundingClientRect().width,
      height: el.getBoundingClientRect().height,
      name: el.getAttribute("aria-label") ?? el.textContent?.trim(),
    }));

  it('clearDisplay="icon" is a square with the same accessible name, far narrower than the label', async () => {
    const labelPage = await open("clear-label");
    const label = await clear(labelPage);
    await labelPage.close();
    const iconPage = await open("clear-icon");
    const icon = await clear(iconPage);
    expect(icon.name).toBe(label.name);
    expect(Math.round(icon.width)).toBe(Math.round(icon.height));
    expect(icon.width).toBeLessThan(label.width / 2);
    await iconPage.close();
  });

  it("views render above the filter strip", async () => {
    const page = await open("clear-label");
    const order = await page.evaluate(() => {
      const views = document.getElementById("views")!.getBoundingClientRect();
      const strip = document.querySelector('[role="toolbar"]')!.getBoundingClientRect();
      return { viewsAbove: views.bottom <= strip.top };
    });
    expect(order.viewsAbove).toBe(true);
    await page.close();
  });
});
