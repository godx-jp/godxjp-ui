import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// @ts-expect-error — plain .mjs script, no declaration file
import { collectProbes, evaluateProbes } from "../../../../scripts/visual-audit.mjs";
import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";

const ROOT = process.cwd();
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { Topbar, TopbarItem, TopbarSearch } from "./src/components/layout";
import { Avatar, AvatarFallback } from "./src/components/data-display";
import { AppSettingPicker, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem } from "./src/components/navigation";
import { Menu, Building2 } from "lucide-react";
const q = new URLSearchParams(location.search);
const old = q.has('old');
const name = q.get('name') || 'Demo Barista';
const account = <DropdownMenu><DropdownMenuTrigger asChild>
<TopbarItem truncate={!old} icon={<Avatar aria-hidden="true"><AvatarFallback>DB</AvatarFallback></Avatar>}>{name}</TopbarItem>
</DropdownMenuTrigger><DropdownMenuContent><DropdownMenuLabel>{name}</DropdownMenuLabel><DropdownMenuItem>Profile</DropdownMenuItem></DropdownMenuContent></DropdownMenu>;
createRoot(document.getElementById("root")).render(<AppProvider defaultLocale={q.get('locale') || 'en'} persist={false}>
<Topbar height="bar" overflow={q.get('overflow') || 'scroll'}
 start={<><TopbarItem aria-label="Sidebar"><Menu /></TopbarItem><TopbarItem truncate icon={<Building2/>}>{q.get('org') || 'Organization with a long name'}</TopbarItem></>}
 end={<>{q.has("search") ? <TopbarSearch ariaLabel="Search" /> : null}{q.has("crowded") ? Array.from({length:8}, (_,i) => <TopbarItem key={i}>Action {i}</TopbarItem>) : null}<AppSettingPicker kind="locale" appearance="bar"/>{old ? account : null}</>}
 identity={old ? undefined : account}/>
</AppProvider>);
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
  browser = await chromium.launch({ headless: true });
}, 180_000);

afterAll(async () => {
  await browser?.close();
});

async function open(width: number, query = "") {
  const page = await browser.newPage({ viewport: { width, height: 500 } });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => {
    if (["error", "warning"].includes(m.type())) errors.push(m.text());
  });
  await page.route("http://identity.test/**", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: `<!doctype html><html><head><style>${css} body{margin:0}</style></head><body><div id="root"></div><script>${js}</script></body></html>`,
    }),
  );
  await page.goto(`http://identity.test/?${query}`);
  await page.waitForSelector(".ui-topbar");
  return { page, errors };
}

const measure = (page: Page) =>
  page.evaluate(() => {
    const bar = document.querySelector<HTMLElement>(".ui-topbar")!;
    const cell = bar.querySelector<HTMLElement>(".ui-topbar-item:has([data-slot=avatar])")!;
    const label = cell.querySelector<HTMLElement>("[data-slot=topbar-item-label]");
    const r = cell.getBoundingClientRect();
    return {
      viewport: innerWidth,
      document: document.documentElement.scrollWidth,
      barClient: bar.clientWidth,
      barScroll: bar.scrollWidth,
      left: r.left,
      right: r.right,
      cell: r.width,
      label: label?.clientWidth ?? 0,
      text: label?.scrollWidth ?? 0,
      title: cell.title,
      name: cell.textContent,
      controls: [...bar.querySelectorAll<HTMLElement>("button")].map((el) => ({
        left: el.getBoundingClientRect().left,
        right: el.getBoundingClientRect().right,
        width: el.getBoundingClientRect().width,
        min: parseFloat(getComputedStyle(el).minWidth) || 0,
      })),
    };
  });

describe("Topbar compact identity priority (Chromium, gh#1370)", () => {
  for (const width of [320, 390, 1280])
    for (const dir of ["ltr", "rtl"]) {
      it(`keeps a bounded name and primary cell floors at ${width} ${dir}`, async () => {
        const { page, errors } = await open(
          width,
          "name=Demo%20Barista%20Very%20Long%20Signed%20In%20Name",
        );
        await page.evaluate((dir) => (document.documentElement.dir = dir), dir);
        const m = await measure(page);
        expect(m.label, JSON.stringify(m)).toBeGreaterThan(10);
        expect(m.left).toBeGreaterThanOrEqual(0);
        expect(m.right).toBeLessThanOrEqual(width);
        expect(m.cell).toBeLessThanOrEqual(width * 0.4 + 1);
        expect(m.barScroll).toBeLessThanOrEqual(m.barClient + 1);
        for (const c of m.controls) {
          expect(c.width).toBeGreaterThanOrEqual(c.min - 0.5);
          expect(c.left, JSON.stringify(m)).toBeGreaterThanOrEqual(0);
          expect(c.right, JSON.stringify(m)).toBeLessThanOrEqual(width);
        }
        for (let i = 0; i < m.controls.length; i++)
          for (let j = i + 1; j < m.controls.length; j++) {
            const a = m.controls[i]!;
            const b = m.controls[j]!;
            expect(
              Math.min(a.right, b.right) - Math.max(a.left, b.left),
              JSON.stringify(m),
            ).toBeLessThanOrEqual(0.5);
          }
        expect(m.title).toBe("Demo Barista Very Long Signed In Name");
        const account = page.locator(".ui-topbar-item:has([data-slot=avatar])");
        await account.focus();
        await page.keyboard.press("Enter");
        await page.getByRole("menuitem", { name: "Profile" }).waitFor();
        await page.keyboard.press("Escape");
        expect(await account.evaluate((el) => el === document.activeElement)).toBe(true);
        expect(errors).toEqual([]);
        await page.close();
      });
    }
  for (const width of [320, 390, 1280])
    for (const dir of ["ltr", "rtl"])
      for (const [name, org, direction] of [
        ["Demo Barista Montgomery", "International branch", "ltr"],
        ["デモ・バリスタ・モンゴメリー", "インターナショナル支店", "ltr"],
        ["Nguyễn Minh Hoàng", "Chi nhánh trung tâm", "ltr"],
        ["محمد عبدالله الأحمد", "المؤسسة الدولية المركزية", "rtl"],
      ]) {
        it(`preserves the beginning of ${name} and its organization at ${width} ${dir}`, async () => {
          const { page, errors } = await open(
            width,
            new URLSearchParams({ name: name!, org: org! }).toString(),
          );
          await page.evaluate((dir) => (document.documentElement.dir = dir), dir);
          const labels = await page
            .locator('[data-slot="topbar-item-label"]')
            .evaluateAll((elements) =>
              elements.map((label) => {
                const box = label.getBoundingClientRect();
                const text = label.firstChild!;
                const range = document.createRange();
                range.setStart(text, 0);
                range.setEnd(text, 1);
                const first = range.getBoundingClientRect();
                const style = getComputedStyle(label);
                return {
                  text: label.textContent,
                  left: box.left,
                  right: box.right,
                  firstLeft: first.left,
                  firstRight: first.right,
                  direction: style.direction,
                  overflow: style.textOverflow,
                  clipped: label.scrollWidth > label.clientWidth,
                };
              }),
            );
          expect(labels).toHaveLength(2);
          for (const label of labels) {
            expect(label.direction, JSON.stringify(label)).toBe(direction);
            expect(label.overflow).toBe("ellipsis");
            expect(label.firstLeft, JSON.stringify(label)).toBeGreaterThanOrEqual(label.left - 0.5);
            expect(label.firstRight, JSON.stringify(label)).toBeLessThanOrEqual(label.right + 0.5);
            if (width < 1280) expect(label.clipped).toBe(true);
          }
          expect(errors).toEqual([]);
          await page.close();
        });
      }
  it("keeps identity out of the overflow menu and restores the bar after resize", async () => {
    const { page, errors } = await open(320, "overflow=menu&crowded=1");
    const account = page.locator("[data-slot=topbar-identity] .ui-topbar-item");
    await page.locator("[data-topbar-overflow-trigger]").waitFor();
    expect(await account.isVisible()).toBe(true);
    await page.locator("[data-topbar-overflow-trigger]").click();
    await page.getByText("Action 7", { exact: true }).waitFor();
    expect(await page.locator("[data-slot=topbar-overflow] [data-slot=avatar]").count()).toBe(0);
    await page.keyboard.press("Escape");
    await page.setViewportSize({ width: 1800, height: 500 });
    await page.waitForFunction(
      () =>
        document.querySelector("[data-slot=topbar]")?.getAttribute("data-collapsed") === "false",
    );
    expect(await account.isVisible()).toBe(true);
    expect(errors).toEqual([]);
    await page.close();
  });
  it("keeps the folded search target usable and its field focus/escape behavior", async () => {
    const { page, errors } = await open(390, "search=1");
    const trigger = page.locator(".ui-topbar-search-trigger");
    await trigger.click();
    await page.getByRole("searchbox").fill("coffee");
    await page.keyboard.press("Escape");
    expect(await trigger.evaluate((el) => el === document.activeElement)).toBe(true);
    expect((await measure(page)).label).toBeGreaterThan(10);
    expect(errors).toEqual([]);
    await page.close();
  });
  it("does not exempt an opted-in name when ellipsis is broken", async () => {
    const { page } = await open(390);
    await page.addStyleTag({
      content: '[data-slot="topbar-item-label"] { text-overflow: clip !important; }',
    });
    const raw = await page.evaluate(collectProbes, {
      width: 390,
      compactBelow: 600,
      desktopFrom: 1024,
    });
    const result = evaluateProbes(raw, { url: page.url(), viewport: { width: 390, height: 500 } });
    expect(
      result.findings.some((f: { rule: string }) => f.rule === "c04-compact-account-name"),
    ).toBe(true);
    await page.close();
  });
  it("allows only measured compact identity through C04 and still rejects the old full name", async () => {
    for (const old of [false, true]) {
      const { page } = await open(390, old ? "old=1" : "");
      const raw = await page.evaluate(collectProbes, {
        width: 390,
        compactBelow: 600,
        desktopFrom: 1024,
      });
      expect(
        (raw as { c04: { mapped: { compactIdentity: boolean }[] } }).c04.mapped[0]?.compactIdentity,
      ).toBe(!old);
      const result = evaluateProbes(raw, {
        url: page.url(),
        viewport: { width: 390, height: 500 },
      });
      expect(
        result.findings.some((f: { rule: string }) => f.rule === "c04-compact-account-name"),
      ).toBe(old);
      await page.close();
    }
  });
});
