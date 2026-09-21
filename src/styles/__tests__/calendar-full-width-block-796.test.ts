import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { anchorIndex } from "../../test/css-selector";

/**
 * `width="full"` RELEASES BOTH AXES (gh#796).
 *
 * `CalendarProp.width` documents `full` for "an EMBEDDED calendar — a shift board, a booking month
 * — where the calendar is the content of a card rather than a dropdown". The CSS released the
 * INLINE axis only, with the note "a day that also grew taller would turn a month into a
 * page-height block" — true of a popover, and the opposite of what this value is for. A shift
 * board needs a day number plus one to three badges per cell; a booking month needs a price under
 * the number. Neither fits in one control height.
 *
 * So a consumer took the height back with a stylesheet OUTSIDE every `@layer` — the only place a
 * consumer rule beats a `@layer components` one — which is the rule-3/rule-8 shape the consumer
 * rules forbid, moved somewhere the audit cannot see it.
 *
 * MEASURED on /isolate/data-entry-calendar at 1440px, before and after:
 *
 *                              button height   month height
 *   no width attribute              32px           305px
 *   width="full", empty cells       32px           305px    <- unchanged
 *   width="full", one shift label   50px             —      <- the cell grows
 *
 * The floor is what makes the first two identical: the content is one day number, shorter than
 * `--control-height`, so `min-block-size` decides and nothing moves for anyone using `full` today.
 */
/*
 * Comments are BLANKED before any brace walking. The base day-button rule documents
 * `modifiers={{sunday:{dayOfWeek:[0]}}}`, and those braces end the block early for a naive
 * `indexOf("}")` — the rule reads as empty and the assertion fails against correct CSS. Caught by
 * writing it the naive way first.
 */
const css = readFileSync(join(process.cwd(), "src/styles/control.css"), "utf8").replace(
  /\/\*[\s\S]*?\*\//g,
  "",
);

function rule(selector: string): string {
  const at = anchorIndex(css, selector);
  expect(at, `missing rule: ${selector}`).toBeGreaterThan(-1);
  const open = css.indexOf("{", at);
  return css.slice(open + 1, css.indexOf("}", open));
}

describe("Calendar width=full (gh#796)", () => {
  const full = () => rule('.ui-calendar[data-width="full"] .ui-calendar-day-button');

  it("releases the BLOCK axis, not only the inline one", () => {
    expect(full()).toMatch(/block-size:\s*auto;/);
    expect(full()).toMatch(/inline-size:\s*100%;/);
  });

  it("keeps a floor of one control height, so an empty full calendar does not move", () => {
    // This is the whole no-regression argument: measured 32px/305px before and after.
    expect(full()).toMatch(/min-block-size:\s*var\(\s*--control-height\);/);
  });

  it("lays the cell out as a column that reads from the start edge", () => {
    // A number ABOVE content is a column; centred nowrap text clips the moment it is more than a
    // numeral, which is what the consumer had to undo by hand.
    expect(full()).toMatch(/flex-direction:\s*column;/);
    expect(full()).toMatch(/text-align:\s*start;/);
    expect(full()).toMatch(/white-space:\s*normal;/);
  });

  it("leaves the DEFAULT day button pinned, so the popover is untouched", () => {
    // The popover never sets width="full"; its cell stays a fixed square.
    const base = rule(".ui-calendar .ui-calendar-day-button");
    expect(base).toMatch(/block-size:\s*var\(\s*--control-height\);/);
    expect(base).not.toMatch(/min-block-size/);
  });
});
