import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * `Card asChild` (gh#740) — the two stylesheet facts that make a card-as-control measure like the
 * `div` it replaced, read straight out of the shipped CSS.
 *
 * jsdom performs no layout, so the geometry itself was measured in Chromium on
 * /isolate/data-display-card-index at 1440 and 390: an `<a>`, a `<button>` and a `<div>` carrying
 * the same `data-slot="card"` attributes and the same inner markup came back identical on box
 * (688×140.09 / 358×184.89), border, radius, fill, padding inset, shadow, cursor and text-align.
 * Two rules are load-bearing for that result, and each one replaced a measured defect:
 *
 *  1. a `<button>` arrives with the UA's `text-align: center`, which centred every line in the
 *     card (measured `center` vs the div's `start` before the rule existed);
 *  2. with the card absent from focus-ring.css's list, a focused card-as-link fell back to
 *     Chrome's own `outline: auto 1px rgb(0,95,204)` — the exact fallback that file's opening
 *     note calls a mark the switch cannot turn off and no theme can retune. With the entry it
 *     paints the package's mark, `rgb(122,0,255) solid 1px` at offset 0, on the card's own rect.
 */
const cardStyles = readFileSync(resolve(process.cwd(), "src/styles/card-layout.css"), "utf8");
const focusRing = readFileSync(resolve(process.cwd(), "src/styles/focus-ring.css"), "utf8");

const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");

describe("Card `asChild` — the borrowed element carries the card's chrome, not the UA's", () => {
  it("neutralises a button's centred text, and inherits rather than pinning `start`", () => {
    const clean = stripComments(cardStyles);
    const at = clean.indexOf('button[data-slot="card"] {');
    expect(at, "card-layout.css must normalise the button form of the card box").toBeGreaterThan(
      -1,
    );
    const body = clean.slice(at, clean.indexOf("}", at));
    // `inherit`, not `start`: a card inside a centred region must follow that region exactly as
    // the `div` would, so the rule undoes the UA default without inventing a value of its own.
    expect(body).toMatch(/text-align:\s*inherit;/);
  });

  it("touches ONLY text-align — every other axis is already the card's own", () => {
    const clean = stripComments(cardStyles);
    const at = clean.indexOf('button[data-slot="card"] {');
    const body = clean.slice(at + 'button[data-slot="card"] {'.length, clean.indexOf("}", at));
    const properties = [...body.matchAll(/([a-z-]+)\s*:/g)].map((m) => m[1]);
    expect(properties).toEqual(["text-align"]);
  });
});

describe("Card `asChild` — the focus mark lands on the card box", () => {
  it("lists both interactive forms of the card in the mark and the halo", () => {
    // Two lists, and the entry has to be in BOTH: the outline is the mark, the box-shadow rule
    // below it is the halo that composes with a consumer's ring utility.
    const marks = [...focusRing.matchAll(/a\[data-slot="card"\]/g)];
    const buttons = [...focusRing.matchAll(/button\[data-slot="card"\]/g)];
    expect(marks).toHaveLength(2);
    expect(buttons).toHaveLength(2);
  });

  it("keys on the ELEMENT, so a plain div card is still a container and not a control", () => {
    // focus-ring.css's own rule: containers are not on the list. A bare `[data-slot="card"]`
    // entry would put a mark on every card on the page the moment one took programmatic focus.
    expect(stripComments(focusRing)).not.toMatch(/(?<![a-z\]])\[data-slot="card"\]/);
  });
});
