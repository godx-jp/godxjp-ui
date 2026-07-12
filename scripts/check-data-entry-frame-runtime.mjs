#!/usr/bin/env node
import { spawn } from "node:child_process";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const port = 6011;
const base = `http://localhost:${port}`;
const widths = [320, 375, 390, 768, 1024, 1280, 1440, 1920];
const defaultStories = [
  "data-entry-input",
  "data-entry-form-field-index",
  "data-entry-form",
  "data-entry-select",
  "data-entry-checkbox",
  "data-entry-radio-group",
  "data-entry-switch",
  "data-entry-slider",
  "data-entry-toggle",
  "data-entry-date-picker",
  "data-entry-month-picker",
  "data-entry-time-picker",
  "data-entry-color-picker",
  "data-entry-upload",
  "data-entry-cascader",
  "data-entry-tree-select",
  "data-entry-transfer",
  "data-entry-number-input",
  "data-entry-search-input",
  "data-entry-password-input",
  "data-entry-input-otp",
  "data-entry-rating",
  "data-entry-tag-input",
  "data-entry-calendar",
  "data-entry-date-range-picker",
  "data-entry-month-range-picker",
  "data-entry-command",
];
const stories = process.env.DATA_ENTRY_STORIES?.split(",").filter(Boolean) ?? defaultStories;
const ignoredPageShellRules = new Set([
  "heading-order",
  "landmark-one-main",
  "page-has-heading-one",
  "region",
]);
const server = spawn(
  "pnpm",
  ["exec", "vite", "--config", "preview/vite.config.ts", "--port", String(port), "--strictPort"],
  { stdio: "ignore", env: process.env },
);

async function waitForServer() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      if ((await fetch(base)).ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("preview server did not start");
}

async function waitForFrame(page, story) {
  await page.locator(".preview-runtime-loading").waitFor({ state: "hidden" });
  const runtimeError = page.locator(".preview-runtime-error");
  if (await runtimeError.count()) throw new Error(`${story}: ${await runtimeError.innerText()}`);
  await page.locator("#root > *").first().waitFor();
}

let browser;
try {
  await waitForServer();
  browser = await chromium.launch();
  for (const width of widths) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await context.newPage();
    for (const story of stories) {
      await page.goto(`${base}/isolate/${story}`, { waitUntil: "domcontentloaded" });
      await waitForFrame(page, story);
      const storyRoot = page.locator("#root");
      if ((await storyRoot.innerText()).trim().length === 0)
        throw new Error(`${story}@${width}: story did not render`);
      const geometry = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      if (geometry.scrollWidth > geometry.clientWidth + 1)
        throw new Error(`${story}@${width}: horizontal overflow`);
      const result = await new AxeBuilder({ page }).analyze();
      const violations = result.violations.filter((item) => !ignoredPageShellRules.has(item.id));
      if (violations.length)
        throw new Error(
          `${story}@${width}: axe ${violations
            .map(
              (item) =>
                `${item.id} (${item.nodes.map((node) => node.target.join(" ")).join(", ")})`,
            )
            .join(", ")}`,
        );
      await page.evaluate(() => document.documentElement.setAttribute("dir", "rtl"));
      const rtlGeometry = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      if (rtlGeometry.scrollWidth > rtlGeometry.clientWidth + 1)
        throw new Error(`${story}@${width}: RTL horizontal overflow`);
      const rtlResult = await new AxeBuilder({ page }).analyze();
      const rtlViolations = rtlResult.violations.filter(
        (item) => !ignoredPageShellRules.has(item.id),
      );
      if (rtlViolations.length)
        throw new Error(
          `${story}@${width}: RTL axe ${rtlViolations.map((item) => item.id).join(",")}`,
        );
      if (width === widths[0]) {
        const firstKeyboardTarget = page
          .locator(
            'input:not([type="hidden"]):not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])',
          )
          .first();
        if ((await firstKeyboardTarget.count()) === 0)
          throw new Error(`${story}: no keyboard target`);
        await firstKeyboardTarget.focus();
        await page.keyboard.press("Tab");
        const hasKeyboardTarget = await page.evaluate(
          () => document.activeElement !== document.body && document.activeElement !== null,
        );
        if (!hasKeyboardTarget) throw new Error(`${story}: no keyboard-entry target`);
      }
      if (story === "data-entry-select") {
        await page.locator("#priority").click();
        for (const slot of [
          "select-content",
          "select-label",
          "select-separator",
          "select-scroll-down-button",
        ]) {
          if ((await page.locator(`[data-slot="${slot}"]`).count()) === 0)
            throw new Error(`${story}: missing rendered ${slot}`);
        }
        await page.locator('[data-slot="select-viewport"]').evaluate((element) => {
          element.scrollTop = element.scrollHeight;
          element.dispatchEvent(new Event("scroll", { bubbles: true }));
        });
        await page.waitForTimeout(50);
        if ((await page.locator('[data-slot="select-scroll-up-button"]').count()) === 0)
          throw new Error(`${story}: missing rendered select-scroll-up-button after scrolling`);
        await page.keyboard.press("ArrowDown");
        await page.keyboard.press("Escape");
      }
    }
    await context.close();
  }
  console.log(`✓ data-entry frame runtime: ${stories.length} story × ${widths.length} widths`);
} finally {
  await browser?.close();
  server.kill("SIGTERM");
}
