#!/usr/bin/env node
import { spawn } from "node:child_process";
import { chromium } from "playwright";

const port = Number(process.env.PREVIEW_PORT) || 6014;
const base = `http://localhost:${port}`;
const server = spawn(
  "pnpm",
  ["exec", "vite", "--config", "preview/vite.config.ts", "--port", String(port), "--strictPort"],
  // stderr is piped, not ignored: when the server fails to bind we need to SAY why.
  { stdio: ["ignore", "ignore", "pipe"], env: process.env },
);
let serverStderr = "";
server.stderr?.on("data", (chunk) => {
  serverStderr += String(chunk);
});

// How long to wait for Vite to come up. 60s is plenty for one server on an idle machine and far
// too little for five: the rendered-runtime shards run in PARALLEL on a single self-hosted host,
// each cold-starting its own Vite dev server while a full CI job runs beside them, and all five
// died on this line at once. The budget is env-tunable so a busier pool can raise it without a
// code change, and the error now says how long it actually waited.
const PREVIEW_START_TIMEOUT_MS = Number(process.env.PREVIEW_START_TIMEOUT_MS ?? 180_000);

async function waitForServer() {
  const attempts = Math.ceil(PREVIEW_START_TIMEOUT_MS / 100);
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      if ((await fetch(base)).ok) return;
    } catch {
      // Preview is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(
    `button icon-xs preview server did not start within ${Math.round(PREVIEW_START_TIMEOUT_MS / 1000)}s` +
      (serverStderr ? `\n${serverStderr}` : ""),
  );
}

const cases = [
  { label: "Edit", mode: "default" },
  { label: "Edit with 16px icon", mode: "default-explicit" },
  { label: "Compact edit", mode: "compact" },
  { label: "Compact edit with 16px icon", mode: "compact-explicit" },
];
const results = [];
let browser;
const closeTo = (actual, expected, tolerance = 0.05) => Math.abs(actual - expected) <= tolerance;

try {
  await waitForServer();
  browser = await chromium.launch({ headless: true });
  for (const { width, coarse } of [
    { width: 1024, coarse: false },
    { width: 320, coarse: true },
    { width: 390, coarse: true },
  ]) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      hasTouch: coarse,
      isMobile: coarse,
    });
    const page = await context.newPage();
    await page.goto(`${base}/isolate/general-button-index`, { waitUntil: "domcontentloaded" });
    for (const { label, mode } of cases) {
      const button = page.locator(`button[data-size="icon-xs"][aria-label="${label}"]`);
      const geometry = await button.evaluate((node) => {
        const buttonRect = node.getBoundingClientRect();
        const icon = node.querySelector("svg");
        if (!icon) throw new Error("icon-xs case has no SVG");
        const iconRect = icon.getBoundingClientRect();
        return {
          buttonWidth: buttonRect.width,
          buttonHeight: buttonRect.height,
          iconWidth: iconRect.width,
          iconHeight: iconRect.height,
          insetInline: (buttonRect.width - iconRect.width) / 2,
          insetBlock: (buttonRect.height - iconRect.height) / 2,
        };
      });
      const compact = mode.startsWith("compact");
      const expectedButton = coarse ? 44 : compact ? 22.08 : 24;
      const expectedInset = coarse ? 16 : compact ? 5.04 : 6;
      if (
        geometry.buttonWidth !== geometry.buttonHeight ||
        !closeTo(geometry.buttonWidth, expectedButton) ||
        geometry.iconWidth !== 12 ||
        geometry.iconHeight !== 12 ||
        !closeTo(geometry.insetInline, expectedInset) ||
        !closeTo(geometry.insetBlock, expectedInset) ||
        (coarse && geometry.buttonWidth < 44)
      ) {
        throw new Error(`${mode}@${width}: ${JSON.stringify(geometry)}`);
      }
      if (coarse) await button.tap();
      results.push({ width, coarse, mode, ...geometry, verdict: "pass" });
    }
    await context.close();
  }
  console.log(JSON.stringify(results, null, 2));
} finally {
  await browser?.close();
  server.kill("SIGTERM");
}
