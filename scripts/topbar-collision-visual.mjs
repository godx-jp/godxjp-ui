#!/usr/bin/env node
/**
 * Exercises long JA/EN/VI start + center labels at the DXS acceptance artboards. The center slot
 * remains available at 1440 and follows the package compact-display token at 1024/390/320; the
 * start title and end utilities must never overlap or escape the Topbar allocation — nor may a
 * control be sliced by the slot that holds it (gh#639), which the slot-box checks cannot see.
 */
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import {
  REPO_ROOT,
  ensurePreviewServer,
  loadDeps,
  resolveChromiumExecutable,
} from "./frame-harness.mjs";

const base = (
  process.argv.find((argument) => argument.startsWith("http")) ||
  process.env.TOPBAR_COLLISION_VISUAL_BASE ||
  "http://localhost:6018"
).replace(/\/$/, "");
const evidenceDirectory = path.join(REPO_ROOT, "audit-evidence/topbar-collision");
const locales = ["ja", "en", "vi"];
const viewports = [
  { width: 1440, height: 900 },
  { width: 1024, height: 900 },
  { width: 390, height: 844 },
  // WCAG 2.2 SC 1.4.10's reflow width, and the width godx-jp/id's nightly gate runs at — the bar
  // fit at 390 and sliced its start control at 320 (gh#639), so 390 alone was never the floor.
  { width: 320, height: 568 },
];

const { chromium } = await loadDeps({ axe: false });
const stopServer = await ensurePreviewServer(base);
mkdirSync(evidenceDirectory, { recursive: true });

const browser = await chromium.launch(
  resolveChromiumExecutable() ? { executablePath: resolveChromiumExecutable() } : {},
);
const results = [];

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    const consoleFailures = [];
    page.on("console", (message) => {
      if (message.type() === "error" || message.type() === "warning") {
        consoleFailures.push(`${message.type()}: ${message.text()}`);
      }
    });
    page.on("pageerror", (error) => consoleFailures.push(`pageerror: ${error.message}`));

    await page.goto(`${base}/isolate/layout-topbar`, {
      waitUntil: "networkidle",
      timeout: 30_000,
    });

    for (const locale of locales) {
      await page.getByRole("button", { name: locale.toUpperCase(), exact: true }).click();
      await page.locator(".app-main").evaluate((main) => {
        main.scrollTop = 0;
      });

      const bar = page.locator('[data-slot="topbar"]').first();
      const start = bar.locator('[data-slot="topbar-start"]');
      const center = bar.locator('[data-slot="topbar-center"]');
      const end = bar.locator('[data-slot="topbar-end"]');
      const title = start.locator("[data-demo-topbar-title]");
      const [barBox, startBox, centerBox, endBox, titleBox] = await Promise.all([
        bar.boundingBox(),
        start.boundingBox(),
        center.boundingBox(),
        end.boundingBox(),
        title.boundingBox(),
      ]);

      assert.ok(
        barBox && startBox && endBox && titleBox,
        `${viewport.width}/${locale}: slots missing`,
      );
      assert.ok(
        startBox.x + startBox.width <= endBox.x + 0.5,
        `${viewport.width}/${locale}: start overlaps end`,
      );
      assert.ok(
        endBox.x + endBox.width <= barBox.x + barBox.width + 0.5,
        `${viewport.width}/${locale}: end escaped the bar`,
      );

      const centerDisplay = await center.evaluate((element) => getComputedStyle(element).display);
      if (viewport.width <= 1100) {
        assert.equal(centerDisplay, "none", `${viewport.width}/${locale}: center stayed visible`);
        assert.equal(
          centerBox,
          null,
          `${viewport.width}/${locale}: hidden center retained geometry`,
        );
      } else {
        assert.notEqual(centerDisplay, "none", `${viewport.width}/${locale}: center was hidden`);
        assert.ok(centerBox, `${viewport.width}/${locale}: center has no geometry`);
        assert.ok(
          startBox.x + startBox.width <= centerBox.x + 0.5,
          `${viewport.width}/${locale}: start overlaps center`,
        );
        assert.ok(
          centerBox.x + centerBox.width <= endBox.x + 0.5,
          `${viewport.width}/${locale}: center overlaps end`,
        );
      }

      const titleStyle = await title.evaluate((element) => {
        const style = getComputedStyle(element);
        return {
          overflow: style.overflow,
          textOverflow: style.textOverflow,
          whiteSpace: style.whiteSpace,
        };
      });
      // `clip`, not `hidden` — gh#376 moved the truncation keyword deliberately, because this
      // selector hits whatever the slot's last child is and `hidden` shaves the focus ring off an
      // interactive one (`overflow-clip-margin` is ignored on `hidden`). This gate kept asserting
      // the keyword that was replaced, so it has been failing on the shipped stylesheet ever since.
      assert.deepEqual(titleStyle, {
        overflow: "clip",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      });

      /*
       * THE BOX-LEVEL ASSERTIONS ABOVE CANNOT SEE A SLICED CONTROL (gh#639). Every slot carries
       * `min-width: 0` + `overflow: clip`, so under pressure the slot BOX collapses — to zero, in
       * the measured case — while its children keep their own size and paint outside it, under the
       * next cluster. `start.x + start.width <= end.x` is then satisfied by a slot that is not
       * there, and a consumer's search trigger was left showing 8 of its 36 px (axe target-size:
       * `partiallyObscured`, 8×28) with nothing in this gate to say so.
       *
       * So measure the CONTROLS, not the slots: an interactive cell that leaves its own slot is a
       * collision whatever the slot boxes say.
       */
      const escapees = await bar.evaluate((barElement) => {
        const bad = [];
        for (const slot of barElement.querySelectorAll("[data-slot^='topbar-']")) {
          const slotBox = slot.getBoundingClientRect();
          for (const control of slot.querySelectorAll("button, a, [role='button']")) {
            const box = control.getBoundingClientRect();
            if (box.width === 0 && box.height === 0) continue;
            if (box.left < slotBox.left - 0.5 || box.right > slotBox.right + 0.5) {
              bad.push({
                slot: slot.getAttribute("data-slot"),
                control: control.getAttribute("aria-label") || control.textContent?.trim() || "?",
                visible: +Math.max(0, Math.min(box.right, slotBox.right) - box.left).toFixed(1),
                width: +box.width.toFixed(1),
              });
            }
          }
        }
        return bad;
      });
      assert.deepEqual(
        escapees,
        [],
        `${viewport.width}/${locale}: a control was sliced by its own slot`,
      );

      const documentWidth = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }));
      assert.ok(
        documentWidth.scrollWidth <= documentWidth.clientWidth,
        `${viewport.width}/${locale}: document horizontally overflowed`,
      );

      await page.keyboard.press("Tab");
      const focused = page.locator(":focus");
      assert.ok(
        await focused.isVisible(),
        `${viewport.width}/${locale}: keyboard focus not visible`,
      );

      const screenshot = `${locale}-${viewport.width}x${viewport.height}.png`;
      await page.screenshot({ path: path.join(evidenceDirectory, screenshot) });
      results.push({
        viewport,
        locale,
        bar: barBox,
        start: startBox,
        center: centerBox,
        end: endBox,
        title: titleBox,
        titleStyle,
        documentWidth,
        screenshot,
      });
    }

    assert.deepEqual(consoleFailures, [], `${viewport.width}: browser console was not clean`);
    await context.close();
  }

  writeFileSync(
    path.join(evidenceDirectory, "results.json"),
    `${JSON.stringify({ generatedAt: new Date().toISOString(), base, results }, null, 2)}\n`,
  );
  console.log(
    `PASS Topbar collision: ${viewports.length} viewports x ${locales.length} locales; evidence -> ${path.relative(REPO_ROOT, evidenceDirectory)}`,
  );
} finally {
  await browser.close();
  stopServer();
}
