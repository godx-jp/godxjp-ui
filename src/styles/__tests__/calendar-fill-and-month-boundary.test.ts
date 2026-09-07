import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const read = (relativePath: string) => readFileSync(resolve(process.cwd(), relativePath), "utf8");

const control = read("src/styles/control.css");
const tokens = read("src/tokens/components/control.css");

/** Declarations of every rule whose selector list contains `selector` exactly. */
function declarationsFor(css: string, selector: string): string {
  const blocks: string[] = [];
  const rule = /([^{}]*)\{([^{}]*)\}/g;
  let match: RegExpExecArray | null;
  while ((match = rule.exec(css.replace(/\/\*[\s\S]*?\*\//g, ""))) !== null) {
    if (match[1].split(",").some((part) => part.trim() === selector)) blocks.push(match[2]);
  }
  return blocks.join("\n");
}

/**
 * THREE THINGS A MONTH GRID HAS TO DO, each of which it was not doing.
 *
 * All three were measured on a real dashboard rail in Chromium at 1440×1000, not inferred:
 *
 *   1. FILL ITS CONTAINER. `inline-size: fit-content` pinned the month at its intrinsic size, so
 *      the calendar sat 248px wide inside a 286px card — 38px of dead space beside a grid of seven
 *      equal columns. After: 976px inside a 1008px host (the 32px left over is the host's own
 *      padding), and 256px inside a 258px picker popover, where the min floor takes over.
 *
 *   2. KEEP AN EDGE. `border` computed to `0px solid rgb(215,212,209)` — the colour was chosen and
 *      the width was zero, so nothing was ever drawn and the month floated in the card.
 *
 *   3. SHOW THE MONTH BOUNDARY. react-day-picker puts `text-muted-foreground` on the day CELL for
 *      a day belonging to the previous or next month. That did nothing, because the visible number
 *      is a `.ui-button--ghost` which sets its own `color` and therefore never inherits the cell's.
 *      Measured: 6月28日 and 7月15日 both `rgb(36, 35, 30)`, byte for byte — you could not tell
 *      which month a day belonged to. The rule has to land on the BUTTON, keyed off the
 *      `data-outside` the library already stamps on the cell. After: `rgb(104, 102, 94)` vs
 *      `rgb(36, 35, 30)`.
 *
 * Asserted from the CSS source because jsdom does no layout — a width regression cannot be caught
 * by rendering. The numbers above come from the browser; this file guards the declarations that
 * produce them.
 */
describe("calendar fills, keeps an edge, and marks the month boundary", () => {
  const root = declarationsFor(control, ".ui-calendar");

  it("fills its container instead of pinning to its intrinsic width", () => {
    expect(root, "`fit-content` is what pinned the month at 248px").not.toMatch(
      /inline-size:\s*fit-content/,
    );
    expect(root).toMatch(/inline-size:\s*100%/);
  });

  it("keeps a floor so it cannot collapse inside an auto-width picker popover", () => {
    expect(root).toMatch(/min-inline-size:\s*var\(--calendar-min-inline-size\)/);
    expect(tokens).toMatch(/--calendar-min-inline-size:\s*\S+/);
  });

  it("draws a real edge, not a colour with no width", () => {
    expect(root).toMatch(/border:\s*var\(--stroke-hairline\)\s+solid\s+hsl\(var\(--border\)\)/);
  });

  it("mutes an outside day on the BUTTON, where the ink actually is", () => {
    // A rule on the cell alone is the bug: `.ui-button` sets its own colour and never inherits.
    expect(control).toMatch(
      /\.ui-calendar\s+\[data-outside="true"\]\s+\.ui-calendar-day-button\s*\{[^}]*color:\s*hsl\(var\(--muted-foreground\)\)/,
    );
  });

  it("lets the day cells share the width rather than staying fixed squares", () => {
    // Without this the calendar widens but the seven columns stay bunched at the leading edge.
    expect(declarationsFor(control, ".ui-calendar-day")).toMatch(/flex:\s*1 1 0%/);
    expect(declarationsFor(control, ".ui-calendar-weekday")).toMatch(/flex:\s*1 1 0%/);
  });
});
