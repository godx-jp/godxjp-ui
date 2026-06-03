import * as React from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="carousel-content"
    className={cn("ui-carousel-content", className)}
    {...props}
  />
));
CarouselContent.displayName = "CarouselContent";

export const CarouselItem = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="carousel-item"
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
      <span className="sr-only">Previous</span>
    </button>
  );
});
CarouselPrevious.displayName = "CarouselPrevious";

export const CarouselNext = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<"button">
>(({ className, ...props }, ref) => {
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
      <span className="sr-only">Next</span>
    </button>
  );
});
CarouselNext.displayName = "CarouselNext";
