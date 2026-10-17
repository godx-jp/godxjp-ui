import type { FocusEvent } from "react";

/** Native Tab scrolling can leave a partially visible control clipped (Chromium).
 * Reveal keyboard targets that fit inside a scroll viewport, without moving oversized
 * rows, changing layout, or scrolling on pointer focus. */
export function revealKeyboardFocus(event: FocusEvent<HTMLElement>): void {
  const viewport = event.currentTarget;
  const target = event.target;
  if (
    !(target instanceof HTMLElement) ||
    target === viewport ||
    !viewport.contains(target) ||
    !target.matches(":focus-visible")
  )
    return;
  const carrier =
    target.closest<HTMLElement>(".ui-tag-input,.ui-control-composite-field") ?? target;
  const box = carrier.getBoundingClientRect();
  const frame = viewport.getBoundingClientRect();
  const left = frame.left + viewport.clientLeft;
  const top = frame.top + viewport.clientTop;
  const style = getComputedStyle(viewport);
  const outsideX =
    /auto|scroll/.test(style.overflowX) &&
    box.width <= viewport.clientWidth &&
    (box.left < left || box.right > left + viewport.clientWidth);
  const outsideY =
    /auto|scroll/.test(style.overflowY) &&
    box.height <= viewport.clientHeight &&
    (box.top < top || box.bottom > top + viewport.clientHeight);
  if (outsideX || outsideY)
    carrier.scrollIntoView?.({ block: "nearest", inline: "nearest", behavior: "instant" });
}
