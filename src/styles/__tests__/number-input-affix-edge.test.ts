import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Which EDGE a NumberInput affix sits on.
 *
 * The rules used to key on `:first-of-type` / `:last-of-type`, which match by ELEMENT TYPE among
 * siblings — and inside `.ui-number-input` the spans are prefix, suffix and the STEPPERS. Both
 * directions were wrong, measured in Chromium at a 1198px control:
 *
 *   suffix alone    the suffix is the only affix span, so it matched `:first-of-type`, took the
 *                   leading inset and rendered at leftOffset 12px — the prefix position. A field
 *                   meant to read `7日` read `日 … 7`. The field ALSO paid the leading padding
 *                   (32px, against 12px with no affix) for a prefix that did not exist.
 *   prefix+suffix   `:last-of-type` matched NOTHING, because the last span is the steppers. The
 *                   suffix fell back to `inset-inline-start: 0` and sat hard against the leading
 *                   edge (leftOffset 0).
 *
 * After: suffix-only leftOffset 1144, field padding 12px; prefix+suffix suffix leftOffset 1145.
 *
 * jsdom resolves no layout, so this asserts the shipped CASCADE CONTRACT out of the stylesheet —
 * the same technique attention-surface.test.ts uses. The browser-measured proof is above; what
 * this guards is that the selector never goes back to a positional proxy.
 */
const css = readFileSync(resolve(process.cwd(), "src/styles/control.css"), "utf8");

const rule = (selector: string) =>
  css.match(new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\{[^}]*\\}`))?.[0] ??
  "";

describe("NumberInput affixes are placed by SLOT, never by sibling position", () => {
  it("the prefix takes the leading inset", () => {
    expect(rule('[data-slot="number-input-prefix"]')).toMatch(
      /inset-inline-start:\s*var\(--control-padding-x\)/,
    );
  });

  it("the suffix takes the trailing inset, clear of the steppers", () => {
    const suffix = rule('[data-slot="number-input-suffix"]');
    expect(suffix).toMatch(/inset-inline-end:\s*calc\(var\(--control-height\)/);
    // and never the leading one — that is the bug, spelled out.
    expect(suffix).not.toMatch(/inset-inline-start/);
  });

  it("the field's leading padding is owed to a PREFIX, not to any affix", () => {
    expect(css).toMatch(
      /\.ui-number-input:has\(\[data-slot="number-input-prefix"\]\)\s+\.ui-number-input-field/,
    );
  });

  it("no affix rule keys on :first-of-type / :last-of-type", () => {
    const affixRules = css
      .split("\n")
      .filter((line) => line.includes("number-input") && /:(first|last)-of-type/.test(line));
    expect(affixRules).toEqual([]);
  });
});
