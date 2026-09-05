#!/usr/bin/env node
/**
 * Captures the package preview at the three canonical artboards for the standalone, one-line and
 * wrapped identity states AND the pending-email confirmation state. The registration column is
 * START-aligned, so at 390x844 the page must actually scroll (a centred tall card would clip its
 * own top above the scroll origin) — asserted below.
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
  process.env.AUTH_REGISTRATION_VISUAL_BASE ||
  "http://localhost:6017"
).replace(/\/$/, "");
const evidenceDirectory = path.join(REPO_ROOT, "audit-evidence/auth-shell-registration");
const states = ["standalone", "one-line", "wrapped", "pending-email"];
const viewports = [
  { width: 1440, height: 900, card: { x: 540, y: 284, width: 360 } },
  { width: 1024, height: 900, card: { x: 332, y: 284, width: 360 } },
  { width: 390, height: 844, card: { x: 15, y: 274, width: 360 } },
];

const closeTo = (actual, expected, label) => {
  assert.ok(
    Math.abs(actual - expected) <= 1,
    `${label}: expected ${expected} +/- 1px, received ${actual}`,
  );
};

const { chromium } = await loadDeps({ axe: false });
const stopServer = await ensurePreviewServer(base);
mkdirSync(evidenceDirectory, { recursive: true });

const browser = await chromium.launch(
  resolveChromiumExecutable() ? { executablePath: resolveChromiumExecutable() } : {},
);
const results = [];

try {
  for (const viewport of viewports) {
    // reducedMotion: the frame wraps its card in <Reveal>, which honours
    // prefers-reduced-motion — measuring with it reduced guarantees the box is settled geometry,
    // not an animation frame.
    const context = await browser.newContext({ viewport, reducedMotion: "reduce" });
    const page = await context.newPage();
    const consoleFailures = [];
    page.on("console", (message) => {
      if (message.type() === "error" || message.type() === "warning") {
        consoleFailures.push(`${message.type()}: ${message.text()}`);
      }
    });
    page.on("pageerror", (error) => consoleFailures.push(`pageerror: ${error.message}`));

    const viewportResults = [];
    for (const state of states) {
      await page.goto(`${base}/isolate/layout-auth-shell-registration?state=${state}`, {
        waitUntil: "networkidle",
        timeout: 30_000,
      });
      // The frame renders TWO cards (the form/pending card, then the organization choice list);
      // the anchor contract is the FIRST one — the column's canonical card.
      const card = await page.locator('[data-slot="card"]').first().boundingBox();
      assert.ok(card, `${viewport.width}x${viewport.height}/${state}: Card was not rendered`);
      closeTo(card.x, viewport.card.x, `${viewport.width}/${state} card x`);
      closeTo(card.y, viewport.card.y, `${viewport.width}/${state} card y`);
      closeTo(card.width, viewport.card.width, `${viewport.width}/${state} card width`);

      const requesterLocator = page.locator('[data-slot="auth-requester"]');
      const requester = (await requesterLocator.count())
        ? await requesterLocator.first().boundingBox()
        : null;
      const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
      const screenshot = `${state}-${viewport.width}x${viewport.height}.png`;
      await page.screenshot({ path: path.join(evidenceDirectory, screenshot) });
      viewportResults.push({ state, card, requester, scrollHeight, screenshot });
    }

    const cardYs = new Set(viewportResults.map(({ card }) => card.y.toFixed(2)));
    assert.equal(
      cardYs.size,
      1,
      `${viewport.width}: identity/pending state moved the Registration card`,
    );
    const oneLine = viewportResults.find(({ state }) => state === "one-line")?.requester;
    const wrapped = viewportResults.find(({ state }) => state === "wrapped")?.requester;
    assert.ok(oneLine && wrapped, `${viewport.width}: requester evidence is incomplete`);
    assert.ok(
      wrapped.height > oneLine.height,
      `${viewport.width}: wrapped requester did not exercise a taller rendered state`,
    );
    if (viewport.width === 390) {
      // The start-aligned long-form contract: at the phone artboard the full form column is
      // taller than the viewport, so the page scrolls instead of clipping its own top.
      const form = viewportResults.find(({ state }) => state === "one-line");
      assert.ok(
        form.scrollHeight > viewport.height,
        `390: the registration column did not exercise long-form scrolling (scrollHeight ${form.scrollHeight})`,
      );
    }
    assert.deepEqual(consoleFailures, [], `${viewport.width}: browser console was not clean`);
    results.push({ viewport, states: viewportResults, consoleFailures });
    await context.close();
  }

  writeFileSync(
    path.join(evidenceDirectory, "results.json"),
    `${JSON.stringify({ generatedAt: new Date().toISOString(), base, results }, null, 2)}\n`,
  );
  console.log(
    `PASS SCR-002 Registration: ${viewports.length} viewports x ${states.length} states; evidence -> ${path.relative(REPO_ROOT, evidenceDirectory)}`,
  );
} finally {
  await browser.close();
  stopServer();
}
