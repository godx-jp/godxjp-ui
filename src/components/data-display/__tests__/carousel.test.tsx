import { beforeAll, describe, expect, it, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { renderWithUi, screen, userEvent } from "@/test/render";

// embla-carousel relies on IntersectionObserver/ResizeObserver, which jsdom lacks.
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

import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  useCarousel,
} from "../carousel";

describe("Carousel root", () => {
  it("exposes a labelled carousel region, horizontal by default", () => {
    renderWithUi(
      <Carousel>
        <CarouselContent>
          <CarouselItem>A</CarouselItem>
        </CarouselContent>
      </Carousel>,
    );
    const region = screen.getByRole("region");
    expect(region).toHaveAttribute("aria-roledescription");
    expect(region).toHaveAttribute("data-orientation", "horizontal");
  });

  it("reports a vertical orientation when the embla axis is y", () => {
    renderWithUi(
      <Carousel opts={{ axis: "y" }}>
        <CarouselContent>
          <CarouselItem>A</CarouselItem>
        </CarouselContent>
      </Carousel>,
    );
    expect(screen.getByRole("region")).toHaveAttribute("data-orientation", "vertical");
  });

  it("hands the embla api back through setApi", async () => {
    const setApi = vi.fn();
    renderWithUi(
      <Carousel setApi={setApi}>
        <CarouselContent>
          <CarouselItem>A</CarouselItem>
        </CarouselContent>
      </Carousel>,
    );
    await waitFor(() => expect(setApi).toHaveBeenCalled());
  });
});

describe("CarouselContent — slide labelling", () => {
  it("renders every slide and preserves a consumer-provided aria-label", () => {
    renderWithUi(
      <CarouselContent>
        <CarouselItem>first</CarouselItem>
        <CarouselItem aria-label="custom slide">second</CarouselItem>
      </CarouselContent>,
    );
    const items = screen.getAllByRole("group");
    expect(items).toHaveLength(2);
    expect(items[1]).toHaveAttribute("aria-label", "custom slide"); // consumer wins
  });

  it("passes non-element children through untouched", () => {
    renderWithUi(
      <CarouselContent>
        plain text
        <CarouselItem>slide</CarouselItem>
      </CarouselContent>,
    );
    expect(screen.getByText(/plain text/)).toBeInTheDocument();
  });
});

describe("CarouselItem", () => {
  it("is a slide group", () => {
    renderWithUi(<CarouselItem>x</CarouselItem>);
    const group = screen.getByRole("group");
    expect(group).toHaveAttribute("aria-roledescription", "slide");
  });
});

describe("Carousel arrows + dots", () => {
  it("prev/next render labelled controls and are disabled at rest (no overflow)", async () => {
    const user = userEvent.setup();
    const { container } = renderWithUi(
      <Carousel>
        <CarouselContent>
          <CarouselItem>only</CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>,
    );
    const prev = container.querySelector('[data-slot="carousel-previous"]') as HTMLButtonElement;
    const next = container.querySelector('[data-slot="carousel-next"]') as HTMLButtonElement;
    // each control carries an sr-only label and both are disabled when nothing can scroll
    expect(prev.querySelector(".sr-only")?.textContent).toBeTruthy();
    expect(next.querySelector(".sr-only")?.textContent).toBeTruthy();
    expect(prev).toBeDisabled();
    expect(next).toBeDisabled();
    // clicking a disabled control is a no-op and must not throw
    await user.click(prev);
  });

  it("CarouselDots renders nothing when there is a single snap", () => {
    renderWithUi(
      <Carousel>
        <CarouselContent>
          <CarouselItem>only</CarouselItem>
        </CarouselContent>
        <CarouselDots />
      </Carousel>,
    );
    expect(screen.queryByRole("tablist")).toBeNull();
  });
});

describe("useCarousel", () => {
  it("throws when used outside a <Carousel>", () => {
    const Probe = () => {
      useCarousel();
      return null;
    };
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Probe />)).toThrow(/useCarousel must be used within a Carousel/);
    spy.mockRestore();
  });
});
