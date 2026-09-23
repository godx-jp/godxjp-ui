"use client";

import * as React from "react";

import { useTranslation } from "../../i18n/use-translation";
import { isDevelopment } from "../../lib/dev";
import { useControlledLatch } from "../../lib/hooks";
import { cn, prefersReducedMotion } from "../../lib/utils";
import { Affix } from "../layout/affix";
import type {
  AnchorContainerProp,
  AnchorItemProp,
  AnchorProp,
} from "../../props/components/navigation.prop";

export type {
  AnchorContainerProp,
  AnchorDirectionProp,
  AnchorItemProp,
  AnchorProp,
  AnchorProp as AnchorProps,
} from "../../props/components/navigation.prop";

/** Ant Design's own `sharpMatcherRegex` — everything after the last `#`. */
const SHARP_MATCHER = /#([^\t\r\n\f\v]+)$/;

/** Ant Design's `bounds` default. */
const DEFAULT_BOUNDS = 5;

/**
 * How long the resolver stays suppressed after the last frame of a programmatic scroll.
 *
 * antd tweens the scroll itself, so it knows exactly when the animation ends and clears its
 * `animatingRef` in the tween's callback. A native `scrollTo({ behavior: "smooth" })` has no
 * completion event anywhere in the platform, so the end of the scroll is inferred the only way it
 * can be: the container stopped emitting `scroll`. 120ms is comfortably longer than the ~16ms
 * between frames of a running smooth scroll and short enough that a user who starts reading
 * immediately is tracked at once. A real gesture (`wheel`, `touchstart`) releases it early
 * regardless, because a user who takes the scroll back owns it from that moment.
 */
const SCROLL_SETTLE_MS = 120;

function hashOf(href: string): string {
  return SHARP_MATCHER.exec(href)?.[1] ?? "";
}

/** Every link in the tree, in document order — the order that breaks a tie between two sections. */
function flatten(
  items: AnchorItemProp[] | undefined,
  out: AnchorItemProp[] = [],
): AnchorItemProp[] {
  for (const item of items ?? []) {
    out.push(item);
    if (item.children?.length) flatten(item.children, out);
  }
  return out;
}

/** Ant Design's `getOffsetTop`: an element's block-start edge relative to its scroll container. */
function offsetTopWithin(element: HTMLElement, container: AnchorContainerProp): number {
  if (!element.getClientRects().length) return 0;
  const rect = element.getBoundingClientRect();
  if (rect.width || rect.height) {
    if (container === window) return rect.top - element.ownerDocument.documentElement.clientTop;
    return rect.top - (container as HTMLElement).getBoundingClientRect().top;
  }
  return rect.top;
}

function scrollTopOf(container: AnchorContainerProp): number {
  return container === window
    ? (window.scrollY ?? document.documentElement.scrollTop)
    : (container as HTMLElement).scrollTop;
}

/**
 * Anchor — Ant Design `Anchor` (6.6.5): the in-page section navigation, and — the part that makes
 * it a component rather than a composition — the thing that WORKS OUT which section is current.
 *
 * `NavList activeId` takes that answer as a prop. Nothing else in this library computes it.
 *
 * ## Why this resolves by measurement and not by `IntersectionObserver`
 *
 * The obvious build is an observer over every section with a thin `rootMargin` band, and it is
 * what Bootstrap's Scrollspy does (`rootMargin: "0px 0px -25%"`, `threshold: [0.1, 0.5, 1]`) and
 * what this repo's own `LegalDocumentShell` does (`"-10% 0px -75% 0px"`, threshold 0). It has two
 * failure modes that no choice of margin fixes, because they are properties of the question rather
 * than of the numbers:
 *
 *  1. **A section taller than the band reports nothing.** Scroll into the middle of a long
 *     section and no element intersects, so the answer is empty and the implementation has to fall
 *     back to "keep whatever was active" — which is a guess, and is wrong after any jump.
 *  2. **The answer depends on scroll DIRECTION.** With several short sections inside the band at
 *     once, "first intersecting" and "last intersecting" disagree, and which is right depends on
 *     which way the reader is moving. That is where scrollspy flicker comes from, and it is why
 *     the good implementations end up bolting hysteresis onto the observer.
 *
 * Ant Design resolves it the other way and gets neither problem: on each scroll, take every
 * section whose block-start edge has crossed a single decision line, and pick the LAST one. It is
 * a pure function of scroll position, so it cannot oscillate at a fixed position, it needs no
 * hysteresis, and a section a mile tall is still the current one all the way down. That rule is
 * what is ported here, `bounds` and all.
 *
 * ## The three traps, and where each is handled
 *
 * **A click must not fight the resolver.** A click scrolls, the scroll fires the resolver, and the
 * resolver re-picks every section the page passes on the way — so the item you clicked lights up,
 * goes out, and comes back. `suppressedRef` holds the resolver off from the moment the
 * programmatic scroll starts until the container stops emitting `scroll` (see
 * `SCROLL_SETTLE_MS`), and a real `wheel`/`touchstart` releases it early.
 *
 * **The hash is state too.** Landing on `/pricing#enterprise` must select that entry, and must do
 * it without waiting for a scroll event that may never come — the browser's own hash jump does not
 * fire one when the section is already in view. It is therefore read in the state INITIALISER, so
 * the very first render is already correct, and the mount-time resolution is skipped when it
 * matched, rather than immediately overwriting it with a scroll position nobody has reached yet.
 *
 * **Reduced motion jumps.** `behavior: "smooth"` becomes `"auto"` under
 * `prefers-reduced-motion: reduce` (WCAG 2.3.3) — it still lands on the section, instantly. The
 * ink rail transitions on `--duration-fast` and snaps under the same query; the current item is
 * never conveyed by motion alone, it is conveyed by `aria-current`.
 *
 * ## Accessibility
 *
 * A named `<nav>` landmark (a page routinely carries a breadcrumb, a rail and this one), a real
 * `<ul>`/`<li>` list of real `<a href="#…">` — middle-clickable, deep-linkable, and working before
 * JavaScript boots — and `aria-current="location"` on the active one. `"location"` and not
 * `"page"`: the entry points at a FRAGMENT of the page being read, not at a different page, and
 * `"page"` is what a breadcrumb's or a nav rail's current item uses. A click also moves FOCUS to
 * the target section, not just the scroll position, so the next Tab continues from where the
 * reader was sent instead of from the nav.
 */
export function Anchor({
  items,
  direction = "vertical",
  affix = true,
  bounds = DEFAULT_BOUNDS,
  target,
  getContainer,
  getCurrentAnchor,
  offsetBlockStart,
  targetOffsetBlockStart,
  showInkInFixed = false,
  replace = false,
  value,
  defaultValue,
  onValueChange,
  onChange,
  offsetTop,
  targetOffset,
  onClick,
  label,
  id,
  className,
  ...rest
}: AnchorProp) {
  const { t } = useTranslation();
  const horizontal = direction === "horizontal";

  if (isDevelopment()) {
    if (onChange !== undefined) {
      console.warn(
        "[@godxjp/ui] Anchor: `onChange` is Ant Design's name for this callback; here the active href is a controlled value, so it is `onValueChange` (beside `value` / `defaultValue`). The handler was IGNORED.",
      );
    }
    if (offsetTop !== undefined) {
      console.warn(
        "[@godxjp/ui] Anchor: `offsetTop` is Ant Design's name for this axis; here it is `offsetBlockStart` — the logical axis, per check:rtl. The value was IGNORED.",
      );
    }
    if (targetOffset !== undefined) {
      console.warn(
        "[@godxjp/ui] Anchor: `targetOffset` is Ant Design's name for this axis; here it is `targetOffsetBlockStart`. The value was IGNORED.",
      );
    }
    if (horizontal && items?.some((item) => item.children?.length)) {
      console.warn(
        '[@godxjp/ui] Anchor: `items[].children` is not supported when `direction="horizontal"` — a nested list has nowhere to go on one row. The nested entries were DROPPED. (Ant Design warns about the same combination.)',
      );
    }
  }

  const links = React.useMemo(
    () => (horizontal ? (items ?? []) : flatten(items)),
    [items, horizontal],
  );
  const linksKey = links.map((item) => item.href).join("\n");

  const navRef = React.useRef<HTMLElement | null>(null);
  const listRef = React.useRef<HTMLUListElement | null>(null);
  const suppressedRef = React.useRef(false);
  const settleTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // THE HASH IS READ HERE, in the initialiser, so the very first render of `/page#section` already
  // carries `aria-current` — no effect, no scroll event, no frame of the wrong answer.
  const hashOnMountRef = React.useRef<string | null>(null);
  const [internal, setInternal] = React.useState<string>(() => {
    if (typeof window === "undefined") return defaultValue ?? "";
    const hash = window.location.hash;
    if (!hash) return defaultValue ?? "";
    const decoded = decodeURIComponent(hash.slice(1));
    const matched = links.find((item) => hashOf(item.href) === decoded);
    if (!matched) return defaultValue ?? "";
    hashOnMountRef.current = matched.href;
    return matched.href;
  });

  const controlled = useControlledLatch(value !== undefined);
  const resolved = controlled ? (value ?? "") : internal;
  // antd's `getCurrentAnchor` runs INSIDE the resolution, with no render round-trip; an explicit
  // controlled `value` is the caller's last word and outranks it.
  const active = controlled ? resolved : (getCurrentAnchor?.(resolved) ?? resolved);

  // antd keeps BOTH links: `rawActiveLinkRef` (what the scroll position said) and `activeLinkRef`
  // (what `getCurrentAnchor` made of it). Deduping against the wrong one of the two is how a
  // `getCurrentAnchor` that folds several sections into one entry silently swallows a real change.
  const activeRef = React.useRef(active);
  const controlledRef = React.useRef(controlled);
  const onValueChangeRef = React.useRef(onValueChange);
  const getCurrentAnchorRef = React.useRef(getCurrentAnchor);
  React.useEffect(() => {
    activeRef.current = active;
    controlledRef.current = controlled;
    onValueChangeRef.current = onValueChange;
    getCurrentAnchorRef.current = getCurrentAnchor;
  });

  /** `onValueChange` reports the link the SCROLL POSITION resolved — antd's own note, ported. */
  const commit = React.useCallback((href: string, force = false) => {
    const mapped = getCurrentAnchorRef.current?.(href) ?? href;
    if (!force && mapped === activeRef.current) return;
    if (!controlledRef.current) setInternal(href);
    onValueChangeRef.current?.(href);
  }, []);

  // `target` (gh#890) is `Affix`'s own name and shape for this idea; `getContainer` is antd's
  // older spelling of the identical thing and is kept live for it, but `target` wins when both
  // are given. Whichever resolves feeds BOTH halves that need to agree on a scroll box — the pin
  // (`<Affix target={container}>` below) AND the scroll-spy (`resolveFromScroll`, the scroll
  // listeners, the click landing math) — so a `target` that scopes the bar necessarily scopes the
  // highlight too; there is no second, unscoped path left to fall into.
  const container = React.useCallback((): AnchorContainerProp => {
    if (target) return target() ?? window;
    return getContainer?.() ?? window;
  }, [target, getContainer]);

  // The decision line. antd uses `targetOffset` for it whenever that is a number and falls back to
  // `offsetTop`, so the line a section becomes CURRENT at and the line it LANDS on are the same
  // line — which is what stops a click from leaving the item it just selected unselected.
  const line = targetOffsetBlockStart ?? offsetBlockStart ?? 0;

  /** Ant Design's `getInternalCurrentAnchor`: the LAST section whose edge has crossed the line. */
  const resolveFromScroll = React.useCallback((): string => {
    if (typeof document === "undefined") return "";
    const box = container();
    let best = "";
    let bestTop = Number.NEGATIVE_INFINITY;
    for (const item of links) {
      const hash = hashOf(item.href);
      if (!hash) continue;
      const element = document.getElementById(hash);
      if (!element) continue;
      const top = offsetTopWithin(element, box);
      const itemLine = item.targetOffsetBlockStart ?? line;
      if (top <= itemLine + bounds && top > bestTop) {
        best = item.href;
        bestTop = top;
      }
    }
    return best;
  }, [container, links, line, bounds]);

  const release = React.useCallback(() => {
    if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    settleTimerRef.current = null;
    suppressedRef.current = false;
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const box = container();

    const handleScroll = () => {
      if (suppressedRef.current) {
        // Still inside the programmatic scroll: do not re-pick, just push the settle deadline out
        // to this frame. The scroll going quiet is how a native smooth scroll says it is done.
        if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
        settleTimerRef.current = setTimeout(release, SCROLL_SETTLE_MS);
        return;
      }
      commit(resolveFromScroll());
    };

    // A real gesture during the flight takes the scroll back, so the resolver takes it back too.
    const handleGesture = () => {
      if (suppressedRef.current) release();
    };

    // The mount-time resolution is SKIPPED when the landing hash already answered the question —
    // otherwise a `/page#section` whose section is above the fold would be overwritten, on the
    // first frame, by the position of a page nobody has scrolled.
    if (hashOnMountRef.current === null) commit(resolveFromScroll());
    hashOnMountRef.current = null;

    box.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    window.addEventListener("wheel", handleGesture, { passive: true });
    window.addEventListener("touchstart", handleGesture, { passive: true });
    return () => {
      box.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      window.removeEventListener("wheel", handleGesture);
      window.removeEventListener("touchstart", handleGesture);
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    };
  }, [container, resolveFromScroll, commit, release, linksKey]);

  // ── The ink rail ────────────────────────────────────────────────────────────────────────────
  // Measured off the rendered list rather than derived from an index, because the rows are not a
  // uniform height: a nested entry is smaller, a wrapped two-line label is taller, and a CJK label
  // is taller again at --line-height-body.
  const [ink, setInk] = React.useState<{ offset: number; size: number } | null>(null);
  React.useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const current = list.querySelector<HTMLElement>('[data-slot="anchor-link"][data-active]');
    if (!current) {
      setInk(null);
      return;
    }
    const listRect = list.getBoundingClientRect();
    const rect = current.getBoundingClientRect();
    if (!horizontal) {
      setInk({ offset: rect.top - listRect.top, size: rect.height });
      return;
    }
    // LOGICAL inline offset: measured from the list's start edge, which is its right edge in an
    // RTL document. One measurement, both directions, no mirrored stylesheet.
    const rtl = getComputedStyle(list).direction === "rtl";
    setInk({
      offset: rtl ? listRect.right - rect.right : rect.left - listRect.left,
      size: rect.width,
    });
  }, [active, horizontal, linksKey]);

  const handleLinkClick = (event: React.MouseEvent<HTMLAnchorElement>, item: AnchorItemProp) => {
    onClick?.(event, item);
    // Never hijack a modified click — the anchor is real, so open-in-new-tab keeps working.
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const hash = hashOf(item.href);
    const targetElement =
      hash && typeof document !== "undefined" ? document.getElementById(hash) : null;
    if (!targetElement) return; // No section here → let the browser navigate the href for real.

    event.preventDefault();
    // Force the emit: clicking the ALREADY-active entry must still scroll back to it, and antd
    // passes the same `forceTriggerChange` for the same reason.
    commit(item.href, true);

    const useReplace = item.replace ?? replace;
    window.history[useReplace ? "replaceState" : "pushState"](null, "", item.href);

    const box = container();
    const landing = item.targetOffsetBlockStart ?? targetOffsetBlockStart ?? offsetBlockStart ?? 0;
    const top = scrollTopOf(box) + offsetTopWithin(targetElement, box) - landing;
    const behavior: ScrollBehavior = prefersReducedMotion() ? "auto" : "smooth";

    suppressedRef.current = true;
    if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    settleTimerRef.current = setTimeout(release, SCROLL_SETTLE_MS);

    if (box === window) window.scrollTo({ top, behavior });
    else (box as HTMLElement).scrollTo({ top, behavior });

    // Focus follows the reader, which is the half of "go to that section" that every hand-rolled
    // table of contents forgets: without it the next Tab continues from the NAV, so a keyboard
    // user is sent to a section and then walks the nav again. A consumer's `<section>` is not
    // focusable on its own, so it is made programmatically focusable first — `-1`, never a
    // positive index, and only when it is not already focusable in its own right.
    if (!targetElement.hasAttribute("tabindex") && targetElement.tabIndex < 0) {
      targetElement.setAttribute("tabindex", "-1");
    }
    // `preventScroll` because the scroll above already owns the position — letting focus scroll
    // too would land flush at the section edge and undo the pinned header's clearance.
    targetElement.focus({ preventScroll: true });
  };

  const renderItems = (list: AnchorItemProp[], nested: boolean): React.ReactNode =>
    list.map((item) => (
      <li key={item.key} data-slot="anchor-item" data-nested={nested ? "" : undefined}>
        <a
          href={item.href}
          target={item.target}
          data-slot="anchor-link"
          data-active={item.href === active ? "" : undefined}
          aria-current={item.href === active ? "location" : undefined}
          onClick={(event) => {
            handleLinkClick(event, item);
          }}
        >
          {item.title}
        </a>
        {!horizontal && item.children?.length ? (
          <ul data-slot="anchor-list" data-nested="">
            {renderItems(item.children, true)}
          </ul>
        ) : null}
      </li>
    ));

  const content = (
    <nav
      ref={navRef}
      id={id}
      data-slot="anchor"
      data-direction={direction}
      // antd hides the ink rail when the nav is NOT affixed, unless `showInkInFixed` asks for it.
      data-ink={affix === false && !showInkInFixed ? "hidden" : undefined}
      aria-label={label ?? t("navigation.anchor.ariaLabel")}
      className={cn("ui-anchor", className)}
      {...rest}
    >
      {/* The rail is a SIBLING of the list, not a child of it: a `<ul>` may only contain `<li>`
          (plus script/template), and a stray `<span>` inside one is invalid HTML that a browser
          hoists out — taking the rail's positioning context with it. */}
      <div className="ui-anchor-track">
        <span
          data-slot="anchor-ink"
          data-visible={ink ? "" : undefined}
          aria-hidden="true"
          className="ui-anchor-ink"
          style={
            ink
              ? ({
                  "--anchor-ink-offset": `${ink.offset}px`,
                  "--anchor-ink-extent": `${ink.size}px`,
                } as React.CSSProperties)
              : undefined
          }
        />
        <ul ref={listRef} data-slot="anchor-list" className="ui-anchor-list">
          {renderItems(items ?? [], false)}
        </ul>
      </div>
    </nav>
  );

  if (!affix) return content;

  return (
    <Affix
      offsetBlockStart={offsetBlockStart}
      target={container}
      {...(typeof affix === "object" ? affix : undefined)}
    >
      {content}
    </Affix>
  );
}
Anchor.displayName = "Anchor";
