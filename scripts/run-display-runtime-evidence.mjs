import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import axe from "axe-core";

const base = process.env.PREVIEW_URL ?? "http://localhost:6008";
const widths = [320, 375, 390, 768, 1024, 1280, 1440, 1920];
const frames = [
  { id: "data-display-charts", route: "data-display-charts" },
  { id: "data-display-data-table", route: "data-display-data-table-index" },
  { id: "general-button", route: "general-button-index" },
];
const evidenceDir = path.resolve("artifacts/display-runtime");
fs.mkdirSync(evidenceDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const results = [];
for (const { id, route } of frames) {
  const result = {
    id,
    widths: [],
    overflow: "pass",
    a11y: "pass",
    rtl: "pass",
    keyboard: "pass",
    evidence: [],
  };
  for (const width of widths) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const errors = [];
    page.on("console", (message) => message.type() === "error" && errors.push(message.text()));
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`${base}/isolate/${route}`, { waitUntil: "domcontentloaded" });
    await page.locator("#root").waitFor();
    await page.waitForTimeout(500);
    if (await page.getByText("Preview not found", { exact: true }).count()) {
      throw new Error(`${id}: preview route not found`);
    }
    const geometry = await page.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth,
      clippedControls: [...document.querySelectorAll("button,a,input,select,[tabindex]")].filter(
        (node) => {
          const rect = node.getBoundingClientRect();
          return rect.right > document.documentElement.clientWidth + 1 || rect.left < -1;
        },
      ).length,
    }));
    if (geometry.documentWidth > geometry.viewportWidth + 1 || geometry.clippedControls)
      result.overflow = "fail";
    if (errors.length) result.overflow = "fail";
    result.widths.push(width);
    if (width === 320 || width === 1920) {
      const shot = path.join(evidenceDir, `${id}-${width}.png`);
      await page.screenshot({ path: shot, fullPage: true });
      result.evidence.push(shot);
    }
    if (width === 1024) {
      await page.addScriptTag({ content: axe.source });
      const violations = await page.evaluate(async () =>
        (await globalThis.axe.run()).violations.map((v) => v.id),
      );
      if (violations.length) {
        result.a11y = "fail";
        result.a11yViolations = violations;
      }
      await page.evaluate(() => document.documentElement.setAttribute("dir", "rtl"));
      const rtlOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      );
      if (rtlOverflow) result.rtl = "fail";
      await page.keyboard.press("Tab");
      const focus = await page.evaluate(() => {
        const node = document.activeElement;
        if (!node || node === document.body) return false;
        const style = getComputedStyle(node);
        return style.visibility !== "hidden" && style.display !== "none";
      });
      if (!focus) result.keyboard = "fail";
    }
    await page.close();
  }
  result.verdict = [result.overflow, result.a11y, result.rtl, result.keyboard].includes("fail")
    ? "fail"
    : "pass";
  results.push(result);
}
await browser.close();
console.log(JSON.stringify({ auditedAt: new Date().toISOString(), frames: results }, null, 2));
