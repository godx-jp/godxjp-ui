import { chromium } from "playwright";

const base = process.env.PREVIEW_URL ?? "http://localhost:6010";
const browser = await chromium.launch({ headless: true });
const results = [];
for (const width of [320, 390]) {
  const context = await browser.newContext({
    viewport: { width, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  await page.goto(`${base}/isolate/data-display-popover-touch`, { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "フィルターを開く" }).tap();
  const opened = await page.getByRole("dialog", { name: "フィルター操作" }).isVisible();
  await page.getByRole("button", { name: "適用して閉じる" }).tap();
  const closed = (await page.getByRole("dialog", { name: "フィルター操作" }).count()) === 0;
  results.push({
    width,
    open: opened,
    actionClose: closed,
    verdict: opened && closed ? "pass" : "fail",
  });
  await context.close();
}
await browser.close();
if (results.some(({ verdict }) => verdict === "fail")) process.exitCode = 1;
console.log(JSON.stringify(results, null, 2));
