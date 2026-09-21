import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * A SCROLL COMPONENT'S EXAMPLES MUST SCROLL.
 *
 * Measured on the published docs site: three of the nine ScrollAreas on the page had
 * `scrollHeight === clientHeight`. They could not scroll, so no scrollbar could appear, and the
 * reader's conclusion — "why is there no scrollbar?" — was correct about the demo and wrong about
 * the component.
 *
 * The cause was one line in each: `h-56` sat on an ancestor Card. Neither `CardContent` nor
 * `ScrollArea` inherits a height from an ancestor, so the area grew to its content. The page's own
 * header states the rule — "ALWAYS give it an explicit height/max-height … or nothing ever
 * overflows and no scrollbar appears" — and the examples broke it.
 *
 * After: 8 of 9 scroll. The ninth is the deliberate control (content fits, no bar), which is only
 * meaningful beside one that does overflow.
 *
 * This asserts the SHAPE, because jsdom lays nothing out and cannot compare scrollHeight to
 * clientHeight at all. `check:frame-overflow` is the browser half.
 */
const page = readFileSync(join(process.cwd(), "docs/data-display/scroll-area.tsx"), "utf8");

/** Every `<ScrollArea` … `>` opening tag, attributes collapsed onto one line. */
const openingTags = [...page.matchAll(/<ScrollArea\b[^>]*>/g)].map((m) =>
  m[0].replace(/\s+/g, " "),
);

describe("the ScrollArea examples can actually scroll", () => {
  it("has a demo for every orientation plus the always-visible bar", () => {
    expect(openingTags.length).toBeGreaterThanOrEqual(8);
  });

  /* A vertical ScrollArea with no height class grows to its content, which is the exact defect.
   * `orientation="horizontal"` is exempt: its constraint is the container's width, not a height. */
  it("gives every vertical example an explicit height", () => {
    const unbounded = openingTags.filter(
      (t) => !/orientation="(horizontal|both)"/.test(t) && !/className="[^"]*\bh-\d+/.test(t),
    );
    expect(
      unbounded,
      "a vertical ScrollArea without an explicit height grows to its content and never scrolls",
    ).toEqual([]);
  });

  /* gh#798: on macOS the default bar is an OVERLAY and is invisible at rest, so a page about
   * scrolling has to show the one that is not. Without this pairing the reader cannot tell the
   * platform's behaviour from the component's. */
  it("shows scrollbar=always beside the default, so the difference is visible", () => {
    expect(page).toMatch(/scrollbar="always"/);
    expect(page, "the comparison needs both halves").toMatch(/scrollbar="always"/);
    expect(openingTags.some((t) => !/scrollbar=/.test(t))).toBe(true);
  });
});
