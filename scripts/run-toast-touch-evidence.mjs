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
  await page.goto(`${base}/isolate/feedback-toast`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(500);
  await page.getByRole("button", { name: "同期トーストを表示して閉じる" }).tap();
  const opened = await page.getByText("同期しています…").isVisible();
  await page.waitForTimeout(900);
  const dismissed = (await page.getByText("同期しています…").count()) === 0;
  await page.getByRole("button", { name: "請求書を削除" }).tap();
  await page.waitForTimeout(300);
  const action = page.getByRole("button", { name: "元に戻す" });
  const actionVisible = await action.isVisible();
  if (actionVisible) await action.tap();
  await page.waitForTimeout(200);
  const recovered = (await page.getByText("請求書 #INV-2024-0042 を削除しました").count()) === 0;
  results.push({
    width,
    open: opened,
    dismiss: dismissed,
    action: actionVisible,
    recovery: recovered,
    verdict: actionVisible && recovered ? "pass" : "fail",
  });
  await context.close();
}
await browser.close();
if (results.some((r) => r.verdict === "fail")) process.exitCode = 1;
console.log(JSON.stringify(results, null, 2));
