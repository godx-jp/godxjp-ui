#!/usr/bin/env node
// Measures what a component actually does when touched, in real Chromium. Nothing here is a guess.
//
//   node .claude/skills/godxjp-ui-premium-craft/references/motion-probe.mjs \
//     http://localhost:6008/isolate/data-entry-select '[data-slot="select-trigger"]' [outDir]
//
// For the target it: hovers, clicks, captures frames at 0 / 120 / 400 ms, records every running
// animation via document.getAnimations() (type · property · duration · easing · iterations), then
// re-runs the same click with `prefers-reduced-motion: reduce` emulated and records again. It also
// reads the computed focus ring after a keyboard Tab. The verdict lines are the craft rules from
// SKILL.md §4, checked as numbers.
//
// Precondition: the preview is running (`pnpm build && pnpm preview:build`, then serve it; the
// harness port is in scripts/frame-harness.mjs). Pass the /isolate frame of the component you
// changed, never a whole docs page.
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const [url, selector = "button", outDir = "probe-out"] = process.argv.slice(2);
if (!url) {
  console.error("usage: motion-probe.mjs <url> [selector] [outDir]");
  process.exit(2);
}
fs.mkdirSync(outDir, { recursive: true });

const read = (page) =>
  page.evaluate(() =>
    document.getAnimations().map((a) => {
      const t = a.effect?.getComputedTiming?.() ?? {};
      const el = a.effect?.target;
      return {
        type: a.constructor.name,
        property: a.transitionProperty ?? a.animationName ?? "",
        target: el
          ? `${el.tagName.toLowerCase()}[data-slot=${el.getAttribute("data-slot") ?? ""}]`
          : "",
        duration: Math.round(Number(t.duration) || 0),
        easing: a.effect?.getTiming?.().easing ?? "",
        iterations: t.iterations,
        // What actually moves: keyframe properties for an animation, the property for a transition.
        animates: a.transitionProperty
          ? [a.transitionProperty]
          : [
              ...new Set(
                (a.effect?.getKeyframes?.() ?? []).flatMap((k) =>
                  Object.keys(k).filter(
                    (x) => !["offset", "easing", "composite", "computedOffset"].includes(x),
                  ),
                ),
              ),
            ],
      };
    }),
  );

async function run(reducedMotion) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, reducedMotion });
  await page.goto(url, { waitUntil: "networkidle" });
  // A frame may mount an overlay already open (a modal menu makes <body> swallow the pointer).
  await page.keyboard.press("Escape");
  await page.waitForTimeout(200);
  const target = page.locator(selector).first();
  await target.waitFor();
  const box = await target.boundingBox();
  const clip = box && {
    x: Math.max(0, box.x - 160),
    y: Math.max(0, box.y - 120),
    width: Math.min(1280, box.width + 320),
    height: Math.min(800, box.height + 360),
  };
  const transitionAll = await page.evaluate(
    () =>
      [...document.querySelectorAll("body *")].filter((el) => {
        const cs = getComputedStyle(el);
        return (
          cs.transitionProperty.split(",").some((p) => p.trim() === "all") &&
          cs.transitionDuration.split(",").some((d) => parseFloat(d) > 0)
        );
      }).length,
  );
  await target.hover();
  const hover = await read(page);
  // A click that changes nothing means the selector missed (a 1px visually-hidden input, a wrapper):
  // every verdict below would then pass on an untouched page — a false green (gh#1210).
  await page.evaluate(() => {
    window.__probeMutations = 0;
    new MutationObserver((m) => (window.__probeMutations += m.length)).observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
    });
  });
  await target.click();
  const click = await read(page);
  await page.waitForTimeout(50);
  const mutations = await page.evaluate(() => window.__probeMutations);
  const frames = [];
  for (const ms of [0, 120, 400]) {
    if (ms) await page.waitForTimeout(ms === 120 ? 120 : 280);
    const file = path.join(outDir, `${reducedMotion}-click-${ms}.png`);
    if (clip) await page.screenshot({ path: file, clip });
    frames.push(file);
  }
  await page.keyboard.press("Escape");
  await page.mouse.click(2, 2);
  await page.keyboard.press("Tab");
  const focus = await page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return null;
    const cs = getComputedStyle(el);
    return { outline: `${cs.outlineStyle} ${cs.outlineWidth}`, boxShadow: cs.boxShadow };
  });
  await browser.close();
  return { hover, click, frames, focus, transitionAll, mutations };
}

const normal = await run("no-preference");
const reduced = await run("reduce");
const all = [...normal.hover, ...normal.click];
const verdict = {
  "the target responded to the click": normal.mutations > 0,
  "no transition: all": normal.transitionAll === 0,
  "state transitions ≤ 250ms": all
    .filter((a) => a.type === "CSSTransition")
    .every((a) => a.duration <= 250),
  "no infinite animation": all.every((a) => a.iterations !== Infinity),
  "no overshoot easing": all.every(
    (a) => !/cubic-bezier\([^)]*-\d/.test(a.easing) && !/,\s*1\.\d+\s*\)/.test(a.easing),
  ),
  // Reduced motion forbids MOVEMENT (WCAG 2.3.3); a colour or opacity change may stay.
  "reduced motion stops movement": [...reduced.hover, ...reduced.click].every(
    (a) =>
      a.duration <= 1 ||
      !a.animates.some((p) =>
        /transform|translate|scale|rotate|^(top|left|right|bottom|inset)|inline-size|block-size|width|height/.test(
          p,
        ),
      ),
  ),
  "keyboard focus is visible":
    !!normal.focus && (!/^none/.test(normal.focus.outline) || normal.focus.boxShadow !== "none"),
};
fs.writeFileSync(
  path.join(outDir, "probe.json"),
  JSON.stringify({ url, selector, normal, reduced, verdict }, null, 2),
);
for (const [rule, ok] of Object.entries(verdict)) console.log(`${ok ? "✓" : "✗"} ${rule}`);
console.log(
  `animations seen: ${all.map((a) => `${a.property} ${a.duration}ms ${a.easing}`).join(" · ") || "none"}`,
);
process.exit(Object.values(verdict).every(Boolean) ? 0 : 1);
