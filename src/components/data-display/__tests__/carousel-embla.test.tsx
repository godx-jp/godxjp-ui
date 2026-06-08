import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock embla so we control snaps + scroll affordances (jsdom can't measure layout).
const { emblaApi } = vi.hoisted(() => ({
  emblaApi: {
    scrollSnapList: () => [0, 0.5, 1],
    selectedScrollSnap: () => 1,
    canScrollPrev: () => true,
    canScrollNext: () => true,
    scrollPrev: vi.fn(),
    scrollNext: vi.fn(),
    scrollTo: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  },
}));

vi.mock("embla-carousel-react", () => ({
  default: () => [() => {}, emblaApi],
}));

import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../carousel";

function Gallery() {
  return (
    <Carousel>
      <CarouselContent>
        <CarouselItem>1</CarouselItem>
        <CarouselItem>2</CarouselItem>
        <CarouselItem>3</CarouselItem>
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
      <CarouselDots />
    </Carousel>
  );
}

describe("Carousel (embla-driven)", () => {
  it("renders one dot per snap and marks the selected one current", async () => {
    render(<Gallery />);
    const tablist = await screen.findByRole("tablist");
    const tabs = within(tablist).getAllByRole("tab");
    expect(tabs).toHaveLength(3);
    expect(tabs[1]).toHaveAttribute("aria-current", "true"); // selectedScrollSnap() === 1
    expect(tabs[0]).not.toHaveAttribute("aria-current");
  });

  it("clicking a dot scrolls to that index", async () => {
    const user = userEvent.setup();
    render(<Gallery />);
    const tabs = within(await screen.findByRole("tablist")).getAllByRole("tab");
    await user.click(tabs[2]);
    expect(emblaApi.scrollTo).toHaveBeenCalledWith(2);
  });

  it("prev/next are enabled and drive embla", async () => {
    const user = userEvent.setup();
    const { container } = render(<Gallery />);
    await screen.findByRole("tablist"); // wait for the effect to settle
    const prev = container.querySelector('[data-slot="carousel-previous"]') as HTMLButtonElement;
    const next = container.querySelector('[data-slot="carousel-next"]') as HTMLButtonElement;
    expect(prev).not.toBeDisabled();
    expect(next).not.toBeDisabled();
    await user.click(next);
    expect(emblaApi.scrollNext).toHaveBeenCalled();
    await user.click(prev);
    expect(emblaApi.scrollPrev).toHaveBeenCalled();
  });
});
