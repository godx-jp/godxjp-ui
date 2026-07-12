import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { createServer } from "vite";
import { execFileSync } from "node:child_process";

execFileSync(process.execPath, ["preview/scripts/kill-port.mjs"], { stdio: "ignore" });
const server = await createServer({ configFile: "preview/vite.config.ts" });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const widths = [320, 375, 390, 768, 1024, 1280, 1440, 1920];
const frames = [
  "layout-flex",
  "layout-responsive-grid",
  "navigation-tabs",
  "navigation-pagination",
];

try {
  await server.listen();
  const page = await context.newPage();
  const rechartsWarnings = [];
  let activeFrame = "";
  page.on("console", (message) => {
    const value = message.text();
    if (/width\(-1\)|height\(-1\)|recharts/i.test(value)) {
      rechartsWarnings.push({ frame: activeFrame, message: value });
    }
  });
  for (const frame of frames) {
    activeFrame = frame;
    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`http://localhost:6008/frame/${frame}`, { waitUntil: "networkidle" });
      const result = await page.evaluate(() => ({
        viewport: innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        error: document.querySelector(".preview-runtime-error")?.textContent,
      }));
      if (result.error) throw new Error(`${frame}@${width}: ${result.error}`);
      if (result.scrollWidth > result.viewport + 1)
        throw new Error(
          `${frame}@${width}: viewport overflow ${result.scrollWidth}>${result.viewport}`,
        );
    }
  }

  await page.setViewportSize({ width: 1024, height: 900 });
  await page.goto("http://localhost:6008/frame/navigation-tabs", { waitUntil: "networkidle" });
  let tabs = page.getByRole("tab");
  await tabs.first().focus();
  await page.keyboard.press("ArrowRight");
  if (!(await tabs.nth(1).evaluate((element) => element === document.activeElement)))
    throw new Error("LTR Tabs ArrowRight focus failed");
  let axe = await new AxeBuilder({ page }).analyze();
  const tabsViolations = axe.violations.map((v) => v.id);

  await page.addInitScript(() => {
    if (location.pathname.includes("navigation-tabs-rtl")) {
      document.documentElement.dir = "rtl";
      document.documentElement.lang = "ar";
    }
  });
  await page.goto("http://localhost:6008/frame/navigation-tabs-rtl", { waitUntil: "networkidle" });
  tabs = page.getByRole("tab");
  if ((await page.locator('[dir="rtl"]').count()) === 0) throw new Error("RTL was not initialized");
  await tabs.first().focus();
  await page.keyboard.press("ArrowLeft");
  const rtlFocusedIndex = await tabs.evaluateAll((elements) =>
    elements.indexOf(document.activeElement),
  );
  if (rtlFocusedIndex !== 1) throw new Error("RTL Tabs ArrowLeft focus failed");

  await page.goto("http://localhost:6008/frame/navigation-pagination", {
    waitUntil: "networkidle",
  });
  const nextButtons = page.getByRole("button", { name: /次|next/i });
  for (let index = 0; index < (await nextButtons.count()); index++) {
    const button = nextButtons.nth(index);
    if ((await button.isVisible()) && !(await button.isDisabled())) {
      await button.click();
      break;
    }
  }
  if ((await page.locator('[aria-current="page"]').first().textContent())?.trim() !== "2")
    throw new Error("Pagination next-page journey failed");
  axe = await new AxeBuilder({ page }).analyze();
  const paginationViolations = axe.violations.map((v) => v.id);
  if (tabsViolations.length || paginationViolations.length) {
    throw new Error(
      `Axe violations: tabs=${tabsViolations.join(",") || "none"}; pagination=${paginationViolations.join(",") || "none"}`,
    );
  }
  console.log(
    JSON.stringify({
      frames,
      widths,
      reflow: "pass",
      keyboard: "pass",
      rtl: {
        initializedBeforeMount: true,
        focusedIndexAfterArrowLeft: rtlFocusedIndex,
        verdict: "pass",
      },
      axe: { tabsViolations, paginationViolations },
      rechartsWarnings,
    }),
  );
} finally {
  await browser.close();
  await server.close();
}
