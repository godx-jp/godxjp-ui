import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { createServer } from "vite";
const server = await createServer({ configFile: "preview/vite.config.ts" });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const widths = [320, 375, 390, 768, 1024, 1280, 1440, 1920];
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
const frames = process.env.FRAME_ID
  ? allFrames.filter((frame) => frame === process.env.FRAME_ID)
  : allFrames;
if (!frames.length) throw new Error(`Unknown FRAME_ID: ${process.env.FRAME_ID}`);

try {
  await server.listen();
  const page = await context.newPage();
  const runtimeErrors = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));

  for (const frame of frames) {
    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`http://localhost:6008/frame/${frame}`, { waitUntil: "networkidle" });
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
    await page.goto(`http://localhost:6008/frame/${frame}`, { waitUntil: "networkidle" });
    axe[frame] = (await new AxeBuilder({ page }).analyze()).violations.map((violation) => ({
      id: violation.id,
      nodes: violation.nodes.map((node) => ({ target: node.target, html: node.html })),
    }));
  }

  if (frames.includes("feedback-dialog")) {
    await page.goto("http://localhost:6008/frame/feedback-dialog", { waitUntil: "networkidle" });
    const dialog = page.getByRole("dialog");
    if (!(await dialog.isVisible())) throw new Error("Dialog pre-open state missing");
    await page.keyboard.press("Escape");
    if (await dialog.isVisible()) throw new Error("Dialog Escape close failed");
  }

  if (frames.includes("feedback-sheet")) {
    await page.goto("http://localhost:6008/frame/feedback-sheet", { waitUntil: "networkidle" });
    if (!(await page.getByRole("dialog").isVisible()))
      throw new Error("Sheet pre-open state missing");
    await page.keyboard.press("Escape");
    if (await page.getByRole("dialog").isVisible()) throw new Error("Sheet Escape close failed");
  }

  if (frames.includes("feedback-alert-dialog")) {
    await page.goto("http://localhost:6008/frame/feedback-alert-dialog", {
      waitUntil: "networkidle",
    });
    if (!(await page.getByRole("alertdialog").isVisible())) throw new Error("AlertDialog missing");
    await page.getByRole("button", { name: "キャンセル" }).click();
    if (await page.getByRole("alertdialog").isVisible())
      throw new Error("AlertDialog cancel failed");
  }

  if (frames.includes("feedback-tooltip")) {
    await page.goto("http://localhost:6008/frame/feedback-tooltip", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "請求書をコピー" }).focus();
    if (!(await page.getByRole("tooltip").isVisible()))
      throw new Error("Tooltip focus journey failed");
  }

  if (frames.includes("feedback-toast")) {
    await page.goto("http://localhost:6008/frame/feedback-toast", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "success", exact: true }).click();
    if (!(await page.getByText("仕訳を保存しました").isVisible()))
      throw new Error("Toast journey failed");
  }

  if (frames.includes("query-mutation-feedback")) {
    await page.goto("http://localhost:6008/frame/query-mutation-feedback", {
      waitUntil: "networkidle",
    });
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
