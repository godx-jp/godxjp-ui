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
  await page.goto(`${base}/isolate/data-display-touch-actions`, { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Button action" }).tap();
  const button = (await page.getByLabel("Button result").textContent()) === "1";
  await page.getByRole("button", { name: "Sign out" }).tap();
  const listRow = (await page.getByLabel("ListRow result").textContent()) === "1";
  await page.getByRole("checkbox").first().tap();
  const dataTable = (await page.getByLabel("Selection result").textContent()) === "1";
  results.push({
    width,
    button,
    listRow,
    dataTable,
    verdict: button && listRow && dataTable ? "pass" : "fail",
  });
  await context.close();
}
await browser.close();
if (results.some((r) => r.verdict === "fail")) process.exitCode = 1;
console.log(JSON.stringify(results, null, 2));
