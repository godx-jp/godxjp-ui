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
  // The SURFACE, not the <table>: the frame that paints the fill and the blur is
  // `.ui-data-table-surface` (table-layout.css:380). Probing `[data-slot="table"]` reported
  // `blur NONE` while the knob was working — the third selector mistake this instrument has made,
  // and the reason each surface below names the element that actually paints.
  { name: "Table", sel: '.ui-data-table-surface, [data-slot="table"]' },
  { name: "Alert", sel: '[data-slot="alert"]' },
  { name: "Badge", sel: '[data-slot="badge"]' },
  { name: "Segmented", sel: '[data-slot="segmented"]' },
  { name: "Tabs", sel: '[data-slot="tabs-list"]' },
  { name: "Popover", sel: ".ui-popover-content" },
  { name: "Tooltip", sel: ".ui-tooltip-content" },
  { name: "Input", sel: ".ui-input-affix-wrapper" },
  { name: "Button", sel: ".ui-button" },
  { name: "Progress", sel: ".ui-progress" },
  { name: "Avatar", sel: ".ui-avatar" },
];

/** Overlays, each with the trigger that opens it. These are where the style matters most (§4). */
const OVERLAYS = [
  // Triggers are matched by their ACCESSIBLE NAME, not by `aria-haspopup`. Radix's DialogTrigger
  // does not set that attribute, so an attribute selector matched nothing and the instrument
  // printed "did not open" — which, in the output, is indistinguishable from a dialog that is
  // genuinely broken. A regex against the button's name is what a user would use.
  { name: "Dialog", open: "dialog", sel: '[data-slot="dialog-content"]' },
  { name: "Dialog scrim", open: "dialog", sel: '[data-slot="dialog-overlay"]' },
  { name: "Sheet", open: "sheet", sel: ".ui-sheet-panel" },
  { name: "Select listbox", open: 'button[role="combobox"]', sel: ".ui-select-content" },
  { name: "Tooltip", open: "tooltip", sel: ".ui-tooltip-content", hover: true },
  { name: "Toast", open: "toast", sel: "[data-sonner-toast]" },
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
  // ANY SIDE, not just the top. The first version read `borderTopWidth` alone and reported the
  // Sidebar as having no edge — its border is on the inline-end. Four selector/property mistakes
  // in this instrument so far, every one of them making the library look worse than it is, which
  // is the direction that wastes work: it sends you off to add a knob that already exists.
  const sides = ["Top", "Right", "Bottom", "Left"];
  const painted = sides.filter(
    (d) => cs[`border${d}Width`] !== "0px" && cs[`border${d}Style`] !== "none",
  );
  return {
    fill: cs.backgroundColor,
    translucent: alphaOf(cs.backgroundColor) < 0.99,
    blur,
    saturate: blur ? /saturate/.test(blur) : false,
    border: painted.length ? `${painted.join("/")} ${cs[`border${painted[0]}Color`]}` : null,
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
      ...Object.fromEntries(
        ["Top", "Right", "Bottom", "Left"].flatMap((d) => [
          [`border${d}Width`, cs[`border${d}Width`]],
          [`border${d}Style`, cs[`border${d}Style`]],
          [`border${d}Color`, cs[`border${d}Color`]],
        ]),
      ),
      boxShadow: cs.boxShadow,
    };
  }, s.sel);
  report.surfaces[s.name] = found ? grade(found) : "not rendered on this page";
}

for (const o of OVERLAYS) {
  // `open` is either a CSS selector or a substring of the trigger's visible label.
  const trigger = /[[.#]/.test(o.open)
    ? page.locator(o.open).first()
    : page.getByRole("button", { name: new RegExp(o.open, "i") }).first();
  if ((await trigger.count()) === 0) {
    report.overlays[o.name] = "no trigger on this page";
    continue;
  }
  if (o.hover) await trigger.hover({ timeout: 4000 }).catch(() => {});
  else await trigger.click({ timeout: 4000 }).catch(() => {});
  await page.waitForTimeout(800);
  const found = await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const cs = getComputedStyle(el);
    return {
      backgroundColor: cs.backgroundColor,
      backdropFilter: cs.backdropFilter,
      ...Object.fromEntries(
        ["Top", "Right", "Bottom", "Left"].flatMap((d) => [
          [`border${d}Width`, cs[`border${d}Width`]],
          [`border${d}Style`, cs[`border${d}Style`]],
          [`border${d}Color`, cs[`border${d}Color`]],
        ]),
      ),
      boxShadow: cs.boxShadow,
    };
  }, o.sel);
  report.overlays[o.name] = found ? grade(found) : "did not open";
  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);
}

// CONTRAST — the effective background, computed by COMPOSITING the ancestor chain (§3).
//
// Three screenshot-based attempts failed in three different ways, and each produced a confident
// wrong number: sampling 3px below an element put a table header's ground in the first body row
// (1.03:1 against light ink on a dark pane — impossible); sampling its top-left landed on a
// glyph; and taking the modal pixel of the box reported exactly 1:1 for a title, because an
// inline box hugs its text and the glyphs are then the majority.
//
// So do not sample pixels at all. Walk from the element up, compositing each translucent
// `background-color` over the next until one is opaque. That is deterministic, it is what an
// accessibility checker does, and it can never accidentally measure the ink against itself.
//
// Its one limitation, stated rather than hidden: it does not see `background-image`. A gradient
// or a photograph behind a translucent pane resolves to the last opaque COLOUR beneath it, so on
// a vivid backdrop these ratios are approximations of the worst case, not of every pixel. §3
// asks for the worst region, which is the direction this errs in.
// Sample the painted backdrop once per 50px band, in an empty left margin, so the compositor has
// a real base colour for the gradient rather than a `background-color` nobody ever sees.
const backdropBands = [];
{
  const width = 1440;
  for (let y = 40; y < 1000; y += 50) {
    // x=1430, the far RIGHT margin. The first version sampled x=4 and landed inside the Sidebar,
    // so every "backdrop" reading was the sidebar's own fill and the numbers did not move at all.
    const shot = await page.screenshot({ clip: { x: 1430, y, width: 3, height: 3 } });
    const png = PNG.sync.read(shot);
    backdropBands.push({ y, rgb: [png.data[0], png.data[1], png.data[2]] });
  }
  void width;
}
await page.evaluate((bands) => {
  window.__glassBase = (el) => {
    const mid = el.getBoundingClientRect().top + el.getBoundingClientRect().height / 2;
    let best = bands[0];
    for (const b of bands) if (Math.abs(b.y - mid) < Math.abs(best.y - mid)) best = b;
    return { r: best.rgb[0], g: best.rgb[1], b: best.rgb[2], a: 1 };
  };
}, backdropBands);

const contrastRows = await page.evaluate(() => {
  const parse = (c) => {
    const n = (c.match(/[\d.]+/g) ?? []).map(Number);
    if (!n.length) return null;
    return {
      r: n[0],
      g: n[1],
      b: n[2],
      a: /\/\s*[\d.]+\s*\)/.test(c) ? Number(/\/\s*([\d.]+)\s*\)/.exec(c)[1]) : (n[3] ?? 1),
    };
  };
  const over = (fg, bg) => ({
    r: fg.a * fg.r + (1 - fg.a) * bg.r,
    g: fg.a * fg.g + (1 - fg.a) * bg.g,
    b: fg.a * fg.b + (1 - fg.a) * bg.b,
    a: 1,
  });
  const groundOf = (el) => {
    const stack = [];
    for (let n = el; n && n !== document.documentElement; n = n.parentElement) {
      const c = parse(getComputedStyle(n).backgroundColor);
      if (c && c.a > 0) stack.push(c);
      if (c && c.a >= 0.999) break;
    }
    // THE BASE IS THE PAGE'S PAINTED BACKDROP, sampled — not its `background-color`.
    //
    // Compositing alone cannot see a `background-image`, and on this page the base IS one: a
    // four-stop gradient. Falling back to `--background` composited every translucent pane onto a
    // LIGHT colour that is never on screen, which is how a table header over a dark gradient came
    // out at 1.03:1. `__glassBase` is a pixel sampled from an empty margin at the element's own
    // vertical position, so it tracks the gradient down the page.
    const base = window.__glassBase?.(el) ??
      parse(getComputedStyle(document.documentElement).backgroundColor) ?? {
        r: 255,
        g: 255,
        b: 255,
        a: 1,
      };
    stack.push({ ...base, a: 1 });
    let acc = stack.pop();
    while (stack.length) acc = over(stack.pop(), acc);
    return [Math.round(acc.r), Math.round(acc.g), Math.round(acc.b)];
  };
  const out = [];
  for (const el of document.querySelectorAll(
    '[data-slot="card"] *, [data-slot="alert"] *, [data-slot="table"] th *, [data-slot="table"] td *, [data-slot="segmented"] *, .ui-button, .ui-page-header *',
  )) {
    const text = (el.textContent ?? "").trim();
    if (!text || el.children.length) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 8 || r.height < 6) continue;
    out.push({ text: text.slice(0, 26), ink: getComputedStyle(el).color, ground: groundOf(el) });
    if (out.length >= 50) break;
  }
  return out;
});

for (const row of contrastRows) {
  const r = ratio(row.ground, rgbOf(row.ink));
  if (r < 4.5) report.contrast.fail.push({ text: row.text, ratio: +r.toFixed(2) });
  else report.contrast.pass += 1;
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
