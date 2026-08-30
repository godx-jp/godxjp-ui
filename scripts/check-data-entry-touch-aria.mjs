#!/usr/bin/env node
import { ensurePreviewServer } from "./frame-harness.mjs";
import { chromium } from "playwright";

const port = 6012;
const base = `http://localhost:${port}`;
const cases = [
  ["data-entry-checkbox", '[role="checkbox"]'],
  ["data-entry-radio-group", '[role="radio"]'],
  // Radix ToggleGroup emits role="radiogroup" for type="single" (and "toolbar" for
  // type="multiple") — never role="group". The old selector matched nothing and the
  // whole check crashed on it.
  ["data-entry-toggle-group", '[role="radiogroup"]'],
  ["data-entry-command", "[cmdk-input]"],
  ["data-entry-input-otp", 'input[data-input-otp="true"]'],
  ["data-entry-label", "textarea"],
  ["data-entry-textarea", "textarea"],
  ["data-entry-password-strength", 'input[type="password"]'],
  ["data-entry-input", "input"],
  ["data-entry-number-input", "input"],
  ["data-entry-select", "#priority"],
  ["data-entry-form", "input"],
  ["data-entry-form-field-index", "input"],
  ["data-entry-search-input", "input"],
  ["data-entry-switch", '[role="switch"]'],
  ["data-entry-toggle", "button[aria-pressed]"],
  ["data-entry-slider", '[role="slider"]'],
  ["data-entry-calendar", "button"],
  ["data-entry-month-picker", "button"],
  ["data-entry-month-range-picker", "button"],
  ["data-entry-date-picker", "button"],
  ["data-entry-date-range-picker", "button"],
  ["data-entry-time-picker", "button"],
  ["data-entry-color-picker", 'input[type="color"]'],
  ["data-entry-upload", "button"],
  ["data-entry-cascader", '[role="combobox"]'],
  ["data-entry-tree-select", '[role="combobox"]'],
  ["data-entry-transfer", '[role="checkbox"]'],
  ["data-entry-password-input", 'input[type="password"]'],
  ["data-entry-rating", "button"],
  ["data-entry-tag-input", "input"],
];
// The preview server comes from `frame-harness.ensurePreviewServer`, the one path with a green
// record on this pool. These gates used to hand-roll it — first with `vite` (the DEV server,
// which on a cold runner never binds in time), then with `vite preview`, which still failed while
// frame-axe / frame-geometry / contrast passed doing the apparently same thing. Rather than keep
// guessing which of the small differences mattered (detached process group, an early reachability
// check, an explicit cwd), they now call the function that works. One way to stand a preview up.
const stopServer = await ensurePreviewServer(base);
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
    const after = await (
      story === "data-entry-select" ? page.locator('[data-slot="select-content"]') : target
    ).ariaSnapshot();
    if (!after.trim()) throw new Error(`${story}: target left accessibility tree after tap`);
  }
  await context.close();
  console.log(`✓ data-entry touch + aria tree: ${cases.length} owner frames`);
} finally {
  await browser?.close();
  stopServer();
}
