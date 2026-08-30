#!/usr/bin/env node
import { ensurePreviewServer } from "./frame-harness.mjs";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

// Port override qua env (PREVIEW_PORT) — 3 shard data-entry cùng chạy script này trên runner
// self-hosted CHUNG host; cùng port 6011 → collision. Matrix cấp port riêng mỗi shard.
const port = Number(process.env.PREVIEW_PORT) || 6011;
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
// The preview server comes from `frame-harness.ensurePreviewServer`, the one path with a green
// record on this pool. These gates used to hand-roll it — first with `vite` (the DEV server,
// which on a cold runner never binds in time), then with `vite preview`, which still failed while
// frame-axe / frame-geometry / contrast passed doing the apparently same thing. Rather than keep
// guessing which of the small differences mattered (detached process group, an early reachability
// check, an explicit cwd), they now call the function that works. One way to stand a preview up.
const stopServer = await ensurePreviewServer(base);

async function waitForFrame(page, story, width) {
  // Name the story and the width in the failure. Playwright's own timeout says only that a
  // `.preview-runtime-loading` stayed visible, which tells you a story hung but not WHICH — and a
  // gate that will not name its failing input is a gate someone has to bisect by hand.
  try {
    await page.locator(".preview-runtime-loading").waitFor({ state: "hidden" });
  } catch (cause) {
    throw new Error(`${story} @ ${width}px: stuck on the loading placeholder`, { cause });
  }
  const runtimeError = page.locator(".preview-runtime-error");
  if (await runtimeError.count()) throw new Error(`${story}: ${await runtimeError.innerText()}`);
  await page.locator("#root > *").first().waitFor();
}

let browser;
try {
  browser = await chromium.launch();
  for (const width of widths) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await context.newPage();
    for (const story of stories) {
      await page.goto(`${base}/isolate/${story}`, { waitUntil: "domcontentloaded" });
      await waitForFrame(page, story, width);
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
  stopServer();
}
