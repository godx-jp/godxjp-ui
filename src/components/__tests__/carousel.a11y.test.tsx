import { beforeAll, describe, it, vi } from "vitest";
import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../data-display/carousel";
import { expectNoA11yViolations } from "@/test/a11y";

// embla-carousel calls `new IntersectionObserver(...)` on init, which jsdom does
// not implement. Provide a no-op stub so the carousel can mount under test.
beforeAll(() => {
  if (typeof globalThis.IntersectionObserver === "undefined") {
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        observe = vi.fn();
        unobserve = vi.fn();
        disconnect = vi.fn();
        takeRecords = vi.fn(() => []);
        root = null;
        rootMargin = "";
        thresholds = [];
      },
    );
  }
});

// The carousel is a labeled region with slide groups and prev/next controls;
// each slide and arrow must be announced ("slide N of M", named buttons).
describe("Carousel a11y", () => {
  it("has no axe violations with slides and controls", async () => {
    await expectNoA11yViolations(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Slide one</CarouselItem>
          <CarouselItem>Slide two</CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
        <CarouselDots />
      </Carousel>,
    );
  });
});
