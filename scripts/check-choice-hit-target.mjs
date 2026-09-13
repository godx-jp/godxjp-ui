#!/usr/bin/env node
import { ensurePreviewServer } from "./frame-harness.mjs";
import { chromium } from "playwright";

/**
 * A CHOICE CONTROL'S PAINTED BOX IS ITS OWN HIT TARGET (gh#476).
 *
 * react-aria-components paints the control on a `<label>` and hides the real `<input>` inside a
 * `VisuallyHidden` span — 1px, clipped, inline-styled, pinned at that label's top-left. So the box
 * a user aims at belongs to the label, and the input a browser's hit test (and every automated
 * click) must reach sits somewhere else, at a different size. Measured on `data-entry-checkbox`
 * before the fix: of 49 points scanned across the 16x16 box **0** reached the input and 46 reached
 * the label, and `check()` / `uncheck()` without `force` timed out on
 * `<label data-slot="checkbox"> intercepts pointer events`. `force: true` passed — the tell that
 * the control works and is merely covered, and the reason a suite "fixed" with `force` keeps a
 * green CI while the user still cannot click the box.
 *
 * jsdom has no hit testing, so no unit test could see any of it; this is the gate that can.
 *
 * ASSERTED for every Checkbox / Radio / Switch / Segmented member of the data-entry frames, in
 * LTR and RTL:
 *   1. the input covers the painted box — same centre, and no smaller than the box minus its
 *      border — instead of a 1px corner;
 *   2. an `elementFromPoint` grid over the box reaches the INPUT everywhere inside the border, and
 *      never a foreign element anywhere on it;
 *   3. `check()` / `uncheck()` without `force` succeed and the state really flips;
 *   4. a real mouse click at the centre toggles EXACTLY once — an overlay that double-toggles
 *      (native click plus react-aria's press) would pass 1-3 and still be broken;
 *   5. the box keeps the size its tokens ask for, so nothing about the paint moved;
 *   6. the keyboard path is untouched: Space toggles, and the focus ring still lands on the
 *      painted box (`data-focus-visible`);
 *   7. THE TWO STATES DO NOT RENDER IDENTICALLY (gh#615).
 *
 * (7) is the one nobody reviews. `Radio` rendered its `<Circle className="ui-radio-icon">`
 * unconditionally — unlike `Checkbox`, which renders its glyph only for `checked || indeterminate`
 * — and no CSS rule read the `data-state` that was sitting right there on the same `<label>`.
 * Measured on `/isolate/data-entry-radio-group`: 4 of 4 UNCHECKED radios painted a 7.2px dot at
 * rgb(0, 113, 189), pixel-identical to the 3 checked ones. Every option looked chosen.
 *
 * The user who reported it said the control "wasn't clickable". It was: the VALUE changed on every
 * click and the screen did not, and at the keyboard those two are one experience. A screenshot of a
 * single selected radio looks perfectly correct — the defect only exists BETWEEN two states, which
 * is exactly what no static review and no single-state snapshot can see, and what this assertion
 * can. Assertions 1–6 all passed throughout.
 */
const port = Number(process.env.PREVIEW_PORT) || 6019;
const base = `http://localhost:${port}`;
const stopServer = await ensurePreviewServer(base);

/** `[frame, selector of the painted box, token pair the box is sized from]` */
const SURFACES = [
  ["data-entry-checkbox", "label.ui-checkbox", ["--checkbox-size", "--checkbox-size"]],
  ["data-entry-radio-group", "label.ui-radio", ["--checkbox-size", "--checkbox-size"]],
  ["data-entry-switch", "label.ui-switch", ["--switch-width", "--switch-height"]],
  ["data-entry-segmented", "label.ui-segmented-item", null],
];

function scan([selector, tokens]) {
  const boxes = [...document.querySelectorAll(selector)];
  if (!boxes.length) throw new Error(`${selector}: nothing rendered`);
  /**
   * A size token in px. The tokens are authored as `calc(1rem * 1)`, so they are resolved the way
   * the browser resolves them — by laying one out — rather than parsed by hand.
   */
  const probe = document.createElement("div");
  probe.style.position = "absolute";
  probe.style.visibility = "hidden";
  document.body.append(probe);
  const px = (value) => {
    probe.style.width = value;
    return parseFloat(getComputedStyle(probe).width);
  };
  const scanned = boxes.map((box, index) => {
    const input = box.querySelector("input");
    if (!input) throw new Error(`${selector}[${index}]: no input`);
    // `elementFromPoint` is VIEWPORT-relative and answers `null` outside it, which would read as
    // "nothing is there" for every control below the fold.
    box.scrollIntoView({ block: "center" });
    const b = box.getBoundingClientRect();
    const i = input.getBoundingClientRect();
    const style = getComputedStyle(box);
    const border = Math.max(parseFloat(style.borderTopWidth) || 0, 1);
    const hits = { input: 0, box: 0, foreign: [] };
    const N = 7;
    // Sampled 1px inside the box: a point ON the edge belongs to whatever is behind it, which
    // says nothing about this control. `ring` is the border itself — the input covers the PADDING
    // box, so those points stay the label's, and a click there still toggles (asserted below).
    for (let x = 0; x < N; x++) {
      for (let y = 0; y < N; y++) {
        const pointX = b.left + 1 + ((b.width - 2) * x) / (N - 1);
        const pointY = b.top + 1 + ((b.height - 2) * y) / (N - 1);
        const el = document.elementFromPoint(pointX, pointY);
        const ring =
          pointX < b.left + border + 1 ||
          pointX > b.right - border - 1 ||
          pointY < b.top + border + 1 ||
          pointY > b.bottom - border - 1;
        const at = `(${Math.round(pointX)},${Math.round(pointY)})`;
        if (el === input) hits.input++;
        else if (ring) hits.box++; // the border itself — a click there is asserted separately
        else if (el === box || box.contains(el)) {
          hits.foreign.push(`inner point ${at} → the label, not the input`);
        } else hits.foreign.push(`inner point ${at} → ${el?.tagName ?? "nothing"}`);
      }
    }
    const expected = tokens ? tokens.map((token) => px(style.getPropertyValue(token))) : null;
    return {
      index,
      id: input.id,
      disabled: input.disabled,
      box: [Math.round(b.width), Math.round(b.height)],
      input: [Math.round(i.width), Math.round(i.height)],
      centreOffset: [
        Math.round(i.left + i.width / 2 - (b.left + b.width / 2)),
        Math.round(i.top + i.height / 2 - (b.top + b.height / 2)),
      ],
      covers: i.width >= b.width - 2 * border - 1 && i.height >= b.height - 2 * border - 1,
      // Never SMALLER than its tokens — an overlay that shrank the control would show up here.
      // (A switch carrying a word is wider than the token on purpose, so this is a floor, not an
      // equality; "the paint is byte-identical" is proven by the screenshot comparison in the PR.)
      sizeHeld: expected ? b.width >= expected[0] - 1 && b.height >= expected[1] - 1 : true,
      hits: { input: hits.input, box: hits.box, foreign: hits.foreign.slice(0, 3) },
    };
  });
  probe.remove();
  return scanned;
}

const failures = [];
const summary = [];
let browser;
try {
  browser = await chromium.launch({ headless: true });
  for (const [frame, selector, tokens] of SURFACES) {
    for (const dir of ["ltr", "rtl"]) {
      const page = await browser.newPage({ viewport: { width: 1024, height: 900 } });
      await page.goto(`${base}/isolate/${frame}${dir === "rtl" ? "?dir=rtl" : ""}`, {
        waitUntil: "domcontentloaded",
      });
      await page.locator(selector).first().waitFor();
      await page.evaluate((d) => document.documentElement.setAttribute("dir", d), dir);
      await page.waitForTimeout(200);

      const controls = await page.evaluate(scan, [selector, tokens]);
      for (const control of controls) {
        const where = `${frame} ${dir} #${control.index}${control.id ? ` (${control.id})` : ""}`;
        if (!control.covers) {
          failures.push(`${where}: input ${control.input} does not cover box ${control.box}`);
        }
        if (Math.abs(control.centreOffset[0]) > 1 || Math.abs(control.centreOffset[1]) > 1) {
          failures.push(`${where}: input is off-centre by ${control.centreOffset}`);
        }
        if (!control.sizeHeld) failures.push(`${where}: painted box ${control.box} left its tokens`);
        if (control.hits.foreign.length) {
          failures.push(`${where}: ${control.hits.foreign.join(", ")}`);
        }
        if (control.hits.input === 0) failures.push(`${where}: no grid point reached the input`);
      }

      // Actionability + a single toggle per click. A radio cannot be unchecked, so the subject is
      // an UNCHECKED member wherever the group is single-select.
      const states = await page
        .locator(selector)
        .evaluateAll((nodes) => nodes.map((node) => node.querySelector("input").checked));
      const single = frame === "data-entry-radio-group" || frame === "data-entry-segmented";
      const live =
        controls.find((control) => !control.disabled && (!single || !states[control.index])) ??
        controls.find((control) => !control.disabled);
      const input = page.locator(selector).nth(live.index).locator("input");
      const before = await input.isChecked();
      try {
        if (before) await input.uncheck({ timeout: 2000 });
        else await input.check({ timeout: 2000 });
        if ((await input.isChecked()) === before) {
          failures.push(`${frame} ${dir}: check()/uncheck() returned but the state did not flip`);
        }
      } catch (error) {
        failures.push(`${frame} ${dir}: ${error.message.split("\n")[0]}`);
      }

      /**
       * (7) TWO CONTROLS IN DIFFERENT STATES MUST NOT PAINT THE SAME.
       *
       * Read-only, and deliberately so. The first draft toggled the control and compared before
       * with after; that produced false failures on `Switch`, whose thumb TRANSITIONS — 120ms after
       * the flip the transform had not landed, so a control that plainly does answer read as one
       * that does not. Comparing two controls already sitting in opposite states needs no toggle,
       * no restore and no animation window.
       *
       * Same painted size on both sides, so a size variant can never be mistaken for a state
       * difference. The signature covers the box AND its indicator, because a control may answer
       * with either — Checkbox fills its box, Radio shows a dot, Switch slides a thumb — and an
       * identical signature on both means it answers with NEITHER.
       */
      // Let every transition land first. The toggle above just flipped one control, and `Switch`
      // TWEENS its thumb — read too early and a just-unchecked switch still paints checked, which
      // is how the first draft of this assertion accused a working control twice over.
      //
      // A fixed wait, NOT `getAnimations().finished`: a page with any looping animation on it
      // never settles, and awaiting that hung this gate past ten minutes.
      await page.waitForTimeout(600);

      const distinguishable = await page.locator(selector).evaluateAll((nodes) => {
        const paint = (el) => {
          if (!el) return "absent";
          const cs = getComputedStyle(el);
          return [
            cs.backgroundColor,
            cs.borderColor,
            cs.color,
            cs.opacity,
            cs.visibility,
            cs.display,
            cs.transform,
          ].join("|");
        };
        /**
         * The box AND every element it paints inside, in document order.
         *
         * NOT a named indicator selector: the first draft used
         * `querySelector(".ui-radio-icon, .ui-checkbox-icon, .ui-switch-thumb, .ui-choice-indicator")`
         * and a comma list returns the first match in DOCUMENT order, not in list order — so on a
         * Radio it returned the `.ui-choice-indicator` WRAPPER, whose paint never changes, and
         * reported a working control as identical. Walking the whole subtree cannot pick the wrong
         * element, and it also catches a control that answers somewhere nobody thought to name.
         * The real `<input>` is skipped: it is visually hidden in both states by design.
         */
        const signature = (box) =>
          [box, ...box.querySelectorAll("*")]
            .filter((el) => el.tagName !== "INPUT")
            .map(paint)
            .join("  ::  ");
        const size = (box) => {
          const r = box.getBoundingClientRect();
          return `${Math.round(r.width)}x${Math.round(r.height)}`;
        };

        const buckets = new Map();
        for (const box of nodes) {
          const input = box.querySelector("input");
          if (!input || input.disabled) continue;
          const key = size(box);
          const bucket = buckets.get(key) ?? { on: null, off: null };
          if (input.checked) bucket.on ??= signature(box);
          else bucket.off ??= signature(box);
          buckets.set(key, bucket);
        }
        for (const [key, { on, off }] of buckets) {
          if (on === null || off === null) continue;
          return { compared: key, same: on === off, signature: on };
        }
        return { compared: null };
      });

      if (distinguishable.compared === null) {
        // Not a component failure — a COVERAGE gap. This assertion can only speak when the frame
        // shows both answers at one size, and a frame that never does is a frame where this class
        // of defect is invisible. Name it rather than pass quietly.
        failures.push(
          `${frame} ${dir}: no two same-sized ${selector} in OPPOSITE states on this frame, so ` +
            `"checked and unchecked look different" could not be measured at all (gh#615).`,
        );
      } else if (distinguishable.same) {
        failures.push(
          `${frame} ${dir}: checked and unchecked render IDENTICALLY at ${distinguishable.compared} ` +
            `— ${distinguishable.signature}. The value changes and the screen does not, and users ` +
            `read that as "not clickable" (gh#615).`,
        );
      }

      const fresh = await browser.newPage({ viewport: { width: 1024, height: 900 } });
      await fresh.goto(`${base}/isolate/${frame}${dir === "rtl" ? "?dir=rtl" : ""}`, {
        waitUntil: "domcontentloaded",
      });
      await fresh.locator(selector).first().waitFor();
      await fresh.waitForTimeout(200);
      const freshBox = fresh.locator(selector).nth(live.index);
      const freshInput = freshBox.locator("input");
      const rect = await freshBox.boundingBox();
      const start = await freshInput.isChecked();
      await fresh.mouse.click(rect.x + rect.width / 2, rect.y + rect.height / 2);
      await fresh.waitForTimeout(120);
      const clicked = await freshInput.isChecked();
      // A radio cannot untoggle, so "exactly once" is read as "the first click lands".
      if (clicked === start) {
        failures.push(`${frame} ${dir}: a real click at the centre of the box did nothing`);
      }
      // The 1px border ring is still the label's, and the label still toggles on press — the
      // criterion is "the input, or a node whose click toggles it", at every point of the box.
      const ringState = await freshInput.isChecked();
      // The MIDDLE of the top edge, not the corner: these boxes are rounded (a switch is a pill),
      // so the corner of the bounding box is outside the shape and belongs to whatever is behind.
      await fresh.mouse.click(rect.x + rect.width / 2, rect.y + 0.5);
      await fresh.waitForTimeout(120);
      // Single-select: the centre click above already selected this member, so a second click
      // cannot change anything — there the centre click is the whole statement.
      if ((await freshInput.isChecked()) === ringState && !single) {
        failures.push(`${frame} ${dir}: a click on the border ring of the box did nothing`);
      }
      // Keyboard, unchanged: Space toggles and the ring stays on the painted box.
      await fresh.keyboard.press("Tab");
      await freshInput.focus();
      const focusRing = await freshBox.getAttribute("data-focus-visible");
      const beforeSpace = await freshInput.isChecked();
      await fresh.keyboard.press(" ");
      await fresh.waitForTimeout(120);
      const spaced = await freshInput.isChecked();
      if (focusRing === null) failures.push(`${frame} ${dir}: no data-focus-visible on the box`);
      // A radio and a segment cannot be turned OFF by Space, so there the assertion is that the
      // keyboard still reaches the control at all — which the focus ring above already states.
      if (spaced === beforeSpace && !single) failures.push(`${frame} ${dir}: Space did not toggle`);
      summary.push({
        frame,
        dir,
        controls: controls.length,
        gridPointsOnInput: controls.reduce((sum, c) => sum + c.hits.input, 0),
        box: controls[0].box,
        input: controls[0].input,
      });
      await page.close();
      await fresh.close();
    }
  }
} finally {
  await browser?.close();
  stopServer();
}

if (failures.length) {
  console.error(`✗ choice hit target — ${failures.length} failure(s):\n  ${failures.join("\n  ")}`);
  process.exit(1);
}
console.log(`✓ choice hit target — ${JSON.stringify(summary)}`);
