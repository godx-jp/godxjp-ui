import * as React from "react";

/**
 * `inert` the background that Radix marks `aria-hidden` while an overlay is open.
 *
 * WHY THIS EXISTS (godxjp-ui#352). Every modal Radix overlay hides the rest of the page from
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
 * (DropdownMenu, ContextMenu) do not, so those are the overlays that actually fail. Measured on
 * real Chromium at /frame: `data-entry-select` and `navigation-dropdown-menu` each report
 * `aria-hidden-focus` on the background the moment the overlay opens.
 *
 * THE FIX is the platform primitive for "this subtree is not interactive": `inert`. It makes the
 * background genuinely unfocusable instead of merely un-announced, which is what Radix's focus
 * trap was already emulating — so nothing about the user-visible behaviour changes, and no
 * consumer has to do anything. It is applied by MIRRORING Radix's own marker rather than by
 * React lifecycle: a MutationObserver on `data-aria-hidden` runs as a microtask, which is after
 * `hideOthers` has stamped the tree and before FocusScope's `setTimeout(…, 0)` restores focus to
 * the trigger — an ordering that holds no matter which overlay opened, or how deeply they nest.
 *
 * ONLY elements that actually hold something tabbable are inerted. That is precisely axe's
 * condition, and it is also what keeps behaviour intact: Radix's focus guards (0×0, tabbable,
 * no children) and a Dialog/Sheet overlay (the click-outside-to-dismiss surface, no children)
 * both hold nothing tabbable, so neither is touched.
 */

/** Tabbable candidates, mirroring what axe's `focusable-not-tabbable` counts. */
const TABBABLE =
  'a[href], area[href], button, input, select, textarea, iframe, object, embed, details, audio[controls], video[controls], [contenteditable="true"], [tabindex]:not([tabindex^="-"])';

/** Elements THIS module put `inert` on — never anything a consumer inerted itself. */
const owned = new Set<Element>();
let observer: MutationObserver | null = null;
let mounted = 0;

function sync() {
  for (const el of document.querySelectorAll("[data-aria-hidden]")) {
    if (owned.has(el) || el.hasAttribute("inert")) continue;
    if (el.querySelector(TABBABLE)) {
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
 * Call from an overlay's content wrapper (the always-mounted portal wrapper, not the portalled
 * content itself). Idempotent and refcounted: one observer serves every overlay on the page.
 */
export function useInertHiddenBackground(): void {
  React.useEffect(() => {
    mounted += 1;
    if (!observer) {
      observer = new MutationObserver(sync);
      observer.observe(document.body, {
        subtree: true,
        attributes: true,
        attributeFilter: ["data-aria-hidden"],
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
}
