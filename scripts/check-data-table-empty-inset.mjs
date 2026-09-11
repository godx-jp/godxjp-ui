#!/usr/bin/env node
/**
 * check:data-table-empty-inset — a DataTable's lifecycle cell insets CONSUMER content the same way
 * it insets the built-in one.
 *
 * `empty`, `denied` and `error` each take a `ReactNode`, and `empty` is routinely given a plain
 * string. The cell that hosts them was `padding: 0`, on the reasoning that the built-in
 * `EmptyState` brings its own — true for the built-in, and false for every other shape the props
 * accept. Measured in Chromium on /isolate/data-display-data-table-index before the fix: the
 * story's own custom error node reported its first text at **0.00px** from the cell's inline edge
 * while the built-in EmptyState beside it sat at **24px**, and a consumer hit the same thing with
 * `empty="まだ登録がありません"` — a message printed flush against the table's border.
 *
 * WHY A BROWSER. The fix is one CSS declaration moving from an inner div to the cell, and jsdom has
 * no layout: a render test sees the same DOM either way. The number that decides it — the distance
 * from the cell's content edge to the first text a reader sees — only exists once something lays
 * the page out.
 *
 * WHAT IS ASSERTED, on each of the three lifecycle shapes:
 *   1. the first text sits at least the cell's own inline inset away from the cell edge;
 *   2. every shape sits at the SAME inset — a consumer string and the built-in state must not be
 *      placed differently, which is the asymmetry the defect was;
 *   3. the built-in EmptyState did not move: it must land on the pixel it landed on before the
 *      inset was relocated, or this "fix" is a visual change to every existing table.
 *
 * Usage: node scripts/check-data-table-empty-inset.mjs
 */
import { ensurePreviewServer } from "./frame-harness.mjs";
import { chromium } from "playwright";

const port = Number(process.env.PREVIEW_PORT) || 6017;
const base = `http://localhost:${port}`;
const stopServer = await ensurePreviewServer(base);

/**
 * The three shapes, by their story anchors. `empty-plain-string` is the consumer's exact report;
 * `error-custom-node` is the same hole reached through a different prop; `empty-builtin` is the
 * control that must not move.
 */
const SHAPES = [
  { id: "empty-builtin", what: "built-in EmptyState", builtIn: true },
  { id: "empty-plain-string", what: "`empty` given a plain string" },
  { id: "error-custom-node", what: "`error` given a consumer node" },
];

/** The inset the built-in state has always been drawn at, in px at the default density. */
const EXPECTED_INLINE = 24;
const EXPECTED_BLOCK = 40;

let browser;
const failures = [];

try {
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(`${base}/isolate/data-display-data-table-index`, {
    waitUntil: "domcontentloaded",
  });
  await page.locator("#empty-plain-string .ui-data-table-empty").waitFor({ timeout: 30000 });
  await page.waitForTimeout(300);

  const measured = await page.evaluate(
    (ids) => {
      return ids.map((id) => {
        const cell = document.querySelector(`#${id} .ui-data-table-empty`);
        if (!cell) return { id, error: "no lifecycle cell under this anchor" };
        const box = cell.getBoundingClientRect();
        // The first text a reader actually sees, not the first element — a wrapper with no text of
        // its own would report the cell's own edge and pass a broken layout.
        const walker = document.createTreeWalker(cell, NodeFilter.SHOW_TEXT);
        let node = null;
        while (walker.nextNode()) {
          if (walker.currentNode.textContent.trim()) {
            node = walker.currentNode;
            break;
          }
        }
        if (!node) return { id, error: "the lifecycle cell renders no text" };
        const range = document.createRange();
        range.selectNodeContents(node);
        const text = range.getBoundingClientRect();
        const style = getComputedStyle(cell);
        return {
          id,
          // Centred content sits further in than the inset; the inset is the FLOOR, so measure
          // against the cell's own padding rather than the text's own centring.
          paddingInline: parseFloat(style.paddingLeft),
          paddingBlock: parseFloat(style.paddingTop),
          textInline: +(text.left - box.left).toFixed(2),
          textBlock: +(text.top - box.top).toFixed(2),
          sample: node.textContent.trim().slice(0, 24),
        };
      });
    },
    SHAPES.map((s) => s.id),
  );

  for (const [index, m] of measured.entries()) {
    const shape = SHAPES[index];
    if (m.error) {
      failures.push(`✗ ${shape.what} (#${m.id}) — ${m.error}`);
      continue;
    }
    const line =
      `${shape.what} (#${m.id}) — cell inset ${m.paddingInline}/${m.paddingBlock}px, ` +
      `first text at ${m.textInline}/${m.textBlock}px  "${m.sample}"`;

    if (m.paddingInline < EXPECTED_INLINE || m.paddingBlock < EXPECTED_BLOCK) {
      failures.push(
        `✗ ${line} — the cell must carry the inset itself (${EXPECTED_INLINE}/${EXPECTED_BLOCK}px), ` +
          `or whatever the consumer passes sits flush against the table's edge.`,
      );
      continue;
    }
    if (m.textInline < m.paddingInline - 0.5 || m.textBlock < m.paddingBlock - 0.5) {
      failures.push(`✗ ${line} — text is drawn INSIDE the cell's own inset.`);
      continue;
    }
    // The built-in state is the CONTROL: relocating the inset from the inner div onto the cell
    // must be invisible on it. It sat 40.5px from the cell's block edge before; if that moves,
    // this is not a fix, it is a visual change to every table that already ships.
    if (shape.builtIn && Math.abs(m.textBlock - (EXPECTED_BLOCK + 0.5)) > 1) {
      failures.push(
        `✗ ${line} — the built-in EmptyState MOVED (expected its first text at ~40.5px).`,
      );
      continue;
    }
    console.log(`  ✓ ${line}`);
  }

  const insets = measured
    .filter((m) => !m.error)
    .map((m) => `${m.paddingInline}/${m.paddingBlock}`);
  if (new Set(insets).size > 1) {
    failures.push(
      `✗ the three lifecycle shapes are inset differently (${insets.join(", ")}) — a consumer ` +
        `string and the built-in state must be placed the same.`,
    );
  }
} finally {
  if (browser) await browser.close();
  stopServer();
}

if (failures.length) {
  console.error(`\n✗ check:data-table-empty-inset — ${failures.length} failure(s):`);
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1);
}
console.log(
  `\n✓ check:data-table-empty-inset — all ${SHAPES.length} lifecycle shapes share the cell's inset.`,
);
