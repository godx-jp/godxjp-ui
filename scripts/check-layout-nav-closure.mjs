import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { createServer } from "vite";

const allFrames = [
  "layout-flex",
  "layout-app-shell",
  "layout-aspect-ratio",
  "layout-auth-shell",
  "layout-page-container",
  "layout-resizable-panel",
  "layout-separator",
  "layout-sidebar",
  "layout-split-pane",
  "layout-topbar",
  "navigation-breadcrumb",
  "navigation-app-setting-picker",
  "navigation-context-menu",
  "navigation-dropdown-menu",
  "navigation-menubar",
  "navigation-navigation-menu",
  "navigation-steps",
  "navigation-toolbar",
  "navigation-tabs",
  "navigation-pagination",
];
const frames = process.env.FRAME_ID
  ? allFrames.filter((frame) => frame === process.env.FRAME_ID)
  : allFrames;
if (!frames.length) throw new Error(`Unknown FRAME_ID: ${process.env.FRAME_ID}`);

const server = await createServer({ configFile: "preview/vite.config.ts" });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ hasTouch: process.env.TOUCH === "1" });
const widths = [320, 375, 390, 768, 1024, 1280, 1440, 1920];

try {
  await server.listen();
  const page = await context.newPage();
  const runtimeErrors = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  for (const frame of frames) {
    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(
        `http://localhost:6008/frame/${frame}${process.env.RTL === "1" ? "?rtl=1" : ""}`,
        { waitUntil: "networkidle" },
      );
      const result = await page.evaluate(() => ({
        viewport: innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        error: document.querySelector(".preview-runtime-error")?.textContent,
      }));
      if (result.error) throw new Error(`${frame}@${width}: ${result.error}`);
      if (result.scrollWidth > result.viewport + 1) {
        throw new Error(`${frame}@${width}: overflow ${result.scrollWidth}>${result.viewport}`);
      }
    }
  }
  await page.setViewportSize({ width: 1024, height: 900 });
  const axe = {};
  for (const frame of frames) {
    await page.goto(
      `http://localhost:6008/isolate/${frame}${process.env.RTL === "1" ? "?rtl=1" : ""}`,
      { waitUntil: "networkidle" },
    );
    if (frame === "layout-resizable-panel") {
      await page.getByRole("button", { name: "サイドバーを開く" }).click();
      const handle = page.getByRole("separator").first();
      const before = await handle.getAttribute("aria-valuenow");
      await handle.focus();
      await page.keyboard.press("ArrowRight");
      const after = await handle.getAttribute("aria-valuenow");
      if (before === after) throw new Error("ResizableHandle ArrowRight did not resize the panels");
    }
    if (frame === "layout-app-shell") {
      await page.getByRole("button", { name: "レガシースロットを表示" }).click();
      if (!(await page.getByText("Legacy slots active").isVisible())) {
        throw new Error("AppShell legacy topbar slots did not render");
      }
    }
    if (process.env.RTL === "1") {
      if ((await page.locator("[data-rtl-root]").getAttribute("dir")) !== "rtl") {
        throw new Error(`${frame}: RTL was not initialized before mount`);
      }
      if (frame === "navigation-menubar") {
        const menus = page.getByRole("menuitem");
        await menus.first().focus();
        await page.keyboard.press("ArrowLeft");
        const focused = await menus.evaluateAll((nodes) => nodes.indexOf(document.activeElement));
        if (focused <= 0) throw new Error("RTL Menubar ArrowLeft did not move focus");
      }
    }
    axe[frame] = (await new AxeBuilder({ page }).analyze()).violations.map((violation) => ({
      id: violation.id,
      targets: violation.nodes.map((node) => node.target),
    }));
  }
  if (runtimeErrors.length) throw new Error(`Runtime errors: ${runtimeErrors.join(" | ")}`);
  const violations = Object.entries(axe).filter(([, entries]) => entries.length);
  if (violations.length) {
    const diagnostics = await page.locator(".ui-resizable-panel").evaluateAll((nodes) =>
      nodes.map((node) => ({
        html: node.outerHTML.slice(0, 500),
        overflow: getComputedStyle(node).overflow,
        scrollHeight: node.scrollHeight,
        clientHeight: node.clientHeight,
      })),
    );
    throw new Error(`Axe violations: ${JSON.stringify(violations)} ${JSON.stringify(diagnostics)}`);
  }
  console.log(
    JSON.stringify({
      frames,
      widths,
      reflow: "pass",
      coarsePointer: process.env.TOUCH === "1" ? "pass" : "not-run",
      rtl: process.env.RTL === "1" ? "pass" : "not-run",
      axe,
    }),
  );
} finally {
  await browser.close();
  await server.close();
}
