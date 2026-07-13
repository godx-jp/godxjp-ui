import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import axe from "axe-core";

const base = process.env.PREVIEW_URL ?? "http://localhost:6008";
const widths = [320, 375, 390, 768, 1024, 1280, 1440, 1920];
const allFrames = [
  { id: "data-display-charts", route: "data-display-charts" },
  { id: "data-display-data-table", route: "data-display-data-table-index" },
  { id: "general-button", route: "general-button-index" },
  ...[
    "badge",
    "list-row",
    "avatar",
    "accordion",
    "collapsible",
    "carousel",
    "descriptions",
    "empty-state",
    "progress",
    "timeline",
    "tree-list",
    "scroll-area",
    "popover",
    "hover-card",
    "table",
    "stat-card",
  ].map((name) => ({ id: `data-display-${name}`, route: `data-display-${name}` })),
  { id: "data-display-card", route: "data-display-card-index" },
  { id: "general-typography", route: "general-typography" },
  { id: "general-logo", route: "general-logo" },
  ...["alert", "dialog", "sheet", "skeleton", "tooltip"].map((name) => ({
    id: `feedback-${name}`,
    route: `feedback-${name}`,
  })),
  { id: "query-button-refetch", route: "query-button-refetch" },
  { id: "general-reveal", route: "general-reveal" },
  { id: "providers-app-provider", route: "providers-app-provider" },
  { id: "providers-format-date", route: "providers-format-date" },
  ...["data-state", "infinite-query-state", "mutation-feedback", "prefetch-link"].map((name) => ({
    id: `query-${name}`,
    route: `query-${name}`,
  })),
];
const requested = new Set((process.env.FRAMES ?? "").split(",").filter(Boolean));
const frames = requested.size ? allFrames.filter(({ id }) => requested.has(id)) : allFrames;
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
    page.on("console", (message) => {
      const text = message.text();
      if (
        message.type() === "error" &&
        !text.includes("WebSocket connection to 'ws://localhost:6008")
      )
        errors.push(text);
    });
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
      clippedControls: [
        ...document.querySelectorAll('button,a,input,select,[tabindex]:not([tabindex="-1"])'),
      ].filter((node) => {
        const rect = node.getBoundingClientRect();
        const clipped = rect.right > document.documentElement.clientWidth + 1 || rect.left < -1;
        if (!clipped) return false;
        const scroller = [...document.querySelectorAll("*")].find(
          (candidate) =>
            candidate.contains(node) &&
            ["auto", "scroll"].includes(getComputedStyle(candidate).overflowX) &&
            candidate.scrollWidth > candidate.clientWidth,
        );
        return !scroller;
      }).length,
    }));
    if (geometry.documentWidth > geometry.viewportWidth + 1 || geometry.clippedControls)
      result.overflow = "fail";
    if (geometry.documentWidth > geometry.viewportWidth + 1 || geometry.clippedControls) {
      (result.overflowFailures ??= []).push({ width, ...geometry });
    }
    if (errors.length) {
      result.overflow = "fail";
      (result.consoleErrors ??= []).push({ width, errors });
    }
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
      const focusableCount = await page
        .locator('button,a[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')
        .count();
      if (focusableCount === 0) {
        result.keyboard = "not-applicable";
        await page.close();
        continue;
      }
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
const auditedAt = new Date().toISOString();
if (process.env.WRITE_EVIDENCE === "1") {
  const ledgerPath = path.resolve("display-runtime-evidence.json");
  const ledger = JSON.parse(fs.readFileSync(ledgerPath, "utf8"));
  const merged = new Map((ledger.frames ?? []).map((frame) => [frame.id, frame]));
  for (const result of results) {
    merged.set(result.id, {
      ...result,
      evidence: result.evidence.map((file) => path.relative(process.cwd(), file)),
    });
  }
  fs.writeFileSync(
    ledgerPath,
    `${JSON.stringify({ ...ledger, auditedAt, frames: [...merged.values()] }, null, 2)}\n`,
  );
}
console.log(JSON.stringify({ auditedAt, frames: results }, null, 2));
