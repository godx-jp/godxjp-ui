#!/usr/bin/env node
/**
 * CAN THIS COMPONENT SET WEAR A COMPLEX THEME? — the glassmorphism measurement.
 *
 * The owner's framing, and it is the point of the whole exercise: *"đây là 1 phép đo thực tế …
 * để thấy được xem các thể loại component xem có khả năng đối ứng được các theme phức tạp hay
 * ko"*. Glassmorphism is the probe because it demands FOUR properties at once on every surface —
 * a translucent fill, a backdrop blur with saturation, a 1px light edge and a soft wide shadow
 * (docs/GLASSMORPHISM-STANDARD.md §1, from namethatui.com). A component that can take three of
 * the four cannot wear the style, so a per-property yes/no is the only honest score.
 *
 * WHY A SCRIPT AND NOT A SCREENSHOT. "It looks like glass" is exactly the judgement that has been
 * wrong at every step of this batch: the panes were declared fine while five strings on one card
 * measured 2.19–3.05:1, and a blur was reported present on a surface whose computed
 * `backdrop-filter` was `none`. This reads the COMPUTED value of every surface and the COMPOSITED
 * pixel under every string, so the verdict does not depend on anyone's eye.
 *
 * WHAT IT REFUSES TO DO. It does not fix anything and it does not grade on a curve. A surface with
 * no blur knob reports `blur: NONE`, and that is the finding — the measurement is worthless if the
 * thing being measured can be nudged to pass.
 *
 * USAGE
 *   PREVIEW_PORT=6911 pnpm preview          # in one shell
 *   node scripts/measure-glass.mjs 6911     # in another
 *   node scripts/measure-glass.mjs 6911 --json
 */
import { chromium } from "playwright";
import { PNG } from "pngjs";

const PORT = process.argv.find((a) => /^\d+$/.test(a)) ?? "6008";
const AS_JSON = process.argv.includes("--json");
const PAGE = `http://localhost:${PORT}/showcase/glassmorphism`;

/** The surfaces the standard says must be glass. Overlays are opened, not just queried. */
const SURFACES = [
  { name: "Card", sel: '[data-slot="card"]' },
  { name: "Sidebar", sel: ".app-sidebar" },
  { name: "Topbar", sel: ".ui-topbar" },
  { name: "Table", sel: '[data-slot="table"]' },
  { name: "Alert", sel: '[data-slot="alert"]' },
  { name: "Badge", sel: '[data-slot="badge"]' },
  { name: "Segmented", sel: '[data-slot="segmented"]' },
  { name: "Tabs", sel: '[data-slot="tabs-list"]' },
  { name: "Input", sel: ".ui-input-affix-wrapper" },
  { name: "Button", sel: ".ui-button" },
  { name: "Progress", sel: ".ui-progress" },
  { name: "Avatar", sel: ".ui-avatar" },
];

/** Overlays, each with the trigger that opens it. These are where the style matters most (§4). */
const OVERLAYS = [
  { name: "Dialog", open: 'button[aria-haspopup="dialog"]', sel: '[role="dialog"]' },
  { name: "Select listbox", open: 'button[role="combobox"]', sel: '[role="listbox"]' },
  { name: "DropdownMenu", open: 'button[aria-haspopup="menu"]', sel: '[role="menu"]' },
];

const lin = (c) =>
  c
    .map((v) => {
      const x = v / 255;
      return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
    })
    .reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
const ratio = (a, b) => {
  const [hi, lo] = [lin(a), lin(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
const rgbOf = (s) => (s.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
/** An `rgba()`/`color()` with a visible alpha below 1 — translucency, the first signal. */
const alphaOf = (s) => {
  const parts = (s.match(/[\d.]+/g) ?? []).map(Number);
  if (/\/\s*([\d.]+)\s*\)/.test(s)) return Number(/\/\s*([\d.]+)\s*\)/.exec(s)[1]);
  return parts.length >= 4 ? parts[3] : 1;
};

function grade(cs) {
  const blur = cs.backdropFilter && cs.backdropFilter !== "none" ? cs.backdropFilter : null;
  return {
    fill: cs.backgroundColor,
    translucent: alphaOf(cs.backgroundColor) < 0.99,
    blur,
    saturate: blur ? /saturate/.test(blur) : false,
    border: cs.borderTopWidth !== "0px" ? cs.borderTopColor : null,
    shadow: cs.boxShadow && cs.boxShadow !== "none" ? cs.boxShadow.slice(0, 48) : null,
  };
}

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 1,
});
const pageErrors = [];
page.on("pageerror", (e) => pageErrors.push(e.message));
await page.goto(PAGE, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(2500);

const report = { surfaces: {}, overlays: {}, contrast: { pass: 0, fail: [] }, pageErrors };

for (const s of SURFACES) {
  const found = await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const cs = getComputedStyle(el);
    return {
      backgroundColor: cs.backgroundColor,
      backdropFilter: cs.backdropFilter,
      borderTopWidth: cs.borderTopWidth,
      borderTopColor: cs.borderTopColor,
      boxShadow: cs.boxShadow,
    };
  }, s.sel);
  report.surfaces[s.name] = found ? grade(found) : "not rendered on this page";
}

for (const o of OVERLAYS) {
  const trigger = page.locator(o.open).first();
  if ((await trigger.count()) === 0) {
    report.overlays[o.name] = "no trigger on this page";
    continue;
  }
  await trigger.click({ timeout: 4000 }).catch(() => {});
  await page.waitForTimeout(800);
  const found = await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const cs = getComputedStyle(el);
    return {
      backgroundColor: cs.backgroundColor,
      backdropFilter: cs.backdropFilter,
      borderTopWidth: cs.borderTopWidth,
      borderTopColor: cs.borderTopColor,
      boxShadow: cs.boxShadow,
    };
  }, o.sel);
  report.overlays[o.name] = found ? grade(found) : "did not open";
  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);
}

// CONTRAST — the composited pixel under each string, never the declared colour (§3).
const strings = await page.evaluate(() => {
  const out = [];
  for (const el of document.querySelectorAll(
    '[data-slot="card"] *, [data-slot="alert"] *, [data-slot="table"] td *, [data-slot="segmented"] *, .ui-button, .ui-page-header *',
  )) {
    const text = (el.textContent ?? "").trim();
    if (!text || el.children.length) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 18 || r.height < 8 || r.top < 0 || r.bottom > 990) continue;
    out.push({
      text: text.slice(0, 26),
      color: getComputedStyle(el).color,
      box: { x: Math.round(r.x), y: Math.round(r.y + r.height + 3), width: 3, height: 3 },
    });
    if (out.length >= 40) break;
  }
  return out;
});

for (const t of strings) {
  try {
    const png = PNG.sync.read(await page.screenshot({ clip: t.box }));
    const r = ratio([png.data[0], png.data[1], png.data[2]], rgbOf(t.color));
    if (r < 4.5) report.contrast.fail.push({ text: t.text, ratio: +r.toFixed(2) });
    else report.contrast.pass += 1;
  } catch {
    /* a string that cannot be clipped is not a contrast result */
  }
}

await browser.close();

if (AS_JSON) {
  console.log(JSON.stringify(report, null, 2));
} else {
  const row = (n, g) =>
    typeof g === "string"
      ? `  ${n.padEnd(16)} ${g}`
      : `  ${n.padEnd(16)} fill ${g.translucent ? "translucent" : "OPAQUE     "}  blur ${(g.blur ?? "NONE").slice(0, 22).padEnd(22)}  saturate ${g.saturate ? "yes" : "NO "}  edge ${g.border ? "yes" : "NO "}  shadow ${g.shadow ? "yes" : "NO "}`;
  console.log("SURFACES");
  for (const [n, g] of Object.entries(report.surfaces)) console.log(row(n, g));
  console.log("\nOVERLAYS  (opened, not queried)");
  for (const [n, g] of Object.entries(report.overlays)) console.log(row(n, g));
  const total = report.contrast.pass + report.contrast.fail.length;
  console.log(`\nCONTRAST  ${report.contrast.pass}/${total} strings clear WCAG 2.2 AA 4.5:1`);
  for (const f of report.contrast.fail)
    console.log(`  FAIL ${String(f.ratio).padStart(6)}:1  "${f.text}"`);
  const blurred = Object.values(report.surfaces)
    .concat(Object.values(report.overlays))
    .filter((g) => typeof g !== "string" && g.blur).length;
  const graded = Object.values(report.surfaces)
    .concat(Object.values(report.overlays))
    .filter((g) => typeof g !== "string").length;
  console.log(`\nVERDICT   ${blurred}/${graded} surfaces carry a backdrop blur`);
  if (report.pageErrors.length) console.log("page errors:", report.pageErrors.slice(0, 3));
}
