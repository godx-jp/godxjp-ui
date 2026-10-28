import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { TextEncoder as NodeTextEncoder } from "node:util";
import { chromium, type Browser, type Page } from "playwright";
import { beforeAll, afterAll, it, expect } from "vitest";
import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";

const svg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="300"><rect width="200" height="300" fill="green"/></svg>';
const entry = `
import * as React from 'react'; import {createRoot} from 'react-dom/client';
import {AppProvider} from './src/app/app-provider';
import {CatalogDetail} from './src/components/layout/editorial-catalog';
import Notice from './docs/feedback/notice-bar';
import {EditorialCard} from './src/components/layout/editorial';
import {Image} from './src/components/data-display/image';
import {Toaster} from './src/components/feedback/sonner';
import {toast} from './src/components/feedback/use-toast';
window.showToast=()=>toast.success('Saved');
import {registerDocsMessages} from './preview/src/docs-messages';
registerDocsMessages();
function Demo(){ const [src,setSrc]=React.useState('https://image.test/one.svg'); window.setSrc=setSrc; const [sized,setSized]=React.useState(false); window.sizeImage=()=>setSized(true);
return <AppProvider defaultLocale={window.testLocale || 'en'} persist={false}><div className="editorial-example" dir={window.testDir || 'ltr'}>
{window.testNotice ? <Notice/> : window.testSpotlight ? <EditorialCard variant="spotlight" link={<a href="#detail"/>} title="Reference" media={<Image src={src} alt="" preview={false} placeholder fallback="https://image.test/fallback.svg"/>}/> : <CatalogDetail title="Reference" image={{src,alt:'Reference',fallback:'https://image.test/fallback.svg',priority:true,...(sized?{width:200,height:300}:{})}}/>}
<Toaster/></div></AppProvider>;}
createRoot(document.getElementById('root')).render(<Demo/>);`;
let browser: Browser;
let js = "",
  css = "";
beforeAll(async () => {
  const realm = { encoder: globalThis.TextEncoder, bytes: globalThis.Uint8Array };
  globalThis.TextEncoder = NodeTextEncoder as unknown as typeof TextEncoder;
  globalThis.Uint8Array = Object.getPrototypeOf(Buffer.prototype).constructor;
  try {
    const { build } = await import("esbuild");
    js = (
      await build({
        stdin: { contents: entry, loader: "tsx", resolveDir: process.cwd() },
        bundle: true,
        write: false,
        format: "iife",
        jsx: "automatic",
        loader: { ".css": "empty" },
        alias: {
          "@godxjp/ui/data-display": resolve("src/components/data-display/index.ts"),
          "@godxjp/ui/general": resolve("src/components/general/index.ts"),
          "@godxjp/ui/layout": resolve("src/components/layout/index.ts"),
          "@godxjp/ui/i18n": resolve("src/i18n/index.ts"),
        },
        define: { "process.env.NODE_ENV": '"production"' },
        logLevel: "silent",
      })
    ).outputFiles![0]!.text;
    css = await compileRealCss(
      `<div class="${[...new Set(js.match(/[\w:./[\]()%#!=-]+/g) ?? [])].join(" ")}"></div>`,
    );
    css +=
      "\n" +
      readFileSync(resolve("docs/feedback/notice-bar.css"), "utf8") +
      readFileSync(resolve("docs/layout/editorial-examples.css"), "utf8");
  } finally {
    globalThis.TextEncoder = realm.encoder;
    globalThis.Uint8Array = realm.bytes;
  }
  browser = await chromium.launch({ headless: true });
}, 60000);
afterAll(async () => {
  await browser?.close();
});
async function open(page: Page, notice = false, locale = "en", dir = "ltr") {
  await page.goto("about:blank");
  await page.setContent(
    `<html><head><style>${css}</style></head><body><div id="root"></div><script>window.testNotice=${notice};window.testLocale=${JSON.stringify(locale)};window.testDir=${JSON.stringify(dir)};</script><script>${js}</script></body></html>`,
  );
}
it("image frame distinguishes loading, loaded, error; new src replaces the actual img; cached sources and reduced motion", async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 800 } });
  let release: (() => void) | undefined;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("https://image.test/**", async (route) => {
    if (route.request().url().includes("pending")) await held;
    if (route.request().url().includes("broken")) return route.fulfill({ status: 404, body: "" });
    return route.fulfill({ contentType: "image/svg+xml", body: svg });
  });
  try {
    await open(page);
    await page.waitForFunction(
      () =>
        document.querySelector(".ui-catalog-detail-art")?.getAttribute("data-status") === "loaded",
    );
    await page.evaluate(() => {
      (
        window as unknown as { setSrc: (src: string) => void; firstImage: Element | null }
      ).firstImage = document.querySelector("img");
      (window as unknown as { setSrc: (src: string) => void; firstImage: Element | null }).setSrc(
        "https://image.test/pending.svg",
      );
    });
    await page.waitForFunction(
      () =>
        document.querySelector(".ui-catalog-detail-art")?.getAttribute("data-status") === "loading",
    );
    expect(
      await page.evaluate(
        () =>
          document.querySelector("img") ===
          (window as unknown as { setSrc: (src: string) => void; firstImage: Element | null })
            .firstImage,
      ),
    ).toBe(false);
    expect(await page.locator("img").evaluate((n) => getComputedStyle(n).visibility)).toBe(
      "hidden",
    );
    const placeholder = page.locator(".ui-catalog-detail-art");
    expect((await placeholder.boundingBox())!.height).toBeGreaterThan(0);
    expect(await placeholder.evaluate((n) => getComputedStyle(n, "::before").animationName)).toBe(
      "ui-catalog-detail-loading",
    );
    await page.emulateMedia({ reducedMotion: "reduce" });
    expect(await placeholder.evaluate((n) => getComputedStyle(n, "::before").animationName)).toBe(
      "none",
    );
    release!();
    await page.waitForFunction(
      () =>
        document.querySelector(".ui-catalog-detail-art")?.getAttribute("data-status") === "loaded",
    );
    await page.evaluate(() =>
      (window as unknown as { setSrc: (src: string) => void; firstImage: Element | null }).setSrc(
        "https://image.test/broken.svg",
      ),
    );
    await page.waitForFunction(
      () =>
        document.querySelector(".ui-catalog-detail-art")?.getAttribute("data-status") === "error",
    );
    await page.waitForFunction(
      () =>
        (document.querySelector("img") as HTMLImageElement).currentSrc.endsWith("/fallback.svg") &&
        (document.querySelector("img") as HTMLImageElement).naturalWidth > 0,
    );
    expect(await page.locator(".ui-catalog-detail-art").getAttribute("data-status")).toBe("error");
    await page.evaluate(
      (src) =>
        (window as unknown as { setSrc: (src: string) => void; firstImage: Element | null }).setSrc(
          src,
        ),
      "data:image/svg+xml," + encodeURIComponent(svg),
    );
    await page.waitForFunction(
      () =>
        document.querySelector(".ui-catalog-detail-art")?.getAttribute("data-status") === "loaded",
    );
    await page.evaluate(() => (window as unknown as { sizeImage: () => void }).sizeImage());
    await page.waitForFunction(
      () => document.querySelector("img")?.getAttribute("height") === "300",
    );
    expect(await page.locator("img").evaluate((n) => getComputedStyle(n).objectFit)).toBe(
      "contain",
    );
  } finally {
    release!();
    await page.close();
  }
});
it("notice recipe is fixed, non-modal, localized, keyboard reachable, wraps, publishes measured toast offset and cleans up", async () => {
  const page = await browser.newPage({ viewport: { width: 320, height: 800 } });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (["error", "warning"].includes(m.type())) errors.push(m.text());
  });
  try {
    for (const locale of ["en", "ja", "vi"])
      for (const dir of ["ltr", "rtl"]) {
        await open(page, true, locale, dir);
        const region = page.getByRole("region", {
          name: (
            {
              en: "Optional analytics",
              ja: "任意のアクセス解析",
              vi: "Phân tích tùy chọn",
            } as Record<string, string>
          )[locale],
        });
        await region.waitFor({ timeout: 5000 }).catch((e) => {
          throw new Error(String(e) + " console=" + JSON.stringify(errors));
        });
        expect(await region.getAttribute("aria-label")).toBeTruthy();
        expect(await region.getAttribute("aria-live")).toBeNull();
        expect(await region.evaluate((n) => getComputedStyle(n).position)).toBe("fixed");
        expect(await region.evaluate((n) => getComputedStyle(n).direction)).toBe(dir);
        const box = (await region.boundingBox())!;
        expect(box.y + box.height).toBeCloseTo(800, 0);
        expect(box.width).toBe(320);
        expect(
          await page.evaluate(() =>
            getComputedStyle(document.documentElement).getPropertyValue("--toast-offset-bottom"),
          ),
        ).toContain(`${Math.round(box.height)}px`);
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
        await page.evaluate(() => (window as unknown as { showToast: () => void }).showToast());
        const toast = page.locator("[data-sonner-toast]").last();
        await toast.waitFor();
        await page.waitForTimeout(200);
        const toastBox = (await toast.boundingBox())!;
        expect(toastBox.y + toastBox.height).toBeLessThanOrEqual(box.y);
        const buttons = region.getByRole("button");
        expect(await buttons.count()).toBe(2);
        await region.getByRole("link").focus();
        await page.keyboard.press("Tab");
        expect(await buttons.nth(0).evaluate((n) => n === document.activeElement)).toBe(true);
        await page.keyboard.press("Enter");
        await region.waitFor({ state: "detached" });
        expect(
          await page.evaluate(() =>
            document.documentElement.style.getPropertyValue("--toast-offset-bottom"),
          ),
        ).toBe("");
        await page.getByRole("button").click();
        await region.waitFor();
        await region.getByRole("button").nth(1).click();
        await region.waitFor({ state: "detached" });
      }
    expect(errors).toEqual([]);
  } finally {
    await page.close();
  }
}, 60000);

it("spotlight keeps loaded and error fallback kit Image geometry in both directions", async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 800 } });
  await page.route("https://image.test/**", (route) =>
    route.request().url().includes("broken")
      ? route.fulfill({ status: 404, body: "" })
      : route.fulfill({ contentType: "image/svg+xml", body: svg }),
  );
  try {
    for (const dir of ["ltr", "rtl"]) {
      await page.goto("about:blank");
      await page.setContent(
        `<html><head><style>${css}</style></head><body><div id="root"></div><script>window.testSpotlight=true;window.testDir=${JSON.stringify(dir)};</script><script>${js}</script></body></html>`,
      );
      await page.waitForFunction(
        () =>
          document.querySelector('[data-slot="image"]')?.getAttribute("data-status") === "loaded",
      );
      const wrapper = page.locator('[data-slot="image"]');
      const media = page.locator(".ui-editorial-card-media");
      expect((await wrapper.boundingBox())!.width).toBeCloseTo(
        (await media.boundingBox())!.width,
        0,
      );
      await page.evaluate(() =>
        (window as unknown as { setSrc: (src: string) => void }).setSrc(
          "https://image.test/broken.svg",
        ),
      );
      await page.waitForFunction(
        () =>
          document.querySelector('[data-slot="image"]')?.getAttribute("data-status") === "error" &&
          (document.querySelector("img") as HTMLImageElement).currentSrc.endsWith(
            "/fallback.svg",
          ) &&
          (document.querySelector("img") as HTMLImageElement).naturalWidth > 0,
      );
      expect((await wrapper.boundingBox())!.height).toBeCloseTo(
        (await media.boundingBox())!.height,
        0,
      );
      expect((await page.locator("img").boundingBox())!.width).toBeGreaterThan(0);
    }
  } finally {
    await page.close();
  }
});
