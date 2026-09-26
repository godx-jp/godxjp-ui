/**
 * Shared hooks. TWO of the ten exports here are PUBLIC API; the rest are internal (gh#951).
 *
 * | reaches a consumer | via |
 * | --- | --- |
 * | `useDebouncedValue` | `@godxjp/ui` and `@godxjp/ui/admin` |
 * | `useTimeoutFlag`    | `@godxjp/ui` and `@godxjp/ui/admin` |
 *
 * `useControlledLatch` · `useMediaQuery` · `useIsMobile` · `useScrollableRegionTabIndex` ·
 * `useScrollsOnAxis` · `useScrollsHorizontally` · `useInView` · `scrollParent` are reachable from NO
 * published subpath. Measured by importing every barrel out of `dist/`, not read off this file.
 *
 * Saying it here because from outside there is no way to tell an internal hook from a public one
 * parked in an odd place — and that ambiguity has a cost: a consumer that cannot tell writes its
 * own copy of something that already ships (godx-jp/godxjp-ui#947 measured three such files, one of
 * them a 12-line re-implementation of `cn`). The two public ones travel through
 * `export * from "./components/admin"` in `src/index.ts`, which is why the old one-line header said
 * "for admin components": they are not admin-specific, that is just the path they happen to take.
 *
 * Adding an export here does NOT publish it. Making one public means adding it to a barrel, to
 * `component-api-manifest.json`'s `utilities` section (the generator picks it up) and to
 * `mcp/src/data/utilities.ts` — `mcp/src/utilities-cover-the-manifest.test.ts` fails until all three
 * agree.
 */
import { useLayoutEffect } from "@react-aria/utils";
import { type RefObject, useEffect, useState } from "react";
import { flushSync } from "react-dom";

/**
 * Returns a debounced view of `value`, updated only after `delay` ms of no
 * change. Use for search inputs to avoid querying on every keystroke.
 *
 * setState runs only inside setTimeout (async) — compliant with
 * react-hooks/set-state-in-effect.
 */
export function useDebouncedValue<T>(value: T, delay = 250): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(value);
    }, delay);
    return () => {
      clearTimeout(t);
    };
  }, [value, delay]);
  return debounced;
}

/**
 * Returns true while `ms` haven't elapsed since `signal` last flipped truthy.
 * setState is scheduled asynchronously (setTimeout 0 / ms) — Rules of React safe.
 */
export function useTimeoutFlag(signal: unknown, ms = 2_000): boolean {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!signal) {
      const id = window.setTimeout(() => {
        setActive(false);
      }, 0);
      return () => {
        clearTimeout(id);
      };
    }

    const showId = window.setTimeout(() => {
      setActive(true);
    }, 0);
    const hideId = window.setTimeout(() => {
      setActive(false);
    }, ms);
    return () => {
      clearTimeout(showId);
      clearTimeout(hideId);
    };
  }, [signal, ms]);

  return Boolean(signal) && active;
}

/**
 * Controlled-ness latch for `value`/`defaultValue`/`onValueChange` controls whose empty state is
 * `undefined` (pickers carrying `Date`/`DateRange`). A control counts as controlled once a DEFINED
 * `value` has EVER been passed: - mounted with a defined `value` → controlled, and a later
 * `value={undefined}` stays controlled-EMPTY (not mistaken for uncontrolled); - mounted with
 * `value={undefined}` (an empty form that later restores a saved value) → uncontrolled until the
 * first defined value arrives, then PROMOTES to controlled for good.
 */
export function useControlledLatch(valueIsDefined: boolean): boolean {
  const [latched, setLatched] = useState(valueIsDefined);
  // Guarded render-time set — React's documented "derived state" form.
  if (valueIsDefined && !latched) setLatched(true);
  return valueIsDefined || latched;
}

export function useMediaQuery(query: string): boolean {
  const isBrowser = typeof window !== "undefined";

  const getMatch = () => (isBrowser ? window.matchMedia(query).matches : false);

  const [matches, setMatches] = useState<boolean>(getMatch());

  useEffect(() => {
    if (!isBrowser) return undefined;

    const mediaQuery = window.matchMedia(query);

    const updateMatch = () => {
      setMatches(mediaQuery.matches);
    };

    updateMatch();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", updateMatch);
      return () => {
        mediaQuery.removeEventListener("change", updateMatch);
      };
    }

    mediaQuery.addListener(updateMatch);
    return () => {
      mediaQuery.removeListener(updateMatch);
    };
  }, [isBrowser, query]);

  return matches;
}

export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 767px)");
}

/** A scroll container is already keyboard-reachable when something inside it can take focus. */
const SCROLLABLE_REGION_FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * WCAG 2.1.1 — a region that scrolls must be operable by keyboard. Tabbing to a focusable child
 * scrolls the container, so a region whose content IS focusable needs nothing; one whose content is
 * inert (plain text) strands its overflow for anyone not using a pointer and must therefore take
 * focus itself via `tabindex="0"`. Which case applies depends on the RENDERED size and content —
 * the same pagination strip is fine at 1440px and unreachable at 375px, and a panel full of text
 * only overflows once it is resized — so it is measured at runtime and kept in sync as the element
 * resizes or its content changes.
 *
 * The attribute is written imperatively rather than rendered: `react-resizable-panels` applies our
 * className to a nested div it owns, which no prop can reach.
 *
 * @param element the scroll container itself (state, not a ref, so the effect re-runs when it mounts)
 */
export function useScrollableRegionTabIndex(element: HTMLElement | null): void {
  useEffect(() => {
    if (!element) return;

    const sync = () => {
      const scrolls =
        element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
      const hasFocusableContent =
        element.querySelector(SCROLLABLE_REGION_FOCUSABLE_SELECTOR) !== null;
      // Guard both writes: setting an attribute to the value it already holds still emits a
      // MutationRecord, which would call this back forever.
      if (scrolls && !hasFocusableContent) {
        if (element.getAttribute("tabindex") !== "0") element.setAttribute("tabindex", "0");
      } else if (element.getAttribute("tabindex") === "0") {
        element.removeAttribute("tabindex");
      }
    };

    sync();

    // Resize covers the container AND its children (content growing past the box); mutations cover
    // content swapped in, or a child losing `disabled` and becoming a focus target.
    const observers: Array<{ disconnect: () => void }> = [];
    if (typeof ResizeObserver !== "undefined") {
      const resizeObserver = new ResizeObserver(sync);
      resizeObserver.observe(element);
      for (const child of Array.from(element.children)) resizeObserver.observe(child);
      observers.push(resizeObserver);
    }
    if (typeof MutationObserver !== "undefined") {
      const mutationObserver = new MutationObserver(sync);
      mutationObserver.observe(element, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["disabled", "href", "tabindex"],
      });
      observers.push(mutationObserver);
    }
    return () => {
      for (const observer of observers) observer.disconnect();
    };
  }, [element]);
}

/**
 * Does this scroll box actually have somewhere to scroll, on the axes it is allowed to scroll on?
 *
 * Drives BOTH halves of a scroll region: the `tabindex="0"` a keyboard user needs to reach the
 * overflow (WCAG 2.1.1 / axe `scrollable-region-focusable`) AND the `role`/name that stop needs in
 * order not to be an anonymous one (gh#817 for the table, gh#821 for `ScrollArea`). A stop that
 * scrolls nothing is pure noise, and a name on it is noise too, so both are withheld until there is
 * overflow to reach.
 *
 * The measurement may only ever REMOVE the stop, never withhold it on a guess: a box that has not
 * been laid out reports 0 for `clientWidth`/`clientHeight` (the server render, jsdom, a
 * `display:none` ancestor, the frame before first layout), and that is not evidence that nothing
 * overflows. Reading it as "no overflow" would strand the overflow from every keyboard user — a
 * worse failure than an extra tab stop — so an unmeasured box counts as scrolling.
 *
 * `axis` is the box's OWN `overflow`, not a preference: an axis it does not scroll on is `hidden`
 * there, so overflow on that axis is CLIPPED rather than reachable, and measuring it would keep a
 * tab stop that scrolls nothing. `ScrollArea`'s `orientation` is exactly this union.
 */
export function useScrollsOnAxis(
  ref: RefObject<HTMLElement | null>,
  enabled: boolean,
  axis: "horizontal" | "vertical" | "both",
): boolean {
  const [scrolls, setScrolls] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return undefined;
    // `client === 0` is an UNLAID-OUT box, never "it fits" — see the note above.
    const overflows = (client: number, scroll: number) => client === 0 || scroll - client > 1;
    /* THE TWO DIRECTIONS ARE NOT SYMMETRIC, and gh#907 is what happens when they are treated as
     * if they were. A `ResizeObserver` callback runs after layout and BEFORE paint, but the
     * `setScrolls` inside it is batched, so the re-render lands in the NEXT frame: the frame in
     * between paints a box that overflows with no tab stop on it. Measured on
     * /showcase/table-sticky-columns by widening the viewport until the table fits (stop correctly
     * withheld) and narrowing it again: exactly ONE such frame. One frame is ~16ms idle and
     * arbitrarily long on a loaded machine, which is why the reporter saw it on a busy CI runner
     * and never locally.
     *
     * So ADDING the stop is flushed synchronously — it is the direction this hook's contract calls
     * non-negotiable ("may only ever REMOVE the stop, never withhold it on a guess"), and the cost
     * is one synchronous render on a transition that happens when a box starts overflowing.
     * REMOVING it stays batched: a stop that scrolls nothing is noise, and noise for one extra
     * frame is the lesser failure this docblock already ranks it as. */
    /* `sync` is false for the FIRST call, which happens inside this effect: React warns when
     * `flushSync` is called from a lifecycle, and it would buy nothing there — the state already
     * starts `true`, so the mount frame always carries the stop. Only the observer needs it. */
    const update = (sync: boolean) => {
      const next =
        (axis !== "vertical" && overflows(el.clientWidth, el.scrollWidth)) ||
        (axis !== "horizontal" && overflows(el.clientHeight, el.scrollHeight));
      if (next && sync) flushSync(() => setScrolls(true));
      else setScrolls(next);
    };
    update(false);

    /* A WEB FACE ARRIVING AFTER FIRST PAINT IS A THIRD WAY INTO OVERFLOW, and the observer below
     * cannot see it (gh#907, reopened against 30.0.2's fix). `[data-slot="table"]` carries `w-full`
     * and its wrapper is `w-full` too, so when a font slice lands and re-lays-out the cell text,
     * NEITHER observed box changes size — the text overflows inside them and `scrollWidth` crosses
     * `clientWidth` with no resize to notice it. The reporter found this from the other end: their
     * app loads the sliced font entry (729 unicode-range faces), their gate caught a scrollable
     * region with no tab stop, and a resize-driven reproduction found nothing at all.
     *
     * `loadingdone` rather than only `fonts.ready`: `ready` settles once for the faces pending at
     * that moment, and a unicode-range set keeps fetching as new glyphs are needed, so a later
     * slice arrives after that promise has already resolved. Both are used — `ready` for the first
     * settle, the event for every batch after it. `chart-category-axis.ts` already reads
     * `document.fonts` for this exact reason, on this exact failure. */
    const onFonts = () => update(true);
    let live = true;
    document.fonts?.addEventListener?.("loadingdone", onFonts);
    void document.fonts?.ready.then(() => {
      if (live) update(true);
    });
    const stopFontWatch = () => {
      live = false;
      document.fonts?.removeEventListener?.("loadingdone", onFonts);
    };

    if (typeof ResizeObserver === "undefined") return stopFontWatch;
    const observer = new ResizeObserver(() => update(true));
    observer.observe(el);
    // The content resizes without the box doing so whenever data/columns/density change.
    if (el.firstElementChild) observer.observe(el.firstElementChild);
    return () => {
      stopFontWatch();
      observer.disconnect();
    };
  }, [ref, enabled, axis]);
  return enabled && scrolls;
}

/** A table's wrapper scrolls on one axis only, so it asks the one question it has (gh#817). */
export function useScrollsHorizontally(
  ref: RefObject<HTMLElement | null>,
  enabled: boolean,
): boolean {
  return useScrollsOnAxis(ref, enabled, "horizontal");
}

/**
 * Nearest scrollable ancestor — the box an element actually scrolls inside — else `null`, which is
 * what `IntersectionObserver` already spells "the document viewport".
 *
 * Lifted VERBATIM out of `src/components/layout/page-container.tsx`, where it was private to
 * `footerReveal="onScroll"` (gh#827). It is exported because the callers that need `useInView` to
 * measure against a scroll PANE rather than the viewport have to name that pane, and every one of
 * them would otherwise write this walk again.
 */
export function scrollParent(el: HTMLElement | null): HTMLElement | null {
  let node = el?.parentElement ?? null;
  while (node) {
    const overflowY = getComputedStyle(node).overflowY;
    if (overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay") return node;
    node = node.parentElement;
  }
  return null;
}

/**
 * `scrollParent` for a caller that hands the answer to `IntersectionObserver` or a scroll listener:
 * the root and body elements are the VIEWPORT by another name (a reset writing
 * `html { overflow-y: scroll }` makes the root "scroll"), and the answer for them is `null`.
 * Affix and Anchor use it as their default scroll box (gh#984).
 */
export function scrollBoxOf(el: HTMLElement | null): HTMLElement | null {
  if (typeof document === "undefined") return null;
  const box = scrollParent(el);
  return box === document.documentElement || box === document.body ? null : box;
}

/**
 * Has this element entered the viewport (or `root`) yet?
 *
 * The ONE `IntersectionObserver` wrapper in the library, and it has to stay that way: before
 * gh#827 the only observer in `src/components/` was `PageContainer`'s private `useFooterReveal`,
 * so the next component that needed one copied it rather than finding it. Callers today are
 * `Reveal on="view"` (gh#829, the first), `PageContainer footerReveal="onScroll"` and `Affix`
 * (gh#827). `root` exists because two of the three measure against a scrolling PANE rather than
 * the viewport; `scrollParent` above is how they name it.
 *
 * Borrowed from Motion's `useInView` (https://motion.dev/docs/react-use-in-view): `once` and
 * `amount` keep their names, their types and their defaults, including `amount`'s
 * `"some" | "all" | number` and Motion's own `{ some: 0, all: 1 }` threshold mapping.
 *
 * ## Unobservable counts as IN VIEW
 *
 * The server render, jsdom, a browser without `IntersectionObserver`, and `enabled: false` all
 * report `true`. A caller that hides content until this returns `true` therefore shows it — the
 * only safe direction, because the alternative is content that is never revealed at all. Callers
 * MUST keep it that way: visibility is never gated on an observer that might not exist.
 *
 * ## `assumeInView` — which way to be wrong for the ONE frame before the first entry
 *
 * The hook normally flips to `false` the moment a live observer exists, before that observer has
 * said anything, because a caller that HIDES on `false` would otherwise paint its content in and
 * then take it away again. That is right for `Reveal` and wrong for the two callers that ACT on
 * `false`: `PageContainer` would reveal its sticky footer for a frame, and `Affix` would fix a bar
 * over the page before measuring it. Those pass `assumeInView`, which leaves the answer `true`
 * until the observer actually reports — so neither ever acts on a measurement it has not taken.
 *
 * ## `amount` is clamped to what the element can actually reach
 *
 * `threshold` is the ratio of the intersection to the TARGET's own box
 * (https://www.w3.org/TR/intersection-observer/#dom-intersectionobserverentry-intersectionratio), so
 * an element taller than the root can never reach `1`: `amount: "all"` on a full-height section
 * would hide it forever. The requested ratio is clamped at observe time to the largest ratio the
 * element's measured box can attain inside the root.
 */
export function useInView(
  ref: RefObject<Element | null>,
  {
    enabled = true,
    once = false,
    amount = "some",
    root = null,
    rootMargin,
    assumeInView = false,
  }: {
    /** `false` skips the observer entirely and reports `true`. */
    enabled?: boolean;
    /** Stop observing after the first entry, so the element never reports out-of-view again. */
    once?: boolean;
    /** How much must be visible — `"some"` (any pixel) | `"all"` | a 0..1 ratio. */
    amount?: "some" | "all" | number;
    /** Scroll container to measure against. `null` → the document viewport. */
    root?: Element | null;
    /**
     * `IntersectionObserver` `rootMargin` — grows or shrinks the clipping box before the test.
     *
     * `Affix` is why it exists: it observes a hairline SENTINEL at the pinning edge and grows the
     * box a million pixels past the line, so that "has not reached the line yet" and "is far below
     * it" are one answer and the pin reduces to `!inView` in both directions.
     */
    rootMargin?: string;
    /** Stay `true` until the observer reports, instead of flipping to `false` on mount. */
    assumeInView?: boolean;
  } = {},
): boolean {
  const [inView, setInView] = useState(true);

  // A LAYOUT effect, not a passive one: the first paint after mount must already carry the hidden
  // state, or a caller that hides on `false` flashes its content in before taking it away again.
  // `@react-aria/utils`' copy is the SSR-safe one (a no-op on the server, where `true` stands).
  useLayoutEffect(() => {
    const el = ref.current;
    if (!enabled || !el || typeof IntersectionObserver === "undefined") return undefined;

    const requested = typeof amount === "number" ? amount : amount === "all" ? 1 : 0;
    const box = el.getBoundingClientRect();
    const rootBox = root?.getBoundingClientRect();
    const rootWidth = rootBox?.width ?? window.innerWidth;
    const rootHeight = rootBox?.height ?? window.innerHeight;
    const reachable =
      box.width > 0 && box.height > 0
        ? (Math.min(box.width, rootWidth) * Math.min(box.height, rootHeight)) /
          (box.width * box.height)
        : 1;
    const threshold = Math.min(requested, reachable);

    // Only now — with a live observer in hand — may the answer become `false`, and only for a
    // caller that hides on `false`. See `assumeInView`.
    if (!assumeInView) setInView(false);

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        if (!entry) return;
        // Compared against the clamped ratio rather than trusting `isIntersecting`, which flips at
        // the first pixel and is only the right answer when `amount` is `"some"`.
        if (entry.isIntersecting && entry.intersectionRatio >= threshold) {
          setInView(true);
          // Motion unobserves the target rather than disconnecting; with one target per hook the
          // effect is the same, and the observer is still disconnected on cleanup.
          if (once) observer.unobserve(entry.target);
        } else if (!once) {
          setInView(false);
        }
      },
      { root, threshold, ...(rootMargin === undefined ? undefined : { rootMargin }) },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, [ref, enabled, once, amount, root, rootMargin, assumeInView]);

  return !enabled || inView;
}
