import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
const base = process.env.PREVIEW_URL ?? "http://localhost:6010";
const browser = await chromium.launch({ headless: true });
const isolatedShellRules = new Set(["landmark-one-main", "page-has-heading-one", "region"]);
const touch = [];
for (const width of [320, 390]) {
  const context = await browser.newContext({
    viewport: { width, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const query = await context.newPage();
  await query.goto(`${base}/isolate/query-touch-actions`);
  for (const [index, output] of [
    [0, "Retry result"],
    [1, "Load more result"],
    [2, "Mutation result"],
    [3, "Refresh result"],
  ]) {
    const current = Number(await query.getByLabel(output).textContent());
    await query.getByRole("button").nth(index).tap();
    touch.push({
      width,
      owner: output,
      pass: Number(await query.getByLabel(output).textContent()) === current + 1,
    });
  }
  const dialog = await context.newPage();
  await dialog.goto(`${base}/isolate/feedback-dialog-touch`);
  await dialog.getByRole("button", { name: "Open touch dialog" }).tap();
  const opened = await dialog.getByRole("dialog", { name: "Touch dialog" }).isVisible();
  await dialog.getByRole("dialog", { name: "Touch dialog" }).getByRole("button").first().tap();
  touch.push({
    width,
    owner: "Dialog",
    pass: opened && (await dialog.getByRole("dialog").count()) === 0,
  });

  const carousel = await context.newPage();
  await carousel.goto(`${base}/isolate/data-display-carousel`);
  const firstCarousel = carousel.getByRole("region", { name: "指標カード", exact: true });
  const previous = firstCarousel.getByRole("button", { name: "前へ" });
  const next = firstCarousel.getByRole("button", { name: "次へ" });
  const startedAtBeginning = await previous.isDisabled();
  await next.tap();
  touch.push({
    width,
    owner: "Carousel",
    pass: startedAtBeginning && !(await previous.isDisabled()),
  });
  await context.close();
}
const rtl = [];
for (const width of [320, 375, 390, 768, 1024, 1280, 1440, 1920]) {
  const context = await browser.newContext({ viewport: { width, height: 900 } });
  const page = await context.newPage();
  await page.goto(`${base}/isolate/feedback-toast`);
  await page.evaluate(() => {
    document.documentElement.dir = "rtl";
  });
  const geometry = await page.evaluate(() => ({
    direction: getComputedStyle(document.documentElement).direction,
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  }));
  const violations = (await new AxeBuilder({ page }).analyze()).violations
    .map(({ id }) => id)
    .filter((id) => !isolatedShellRules.has(id));
  rtl.push({ width, pass: geometry.direction === "rtl" && !geometry.overflow && !violations.length });
  await context.close();
}
await browser.close();
const pass = touch.every((x) => x.pass) && rtl.every((x) => x.pass);
console.log(JSON.stringify({ touch, rtl, pass }, null, 2));
if (!pass) process.exitCode = 1;
