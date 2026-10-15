import { join } from "node:path";
import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Page } from "playwright";
import { renderToStaticMarkup } from "react-dom/server";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { AppProvider } from "../../app/app-provider";
import { MegaMenu } from "../../lab/mega-menu";
import { compileRealCss } from "../data-entry/__tests__/compile-real-css";
import { SearchInput } from "../data-entry/search-input";
import { Popover, PopoverContent, PopoverTrigger } from "../data-display/popover";
import { Text } from "../general/typography";

/**
 * gh#1340 in real Chromium, each case run twice: in the light DOM, and inside a shadow root with
 * `OverlayPortalProvider` pointing back into it (the GoDX Dock topology).
 *
 * Inside a shadow root `document.activeElement` stops at the HOST and an event reaching a
 * `document` listener has its target retargeted to the host. Every check below read one of those
 * and got the light-DOM answer wrong. jsdom approximates this; Chromium decides it — including the
 * real `pointerdown` → `focusout` → `click` order a mouse press produces.
 */

const ROOT = process.cwd();

const LONG = "Quarterly settlement report for the payments module, reissued invoices included";

const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { OverlayPortalProvider } from "./src/lib/overlay-portal";
import { Popover, PopoverContent, PopoverTrigger } from "./src/components/data-display/popover";
import { SearchInput } from "./src/components/data-entry/search-input";
import { Text } from "./src/components/general/typography";
import { MegaMenu } from "./src/lab/mega-menu";

window.__calls = [];
window.__views = 0;

const ITEMS = [
  {
    key: "products",
    label: "Products",
    panel: { groups: [{ key: "core", label: "Core", links: [{ key: "hr", label: "HR", href: "#hr" }] }] },
  },
];

function Widgets() {
  return (
    <AppProvider defaultLocale="en" persist={false}>
      <div style={{ width: 120 }}>
        <Text asChild link ellipsis={{ tooltip: true }}>
          <a href="#case" id="clipped">${LONG}</a>
        </Text>
      </div>
      <Popover onOpenChange={(open) => window.__calls.push(open)}>
        <PopoverTrigger>Notifications</PopoverTrigger>
        <PopoverContent>
          <input aria-label="Search notifications" />
          <button type="button" onClick={() => { window.__views += 1; }}>View</button>
        </PopoverContent>
      </Popover>
      <SearchInput shortcut="/" label="Site search" />
      <input aria-label="Note" />
      <MegaMenu label="Main" items={ITEMS} triggerAction="hover" closeDelay={50} />
    </AppProvider>
  );
}

window.mountLight = () => {
  createRoot(document.getElementById("root")).render(<Widgets />);
};

window.mountShadow = (css) => {
  const host = document.getElementById("root");
  const shadow = host.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = css;
  const mount = document.createElement("div");
  const portal = document.createElement("div");
  shadow.append(style, mount, portal);
  createRoot(mount).render(
    <OverlayPortalProvider container={portal}>
      <Widgets />
    </OverlayPortalProvider>,
  );
};
`;

let css = "";
let js = "";
let browser: Awaited<ReturnType<typeof chromium.launch>>;

beforeAll(async () => {
  css = await compileRealCss(
    renderToStaticMarkup(
      <AppProvider defaultLocale="en" persist={false}>
        <Text ellipsis={{ tooltip: true }}>{LONG}</Text>
        <Popover defaultOpen>
          <PopoverTrigger>t</PopoverTrigger>
          <PopoverContent>c</PopoverContent>
        </Popover>
        <SearchInput shortcut="/" label="s" />
        <MegaMenu label="m" items={[{ key: "a", label: "A", href: "#a" }]} />
      </AppProvider>,
    ),
  );
  // esbuild in-process under jsdom: Node's TextEncoder/Uint8Array for the build (see OrgChart's).
  const realm = { encoder: globalThis.TextEncoder, bytes: globalThis.Uint8Array };
  globalThis.TextEncoder = NodeTextEncoder as unknown as typeof TextEncoder;
  globalThis.Uint8Array = Object.getPrototypeOf(Buffer.prototype).constructor;
  let out: Awaited<ReturnType<typeof import("esbuild").build>>;
  try {
    const { build } = await import("esbuild");
    out = await build({
      stdin: { contents: ENTRY, loader: "tsx", resolveDir: ROOT, sourcefile: "entry.tsx" },
      bundle: true,
      write: false,
      format: "iife",
      jsx: "automatic",
      define: { "process.env.NODE_ENV": '"production"' },
      logLevel: "silent",
      absWorkingDir: join(ROOT),
    });
  } finally {
    globalThis.TextEncoder = realm.encoder;
    globalThis.Uint8Array = realm.bytes;
  }
  js = out.outputFiles![0]!.text;
  browser = await chromium.launch({ headless: true });
}, 60_000);

afterAll(async () => {
  await browser?.close();
});

type Mode = "light" | "shadow";

async function mount(mode: Mode): Promise<Page> {
  const page = await browser.newPage({ viewport: { width: 1024, height: 700 } });
  await page.setContent(
    `<!doctype html><html lang="en"><head><style>${css}</style></head><body><div id="root"></div><button id="outside" style="position:fixed;inset-block-end:8px;inset-inline-end:8px">Outside</button></body></html>`,
  );
  await page.addScriptTag({ content: js });
  await page.evaluate(
    ([m, c]) =>
      m === "light"
        ? (window as unknown as { mountLight: () => void }).mountLight()
        : (window as unknown as { mountShadow: (css: string) => void }).mountShadow(c),
    [mode, css] as const,
  );
  await page.getByRole("button", { name: "Notifications" }).waitFor();
  return page;
}

const calls = (page: Page) =>
  page.evaluate(() => (window as unknown as { __calls: boolean[] }).__calls);
const panelCount = (page: Page) => page.getByRole("button", { name: "View" }).count();

/** The innermost focused element's name, through open shadow roots. */
const deepFocusName = (page: Page) =>
  page.evaluate(() => {
    let active = document.activeElement;
    while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement;
    if (!active || active === document.body) return null;
    return active.getAttribute("aria-label") ?? (active.textContent ?? "").trim().slice(0, 20);
  });

for (const mode of ["light", "shadow"] as const) {
  describe(`gh#1340 in Chromium — ${mode} DOM`, () => {
    it("Popover: a press on the trigger of an OPEN popover closes it, once", async () => {
      const page = await mount(mode);
      const trigger = page.getByRole("button", { name: "Notifications" });
      await trigger.click();
      await expect.poll(() => panelCount(page)).toBe(1);
      await trigger.click();
      await expect.poll(() => panelCount(page)).toBe(0);
      expect(await calls(page)).toEqual([true, false]);
      await page.close();
    });

    it("Popover: opening puts focus on the panel's first input and keeps it there", async () => {
      const page = await mount(mode);
      await page.getByRole("button", { name: "Notifications" }).click();
      await expect.poll(() => panelCount(page)).toBe(1);
      await expect.poll(() => deepFocusName(page)).toBe("Search notifications");
      await page.close();
    });

    it("Popover: a press on a button inside the panel lands its click and keeps it open", async () => {
      const page = await mount(mode);
      await page.getByRole("button", { name: "Notifications" }).click();
      await page.getByRole("button", { name: "View" }).click();
      expect(await page.evaluate(() => (window as unknown as { __views: number }).__views)).toBe(1);
      expect(await panelCount(page)).toBe(1);
      await page.close();
    });

    it("Popover: Escape closes it and focus goes back to the trigger", async () => {
      const page = await mount(mode);
      await page.getByRole("button", { name: "Notifications" }).click();
      await expect.poll(() => deepFocusName(page)).toBe("Search notifications");
      // End state only: react-aria's own frame-late restore also gets here. The SYNCHRONOUS
      // restore (`useOverlayCloseFocus`) is pinned in popover-shadow-dom-1340.test.tsx.
      await page.keyboard.press("Escape");
      await expect.poll(() => panelCount(page)).toBe(0);
      await expect.poll(() => deepFocusName(page)).toBe("Notifications");
      await page.close();
    });

    it("Popover: a press outside closes it", async () => {
      const page = await mount(mode);
      await page.getByRole("button", { name: "Notifications" }).click();
      await expect.poll(() => panelCount(page)).toBe(1);
      await page.locator("#outside").click();
      await expect.poll(() => panelCount(page)).toBe(0);
      await page.close();
    });

    it('SearchInput shortcut "/": typed into another input it stays a slash', async () => {
      const page = await mount(mode);
      const note = page.getByRole("textbox", { name: "Note" });
      await note.click();
      await page.keyboard.type("a/b");
      expect(await note.inputValue()).toBe("a/b");
      expect(await deepFocusName(page)).toBe("Note");
      // Positive control: from the page body the shortcut still focuses the search box.
      await page.locator("#outside").focus();
      await page.keyboard.press("/");
      await expect.poll(() => deepFocusName(page)).not.toBe("Outside");
      expect(await page.getByRole("searchbox").evaluate((el) => el.matches(":focus"))).toBe(true);
      await page.close();
    });

    it("EllipsisTooltip: keyboard focus on a clipped link shows the full text", async () => {
      const page = await mount(mode);
      await page.keyboard.press("Tab");
      expect(await deepFocusName(page)).toBe(LONG.slice(0, 20));
      await expect.poll(() => page.getByRole("tooltip").count()).toBe(1);
      await page.close();
    });

    it("MegaMenu (hover): focus inside the nav keeps the panel open after the pointer leaves", async () => {
      const page = await mount(mode);
      const trigger = page.getByRole("button", { name: "Products" });
      await trigger.hover();
      await expect.poll(() => trigger.getAttribute("aria-expanded")).toBe("true");
      await page.getByRole("link", { name: "HR" }).focus();
      await page.mouse.move(1000, 690);
      await page.waitForTimeout(300);
      expect(await trigger.getAttribute("aria-expanded")).toBe("true");
      await page.close();
    });
  });
}
