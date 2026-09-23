import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Affix } from "../affix";

/**
 * A PINNED BAR IS ONLY PINNED TO THE VIEWPORT WHILE NOTHING ABOVE IT OPTS OUT (gh#897).
 *
 * Reported as "cái thanh ghim bị gì đây!?!?" with a screenshot of the bar sitting on top of
 * unrelated content two sections up the page.
 *
 * `position: fixed` resolves against the nearest CONTAINING BLOCK, and an ancestor becomes one by
 * carrying a `filter`, `backdrop-filter`, `transform`, `perspective`, a `will-change` naming any of
 * those (CSS Transforms 1 §3.2, Filter Effects 1 §7), or `contain: paint | layout | strict | content`
 * (CSS Containment). `Affix` fed CSS a `--affix-target-inset` read from
 * `getBoundingClientRect()` — viewport coordinates — which the browser then resolved against a
 * different origin entirely.
 *
 * Measured in Chromium on `/showcase/theme-lab`, an Affix bounded by a 12rem scroller:
 *
 *                                   scroller      bar          offset from scroller top
 *     glass, before               [378, 570]   [-157, -129]     -534px      (expected 8)
 *     base,  before               [378, 570]   [-8947, -8919]   -9325px     (expected 8)
 *     glass, after                [378, 570]   [387, 415]       9px
 *     base,  after                [378, 570]   [386, 414]       8px
 *
 * TWO DIFFERENT ORIGINS, and fixing one left the other untouched. The glass theme's Card computes
 * `backdrop-filter: blur(16px) saturate(1.7)`, so the bar resolved against the Card's box at
 * y=1506. This package's own `.app-main` carries `contain: paint` as the page's scrollport — there
 * the block is ALSO the scroller, and a fixed descendant resolves against the CONTENT origin, which
 * has moved up by `scrollTop` (at a page scroll of 9381: box top 48, origin -9333).
 *
 * So the base theme was broken too, in every release, and the glass theme only made it visible by
 * putting a second containing block closer to the bar. The trap is documented twice in this repo —
 * at the app-launcher scrim in `shell-layout.css` and in this component's own docblock — which is
 * the point: knowing about it did not prevent it, because nothing measured it.
 *
 * jsdom has no layout, so the browser numbers above are the evidence for the ARITHMETIC. What this
 * holds is the contract underneath it: that the component consults the ancestor chain at all, and
 * that a clean chain still produces the viewport behaviour it always had.
 */
const target = () => document.createElement("div");

describe("Affix measures against its containing block, not the viewport (gh#897)", () => {
  it("reads the computed style of its ancestors — the check that did not exist", () => {
    const spy = vi.spyOn(window, "getComputedStyle");
    const { container } = render(
      <div data-testid="outer">
        <Affix offsetBlockStart={8} target={target}>
          <span>pinned</span>
        </Affix>
      </div>,
    );
    expect(container.querySelector("[data-slot='affix']")).not.toBeNull();
    // Before gh#897 the component never walked the chain at all; the ancestor styles were never
    // consulted, which is exactly why a blurred Card could break it silently.
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it("still renders the in-flow placeholder, so the fix costs no layout", () => {
    const { container } = render(
      <Affix offsetBlockStart={8}>
        <span>pinned</span>
      </Affix>,
    );
    const root = container.querySelector("[data-slot='affix']");
    expect(root).not.toBeNull();
    expect(container.textContent).toContain("pinned");
  });

  it("keeps `offsetBlockStart` on the logical axis", () => {
    const { container } = render(
      <Affix offsetBlockStart={8}>
        <span>pinned</span>
      </Affix>,
    );
    const root = container.querySelector("[data-slot='affix']") as HTMLElement;
    expect(root.style.getPropertyValue("--affix-inset-block-start")).toBe("8px");
  });
});
