import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render } from "@testing-library/react";
import { ArrowLeft } from "lucide-react";
import { beforeAll, describe, expect, it, vi } from "vitest";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../carousel";

/**
 * THE ARROWS CENTRED ON THE COMPONENT, NOT ON THE CONTENT (gh#899).
 *
 * Reported as "carousel nó phải là các cái nút trải phải phải nằm ở giữa của ảnh chính chứ tại sao
 * lại là middle của cả khung thế??? nó phải nằm ở giữa của phần trên của ảnh chứ".
 *
 * `.ui-carousel` is the positioning context and it is as tall as the slides PLUS the dots, so the
 * old `top: 50%` centred the arrows on that sum. Measured in Chromium on a 98px carousel:
 *
 *     slides          58px    middle -3415
 *     dots row        40px
 *     component       98px    middle -3395
 *     arrow, before           middle -3395     <- half the dots row too low
 *     arrow, after            middle -3415     <- the slide's middle
 *
 * The reserve is subtracted only when the dots are actually rendered, because a carousel without
 * them has nothing below the slides and its arrows belong at a plain 50%.
 *
 * Two more things the same report asked for, both absent: the glyph was a hardcoded `ChevronLeft`
 * with no way to replace it, and there was no knob for the position. `children` now swaps the mark
 * while the `sr-only` label stays — a consumer cannot accidentally ship a button screen readers
 * cannot name — and `--carousel-arrow-inset-block-start` overrides the placement outright.
 *
 * jsdom performs no layout, so the pixel numbers above are the browser's. What this holds is the
 * shipped contract: which declaration exists, that it is logical rather than physical, and that the
 * icon override reaches the DOM without taking the accessible name with it.
 */
// embla-carousel relies on IntersectionObserver/ResizeObserver, which jsdom lacks — same stub as
// `carousel.test.tsx`.
beforeAll(() => {
  class Observer {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  vi.stubGlobal("IntersectionObserver", Observer);
  vi.stubGlobal("ResizeObserver", Observer);
});

const css = readFileSync(resolve(process.cwd(), "src/styles/data-display-layout.css"), "utf8");
const tokens = readFileSync(
  resolve(process.cwd(), "src/tokens/components/data-display.css"),
  "utf8",
);

const slides = (
  <CarouselContent>
    <CarouselItem>one</CarouselItem>
    <CarouselItem>two</CarouselItem>
  </CarouselContent>
);

describe("Carousel arrows — position and glyph (gh#899)", () => {
  it("centres on the CONTENT, by subtracting the dots row", () => {
    const rule = css.match(/\.ui-carousel-previous,\n\.ui-carousel-next \{([\s\S]*?)\n\}/)?.[1];
    expect(rule).toBeDefined();
    expect(rule).toMatch(
      /inset-block-start:\s*var\(\s*--carousel-arrow-inset-block-start,\s*calc\(50% - var\(--carousel-dots-block-size\) \/ 2\)\s*\)/,
    );
  });

  it("reserves nothing when there are no dots — 50% is right then", () => {
    expect(tokens).toMatch(/--carousel-dots-block-size:\s*0px/);
    expect(css).toMatch(
      /\.ui-carousel:has\(\.ui-carousel-dots\)\s*\{[^}]*--carousel-dots-block-size:\s*calc\(/,
    );
  });

  it("uses the LOGICAL property, so the vertical rules can override the same one", () => {
    const rule = css.match(/\.ui-carousel-previous,\n\.ui-carousel-next \{([\s\S]*?)\n\}/)?.[1];
    expect(rule).not.toMatch(/(?:^|[\s;{])top\s*:/m);
  });

  it("exposes the position as a knob, `initial` so the default resolves at the call site", () => {
    expect(tokens).toMatch(/--carousel-arrow-inset-block-start:\s*initial/);
  });

  it("lets `children` replace the glyph", () => {
    const { container } = render(
      <Carousel>
        {slides}
        <CarouselPrevious>
          <ArrowLeft data-testid="custom-prev" />
        </CarouselPrevious>
      </Carousel>,
    );
    expect(container.querySelector("[data-testid='custom-prev']")).not.toBeNull();
    // The default chevron must be GONE, not stacked behind the replacement.
    expect(container.querySelectorAll(".ui-carousel-arrow > *")).toHaveLength(1);
  });

  it("keeps the accessible name when the glyph is replaced", () => {
    const { getByRole } = render(
      <Carousel>
        {slides}
        <CarouselNext>
          <ArrowLeft />
        </CarouselNext>
      </Carousel>,
    );
    // The sr-only label is the button's name and does not come from the icon.
    expect(getByRole("button", { name: /.+/ })).toBeTruthy();
  });

  it("keeps the glyph decorative — the box is aria-hidden either way", () => {
    const { container } = render(
      <Carousel>
        {slides}
        <CarouselPrevious />
      </Carousel>,
    );
    expect(container.querySelector(".ui-carousel-arrow")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("sizes the BOX, so a replaced glyph cannot change the row", () => {
    expect(css).toMatch(/\.ui-carousel-arrow \{[^}]*width:\s*var\(--carousel-arrow-icon-size\)/);
    expect(css).toMatch(/\.ui-carousel-arrow > \*\s*\{[^}]*width:\s*100%/);
  });
});
