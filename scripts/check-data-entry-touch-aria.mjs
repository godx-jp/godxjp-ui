#!/usr/bin/env node
import { spawn } from "node:child_process";
import { chromium } from "playwright";

const port = 6012;
const base = `http://localhost:${port}`;
const cases = [
  ["data-entry-checkbox", '[role="checkbox"]'],
  ["data-entry-radio-group", '[role="radio"]'],
  ["data-entry-toggle-group", '[role="group"]'],
  ["data-entry-command", "[cmdk-input]"],
  ["data-entry-input-otp", 'input[data-input-otp="true"]'],
  ["data-entry-label", "textarea"],
  ["data-entry-textarea", "textarea"],
  ["data-entry-password-strength", 'input[type="password"]'],
];
const server = spawn(
  "pnpm",
  ["exec", "vite", "--config", "preview/vite.config.ts", "--port", String(port), "--strictPort"],
  { stdio: "ignore", env: process.env },
);
for (let attempt = 0; attempt < 80; attempt += 1) {
  try {
    if ((await fetch(base)).ok) break;
  } catch {}
  await new Promise((resolve) => setTimeout(resolve, 100));
}
let browser;
try {
  browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
  });
  const page = await context.newPage();
  for (const [story, selector] of cases) {
    await page.goto(`${base}/isolate/${story}`, { waitUntil: "networkidle" });
    const target = page.locator(selector).first();
    if ((await target.count()) === 0) throw new Error(`${story}: missing touch target ${selector}`);
    const before = await target.ariaSnapshot();
    if (!before.trim()) throw new Error(`${story}: empty accessibility-tree snapshot`);
    await target.tap();
    const after = await target.ariaSnapshot();
    if (!after.trim()) throw new Error(`${story}: target left accessibility tree after tap`);
  }
  await context.close();
  console.log(`✓ data-entry touch + aria tree: ${cases.length} owner frames`);
} finally {
  await browser?.close();
  server.kill("SIGTERM");
}
