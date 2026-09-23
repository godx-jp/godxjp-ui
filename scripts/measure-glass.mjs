#!/usr/bin/env node
/**
 * CAN THIS COMPONENT SET WEAR A COMPLEX THEME? — the theme-lab measurement.
 *
 * The owner's framing, and it is the point of the whole exercise: *"đây là 1 phép đo thực tế …
 * để thấy được xem các thể loại component xem có khả năng đối ứng được các theme phức tạp hay
 * ko"*. It began as a glassmorphism probe, because glass demands FOUR properties at once on every
 * surface — a translucent fill, a backdrop blur with saturation, a 1px light edge and a soft wide
 * shadow (docs/GLASSMORPHISM-STANDARD.md §1). gh#882 widened it: one theme cannot answer the
 * question and twelve components cannot either, so this now sweeps the whole MATRIX that
 * `/showcase/theme-lab` exposes — every theme × every seed colour — and prints a table per cell.
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
 * ── THE MATRIX COMES FROM THE REGISTRY, NOT FROM THIS FILE ───────────────────────────────────
 * Themes, seeds AND polarity (gh#896) are parsed out of `docs/themes/index.ts`. gh#882 asks that
 * adding a theme cost one CSS file and one row; a matrix hand-listed here would silently keep
 * measuring the old set and report a clean sweep of a theme nobody ships any more. Same reasoning
 * as the generated radius list in `docs/themes/flat.css`: a hand-kept list is what went blind in
 * gh#854. The parser was re-verified against the live file before this row was added (matched
 * `seeds` unchanged and `modes` to exactly `["light", "dark"]`) — the same discipline the docblock
 * below asks of a new selector, applied here to a new REGEX instead.
 *
 * ── POLARITY (gh#896) ─────────────────────────────────────────────────────────────────────────
 * The library ships two colour polarities and this instrument used to have no way to address the
 * dark half of a cell: `?mode=light|dark` on `/showcase/theme-lab` drives `AppProvider`'s own
 * `theme` axis through the page's `ModeRow` switch (`docs/showcase/theme-lab.tsx`), never a class
 * or attribute this script pokes at directly — the page is the only thing that knows how to apply
 * it correctly (through the context, not a direct DOM write; see that file's comment for why).
 *
 * ── SELECTORS: EVERY ONE NAMES THE ELEMENT THAT ACTUALLY PAINTS ──────────────────────────────
 * This instrument has had four of its own selectors wrong, and every one of them made the library
 * look worse than it was — which is the expensive direction, because it sends you off to add a
 * knob that already exists. Probing `[data-slot="table"]` while the blur is on
 * `.ui-data-table-surface`; `[role="listbox"]` instead of `.ui-select-content`; reading
 * `borderTopWidth` alone and reporting the Sidebar as edgeless when its border is on the
 * inline-end; and sampling the "backdrop" at x=4, inside the Sidebar, so the numbers never moved.
 * Each row below was re-checked against the `backdrop-filter:` call site in `src/styles/**`
 * (grep: `backdrop-filter: blur(var(`), and the backdrop sampler now finds its own column at
 * runtime and refuses to report a band it could not sample cleanly.
 *
 * OVERLAY TRIGGERS ARE ADDRESSED BY `data-probe`, not by accessible name. The preview's default
 * locale is `vi`, so a regex against "dialog" matched nothing and printed "did not open" — which,
 * in the output, is indistinguishable from a dialog that is genuinely broken.
 *
 * USAGE
 *   PREVIEW_PORT=6811 pnpm preview              # in one shell
 *   node scripts/measure-glass.mjs 6811         # in another: the whole matrix
 *   node scripts/measure-glass.mjs 6811 --theme=glass --seed=navy --mode=dark
 *   node scripts/measure-glass.mjs 6811 --json
 *   node scripts/measure-glass.mjs 6811 --shots # also write audit-evidence/theme-lab/*.png
 */
import { chromium } from "playwright";
import { PNG } from "pngjs";
import { readFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const PORT = process.argv.find((a) => /^\d+$/.test(a)) ?? "6008";
const AS_JSON = process.argv.includes("--json");
const WITH_SHOTS = process.argv.includes("--shots");
const only = (flag) => {
  const hit = process.argv.find((a) => a.startsWith(`--${flag}=`));
  return hit ? hit.slice(flag.length + 3).split(",") : null;
};
const ONLY_THEMES = only("theme");
const ONLY_SEEDS = only("seed");
const ONLY_MODES = only("mode");
const SHOT_DIR = join(ROOT, "audit-evidence", "theme-lab");

/** Themes, seeds and polarities, read from the registry the page itself reads (see the docblock). */
function readMatrix() {
  const src = readFileSync(join(ROOT, "docs", "themes", "index.ts"), "utf8");
  const themesBlock = src.slice(
    src.indexOf("export const THEMES"),
    src.indexOf("export const SEEDS"),
  );
  const seedsBlock = src.slice(
    src.indexOf("export const SEEDS"),
    src.indexOf("export const MODES"),
  );
  const modesBlock = src.slice(src.indexOf("export const MODES"));
  const themes = [...themesBlock.matchAll(/\{\s*id:\s*(null|"([a-z0-9-]+)")/g)].map(
    (m) => m[2] ?? "base",
  );
  const seeds = [
    ...seedsBlock.matchAll(/\{\s*id:\s*"([a-z0-9-]+)",\s*hex:\s*"(#[0-9A-Fa-f]{6})"/g),
  ].map((m) => ({ id: m[1], hex: m[2] }));
  const modes = [...modesBlock.matchAll(/\{\s*id:\s*"([a-z]+)"/g)].map((m) => m[1]);
  if (!themes.length || !seeds.length || !modes.length) {
    throw new Error(
      "measure-glass: could not parse docs/themes/index.ts. The registry shape changed; fix the " +
        "parser rather than hand-listing the matrix here — a hand-listed matrix keeps measuring a " +
        "theme nobody ships.",
    );
  }
  return { themes, seeds, modes };
}

/**
 * The surfaces the standard says must be able to wear the theme. Each `sel` is the element that
 * PAINTS — verified against the `backdrop-filter: blur(var(…))` call site in `src/styles/**`.
 */
const SURFACES = [
  { name: "Page canvas", sel: ".app-main" },
  { name: "Card", sel: '[data-slot="card"]' },
  { name: "Sidebar", sel: ".app-sidebar" },
  // The bar ROW, not the inset `<Topbar>` component — the FOURTH selector mistake this
  // instrument made, and the one that shows why the list above matters. `.ui-topbar` is the
  // component, which `.app-topbar` insets by `--app-shell-bar-inset` (24px) on each side; the
  // fill and the blur a theme puts on the bar belong on the ROW, because that is the element that
  // reaches both edges (gh#895). Probing the component reported `blur NONE · fill transparent`
  // for a bar measured at `blur(16px) saturate(1.7)` — the verdict read 11/25 blurred against a
  // real 12/25, under-reporting the theme it exists to measure.
  { name: "Topbar", sel: ".app-topbar" },
  { name: "Page header", sel: ".ui-page-header" },
  // The SURFACE, not the <table>: table-layout.css:359 puts the fill and the blur on
  // `.ui-data-table-surface`. Probing `[data-slot="table"]` reported `blur NONE` while the knob
  // was working — the third selector mistake this instrument made.
  { name: "DataTable", sel: ".ui-data-table-surface" },
  { name: "Table", sel: '[data-slot="table"]' },
  { name: "Alert", sel: '[data-slot="alert"]' },
  { name: "Badge", sel: '[data-slot="badge"]' },
  { name: "Segmented", sel: '[data-slot="segmented"]' },
  { name: "Tabs list", sel: '[data-slot="tabs-list"]' },
  // control.css's shared field base — Input, Select trigger, Textarea, TagInput and the pickers
  // all paint their fill and border here, not on `.ui-input-affix-wrapper` (which is layout only).
  { name: "Field", sel: ".ui-control-surface" },
  { name: "Button", sel: ".ui-button" },
  { name: "Progress", sel: ".ui-progress" },
  { name: "Avatar", sel: ".ui-avatar" },
];

/**
 * Overlays, each with the trigger that opens it and the element that paints. §4 of the standard:
 * these are where the style matters most, and they are OPENED, never merely queried.
 */
const OVERLAYS = [
  { name: "Dialog scrim", open: '[data-probe="dialog"]', sel: ".ui-dialog-overlay" },
  { name: "Dialog panel", open: '[data-probe="dialog"]', sel: '[data-slot="dialog-content"]' },
  { name: "AlertDialog", open: '[data-probe="alert-dialog"]', sel: '[data-slot="dialog-content"]' },
  { name: "Sheet scrim", open: '[data-probe="sheet"]', sel: '[data-slot="sheet-overlay"]' },
  { name: "Sheet panel", open: '[data-probe="sheet"]', sel: ".ui-sheet-panel" },
  { name: "Select list", open: "#overlay-select", sel: ".ui-select-content" },
  { name: "DropdownMenu", open: '[data-probe="dropdown"]', sel: ".ui-dropdown-menu-content" },
  { name: "Popover", open: '[data-probe="popover"]', sel: ".ui-popover-content" },
  { name: "Tooltip", open: '[data-probe="tooltip"]', sel: ".ui-tooltip-content", hover: true },
  { name: "Toast", open: '[data-probe="toast"]', sel: "[data-sonner-toast]" },
];

/**
 * Controls whose HOVER and FOCUS states are measured, not just their resting one. Each row is a
 * surface the theme has a documented interaction knob for; the point is to catch a state the theme
 * left at a light-canvas default, which is what all three reported defects were.
 */
const STATES = [
  { name: "Sidebar active", sel: '.app-sidebar .sb-nav-item[data-active="true"]' },
  { name: "Sidebar item", sel: '.app-sidebar .sb-nav-item:not([data-active="true"])' },
  { name: "Topbar item", sel: '.ui-topbar [data-probe="popover"]' },
  { name: "Segmented item", sel: '[data-slot="segmented"] [data-slot="segmented-item"]' },
  { name: "Tabs trigger", sel: '[data-slot="tabs-trigger"]' },
  { name: "Button", sel: ".ui-button" },
  { name: "Button outline", sel: ".ui-button--outline" },
  { name: "Field", sel: ".ui-control-surface" },
  { name: "Table row", sel: ".ui-data-table-surface tbody tr" },
  { name: "MegaMenu trigger", sel: ".ui-mega-menu-trigger" },
  { name: "NavList item", sel: ".ui-nav-list a, .ui-nav-list button" },
  { name: "Anchor link", sel: '[data-slot="anchor-link"]' },
  { name: "Toggle", sel: '[data-slot="toggle"]' },
  { name: "Switch", sel: '[data-slot="switch"]' },
  { name: "Checkbox", sel: '[data-slot="checkbox"]' },
  { name: "Tree node", sel: ".ui-tree-node" },
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
/**
 * `rgb(…)` 0–255 or `color(srgb …)` 0–1 — both to 0–255. The `color()` form is what every
 * relative-colour declaration on this page computes to, so getting the scale wrong here reads a
 * mid-tone as near-black and invents a contrast failure (or hides one).
 */
const rgbOf = (s) => {
  const k = /^color\(/.test(s) ? 255 : 1;
  return (s.match(/[\d.]+/g) ?? []).slice(0, 3).map((v) => Number(v) * k);
};
/** An `rgba()`/`color()` with a visible alpha below 1 — translucency, the first signal. */
const alphaOf = (s) => {
  if (/\/\s*([\d.]+)\s*\)/.test(s)) return Number(/\/\s*([\d.]+)\s*\)/.exec(s)[1]);
  const parts = (s.match(/[\d.]+/g) ?? []).map(Number);
  return parts.length >= 4 ? parts[3] : 1;
};

function grade(cs) {
  const blur = cs.backdropFilter && cs.backdropFilter !== "none" ? cs.backdropFilter : null;
  // ANY SIDE, not just the top. The first version read `borderTopWidth` alone and reported the
  // Sidebar as having no edge — its border is on the inline-end.
  const sides = ["Top", "Right", "Bottom", "Left"];
  const painted = sides.filter(
    (d) => cs[`border${d}Width`] !== "0px" && cs[`border${d}Style`] !== "none",
  );
  const alpha = alphaOf(cs.backgroundColor);
  return {
    fill: cs.backgroundColor,
    // Three states, not two. `rgba(0, 0, 0, 0)` is NOT translucent glass — it is no fill at all,
    // and folding it into "translucent" reported the untouched default theme as 11/25 translucent.
    fillState: alpha < 0.004 ? "none       " : alpha < 0.99 ? "translucent" : "OPAQUE     ",
    translucent: alpha >= 0.004 && alpha < 0.99,
    blur,
    saturate: blur ? /saturate/.test(blur) : false,
    border: painted.length ? `${painted.join("/")} ${cs[`border${painted[0]}Color`]}` : null,
    shadow: cs.boxShadow && cs.boxShadow !== "none" ? cs.boxShadow.slice(0, 48) : null,
    radius: cs.borderTopLeftRadius,
  };
}

/** Read the computed values `grade()` needs, for one selector, in the page. */
const READ_COMPUTED = (sel) => {
  const el = document.querySelector(sel);
  if (!el) return null;
  const cs = getComputedStyle(el);
  return {
    backgroundColor: cs.backgroundColor,
    backdropFilter: cs.backdropFilter,
    borderTopLeftRadius: cs.borderTopLeftRadius,
    ...Object.fromEntries(
      ["Top", "Right", "Bottom", "Left"].flatMap((d) => [
        [`border${d}Width`, cs[`border${d}Width`]],
        [`border${d}Style`, cs[`border${d}Style`]],
        [`border${d}Color`, cs[`border${d}Color`]],
      ]),
    ),
    boxShadow: cs.boxShadow,
  };
};

const VIEWPORT = { width: 1440, height: 1000 };

/*
 * gh#898 — finishing a `{ paintedPointGround: true, x, y }` marker from `groundsOf` (see that
 * function's doc comment). The browser cannot screenshot itself, so this is where the marker
 * becomes a real `[r, g, b]` — and it is done the way the issue's own hand measurement was done,
 * because that is the one method in this file's history with zero documented sampling errors:
 * hide every glyph, take ONE screenshot, read the pixel that was under the text. Nothing is
 * recomposited in Node. The gradient, the blur, the saturate and any nearer translucent layer (an
 * active nav highlight, say) are already IN that pixel — the browser painted them, correctly, for
 * every reason this file's own ancestor-stack model keeps getting selectors and colour spaces
 * wrong trying to reconstruct by hand.
 */
async function resolveGradientGrounds(page, rows) {
  const targets = (rows ?? []).filter((r) => r.grounds && r.grounds.paintedPointGround);
  if (!targets.length) return;
  await page.evaluate(() => {
    if (document.getElementById("__glassHideGlyphs")) return;
    const style = document.createElement("style");
    style.id = "__glassHideGlyphs";
    style.textContent = "* { color: transparent !important; }";
    document.head.appendChild(style);
  });
  await page.waitForTimeout(50);
  const shot = PNG.sync.read(await page.screenshot());
  await page.evaluate(() => document.getElementById("__glassHideGlyphs")?.remove());
  for (const row of targets) {
    const { x, y } = row.grounds;
    if (x < 0 || y < 0 || x >= shot.width || y >= shot.height) {
      row.grounds = null;
      continue;
    }
    const idx = (shot.width * y + x) << 2;
    row.grounds = [[shot.data[idx], shot.data[idx + 1], shot.data[idx + 2]]];
  }
}

async function measureCell(page, mode, theme, seed) {
  const url = `http://localhost:${PORT}/showcase/theme-lab?theme=${theme}&seed=${seed.id}&mode=${mode}`;
  const pageErrors = [];
  const onError = (e) => pageErrors.push(e.message);
  page.on("pageerror", onError);
  await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(1800);

  const report = {
    mode,
    theme,
    seed: seed.id,
    hex: seed.hex,
    url,
    surfaces: {},
    overlays: {},
    states: {},
    contrast: { pass: 0, fail: [], unmeasured: [], unsampledBands: 0, unsampledPanels: [] },
    pageErrors,
  };

  for (const s of SURFACES) {
    const found = await page.evaluate(READ_COMPUTED, s.sel);
    report.surfaces[s.name] = found ? grade(found) : "not rendered on this page";
  }

  /* ── LIFT: IS THE PANE ACTUALLY DISTINGUISHABLE FROM WHAT IS BEHIND IT? ────────────────────
   *
   * The seventh blind spot in this instrument, and the one that mattered most, because it is the
   * signal a reader looks at. `translucent` above counts `alpha < 0.99` and nothing else — so a
   * pane painted in almost exactly the backdrop's own colour scored as glass while being, to the
   * eye, no pane at all. Reported as "nó phải kiểu trong suốt blur cao vẫn nhìn thấy layer dưới
   * mờ mờ ảo ảo cơ mà ... như hiện tại là thuần gradient đặc 100% thì ko giống glass".
   *
   * §1 of docs/GLASSMORPHISM-STANDARD.md makes it signal ONE: "frosted translucent panels —
   * semi-transparent with a strong background blur; content behind is visible but softened". A
   * panel you cannot see is not a frosted panel, however correct its alpha is.
   *
   * MEASURED, not declared: the painted pixel just inside the pane's top edge against the painted
   * pixel just outside it. Both come from the same screenshot, so blur, saturate, tint, gradient
   * and every compositing step are already in them — which is the only way to see a lift that is
   * produced by four declarations interacting.
   *
   * THE FLOOR IS 1.2:1 and it is a judgement, so it is written down rather than implied. WCAG has
   * no rule for "a surface must be visible"; 1.4.11's 3:1 is for a BOUNDARY, which glass carries
   * separately as its 1px edge. 1.2 is what separated the two states this measurement was built
   * to tell apart: the dark theme read 1.617 when its pane was a white scrim and 1.137 after the
   * scrim was lost, and at 1.137 the pane is invisible in a screenshot. */
  const LIFT_FLOOR = 1.2;
  /* Back to the top first: earlier stages scroll the page, and a pane whose top edge has gone off
   * screen is rejected below rather than sampled at a guessed coordinate — which would report
   * "not sampleable" for every surface and print nothing at all, the first way this measurement
   * failed. */
  await page.evaluate(() => {
    document.querySelector(".app-main")?.scrollTo(0, 0);
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(250);
  const LIFT_SURFACES = [
    ["Card", '[data-slot="card"]'],
    ["Sidebar", ".app-sidebar"],
    ["Topbar", ".app-topbar"],
    ["DataTable", ".ui-data-table-surface"],
  ];
  report.lift = {};
  for (const [name, sel] of LIFT_SURFACES) {
    const box = await page.evaluate((selector) => {
      const el = document.querySelector(selector);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      if (r.width < 40 || r.height < 24) return null;
      // A column 75% across the pane, clear of a leading icon; 12px inside the top edge and 10px
      // above it. Both must be on screen or the sample is a lie.
      const x = Math.round(r.x + r.width * 0.75);
      return r.y - 10 < 0 || r.y + 12 > window.innerHeight || x < 0 || x > window.innerWidth
        ? null
        : { x, inside: Math.round(r.y + 12), outside: Math.round(r.y - 10) };
    }, sel);
    if (!box) {
      report.lift[name] = "not sampleable on this page";
      continue;
    }
    const shot = await page.screenshot();
    const px = await page.evaluate(
      async ({ dataUrl, box }) => {
        const img = new Image();
        img.src = dataUrl;
        await img.decode();
        const c = document.createElement("canvas");
        c.width = img.width;
        c.height = img.height;
        const g = c.getContext("2d");
        g.drawImage(img, 0, 0);
        const at = (x, y) => [...g.getImageData(x, y, 1, 1).data].slice(0, 3);
        return { inside: at(box.x, box.inside), outside: at(box.x, box.outside) };
      },
      { dataUrl: `data:image/png;base64,${shot.toString("base64")}`, box },
    );
    const lum = ([r, g, b]) => {
      const f = (v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const a = lum(px.inside);
    const b = lum(px.outside);
    const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    report.lift[name] = { ratio: Math.round(ratio * 1000) / 1000, pass: ratio >= LIFT_FLOOR };
  }

  // ── CONTRAST ────────────────────────────────────────────────────────────────────────────────
  // The effective background is computed by COMPOSITING the ancestor chain, never by sampling the
  // pixel under the glyphs. Three screenshot-based attempts failed in three different ways and
  // each produced a confident wrong number: sampling 3px below an element put a table header's
  // ground in the first body row (1.03:1 against light ink on a dark pane — impossible); sampling
  // its top-left landed on a glyph; and taking the modal pixel of the box reported exactly 1:1 for
  // a title, because an inline box hugs its text and the glyphs are then the majority.
  //
  // Compositing cannot see a `background-image`, though, and on the glass theme the base IS one —
  // a four-stop gradient. So the base of the stack is a REAL PIXEL sampled from the page's own
  // painted canvas, once per 50px band. The column is found at RUNTIME inside `.app-main`'s right
  // gutter and each band is verified with `elementFromPoint` to be over the canvas and not over a
  // card; a band that cannot be sampled cleanly is COUNTED AND REPORTED rather than guessed.
  /*
   * THE BACKDROP DOES NOT SCROLL, AND THAT IS WHY EVERY BAND APPLIES TO EVERY STRING.
   *
   * Measured rather than assumed: `.app-main` is the scroller (13 307px of scroll on this page,
   * `document.scrollingElement` scrolls 0), and its `background-attachment` is `scroll` — which,
   * for an element's OWN background, pins it to that element's box and does NOT move it as the
   * content scrolls. Sampling at viewport y=500 returned rgb(21,58,91) at scrollTop 0 and the same
   * rgb(21,58,91) at scrollTop 3000.
   *
   * So a card does not have "a" backdrop: it has whichever band of the gradient it happens to be
   * over when the reader stops scrolling, and over a day it sits over all of them. That is exactly
   * the case docs/GLASSMORPHISM-STANDARD.md §3 legislates — "measure against the WORST region the
   * backdrop can produce, not a convenient sample" — so every string is scored against EVERY band
   * and keeps its LOWEST ratio. An earlier version matched each element to the nearest band by
   * position, which flattered every pane that happened to load over the dark lobe.
   *
   * THE LIMIT, STATED RATHER THAN HIDDEN: the bands come from ONE column, the right gutter of
   * `.app-main`, so they sample the gradient's vertical variation and not the whole two-dimensional
   * field. A lobe centred left of the content and never reaching that column is not in the set. The
   * column is chosen because it is the only strip wide enough to be reliably free of panes at every
   * height; widening it would mean sampling through the content, which is the mistake that made
   * every "backdrop" reading the Sidebar's own fill.
   *
   * THE SIXTH SAMPLING ERROR (gh#898). Everything above assumes the ancestor chain, once it runs
   * out of opaque `background-color`, actually reaches `.app-main`'s own backdrop. It does not
   * always: `.app-sidebar` fills itself with `background: var(--sidebar-surface-background)` —
   * translucent — PLUS `background-image: var(--sidebar-gradient)`, which is what actually fills
   * it, and `groundsOf` never read `backgroundImage`. So the walk climbed straight past the
   * sidebar's own gradient and composited its strings onto all 24 `.app-main` bands, keeping the
   * worst. Sampled: the sidebar's active nav label on
   * `/showcase/theme-lab?theme=glass&seed=azure&mode=light`. Reported: `1.28:1`. Truth, measured a
   * second way — painting every glyph transparent and sampling the pixel actually behind this one —
   * `~9:1`: wrong by roughly a factor of eight, in the direction that makes the library look broken.
   *
   * THE FIRST FIX WAS ALSO WRONG, three times, and every one was caught the same way — by
   * re-measuring, never by reading the diff. (1) It stopped the walk at ANY ancestor with a
   * `background-image`, including `.app-main` — but `.app-main`'s own `backgroundColor` is opaque,
   * so once compositing reaches it the WORST-of-bands math above (correctly) collapses to a single
   * flat colour; the fix short-circuited straight to a fresh pixel search instead, on a canvas
   * covered edge-to-edge by cards with no clean gap in it, and 411 of 562 strings across the five
   * light-glass cells came back UNMEASURED. (2) Even the one string that COULD be sampled — the
   * sidebar label — still recomposited the sampled pixel with the rest of the ancestor stack by
   * hand in Node, and that math itself was untrustworthy: it read `4.44:1` against a hand-measured
   * `~9:1`. (3) Excluding `.app-main` BY NAME instead of fixed that but broke coverage even worse
   * (428 UNMEASURED): in the glass theme `Card` ALSO paints its own `background-image` — a sheen —
   * so the walk stopped there instead, one hop too early. That would be fine if `Card`'s own fill
   * blocked what is behind it, but its `backgroundColor` is only ~12% opaque, so `.app-main`'s
   * scrolling backdrop still shows through it heavily; the sheen does not make `.app-main` stop
   * mattering.
   *
   * THE SHIPPED FIX drops the by-name check for the actual question: is this ancestor OUTSIDE
   * `.app-main`'s subtree, not merely "does it have a background-image". Anything still INSIDE
   * `.app-main` (a Card, its sheen included) keeps composing onto the WORST band exactly as before
   * this issue, because `.app-main`'s background stays pinned to its own box while everything in
   * it — the Card, and whatever the Card lets show through — scrolls past that background. Only a
   * surface with NOTHING of `.app-main` between it and the viewport (`.app-sidebar`, `.app-topbar`
   * — separate grid areas, not part of the scroller) has a single true ground, and for those there
   * is no Node-side compositing at all: hide every glyph on the page with one injected stylesheet,
   * take ONE screenshot, and read the pixel at the string's own on-screen position. Nothing is
   * reconstructed; the browser already composited the gradient, the blur, the saturate and any
   * nearer translucent layer correctly, which is exactly why this method has never produced a
   * documented sampling error and the ancestor-stack model has produced seven.
   */
  const mainRect = await page.evaluate(() => {
    const main = document.querySelector(".app-main") ?? document.body;
    const r = main.getBoundingClientRect();
    return { left: r.left, right: r.right, top: r.top, bottom: r.bottom };
  });

  const bands = [];
  for (
    let y = Math.round(mainRect.top) + 20;
    y < Math.min(mainRect.bottom, VIEWPORT.height) - 10;
    y += 40
  ) {
    let sampled = null;
    for (const dx of [6, 10, 16, 24]) {
      const x = Math.round(mainRect.right - dx);
      if (x <= mainRect.left) continue;
      const clean = await page.evaluate(
        ([px, py]) => {
          const el = document.elementFromPoint(px, py);
          if (!el) return false;
          // Over the canvas, not over a pane: anything inside a painted surface would make the
          // "backdrop" the pane's own fill, which is the mistake that froze the old numbers.
          return !el.closest(
            '[data-slot="card"], [data-slot="alert"], .ui-data-table-surface, .app-sidebar, .app-topbar, .ui-page-header, [data-slot="table"]',
          );
        },
        [x, y],
      );
      if (!clean) continue;
      const shot = await page.screenshot({ clip: { x, y, width: 3, height: 3 } });
      const png = PNG.sync.read(shot);
      sampled = [png.data[0], png.data[1], png.data[2]];
      break;
    }
    // The 2 rows this always drops (checked against a live cell, gh#898): `.ui-page-header`'s hero
    // band is full-bleed at the top of the content, wider than this column's 24px of horizontal
    // slack, so every `dx` lands on it there — a real gap in a single-column sampler, not a bug
    // this fix introduced, and it is COUNTED rather than silently dropped for exactly that reason.
    if (sampled) bands.push(sampled);
    else report.contrast.unsampledBands += 1;
  }
  report.contrast.bands = bands.length;

  /*
   * The walk is INSTALLED once and then called per scope, because the overlays' text is not in the
   * page's subtree at all: every one of them portals to `ThemeScope`'s body-level host, so a
   * single sweep of `[data-theme-style]` measures the page and silently skips exactly the panels
   * the user reported reading straight through. Each overlay is measured while it is OPEN.
   */
  await page.evaluate(() => {
    /*
     * `color(srgb r g b / a)` arrives with channels in 0–1; `rgb()` in 0–255. Relative colour makes
     * the first form ORDINARY on this page — every seed-derived surface computes to it — so this
     * has to be right, and the first version was not: it assumed the `srgb` keyword contributed a
     * leading number and shifted every index by one, reading `color(srgb 0.08 0.054 0.126)` as
     * r=0.054, g=0.126, b=undefined. `undefined * 255` is NaN, NaN propagates through the
     * compositing, and `NaN < 4.5` is FALSE — so every string over a seed-derived opaque surface
     * was silently COUNTED AS PASSING. The Sidebar's active label sat at a real 1.47:1 and the
     * matrix reported 529/530 clean. That is the failure mode this whole script exists to prevent,
     * so the ratio is now range-checked too (see `score`).
     */
    /*
     * THE BROWSER DOES THE COLOUR MATH, because string-parsing computed colours is a losing game.
     * Chromium returns `rgb()`, `rgba()`, `color(srgb …)` in 0–1 AND `oklab(…)` — the last one for
     * anything that went through `color-mix()` or relative colour, which on a seeded page is most
     * of it. Two hand-written parsers got this wrong in a row: the `color(srgb)` branch shifted
     * every channel by one, and `oklab(0.9157 0.0062 -0.0096 / 0.7)` read as near-black, which is
     * how a hovered table row was reported at 2.02:1 when it is light grey.
     *
     * A 1×1 canvas accepts every CSS Color 4 form and `getImageData` hands back straight,
     * non-premultiplied sRGB bytes. That is the same pipeline the page itself paints through, so
     * it cannot disagree with what is on screen.
     */
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const parseCache = new Map();
    const parse = (c) => {
      if (!c) return null;
      if (parseCache.has(c)) return parseCache.get(c);
      let out = null;
      try {
        ctx.clearRect(0, 0, 1, 1);
        ctx.fillStyle = "#000";
        ctx.fillStyle = c;
        // An unparseable value leaves `fillStyle` at the previous one, which would silently
        // measure black; comparing against the sentinel catches that instead of inventing a colour.
        if (!(ctx.fillStyle === "#000000" && !/^(#000000|black|rgb\(0, 0, 0\))/.test(c.trim()))) {
          ctx.clearRect(0, 0, 1, 1);
          ctx.fillRect(0, 0, 1, 1);
          const d = ctx.getImageData(0, 0, 1, 1).data;
          out = { r: d[0], g: d[1], b: d[2], a: d[3] / 255 };
        }
      } catch {
        out = null;
      }
      parseCache.set(c, out);
      return out;
    };
    const over = (fg, bg) => ({
      r: fg.a * fg.r + (1 - fg.a) * bg.r,
      g: fg.a * fg.g + (1 - fg.a) * bg.g,
      b: fg.a * fg.b + (1 - fg.a) * bg.b,
      a: 1,
    });
    /*
     * `stopAt` + `base` exist because of a wrong number this instrument produced and printed with
     * a straight face: a Popover title came out at 1.06:1 on the citron seed. The DOM chain was
     * read correctly and the answer was still wrong — a portalled panel's ancestor is `body`,
     * whose `background-color` is the ROOT theme's light canvas, while the panel visually floats
     * over the scope's dark `.app-main`. Compositing up the DOM can only ever see ancestors, and
     * what is painted behind a fixed panel is a SIBLING.
     *
     * So an overlay is given a `base` sampled from a real pixel INSIDE the panel, at a point with
     * no text on it — that pixel already contains the panel's own fill, the scrim under it and the
     * canvas under that — and the walk stops at the panel rather than compositing its fill twice.
     */
    const compose = (stack, ground) => {
      const layers = [...stack, { ...ground, a: 1 }];
      let acc = layers.pop();
      while (layers.length) acc = over(layers.pop(), acc);
      return [Math.round(acc.r), Math.round(acc.g), Math.round(acc.b)];
    };

    /**
     * Every ground this element could composite onto — one per backdrop band, one for a panel's
     * own base pixel, or (gh#898) a single `{ paintedPointGround: true, x, y }` marker when a
     * surface OUTSIDE `.app-main` fills itself with a `background-image` (`.app-sidebar`,
     * `.app-topbar`): that surface has ONE ground and it is not the page's, so the caller resolves
     * the marker into a real `[r, g, b]` by sampling the painted pixel directly, not by compositing.
     *
     * The test is "is this ancestor OUTSIDE `.app-main`'s subtree", not "does it have a
     * background-image" — a first cut used the latter and it was wrong: in the glass theme `Card`
     * ALSO paints its own `background-image` (a sheen), but `Card`'s own `backgroundColor` is only
     * ~12% opaque, so `.app-main`'s scrolling backdrop still shows through it heavily. `.app-main`
     * is the scroll container the band rule exists for (see the CONTRAST section's docblock): its
     * own background stays pinned to its box while its content — every Card in it included — scrolls
     * past that background, so a Card's ground still depends on which band it happens to be over.
     * Only a surface that is NOT a descendant of `.app-main` at all (Sidebar, Topbar — separate grid
     * areas, not part of its scroll region) has nothing shifting behind it, so ONE painted pixel
     * really is its one true ground.
     */
    const groundsOf = (el, stopAt, base, bands) => {
      const stack = [];
      const mainEl = document.querySelector(".app-main");
      for (let n = el; n && n !== document.documentElement && n !== stopAt; n = n.parentElement) {
        const cs = getComputedStyle(n);
        if (cs.backgroundImage !== "none" && !(mainEl && mainEl.contains(n))) {
          const r = el.getBoundingClientRect();
          return {
            paintedPointGround: true,
            x: Math.round(r.left + r.width / 2),
            y: Math.round(r.top + r.height / 2),
          };
        }
        const c = parse(cs.backgroundColor);
        if (c && c.a > 0) stack.push(c);
        if (c && c.a >= 0.999) break;
      }
      if (base) return [compose(stack, { r: base[0], g: base[1], b: base[2] })];
      if (bands?.length) return bands.map((b) => compose(stack, { r: b[0], g: b[1], b: b[2] }));
      const fallback = parse(getComputedStyle(document.documentElement).backgroundColor) ?? {
        r: 255,
        g: 255,
        b: 255,
      };
      return [compose(stack, fallback)];
    };

    /** A short, readable address for a failing node, so a ratio can be gone back to. */
    const pathOf = (el) => {
      const parts = [];
      for (let n = el; n && n !== document.body && parts.length < 4; n = n.parentElement) {
        const slot = n.getAttribute?.("data-slot");
        const cls = [...(n.classList ?? [])].find((c) => c.startsWith("ui-"));
        parts.unshift(slot ? `[${slot}]` : cls ? `.${cls}` : n.tagName.toLowerCase());
      }
      return parts.join(" ");
    };

    /**
     * A point inside `el` that paints only `el` — no glyph, no child surface. The pixel there is
     * the panel's COMPOSITED fill, which is the one thing a screenshot can tell us and compositing
     * cannot. `null` when the panel is too small or too full to find one; the caller then reports
     * the cell rather than guessing, because a guessed ground is how 1.03:1 got printed once.
     */
    window.__glassCleanPoint = (selector) => {
      const el = document.querySelector(selector);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      /*
       * The PADDING RING first, then the interior. A dense panel — a menu, a listbox, a sheet — has
       * a child under almost every interior point, and requiring an empty interior point reported
       * "no clean pixel" for Sheet, Select and DropdownMenu at once. Their padding, 5px in from the
       * border, resolves to the panel element itself and paints exactly its composited fill.
       */
      const ring = [];
      for (const inset of [5, 9, 14]) {
        for (const [fx, fy] of [
          [0, 0],
          [1, 0],
          [0, 1],
          [1, 1],
          [0.5, 0],
          [0.5, 1],
          [0, 0.5],
          [1, 0.5],
        ]) {
          ring.push([
            Math.round(r.left + (r.width - 2 * inset) * fx + inset),
            Math.round(r.top + (r.height - 2 * inset) * fy + inset),
          ]);
        }
      }
      for (const fy of [0.5, 0.15, 0.85]) {
        for (const fx of [0.5, 0.06, 0.94]) {
          ring.push([Math.round(r.left + r.width * fx), Math.round(r.top + r.height * fy)]);
        }
      }
      /*
       * A point is usable when nothing between it and the panel PAINTS: every node from the hit up
       * to the panel must be background-transparent, and no glyph box may cover the point. The
       * earlier, stricter rule (`hit === el`) rejected Dialog, Sheet and Select outright, because a
       * full-width header or list wrapper sits under every one of their padding points while
       * painting nothing at all.
       */
      const transparentTo = (hit) => {
        for (let n = hit; n && n !== el; n = n.parentElement) {
          const cs = getComputedStyle(n);
          if (cs.backgroundImage !== "none") return false;
          const a = /\/\s*([\d.]+)\s*\)/.exec(cs.backgroundColor);
          const parts = (cs.backgroundColor.match(/[\d.]+/g) ?? []).map(Number);
          const alpha = a ? Number(a[1]) : (parts[3] ?? (parts.length ? 1 : 0));
          if (alpha > 0.001) return false;
        }
        return true;
      };
      const glyphAt = (hit, x, y) => {
        for (const node of hit.childNodes) {
          if (node.nodeType !== 3 || !node.textContent.trim()) continue;
          const range = document.createRange();
          range.selectNodeContents(node);
          for (const rect of range.getClientRects()) {
            if (
              x >= rect.left - 2 &&
              x <= rect.right + 2 &&
              y >= rect.top - 2 &&
              y <= rect.bottom + 2
            )
              return true;
          }
        }
        return false;
      };
      for (const [x, y] of ring) {
        if (x < 1 || y < 1 || x > innerWidth - 2 || y > innerHeight - 2) continue;
        const hit = document.elementFromPoint(x, y);
        if (!hit || (hit !== el && !el.contains(hit))) continue;
        if (hit !== el && (!transparentTo(hit) || glyphAt(hit, x, y))) continue;
        return { x, y };
      }
      return null;
    };

    window.__glassContrast = (scopeSelector, base, bands) => {
      const scope = document.querySelector(scopeSelector);
      if (!scope) return null;
      const stopAt = base ? scope : null;
      const out = [];
      for (const el of scope.querySelectorAll("*")) {
        const text = (el.textContent ?? "").trim();
        if (!text || el.children.length) continue;
        const cs = getComputedStyle(el);
        if (cs.visibility === "hidden" || cs.display === "none" || Number(cs.opacity) < 0.1)
          continue;
        const r = el.getBoundingClientRect();
        if (r.width < 8 || r.height < 6) continue;
        // WCAG 2.2 SC 1.4.3 large-text exception: >=24px, or >=18.66px at weight 700+. Applying
        // the 4.5:1 floor to a 32px page title would manufacture failures the standard does not
        // claim, and a measurement that over-reports is as useless as one that under-reports.
        const px = parseFloat(cs.fontSize);
        const bold = Number(cs.fontWeight) >= 700;
        const large = px >= 24 || (px >= 18.66 && bold);
        const inkColour = parse(cs.color);
        out.push({
          text: text.slice(0, 34),
          ink: cs.color,
          // Normalised in the PAGE, through the same canvas, so an `oklab()` ink cannot be
          // re-parsed (wrongly) in Node.
          inkRgb: inkColour ? [inkColour.r, inkColour.g, inkColour.b] : null,
          grounds: groundsOf(el, stopAt, base, bands),
          px: Math.round(px * 10) / 10,
          large,
          where: pathOf(el),
        });
        if (out.length >= 700) break;
      }
      return out;
    };
  });

  const score = (rows, where) => {
    for (const row of rows ?? []) {
      // THE WORST GROUND THE BACKDROP CAN PRODUCE, per docs/GLASSMORPHISM-STANDARD.md §3 — not the
      // one the element happened to load over.
      const ink = row.inkRgb ?? rgbOf(row.ink);
      // gh#898: `row.grounds` is `null` when a gradient ancestor had no pixel clean enough to
      // sample (see `resolveGradientGrounds`) — unmeasured, not a guessed pass or fail.
      const r =
        row.inkRgb && row.grounds ? Math.min(...row.grounds.map((g) => ratio(g, ink))) : Number.NaN;
      const floor = row.large ? 3 : 4.5;
      // A RATIO THAT IS NOT A NUMBER IS NOT A PASS. `NaN < 4.5` is false, so an unparsed colour
      // used to slip through as "clear" — which is how a 1.47:1 label was reported clean. Anything
      // outside WCAG's own 1–21 range means the measurement failed, and that is reported as such.
      if (!Number.isFinite(r) || r < 1 || r > 21.01) {
        report.contrast.unmeasured.push({ in: where, text: row.text, ink: row.ink, at: row.where });
        continue;
      }
      if (r < floor)
        report.contrast.fail.push({
          in: where,
          text: row.text,
          ratio: +r.toFixed(2),
          needs: floor,
          px: row.px,
          at: row.where,
        });
      else report.contrast.pass += 1;
    }
  };

  {
    const rows = await page.evaluate(
      ([sel, known]) => window.__glassContrast(sel, null, known),
      ["[data-theme-style]", bands],
    );
    await resolveGradientGrounds(page, rows);
    score(rows, "page");
  }

  /** The composited fill of an open panel, read from a real pixel with no glyph on it. */
  async function panelBase(sel) {
    const point = await page.evaluate((s) => window.__glassCleanPoint(s), sel);
    if (!point) return null;
    const shot = await page.screenshot({
      clip: { x: point.x - 1, y: point.y - 1, width: 3, height: 3 },
    });
    const png = PNG.sync.read(shot);
    return [png.data[0], png.data[1], png.data[2]];
  }

  // ── OVERLAYS — opened, one at a time, each closed before the next. Both the SURFACE and the
  //    strings ON it are measured while it is open; §4 is the part of the standard that fails
  //    first, and the user reported Dialog and Sheet reading straight through by name. ─────────
  for (const o of OVERLAYS) {
    const trigger = page.locator(o.open).first();
    if ((await trigger.count()) === 0) {
      report.overlays[o.name] = `no trigger matching ${o.open}`;
      continue;
    }
    if (o.hover) await trigger.hover({ timeout: 4000 }).catch(() => {});
    else await trigger.click({ timeout: 4000 }).catch(() => {});
    await page.waitForTimeout(700);
    const found = await page.evaluate(READ_COMPUTED, o.sel);
    report.overlays[o.name] = found ? grade(found) : "did not open";
    if (found && !/scrim/.test(o.name)) {
      const base = await panelBase(o.sel);
      if (base) {
        const rows = await page.evaluate(
          ([s, b]) => window.__glassContrast(s, b, null),
          [o.sel, base],
        );
        await resolveGradientGrounds(page, rows);
        score(rows, o.name);
      } else {
        report.contrast.unsampledPanels.push(o.name);
      }
    }
    await page.keyboard.press("Escape");
    await page.waitForTimeout(350);
    await page.mouse.move(2, 2);
    await page.waitForTimeout(150);
  }

  /*
   * ── INTERACTION STATES — the pass this instrument did not have, and the owner found three
   *    defects by hovering that it reported clean. `agent/tokens.json` carries 55 interaction-state
   *    tokens; the theme was using three of them, and a resting-state-only measurement cannot see
   *    the difference. §3 is the rule being checked: a hovered or unselected state may be a quieter
   *    FILL and a lighter WEIGHT, never lower contrast, so the ink on every state below is scored
   *    against the same 4.5:1 floor as the resting page.
   *
   *    `:focus-visible` needs a KEYBOARD focus, and `element.focus()` does not give one in Chromium
   *    — the heuristic looks at the last input modality. Focusing, then Shift+Tab, then Tab, lands
   *    the same element by keyboard and the pseudo-class matches. Measured: without the Tab dance
   *    every ring read `outline-width: 0px`, which would have been reported as "no focus ring on
   *    any control" — a false finding of exactly the kind this script exists to avoid.
   */
  for (const st of STATES) {
    const target = page.locator(st.sel).first();
    if ((await target.count()) === 0) {
      report.states[st.name] = "not on this page";
      continue;
    }
    await target.scrollIntoViewIfNeeded({ timeout: 4000 }).catch(() => {});
    await page.waitForTimeout(120);

    const rest = await page.evaluate(READ_COMPUTED, st.sel);
    await target.hover({ timeout: 4000, force: true }).catch(() => {});
    await page.waitForTimeout(220);
    const hovered = await page.evaluate(READ_COMPUTED, st.sel);
    const hoverInk = await page.evaluate(
      ([sel, known]) => window.__glassContrast(sel, null, known),
      [st.sel, bands],
    );
    await resolveGradientGrounds(page, hoverInk);
    score(hoverInk, `${st.name}:hover`);

    let ring = null;
    if (st.focusable !== false) {
      await target.focus({ timeout: 3000 }).catch(() => {});
      await page.keyboard.press("Shift+Tab").catch(() => {});
      await page.keyboard.press("Tab").catch(() => {});
      await page.waitForTimeout(180);
      ring = await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        /*
         * WHICH ELEMENT PAINTS THE RING is not the same question as which element HAS FOCUS.
         * Segmented, Switch and Checkbox put focus on a visually-hidden `<input>` and draw the ring
         * on the visible wrapper through `:has(:focus-visible)`, so reading the focused node
         * reported Chromium's own `1px rgb(0, 95, 204)` for all three and would have been filed as
         * "the theme's ring does not reach three controls". Prefer the widest ring among the
         * target, the focused node and the target's own painted ancestors.
         */
        const focused = document.activeElement;
        const candidates = [el, focused].filter(Boolean);
        if (focused && el.contains(focused)) candidates.push(el);
        let best = null;
        for (const node of candidates) {
          const cs = getComputedStyle(node);
          const width = parseFloat(cs.outlineWidth) || 0;
          const shadow = cs.boxShadow && cs.boxShadow !== "none" ? cs.boxShadow : "";
          const score = width + (shadow ? 0.5 : 0);
          if (!best || score > best.score) {
            best = {
              score,
              on: node === el ? "self" : (node.getAttribute("data-slot") ?? node.tagName),
              outlineWidth: cs.outlineWidth,
              outlineColor: cs.outlineColor,
              boxShadow: shadow.slice(0, 72),
            };
          }
        }
        return best;
      }, st.sel);
    }
    await page.mouse.move(2, 2);
    await page.waitForTimeout(100);

    report.states[st.name] = {
      restFill: rest ? rest.backgroundColor : null,
      hoverFill: hovered ? hovered.backgroundColor : null,
      moved: Boolean(rest && hovered && rest.backgroundColor !== hovered.backgroundColor),
      ring,
    };
  }

  if (WITH_SHOTS) {
    mkdirSync(SHOT_DIR, { recursive: true });
    // BACK TO THE TOP FIRST. Opening ten overlays scrolls the page, and the first run wrote
    // fifteen screenshots of the skeleton row — evidence of nothing, from the middle of a page
    // nobody asked about. The shell, the switcher and the seed read-out are what a theme × seed
    // cell has to show.
    await page.evaluate(() => {
      const el = document.querySelector(".app-main");
      if (el) el.scrollTop = 0;
      document.scrollingElement.scrollTop = 0;
    });
    await page.waitForTimeout(400);
    await page.screenshot({
      path: join(SHOT_DIR, `${mode}-${theme}-${seed.id}.png`),
      fullPage: false,
    });
    // One shot with the two overlays the user reported reading straight through, open together is
    // not possible (Dialog traps focus), so Dialog gets its own frame over the same cell.
    await page
      .locator('[data-probe="dialog"]')
      .first()
      .click({ timeout: 4000 })
      .catch(() => {});
    await page.waitForTimeout(700);
    await page.screenshot({ path: join(SHOT_DIR, `${mode}-${theme}-${seed.id}-dialog.png`) });
    await page.keyboard.press("Escape");
    await page.waitForTimeout(350);
  }

  page.off("pageerror", onError);
  return report;
}

const { themes, seeds, modes } = readMatrix();
const cells = [];
// Polarity is the OUTER loop (gh#896): 2 modes × 3 themes × 5 seeds = 30 cells.
for (const mode of modes) {
  if (ONLY_MODES && !ONLY_MODES.includes(mode)) continue;
  for (const theme of themes) {
    if (ONLY_THEMES && !ONLY_THEMES.includes(theme)) continue;
    for (const seed of seeds) {
      if (ONLY_SEEDS && !ONLY_SEEDS.includes(seed.id)) continue;
      cells.push({ mode, theme, seed });
    }
  }
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: VIEWPORT, deviceScaleFactor: 1 });
const reports = [];
for (const cell of cells) reports.push(await measureCell(page, cell.mode, cell.theme, cell.seed));
await browser.close();

if (AS_JSON) {
  console.log(JSON.stringify(reports, null, 2));
} else {
  const row = (n, g) =>
    typeof g === "string"
      ? `  ${n.padEnd(14)} ${g}`
      : `  ${n.padEnd(14)} fill ${g.fillState}  blur ${(g.blur ?? "NONE").slice(0, 22).padEnd(22)}  sat ${g.saturate ? "yes" : "NO "}  edge ${g.border ? "yes" : "NO "}  shadow ${g.shadow ? "yes" : "NO "}  radius ${g.radius}`;

  for (const r of reports) {
    console.log(
      `\n${"=".repeat(96)}\nMODE ${r.mode}   THEME ${r.theme}   SEED ${r.seed} ${r.hex}\n${r.url}`,
    );
    console.log("SURFACES");
    for (const [n, g] of Object.entries(r.surfaces)) console.log(row(n, g));
    console.log("OVERLAYS  (opened, not queried)");
    for (const [n, g] of Object.entries(r.overlays)) console.log(row(n, g));
    console.log("STATES    (hovered and keyboard-focused, not queried at rest)");
    for (const [n, st] of Object.entries(r.states)) {
      if (typeof st === "string") {
        console.log(`  ${n.padEnd(16)} ${st}`);
        continue;
      }
      const ringText = st.ring
        ? st.ring.outlineWidth !== "0px"
          ? `outline ${st.ring.outlineWidth} ${st.ring.outlineColor} on ${st.ring.on}`
          : st.ring.boxShadow && st.ring.boxShadow !== "none"
            ? `shadow ${st.ring.boxShadow.slice(0, 40)}`
            : "NO RING"
        : "not focusable";
      console.log(
        `  ${n.padEnd(16)} hover ${st.moved ? "moves" : "SAME "} ${String(st.hoverFill).slice(0, 34).padEnd(34)}  focus ${ringText}`,
      );
    }
    const total = r.contrast.pass + r.contrast.fail.length;
    console.log(
      `CONTRAST  ${r.contrast.pass}/${total} strings clear WCAG 2.2 AA, worst of ${r.contrast.bands} backdrop band(s)` +
        (r.contrast.unsampledBands
          ? `  (${r.contrast.unsampledBands} backdrop band(s) unsampled)`
          : "") +
        (r.contrast.unsampledPanels.length
          ? `  (no clean pixel in: ${r.contrast.unsampledPanels.join(", ")})`
          : "") +
        (r.contrast.unmeasured.length ? `  (${r.contrast.unmeasured.length} UNMEASURED)` : ""),
    );
    for (const u of r.contrast.unmeasured)
      console.log(`  UNMEASURED  [${u.in}] "${u.text}"  ink ${u.ink}  ← ${u.at}`);
    for (const f of r.contrast.fail)
      console.log(
        `  FAIL ${String(f.ratio).padStart(6)}:1 (needs ${f.needs}:1, ${f.px}px)  [${f.in}] "${f.text}"  ← ${f.at}`,
      );
    const all = Object.values(r.surfaces).concat(Object.values(r.overlays));
    const graded = all.filter((g) => typeof g !== "string");
    console.log(
      `VERDICT   ${graded.filter((g) => g.blur).length}/${graded.length} surfaces carry a backdrop blur · ` +
        `${graded.filter((g) => g.translucent).length}/${graded.length} translucent · ` +
        `${graded.filter((g) => g.shadow).length}/${graded.length} shadowed`,
    );
    const lifts = Object.entries(r.lift ?? {}).filter(([, v]) => typeof v !== "string");
    if (lifts.length) {
      console.log(
        `LIFT      ${lifts.filter(([, v]) => v.pass).length}/${lifts.length} panes are DISTINGUISHABLE from what is behind them (>= 1.2:1)`,
      );
      for (const [name, v] of lifts)
        console.log(`  ${v.pass ? "ok  " : "FLAT"}  ${String(v.ratio).padStart(6)}:1  ${name}`);
    }
    if (r.pageErrors.length) console.log("page errors:", r.pageErrors.slice(0, 3));
  }

  console.log(`\n${"=".repeat(96)}\nMATRIX SUMMARY`);
  for (const r of reports) {
    const total = r.contrast.pass + r.contrast.fail.length;
    console.log(
      `  ${r.mode.padEnd(5)} ${r.theme.padEnd(7)} ${r.seed.padEnd(7)}  contrast ${String(r.contrast.pass).padStart(3)}/${String(total).padEnd(3)}  failures ${r.contrast.fail.length}`,
    );
  }
}
