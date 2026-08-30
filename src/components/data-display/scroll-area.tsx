import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";

import { cn } from "../../lib/utils";
import type { ScrollAreaProp } from "../../props/components/data-display.prop";

export type ScrollAreaProps = ScrollAreaProp &
  Omit<React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>, keyof ScrollAreaProp>;

/** The knob a service moves to retune "close enough to the bottom to keep following". */
const ANCHOR_OFFSET_TOKEN = "--scroll-area-anchor-offset";
/** Only reached when the stylesheet is absent (SSR string render, a test without tokens). */
const ANCHOR_OFFSET_FALLBACK_PX = 48;
const ROOT_FONT_SIZE_FALLBACK_PX = 16;

/** CSS length → px, for the units a distance knob is realistically written in. */
function cssLengthToPx(value: string, rootFontSize: number): number | undefined {
  const match = /^(-?\d*\.?\d+)(px|rem|em)?$/.exec(value.trim());
  if (match == null) return undefined;
  const amount = Number(match[1]);
  if (!Number.isFinite(amount)) return undefined;
  return match[2] === "rem" || match[2] === "em" ? amount * rootFontSize : amount;
}

/**
 * Resolve the anchor band once per mount. A `scroll` handler cannot ask CSS "am I within
 * --scroll-area-anchor-offset of the bottom?", so the token is read off the element — which keeps
 * it a real theme knob (including a `[data-tenant]` scope) instead of a literal in a comparison.
 */
function readAnchorOffset(element: HTMLElement): number {
  if (typeof window === "undefined" || typeof window.getComputedStyle !== "function") {
    return ANCHOR_OFFSET_FALLBACK_PX;
  }
  const rootFontSize =
    cssLengthToPx(
      window.getComputedStyle(element.ownerDocument.documentElement).fontSize || "",
      ROOT_FONT_SIZE_FALLBACK_PX,
    ) ?? ROOT_FONT_SIZE_FALLBACK_PX;
  const declared = window.getComputedStyle(element).getPropertyValue(ANCHOR_OFFSET_TOKEN);
  return cssLengthToPx(declared, rootFontSize) ?? ANCHOR_OFFSET_FALLBACK_PX;
}

/**
 * Find the element whose children are the ROWS.
 *
 * Radix wraps the children in one content div, and consumers are told to wrap their own content in
 * a single element (that is how the viewport measures overflow), so the rows typically sit two
 * levels down: `viewport > content > Flex > row…`. Anchoring to the wrapper instead of to a row
 * would compensate by exactly zero — the wrapper's `offsetTop` never changes — so descend past
 * every single-child wrapper. Re-resolved on each use: a stream that starts empty grows its
 * wrapper's children later.
 */
function resolveRowContainer(root: Element): Element {
  let container = root;
  while (container.children.length === 1 && container.firstElementChild) {
    container = container.firstElementChild;
  }
  return container;
}

/**
 * The child under the viewport's top edge, and how far above that edge it starts. This pair is the
 * reader's real position: "the message I am looking at, and where on screen it sits". Restoring it
 * after the content changes is what keeps a prepended page of history from throwing the reader
 * somewhere else.
 *
 * Children are laid out in document order, so `offsetTop` is non-decreasing — binary search, so a
 * 5,000-message stream costs ~12 reads per scroll event rather than 5,000.
 */
function findAnchorChild(root: Element, scrollTop: number): HTMLElement | null {
  // Indexed straight into the live HTMLCollection: materialising an array first would put the
  // 5,000-element cost back on every scroll event that the binary search exists to remove.
  const children = resolveRowContainer(root).children;
  let low = 0;
  let high = children.length - 1;
  let found: HTMLElement | null = null;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const child = children[mid];
    if (!(child instanceof HTMLElement)) break;
    if (child.offsetTop + child.offsetHeight > scrollTop) {
      found = child;
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }
  return found;
}

/**
 * Scroll WITHOUT animating. `behavior: "instant"` beats a theme's `scroll-behavior: smooth`, so
 * anchoring can never animate the reader down the page (WCAG 2.3.3 / prefers-reduced-motion) and a
 * prepend correction can never be visible as a slide. `scrollTo` is absent in jsdom; the property
 * write is the same offset by another route.
 */
function setScrollOffset(element: HTMLElement, top: number): void {
  if (typeof element.scrollTo === "function") element.scrollTo({ top, behavior: "instant" });
  else element.scrollTop = top;
}

/**
 * Bottom anchoring — the behaviour a live stream needs and the reason it belongs to whoever owns
 * the scrolling box rather than to every consumer's 60 re-derived lines.
 *
 * The rule is NOT "scroll to the bottom when content arrives" — that is the bug. It is:
 *
 *  - pinned (the reader is within `offset` of the bottom) → new content keeps them at the bottom;
 *  - unpinned (they scrolled up to read history) → nothing may move the viewport, ever, until they
 *    come back inside the band themselves;
 *  - either way, content inserted ABOVE the read position is compensated so the item under their
 *    eyes does not jump.
 *
 * That last part is what CSS `overflow-anchor` does natively, and this compensation is written to
 * be IDEMPOTENT with it: it restores the recorded (anchor child, offset-from-top-edge) pair, so
 * where the browser already adjusted the offset the correction computes to zero and writes
 * nothing. It exists for the cases native anchoring does not cover — Safari, which does not
 * implement scroll anchoring at all, and any scroller sitting at `scrollTop === 0`, where there is
 * no anchor node to select and a prepend therefore shoves the whole conversation down.
 *
 * Nothing here touches focus: the viewport's own `scrollTop` is the only thing written.
 */
function useBottomAnchor(
  viewport: HTMLDivElement | null,
  enabled: boolean,
  offset: number | undefined,
  onAnchoredChange: ((anchored: boolean) => void) | undefined,
): void {
  const onAnchoredChangeRef = React.useRef(onAnchoredChange);
  React.useEffect(() => {
    onAnchoredChangeRef.current = onAnchoredChange;
  }, [onAnchoredChange]);

  React.useEffect(() => {
    if (!viewport || !enabled) return;

    // Radix wraps the children in one content div; that wrapper is what grows, and its children
    // are the rows we anchor to.
    const content = viewport.firstElementChild ?? viewport;
    const band = offset ?? readAnchorOffset(viewport);

    let anchored = true;
    let record: { node: HTMLElement; top: number } | null = null;

    const distanceFromBottom = () =>
      viewport.scrollHeight - viewport.clientHeight - viewport.scrollTop;

    const setAnchored = (next: boolean) => {
      if (anchored === next) return;
      anchored = next;
      onAnchoredChangeRef.current?.(next);
    };

    const remember = () => {
      const node = findAnchorChild(content, viewport.scrollTop);
      record = node ? { node, top: node.offsetTop - viewport.scrollTop } : null;
    };

    const pinToBottom = () => {
      // Clamped: content shorter than the viewport gives a negative bottom, and anchoring an empty
      // or one-line stream must be a no-op rather than a scroll to a position that cannot exist.
      setScrollOffset(viewport, Math.max(0, viewport.scrollHeight - viewport.clientHeight));
    };

    const handleScroll = () => {
      // The ONLY place the pin is granted or revoked, and it is driven by the reader alone.
      setAnchored(distanceFromBottom() <= band);
      remember();
    };

    const handleContentChange = () => {
      if (anchored) {
        pinToBottom();
      } else if (record && viewport.contains(record.node)) {
        const target = Math.max(0, record.node.offsetTop - record.top);
        if (target !== viewport.scrollTop) setScrollOffset(viewport, target);
        // Compensating does not re-pin (the distance to the bottom is unchanged by a prepend), but
        // content REMOVED below can leave the reader at the bottom for real.
        setAnchored(distanceFromBottom() <= band);
      }
      remember();
    };

    // Mount pinned: opening a channel lands on the newest message, not on the oldest.
    pinToBottom();
    remember();

    viewport.addEventListener("scroll", handleScroll, { passive: true });

    const observers: Array<{ disconnect: () => void }> = [];
    if (typeof MutationObserver !== "undefined") {
      // Rows arriving over a socket, a page of history prepended, a streaming response appending
      // text into an existing node.
      const mutationObserver = new MutationObserver(handleContentChange);
      mutationObserver.observe(content, { childList: true, subtree: true, characterData: true });
      observers.push(mutationObserver);
    }
    if (typeof ResizeObserver !== "undefined") {
      // Growth with no DOM mutation at all: an image that finishes loading, a row that rewraps
      // when the panel narrows, a composer pushing the viewport shorter.
      const resizeObserver = new ResizeObserver(handleContentChange);
      resizeObserver.observe(viewport);
      resizeObserver.observe(content);
      observers.push(resizeObserver);
    }

    return () => {
      viewport.removeEventListener("scroll", handleScroll);
      for (const observer of observers) observer.disconnect();
    };
  }, [viewport, enabled, offset]);
}

export const ScrollArea = React.forwardRef<
  React.ComponentRef<typeof ScrollAreaPrimitive.Root>,
  ScrollAreaProps
>(
  (
    { className, children, viewportRef, anchor = "none", anchorOffset, onAnchoredChange, ...props },
    ref,
  ) => {
    // State, not a ref, so the anchoring effect re-runs the moment the viewport mounts.
    const [viewport, setViewport] = React.useState<HTMLDivElement | null>(null);
    const attachViewport = React.useCallback(
      (node: HTMLDivElement | null) => {
        setViewport(node);
        if (typeof viewportRef === "function") viewportRef(node);
        else if (viewportRef)
          (viewportRef as React.RefObject<HTMLDivElement | null>).current = node;
      },
      [viewportRef],
    );

    useBottomAnchor(viewport, anchor === "bottom", anchorOffset, onAnchoredChange);

    return (
      <ScrollAreaPrimitive.Root
        ref={ref}
        className={cn("relative overflow-hidden", className)}
        {...props}
      >
        {/* Keep the scroll viewport keyboard-reachable so overflowing content can be scrolled
            without a pointer (WCAG 2.1.1 / axe scrollable-region-focusable). `viewportRef` is the
            supported handle on this element — it is NOT an invitation to drop the tab stop. */}
        <ScrollAreaPrimitive.Viewport
          ref={attachViewport}
          tabIndex={0}
          data-slot="scroll-area-viewport"
          data-anchor={anchor}
          className="size-full rounded-[inherit]"
        >
          {children}
        </ScrollAreaPrimitive.Viewport>
        <ScrollBar />
        <ScrollAreaPrimitive.Corner />
      </ScrollAreaPrimitive.Root>
    );
  },
);
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

export const ScrollBar = React.forwardRef<
  React.ComponentRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "ui-scroll-area-bar flex touch-none transition-colors select-none",
      orientation === "vertical" &&
        "ui-scroll-area-bar--vertical h-full border-s border-s-transparent",
      orientation === "horizontal" &&
        "ui-scroll-area-bar--horizontal flex-col border-t border-t-transparent",
      className,
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="ui-scroll-area-thumb bg-border relative flex-1" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
));
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;
