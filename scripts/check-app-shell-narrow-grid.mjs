#!/usr/bin/env node
import { ensurePreviewServer } from "./frame-harness.mjs";
import { chromium } from "playwright";

/**
 * BELOW 900px EVERY AppShell STATE IS ONE COLUMN, AND `main` IS THE WHOLE WIDTH (gh#474).
 *
 * WHY THIS NEEDS A BROWSER. The defect was a selector list: the ≤56.25rem single-column reset
 * enumerated five of the shell's grid states, and `.app-root[data-topbar-span="full"]` without a
 * nav rail was not one of them. Its wide-viewport rule (two areas, attribute-qualified, so MORE
 * specific than the reset's bare `.app-root`) survived into the narrow breakpoint while the reset
 * declared ONE column — `main` fell into an implicit `auto` track sized to its max-content.
 * Measured by the consumer (godx-jp/id, 20.2.1) at 720px: `grid-template-columns: 549.6px 170.4px`
 * and a 170px `main`, with the page's actions laid out past the right edge. jsdom has no layout,
 * so every test that rendered the component passed.
 *
 * WHAT IS ASSERTED, for EVERY state the grid is keyed on — sidebar present/none × navRail
 * none/start/end/top/bottom × collapsed × topbarSpan content/full (30 states) — LTR and RTL:
 *   at 320 / 390 / 720 / 900px (the breakpoint is inclusive):
 *     1. the grid resolves to exactly ONE column;
 *     2. `main` spans the viewport, edge to edge;
 *     3. the page never scrolls sideways, and no visible element lays out past either edge;
 *   at 1280px (the wide side of the same breakpoint):
 *     4. the grid still has the track count the state asks for — the narrow fix must not leak.
 *
 * The frame is `docs/layout/app-shell-states.tsx`: ONE AppShell per URL, state in the query.
 */
const port = Number(process.env.PREVIEW_PORT) || 6018;
const base = `http://localhost:${port}`;
const stopServer = await ensurePreviewServer(base);

const NARROW = [320, 390, 720, 900];
const WIDE = 1280;
const states = [];
for (const sidebar of ["present", "none"]) {
  for (const navRail of ["none", "start", "end", "top", "bottom"]) {
    for (const collapsed of sidebar === "present" ? [false, true] : [false]) {
      for (const topbarSpan of ["content", "full"]) {
        states.push({ sidebar, navRail, collapsed, topbarSpan });
      }
    }
  }
}

/** Columns the WIDE grid owes each state: the content track, plus a sidebar and a column rail. */
function wideColumns({ sidebar, navRail }) {
  return 1 + (sidebar === "present" ? 1 : 0) + (navRail === "start" || navRail === "end" ? 1 : 0);
}

function query({ sidebar, navRail, collapsed, topbarSpan }, dir) {
  const params = new URLSearchParams({ topbarSpan });
  if (navRail !== "none") params.set("navRail", navRail);
  if (collapsed) params.set("collapsed", "1");
  if (sidebar === "none") params.set("sidebar", "none");
  if (dir === "rtl") params.set("dir", "rtl");
  return params.toString();
}

function measure() {
  const root = document.querySelector(".app-root");
  const main = root?.querySelector(":scope > main");
  if (!root || !main) throw new Error("frame rendered no .app-root > main");
  const vw = document.documentElement.clientWidth;
  const inScroller = (node) => {
    for (let a = node.parentElement; a && a !== root; a = a.parentElement) {
      const s = getComputedStyle(a);
      if (["auto", "scroll"].includes(s.overflowX) && a.scrollWidth > a.clientWidth) return true;
    }
    return false;
  };
  const outside = [...root.querySelectorAll("*")]
    .filter((node) => {
      const r = node.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return false;
      const s = getComputedStyle(node);
      if (s.visibility === "hidden") return false;
      return (r.left < -1 || r.right > vw + 1) && !inScroller(node);
    })
    .slice(0, 3)
    .map((node) => {
      const r = node.getBoundingClientRect();
      const label = node.getAttribute("aria-label") ?? node.textContent?.trim().slice(0, 24);
      return `${node.tagName.toLowerCase()}「${label}」${Math.round(r.left)}→${Math.round(r.right)}`;
    });
  const main_ = main.getBoundingClientRect();
  return {
    vw,
    columns: getComputedStyle(root).gridTemplateColumns.split(" ").filter(Boolean).length,
    template: getComputedStyle(root).gridTemplateColumns,
    main: { left: main_.left, width: main_.width },
    pageOverflow: document.documentElement.scrollWidth - vw,
    outside,
  };
}

const failures = [];
const summary = [];
let browser;
try {
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: WIDE, height: 900 } });
  for (const dir of ["ltr", "rtl"]) {
    for (const state of states) {
      const id = `${dir} ${query(state, "ltr")}`;
      await page.setViewportSize({ width: WIDE, height: 900 });
      await page.goto(`${base}/isolate/layout-app-shell-states?${query(state, dir)}`, {
        waitUntil: "domcontentloaded",
      });
      await page.locator(".app-root > main").waitFor();
      await page.evaluate((d) => document.documentElement.setAttribute("dir", d), dir);
      await page.waitForTimeout(150);

      const wide = await page.evaluate(measure);
      if (wide.columns !== wideColumns(state)) {
        failures.push(`${id} @${WIDE}: ${wide.columns} columns, expected ${wideColumns(state)}`);
      }
      const mains = [];
      for (const width of NARROW) {
        await page.setViewportSize({ width, height: 900 });
        await page.waitForTimeout(60);
        const m = await page.evaluate(measure);
        mains.push(Math.round(m.main.width));
        const problems = [];
        if (m.columns !== 1) problems.push(`${m.columns} columns (${m.template})`);
        if (Math.abs(m.main.left) > 1 || Math.abs(m.main.width - m.vw) > 1) {
          problems.push(`main ${Math.round(m.main.width)}px at x=${Math.round(m.main.left)}`);
        }
        if (m.pageOverflow > 1) problems.push(`page scrolls ${m.pageOverflow}px sideways`);
        if (m.outside.length) problems.push(`past the edge: ${m.outside.join(", ")}`);
        if (problems.length) failures.push(`${id} @${width}: ${problems.join("; ")}`);
      }
      summary.push({ state: id, mainAt320to900: mains.join("/") });
    }
  }
} finally {
  await browser?.close();
  stopServer();
}

if (failures.length) {
  console.error(`✗ app-shell narrow grid — ${failures.length} failure(s):\n  ${failures.join("\n  ")}`);
  process.exit(1);
}
console.log(
  `✓ app-shell narrow grid — ${states.length} states × LTR/RTL: one column and a full-width main ` +
    `at ${NARROW.join("/")}px; wide track counts intact at ${WIDE}px.`,
);
