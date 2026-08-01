import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { createServer } from "vite";
import { execFileSync } from "node:child_process";

/**
 * Roving-focus assertions must be AWAITED, never read synchronously after the key press.
 *
 * Radix `RovingFocusGroup` defers the focus move out of the `keydown` handler
 * (`setTimeout(() => focusFirst(candidateNodes))` — @radix-ui/react-roving-focus), so the next
 * trigger becomes `document.activeElement` ~10-25ms AFTER `keyboard.press()` resolves. Reading
 * `document.activeElement` in the very next CDP round-trip is therefore a race that passes or
 * fails on scheduling luck alone. These helpers poll the real assertion instead — same condition,
 * bounded wait, and a failure still fails (with the observed state attached).
 */

/**
 * Waits until the tablist is genuinely interactive, not merely painted.
 *
 * Radix only makes the group container focusable (`tabindex="0"`) once its items have registered
 * with the roving-focus collection (`focusableItemsCount > 0`), which happens in an effect after
 * hydration. Until then an arrow key would land on a tablist whose key handler cannot resolve any
 * candidate. Individual triggers stay at `tabindex="-1"` until something focuses them, so the
 * container is the correct readiness signal.
 */
async function waitForRovingTablist(page) {
  await page.waitForFunction(
    () =>
      document.querySelectorAll('[role="tab"]').length > 1 &&
      document.querySelector('[role="tablist"][tabindex="0"]') !== null,
    undefined,
    { timeout: 5000 },
  );
}

/**
 * Waits for the roving focus to land on the tab at `index` (document order) and returns the index
 * actually read back from the page. Throws `message` — with the index actually focused — when the
 * focus never gets there.
 */
async function waitForFocusedTabIndex(page, index, message) {
  try {
    await page.waitForFunction(
      (expected) =>
        [...document.querySelectorAll('[role="tab"]')].indexOf(document.activeElement) === expected,
      index,
      { timeout: 5000, polling: 16 },
    );
  } catch {
    const observed = await page.evaluate(() =>
      [...document.querySelectorAll('[role="tab"]')].indexOf(document.activeElement),
    );
    throw new Error(`${message} (expected tab index ${index}, focus stayed on index ${observed})`);
  }
  return page.evaluate(() =>
    [...document.querySelectorAll('[role="tab"]')].indexOf(document.activeElement),
  );
}

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
  await waitForRovingTablist(page);
  await tabs.first().focus();
  await page.keyboard.press("ArrowRight");
  await waitForFocusedTabIndex(page, 1, "LTR Tabs ArrowRight focus failed");
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
  await waitForRovingTablist(page);
  await tabs.first().focus();
  await page.keyboard.press("ArrowLeft");
  const rtlFocusedIndex = await waitForFocusedTabIndex(page, 1, "RTL Tabs ArrowLeft focus failed");

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
