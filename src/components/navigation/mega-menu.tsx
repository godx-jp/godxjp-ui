"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "../../lib/utils";
import { useTranslation } from "../../i18n/use-translation";
import type {
  MegaMenuGroupProp,
  MegaMenuItemProp,
  MegaMenuLinkComponentProp,
  MegaMenuLinkProp,
  MegaMenuProp,
} from "../../props/components/navigation.prop";

export type {
  MegaMenuGroupProp,
  MegaMenuGroupProp as MegaMenuGroupProps,
  MegaMenuItemProp,
  MegaMenuItemProp as MegaMenuItemProps,
  MegaMenuLinkComponentProp,
  MegaMenuLinkComponentProp as MegaMenuLinkComponentProps,
  MegaMenuLinkProp,
  MegaMenuLinkProp as MegaMenuLinkProps,
  MegaMenuPanelProp,
  MegaMenuPanelProp as MegaMenuPanelProps,
  MegaMenuProp,
  MegaMenuProp as MegaMenuProps,
  MegaMenuTriggerActionProp,
  MegaMenuTriggerActionProp as MegaMenuTriggerActionProps,
} from "../../props/components/navigation.prop";

/*
 * WHY THIS IS DISCLOSURE AND NOT MENUBAR, AND WHY `DropdownMenu` COULD NOT BE IT
 *
 * WAI-ARIA APG ships both, and picking the wrong one is the classic megamenu defect. The APG's own
 * "Disclosure Navigation Menu" example says it outright: it does not use the `menu` role "because
 * it does not provide the complex functionality that assistive technologies expect in a widget
 * that has the menu role", and "typical site navigation does not need all the keyboard
 * interactions specified by the menu and menubar pattern". A bar of links to PLACES is not a menu
 * of COMMANDS. Under `role="menu"` a screen reader announces an application menu and switches to
 * menu navigation, where Tab leaves the whole widget and links stop being announced as links.
 *
 * That is also the C3 answer for this repo's Framework-Component Test. `DropdownMenu` here is
 * react-aria-components `Menu`: `role="menu"` / `role="menuitem"` by construction, one trigger,
 * one popover anchored to that trigger. Using it for a site nav would ship exactly the error
 * above, and it still would not carry the bar-level behaviour — one roving tab stop ACROSS the
 * triggers, hand-off from one open panel to the next, a panel that spans the bar rather than its
 * trigger, and a narrow layout where the same disclosure lays out in flow.
 *
 * So the markup is the APG's: a `<nav>` landmark, a list of items, a `<button aria-expanded
 * aria-controls>` per item that has a panel, a plain `<a>` per item that does not, and a nested
 * list of real links inside each panel. No `role` is invented anywhere - every element already
 * means what it is.
 *
 * ONE DOCUMENTED DEVIATION FROM THE APG EXAMPLE: roving tabindex.
 * The APG example leaves every top-level button in the tab order and lists arrow keys as OPTIONAL.
 * This library's own contract (godxjp-ui-component 2b) requires a roving tabindex for a toolbar-
 * shaped strip, and `Conversations` already ships its rail that way. So the BAR is one tab stop
 * and Arrow/Home/End move within it; the links inside an open panel stay in the natural tab order,
 * which is what the APG's "Tab moves among dropdown links" line asks for. Tab from the bar there-
 * fore lands in the open panel, and Tab out of the nav closes it.
 */

const OPEN_DELAY_MS = 0;
/*
 * Ant Design `subMenuCloseDelay` is 0.1s and that is the number here, in ms.
 *
 * This single timer IS the hover intent. The failure it prevents is catalogued in
 * `.claude/skills/godxjp-ui-interaction-feel` §4 ("Hover-intent - do not cancel state when the
 * mouse passes sideways"), where a Cascader closed its third column the instant the pointer left
 * the second and the depth-3 leaf became unreachable. The fix there and here is the same shape:
 * NOTHING closes on a trigger's own `pointerleave`. Closing is scheduled only when the pointer
 * leaves the WHOLE nav - bar and panel together, which are flush with no dead gap between them -
 * and any re-entry anywhere inside cancels it. A diagonal from the "Products" trigger down toward
 * a link at the far end of the panel therefore never leaves the nav at all, and even a path that
 * clips outside its box for a frame is inside the grace period.
 */
const CLOSE_DELAY_MS = 100;

type TopLevelElement = HTMLButtonElement | HTMLAnchorElement;

/** Index of the next enabled item, wrapping. `step` is +1 / -1 in READING order. */
function nextEnabled(items: readonly MegaMenuItemProp[], from: number, step: number): number {
  const count = items.length;
  for (let hop = 1; hop <= count; hop++) {
    const index = (from + step * hop + count * count) % count;
    if (!items[index]?.disabled) return index;
  }
  return from;
}

function firstEnabled(items: readonly MegaMenuItemProp[], from: "start" | "end"): number {
  const order = from === "start" ? items.map((_, i) => i) : items.map((_, i) => i).reverse();
  return order.find((index) => !items[index]?.disabled) ?? 0;
}

/** Every focusable link inside one panel, in DOM order. */
function panelLinks(panel: HTMLElement | null): HTMLAnchorElement[] {
  if (!panel) return [];
  return Array.from(panel.querySelectorAll<HTMLAnchorElement>("a[href]"));
}

function MegaMenuPanelLink({
  link,
  itemKey,
  current,
  linkComponent: LinkComponent,
  onActivate,
}: {
  link: MegaMenuLinkProp;
  itemKey: string;
  current: boolean;
  linkComponent?: MegaMenuLinkComponentProp;
  onActivate: (key: string) => void;
}) {
  const content = (
    <>
      {link.icon ? (
        // Decorative: the label is the accessible name, so the glyph must not be announced twice.
        <span data-slot="mega-menu-link-icon" className="ui-mega-menu-link-icon" aria-hidden="true">
          {link.icon}
        </span>
      ) : null}
      <span data-slot="mega-menu-link-text" className="ui-mega-menu-link-text">
        <span className="ui-mega-menu-link-label">{link.label}</span>
        {link.description ? (
          <span data-slot="mega-menu-link-description" className="ui-mega-menu-link-description">
            {link.description}
          </span>
        ) : null}
      </span>
    </>
  );
  // A disabled link is not a link: it keeps no href, so it leaves the tab order and the arrow
  // walk the same way the browser already handles, and `aria-disabled` says why out loud.
  const anchorProps: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href?: string } = {
    className: "ui-mega-menu-link ui-focus-ring",
    "data-slot": "mega-menu-link",
    href: link.disabled ? undefined : link.href,
    "aria-current": current ? "page" : undefined,
    "aria-disabled": link.disabled || undefined,
    "data-disabled": link.disabled ? "true" : undefined,
    onClick: (event: React.MouseEvent<HTMLAnchorElement>) => {
      if (link.disabled) {
        event.preventDefault();
        return;
      }
      onActivate(link.key);
    },
  } as React.AnchorHTMLAttributes<HTMLAnchorElement> & { href?: string };

  return (
    <li className="ui-mega-menu-link-row" data-item={itemKey}>
      {LinkComponent && link.href && !link.disabled ? (
        <LinkComponent {...anchorProps}>{content}</LinkComponent>
      ) : (
        // An href-less anchor is the DISABLED row: no destination, so no tab stop and no arrow
        // landing, while `aria-disabled` keeps it announced with its name and its reason.
        <a {...anchorProps}>{content}</a>
      )}
    </li>
  );
}

function MegaMenuGroupColumn({
  group,
  itemKey,
  value,
  linkComponent,
  onActivate,
  headingId,
}: {
  group: MegaMenuGroupProp;
  itemKey: string;
  value?: string;
  linkComponent?: MegaMenuLinkComponentProp;
  onActivate: (key: string) => void;
  headingId: string;
}) {
  return (
    <li className="ui-mega-menu-group" data-slot="mega-menu-group">
      {group.label ? (
        <p className="ui-mega-menu-group-label" id={headingId} data-slot="mega-menu-group-label">
          {group.icon ? (
            <span className="ui-mega-menu-group-icon" aria-hidden="true">
              {group.icon}
            </span>
          ) : null}
          {group.label}
        </p>
      ) : null}
      {group.description ? (
        <p className="ui-mega-menu-group-description" data-slot="mega-menu-group-description">
          {group.description}
        </p>
      ) : null}
      {/* The column's own list is LABELLED BY its heading, which is what makes a 40-link panel
       * navigable: a screen reader announces "list, 12 items" under a named region instead of one
       * undifferentiated run of links. */}
      <ul
        className="ui-mega-menu-group-links"
        aria-labelledby={group.label ? headingId : undefined}
      >
        {group.links.map((link) => (
          <MegaMenuPanelLink
            key={link.key}
            link={link}
            itemKey={itemKey}
            current={value === link.key}
            linkComponent={linkComponent}
            onActivate={onActivate}
          />
        ))}
      </ul>
    </li>
  );
}

export const MegaMenu = React.forwardRef<HTMLElement, MegaMenuProp>(function MegaMenu(
  {
    items,
    open,
    defaultOpen = null,
    onOpenChange,
    value,
    defaultValue,
    onValueChange,
    size = "md",
    triggerAction = "click",
    openDelay = OPEN_DELAY_MS,
    closeDelay = CLOSE_DELAY_MS,
    label,
    expandIcon,
    linkComponent,
    className,
    id,
    style,
    ...props
  },
  ref,
) {
  const { t } = useTranslation();
  const reactId = React.useId();
  const baseId = id ?? `mega-menu-${reactId}`;

  const [uncontrolledOpen, setUncontrolledOpen] = React.useState<string | null>(defaultOpen);
  const openKey = open !== undefined ? open : uncontrolledOpen;
  const [uncontrolledValue, setUncontrolledValue] = React.useState<string | undefined>(
    defaultValue,
  );
  const currentValue = value !== undefined ? value : uncontrolledValue;

  const [focusIndex, setFocusIndex] = React.useState(() => firstEnabled(items, "start"));

  const rootRef = React.useRef<HTMLElement | null>(null);
  const triggerRefs = React.useRef(new Map<string, TopLevelElement>());
  const panelRefs = React.useRef(new Map<string, HTMLDivElement>());
  const openTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const setRootRef = React.useCallback(
    (node: HTMLElement | null) => {
      rootRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLElement | null>).current = node;
    },
    [ref],
  );

  const clearTimers = React.useCallback(() => {
    if (openTimer.current) {
      clearTimeout(openTimer.current);
      openTimer.current = null;
    }
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  React.useEffect(() => clearTimers, [clearTimers]);

  /*
   * THE PANEL IS `position: fixed`, AND THIS EFFECT IS WHY.
   *
   * It began as `position: absolute` under a `position: relative` nav, which is the obvious
   * implementation and is WRONG in the two places a megamenu actually lives. Measured in Chrome on
   * the docs page for this component, panel open, one viewport:
   *
   *   host                          nearest clipping ancestor        result
   *   Topbar (the canonical host)   .ui-topbar-center overflow:clip  panel clipped to a 32px strip
   *   Card (CardContent)            .group/card overflow:hidden      331px of 348px clipped away
   *
   * Clipped means gone: not painted, and not hit-testable — `elementFromPoint` inside the panel's
   * own rect returned the card behind it. The hover diagonal died on its first step because the
   * pointer left the trigger into nothing. Note that neither defect is visible to a unit test or
   * to `isVisible()`, which does not account for ancestor clipping; it took a real browser and a
   * real measurement.
   *
   * `position: fixed` escapes ancestor `overflow` entirely (clipping only reaches a fixed box when
   * an ancestor establishes a containing block for it — `transform`/`filter`/`perspective`/
   * `contain`/`will-change` — and none of `Card`, `Topbar` or `PageContainer` sets one). The price
   * is that the geometry has to be measured rather than inherited, which is this effect.
   *
   * Deliberately NOT a portal and NOT the top layer: the panel stays a DOM DESCENDANT of the nav.
   * That containment is load-bearing twice over — the hover intent reads `pointerleave` on the nav
   * and a portalled panel would fire it on every trip into the panel, and the narrow layout is
   * just `position: static` on the same element, with no second code path to keep in step.
   *
   * The offsets go out as `translate`, not as insets, because `translate` is direction-agnostic
   * while `inset-inline-start` flips under RTL: the x term is measured from whichever viewport
   * edge `inset-inline-start: 0` resolves to, so it is correct in both writing directions and the
   * stylesheet stays free of physical `left`/`right` (`pnpm check:rtl`).
   */
  const [panelOffset, setPanelOffset] = React.useState<{ x: number; y: number; w: number } | null>(
    null,
  );

  React.useLayoutEffect(() => {
    if (openKey === null) {
      setPanelOffset(null);
      return;
    }
    const measure = () => {
      const node = rootRef.current;
      if (!node || typeof window === "undefined") return;
      const rect = node.getBoundingClientRect();
      const rtl = window.getComputedStyle(node).direction === "rtl";
      setPanelOffset({
        // Under RTL the panel's own `inset-inline-start: 0` resolves to the viewport's RIGHT
        // edge, so the offset is measured from there and is normally negative.
        x: rtl ? rect.right - window.innerWidth : rect.left,
        y: rect.bottom,
        w: rect.width,
      });
    };
    measure();
    // `scroll` in the CAPTURE phase so a scrollport BETWEEN the nav and the document still moves
    // the panel with its bar; `resize` for the viewport and for a reflow that changes the bar.
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, { capture: true, passive: true });
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, { capture: true });
    };
  }, [openKey]);

  const commitOpen = React.useCallback(
    (key: string | null) => {
      if (open === undefined) setUncontrolledOpen(key);
      onOpenChange?.(key);
    },
    [open, onOpenChange],
  );

  /** Close without moving focus — outside click, route change, Tab out. */
  const close = React.useCallback(() => {
    clearTimers();
    if (openKey !== null) commitOpen(null);
  }, [clearTimers, commitOpen, openKey]);

  /** Close and put focus back on the trigger — the APG `Escape` contract. */
  const closeAndRestore = React.useCallback(
    (key: string) => {
      clearTimers();
      commitOpen(null);
      triggerRefs.current.get(key)?.focus();
    },
    [clearTimers, commitOpen],
  );

  const activate = React.useCallback(
    (key: string) => {
      if (value === undefined) setUncontrolledValue(key);
      onValueChange?.(key);
      // Activating any link IS the route change for a same-page router, so the panel closes here
      // as well as in the effect below. Both paths are needed: a consumer driving `value` from a
      // router covers a route change that started somewhere else (a back button, a redirect).
      close();
    },
    [value, onValueChange, close],
  );

  // CLOSE ON ROUTE CHANGE. `currentValue` is the current route's key, so a change to it is a
  // navigation whatever caused it. Skipped on the first commit: nothing is open then anyway.
  const firstRoute = React.useRef(true);
  React.useEffect(() => {
    if (firstRoute.current) {
      firstRoute.current = false;
      return;
    }
    close();
    // `close` is stable per open state; depending on it here would re-run on every open toggle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentValue]);

  // OUTSIDE CLICK. Bound only while something is open, and on `pointerdown` rather than `click`
  // so the panel is gone before the browser resolves the press.
  React.useEffect(() => {
    if (openKey === null) return;
    const onPointerDown = (event: PointerEvent) => {
      const node = rootRef.current;
      if (node && event.target instanceof Node && !node.contains(event.target)) close();
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [openKey, close]);

  const isRtl = () => {
    const node = rootRef.current;
    if (!node || typeof window === "undefined") return false;
    return window.getComputedStyle(node).direction === "rtl";
  };

  const focusTrigger = (index: number) => {
    const item = items[index];
    if (!item) return;
    setFocusIndex(index);
    triggerRefs.current.get(item.key)?.focus();
  };

  /*
   * A keyboard open has to land focus INSIDE the panel, and the panel is only `hidden={!expanded}`
   * — so at the moment the handler runs, the links are still unfocusable. The request is therefore
   * recorded and executed in a layout effect, after React has flipped the attribute and before the
   * browser paints. Deliberately NOT `requestAnimationFrame`: a frame callback is one frame of
   * visible focus lag in a browser, and in a test environment it never runs at all, which is
   * exactly how "ArrowDown opens the panel" can pass a render assertion and still strand the user.
   */
  const [pendingFocus, setPendingFocus] = React.useState<{
    key: string;
    edge: "first" | "last";
  } | null>(null);

  React.useLayoutEffect(() => {
    if (!pendingFocus) return;
    if (openKey === pendingFocus.key) {
      const links = panelLinks(panelRefs.current.get(pendingFocus.key) ?? null);
      const target = pendingFocus.edge === "first" ? links[0] : links[links.length - 1];
      target?.focus();
    }
    // Cleared either way: a controlled owner may have refused the open, and a request that
    // survives would fire against the next panel that happens to open.
    setPendingFocus(null);
  }, [pendingFocus, openKey]);

  const openPanel = React.useCallback(
    (key: string, focus?: "first" | "last") => {
      clearTimers();
      commitOpen(key);
      if (focus) setPendingFocus({ key, edge: focus });
    },
    [clearTimers, commitOpen],
  );

  const onBarKeyDown = (event: React.KeyboardEvent, index: number, item: MegaMenuItemProp) => {
    const forward = isRtl() ? "ArrowLeft" : "ArrowRight";
    const backward = isRtl() ? "ArrowRight" : "ArrowLeft";
    const move = (to: number) => {
      event.preventDefault();
      focusTrigger(to);
      // Panel state FOLLOWS focus once something is open, which is how the APG example behaves
      // and what stops a panel belonging to an item the user has walked away from.
      if (openKey !== null) {
        const target = items[to];
        if (target?.panel) commitOpen(target.key);
        else commitOpen(null);
      }
    };

    switch (event.key) {
      case forward:
        move(nextEnabled(items, index, 1));
        return;
      case backward:
        move(nextEnabled(items, index, -1));
        return;
      case "Home":
        move(firstEnabled(items, "start"));
        return;
      case "End":
        move(firstEnabled(items, "end"));
        return;
      case "Escape":
        if (openKey !== null) {
          event.preventDefault();
          closeAndRestore(openKey);
        }
        return;
      case "ArrowDown":
        if (item.panel) {
          event.preventDefault();
          openPanel(item.key, "first");
        }
        return;
      case "ArrowUp":
        if (item.panel) {
          event.preventDefault();
          openPanel(item.key, "last");
        }
        return;
      case "Enter":
      case " ":
        // Only a DISCLOSURE BUTTON is handled here. A top-level link is a real `<a>` and Enter
        // must stay the browser's navigation.
        //
        // Enter/Space TOGGLE and leave focus on the button; only ArrowDown/ArrowUp step into the
        // panel. That split is the APG example's, and it is the one that keeps the bar usable:
        // if Enter jumped into the panel there would be no key left that opens a panel and lets
        // you keep walking the bar with Arrow.
        if (item.panel) {
          event.preventDefault();
          if (openKey === item.key) closeAndRestore(item.key);
          else openPanel(item.key);
        }
        return;
      default:
    }
  };

  const onPanelKeyDown = (event: React.KeyboardEvent, itemKey: string) => {
    const links = panelLinks(panelRefs.current.get(itemKey) ?? null);
    const at = links.indexOf(document.activeElement as HTMLAnchorElement);
    const focusLink = (to: number) => {
      event.preventDefault();
      links[Math.max(0, Math.min(links.length - 1, to))]?.focus();
    };
    switch (event.key) {
      case "Escape":
        event.preventDefault();
        closeAndRestore(itemKey);
        return;
      case "ArrowDown":
        focusLink(at + 1);
        return;
      case "ArrowUp":
        if (at <= 0) {
          event.preventDefault();
          closeAndRestore(itemKey);
          return;
        }
        focusLink(at - 1);
        return;
      case "Home":
        focusLink(0);
        return;
      case "End":
        focusLink(links.length - 1);
        return;
      default:
    }
  };

  // TAB OUT CLOSES. `blur` bubbles where `focusout` is the React name; either way the test is the
  // same — focus went somewhere the nav does not contain.
  const onBlurCapture = (event: React.FocusEvent) => {
    const node = rootRef.current;
    const next = event.relatedTarget;
    if (!node) return;
    if (next instanceof Node && node.contains(next)) return;
    close();
  };

  const hoverable = triggerAction === "hover";

  const onTriggerPointerEnter = (event: React.PointerEvent, item: MegaMenuItemProp) => {
    if (!hoverable || item.disabled || !item.panel) return;
    // A touch "hover" is the tap that is about to become a click; letting it open here would
    // open and immediately toggle shut.
    if (event.pointerType === "touch") return;
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    if (openKey !== null) {
      // Hand-off between panels is instant: the user is already reading a panel and the delay
      // would read as lag, not as intent.
      clearTimers();
      commitOpen(item.key);
      return;
    }
    if (openTimer.current) clearTimeout(openTimer.current);
    openTimer.current = setTimeout(() => {
      openTimer.current = null;
      commitOpen(item.key);
    }, openDelay);
  };

  // NOTHING closes here — see the CLOSE_DELAY_MS note. Only a PENDING open is cancelled, so a
  // pointer merely crossing the bar on its way elsewhere does not pop a panel behind it.
  const onTriggerPointerLeave = () => {
    if (openTimer.current) {
      clearTimeout(openTimer.current);
      openTimer.current = null;
    }
  };

  const onRootPointerEnter = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const onRootPointerLeave = (event: React.PointerEvent) => {
    if (!hoverable || event.pointerType === "touch") return;
    if (openKey === null) return;
    // Never steal focus on a hover close: the keyboard user may be somewhere else entirely.
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => {
      closeTimer.current = null;
      const node = rootRef.current;
      // Focus inside the nav outranks the pointer having left it.
      if (node && node.contains(document.activeElement)) return;
      commitOpen(null);
    }, closeDelay);
  };

  const chevron =
    expandIcon === false ? null : (
      <span
        data-slot="mega-menu-expand-icon"
        className="ui-mega-menu-expand-icon"
        aria-hidden="true"
      >
        {expandIcon ?? <ChevronDown />}
      </span>
    );

  return (
    <nav
      ref={setRootRef}
      id={baseId}
      data-slot="mega-menu"
      data-size={size}
      data-trigger-action={triggerAction}
      // Published so a consumer's CSS (and a gate) can see the bar's state without reading a
      // child; the stylesheet uses it to stop the fixed panel taking part in the narrow layout.
      data-open={openKey === null ? undefined : "true"}
      aria-label={label ?? t("navigation.megaMenu.label")}
      className={cn("ui-mega-menu", className)}
      style={
        panelOffset
          ? ({
              ...style,
              "--mega-menu-panel-translate-x": `${panelOffset.x}px`,
              "--mega-menu-panel-translate-y": `${panelOffset.y}px`,
              "--mega-menu-panel-measured-width": `${panelOffset.w}px`,
            } as React.CSSProperties)
          : style
      }
      onPointerEnter={onRootPointerEnter}
      onPointerLeave={onRootPointerLeave}
      onBlurCapture={onBlurCapture}
      {...props}
    >
      <ul data-slot="mega-menu-bar" className="ui-mega-menu-bar">
        {items.map((item, index) => {
          const panelId = `${baseId}-panel-${item.key}`;
          const expanded = openKey === item.key;
          const current = currentValue === item.key;
          const roving = index === focusIndex ? 0 : -1;
          const sharedTrigger = {
            "data-slot": "mega-menu-trigger",
            "data-open": expanded ? "true" : undefined,
            className: "ui-mega-menu-trigger ui-focus-ring",
            tabIndex: item.disabled ? -1 : roving,
            onKeyDown: (event: React.KeyboardEvent) => onBarKeyDown(event, index, item),
            onFocus: () => setFocusIndex(index),
            onPointerEnter: (event: React.PointerEvent) => onTriggerPointerEnter(event, item),
            onPointerLeave: onTriggerPointerLeave,
          };
          const labelNode = (
            <>
              {item.icon ? (
                <span className="ui-mega-menu-trigger-icon" aria-hidden="true">
                  {item.icon}
                </span>
              ) : null}
              <span className="ui-mega-menu-trigger-label">{item.label}</span>
            </>
          );

          return (
            <li key={item.key} className="ui-mega-menu-item" data-slot="mega-menu-item">
              {item.panel ? (
                // ui-audit-disable-next-line no-raw-button — a DISCLOSURE TRIGGER, not a Button.
                // The APG pattern names `<button aria-expanded aria-controls>` as the element, and
                // this one is a bar cell under a roving tabindex: wrapping it in `Button` would
                // layer Button's variant padding, its own focus treatment and its tabIndex on top
                // of the bar's. Sidebar's own nav row carries the identical exemption.
                <button
                  type="button"
                  ref={(node) => {
                    if (node) triggerRefs.current.set(item.key, node);
                    else triggerRefs.current.delete(item.key);
                  }}
                  aria-expanded={expanded}
                  aria-controls={panelId}
                  aria-current={current ? "page" : undefined}
                  disabled={item.disabled}
                  onClick={() => {
                    if (expanded) closeAndRestore(item.key);
                    else openPanel(item.key);
                  }}
                  {...sharedTrigger}
                >
                  {labelNode}
                  {chevron}
                </button>
              ) : (
                <a
                  ref={(node) => {
                    if (node) triggerRefs.current.set(item.key, node);
                    else triggerRefs.current.delete(item.key);
                  }}
                  href={item.disabled ? undefined : item.href}
                  aria-current={current ? "page" : undefined}
                  aria-disabled={item.disabled || undefined}
                  data-disabled={item.disabled ? "true" : undefined}
                  onClick={(event) => {
                    if (item.disabled) {
                      event.preventDefault();
                      return;
                    }
                    activate(item.key);
                  }}
                  {...sharedTrigger}
                >
                  {labelNode}
                </a>
              )}

              {item.panel ? (
                <div
                  ref={(node) => {
                    if (node) panelRefs.current.set(item.key, node);
                    else panelRefs.current.delete(item.key);
                  }}
                  id={panelId}
                  data-slot="mega-menu-panel"
                  className="ui-mega-menu-panel"
                  // `hidden` and not a CSS-only hide: a closed panel of 40 links must leave the
                  // tab order AND the accessibility tree, and `hidden` is the one thing that does
                  // both with no `aria-hidden` / `inert` bookkeeping to get wrong.
                  hidden={!expanded}
                  onKeyDown={(event) => onPanelKeyDown(event, item.key)}
                >
                  <div className="ui-mega-menu-panel-inner">
                    <ul className="ui-mega-menu-groups">
                      {item.panel.groups.map((group) => (
                        <MegaMenuGroupColumn
                          key={group.key}
                          group={group}
                          itemKey={item.key}
                          value={currentValue}
                          linkComponent={linkComponent}
                          onActivate={activate}
                          headingId={`${panelId}-${group.key}`}
                        />
                      ))}
                    </ul>
                    {item.panel.footer ? (
                      <div data-slot="mega-menu-panel-footer" className="ui-mega-menu-panel-footer">
                        {item.panel.footer}
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </nav>
  );
});
MegaMenu.displayName = "MegaMenu";
