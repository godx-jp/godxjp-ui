#!/usr/bin/env node
import { ensurePreviewServer } from "./frame-harness.mjs";
import { chromium } from "playwright";

/**
 * INSIDE AppShell THE PAGE IS FLUID, AND A CAP BOUNDS CONTENT — NEVER THE FOOTER (gh#672).
 *
 * WHY THIS NEEDS A BROWSER. The defect only shows once `.app-main` is WIDER than the cap: with the
 * sidebar open at 1512px main was 1256px, under the old 80rem cap, so nothing looked wrong.
 * Collapsing the sidebar widened main to 1448px while `.ui-page-container` stayed at 1280px —
 * a 168px dead strip, and a sticky comment composer (`.ui-page-footer`) that ended 168px short of
 * the edge. jsdom has no layout; only bounding boxes see it.
 *
 * WHAT IS ASSERTED, sidebar COLLAPSED and OPEN, at 1512 and 1920px, LTR and RTL:
 *   (a) default                      container = main, footer = main, body = main (fluid)
 *   (b) service cap (:root 80rem)    container = main, footer = main, header/body ≤ 1280px
 *   (c) measure="narrow"             container = main, footer = main, body ≤ 42rem (672px)
 *   (d) cap + measure="narrow"       the page-level measure wins on that page: body ≤ 672px
 * and at 390px (drawer, one column) every case keeps container = footer = main, no sideways scroll.
 * Every capped band starts at the main column's inline-start edge (left in LTR, right in RTL).
 *
 * The frame is `docs/layout/app-shell-states.tsx` (`?collapsed=1&footer=1&measure=narrow`).
 */
const port = Number(process.env.PREVIEW_PORT) || 6019;
const base = `http://localhost:${port}`;
const stopServer = await ensurePreviewServer(base);

const CAP_REM = 80;
const NARROW_PX = 672;
const cases = [
  { id: "default", measure: null, cap: false, contentMax: null },
  { id: "service-cap", measure: null, cap: true, contentMax: CAP_REM * 16 },
  { id: "measure-narrow", measure: "narrow", cap: false, contentMax: NARROW_PX },
  { id: "cap+measure-narrow", measure: "narrow", cap: true, contentMax: NARROW_PX },
];

function measure() {
  const main = document.querySelector(".app-root > main");
  const box = (sel) => {
    const el = main?.querySelector(sel);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { left: r.left, right: r.right, width: r.width };
  };
  if (!main) throw new Error("frame rendered no .app-root > main");
  const m = main.getBoundingClientRect();
  return {
    vw: document.documentElement.clientWidth,
    pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    main: { left: m.left, right: m.right, width: main.clientWidth },
    container: box(".ui-page-container"),
    header: box(".ui-page-header"),
    body: box(".ui-page-body"),
    footer: box(".ui-page-footer"),
  };
}

const failures = [];
const rows = [];
let browser;
try {
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1512, height: 900 } });
  for (const dir of ["ltr", "rtl"]) {
    for (const collapsed of [true, false]) {
      for (const c of cases) {
        const params = new URLSearchParams({ footer: "1" });
        if (collapsed) params.set("collapsed", "1");
        if (c.measure) params.set("measure", c.measure);
        if (dir === "rtl") params.set("dir", "rtl");
        await page.setViewportSize({ width: 1512, height: 900 });
        await page.goto(`${base}/isolate/layout-app-shell-states?${params}`, {
          waitUntil: "domcontentloaded",
        });
        await page.locator(".app-root > main .ui-page-footer").waitFor();
        await page.evaluate((d) => document.documentElement.setAttribute("dir", d), dir);
        if (c.cap) {
          // How a service configures it: ONE global theme declaration, not a page-local override.
          await page.addStyleTag({
            content: `:root { --app-shell-page-max-width: ${CAP_REM}rem; }`,
          });
        }
        for (const width of [1512, 1920, 390]) {
          await page.setViewportSize({ width, height: 900 });
          await page.waitForTimeout(120);
          const r = await page.evaluate(measure);
          const id = `${dir} ${collapsed ? "collapsed" : "open"} ${c.id} @${width}`;
          const problems = [];
          const near = (a, b) => Math.abs(a - b) <= 1;
          if (!r.container || !r.footer || !r.body || !r.header) {
            failures.push(`${id}: page bands missing`);
            continue;
          }
          // The main column's content box. `.app-main` has no inline padding, so clientWidth is
          // the track the page lays out in (scrollbar excluded).
          if (!near(r.container.width, r.main.width)) {
            problems.push(`container ${Math.round(r.container.width)} ≠ main ${r.main.width}`);
          }
          if (!near(r.footer.width, r.main.width)) {
            problems.push(`footer ${Math.round(r.footer.width)} ≠ main ${r.main.width}`);
          }
          const expectedBody =
            c.contentMax === null ? r.main.width : Math.min(c.contentMax, r.main.width);
          if (!near(r.body.width, expectedBody)) {
            problems.push(`body ${Math.round(r.body.width)} ≠ expected ${expectedBody}`);
          }
          if (!near(r.header.width, expectedBody)) {
            problems.push(`header ${Math.round(r.header.width)} ≠ expected ${expectedBody}`);
          }
          const bodyStart = dir === "rtl" ? r.body.right : r.body.left;
          const containerStart = dir === "rtl" ? r.container.right : r.container.left;
          if (!near(bodyStart, containerStart)) {
            problems.push(
              `body does not start at the inline-start edge (${bodyStart} vs ${containerStart})`,
            );
          }
          if (r.pageOverflow > 1) problems.push(`page scrolls ${r.pageOverflow}px sideways`);
          if (problems.length) failures.push(`${id}: ${problems.join("; ")}`);
          rows.push({
            case: id,
            main: r.main.width,
            container: Math.round(r.container.width),
            footer: Math.round(r.footer.width),
            body: Math.round(r.body.width),
            deadStrip: Math.round(r.main.width - r.container.width),
          });
        }
      }
    }
  }
} finally {
  await browser?.close();
  stopServer();
}

if (process.argv.includes("--table")) console.table(rows);
if (failures.length) {
  console.error(
    `✗ app-shell page width — ${failures.length} failure(s):\n  ${failures.join("\n  ")}`,
  );
  process.exit(1);
}
console.log(
  `✓ app-shell page width — ${rows.length} measurements: container and sticky footer span .app-main ` +
    `at every sidebar state; a service cap and measure bound header/body only (LTR + RTL).`,
);
