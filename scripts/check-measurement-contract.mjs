#!/usr/bin/env node
/**
 * check:measurement-contract — every claim in dist/contracts/measurement.json, proved in a browser.
 *
 * The contract tells a consumer's gate "this selector's target is bigger than its border box, take
 * `targetMin` as read". That is a promise made to somebody else's CI, so it must not be a promise
 * this repo merely intends to keep. gh#503/#506/#507 are what an unverified claim costs: four
 * releases, twelve issue state changes, and a consumer who could not tell "fixed" from "ignored".
 *
 * WHY A BROWSER. The claim is about hit-testing — which element `elementFromPoint` returns at a
 * given coordinate. A pseudo-element carries the target, so there is no box in the DOM to read and
 * no computed style that answers it; jsdom cannot hit-test at all.
 *
 * WHAT IS ASSERTED, per entry in `targetSize.expanders`, on a FINE pointer (the desktop case, the
 * one the consumer's gate runs and the one the media-query fix of gh#506 originally missed):
 *   1. the selector actually renders somewhere in the catalogue — a contract entry for a selector
 *      nothing ships is a lie by omission;
 *   2. its hit region, scanned with elementFromPoint, reaches `targetMin` on both axes;
 *   3. the expansion does not steal the centre of a neighbouring interactive element.
 *
 * (3) is the cost of this technique and the reason it is audited rather than trusted: a hit area
 * that reaches the floor by swallowing the control beside it has moved the bug, not fixed it.
 */
import { readFileSync, globSync } from "node:fs";

import { ensurePreviewServer } from "./frame-harness.mjs";
import { chromium } from "playwright";

const port = Number(process.env.PREVIEW_PORT) || 6019;
const base = `http://localhost:${port}`;

const contract = JSON.parse(readFileSync("src/contracts/measurement.json", "utf8"));
const { expanders, min } = {
  expanders: contract.targetSize.expanders,
  min: contract.targetSize.min,
};

/**
 * Isolate routes that might render a selector, derived from the components the contract names.
 * Mirrors `preview/src/catalog.ts`: a page's id is its path under `docs/` with `/` folded to `-`,
 * so `docs/data-display/data-table/index.tsx` is served at `/isolate/data-display-data-table-index`.
 * Derived rather than listed, so a component that moves group — or grows an examples/ folder that
 * is the only place a selector appears — does not silently skip its check.
 */
function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function routesFor(components) {
  const ids = [];
  for (const name of components) {
    const files = [...globSync(`docs/*/${name}.tsx`), ...globSync(`docs/*/${name}/**/*.tsx`)];
    for (const file of files) {
      const rel = file.replace(/^docs\//, "").replace(/\.tsx$/, "");
      if ((rel.split("/").pop() ?? "").startsWith("_")) continue;
      ids.push(slugify(rel.replace(/\//g, "-")));
    }
  }
  // Shortest first: the overview page is both the likeliest hit and the cheapest to load.
  return [...new Set(ids)].sort((a, b) => a.length - b.length);
}

const stopServer = await ensurePreviewServer(base);
const failures = [];
let browser;

try {
  browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  console.log(`\n  contract ${contract.version} — ${expanders.length} expanded targets, min ${min}px`);

  for (const entry of expanders) {
    const routes = routesFor(entry.components);
    if (!routes.length) {
      failures.push(
        `✗ ${entry.selector} — the contract names components ${entry.components.join(", ")} and ` +
          `none of them has an isolate page, so this claim cannot be measured at all.`,
      );
      continue;
    }

    let measured = null;
    for (const slug of routes) {
      await page.goto(`${base}/isolate/${slug}`, { waitUntil: "domcontentloaded" });
      const found = await page
        .locator(entry.selector)
        .first()
        .waitFor({ timeout: 8000 })
        .then(() => true)
        .catch(() => false);
      if (!found) continue;
      /*
       * SCROLL IT INTO VIEW FIRST, AND THIS IS THE WHOLE DEFECT (gh#966).
       *
       * `reach()` below starts at the element's own CENTRE and walks outward, and
       * `elementFromPoint` answers `null` for any point outside the viewport. The first
       * `.ui-control-inline-affix-action` on `/isolate/data-entry-input` sits at y≈2358 in a
       * 900px viewport, so the very first probe missed and the scan reported `hit 0×0` — which
       * this gate then printed as "1 claim(s) the package does not keep".
       *
       * Measured, same element, same run: before the scroll `paint 20×20 / hit 0×0`; after it
       * `paint 20×20 / hit 24.5×24.5`, comfortably over the 24px floor. The contract was right,
       * the CSS was right, and the gate had been red every night since 2026-09-21 saying otherwise.
       *
       * The other three expanders passed only because they happened to be above the fold on their
       * own pages. That is luck, not coverage.
       */
      /*
       * To the CENTRE of the viewport, not merely into it. `scrollIntoViewIfNeeded` scrolls the
       * minimum, which can leave the element flush against an edge — and `reach()` walks up to
       * `min * 2` px outward, so a centre within ~13px of an edge has its scan cut short by
       * `elementFromPoint` answering null past the viewport. That UNDER-reports a conforming target
       * and brings back exactly the false "claim not kept" this change exists to remove, one edge
       * further out. Found reviewing this fix, not by a failure.
       *
       * `document.querySelector` rather than the locator, so the element scrolled is the element
       * measured below.
       */
      await page.evaluate((selector) => {
        document.querySelector(selector)?.scrollIntoView({ block: "center", inline: "center" });
      }, entry.selector);
      await page.waitForTimeout(200);

      measured = await page.evaluate(
        ({ selector, min }) => {
          // The target is what accepts the pointer, not what is painted. Scan outward from the
          // centre until the point stops belonging to the element; this is the reference
          // implementation published in docs/MEASUREMENT-CONTRACT.md.
          const reach = (el, dx, dy) => {
            const r = el.getBoundingClientRect();
            const cx = r.left + r.width / 2;
            const cy = r.top + r.height / 2;
            let out = 0;
            for (let i = 0; i <= min * 2; i += 0.25) {
              const hit = document.elementFromPoint(cx + dx * i, cy + dy * i);
              if (hit === el || el.contains(hit)) out = i;
              else break;
            }
            return out;
          };

          const el = document.querySelector(selector);
          const rect = el.getBoundingClientRect();
          /*
           * "I could not measure this" and "this claim is false" are different answers, and only
           * one of them is about the package. Reporting the first as the second is what made this
           * gate accuse a conforming contract (gh#966), so the centre is checked explicitly and
           * the caller is told which it got.
           */
          const centre = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
          // Half-open: `elementFromPoint` answers inside [0, innerWidth) × [0, innerHeight) only, so
          // a centre ON the right or bottom edge is already outside what it can see.
          const inViewport =
            centre.x >= 0 &&
            centre.y >= 0 &&
            centre.x < window.innerWidth &&
            centre.y < window.innerHeight;
          if (!inViewport || rect.width === 0 || rect.height === 0) {
            return {
              paint: { width: +rect.width.toFixed(2), height: +rect.height.toFixed(2) },
              hit: null,
              unmeasurable: rect.width === 0 || rect.height === 0
                ? "the element paints nothing (0 box), so there is no centre to probe"
                : `its centre (${Math.round(centre.x)}, ${Math.round(centre.y)}) is outside the ` +
                  `${window.innerWidth}×${window.innerHeight} viewport, so elementFromPoint ` +
                  `answers null and the scan cannot start`,
              stolen: null,
            };
          }
          const width = reach(el, -1, 0) + reach(el, 1, 0);
          const height = reach(el, 0, -1) + reach(el, 0, 1);

          // Does the expanded box swallow a neighbour's CENTRE? That is the failure mode this
          // technique can introduce, and the only one worth flagging: overlapping a neighbour's
          // edge is normal, taking the point a user aims at is not.
          let stolen = null;
          for (const other of document.querySelectorAll(
            "button, a[href], input, select, textarea, [role=button], [tabindex]",
          )) {
            if (other === el || el.contains(other) || other.contains(el)) continue;
            const o = other.getBoundingClientRect();
            if (!o.width || !o.height) continue;
            const ocx = o.left + o.width / 2;
            const ocy = o.top + o.height / 2;
            const at = document.elementFromPoint(ocx, ocy);
            if (at === el || el.contains(at)) {
              stolen = (other.textContent || other.getAttribute("aria-label") || other.tagName)
                .trim()
                .slice(0, 40);
              break;
            }
          }

          return {
            paint: { width: +rect.width.toFixed(2), height: +rect.height.toFixed(2) },
            hit: { width: +width.toFixed(2), height: +height.toFixed(2) },
            stolen,
          };
        },
        { selector: entry.selector, min },
      );
      if (measured) break;
    }

    if (!measured) {
      failures.push(
        `✗ ${entry.selector} — not rendered on any of ${routes.join(", ")}. The contract promises a ` +
          `${min}px target for a selector this catalogue never shows.`,
      );
      continue;
    }

    if (measured.unmeasurable) {
      // Deliberately still a failure — a claim nobody can check is not a claim that holds — but it
      // names the measurement, not the package, so nobody goes looking for a defect that is not there.
      failures.push(
        `✗ ${entry.selector} — COULD NOT MEASURE: ${measured.unmeasurable}. ` +
          `This says nothing about whether the package keeps the claim; fix the probe.`,
      );
      continue;
    }

    const label =
      `${entry.selector.padEnd(34)} paint ${measured.paint.width}×${measured.paint.height}  ` +
      `hit ${measured.hit.width}×${measured.hit.height}`;

    if (measured.hit.width < entry.targetMin - 0.01 || measured.hit.height < entry.targetMin - 0.01) {
      failures.push(
        `✗ ${label} — under the ${entry.targetMin}px the contract publishes. Either the ${entry.via} ` +
          `stopped carrying the target, or the contract is claiming one that was never shipped.`,
      );
      continue;
    }
    if (measured.stolen) {
      failures.push(
        `✗ ${label} — its expanded target covers the CENTRE of "${measured.stolen}". Reaching the ` +
          `floor by swallowing a neighbour moves the bug rather than fixing it.`,
      );
      continue;
    }
    console.log(`    ✓ ${label}`);
  }

  await context.close();
} finally {
  await browser?.close();
  await stopServer?.();
}

if (failures.length) {
  console.error(`\n✗ check:measurement-contract — ${failures.length} claim(s) the package does not keep:\n`);
  for (const f of failures) console.error(`  ${f}`);
  console.error(
    `\nThe contract is read by consumer CI (docs/MEASUREMENT-CONTRACT.md). A claim it cannot keep is ` +
      `worse than no contract: it tells somebody else's gate to stop looking.`,
  );
  process.exit(1);
}

console.log(`\n✓ check:measurement-contract — ${expanders.length} published targets measured and kept.`);
