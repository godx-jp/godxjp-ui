#!/usr/bin/env node
/**
 * check:text-ink-clip — does a clipped text box actually CONTAIN its own ink?
 *
 * `overflow: hidden` is what makes `text-overflow: ellipsis` work, so in a truncating rule the
 * line box is the CLIPPING BOUNDARY, not a rhythm choice. A line-height chosen against Latin — 1,
 * 1.2, 1.25, 1.3 — still covers a `g` descender and cuts the dot-below of Vietnamese `ị` or a
 * stacked Japanese diacritic. Five separate rules in this package shipped that way before anyone
 * noticed, because the demo strings are Latin and Latin does not reveal it.
 *
 * The static guard in auth-shell-preset-geometry.test.ts catches the SHAPE it knows (a truncating
 * rule with a short line box). It cannot catch a fixed-height text box, a service that retunes a
 * token, or any variant nobody has thought of yet. This one measures the OUTCOME instead: it walks
 * the rendered page, forces a diacritic-heavy string into every clipped text box, and compares the
 * Range ink rectangle against the element's own box.
 *
 * Substituting the text is the point, not a shortcut: the question is whether the BOX can hold
 * diacritic ink, and asking it of a Latin fixture answers a different question.
 */
const base = process.argv[2]?.startsWith("http") ? process.argv[2] : "http://localhost:6008";
const routeArgs = process.argv.slice(2).filter((a) => !a.startsWith("http"));
const ROUTES = routeArgs.length
  ? routeArgs
  : [
      "/showcase/acme-portal",
      "/showcase/case1-warehouse-dashboard",
      "/isolate/layout-org-switcher",
      "/isolate/layout-app-shell",
      "/isolate/layout-topbar",
      "/isolate/data-display-list-row",
      "/isolate/general-typography",
    ];

/** Vietnamese below-baseline marks plus a Japanese glyph with a low stroke. */
const STRESS = "Quản trị viên ị ụ ợ 漢字";

const probe = (stress) => {
  const bad = [];
  const nodes = [...document.querySelectorAll("*")].filter((el) => {
    if (el.children.length !== 0) return false;
    if (!(el.textContent || "").trim()) return false;
    const cs = getComputedStyle(el);
    // Only boxes that CLIP. A visible overflow cannot cut anything.
    const clips = cs.overflow !== "visible" || cs.overflowY !== "visible" || cs.overflowX !== "visible";
    if (!clips) return false;
    // VISUALLY-HIDDEN text is clipped ON PURPOSE — `.sr-only` is a 1px box whose whole job is to
    // hide ink from the eye while keeping it for a screen reader. Reporting it would be the
    // "green board that measures the wrong thing" failure in reverse: 15 loud findings, none real,
    // and a reader who learns to skip the gate. Detected by geometry, not by class name, so a
    // consumer's own visually-hidden helper is excluded too.
    const box = el.getBoundingClientRect();
    if (box.width <= 2 || box.height <= 2) return false;
    if (cs.clipPath.includes("inset(50%)") || cs.clip === "rect(0px, 0px, 0px, 0px)") return false;
    return true;
  });
  for (const el of nodes) {
    const original = el.textContent;
    el.textContent = stress;
    void el.offsetHeight; // force reflow before measuring
    const box = el.getBoundingClientRect();
    const range = document.createRange();
    range.selectNodeContents(el);
    const ink = range.getBoundingClientRect();
    const overflowBelow = ink.bottom - box.bottom;
    const overflowAbove = box.top - ink.top;
    el.textContent = original;
    if (box.height === 0) continue;
    // 0.5px of tolerance: sub-pixel rounding, not a clipped mark.
    if (overflowBelow > 0.5 || overflowAbove > 0.5) {
      const cs = getComputedStyle(el);
      bad.push({
        selector: el.className ? `.${String(el.className).trim().split(/\s+/).join(".")}` : el.tagName.toLowerCase(),
        below: Math.round(overflowBelow * 100) / 100,
        above: Math.round(overflowAbove * 100) / 100,
        fontSize: cs.fontSize,
        lineHeight: cs.lineHeight,
      });
    }
  }
  return bad;
};

async function main() {
  const { chromium } = await import("playwright");
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
  let total = 0;
  for (const route of ROUTES) {
    const url = `${base}${route}`;
    const res = await page.goto(url, { waitUntil: "networkidle" });
    if (!res || res.status() >= 400) {
      console.error(`✗ ${route} — did not render (${res?.status()}). Fix the route, do not delete it.`);
      total += 1;
      continue;
    }
    const bad = await page.evaluate(probe, STRESS);
    if (bad.length === 0) {
      console.log(`✓ ${route} — every clipped text box contains its ink`);
      continue;
    }
    total += bad.length;
    for (const b of bad) {
      console.error(
        `✗ ${route} ${b.selector} — ink cut by ${Math.max(b.below, b.above)}px ` +
          `(font-size ${b.fontSize}, line-height ${b.lineHeight})`,
      );
    }
  }
  await browser.close();
  if (total) {
    console.error(
      `\n✗ check:text-ink-clip — ${total} box(es) clip their own text. Raise the line box to ` +
        `--line-height-normal; ellipsis fixes the HORIZONTAL axis, never this one.`,
    );
    process.exit(1);
  }
  console.log("\n✓ check:text-ink-clip — no clipped text boxes.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
