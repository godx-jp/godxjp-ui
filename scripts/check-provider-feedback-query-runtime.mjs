import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { createServer } from "vite";
const port = Number(process.env.PREVIEW_PORT ?? 6112);
const base = `http://localhost:${port}`;
const server = await createServer({
  configFile: "preview/vite.config.ts",
  server: { port, strictPort: true },
});
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const widths = [320, 375, 390, 768, 1024, 1280, 1440, 1920];
const ignoredFrameShellRules = new Set(["landmark-one-main", "page-has-heading-one", "region"]);
const allFrames = [
  "navigation-app-setting-picker",
  "feedback-dialog",
  "feedback-sheet",
  "feedback-alert-dialog",
  "feedback-tooltip",
  "feedback-toast",
  "feedback-skeleton",
  "query-data-state",
  "query-infinite-query-state",
  "query-mutation-feedback",
  "query-prefetch-link",
];
const requestedFrames = (process.env.FRAMES ?? process.env.FRAME_ID ?? "")
  .split(",")
  .filter(Boolean);
const frames = requestedFrames.length
  ? allFrames.filter((frame) => requestedFrames.includes(frame))
  : allFrames;
if (!frames.length || frames.length !== (requestedFrames.length || allFrames.length)) {
  throw new Error(`Unknown frame selection: ${requestedFrames.join(",")}`);
}

async function waitForFrame(page, frame) {
  await page.locator(".preview-runtime-loading").waitFor({ state: "hidden" });
  const runtimeError = page.locator(".preview-runtime-error");
  if (await runtimeError.count()) throw new Error(`${frame}: ${await runtimeError.innerText()}`);
  await page.locator("#root > *").first().waitFor();
}

try {
  await server.listen();
  const page = await context.newPage();
  const runtimeErrors = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));

  for (const frame of frames) {
    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`${base}/frame/${frame}`, { waitUntil: "domcontentloaded" });
      await waitForFrame(page, frame);
      const geometry = await page.evaluate(() => ({
        viewport: innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        error: document.querySelector(".preview-runtime-error")?.textContent,
      }));
      if (geometry.error) throw new Error(`${frame}@${width}: ${geometry.error}`);
      if (geometry.scrollWidth > geometry.viewport + 1) {
        throw new Error(`${frame}@${width}: overflow ${geometry.scrollWidth}>${geometry.viewport}`);
      }
    }
  }

  await page.setViewportSize({ width: 1024, height: 900 });
  const axe = {};
  for (const frame of frames) {
    await page.goto(`${base}/frame/${frame}`, { waitUntil: "domcontentloaded" });
    await waitForFrame(page, frame);
    axe[frame] = (await new AxeBuilder({ page }).analyze()).violations
      .filter((violation) => !ignoredFrameShellRules.has(violation.id))
      .map((violation) => ({
        id: violation.id,
        nodes: violation.nodes.map((node) => ({ target: node.target, html: node.html })),
      }));
  }

  if (frames.includes("feedback-dialog")) {
    await page.goto(`${base}/frame/feedback-dialog`, { waitUntil: "domcontentloaded" });
    await waitForFrame(page, "feedback-dialog");
    const dialog = page.getByRole("dialog");
    await dialog.waitFor({ state: "visible" });
    await page.keyboard.press("Escape");
    if (await dialog.isVisible()) throw new Error("Dialog Escape close failed");
  }

  if (frames.includes("feedback-sheet")) {
    await page.goto(`${base}/frame/feedback-sheet`, { waitUntil: "domcontentloaded" });
    await waitForFrame(page, "feedback-sheet");
    await page.getByRole("dialog").waitFor({ state: "visible" });
    await page.keyboard.press("Escape");
    if (await page.getByRole("dialog").isVisible()) throw new Error("Sheet Escape close failed");
  }

  if (frames.includes("feedback-alert-dialog")) {
    await page.goto(`${base}/frame/feedback-alert-dialog`, {
      waitUntil: "domcontentloaded",
    });
    await waitForFrame(page, "feedback-alert-dialog");
    await page.getByRole("alertdialog").waitFor({ state: "visible" });
    await page.getByRole("button", { name: "キャンセル" }).click();
    if (await page.getByRole("alertdialog").isVisible())
      throw new Error("AlertDialog cancel failed");
  }

  if (frames.includes("feedback-tooltip")) {
    await page.goto(`${base}/frame/feedback-tooltip`, { waitUntil: "domcontentloaded" });
    await waitForFrame(page, "feedback-tooltip");
    await page.getByRole("button", { name: "請求書をコピー" }).focus();
    if (!(await page.getByRole("tooltip").isVisible()))
      throw new Error("Tooltip focus journey failed");
  }

  if (frames.includes("feedback-toast")) {
    await page.goto(`${base}/frame/feedback-toast`, { waitUntil: "domcontentloaded" });
    await waitForFrame(page, "feedback-toast");
    await page.getByRole("button", { name: "success", exact: true }).click();
    await page.getByText("仕訳を保存しました").first().waitFor({ state: "visible" });
  }

  if (frames.includes("query-mutation-feedback")) {
    await page.goto(`${base}/frame/query-mutation-feedback`, {
      waitUntil: "domcontentloaded",
    });
    await waitForFrame(page, "query-mutation-feedback");
    await page
      .getByText(/保存に失敗しました/)
      .first()
      .waitFor();
    const retry = page.getByRole("button", { name: /再試行|retry/i }).first();
    if (await retry.count()) await retry.click();
  }

  if (runtimeErrors.length) throw new Error(`Runtime errors: ${runtimeErrors.join(" | ")}`);
  const violations = Object.entries(axe).filter(([, entries]) => entries.length);
  if (violations.length) throw new Error(`Axe violations: ${JSON.stringify(violations)}`);

  console.log(
    JSON.stringify({ frames, widths, reflow: "pass", axe, keyboard: "pass", async: "pass" }),
  );
} finally {
  await browser.close();
  await server.close();
}
