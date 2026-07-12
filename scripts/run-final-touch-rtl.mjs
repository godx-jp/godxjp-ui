import { chromium } from "playwright";
const base = process.env.PREVIEW_URL ?? "http://localhost:6010";
const browser = await chromium.launch({ headless: true });
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
  await context.close();
}
await browser.close();
const pass = touch.every((x) => x.pass);
console.log(JSON.stringify({ touch, pass }, null, 2));
if (!pass) process.exitCode = 1;
