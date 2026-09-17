#!/usr/bin/env node
/**
 * gh#708 — the three Kanban-board gaps, measured in Chromium against the real docs frames.
 *
 * 1. A draggable card holding a Select: react-aria's hidden native `<select>` container was
 *    `position: fixed`, so under a `contain: paint` region it sat at the REGION's corner and
 *    Chromium's drag image (the dragged box plus every descendant's) reached up to it. Asserted:
 *    the container's rect is inside the card, the clip-aware union of the card's subtree IS the
 *    card, the container adds no document scroll height, the value still reaches a native form
 *    submit, and the `<select>` is neither tabbable nor in the accessibility tree.
 * 2. `ResponsiveGrid flow="columns" align="stretch"`: every lane is as tall as the tallest, the
 *    empty lane included; an unset `align` keeps column flow at `start`.
 * 3. `Select defaultOpen` inside a Popover: the listbox opens below its settled trigger, like a
 *    click-open, and the first option is hit-testable at its centre.
 *
 *     node scripts/kanban-select-visual.mjs [base]      (default http://localhost:6008)
 */
import assert from "node:assert/strict";

import { ensurePreviewServer, loadDeps, resolveChromiumExecutable } from "./frame-harness.mjs";

const base = (
  process.argv.find((argument) => argument.startsWith("http")) ||
  process.env.KANBAN_SELECT_VISUAL_BASE ||
  "http://localhost:6008"
).replace(/\/$/, "");

const { chromium } = await loadDeps({ axe: false });
const stopServer = await ensurePreviewServer(base);
const browser = await chromium.launch(
  resolveChromiumExecutable() ? { executablePath: resolveChromiumExecutable() } : {},
);
const report = {};

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  // ── 1 + 2: the Kanban example ─────────────────────────────────────────────────────────────
  await page.goto(`${base}/isolate/layout-responsive-grid`, {
    waitUntil: "networkidle",
    timeout: 30_000,
  });
  await page.waitForSelector("[data-lane='done']");

  const lanes = await page.evaluate(() =>
    [...document.querySelectorAll("[data-lane]")].map((lane) => ({
      lane: lane.getAttribute("data-lane"),
      height: +lane.getBoundingClientRect().height.toFixed(1),
      tasks: lane.querySelectorAll("[data-task]").length,
    })),
  );
  report.lanes = lanes;
  const tallest = Math.max(...lanes.map((lane) => lane.height));
  for (const lane of lanes) {
    assert.ok(Math.abs(lane.height - tallest) <= 0.5, `lane ${lane.lane} is not stretched`);
  }
  assert.equal(lanes.find((lane) => lane.lane === "done")?.tasks, 0, "the done lane must be empty");

  report.card = await page.evaluate(() => {
    const lanesGrid = document.querySelector("[data-lane]").parentElement;
    // The consumer's shell: a `contain: paint` region at a non-zero offset around the board.
    const region = lanesGrid.closest("[data-slot='card']");
    region.style.contain = "paint";
    const regionBox = region.getBoundingClientRect();
    const card = document.querySelector("[data-task='T-101']");
    const cardBox = card.getBoundingClientRect();
    const native = card.querySelector("select");
    const hidden = native.closest("[aria-hidden='true']");
    const hiddenBox = hidden.getBoundingClientRect();
    const inside = (box, outer) =>
      box.left >= outer.left &&
      box.top >= outer.top &&
      box.right <= outer.right &&
      box.bottom <= outer.bottom;

    // Drag-image proxy: every descendant's rect, clipped by its overflow/clip-path ancestors.
    let [x0, y0, x1, y1] = [cardBox.left, cardBox.top, cardBox.right, cardBox.bottom];
    for (const node of card.querySelectorAll("*")) {
      const box = node.getBoundingClientRect();
      let [l, t, r, b] = [box.left, box.top, box.right, box.bottom];
      for (let up = node.parentElement; up && up !== card; up = up.parentElement) {
        const style = getComputedStyle(up);
        if (style.overflow !== "visible" || style.clipPath !== "none") {
          const clip = up.getBoundingClientRect();
          [l, t, r, b] = [
            Math.max(l, clip.left),
            Math.max(t, clip.top),
            Math.min(r, clip.right),
            Math.min(b, clip.bottom),
          ];
        }
      }
      if (r <= l || b <= t) continue;
      [x0, y0, x1, y1] = [Math.min(x0, l), Math.min(y0, t), Math.max(x1, r), Math.max(y1, b)];
    }

    const scrollWith = document.documentElement.scrollHeight;
    const containers = [...document.querySelectorAll(".ui-select-root > [aria-hidden='true']")];
    for (const node of containers) node.style.setProperty("display", "none", "important");
    const scrollWithout = document.documentElement.scrollHeight;
    for (const node of containers) node.style.removeProperty("display");

    const round = (box) => [box.left, box.top, box.width, box.height].map((v) => +v.toFixed(1));
    return {
      region: round(regionBox),
      card: round(cardBox),
      hidden: round(hiddenBox),
      hiddenPosition: getComputedStyle(hidden).position,
      hiddenInsideCard: inside(hiddenBox, cardBox),
      dragUnion: [x0, y0, x1 - x0, y1 - y0].map((v) => +v.toFixed(1)),
      scrollWith,
      scrollWithout,
      selectTabIndex: native.tabIndex,
      containerAriaHidden: hidden.getAttribute("aria-hidden"),
    };
  });
  const { card } = report;
  assert.equal(card.hiddenPosition, "absolute");
  assert.ok(card.hiddenInsideCard, "the hidden select container left the card");
  card.dragUnion.forEach((value, index) =>
    assert.ok(Math.abs(value - card.card[index]) <= 1, "drag-image box is not the card"),
  );
  assert.equal(card.scrollWith, card.scrollWithout, "hidden selects grew the document");
  assert.equal(card.selectTabIndex, -1);
  assert.equal(card.containerAriaHidden, "true");

  // Not in the accessibility tree: the card exposes exactly one combobox and no native options.
  const aria = await page.locator("[data-task='T-101']").ariaSnapshot();
  report.cardAria = aria;
  assert.equal((aria.match(/combobox/g) ?? []).length, 1, aria);
  assert.ok(!/option/.test(aria), aria);

  // Tab from the trigger never lands on the hidden select.
  await page.locator("[data-task='T-101'] [data-slot='select-trigger']").focus();
  await page.keyboard.press("Tab");
  report.tabFromTrigger = await page.evaluate(() => document.activeElement?.tagName);
  assert.notEqual(report.tabFromTrigger, "SELECT");

  // Native form submit still carries the value.
  report.submitted = await page.evaluate(
    () =>
      new Promise((resolve) => {
        const grid = document.querySelector("[data-lane]").parentElement;
        const form = document.createElement("form");
        grid.parentElement.insertBefore(form, grid);
        form.appendChild(grid);
        form.addEventListener("submit", (event) => {
          event.preventDefault();
          resolve(Object.fromEntries(new FormData(form)));
        });
        form.requestSubmit();
      }),
  );
  assert.equal(report.submitted["priority-T-101"], "high");
  assert.equal(report.submitted["priority-T-103"], "low");

  // Default unchanged: a column-flow grid with no `align` still aligns to start.
  await page.goto(`${base}/isolate/data-display-scroll-area`, {
    waitUntil: "networkidle",
    timeout: 30_000,
  });
  report.defaultColumnsAlign = await page.evaluate(
    () =>
      getComputedStyle(document.querySelector(".ui-responsive-grid[data-flow='columns']"))
        .alignItems,
  );
  assert.equal(report.defaultColumnsAlign, "start");

  // ── 3: Select defaultOpen inside a Popover ──────────────────────────────────────────────────
  await page.goto(`${base}/isolate/data-display-popover`, {
    waitUntil: "networkidle",
    timeout: 30_000,
  });
  const measure = () =>
    page.evaluate(() => {
      const trigger = document.querySelector("[data-picker-trigger]").getBoundingClientRect();
      const listbox = document.querySelector("[data-slot='select-content']");
      const box = listbox.getBoundingClientRect();
      const option = listbox.querySelector("[role='option']");
      const optionBox = option.getBoundingClientRect();
      const hit = document.elementFromPoint(
        optionBox.left + optionBox.width / 2,
        optionBox.top + optionBox.height / 2,
      );
      return {
        triggerTop: +trigger.top.toFixed(1),
        triggerBottom: +trigger.bottom.toFixed(1),
        listboxTop: +box.top.toFixed(1),
        listboxBottom: +box.bottom.toFixed(1),
        placement: listbox.getAttribute("data-placement"),
        firstOptionHit: Boolean(hit && option.contains(hit)),
      };
    });
  // Room below the trigger, so the listbox's own placement is `bottom` — the case that overlapped.
  await page
    .locator("[data-picker-popover]")
    .evaluate((node) => node.scrollIntoView({ block: "start" }));
  // The page shows other popovers open at rest; a press outside dismisses them first, so press
  // until this one is open.
  for (let attempt = 0; attempt < 4; attempt += 1) {
    if (await page.locator("[data-picker-trigger]").count()) break;
    await page.locator("[data-picker-popover]").click();
    await page.waitForTimeout(50);
  }
  await page.waitForSelector("[data-slot='select-content'] [role='option']");
  report.defaultOpenFirstFrame = await measure();
  await page.waitForTimeout(600);
  report.defaultOpenSettled = await measure();
  for (const probe of [report.defaultOpenFirstFrame, report.defaultOpenSettled]) {
    const clear =
      probe.placement === "top"
        ? probe.listboxBottom <= probe.triggerTop
        : probe.listboxTop >= probe.triggerBottom;
    assert.ok(clear, `listbox covers its trigger: ${JSON.stringify(probe)}`);
    assert.ok(probe.firstOptionHit, "first option is covered");
  }

  // Reference: the same Select opened by a click once the popover is at rest.
  await page.keyboard.press("Escape");
  await page.waitForSelector("[data-slot='select-content']", { state: "detached" });
  await page.locator("[data-picker-trigger]").click();
  await page.waitForSelector("[data-slot='select-content'] [role='option']");
  await page.waitForTimeout(600);
  report.clickOpen = await measure();
  assert.ok(
    Math.abs(report.clickOpen.listboxTop - report.defaultOpenSettled.listboxTop) <= 1,
    "defaultOpen and click-open disagree on the listbox position",
  );

  assert.deepEqual(pageErrors, [], "page errors");
  console.log(JSON.stringify(report, null, 2));
  console.log("✓ kanban-select-visual: all gh#708 assertions hold");
} finally {
  await browser.close();
  stopServer();
}
