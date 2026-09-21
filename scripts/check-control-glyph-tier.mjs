#!/usr/bin/env node
/**
 * check:control-glyph-tier — no glyph inside a control-sized box may paint above its tier step.
 *
 * WHY THIS GATE EXISTS. Five instances of ONE missing rule shipped in a single week, and every
 * static gate in this repo passed all five:
 *
 *   gh#820   `--form-feedback-icon-size`   a ~32px glyph beside 12px text
 *   gh#841   `.ui-input-addon > svg`       24px in a 32px addon
 *   gh#841   `.ui-input-leading > svg`     …while `.ui-control-affix` next to it was already 16px
 *   gh#845   `.ui-toggle > svg`            24px in a 28px chip — 0.86 of the button's height
 *   gh#845   `.ui-control-trigger > svg`   24px AND 16px inside ONE locale picker
 *
 * The mechanism is one sentence: a component that does not remember to size its own SVG ships
 * Lucide's `width="24"`, because nothing says a glyph inside a control-sized box is a control
 * glyph. `check:token-tiers` reads NAMES and sees nothing — there is no token to name.
 * `check:dist-tokens-resolve` catches a `var()` with no declaration and sees nothing — there is no
 * `var()`. Only a browser can see a glyph that was never sized at all, because the size comes from
 * an attribute on an element nobody wrote a rule for.
 *
 * WHAT IT MEASURES, in one sentence: inside a box that is a CONTROL, an `<svg>` that CSS never
 * sized must not paint above that box's own `--control-icon-size`.
 *
 * ── ARTWORK IS NOT A GLYPH, AND THAT IS THE WHOLE DESIGN PROBLEM ──────────────────────────────
 *
 * A first sweep over all 199 `/isolate/**` frames found 17 off-tier SVG shapes and every single
 * one was ARTWORK — recharts surfaces, QR codes, `ui-logo`, the 32px progress ring. A gate that
 * reports those is 100% noise and gets silenced, which is what nearly happened to
 * `check:frame-overflow` when its first run returned 422 findings of which 420 were `sr-only`.
 *
 * So the gate never asks "is this SVG too big". It asks "is this SVG inside a CONTROL-SIZED BOX",
 * and a control-sized box is defined by three measurements, each of which earns its place by
 * removing a specific false positive that a real sweep produced:
 *
 *   1. IT OWNS ITS HEIGHT.  Shrink the glyph to 1px. If the box shrinks with it, the box was
 *      never a box — it is a wrapper around a picture, and its "control height" was the picture's.
 *      This one measurement removes ARTWORK by construction: artwork IS the content, so its
 *      container collapses without it. It removed 22 of 52 findings on the first run — every one
 *      of them `.ui-attachments-card-placeholder`, a 976x24 span standing in for an `<img>` whose
 *      24px height was the file glyph's own and nothing else. It also removes
 *      `.ui-attachments-upload-btn`, a `<button>` with NO styling at all whose 24x24 box is the
 *      `+` glyph wearing a button: a real defect, but not this one — sizing its glyph down to
 *      16px would shrink the hit target to 16px, which is worse than what it fixes.
 *
 *   2. IT IS ON THE CONTROL-HEIGHT TIER.  Its height is one of `--control-height{,-xs,-sm,-lg}`
 *      (24 / 28 / 32 / 36 at the default density), resolved IN THAT BOX so a density-scoped region
 *      is judged by its own steps. A chart wrapper with a declared 300x160 passes rule 1 and fails
 *      here.
 *
 *   3. IT IS CONTROL CHROME.  It is interactive by TAG or ARIA ROLE — never by class name, because
 *      a class list is the hand-kept thing this gate exists to replace — or it is an affix slot:
 *      a non-interactive element whose PARENT is also on the tier and holds a real control. That
 *      second clause is what reaches `.ui-input-addon` and `.ui-input-leading`, which are `<span>`s
 *      and will never match a role. It is deliberately narrow: `.ui-attachments-card-placeholder`
 *      is also a non-interactive span next to a button, and it is excluded because its parent (the
 *      73px card) is not itself control-shaped.
 *
 * ── AN EXPLICITLY SIZED GLYPH IS CORRECT, NOT A VIOLATION ─────────────────────────────────────
 *
 * `Button` solved this for itself and its pattern must keep winning:
 *
 *     [&_svg:not([class*='size-'])]:size-[var(--button-xs-icon-size)]
 *
 * — an author who sizes a glyph has decided, and the gate has nothing to say. So the violation is
 * not "big"; it is "unsized". That is tested EXACTLY rather than guessed: drop the svg's `width`
 * and `height` attributes and measure again. If nothing moves, CSS was sizing it and the element
 * is fine. If it moves, the attribute was load-bearing and the glyph is painting at whatever its
 * source library happened to default to — which is the defect, verbatim.
 *
 * The consequence is that this gate needs NO BASELINE and has none. Every finding has the same
 * one-line fix (size the glyph), the escape hatch for a legitimately larger glyph is to size it
 * explicitly, and the numbers it compares are integers from a style sheet, not font rasterisation
 * — so unlike `check:frame-overflow` it cannot report a known finding as new on a different
 * machine. It gates at 0.
 *
 * WHERE IT RUNS — `ci-browser-full.yml`, its own job, NOT the merge lane. The sweep is 199
 * navigations, measured at 2m35s locally, and CONTRACT.md L4 gives ci-browser.yml a 5-minute
 * budget that `verify:browser` already spends. This is the same call gh#822's CDP sweep made. The
 * lane is not a dead end: a red nightly on main's HEAD blocks a tag cut at that SHA through
 * npm-publish.yml's `collateral` rule, so the gate is still in the release's proof path — and a
 * NEW unsized glyph arrives with a commit, not with a minute, so catching it within a day is soon
 * enough for a defect that took a week to reach five components.
 *
 * ONE VIEWPORT (1280). A glyph's size does not depend on the viewport unless something made it,
 * and 1280 is where gh#845 was measured. `check:frame-overflow` needs two widths because overflow
 * is a layout fact; this is not.
 */
import { existsSync } from "node:fs";

import {
  DEFAULT_BASE,
  isolateRoutes,
  resolveChromiumExecutable,
  showcaseRoutes,
} from "./frame-harness.mjs";

const base = process.argv.find((a) => a.startsWith("http")) ?? DEFAULT_BASE;
const REPORT = process.argv.includes("--report");
const VIEWPORT = { width: 1280, height: 1000 };

/* Runs INSIDE the page. One string, so there is no build step between what is reviewed and what is
 * measured — the same rule check-frame-overflow.mjs keeps. */
const PROBE = () => {
  /* INTERACTIVE BY TAG OR ROLE, never by class name. The whole defect is that a class list has to
   * be remembered; a gate keyed on one would forget exactly the components the floor forgot. */
  const CONTROL =
    "button,input,select,textarea,summary," +
    [
      "button",
      "switch",
      "checkbox",
      "radio",
      "combobox",
      "tab",
      "menuitem",
      "menuitemcheckbox",
      "menuitemradio",
      "option",
      "spinbutton",
      "searchbox",
      "textbox",
      "slider",
    ]
      .map((r) => `[role="${r}"]`)
      .join(",");

  const TIER = [
    "--control-height-xs",
    "--control-height-sm",
    "--control-height",
    "--control-height-lg",
  ];

  /* Resolve custom properties to PIXELS in a given scope. `getPropertyValue` hands back the
   * specified value — `calc(var(--icon-size-md) * var(--scaling))`, or `1rem` — which parseFloat
   * reads as 1. Only a laid-out element gives the used value, and laying it out inside `host` is
   * what makes a density-scoped region resolve by its own steps rather than the root's. */
  const resolveIn = (host, tokens) => {
    const probe = document.createElement("i");
    probe.style.cssText = "position:absolute;visibility:hidden;padding:0;border:0;display:block";
    host.appendChild(probe);
    const px = tokens.map((t) => {
      probe.style.inlineSize = `var(${t})`;
      return probe.getBoundingClientRect().width;
    });
    probe.remove();
    return px;
  };

  const rootStep = resolveIn(document.body, ["--control-icon-size"])[0] || 16;

  /* Does this box keep its height when the glyph inside it stops taking room? An inline style
   * beats every sheet, so 1px is a floor nothing in the cascade can argue with. */
  const ownsItsHeight = (box, svg, boxHeight) => {
    const saved = svg.getAttribute("style");
    svg.style.setProperty("inline-size", "1px", "important");
    svg.style.setProperty("block-size", "1px", "important");
    const after = box.getBoundingClientRect().height;
    if (saved === null) svg.removeAttribute("style");
    else svg.setAttribute("style", saved);
    return Math.abs(after - boxHeight) <= 0.75;
  };

  /* Did CSS size this glyph, or did its own width/height attribute? Exact, not inferred: take the
   * attributes away and see whether anything moves. */
  const cssSized = (svg, rect) => {
    const w = svg.getAttribute("width");
    const h = svg.getAttribute("height");
    if (w === null && h === null) return true;
    svg.removeAttribute("width");
    svg.removeAttribute("height");
    const after = svg.getBoundingClientRect();
    const same =
      Math.abs(after.width - rect.width) <= 0.5 && Math.abs(after.height - rect.height) <= 0.5;
    if (w !== null) svg.setAttribute("width", w);
    if (h !== null) svg.setAttribute("height", h);
    return same;
  };

  const findings = [];
  for (const svg of document.querySelectorAll("svg")) {
    const rect = svg.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) continue;
    const cs = getComputedStyle(svg);
    if (cs.display === "none" || cs.visibility === "hidden") continue;
    // Cheap prefilter: at or below the root step there is nothing this gate could object to.
    if (rect.height <= rootStep + 0.5) continue;

    // Innermost control-sized ancestor. An svg is never itself a box.
    let box = null;
    let step = 0;
    for (let a = svg.parentElement; a && a !== document.body; a = a.parentElement) {
      const h = a.getBoundingClientRect().height;
      if (h <= 0) continue;
      const [xs, sm, md, lg, icon] = resolveIn(a, [...TIER, "--control-icon-size"]);
      if (![xs, sm, md, lg].some((s) => s > 0 && Math.abs(h - s) <= 0.75)) continue; // rule 2
      const interactive = a.matches(CONTROL);
      const affix =
        !interactive &&
        !a.querySelector(CONTROL) &&
        !!a.parentElement?.querySelector(CONTROL) &&
        (() => {
          const ph = a.parentElement.getBoundingClientRect().height;
          const p = resolveIn(a.parentElement, TIER);
          return p.some((s) => s > 0 && Math.abs(ph - s) <= 0.75);
        })();
      if (!interactive && !affix) continue; // rule 3
      if (!ownsItsHeight(a, svg, h)) continue; // rule 1
      box = a;
      step = icon || rootStep;
      break;
    }
    if (!box) continue;
    if (rect.height <= step + 0.5) continue;
    if (cssSized(svg, rect)) continue;

    findings.push({
      glyph: +rect.height.toFixed(1),
      step: +step.toFixed(2),
      boxHeight: +box.getBoundingClientRect().height.toFixed(1),
      box: (box.className?.toString?.() || box.tagName.toLowerCase()).split(" ")[0],
      icon:
        (svg.className?.baseVal ?? svg.getAttribute("class") ?? "")
          .split(" ")
          .find((c) => c.startsWith("lucide-")) || svg.tagName,
    });
  }
  return findings;
};

async function main() {
  let chromium;
  try {
    ({ chromium } = await import("playwright"));
  } catch (e) {
    if (process.env.CI) throw e;
    console.warn(
      "⚠ check:control-glyph-tier skipped — playwright not installed (browser-only gate).",
    );
    return;
  }
  const { ensurePreviewServer } = await import("./frame-harness.mjs");
  let stopServer;
  try {
    stopServer = await ensurePreviewServer(base);
  } catch (e) {
    if (process.env.CI) throw e;
    console.warn(`⚠ check:control-glyph-tier skipped — ${e.message}.`);
    return;
  }

  const exec = resolveChromiumExecutable();
  const browser = await chromium.launch(exec && existsSync(exec) ? { executablePath: exec } : {});
  const page = await browser.newPage({ viewport: VIEWPORT });
  /* SHOWCASES INCLUDED, unlike every other frame gate. gh#845 was reported from
   * `/showcase/case4-login` with a screenshot, and gh#840–843 the week before from
   * `/showcase/theme-customization`. A showcase is the only place in this repo where the library's
   * controls are assembled the way a consumer assembles them — a locale picker beside a theme
   * toggle beside a field — so it is where a glyph nobody sized is actually SEEN. Measured: the
   * `.ui-control-trigger` half of gh#845 does not appear on ANY `/isolate/**` frame, because no
   * contract frame puts an unsized glyph in a trigger. Sweeping only the contract frames would
   * have missed the picker this gate is named after. */
  const routes = [
    ...isolateRoutes().map((id) => ({ id, url: `/isolate/${id}` })),
    ...showcaseRoutes().map((id) => ({ id: `showcase/${id}`, url: `/showcase/${id}` })),
  ];
  const found = [];
  let missing = 0;

  for (const { id, url } of routes) {
    try {
      await page.goto(`${base}${url}`, { waitUntil: "networkidle", timeout: 30000 });
      await page.waitForTimeout(150);
      /* A route that does not resolve renders a four-word "not found" card, which holds no glyph
       * and would be reported as clean — the way check:contrast once swept two showcases that
       * were never there. This is not decoration: the first run of this gate pointed all 32
       * showcases at `/isolate/showcase-<id>`, every one of them 404'd, and the only thing that
       * said so was this counter reading 32. */
      if (
        await page.evaluate(() =>
          /Preview not found|Failed to load showcase/.test(document.body.innerText),
        )
      ) {
        missing += 1;
        continue;
      }
      for (const f of await page.evaluate(PROBE)) found.push({ url, ...f });
    } catch (e) {
      console.warn(`  ! ${id}: ${e.message.slice(0, 80)}`);
    }
  }
  await page.close();
  await browser.close();
  await stopServer?.();

  /* Grouped by identity, not listed one per instance: the same unsized glyph appears on however
   * many frames happen to demo that component, and 22 copies of one line is the shape that gets a
   * gate ignored. The count of instances is kept beside it so a widening regression is visible. */
  const byIdentity = new Map();
  for (const f of found) {
    const key = `${f.box} · ${f.icon} · ${f.glyph}px in a ${f.boxHeight}px box (step ${f.step}px)`;
    if (!byIdentity.has(key)) byIdentity.set(key, []);
    byIdentity.get(key).push(f.url);
  }

  if (REPORT || byIdentity.size) {
    const verb = byIdentity.size ? "✗ check:control-glyph-tier" : "· check:control-glyph-tier";
    console[byIdentity.size ? "error" : "log"](
      `${verb} — ${byIdentity.size} unsized control glyph(s), ${found.length} instance(s) ` +
        `across ${routes.length} frame(s):\n`,
    );
    for (const [key, ids] of [...byIdentity].sort()) {
      console[byIdentity.size ? "error" : "log"](
        `  ${key}\n      ${ids.length} instance(s), e.g. ${[...new Set(ids)].slice(0, 3).join(", ")}`,
      );
    }
  }

  if (byIdentity.size) {
    console.error(
      `\nNothing in CSS sized these glyphs, so the source library's own width attribute stood.\n` +
        `Size them from the icon tier in the components layer — e.g.\n\n` +
        `  .ui-<part> > svg { inline-size: var(--control-icon-size); ` +
        `block-size: var(--control-icon-size); }\n\n` +
        `A glyph that SHOULD be larger is not exempted, it is sized: an explicit rule (or a ` +
        `\`size-*\`\nutility, the way Button's own ladder works) is what makes it intentional, and ` +
        `this gate\nhas nothing to say about it. ${missing} route(s) did not resolve.`,
    );
    process.exit(1);
  }
  console.log(
    `✓ check:control-glyph-tier — ${routes.length} frame(s) swept at ${VIEWPORT.width}px ` +
      `(${missing} did not resolve), every glyph in a control-sized box is at or below its ` +
      `tier step.`,
  );
}

await main();
