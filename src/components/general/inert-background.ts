import * as React from "react";

/**
 * `inert` the background that Radix marks `aria-hidden` while an overlay is open.
 *
 * WHY THIS EXISTS. Every modal Radix overlay hides the rest of the page from
 * assistive tech through the `aria-hidden` package (`hideOthers`), which stamps
 * `aria-hidden="true"` + `data-aria-hidden="true"` on every sibling on the path from the
 * portalled content up to `<body>` — in a consumer app that is the whole `.app-root`. It does
 * NOT stop those elements being tabbable: Radix keeps keyboard focus inside the overlay with a
 * JS focus trap instead. axe cannot see a JS focus trap, so `aria-hidden-focus`
 * ("aria-hidden element must not be focusable") fires on `.app-root`.
 *
 * axe does have an escape hatch for exactly this shape — `focusable-modal-open` passes when a
 * modal is open — but its modal probe only recognises `dialog` / `[role=dialog]` /
 * `[aria-modal=true]`, or a positioned element covering ≥75% of the viewport. A Dialog or Sheet
 * qualifies (`role="dialog"` + a full-bleed overlay); `role="listbox"` (Select) and `role="menu"`
 * (DropdownMenu) do not, so those are the overlays that actually fail. Measured on
 * real Chromium at /frame: `data-entry-select` and `navigation-dropdown-menu` each report
 * `aria-hidden-focus` on the background the moment the overlay opens.
 *
 * THE FIX is the platform primitive for "this subtree is not interactive": `inert`. It makes the
 * background genuinely unfocusable instead of merely un-announced, which is what Radix's focus
 * trap was already emulating — so nothing about the user-visible behaviour changes, and no
 * consumer has to do anything. It is applied by MIRRORING Radix's own markers rather than by
 * React lifecycle: a MutationObserver runs as a microtask, which is after `hideOthers` has
 * stamped the tree and before FocusScope's `setTimeout(…, 0)` restores focus to the trigger — an
 * ordering that holds no matter which overlay opened, or how deeply they nest.
 *
 * ONLY elements that actually hold something tabbable are inerted. That is precisely axe's
 * condition, and it is also what keeps behaviour intact: Radix's focus guards (0×0, tabbable,
 * no children) and a Dialog/Sheet overlay (the click-outside-to-dismiss surface, no children)
 * both hold nothing tabbable, so neither is touched.
 *
 * APPLYING IS NOT THE HARD HALF — RELEASING IS (gh#385). `data-aria-hidden` is removed by
 * `hideOthers`' undo, which Radix runs when the overlay content UNMOUNTS. Presence keeps that
 * content mounted for the whole exit animation, so a release keyed on `data-aria-hidden` alone
 * arrives one animation late. A menu item whose `onSelect` mounts an inline form does so in the
 * click handler — synchronously, and inside the still-`inert` background. The form is on screen,
 * looks ordinary, and silently refuses focus and input until the animation ends; text typed into
 * it is discarded. In a consuming app that read as a data bug (Save submitted the UNCHANGED body
 * while the server still stamped `edited_at`), not as a focus bug.
 *
 * So release is keyed on CLOSE INTENT instead. Radix flips `data-state` on the content to
 * `"closed"` in the same synchronous turn as the item's `onSelect`, long before Presence unmounts
 * it. Each overlay content registers itself here through the returned ref, and the background is
 * held `inert` only while at least one registered content is still open. That covers every close
 * path — item select, Escape, outside click — without this module having to guess at any of them,
 * because Radix has already decided by the time the attribute moves.
 */

/** Tabbable candidates, mirroring what axe's `focusable-not-tabbable` counts. */
const TABBABLE =
  'a[href], area[href], button, input, select, textarea, iframe, object, embed, details, audio[controls], video[controls], [contenteditable="true"], [tabindex]:not([tabindex^="-"])';

/** Elements THIS module put `inert` on — never anything a consumer inerted itself. */
const owned = new Set<Element>();
/** Overlay content elements currently registered by `useInertHiddenBackground`. */
const anchors = new Set<HTMLElement>();
let observer: MutationObserver | null = null;
let mounted = 0;

/**
 * Is any registered overlay still OPEN?
 *
 * An anchor with no `data-state` yet counts as open: Radix writes the attribute on the same
 * commit that mounts the content, so the only way to see it missing is to look before Radix has
 * written it — and at that moment the overlay is opening, not closing. Reading absence as
 * "closed" would drop `inert` for the one frame the overlay needs it most.
 */
function anyOverlayOpen(): boolean {
  for (const anchor of anchors) {
    if (anchor.isConnected && anchor.getAttribute("data-state") !== "closed") return true;
  }
  return false;
}

function sync() {
  // Close intent beats the attribute: `data-aria-hidden` is still on the background all through
  // the exit animation, and anything the closing overlay just mounted there is live NOW.
  if (!anyOverlayOpen()) {
    release();
    return;
  }
  for (const el of document.querySelectorAll("[data-aria-hidden]")) {
    if (owned.has(el) || el.hasAttribute("inert")) continue;
    // Chốt tiêu điểm 0x0 của Radix nhận được tiêu điểm nhưng là cơ chế của chính lớp phủ; inert
    // nó là phá bẫy tiêu điểm.
    if (el.matches("[data-radix-focus-guard]")) continue;
    // `matches` TRƯỚC `querySelector`: gói aria-hidden chừa lại vùng aria-live, nên khi trang có
    // live region nó đi sâu xuống và đánh dấu từng phần tử anh em, trong đó có thể là chính một
    // <button>. Chỉ hỏi hậu duệ thì đúng phần tử nhận được tiêu điểm lại bị bỏ sót.
    if (el.matches(TABBABLE) || el.querySelector(TABBABLE)) {
      el.setAttribute("inert", "");
      owned.add(el);
    }
  }
  for (const el of [...owned]) {
    if (el.isConnected && el.hasAttribute("data-aria-hidden")) continue;
    el.removeAttribute("inert");
    owned.delete(el);
  }
}

function release() {
  for (const el of owned) el.removeAttribute("inert");
  owned.clear();
}

/**
 * Call from an overlay's content wrapper, and spread the returned ref onto the Radix content
 * element itself — that element is what carries `data-state`, and registering it is what lets the
 * background be released on close intent rather than on unmount (gh#385).
 *
 * The caller's own forwarded ref is composed in, so a content component still hands its node to
 * the consumer. Idempotent and refcounted: one observer serves every overlay on the page.
 */
export function useInertHiddenBackground<T extends HTMLElement>(
  forwarded?: React.Ref<T>,
): (node: T | null) => void {
  React.useEffect(() => {
    mounted += 1;
    if (!observer) {
      observer = new MutationObserver(sync);
      observer.observe(document.body, {
        subtree: true,
        attributes: true,
        // `data-state` is the close-intent signal; `data-aria-hidden` is the what-to-hide signal.
        attributeFilter: ["data-aria-hidden", "data-state"],
      });
    }
    sync();
    return () => {
      mounted -= 1;
      if (mounted > 0) return;
      observer?.disconnect();
      observer = null;
      release();
    };
  }, []);

  const registered = React.useRef<T | null>(null);

  /**
   * The caller's ref is read through a box so the returned callback's IDENTITY never changes.
   *
   * A consumer that passes an inline `ref={(n) => …}` hands a new function every render. If that
   * identity leaked into the dependency list, React would detach and reattach this ref on every
   * render of an OPEN overlay — and detaching unregisters the anchor, which reads as "nothing is
   * open" and drops `inert` off the background for that beat. Stable identity means React attaches
   * once per mount, which is the only time the anchor actually changes.
   */
  const forwardedRef = React.useRef(forwarded);
  forwardedRef.current = forwarded;

  return React.useCallback((node: T | null) => {
    if (registered.current) anchors.delete(registered.current);
    registered.current = node;
    if (node) anchors.add(node);
    // An anchor leaving is a close that has already completed; one arriving is an overlay that
    // has just opened. Either way the answer to "is anything still open" just changed.
    sync();

    const target = forwardedRef.current;
    if (typeof target === "function") target(node);
    else if (target) (target as React.RefObject<T | null>).current = node;
  }, []);
}
