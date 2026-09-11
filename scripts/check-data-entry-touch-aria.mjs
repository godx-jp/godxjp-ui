#!/usr/bin/env node
import { ensurePreviewServer } from "./frame-harness.mjs";
import { chromium } from "playwright";

const port = 6012;
const base = `http://localhost:${port}`;
/*
 * SELECTORS ARE PLAYWRIGHT SELECTORS, and `role=` is not the same thing as `[role=]`.
 *
 * The two checkbox entries read `[role="checkbox"]` — a CSS attribute match, which only ever finds
 * an element that SPELLS the attribute out. Radix's Checkbox did; the react-aria-components
 * Checkbox this library moved to in v20 renders a real `<input type="checkbox">`, whose checkbox
 * role is IMPLICIT. Measured on the frame after the migration: 0 elements matching
 * `[role="checkbox"]`, 26 matching `input[type="checkbox"]` — so this gate threw on its very first
 * case and stopped, and every case after it went unmeasured. `role=checkbox` is Playwright's role
 * engine and resolves the implicit role, which is what the gate meant all along.
 */
const cases = [
  ["data-entry-checkbox", '[data-slot="checkbox"]'],
  // Same trap the checkbox entry above records, one component later: react-aria renders a real
  // `<input type="radio">` whose role is IMPLICIT, so a CSS `[role="radio"]` matches nothing —
  // and since #487 that input sits inside `.ui-choice-input`, under the painted control. The
  // painted control is what a finger lands on.
  ["data-entry-radio-group", '[data-slot="radio-group-item"]'],
  // Radix ToggleGroup emits role="radiogroup" for type="single" (and "toolbar" for
  // type="multiple") — never role="group".
  ["data-entry-toggle-group", '[role="radiogroup"]'],
  // Segmented is a radiogroup too, and it was missing from this list while three of its own
  // documented props (`size`, `vertical`, `block`) had no rendered example anywhere — which is
  // how `size` came to be a silent no-op for as long as it did. The frame now carries all three.
  ["data-entry-segmented", '[data-slot="segmented-item"]'],
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
  // Same trap as the checkbox entries above, one migration later: the react-aria Slider's
  // role=slider is an `<input type="range">` inside the painted thumb, and that input is
  // visually hidden — `[role="slider"]` matches nothing and nothing is tappable. The thumb is
  // what a finger lands on, and its snapshot carries the slider node underneath it.
  ["data-entry-slider", '[data-slot="slider-thumb"]'],
  ["data-entry-calendar", "button"],
  ["data-entry-date-picker", "button"],
  ["data-entry-time-picker", "button"],
  ["data-entry-color-picker", 'input[type="color"]'],
  ["data-entry-upload", "button"],
  ["data-entry-cascader", '[role="combobox"]'],
  ["data-entry-tree-select", '[role="combobox"]'],
  ["data-entry-transfer", '[data-slot="checkbox"]'],
  ["data-entry-password-input", 'input[type="password"]'],
  ["data-entry-rating", "button"],
  ["data-entry-tag-input", "input"],
];
// The preview server comes from `frame-harness.ensurePreviewServer`, the one path with a green
// record on this pool.
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
