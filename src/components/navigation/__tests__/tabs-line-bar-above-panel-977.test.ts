import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { anchorIndex, ruleSelectors } from "@/test/css-selector";

/**
 * A LINE TAB'S ACTIVE BAR WAS PAINTED OVER BY THE TABLE BELOW IT (gh#977).
 *
 * The line strip carries a negative block margin equal to the focus ring's reach (tabs.tsx, gh#376),
 * so the block after it rises into the strip where the active bar is drawn. A DataTable's header is
 * `position: sticky; z-index: 10` on an opaque ground, so it painted over the bar. Measured on
 * `card/examples/tab-list` in Chromium: the pixel under the active tab was the header's grey
 * `(244, 243, 240)` before this fix and the bar's `(122, 0, 255)` after.
 *
 * Two rules fix it, and this pins the RELATIONSHIP they depend on rather than their spelling:
 *
 *  - the panel is ISOLATED, so a z-index inside it (10 for a sticky header) ranks only inside it;
 *  - the strip is `z-index: 1` — enough to beat the isolated panel, and deliberately NOT higher than
 *    the library's own sticky layers. Measured on the real page: a later `z-index: 1` layer laid over
 *    the bar still wins. A strip raised to 11 would win against the header too — and would then
 *    bleed through PageContainer's sticky footer and frozen columns as the page scrolls.
 *
 * jsdom composites nothing, so the pixels were checked in Chromium when this landed; this file keeps
 * the arrangement from drifting into either failure.
 */

/*
 * Comments stripped FIRST. The sticky-header rule's own comment quotes antd's
 * `sticky={{ offsetHeader }}`, and a block reader that stops at the first `}` stopped inside that
 * comment — one more guard that read documentation prose as if it were the program.
 */
const read = (f: string) => readFileSync(resolve(f), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const nav = read("src/styles/navigation-layout.css");
const layout = read("src/styles/layout.css");
const table = read("src/styles/table-layout.css");

/** The declaration block after `anchor` in `css`, whitespace-tolerant. */
function block(css: string, anchor: string): string {
  const at = anchorIndex(css, anchor);
  expect(at, `rule not found: ${anchor}`).toBeGreaterThan(-1);
  const open = css.indexOf("{", at);
  return css.slice(open + 1, css.indexOf("}", open));
}

const zOf = (body: string): number => {
  const m = /z-index:\s*(-?\d+)/.exec(body);
  expect(m, `no numeric z-index in: ${body.trim().slice(0, 80)}`).not.toBeNull();
  return Number(m![1]);
};

const STRIP = '[data-slot="tabs-list"][data-variant="line"] {';
const PANEL = '[data-slot="tabs"]:has([data-slot="tabs-list"][data-variant="line"])';
const STICKY_FOOTER = ".ui-page-container--sticky-footer .ui-page-footer {";
const STICKY_TABLE_HEADER = ".ui-data-table-sticky-header {";

describe("a line tab's active bar paints above its panel (gh#977)", () => {
  it("the line strip is positioned with a z-index, so it forms a layer at all", () => {
    const body = block(nav, STRIP);
    expect(body).toMatch(/position:\s*relative/);
    expect(zOf(body)).toBeGreaterThan(0);
  });

  it("the panel is isolated, so a sticky header's z-index 10 ranks only inside it", () => {
    const body = block(nav, PANEL);
    expect(body).toMatch(/isolation:\s*isolate/);
    // Both panel slot names — `tabs-content` is the compatibility alias and renders the same thing.
    const sel = ruleSelectors(nav, PANEL).join(" ");
    expect(sel).toContain('[data-slot="tabs-panel"]');
    expect(sel).toContain('[data-slot="tabs-content"]');
  });

  it("…and that is the only reason it can win: the header really is above the strip otherwise", () => {
    // If the header ever dropped to z ≤ the strip, the isolation would be dead weight. Keep the
    // premise visible so a later reader knows why the panel is isolated at all.
    expect(zOf(block(table, STICKY_TABLE_HEADER))).toBeGreaterThan(zOf(block(nav, STRIP)));
  });

  it("the strip is NOT higher than the library's own sticky layers — no bleed-through", () => {
    // The invariant the obvious "fix" breaks. A later layer at an equal z-index wins by tree order,
    // which is what keeps a sticky footer or frozen column painted OVER the tabs as the page scrolls.
    expect(zOf(block(nav, STRIP))).toBeLessThanOrEqual(zOf(block(layout, STICKY_FOOTER)));
  });

  it("scoped to LINE tabs — the only variant with the negative margin", () => {
    // A default or card strip has no margin reaching into its panel, so it gets no stacking change:
    // no rule targeting another variant's strip may position it or give it a z-index.
    const other = [
      ...nav.matchAll(
        /\[data-slot="tabs-list"\]\[data-variant="(?!line)[a-z]+"\][^{]*\{([^}]*)\}/g,
      ),
    ];
    expect(other.length, "expected at least one non-line strip rule to check").toBeGreaterThan(0);
    for (const [, body] of other) {
      expect(body).not.toMatch(/z-index/);
      expect(body).not.toMatch(/isolation/);
    }
    expect(block(nav, STRIP)).not.toMatch(/margin/);
  });
});
