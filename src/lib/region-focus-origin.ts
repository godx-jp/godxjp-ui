import type { FocusEvent, PointerEvent } from "react";

/**
 * Records HOW a focusable scroll region received focus, so its region ring paints only for a
 * keyboard arrival (gh#1527).
 *
 * `.app-main` carries `tabIndex={0}` (axe `scrollable-region-focusable`), so a click on empty
 * content space focuses it. Chromium does not match `:focus-visible` for that click — but the
 * next key press, ANY key (an OS screenshot shortcut included), flips the already-focused element
 * to `:focus-visible`, and the whole content region grew a 2–3px near-black inset frame. Users
 * read it as a broken border on every screen.
 *
 * The decision is taken once, at the moment focus ARRIVES, from the browser's own heuristic:
 * `:focus-visible` at that instant is true for Tab, Shift+Tab and a keyboard-activated skip link,
 * false for a pointer. A later key press cannot change it; leaving the region clears it. A click
 * on the region while it already holds focus re-marks it as pointer focus.
 */
export const REGION_FOCUS_ORIGIN = "data-focus-origin";

function arrivedByKeyboard(el: HTMLElement): boolean {
  try {
    return el.matches(":focus-visible");
  } catch {
    // An engine that cannot answer keeps the ring: a missing indicator is the worse failure.
    return true;
  }
}

export const regionFocusOriginHandlers = {
  onFocus(event: FocusEvent<HTMLElement>) {
    const el = event.currentTarget;
    if (event.target !== el) return;
    el.setAttribute(REGION_FOCUS_ORIGIN, arrivedByKeyboard(el) ? "keyboard" : "pointer");
  },
  onBlur(event: FocusEvent<HTMLElement>) {
    const el = event.currentTarget;
    if (event.target !== el) return;
    el.removeAttribute(REGION_FOCUS_ORIGIN);
  },
  onPointerDown(event: PointerEvent<HTMLElement>) {
    const el = event.currentTarget;
    if (el.ownerDocument.activeElement === el) el.setAttribute(REGION_FOCUS_ORIGIN, "pointer");
  },
};
