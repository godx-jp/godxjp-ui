import { join } from "node:path";
import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Page } from "playwright";
import { renderToStaticMarkup } from "react-dom/server";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { AppProvider } from "../../../app/app-provider";
import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";
import { Image, ImagePreviewGroup } from "../image";

/**
 * Image preview in a real browser (gh#1077). What jsdom cannot tell: that the preview really
 * covers the viewport and shows the picture larger than its thumbnail, that Tab stays inside it,
 * that focus lands back on the thumbnail after Escape, and that the veil shows on keyboard focus.
 * Bundled and mounted in Chromium with the package's real stylesheet.
 */

const ROOT = process.cwd();

const svg = (fill: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="800" height="600" fill="${fill}"/></svg>`,
  )}`;

const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { Image, ImagePreviewGroup } from "./src/components/data-display/image";

createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="en" persist={false}>
    <p><a href="#before">Before</a></p>
    <ImagePreviewGroup>
      <p><Image src=${JSON.stringify(svg("#c33"))} alt="Red" width={160} /></p>
      <p><Image src=${JSON.stringify(svg("#3c3"))} alt="Green" width={160} /></p>
      <p><Image src=${JSON.stringify(svg("#33c"))} alt="Blue" width={160} /></p>
    </ImagePreviewGroup>
    <p><a href="#after">After</a></p>
  </AppProvider>,
);
`;

let css = "";
let js = "";
let browser: Awaited<ReturnType<typeof chromium.launch>>;

beforeAll(async () => {
  const markup = renderToStaticMarkup(
    <AppProvider defaultLocale="en" persist={false}>
      <ImagePreviewGroup>
        <Image src="/a.png" alt="A" />
      </ImagePreviewGroup>
    </AppProvider>,
  );
  css = await compileRealCss(markup);
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

async function mount(): Promise<Page> {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.setContent(
    `<!doctype html><html lang="en"><head><style>${css}</style></head><body><div id="root"></div></body></html>`,
  );
  await page.addScriptTag({ content: js });
  await page.waitForSelector('[data-slot="image"]', { state: "attached" });
  return page;
}

describe("Image preview in Chromium (gh#1077)", () => {
  it("covers the viewport and shows the picture larger than its thumbnail", async () => {
    const page = await mount();
    await page.getByRole("button", { name: "Preview: Green" }).click();
    const dialog = page.getByRole("dialog", { name: "Image preview" });
    await dialog.waitFor();
    const box = await dialog.boundingBox();
    expect(box).toEqual({ x: 0, y: 0, width: 1280, height: 800 });
    const img = page.locator('[data-slot="image-preview-img"]');
    await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete)).toBe(true);
    const shown = (await img.boundingBox())!;
    expect(shown.width).toBeGreaterThan(160 * 3);
    // Centred in the stage.
    expect(Math.abs(shown.x + shown.width / 2 - 640)).toBeLessThanOrEqual(1);
    await expect
      .poll(() => page.locator('[data-slot="image-preview-counter"]').textContent())
      .toBe("2 / 3");
    await page.close();
  });

  it("traps Tab inside the preview and gives focus back to the thumbnail on Escape", async () => {
    const page = await mount();
    const trigger = page.getByRole("button", { name: "Preview: Blue" });
    await trigger.focus();
    await page.keyboard.press("Enter");
    await page.getByRole("dialog", { name: "Image preview" }).waitFor();
    for (let i = 0; i < 14; i++) {
      await page.keyboard.press("Tab");
      const inside = await page.evaluate(
        () => !!document.activeElement?.closest('[data-slot="image-preview"]'),
      );
      expect(inside, `Tab #${i + 1} left the preview`).toBe(true);
    }
    await page.keyboard.press("Escape");
    await expect.poll(() => page.getByRole("dialog").count()).toBe(0);
    expect(await page.evaluate(() => document.activeElement?.getAttribute("aria-label"))).toBe(
      "Preview: Blue",
    );
    await page.close();
  });

  it("pages with the arrow keys", async () => {
    const page = await mount();
    await page.getByRole("button", { name: "Preview: Red" }).click();
    await page.getByRole("dialog", { name: "Image preview" }).waitFor();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    const img = page.locator('[data-slot="image-preview-img"]');
    expect(await img.getAttribute("alt")).toBe("Blue");
    expect(await page.locator('[data-slot="image-preview-counter"]').textContent()).toBe("3 / 3");
    await page.close();
  });

  it("opened from the keyboard, focus is in the preview at once and the first ← / → / Esc land", async () => {
    // Regression: react-aria moved focus in only after the thumbnail veil's transition ended, and
    // the thumbnail had gone inert under it meanwhile — focus sat on <body>, so the first arrow
    // key and Esc were lost (found adopting 31.11.0 in godx-task).
    const page = await mount();
    await page.getByRole("button", { name: "Preview: Red" }).focus();
    await page.keyboard.press("Enter");
    await page.getByRole("dialog", { name: "Image preview" }).waitFor();
    expect(
      await page.evaluate(() => !!document.activeElement?.closest('[data-slot="image-preview"]')),
    ).toBe(true);
    await page.keyboard.press("ArrowRight");
    expect(await page.locator('[data-slot="image-preview-counter"]').textContent()).toBe("2 / 3");
    await page.keyboard.press("Escape");
    await expect.poll(() => page.getByRole("dialog").count()).toBe(0);
    expect(await page.evaluate(() => document.activeElement?.getAttribute("aria-label"))).toBe(
      "Preview: Red",
    );
    await page.close();
  });

  it("shows the veil when the thumbnail has keyboard focus", async () => {
    const page = await mount();
    await page.getByRole("link", { name: "Before" }).focus();
    await page.keyboard.press("Tab");
    const mask = page.locator('[data-slot="image-mask"]').first();
    await expect.poll(() => mask.evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
    await page.close();
  });
});
