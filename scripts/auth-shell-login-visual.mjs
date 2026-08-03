#!/usr/bin/env node
/**
 * SCR-001 AuthShell Login preset visual contract (gh#237).
 *
 * Captures the package preview at the three canonical artboards for standalone, one-line requester
 * and wrapped requester states. Bounding-box assertions make the screenshots executable evidence:
 * requester height may change, while card x/y/width must remain invariant.
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
  process.env.AUTH_LOGIN_VISUAL_BASE ||
  "http://localhost:6017"
).replace(/\/$/, "");
const evidenceDirectory = path.join(REPO_ROOT, "audit-evidence/auth-shell-login");
const states = ["standalone", "one-line", "wrapped"];
const viewports = [
  { width: 1440, height: 900, card: { x: 540, y: 363, width: 360 } },
  { width: 1024, height: 900, card: { x: 332, y: 363, width: 360 } },
  { width: 390, height: 844, card: { x: 15, y: 353, width: 360 } },
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
    const context = await browser.newContext({ viewport });
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
      await page.goto(`${base}/isolate/layout-auth-shell?state=${state}`, {
        waitUntil: "networkidle",
        timeout: 30_000,
      });
      const card = await page.locator('[data-slot="card"]').boundingBox();
      assert.ok(card, `${viewport.width}x${viewport.height}/${state}: Card was not rendered`);
      closeTo(card.x, viewport.card.x, `${viewport.width}/${state} card x`);
      closeTo(card.y, viewport.card.y, `${viewport.width}/${state} card y`);
      closeTo(card.width, viewport.card.width, `${viewport.width}/${state} card width`);

      const requesterLocator = page.locator('[data-slot="auth-requester"]');
      const requester = (await requesterLocator.count())
        ? await requesterLocator.boundingBox()
        : null;
      const screenshot = `${state}-${viewport.width}x${viewport.height}.png`;
      await page.screenshot({ path: path.join(evidenceDirectory, screenshot) });
      viewportResults.push({ state, card, requester, screenshot });
    }

    const cardYs = new Set(viewportResults.map(({ card }) => card.y.toFixed(2)));
    assert.equal(cardYs.size, 1, `${viewport.width}: requester state moved the Login card`);
    const oneLine = viewportResults.find(({ state }) => state === "one-line")?.requester;
    const wrapped = viewportResults.find(({ state }) => state === "wrapped")?.requester;
    assert.ok(oneLine && wrapped, `${viewport.width}: requester evidence is incomplete`);
    assert.ok(
      wrapped.height > oneLine.height,
      `${viewport.width}: wrapped requester did not exercise a taller rendered state`,
    );
    assert.deepEqual(consoleFailures, [], `${viewport.width}: browser console was not clean`);
    results.push({ viewport, states: viewportResults, consoleFailures });
    await context.close();
  }

  writeFileSync(
    path.join(evidenceDirectory, "results.json"),
    `${JSON.stringify({ generatedAt: new Date().toISOString(), base, results }, null, 2)}\n`,
  );
  console.log(
    `PASS SCR-001 Login: ${viewports.length} viewports x ${states.length} states; evidence -> ${path.relative(REPO_ROOT, evidenceDirectory)}`,
  );
} finally {
  await browser.close();
  stopServer();
}
