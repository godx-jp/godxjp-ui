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

  const onSelect = React.useCallback(() => {
    if (!api) return;
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, [api]);

  React.useEffect(() => {
    if (!api) return undefined;

    onSelect();
    setApi?.(api);
    api.on("reInit", onSelect);
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
      api,
      scrollPrev,
      scrollNext,
      scrollTo,
    }),
    [canScrollPrev, canScrollNext, api, scrollPrev, scrollNext, scrollTo],
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
  // of element children, and each slide's index drives its label — consumer-supplied aria-labels on
  // an item still win because the injected label is only a default (overridden by the item's props).
  const items = React.Children.toArray(children).filter(React.isValidElement);
  const total = items.length;
  const decorated = React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return child;
    const index = items.indexOf(child);
    if (index === -1) return child;
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
