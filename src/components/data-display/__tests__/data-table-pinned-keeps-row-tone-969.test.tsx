import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { DataTable, type ColumnDef } from "@/components/data-display";
import { anchorIndex, ruleSelector, ruleSelectors } from "@/test/css-selector";
import { renderWithUi } from "@/test/render";

/**
 * A FROZEN COLUMN CUT THE ROW'S STATUS COLOUR OFF (gh#969).
 *
 * A pinned cell is `position: sticky` over an OPAQUE background — it has to hide the columns
 * scrolling under it — so it re-creates its row's stripe, hover and selected fills as image layers.
 * It re-created everything except the row's TONE. Measured on a `destructive` DataTable row:
 *
 *     rest    row  stripe colour + linear-gradient(rgba(170, 24, 31, 0.06) …)
 *             pin  stripe only
 *     hover   row  hover colour + the SAME red layer (the row keeps its tone on hover)
 *             pin  hover only
 *
 * so the red cue stopped at the column people scan most — dates, IDs, row actions. PermissionMatrix
 * fixed the same defect for its own pin in gh#874, and that fix's comment claims DataTable already
 * worked this way. It did not.
 *
 * jsdom cannot compose backgrounds, so this asserts the two things that decide the paint, both on
 * the real CSS and on the real rendered DOM: which rules a toned row's pinned cell MATCHES, and that
 * every rule it can match puts the tone first. The pixels were checked in Chromium when the fix
 * landed (after: the wash runs unbroken across the frozen column).
 */

const css = readFileSync(resolve("src/styles/table-layout.css"), "utf8");

/** The declaration block after `anchor`, whitespace-tolerant (Prettier re-wraps long selectors). */
function block(anchor: string): string {
  const at = anchorIndex(css, anchor);
  expect(at, `rule not found: ${anchor}`).toBeGreaterThan(-1);
  const open = css.indexOf("{", at);
  return css.slice(open + 1, css.indexOf("\n  }", open));
}

const TONE_BASE =
  ":where(.ui-table-row[data-tone]) > :is(.ui-data-table-pin-end, .ui-data-table-pin-start) {";
const STRIPE =
  ":not([data-expanded-row]))) > :is(.ui-data-table-pin-end, .ui-data-table-pin-start) {";
const HOVER = ".ui-data-table-surface tbody tr:hover > .ui-data-table-pin-start {";
const SELECTED = '.ui-data-table-surface tbody tr[data-state="selected"] > .ui-data-table-pin-start {';

type Row = { id: string; name: string; amount: number };
const DATA: Row[] = ["a", "b", "c", "d"].map((id, i) => ({ id, name: `n-${id}`, amount: i }));
const COLUMNS: ColumnDef<Row>[] = [
  { key: "name", header: "名前" },
  { key: "amount", header: "金額", fixed: "end" },
];

describe("a toned row's frozen cells wear its tone (gh#969)", () => {
  it("the row declares its tone ONCE, as a layer its cells can inherit", () => {
    const row = block(".ui-table-row[data-tone] {");
    expect(row).toMatch(/--table-row-tone-layer:\s*linear-gradient/);
    expect(row).toMatch(/background-image:\s*var\(--table-row-tone-layer\)/);
  });

  it("a toned row's pinned cell matches the tone rule; an untoned row's does not", () => {
    const { container } = renderWithUi(
      <DataTable
        data={DATA}
        columns={COLUMNS}
        getRowId={(r) => r.id}
        rowTone={(r) => (r.id === "b" ? "destructive" : r.id === "c" ? "warning" : undefined)}
      />,
    );
    const selector = ruleSelector(css, TONE_BASE);
    const pinned = [...container.querySelectorAll("tbody > tr")].map(
      (tr) => tr.querySelector(".ui-data-table-pin-end")!,
    );
    expect(pinned.every(Boolean)).toBe(true);
    // The negative half matters as much: an untoned row must not pick up a tone rule.
    expect(pinned.map((c) => c.matches(selector))).toEqual([false, true, true, false]);
    expect(block(TONE_BASE)).toMatch(/background-image:\s*var\(--table-row-tone-layer\)/);
  });

  it.each([
    ["stripe", STRIPE],
    ["hover", HOVER],
    ["selected", SELECTED],
  ])("the %s rule puts the tone layer FIRST, so it wins without dropping the tone", (_, anchor) => {
    // Each of these replaces `background-image` on the pinned cell. Before gh#969 they listed only
    // their own gradient, so a hovered or striped toned row lost its colour in the frozen column.
    const body = block(anchor);
    expect(body).toMatch(/background-image:\s*var\(--table-row-tone-layer,\s*none\),\s*linear-gradient/);
  });

  it("the base tone rule is zero-specificity and comes BEFORE the stripe rule", () => {
    // Otherwise it would outrank the stripe/hover/selected rules, whose layer lists already carry
    // the tone, and replace them with the tone alone — dropping the stripe on a toned even row.
    expect(ruleSelectors(css, TONE_BASE).every((s) => s.startsWith(":where("))).toBe(true);
    expect(anchorIndex(css, TONE_BASE)).toBeLessThan(anchorIndex(css, STRIPE));
  });

  it("an untoned row falls back to `none` — a valid empty layer, not a dropped declaration", () => {
    // `var(--table-row-tone-layer, none)` with the property unset yields `none, linear-gradient(…)`,
    // which CSS accepts as a two-layer list. A fallback the grammar rejected would drop the WHOLE
    // background-image and lose the stripe on every untoned row.
    for (const anchor of [STRIPE, HOVER, SELECTED]) {
      expect(block(anchor)).toContain("var(--table-row-tone-layer, none)");
    }
  });
});
