import {
  Children,
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "../cn";

/**
 * Carousel — image / content slide deck.
 *
 * Compositional: pass `<CarouselSlide>` children, one per slide. The
 * track translates by index along the configured `orientation`. Plain
 * React + CSS transform — no external dep. Autoplay pauses on hover
 * (mouseenter / mouseleave handlers; CSS `:hover` cannot reach JS).
 *
 * Prop vocabulary follows cardinal rule 23 §B: `value` /
 * `defaultValue` / `onValueChange` for selection state (current slide
 * index), `orientation`, `autoplay` (ms), `loop`, `arrows`, `dots`.
 * NEVER Ant's `activeKey` / `autoplaySpeed`.
 *
 * @example
 *   <Carousel autoplay={3000}>
 *     <CarouselSlide><img src="…" alt="…" /></CarouselSlide>
 *     <CarouselSlide><img src="…" alt="…" /></CarouselSlide>
 *   </Carousel>
 */

export interface CarouselProps {
  /** Current slide index (0-based). */
  value?: number;
  /** Initial slide index when uncontrolled. */
  defaultValue?: number;
  onValueChange?: (index: number) => void;
  /** Auto-advance interval in ms. Omit / 0 to disable. */
  autoplay?: number;
  /** Wrap from last → first / first → last. Default true. */
  loop?: boolean;
  /** Show prev / next arrows. Default true. */
  arrows?: boolean;
  /** Show dot indicators. Default true. */
  dots?: boolean;
  /** Stack axis. Default "horizontal". */
  orientation?: "horizontal" | "vertical";
  className?: string;
  children?: ReactNode;
}

export interface CarouselSlideProps extends ComponentProps<"div"> {}

export const CarouselSlide = forwardRef<HTMLDivElement, CarouselSlideProps>(
  function CarouselSlide({ className, ...rest }, ref) {
    return (
      <div
        ref={ref}
        role="group"
        aria-roledescription="slide"
        className={cn("carousel-slide", className)}
        {...rest}
      />
    );
  },
);

export function Carousel({
  value: controlled,
  defaultValue = 0,
  onValueChange,
  autoplay,
  loop = true,
  arrows = true,
  dots = true,
  orientation = "horizontal",
  className,
  children,
}: CarouselProps) {
  const slides = Children.toArray(children);
  const count = slides.length;

  const [internal, setInternal] = useState(defaultValue);
  const active = controlled ?? internal;

  const [paused, setPaused] = useState(false);

  const goTo = useCallback(
    (next: number) => {
      if (count === 0) return;
      let idx = next;
      if (loop) {
        idx = ((next % count) + count) % count;
      } else {
        idx = Math.max(0, Math.min(count - 1, next));
      }
      if (controlled === undefined) setInternal(idx);
      onValueChange?.(idx);
    },
    [controlled, count, loop, onValueChange],
  );

  const next = useCallback(() => goTo(active + 1), [active, goTo]);
  const prev = useCallback(() => goTo(active - 1), [active, goTo]);

  // Autoplay loop. Pause on hover (paused === true).
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (!autoplay || autoplay <= 0 || paused || count < 2) return;
    autoplayRef.current = setInterval(() => {
      goTo(active + 1);
    }, autoplay);
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
  }, [autoplay, paused, active, count, goTo]);

  const isVertical = orientation === "vertical";
  const trackStyle = isVertical
    ? { transform: `translateY(-${active * 100}%)`, flexDirection: "column" as const }
    : { transform: `translateX(-${active * 100}%)` };

  return (
    <div
      className={cn("carousel", className)}
      data-orientation={orientation}
      role="region"
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="carousel-viewport">
        <div className="carousel-track" style={trackStyle}>
          {slides}
        </div>
      </div>

      {arrows && count > 1 && (
        <>
          <button
            type="button"
            className="carousel-arrow prev"
            aria-label="Previous slide"
            onClick={prev}
            disabled={!loop && active === 0}
          >
            {isVertical ? <ChevronUp size={16} /> : <ChevronLeft size={16} />}
          </button>
          <button
            type="button"
            className="carousel-arrow next"
            aria-label="Next slide"
            onClick={next}
            disabled={!loop && active === count - 1}
          >
            {isVertical ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        </>
      )}

      {dots && count > 1 && (
        <div className="carousel-dots" role="tablist" aria-label="Slides">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-label={`Go to slide ${i + 1}`}
              aria-selected={i === active}
              data-active={i === active}
              className="carousel-dot"
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
