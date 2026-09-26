import * as React from "react";
import { Pause, Play } from "lucide-react";

import { useTranslation } from "../../i18n/use-translation";
import { useMediaQuery } from "../../lib/hooks";
import { cn } from "../../lib/utils";
import { Button } from "../general/button";
import { revealInMarquee } from "./marquee-reveal";
import { ScrollArea } from "./scroll-area";
import type { MarqueeProp } from "../../props/components/data-display.prop";
import type { GapProp } from "../../props/vocabulary";

export type {
  MarqueeDirectionProp,
  MarqueeSpeedProp,
  MarqueeProp,
  MarqueeProp as MarqueeProps,
} from "../../props/components/data-display.prop";

/**
 * Marquee — a track of content that travels continuously, and the pause control that makes that
 * legal.
 *
 * ## The pause control is the component; the animation is the easy part
 *
 * WCAG 2.2 SC 2.2.2 (Pause, Stop, Hide, Level A) requires that "moving, blinking or scrolling
 * information that (1) starts automatically, (2) lasts more than five seconds, and (3) is
 * presented in parallel with other content" carry "a mechanism for the user to pause, stop, or
 * hide it". A logo wall meets all three conditions on the first frame, and technique **F16** names
 * the omission by example: "a page has a scrolling news ticker without a mechanism to pause it" is
 * a documented FAILURE of the criterion, not a nice-to-have.
 * (https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html, .../failures/F16)
 *
 * So the control here is a real `Button`: in the tab order, with a localized accessible name that
 * says which state the press will produce, an icon that changes with the state, and
 * `aria-controls` pointing at the track it stops. **Hover is not that mechanism** — a keyboard
 * user never hovers, and `pauseOnHover` is offered only as an addition on top. Technique G186 asks
 * for the control to sit "adjacent to the moving content"; it is the track's next sibling.
 *
 * Pausing uses `animation-play-state`, which holds the track exactly where it was and resumes from
 * there — G4's "paused and restarted from where it was paused" and SCR33's requirement that
 * scrolling resume "from the exact stop point". Nothing here restarts a lap.
 *
 * Focus inside the track pauses it too, always, whatever `pauseOnHover` says: a link that is
 * moving cannot be clicked, and a keyboard user who tabs into a travelling track would otherwise
 * be chasing the thing they just focused. The control itself sits OUTSIDE that `:focus-within`
 * scope, so tabbing to the pause button does not silently pause the thing it is offering to pause.
 *
 * ## `prefers-reduced-motion: reduce` does not move at all
 *
 * A marquee that still travels under reduced motion is the whole failure mode — a horizontal
 * translation is the textbook vestibular trigger, which is why MDN's own guidance on the obsolete
 * `<marquee>` element is to "include the `prefers-reduced-motion` CSS `@media` query to stop the
 * animation based on user preference". Under `reduce` this renders **no clones and no animation**:
 * one real copy inside a horizontal `ScrollArea`, so every item stays reachable by scroll, by
 * keyboard (the region takes a tab stop when it overflows — gh#821) and by screen reader. The
 * pause control is not rendered, because nothing is moving for it to pause. The stylesheet carries
 * the same rule independently, so not even the first frame before this hook resolves can travel.
 *
 * ## What is taken from `react-fast-marquee`, and what is refused
 *
 * TAKEN — the layout idea, which is the only part worth porting: measure the content, clone it
 * until the copies fill the viewport plus one, translate the track by exactly one copy, and
 * re-measure with a `ResizeObserver` when either box changes size.
 *
 * REFUSED, each for a stated reason:
 * — `speed` in px/s → a `speed` ordinal over a motion token. A raw px/s is not themeable and says
 *   the same thing on a phone and a 2560px display.
 * — `direction: left | right | up | down` → `start | end`. Physical directions do not survive
 *   `dir="rtl"`, and the vertical axis is a different component that fights the page scroll.
 * — `gradient` / `gradientColor` / `gradientWidth` → `fade` + `--marquee-mask-width`. An opaque
 *   gradient whose default colour is "white" is a white smear on a dark theme; a mask reveals
 *   whatever is behind it.
 * — `pauseOnClick` → not ported. It is implemented there as CSS `:active`, which pauses only
 *   while a mouse button is held down; it is neither a toggle nor reachable from a keyboard.
 * — `delay` / `loop` / `onFinish` / `onCycleComplete` → not ported. A marquee that stops after N
 *   laps is an animation the caller cannot see the end of, and none of the four has a use case
 *   here that `play` does not already cover.
 *
 * And the one the prior art does not have at all: its clones carry **no `aria-hidden`** (issue #40
 * was closed in 2022 without the attribute reaching `master` or the published `dist`), so a
 * screen reader reads the content as many times as the viewport happened to be wide. Here every
 * copy after the first is `aria-hidden` AND `inert`, which is what keeps the duplicates out of
 * the tab order as well as out of the accessibility tree.
 *
 * ## No role, deliberately
 *
 * The root is a plain element. `role="marquee"` exists in WAI-ARIA, but it is a LIVE REGION type —
 * "a type of live region where non-essential information changes frequently". Nothing here
 * changes: the content is static and only its position animates, so the role would promise
 * updates that never arrive and would demand an accessible name for a decorative strip. Where the
 * collection genuinely needs a name, wrap it in a labelled `<section>` — the same ruling `Masonry`
 * records for the same reason.
 */

/** A `GapProp` step as the inline-axis CSS length the package already publishes for it. */
function gapToken(step: GapProp): string {
  if (step === "none" || step === 0) return "0px";
  if (typeof step === "number") return `var(--space-${step})`;
  return `var(--space-inline-${step})`;
}

/**
 * The track is at most this many copies wide.
 *
 * Only degenerate content reaches it — a copy a few pixels wide in a 2560px viewport would
 * otherwise ask for hundreds of clones and take the DOM down with it. At the resting gap even an
 * empty copy is wider than a hundredth of a viewport, so real content never sees this number.
 */
const MAX_COPIES = 20;

type MarqueeStyle = React.CSSProperties & {
  "--marquee-copies"?: number;
  "--marquee-cycle-scale"?: number;
  "--marquee-gap-inline"?: string;
};

export const Marquee = React.forwardRef<HTMLDivElement, MarqueeProp>(function Marquee(
  {
    children,
    play,
    defaultPlay = true,
    onPlayChange,
    direction = "start",
    speed = "base",
    gap,
    pauseOnHover = false,
    fade = false,
    label,
    className,
    style,
    ...props
  },
  ref,
) {
  const { t } = useTranslation();
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  const trackId = React.useId();
  const viewportRef = React.useRef<HTMLDivElement | null>(null);
  const copyRef = React.useRef<HTMLDivElement | null>(null);
  const trackRef = React.useRef<HTMLDivElement | null>(null);

  const [uncontrolledPlay, setUncontrolledPlay] = React.useState(defaultPlay);
  const playing = play ?? uncontrolledPlay;

  /** How many copies fill the viewport plus one, and how long one copy takes at the token pace. */
  const [measurement, setMeasurement] = React.useState({ copies: 2, cycleScale: 1 });

  React.useEffect(() => {
    if (reducedMotion) return undefined;
    const viewport = viewportRef.current;
    const copy = copyRef.current;
    if (!viewport || !copy || typeof ResizeObserver === "undefined") return undefined;

    const measure = () => {
      // `offsetWidth` INCLUDES the copy's trailing padding, which is the inter-copy gap — so this
      // one number is both the width to fill and the exact distance of one lap. Reading a
      // rectangle and adding a gap separately is how a marquee gets a visible seam.
      const copyWidth = copy.offsetWidth;
      const viewportWidth = viewport.offsetWidth;
      if (copyWidth <= 0 || viewportWidth <= 0) return;
      const copies = Math.min(MAX_COPIES, Math.ceil(viewportWidth / copyWidth) + 1);
      // Rounded because a sub-pixel re-measure that changes nothing visible must not re-render.
      const cycleScale = Math.round((copyWidth / viewportWidth) * 1000) / 1000;
      setMeasurement((current) =>
        current.copies === copies && current.cycleScale === cycleScale
          ? current
          : { copies, cycleScale },
      );
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(copy);
    return () => {
      observer.disconnect();
    };
  }, [reducedMotion, children]);

  const setPlaying = (next: boolean) => {
    if (play === undefined) setUncontrolledPlay(next);
    onPlayChange?.(next);
  };

  const rootStyle: MarqueeStyle = {
    ...style,
    ...(gap === undefined ? null : { "--marquee-gap-inline": gapToken(gap) }),
  };

  if (reducedMotion) {
    return (
      <div
        ref={ref}
        data-slot="marquee"
        data-reduced-motion="true"
        data-direction={direction}
        className={cn("ui-marquee", className)}
        style={rootStyle}
        {...props}
      >
        <ScrollArea
          orientation="horizontal"
          className="ui-marquee-scroller"
          label={typeof label === "string" ? label : undefined}
        >
          <div id={trackId} data-slot="marquee-track" className="ui-marquee-track">
            <div ref={copyRef} data-slot="marquee-copy" className="ui-marquee-copy">
              {children}
            </div>
          </div>
        </ScrollArea>
      </div>
    );
  }

  const animatedStyle: MarqueeStyle = {
    ...rootStyle,
    "--marquee-copies": measurement.copies,
    "--marquee-cycle-scale": measurement.cycleScale,
  };

  // The name states WHAT THE PRESS WILL DO, and that is why `label` cannot simply replace it:
  // a caller string ("the partner logos") would keep saying the same thing in both states, so a
  // screen-reader user would hear "pause" on a button that resumes. `label` therefore names the
  // CONTENT and the verb stays the component's, interpolated through the catalog so the two
  // compose in each locale's own order.
  const named = typeof label === "string" && label.trim() !== "";
  const controlLabel = playing
    ? named
      ? t("dataDisplay.marquee.pauseNamed", { label: label as string })
      : t("dataDisplay.marquee.pause")
    : named
      ? t("dataDisplay.marquee.playNamed", { label: label as string })
      : t("dataDisplay.marquee.play");

  return (
    <div
      ref={ref}
      data-slot="marquee"
      data-direction={direction}
      data-speed={speed}
      data-playing={playing ? "true" : "false"}
      data-pause-on-hover={pauseOnHover ? "true" : "false"}
      data-fade={fade ? "true" : "false"}
      className={cn("ui-marquee", className)}
      style={animatedStyle}
      {...props}
    >
      <div
        ref={viewportRef}
        data-slot="marquee-viewport"
        className="ui-marquee-viewport"
        // Focus pauses the track (motion.css), but an item that has travelled off the inline-start
        // side cannot be scrolled back — the browser leaves it focused and invisible. Seek the lap
        // instead, after the browser has done its own scrolling (gh#983).
        onFocus={(event) => {
          const item = event.target;
          requestAnimationFrame(() => {
            if (viewportRef.current && trackRef.current) {
              revealInMarquee(viewportRef.current, trackRef.current, item);
            }
          });
        }}
      >
        <div ref={trackRef} id={trackId} data-slot="marquee-track" className="ui-marquee-track">
          <div ref={copyRef} data-slot="marquee-copy" className="ui-marquee-copy">
            {children}
          </div>
          {Array.from({ length: measurement.copies - 1 }, (_, index) => (
            // Decorative by construction: `aria-hidden` keeps the duplicate out of the
            // accessibility tree and `inert` keeps it out of the tab order. The prior art has
            // neither, which is why its content is announced once per screenful of width.
            <div
              key={index}
              data-slot="marquee-clone"
              className="ui-marquee-copy"
              aria-hidden="true"
              inert
            >
              {children}
            </div>
          ))}
        </div>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        data-slot="marquee-control"
        className="ui-marquee-control"
        aria-label={controlLabel}
        aria-controls={trackId}
        onClick={() => {
          setPlaying(!playing);
        }}
      >
        {playing ? (
          <Pause className="ui-marquee-control-glyph" aria-hidden="true" />
        ) : (
          <Play className="ui-marquee-control-glyph" aria-hidden="true" />
        )}
      </Button>
    </div>
  );
});
