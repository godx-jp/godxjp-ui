#!/usr/bin/env node
import { spawn } from "node:child_process";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const port = 6011;
const base = `http://localhost:${port}`;
const widths = [320, 375, 390, 768, 1024, 1280, 1440, 1920];
const stories = ["data-entry-input"];
const ignoredPageShellRules = new Set(["heading-order", "landmark-one-main", "region"]);
const server = spawn(
  "pnpm",
  ["exec", "vite", "--config", "preview/vite.config.ts", "--port", String(port), "--strictPort"],
  { stdio: "ignore", env: process.env },
);

async function waitForServer() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      if ((await fetch(base)).ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("preview server did not start");
}

let browser;
try {
  await waitForServer();
  browser = await chromium.launch();
  for (const width of widths) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await context.newPage();
    for (const story of stories) {
      await page.goto(`${base}/isolate/${story}`, { waitUntil: "networkidle" });
      const geometry = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      if (geometry.scrollWidth > geometry.clientWidth + 1)
        throw new Error(`${story}@${width}: horizontal overflow`);
      const result = await new AxeBuilder({ page }).analyze();
      const violations = result.violations.filter((item) => !ignoredPageShellRules.has(item.id));
      if (violations.length)
        throw new Error(`${story}@${width}: axe ${violations.map((item) => item.id).join(",")}`);
    }
    await context.close();
  }
  console.log(`✓ data-entry frame runtime: ${stories.length} story × ${widths.length} widths`);
} finally {
  await browser?.close();
  server.kill("SIGTERM");
}
