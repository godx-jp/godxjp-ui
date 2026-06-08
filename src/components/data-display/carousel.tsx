import * as React from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { useTranslation } from "../../i18n/use-translation";
import { cn } from "../../lib/utils";

type UseEmblaReturn = ReturnType<typeof useEmblaCarousel>;

export type CarouselApi = UseEmblaReturn[1];

type CarouselContextValue = {
  canScrollPrev: boolean;
  canScrollNext: boolean;
  /** Index of the currently-selected snap (drives the active dot + value-at-rest). */
  selectedIndex: number;
  /** One entry per scroll snap — `CarouselDots` renders one dot per item. */
  scrollSnaps: number[];
  api: CarouselApi | null;
  scrollPrev: () => void;
  scrollNext: () => void;
  scrollTo: (index: number) => void;
};

const CarouselContext = React.createContext<CarouselContextValue | null>(null);

export const useCarousel = () => {
  const context = React.useContext(CarouselContext);
  if (!context) {
    throw new Error("useCarousel must be used within a Carousel component");
  }
  return context;
};

export const Carousel = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & {
    opts?: Parameters<typeof useEmblaCarousel>[0];
    plugins?: Parameters<typeof useEmblaCarousel>[1];
    setApi?: (api: CarouselApi) => void;
  }
>(({ className, opts, plugins, setApi, children, ...props }, ref) => {
  const { t } = useTranslation();
  const [emblaRef, api] = useEmblaCarousel(opts, plugins);
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([]);

  const onSelect = React.useCallback(() => {
    if (!api) return;
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
    setSelectedIndex(api.selectedScrollSnap());
  }, [api]);

  React.useEffect(() => {
    if (!api) return undefined;

    onSelect();
    setScrollSnaps(api.scrollSnapList());
    setApi?.(api);
    api.on("reInit", onSelect);
    api.on("reInit", () => setScrollSnaps(api.scrollSnapList()));
    api.on("select", onSelect);
    return () => {
      api.off("reInit", onSelect);
      api.off("select", onSelect);
    };
  }, [api, onSelect, setApi]);

  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev();
  }, [api]);

  const scrollNext = React.useCallback(() => {
    api?.scrollNext();
  }, [api]);

  const scrollTo = React.useCallback(
    (index: number) => {
      api?.scrollTo(index);
    },
    [api],
  );

  const contextValue = React.useMemo(
    () => ({
      canScrollPrev,
      canScrollNext,
      selectedIndex,
      scrollSnaps,
      api,
      scrollPrev,
      scrollNext,
      scrollTo,
    }),
    [
      canScrollPrev,
      canScrollNext,
      selectedIndex,
      scrollSnaps,
      api,
      scrollPrev,
      scrollNext,
      scrollTo,
    ],
  );

  return (
    <CarouselContext.Provider value={contextValue}>
      <div
        ref={ref}
        data-slot="carousel"
        className={cn("ui-carousel", className)}
        data-orientation={opts?.axis === "y" ? "vertical" : "horizontal"}
        role="region"
        aria-roledescription={t("dataDisplay.carousel.roleDescription")}
        aria-label={t("dataDisplay.carousel.ariaLabel")}
        {...props}
      >
        <div className="ui-carousel-viewport" ref={emblaRef}>
          {children}
        </div>
      </div>
    </CarouselContext.Provider>
  );
});
Carousel.displayName = "Carousel";

export const CarouselContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, children, ...props }, ref) => {
  const { t } = useTranslation();

  // Decorate each slide with "N of M" so screen readers announce position. The total is the count
  // of element children, and each slide's running index drives its label — consumer-supplied
  // aria-labels on an item still win because the injected label is only a default.
  // NB: use a running counter, NOT `toArray().indexOf(child)` — toArray re-keys/clones the
  // children so the cloned entries never identity-match the originals from Children.map (the
  // indexOf would always return -1 and silently skip the injection).
  const total = React.Children.toArray(children).filter(React.isValidElement).length;
  let slideIndex = 0;
  const decorated = React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return child;
    const index = slideIndex++;
    const childProps = child.props as CarouselItemProps;
    // Don't clobber a consumer-provided label.
    if (childProps["aria-label"] != null) return child;
    return React.cloneElement(child as React.ReactElement<CarouselItemProps>, {
      "aria-label": t("dataDisplay.carousel.slideLabel", {
        index: index + 1,
        total,
      }),
    });
  });

  return (
    <div
      ref={ref}
      data-slot="carousel-content"
      className={cn("ui-carousel-content", className)}
      {...props}
    >
      {decorated}
    </div>
  );
});
CarouselContent.displayName = "CarouselContent";

type CarouselItemProps = React.ComponentPropsWithoutRef<"div">;

export const CarouselItem = React.forwardRef<HTMLDivElement, CarouselItemProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="carousel-item"
      role="group"
      aria-roledescription="slide"
      className={cn("ui-carousel-item", className)}
      {...props}
    />
  ),
);
CarouselItem.displayName = "CarouselItem";

export const CarouselPrevious = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<"button">
>(({ className, ...props }, ref) => {
  const { t } = useTranslation();
  const { canScrollPrev, scrollPrev } = useCarousel();
  return (
    <button
      ref={ref}
      type="button"
      data-slot="carousel-previous"
      disabled={!canScrollPrev}
      className={cn("ui-carousel-previous", className)}
      onClick={scrollPrev}
      {...props}
    >
      <ChevronLeft className="ui-carousel-arrow" aria-hidden="true" />
      <span className="sr-only">{t("dataDisplay.carousel.previous")}</span>
    </button>
  );
});
CarouselPrevious.displayName = "CarouselPrevious";

export const CarouselNext = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<"button">
>(({ className, ...props }, ref) => {
  const { t } = useTranslation();
  const { canScrollNext, scrollNext } = useCarousel();
  return (
    <button
      ref={ref}
      type="button"
      data-slot="carousel-next"
      disabled={!canScrollNext}
      className={cn("ui-carousel-next", className)}
      onClick={scrollNext}
      {...props}
    >
      <ChevronRight className="ui-carousel-arrow" aria-hidden="true" />
      <span className="sr-only">{t("dataDisplay.carousel.next")}</span>
    </button>
  );
});
CarouselNext.displayName = "CarouselNext";

/**
 * Dot indicators — one round dot per scroll snap, the active one widened + filled. Reads the Embla
 * api from context (no `setApi` plumbing needed); each dot is a real `<button>` with an i18n
 * accessible name and `aria-current` on the active slide, calling `scrollTo(i)`. Drop it inside
 * `<Carousel>` after the track: `<CarouselContent/> … <CarouselDots/>`.
 */
export const CarouselDots = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => {
    const { t } = useTranslation();
    const { scrollSnaps, selectedIndex, scrollTo } = useCarousel();

    if (scrollSnaps.length <= 1) return null;

    return (
      <div
        ref={ref}
        data-slot="carousel-dots"
        className={cn("ui-carousel-dots", className)}
        role="tablist"
        aria-label={t("dataDisplay.carousel.dotsLabel")}
        {...props}
      >
        {scrollSnaps.map((_, index) => {
          const active = index === selectedIndex;
          return (
            <button
              key={index}
              type="button"
              role="tab"
              data-slot="carousel-dot"
              data-active={active ? "" : undefined}
              className="ui-carousel-dot"
              aria-selected={active}
              aria-current={active ? "true" : undefined}
              aria-label={t("dataDisplay.carousel.goToSlide", { index: index + 1 })}
              onClick={() => scrollTo(index)}
            />
          );
        })}
      </div>
    );
  },
);
CarouselDots.displayName = "CarouselDots";
