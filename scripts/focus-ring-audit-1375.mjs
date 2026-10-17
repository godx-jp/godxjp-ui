/**
 * gh#1375: keyboard focus audit of the BUILT static preview (no dev server).
 * pnpm build && pnpm preview:build
 * node scripts/focus-ring-audit-1375.mjs before|after
 * Writes every measured stop and every brand/ancestor-clipping finding to codex-shots/.
 * Covers layout/navigation/shell isolates, Logo, and all showcases at 1280 and 390.
 * The audit includes intentionally unmarked scroll regions; it does not silently exempt them.
 * Closed menus/popovers are outside this Tab-only audit; the regression adds RTL and dark mode.
 */
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { writeFileSync } from "node:fs";
import { extname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";
import { isolateRoutes, showcaseRoutes } from "./frame-harness.mjs";

// Shared with the regression: measure the actual focus carrier and each ancestor's clip box.
export function measureFocus() {
  const active = document.activeElement;
  if (!active || active === document.body) return null;
  let el = active;
  if (el.matches(".ui-tag-input-field")) el = el.closest(".ui-tag-input");
  if (el.matches(".ui-command-input")) el = el.closest(".ui-command-input-wrapper");
  if (el.matches(".ui-attachments-input")) el = el.closest(".ui-attachments");
  if (el.matches("input:not(.ui-input):not(.ui-control)"))
    el =
      el.closest(
        ".ui-focus-ring[data-focus-visible],.ui-checkbox,.ui-radio,.ui-switch,.ui-slider-thumb",
      ) || el;
  // input-otp focuses an invisible input and paints its active slot (or grouped frame).
  if (el.matches(".ui-otp-input")) {
    const slot = el.closest(".ui-otp-container")?.querySelector('.ui-otp-slot[data-active="true"]');
    el = slot?.closest('.ui-otp-group[data-appearance="grouped"]') || slot || el;
  }
  const cs = getComputedStyle(el);
  const probe = document.createElement("span");
  probe.style.color = `hsl(${cs.getPropertyValue("--focus-outline-color").trim() || cs.getPropertyValue("--focus-ring-color").trim() || cs.getPropertyValue("--ring").trim()} / ${cs.getPropertyValue("--focus-ring-opacity").trim() || "1"})`;
  document.body.append(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  const width = parseFloat(cs.outlineWidth);
  const offset = parseFloat(cs.outlineOffset);
  const outline = cs.outlineStyle === "solid" && width > 0 && cs.outlineColor === color;
  const ringShadows = cs.boxShadow
    .split(/,(?![^()]*\))/)
    .filter((layer) => color && layer.includes(color) && /0px 0px 0px [\d.]+px/.test(layer));
  const shadow = cs.outlineStyle !== "auto" && ringShadows.length > 0;
  const rect = el.getBoundingClientRect();
  const extent = outline
    ? Math.max(offset, -Math.min(rect.width, rect.height) / 2) + width
    : shadow
      ? Math.max(
          ...ringShadows.map((layer) =>
            layer.includes("inset") ? 0 : Number(layer.match(/0px 0px 0px ([\d.]+)px/)?.[1] || 0),
          ),
        )
      : offset + width;
  const box = {
    left: rect.left - extent,
    right: rect.right + extent,
    top: rect.top - extent,
    bottom: rect.bottom + extent,
  };
  const clipped = [],
    intentionalClips = [];
  // Fixed/portalled affixes escape ordinary ancestor overflow. Only an ancestor
  // establishing their fixed containing block can clip them.
  let fixed = null;
  for (let p = el; p; p = p.parentElement) {
    if (getComputedStyle(p).position === "fixed") {
      fixed = p;
      break;
    }
  }
  let aboveFixed = false;
  for (let p = el.parentElement; p; p = p.parentElement) {
    const s = getComputedStyle(p),
      r = p.getBoundingClientRect();
    if (p === fixed) {
      aboveFixed = true;
      continue;
    }
    if (s.display === "contents" || s.display === "inline") continue;
    if (aboveFixed || fixed === el) {
      const containingBlock =
        s.transform !== "none" ||
        s.perspective !== "none" ||
        s.filter !== "none" ||
        /paint|layout|strict|content/.test(s.contain);
      if (!containingBlock) continue;
      fixed = null;
      aboveFixed = false;
    }
    const margin =
      s.overflowX === "clip" && s.overflowY === "clip" ? parseFloat(s.overflowClipMargin) || 0 : 0;
    const left = r.left + p.clientLeft - margin,
      top = r.top + p.clientTop - margin;
    const right = left + p.clientWidth + 2 * margin,
      bottom = top + p.clientHeight + 2 * margin;
    if (
      (/(hidden|clip|auto|scroll)/.test(s.overflowX) &&
        (box.left < left - 0.75 || box.right > right + 0.75)) ||
      (/(hidden|clip|auto|scroll)/.test(s.overflowY) &&
        (box.top < top - 0.75 || box.bottom > bottom + 0.75))
    ) {
      // Oversized rows and scroll regions intentionally continue offscreen. Count
      // them separately only when an inset perimeter edge is actually visible.
      const row = el.matches("tr.ui-table-row") && rect.width > p.clientWidth;
      const region =
        el.matches(
          ".ui-scroll-area,.ui-table-scroll,.ui-data-table-scroll,.ui-resizable-panel,.app-main,.ui-mobile-shell-main",
        ) &&
        /auto|scroll/.test(cs.overflow) &&
        (rect.width > p.clientWidth || rect.height > p.clientHeight);
      const horizontalEdge =
        box.right > left &&
        box.left < right &&
        ((box.top >= top && box.top < bottom) || (box.bottom > top && box.bottom <= bottom));
      const verticalEdge =
        box.bottom > top &&
        box.top < bottom &&
        ((box.left >= left && box.left < right) || (box.right > left && box.right <= right));
      const intentional =
        outline && offset < 0 && (row || region) && (horizontalEdge || verticalEdge);
      (intentional ? intentionalClips : clipped).push({
        ancestor: p.className || p.tagName,
        overflow: [s.overflowX, s.overflowY],
        box: { left, top, right, bottom },
        ...(intentional
          ? {
              reason: row
                ? "oversized table row; visible inset edge"
                : "oversized scroll region; visible inset edge",
            }
          : {}),
      });
    }
  }
  // Canvas normalises rgb(), oklch() and color(srgb ...) into the same sRGB bytes.
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1;
  const ctx = canvas.getContext("2d");
  const parse = (c) => {
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = c;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
    return [r, g, b, a / 255];
  };
  let bg = [255, 255, 255];
  for (let p = offset < 0 ? el : el.parentElement; p; p = p.parentElement) {
    const c = parse(getComputedStyle(p).backgroundColor);
    if (c.length === 3 || c[3] === 1) {
      bg = c;
      break;
    }
  }
  // A contained ring sits over the surface backing shadow, not a filled control's
  // background. Read the actual inset layer before evaluating that contrast.
  const backing = cs.boxShadow
    .split(/,(?![^()]*\))/)
    .find(
      (layer) =>
        layer.includes("inset") && Number(layer.match(/0px 0px 0px ([\d.]+)px/)?.[1] || 0) > 0,
    );
  if (offset < 0 && backing) {
    const paint = backing.match(/(?:rgba?|oklch|color)\([^)]*\)/)?.[0];
    if (paint) bg = parse(paint);
  }
  const lum = (c) =>
    c
      .slice(0, 3)
      .map((v) => v / 255)
      .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
      .reduce((a, v, i) => a + v * [0.2126, 0.7152, 0.0722][i], 0);
  const a = lum(parse(color)),
    b = lum(bg),
    contrast = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  // Test the inner edge against actual text ranges, not the element's padded box.
  const textOverlap = [];
  if (outline && offset < 0 && el.matches('a,button,[role="tab"],[role="link"]')) {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (!node.textContent.trim()) continue;
      // Decorative badges are separately painted/positioned; measure the control's
      // own label, not aria-hidden count overlays or screen-reader-only content.
      if (node.parentElement.closest('[aria-hidden="true"],.sr-only')) continue;
      let positionedDecoration = false;
      for (let p = node.parentElement; p && p !== el; p = p.parentElement)
        if (["absolute", "fixed"].includes(getComputedStyle(p).position))
          positionedDecoration = true;
      if (positionedDecoration) continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      for (const r of range.getClientRects()) {
        if (!r.width || !r.height) continue;
        const text = { left: r.left, right: r.right, top: r.top, bottom: r.bottom };
        // Ranges include truncated/hidden text. Intersect with its own clipping
        // ancestors before checking the four painted border bands.
        for (let p = node.parentElement; p && p !== el; p = p.parentElement) {
          const st = getComputedStyle(p),
            pr = p.getBoundingClientRect();
          if (/hidden|clip|auto|scroll/.test(st.overflowX)) {
            text.left = Math.max(text.left, pr.left);
            text.right = Math.min(text.right, pr.right);
          }
          if (/hidden|clip|auto|scroll/.test(st.overflowY)) {
            text.top = Math.max(text.top, pr.top);
            text.bottom = Math.min(text.bottom, pr.bottom);
          }
        }
        const inner = {
          left: rect.left - offset,
          right: rect.right + offset,
          top: rect.top - offset,
          bottom: rect.bottom + offset,
        };
        const intersects = (l, t, r, b) =>
          text.right > l + 0.75 &&
          text.left < r - 0.75 &&
          text.bottom > t + 0.75 &&
          text.top < b - 0.75;
        if (
          intersects(inner.left - width, inner.top - width, inner.left, inner.bottom + width) ||
          intersects(inner.right, inner.top - width, inner.right + width, inner.bottom + width) ||
          intersects(inner.left, inner.top - width, inner.right, inner.top) ||
          intersects(inner.left, inner.bottom, inner.right, inner.bottom + width)
        )
          textOverlap.push({ text: node.textContent, ...text });
      }
    }
  }
  // At -4px the backing ends exactly at the ring's INNER edge: the adjacent
  // pixels there are the control fill, not the backing used by the old probe.
  const fill = parse(cs.backgroundColor);
  const fillLum = lum(fill);
  const filledContrast = (Math.max(a, fillLum) + 0.05) / (Math.min(a, fillLum) + 0.05);
  const filledContrastFailure =
    outline &&
    offset < 0 &&
    fill[3] === 1 &&
    el.matches('button,.ui-button,[role="button"]') &&
    filledContrast < 3;
  return {
    tag: el.tagName,
    classes: el.getAttribute("class") || "",
    text: (el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 90),
    brand: outline || shadow,
    outline: cs.outline,
    offset,
    shadow: cs.boxShadow,
    color,
    contrast,
    textOverlap,
    filledContrast,
    filledContrastFailure,
    clipped,
    intentionalClips,
    rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
  };
}
export async function staticServer() {
  const root = resolve(process.env.FOCUS_AUDIT_ROOT || "preview/dist");
  const server = createServer(async (req, res) => {
    try {
      const path = new URL(req.url, "http://local").pathname;
      const file = path.startsWith("/isolate/")
        ? "isolate.html"
        : path.startsWith("/showcase/")
          ? "showcase.html"
          : path.startsWith("/frame/")
            ? "frame.html"
            : path === "/"
              ? "index.html"
              : path.slice(1);
      const mime = {
        ".js": "text/javascript",
        ".css": "text/css",
        ".html": "text/html",
        ".json": "application/json",
        ".svg": "image/svg+xml",
        ".woff2": "font/woff2",
      };
      res.setHeader("Content-Type", mime[extname(file)] || "application/octet-stream");
      res.end(await readFile(resolve(root, file)));
    } catch {
      res.statusCode = 404;
      res.end("Not found");
    }
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  return {
    base: `http://127.0.0.1:${server.address().port}`,
    close: () => new Promise((r) => server.close(r)),
  };
}
export async function walk(page) {
  await page.waitForFunction(
    () =>
      document.querySelector("#root")?.children.length &&
      !document.querySelector(".preview-runtime-loading"),
  );
  if (await page.locator(".preview-runtime-error").count())
    throw new Error(await page.locator(".preview-runtime-error").innerText());
  await page.waitForTimeout(150);
  // The dropdown showcase deliberately mounts an open menu below the fold for
  // overlay-specific tests. This is a closed-overlay Tab audit: start by closing
  // that menu, otherwise its focus trap prevents visiting the page's controls.
  if (await page.locator('[role="menu"]').count()) await page.keyboard.press("Escape");
  const seen = new Set(),
    samples = [];
  for (let i = 0; i < 500; i++) {
    await page.keyboard.press("Tab");
    // Native focus scrolling can be smooth. Sampling mid-scroll invents clipping;
    // wait until the active box has stopped moving, without changing scroll state.
    await page.evaluate(async () => {
      let previous = "",
        stableSince = performance.now();
      const start = performance.now();
      while (performance.now() - start < 2000) {
        await new Promise(requestAnimationFrame);
        const r = document.activeElement.getBoundingClientRect();
        const key = [r.x, r.y, r.width, r.height].join(",");
        if (key !== previous) {
          previous = key;
          stableSince = performance.now();
        }
        if (performance.now() - start >= 180 && performance.now() - stableSince > 80) break;
      }
    });
    const id = await page.evaluate(() => {
      const e = document.activeElement;
      if (!e || e === document.body) return "body";
      const all = [...document.querySelectorAll("*")];
      return String(all.indexOf(e));
    });
    if (seen.has(id)) break;
    seen.add(id);
    const m = await page.evaluate(measureFocus);
    if (m) samples.push(m);
  }
  return samples;
}
async function main() {
  const phase = process.argv[2] || "before";
  const routes = [
    ...isolateRoutes()
      .filter((s) => /^(layout-|navigation-)|shell|^general-logo|^lab-anchor/.test(s))
      .map((s) => "/isolate/" + s),
    ...showcaseRoutes().map((s) => "/showcase/" + s),
  ];
  const server = await staticServer(),
    browser = await chromium.launch();
  const results = [];
  try {
    await Promise.all(
      Array.from({ length: 4 }, (_, worker) => worker).map(async (worker) => {
        const jobs = [1280, 390].flatMap((width) => routes.map((route) => ({ width, route })));
        for (const { width, route } of jobs.filter((_, i) => i % 4 === worker)) {
          const page = await browser.newPage({
            viewport: { width, height: 900 },
            reducedMotion: "reduce",
          });
          try {
            await page.goto(server.base + route);
            const samples = await walk(page);
            results.push({ route, width, samples });
            writeFileSync(`codex-shots/focus-audit-${phase}-pages.json`, JSON.stringify(results));
            console.log(
              `${width} ${route}: ${samples.length} focused, ${samples.filter((s) => !s.brand || s.clipped.length || s.textOverlap.length || s.filledContrastFailure).length} offenders`,
            );
          } catch (e) {
            results.push({ route, width, error: String(e) });
          }
          await page.close();
        }
      }),
    );
  } finally {
    await browser.close();
    await server.close();
  }
  results.sort((a, b) => b.width - a.width || a.route.localeCompare(b.route));
  const offenders = results.flatMap((r) =>
    (r.samples || [])
      .filter(
        (s) => !s.brand || s.clipped.length || s.textOverlap.length || s.filledContrastFailure,
      )
      .map((s) => ({ route: r.route, width: r.width, ...s })),
  );
  const report = {
    phase,
    routes: routes.length,
    pages: results.length,
    focused: results.reduce((n, r) => n + (r.samples?.length || 0), 0),
    offenders: offenders.length,
    clipped: results.flatMap((r) => r.samples || []).filter((s) => s.clipped.length).length,
    nonBrand: results.flatMap((r) => r.samples || []).filter((s) => !s.brand).length,
    textOverlap: results.flatMap((r) => r.samples || []).filter((s) => s.textOverlap.length).length,
    filledContrast: results.flatMap((r) => r.samples || []).filter((s) => s.filledContrastFailure)
      .length,
    errors: results.filter((r) => r.error),
    findings: offenders,
    contrastFindings: results.flatMap((r) =>
      (r.samples || [])
        .filter((s) => s.brand && s.contrast < 3)
        .map((s) => ({ route: r.route, width: r.width, ...s })),
    ),
    results,
  };
  writeFileSync(`codex-shots/focus-audit-${phase}.json`, JSON.stringify(report, null, 2));
  console.log(
    JSON.stringify({
      phase,
      routes: report.routes,
      pages: report.pages,
      focused: report.focused,
      offenders: report.offenders,
      clipped: report.clipped,
      nonBrand: report.nonBrand,
      textOverlap: report.textOverlap,
      filledContrast: report.filledContrast,
      errors: report.errors,
    }),
  );
  if (report.offenders || report.errors.length) process.exitCode = 1;
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href)
  await main();
