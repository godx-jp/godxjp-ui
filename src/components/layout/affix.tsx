"use client";

import * as React from "react";

import { isDevelopment } from "../../lib/dev";
import { scrollBoxOf, useInView } from "../../lib/hooks";
import { cn } from "../../lib/utils";
import type { AffixProp } from "../../props/components/layout.prop";

export type {
  AffixProp,
  AffixProp as AffixProps,
  AffixTargetProp,
} from "../../props/components/layout.prop";

/**
 * How far past the pin line the sentinel's clipping box is grown, so that "has not reached the
 * line yet" and "is a mile below the line" are the same answer.
 *
 * It is a LENGTH inside a `rootMargin`, not a design value, which is why it is a constant here and
 * not a token: no theme has an opinion about how far below the fold an element stops being
 * observed, and the only requirement is that it exceed any document a browser will lay out. Both
 * margins are constants, on purpose — the pin OFFSET is owned entirely by CSS (see the header), so
 * neither the observer nor its dependency list ever changes when the offset does.
 */
const OVERSHOOT_MARGIN = "1000000px";
const ROOT_MARGIN_BLOCK_START = `0px 0px ${OVERSHOOT_MARGIN} 0px`;
const ROOT_MARGIN_BLOCK_END = `${OVERSHOOT_MARGIN} 0px 0px 0px`;

/**
 * The scroll box, resolved. `null` is the document viewport — `IntersectionObserver`'s own word.
 *
 * With no `target`, the scroll box is the one the user actually scrolls: the nearest ancestor that
 * scrolls on the block axis — `position: sticky`'s own rule — and the viewport only when there is
 * none (gh#984).
 *
 * The viewport used to be the unconditional default, and inside an inner scroller that is wrong in
 * both directions. `PageContainer fill` (`.ui-page-body`), MasterDetail's master and the docs
 * frame all scroll an element, not the window; the sentinel there is CLIPPED by that element,
 * which the viewport-sized `rootMargin` cannot grow past, so "below the fold" read as "scrolled
 * past" and the bar pinned on load — measured at top 16 while its column sat at 1680 in an 800px
 * viewport. And once scrolled, it would pin to the viewport's edge, over whatever header sits above
 * the scroller. An explicit `target={() => window}` still means the viewport.
 */
function resolveTarget(target: AffixProp["target"], from: HTMLElement | null): HTMLElement | null {
  if (!target) return scrollBoxOf(from);
  const node = target();
  if (!node || typeof window === "undefined" || node === window) return null;
  return node as HTMLElement;
}

/** False inside a `display: none` subtree — the one case where "out of view" is not "scrolled past". */
function isRendered(node: HTMLElement): boolean {
  for (let p: HTMLElement | null = node; p; p = p.parentElement) {
    if (window.getComputedStyle(p).display === "none") return false;
  }
  return true;
}

/**
 * The nearest ancestor that is a CONTAINING BLOCK for `position: fixed`, or `null` for the viewport.
 *
 * `position: fixed` is only fixed to the VIEWPORT while nothing above it has opted out. CSS
 * Transforms 1 §3.2 and Filter Effects 1 §7 say a `filter`, `backdrop-filter`, `transform`,
 * `perspective` or `will-change` naming one of them makes an element the containing block for its
 * fixed descendants; CSS Containment adds `contain: paint | layout | strict | content`.
 *
 * MEASURED, and this is why the function exists (gh#897). A glass theme sets
 * `--card-backdrop-blur-size`, so `[data-slot="card"]` computes `backdrop-filter: blur(16px)
 * saturate(1.7)` — and an Affix inside that Card had its `inset-block-start: 385.5px` resolved from
 * the CARD's top edge at y=1506 instead of the viewport, painting the bar at y=-157, off-screen and
 * over unrelated content. The arithmetic was right the whole time and the reference was wrong.
 *
 * It is not only a themed case: this package's own `.app-main` carries `contain: paint` as the
 * page's scroll boundary, so every Affix in page content already had a containing block. It went
 * unnoticed because that block starts at the top of the content area and the error was one bar
 * height.
 *
 * The trap is documented twice in this repo — at the app-launcher scrim in `shell-layout.css` and
 * in this component's own docblock — which is the point: knowing about it did not stop it, because
 * nothing MEASURED it. This does.
 */
function fixedContainingBlock(node: HTMLElement | null): HTMLElement | null {
  if (typeof window === "undefined") return null;
  for (
    let n = node?.parentElement ?? null;
    n && n !== document.documentElement;
    n = n.parentElement
  ) {
    const cs = window.getComputedStyle(n);
    if (
      cs.filter !== "none" ||
      cs.backdropFilter !== "none" ||
      cs.transform !== "none" ||
      cs.perspective !== "none" ||
      /transform|filter|perspective/.test(cs.willChange) ||
      /paint|layout|strict|content/.test(cs.contain)
    ) {
      return n;
    }
  }
  return null;
}

type AffixStyle = React.CSSProperties & {
  "--affix-inset-block-start"?: string;
  "--affix-inset-block-end"?: string;
  "--affix-target-inset"?: string;
  "--affix-content-inline-size"?: string;
};

/**
 * Affix — Ant Design `Affix` (6.6.5): pin an element to its scrollport once the page scrolls past
 * it, and REPORT that it is pinned.
 *
 * ## Why this is not `position: sticky`
 *
 * `position: sticky` pins, and then says nothing. There is no state, no attribute and no callback,
 * so a sticky header cannot shrink on pin, cannot swap a wordmark for a monogram, cannot raise its
 * shadow, and cannot tell the page that the filters are now floating over the table. Both website
 * showcases in `docs/showcase/` wrote `position: sticky` and got exactly nothing out of it. This
 * component's product is the boolean: `data-affixed` for CSS, `onChange` for JavaScript.
 *
 * It also pins against a scroll box that need not be the nearest scrolling ancestor — antd's
 * `target`, which `FloatButton.BackTop` already spells the same way here — where `sticky` is
 * captive to whichever ancestor happens to scroll.
 *
 * ## The placeholder is as much the component as the pin is
 *
 * Taking an element out of flow removes its height from the page, so everything below jumps UP by
 * exactly that height at the instant of pinning and drops back on release. Every hand-rolled
 * sticky header has this bug and it is invisible until someone measures it. So the outer box stays
 * in flow and, the moment its content goes `position: fixed`, is given the content's MEASURED
 * block size. Measured, not declared: a bar re-wraps between widths, and a number written once in
 * CSS is wrong at every other width.
 *
 * ## One `IntersectionObserver`, and it is not this file's
 *
 * The pin is a threshold crossing — the one question `IntersectionObserver` exists to answer — and
 * this component asks it through `useInView` (`src/lib/hooks.ts`), the library's single observer
 * wrapper, which gained `rootMargin` and `assumeInView` for exactly these two needs. Nothing here
 * polls, and nothing here listens to `scroll` at all when the scroll box is the viewport: antd's
 * `Affix` re-measures on seven event types on every animation frame of every scroll, and all of
 * that is replaced by one observer entry per transition.
 *
 * The observed element is a zero-ish **sentinel** at the pinning edge, not the box itself. This is
 * the published `position: sticky` sentinel technique ("An event for position: sticky",
 * developers.google.com), and the separate node is arithmetic, not decoration: the box's own
 * intersection flips when its TRAILING edge crosses the line, a full bar-height after the moment
 * it should pin. A hairline node at the LEADING edge flips on the leading edge. It is
 * `aria-hidden`, out of flow, and contributes nothing to the measured height.
 *
 * Both directions reduce to the same expression — `affixed = !inView` — because the sentinel sits
 * at the block-start edge with the clipping box grown downwards, and at the block-end edge with it
 * grown upwards.
 *
 * ## The offset is a TOKEN that the prop overrides, and it is never a number in JavaScript
 *
 * `--affix-inset-block-start` / `--affix-inset-block-end` place the pin line, and they place it
 * ONCE: the sentinel is offset by `calc(-1 * …)`, which moves the crossing, and the pinned bar is
 * inset by the same `var()`, which moves the paint. One declaration drives both, so they cannot
 * drift. A service sets the resting offset once (a product whose app header is 64px tall writes
 * `--affix-inset-block-start: 64px` in its theme and every affixed bar clears it); `offsetBlockStart`
 * / `offsetBlockEnd` override it per instance by writing the same custom property inline. That is
 * cardinal rules #44/#45 in their literal form.
 *
 * It also means the offset is never parsed back out of `getComputedStyle` — a custom property
 * hands back its AUTHORED text, so a theme written in `rem` would have come back as `"4rem"` and
 * `parseFloat` would have read it as 4px. CSS resolves the unit; JavaScript never sees it.
 *
 * ## What a pinned bar owes the keyboard (C6)
 *
 * A bar pinned over the block-start edge covers whatever the browser scrolls to — the next focused
 * field, the `#section` a skip link jumps to — and the browser has no idea it is there. While
 * pinned there, this sets `scroll-padding-block-start` on the scroll box to the bar's measured
 * bottom edge, and puts back whatever was there on release. That is WCAG 2.4.11 (Focus Not
 * Obscured) bought with one declaration, and it is why C6 passes rather than being asserted.
 *
 * ## Motion
 *
 * `Affix` animates nothing, so it has no transition to suppress and satisfies
 * `prefers-reduced-motion: reduce` by construction — the pin is instantaneous in every mode. The
 * SHRINK is a composition: read `[data-affixed]` off `data-slot="affix-content"` and transition
 * whatever the brand condenses, on `--duration-fast` / `--ease-standard`, snapping under reduced
 * motion. It must condense; it must never fade or disappear.
 *
 * ## One inherited limitation, stated rather than hidden
 *
 * A `transform`, `filter` or `backdrop-filter` on an ancestor makes that ancestor the containing
 * block for `position: fixed`, so a pinned bar inside one is positioned against it instead of the
 * viewport. `position: sticky` and antd's `Affix` are both subject to it; there is no workaround
 * inside a component, only a call site that does not do that.
 */
export const Affix = React.forwardRef<HTMLDivElement, AffixProp>(function Affix(
  {
    children,
    offsetBlockStart,
    offsetBlockEnd,
    offsetTop,
    offsetBottom,
    target,
    onChange,
    id,
    className,
    ...rest
  },
  ref,
) {
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const sentinelRef = React.useRef<HTMLDivElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);

  if (isDevelopment()) {
    if (offsetTop !== undefined) {
      console.warn(
        "[@godxjp/ui] Affix: `offsetTop` is Ant Design's name for this axis; here it is `offsetBlockStart` — the logical axis, per check:rtl and docs/DESIGN-AUTHORITY.md. The value was IGNORED.",
      );
    }
    if (offsetBottom !== undefined) {
      console.warn(
        "[@godxjp/ui] Affix: `offsetBottom` is Ant Design's name for this axis; here it is `offsetBlockEnd` — the logical axis, per check:rtl and docs/DESIGN-AUTHORITY.md. The value was IGNORED.",
      );
    }
  }

  // antd's `internalOffsetTop` rule, ported: the block-END offset is what selects block-end
  // pinning, and it only does so when no block-start offset was given. Passing `offsetBlockEnd`
  // alone must not ALSO pin the bar to the top.
  const pinToEnd = offsetBlockStart === undefined && offsetBlockEnd !== undefined;

  // The scroll box is resolved AFTER mount — `target` is a getter precisely because the element it
  // returns does not exist while the render that declares it is running.
  const [targetElement, setTargetElement] = React.useState<HTMLElement | null>(null);
  React.useEffect(() => {
    setTargetElement(resolveTarget(target, rootRef.current));
  }, [target]);

  // `assumeInView` — "not yet pinned" is the resting answer, so an Affix renders in flow on the
  // server, in jsdom, and on the frame before the first observer entry. Reporting `affixed` from a
  // measurement that has not happened would fix a bar over content it has never measured.
  const inView = useInView(sentinelRef, {
    root: targetElement,
    rootMargin: pinToEnd ? ROOT_MARGIN_BLOCK_END : ROOT_MARGIN_BLOCK_START,
    assumeInView: true,
  });
  // A sentinel inside `display: none` has no box, so the observer reports it out of view — which
  // `!inView` reads as "scrolled past". Measured on the docs page, an Anchor hidden below md
  // reported `affixed` (and fired `onChange(true)`) for a bar nobody could see (gh#984).
  const [rendered, setRendered] = React.useState(true);
  const affixed = !inView && rendered;

  const [box, setBox] = React.useState<{ inline: number; block: number } | null>(null);
  const [targetInset, setTargetInset] = React.useState(0);

  const measure = React.useCallback(() => {
    const root = rootRef.current;
    const content = contentRef.current;
    if (!root || !content) return;
    setRendered(isRendered(root));

    // INLINE size from the box still in flow — that is the column the pinned bar has to keep
    // occupying. BLOCK size from the content — that is what leaves the flow, and what the
    // placeholder then has to hold open.
    const rootRect = root.getBoundingClientRect();
    const contentRect = content.getBoundingClientRect();
    setBox((previous) =>
      previous && previous.inline === rootRect.width && previous.block === contentRect.height
        ? previous
        : { inline: rootRect.width, block: contentRect.height },
    );

    // Against the viewport the line is the token alone. Against an ELEMENT the line moves with the
    // element, and only JavaScript can read where it currently is — antd's `getFixedTop` /
    // `getFixedBottom`, the same arithmetic, handed to CSS as a second addend.
    const rect = targetElement?.getBoundingClientRect();
    /* BOTH EDGES OF THE SUM ARE VIEWPORT-RELATIVE AND THE BOX IS NOT (gh#897). `getBoundingClientRect`
     * is viewport-relative; `position: fixed` resolves against the nearest containing block, which a
     * blurred, filtered, transformed or paint-contained ancestor silently becomes. Subtracting that
     * block's own offset puts the two back in the same coordinate space. `null` is the viewport,
     * where the offset is 0 and this is the arithmetic it always was. */
    const blockEl = fixedContainingBlock(content);
    const block = blockEl?.getBoundingClientRect();
    const viewportInset = rect ? (pinToEnd ? window.innerHeight - rect.bottom : rect.top) : 0;
    /* THE BLOCK'S ORIGIN, WHICH IS NOT ITS BOX WHEN THE BLOCK IS ALSO A SCROLLER (gh#897).
     * A Card that merely carries a blur is not scrolled, so its origin IS its box. This package's
     * own `.app-main` is both — `contain: paint` makes it a containing block AND it is the page's
     * scrollport — and there a fixed descendant resolves against the CONTENT origin, which has
     * moved up by `scrollTop`. Measured at a page scroll of 9381: box top 48, origin -9333, and
     * a bar that should have been at 386 painted at -8947. Subtracting the box alone fixed the Card
     * and left the scroller exactly as wrong as before. */
    const blockOffset = block
      ? pinToEnd
        ? window.innerHeight -
          (block.bottom +
            ((blockEl?.scrollHeight ?? 0) -
              (blockEl?.clientHeight ?? 0) -
              (blockEl?.scrollTop ?? 0)))
        : block.top - (blockEl?.scrollTop ?? 0)
      : 0;
    const next = viewportInset - blockOffset;
    setTargetInset((previous) => (previous === next ? previous : next));
  }, [pinToEnd, targetElement]);

  // Synchronous and before paint, so a pinned bar is never painted at the wrong size for a frame.
  React.useLayoutEffect(() => {
    measure();
  }, [measure, affixed, children]);

  React.useEffect(() => {
    const root = rootRef.current;
    const content = contentRef.current;
    if (!root || typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver(() => {
      measure();
    });
    observer.observe(root);
    if (content) observer.observe(content);
    if (targetElement) observer.observe(targetElement);
    return () => {
      observer.disconnect();
    };
  }, [measure, targetElement]);

  // While pinned against an ELEMENT the line moves whenever the PAGE scrolls, and a scroll on an
  // element does not bubble — so it is caught in the capture phase on `window`, the one listener
  // that sees every scroll on the page. Off entirely when the scroll box is the viewport (where
  // the line is a constant) and off entirely while unpinned.
  React.useEffect(() => {
    if (!affixed || !targetElement || typeof window === "undefined") return undefined;
    let frame: number | null = null;
    const onScroll = () => {
      if (frame !== null) return;
      frame = window.requestAnimationFrame(() => {
        frame = null;
        measure();
      });
    };
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, [affixed, targetElement, measure]);

  // WCAG 2.4.11 — see the header. Only a block-start pin obscures what the browser scrolls TO. The
  // padding is the bar's own measured bottom edge inside the scroll box, so it needs no second
  // copy of the offset, and the previous INLINE value is restored rather than cleared, so an app
  // that sets its own scroll padding gets it back.
  React.useEffect(() => {
    const content = contentRef.current;
    if (pinToEnd || !affixed || !content || typeof document === "undefined") return undefined;
    const scrollBox = targetElement ?? document.documentElement;
    const boxTop = targetElement ? targetElement.getBoundingClientRect().top : 0;
    const padding = content.getBoundingClientRect().bottom - boxTop;
    if (padding <= 0) return undefined;
    const previous = scrollBox.style.scrollPaddingBlockStart;
    scrollBox.style.scrollPaddingBlockStart = `${padding}px`;
    return () => {
      scrollBox.style.scrollPaddingBlockStart = previous;
    };
  }, [affixed, pinToEnd, targetInset, box?.block, targetElement]);

  // antd fires `onChange` from inside its measure, guarded by a comparison with the last value.
  // Here the value IS React state, so "only on the transition" is structural rather than guarded:
  // this effect cannot run without `affixed` having changed. The mount is skipped — a component
  // that renders unpinned has not TRANSITIONED to unpinned.
  const onChangeRef = React.useRef(onChange);
  React.useEffect(() => {
    onChangeRef.current = onChange;
  });
  const mountedRef = React.useRef(false);
  React.useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    onChangeRef.current?.(affixed);
  }, [affixed]);

  const style: AffixStyle = {
    ...(offsetBlockStart === undefined
      ? undefined
      : { "--affix-inset-block-start": `${offsetBlockStart}px` }),
    ...(offsetBlockEnd === undefined
      ? undefined
      : { "--affix-inset-block-end": `${offsetBlockEnd}px` }),
    ...(targetInset === 0 ? undefined : { "--affix-target-inset": `${targetInset}px` }),
    ...(affixed && box ? { "--affix-content-inline-size": `${box.inline}px` } : undefined),
  };

  return (
    <div
      ref={(node) => {
        rootRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      id={id}
      data-slot="affix"
      data-affixed={affixed ? "" : undefined}
      className={cn("ui-affix", className)}
      style={style}
      {...rest}
    >
      <div
        ref={sentinelRef}
        data-slot="affix-sentinel"
        data-edge={pinToEnd ? "block-end" : "block-start"}
        aria-hidden="true"
        className="ui-affix-sentinel"
      />
      {/* The flow keeper. It exists ONLY while pinned and it holds the MEASURED block size — which
          is the whole reason the page does not move at the instant the content leaves the flow. */}
      {affixed && box ? (
        <div
          data-slot="affix-placeholder"
          aria-hidden="true"
          className="ui-affix-placeholder"
          // BOTH axes (gh#984). Block holds the page still; inline holds the COLUMN open. In a
          // shrink-to-fit parent — a rail beside its content, which is where Anchor lives — the
          // root is only as wide as what is in flow, so a block-only placeholder let it collapse
          // to 0px, the next measurement read that 0, and the pinned rail painted one glyph wide.
          style={{ blockSize: box.block, inlineSize: box.inline }}
        />
      ) : null}
      <div
        ref={contentRef}
        data-slot="affix-content"
        data-edge={pinToEnd ? "block-end" : "block-start"}
        data-affixed={affixed ? "" : undefined}
        className="ui-affix-content"
      >
        {children}
      </div>
    </div>
  );
});
Affix.displayName = "Affix";
