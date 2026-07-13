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
  const cases = [
    [
      "data-display/accordion",
      "data-display-accordion",
      async (p) => {
        const b = p.locator("button[aria-expanded]").first();
        const before = await b.getAttribute("aria-expanded");
        await b.tap();
        return before !== (await b.getAttribute("aria-expanded"));
      },
    ],
    [
      "data-display/collapsible",
      "data-display-collapsible",
      async (p) => {
        const b = p.locator("button[aria-expanded]").first();
        const before = await b.getAttribute("aria-expanded");
        await b.tap();
        return before !== (await b.getAttribute("aria-expanded"));
      },
    ],
    [
      "feedback/sheet",
      "feedback-sheet",
      async (p) => {
        await p.getByRole("button").first().tap();
        return await p.getByRole("dialog").first().isVisible();
      },
    ],
  ];
  for (const [owner, route, action] of cases) {
    const page = await context.newPage();
    await page.goto(`${base}/isolate/${route}`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(150);
    let pass = false;
    try {
      pass = await action(page);
    } catch {}
    results.push({ owner, width, verdict: pass ? "pass" : "fail" });
    await page.close();
  }
  await context.close();
}
await browser.close();
if (results.some((r) => r.verdict === "fail")) process.exitCode = 1;
console.log(JSON.stringify(results, null, 2));
